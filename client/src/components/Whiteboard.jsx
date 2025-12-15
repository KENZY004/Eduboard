import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // Removed in favor of crypto.randomUUID()
import io from 'socket.io-client';
import axios from 'axios';
import {
    FaEraser, FaPen, FaTrash, FaSignOutAlt, FaShareAlt, FaCopy,
    FaSlash, FaUndo, FaRedo, FaSave, FaMoon, FaSun, FaDownload, FaFilePdf, FaFont,
    FaHighlighter, FaImage, FaStickyNote, FaMousePointer, FaDrawPolygon
} from 'react-icons/fa';
import {
    BsSquare, BsCircle, BsTriangle, BsPentagon, BsHexagon, BsOctagon, BsStar,
    BsZoomIn, BsZoomOut
} from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const imageCache = useRef({}); // Cache for loaded images

    // State
    const [elements, setElements] = useState([]); // History of all drawn elements
    const [history, setHistory] = useState([]); // Array<Action> {type, ...}
    const [redoStack, setRedoStack] = useState([]);
    const [undoSnapshot, setUndoSnapshot] = useState(null); // Snapshot for diffing updates
    const [cursors, setCursors] = useState({}); // { socketId: { x, y, color, username } }

    // Debug: Expose elements -> Removed
    // useEffect(() => { window.elements = elements; }, [elements]);

    const user = JSON.parse(localStorage.getItem('user'));

    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState('pen'); // pen, eraser, rect, circle, line
    const [darkMode, setDarkMode] = useState(true);
    const [showCopied, setShowCopied] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [showShapeMenu, setShowShapeMenu] = useState(false);
    const [scale, setScale] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    const [currentElement, setCurrentElement] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null); // { index, offsetX, offsetY, initialWidth, initialHeight }
    const [editingElement, setEditingElement] = useState(null); // { index, text, x, y, width, height }
    const [action, setAction] = useState('none'); // 'drawing', 'moving', 'resizing'
    const textAreaRef = useRef(null);
    const draggedElementRef = useRef(null); // Fix for stale state in history
    const currentStrokeRef = useRef(null); // Optimization: Mutable ref for drawing to bypass React Render Cycle

    const navigate = useNavigate();
    const { roomId } = useParams();

    // Socket Init
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_BASE_URL);
        setSocket(newSocket);
        newSocket.emit('join-room', roomId);

        return () => newSocket.close();
    }, [roomId]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('draw-element', (element) => {
            setElements((prev) => {
                const index = prev.findIndex((el) => el.id === element.id);
                if (index !== -1) {
                    // Update existing element
                    const newElements = [...prev];
                    newElements[index] = element;
                    return newElements;
                } else {
                    // Add new element
                    return [...prev, element];
                }
            });
        });

        socket.on('load-board', (loadedElements) => {
            // Deduplicate loaded elements (Fix for "ghost" images from previous bug)
            const uniqueMap = new Map();
            loadedElements.forEach(el => {
                uniqueMap.set(el.id, el); // Latest wins
            });
            setElements(Array.from(uniqueMap.values()));
        });

        socket.on('clear-canvas', () => {
            setElements([]);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        });

        socket.on('cursor-move', (data) => {
            setCursors(prev => ({ ...prev, [data.userId]: data }));
        });

        return () => {
            socket.off('draw-element');
            socket.off('load-board');
            socket.off('clear-canvas');
            socket.off('clear-canvas');
            socket.off('cursor-move');
        };
    }, [socket]);

    // 1. Define drawElement first so it's available
    const drawElement = (ctx, element) => {
        const { type, color, size, points, x, y, width, height, endX, endY, text, dataURL } = element;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (type === 'pen' || type === 'eraser' || type === 'highlighter') {
            if (type === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = color;
            }
            ctx.lineWidth = size;
            if (type === 'highlighter') {
                ctx.globalAlpha = 0.4;
                ctx.lineWidth = size * 3;
            }
            ctx.beginPath();
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                if (points.length < 3) {
                    // Not enough points for curves, straight lines
                    points.forEach(p => ctx.lineTo(p.x, p.y));
                } else {
                    // Quadratic Bezier Smoothing
                    let i;
                    for (i = 1; i < points.length - 2; i++) {
                        const xc = (points[i].x + points[i + 1].x) / 2;
                        const yc = (points[i].y + points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                    }
                    // Curve through the last two points
                    ctx.quadraticCurveTo(
                        points[i].x,
                        points[i].y,
                        points[i + 1].x,
                        points[i + 1].y
                    );

                    // ACTIVE TIP IMPLEMENTATION
                    // If this is the currently active stroke, draw a straight line 
                    // from the last rendered geometric point to the actual latest point.
                    // This creates an "instant" feel while curves settle behind it.
                    if (currentStrokeRef.current && element.id === currentStrokeRef.current.id) {
                        const lastP = points[points.length - 1];
                        ctx.lineTo(lastP.x, lastP.y);
                    }
                }
                ctx.stroke();
                ctx.globalCompositeOperation = 'source-over';
            }
        } else if (type === 'rect') {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.stroke();
        } else if (type === 'sticky') {
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 10;
            ctx.fillRect(x, y, width, height);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.font = '16px sans-serif';
            wrapText(ctx, text || "", x + 10, y + 30, width - 20, 20);
        } else if (type === 'circle') {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            const r = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (type === 'line') {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        } else if (type === 'text') {
            ctx.fillStyle = color;
            ctx.font = `${size * 5}px sans-serif`;
            ctx.textBaseline = 'top';
            // Use wrapText for text rendering
            wrapText(ctx, text || "", x, y, width || 200, size * 5 * 1.2); // 1.2 line height
        } else if (['triangle', 'pentagon', 'hexagon', 'octagon'].includes(type)) {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            const sides = type === 'triangle' ? 3 : type === 'pentagon' ? 5 : type === 'hexagon' ? 6 : 8;

            ctx.beginPath();
            const cx = x + width / 2;
            const cy = y + height / 2;
            const r = Math.min(width, height) / 2;

            // Standard vertex-up logic (start at -PI/2)
            const startAngle = -Math.PI / 2;

            for (let i = 0; i < sides; i++) {
                const angle = startAngle + (i * 2 * Math.PI / sides);
                const px = cx + r * Math.cos(angle);
                const py = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        } else if (type === 'star') {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            const cx = x + width / 2;
            const cy = y + height / 2;
            const outerRadius = Math.min(width, height) / 2;
            const innerRadius = outerRadius / 2;
            const spikes = 5;
            let rot = Math.PI / 2 * 3;
            let x_val = cx;
            let y_val = cy;
            const step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x_val = cx + Math.cos(rot) * outerRadius;
                y_val = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x_val, y_val);
                rot += step;

                x_val = cx + Math.cos(rot) * innerRadius;
                y_val = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x_val, y_val);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.stroke();
        } else if (type === 'image') {
            if (imageCache.current[element.id]) {
                const img = imageCache.current[element.id];
                ctx.drawImage(img, x, y, width, height);
            } else {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = dataURL;
                img.onload = () => {
                    imageCache.current[element.id] = img;
                    renderCanvas();
                };
                img.onerror = (e) => {
                    console.error("Failed to load image for drawing", element.id, e);
                };
            }
        }
        ctx.restore();
    };

    // 2. Define renderCanvas (depends on drawElement)
    // 2. Define renderCanvas (depends on drawElement)
    const renderCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Dynamic Grid
        drawGrid(ctx, canvas.width, canvas.height, scale, panOffset);

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(panOffset.x, panOffset.y);

        elements.forEach((element, index) => {
            // Skip rendering if currently being edited (prevents double text defect)
            if (editingElement && editingElement.index === index) {
                if (element.type === 'text') return;
            }
            drawElement(ctx, element);

            if (selectedElement && selectedElement.index === index) {
                ctx.save();
                ctx.strokeStyle = '#3b82f6'; // Blue
                ctx.lineWidth = 2 / scale; // Keep border thin
                // Draw border
                const { x, y, width, height } = element;
                // Handle different shapes? For now rect/image/sticky
                if (['rect', 'image', 'sticky', 'text', 'triangle', 'pentagon', 'hexagon', 'octagon', 'star'].includes(element.type)) {
                    ctx.strokeRect(x, y, width, height);
                    // Draw Handle
                    ctx.fillStyle = '#3b82f6';
                    // Scale handle size inversely so it stays same visual size
                    const handleSize = 12 / scale;
                    ctx.fillRect(x + width - (handleSize / 2), y + height - (handleSize / 2), handleSize, handleSize);
                }
                ctx.restore();
            }
        });

        // Draw preview for current element being drawn (Stateless/Ref optimized)
        // If we are drawing a pen/stroke, we use the Ref to avoid lagging.
        // If we are drawing a shape using setCurrentElement (still using state for shapes for now), we use that.

        if (currentStrokeRef.current) {
            drawElement(ctx, currentStrokeRef.current);
        } else if (currentElement) {
            drawElement(ctx, currentElement);
        }

        ctx.restore();
    };

    // 3. Effects
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                renderCanvas();
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        renderCanvas();
    }, [elements, darkMode, editingElement, scale, panOffset, currentElement]);



    const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
        const paragraphs = text.split('\n');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            let words = paragraph.split(' ');
            let line = '';

            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, x, currentY);
                    line = words[n] + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, currentY);
            currentY += lineHeight;
        });
        return currentY; // Return bottom Y for height check
    }

    // Drawing Logic

    const isWithinElement = (x, y, element) => {
        const { type, x: ex, y: ey, width, height } = element;
        if (type === 'rect' || type === 'image' || type === 'text') { // Text now has width/height
            // For text, y is often the baseline or top depending on how we draw.
            // Let's assume (x,y) is top-left for easy hit detection, but fillText uses baseline.
            // Adjustment: We'll store x,y as top-left for text too to match other shapes.
            // Ensure minimum hit area for text and add buffer
            // HANDLE UNDEFINED WIDTH/HEIGHT safely
            const w = Math.max(width || 0, 20);
            const h = Math.max(height || 0, 20);
            return x >= ex - 10 && x <= ex + w + 10 && y >= ey - 10 && y <= ey + h + 10;
        }
        if (type === 'sticky') {
            const w = width || 200;
            const h = height || 200;
            return x >= ex && x <= ex + w && y >= ey && y <= ey + h;
        }
        return false;
    };

    // Helper: Cursor style
    useEffect(() => {
        if (action === 'resizing') {
            document.body.style.cursor = 'nwse-resize';
        } else if (action === 'moving') {
            document.body.style.cursor = 'move';
        } else {
            document.body.style.cursor = 'default';
        }
    }, [action]);

    const updateElement = (index, newProps) => {
        const updated = [...elements];
        updated[index] = { ...updated[index], ...newProps };
        setElements(updated);
        // Note: For real-time sync of resize/move, we need unique IDs. 
        // Current index-based approach is fragile for collaboration but works for local MVP.
        if (socket) socket.emit('draw-element', { roomId, ...updated[index] });
    };

    const saveNote = (e) => {
        if (!editingElement) return;
        const index = editingElement.index;
        const newText = e.target.value;

        // Measure text for bounds
        // Measure text using wrap calculation
        const ctx = canvasRef.current.getContext('2d');
        const size = elements[index]?.size || 5;
        const fontSize = size * 5;
        ctx.font = `${fontSize}px sans-serif`;

        // Preserve width if it was manually resized, otherwise assume a default or grow?
        // User wants resizing to MEAN width change. So we keep `editingElement.width`.
        // If it's a new text, it has default width.
        const currentWidth = editingElement.width || 200;

        // Use a dummy wrap call to measure height
        const lineHeight = fontSize * 1.2;

        let calculatedWidth = currentWidth;
        if (editingElement.type === 'text') {
            // Only auto-calculate if NOT fixed width
            if (!elements[index].isFixedWidth) {
                const lines = newText.split('\n');
                let maxLineW = 0;
                lines.forEach(line => {
                    const w = ctx.measureText(line).width;
                    if (w > maxLineW) maxLineW = w;
                });
                calculatedWidth = Math.max(currentWidth, maxLineW + 20);
            }
        }

        const measuredHeight = wrapText(ctx, newText, 0, 0, calculatedWidth, lineHeight); // Returns bottom Y

        // Enforce minimum height based on type
        const minHeight = editingElement.type === 'sticky' ? 200 : fontSize;

        const oldProps = {
            text: editingElement.text,
            width: elements[index].width,
            height: elements[index].height
        };

        const newProps = {
            text: newText,
            width: Math.max(calculatedWidth, 20), // Ensure min width
            height: Math.max(measuredHeight, minHeight)
        };

        updateElement(index, newProps);

        setHistory(prev => [...prev, {
            type: 'UPDATE',
            id: elements[index].id,
            index: index,
            oldProps,
            newProps
        }]);
        setRedoStack([]);
        setEditingElement(null);

        // Auto-switch to select mode for immediate resizing
        setTool('select');
        setSelectedElement({
            index: index,
            offsetX: 0,
            offsetY: 0
        });
    };

    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / scale - panOffset.x,
            y: (e.clientY - rect.top) / scale - panOffset.y
        };
    };

    // Pointer Events for High-Fidelity Input
    const handlePointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        startDrawing(e);
    };

    const handlePointerUp = (e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        stopDrawing(e);
    };

    const handlePointerMove = (e) => {
        if (!isDrawing) return;

        // High-Fidelity Coalesced Events
        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        let hasUpdates = false;

        // BATCH UPDATE (Math Only)
        events.forEach(event => {
            const { x, y } = getMousePos(event);

            // Replicates 'draw' logic but without the render side effects
            if (action === 'drawing' && currentStrokeRef.current) {
                // Pen Tool
                const newPoint = { x, y };
                currentStrokeRef.current.points.push(newPoint);
                hasUpdates = true;
            } else if (action === 'panning') {
                // Panning (usually not coalesced heavily, but handle it)
                const { clientX, clientY } = event;
                const { startX, startY, initialPan } = draggedElementRef.current;
                const dx = (clientX - startX) / scale;
                const dy = (clientY - startY) / scale;
                setPanOffset({ x: initialPan.x + dx, y: initialPan.y + dy });
                hasUpdates = true;

                // Panning triggers re-render via state update (setPanOffset), 
                // so we might not need explicit renderCanvas here if state creates it?
                // Actually setPanOffset is async. 
                // For smooth 120hz panning, we might want ref-based panning too, but let's stick to pen for now.
            } else if (action === 'drawing' && currentElement) {
                // Shape Tool (State based)
                setCurrentElement(prev => ({
                    ...prev,
                    width: x - prev.x,
                    height: y - prev.y,
                    endX: x,
                    endY: y
                }));
                // HasUpdates not needed as state change triggers render
            } else if (action === 'moving' || action === 'resizing') {
                // Call standard draw for these as they rely on complex logic
                draw(event);
            }
        });

        // SINGLE RENDER PER FRAME
        if (hasUpdates && action === 'drawing' && currentStrokeRef.current) {
            renderCanvas();
        }
    };

    const startDrawing = (e) => {
        // Spacebar Panning Logic
        if (isSpacePressed) {
            const { clientX, clientY } = e;
            // We need to store original click for panning delta
            // Store simple X/Y on ref to avoid re-renders if possible, but action state is fine
            setAction('panning');
            // We reuse draggedElementRef to store initial click pos (screen coords)
            draggedElementRef.current = { startX: clientX, startY: clientY, initialPan: { ...panOffset } };
            document.body.style.cursor = 'grabbing';
            return;
        }

        const { x: offsetX, y: offsetY } = getMousePos(e);

        if (tool === 'select') {
            // ... (select logic)
            // 1. Check Resize Handle (Bottom-Right of selected)
            if (selectedElement !== null) {
                const el = elements[selectedElement.index];
                const w = el.width || (el.type === 'text' ? 50 : 0); // fallback for text
                const h = el.height || (el.type === 'text' ? 20 : 0);
                // allow 10px hit area
                if (offsetX >= el.x + w - 10 && offsetX <= el.x + w + 10 &&
                    offsetY >= el.y + h - 10 && offsetY <= el.y + h + 10) {
                    setAction('resizing');
                    setUndoSnapshot({ ...elements[selectedElement.index] });
                    return;
                }
            }

            // 2. Check Element Hit (Move/Select)
            let hitIndex = -1;
            for (let i = elements.length - 1; i >= 0; i--) {
                if (isWithinElement(offsetX, offsetY, elements[i])) {
                    hitIndex = i;
                    break;
                }
            }

            // If clicking outside while editing, save and close
            if (editingElement) {
                setEditingElement(null); // Triggers blur which triggers saveNote? No, manual null set need explicit save or just rely on blur?
                // Blur happens before this click usually.
            }

            if (hitIndex !== -1) {
                setTool('select'); // Force switch to select
                const el = elements[hitIndex];
                setSelectedElement({ index: hitIndex, offsetX: offsetX - el.x, offsetY: offsetY - el.y });
                setUndoSnapshot({ ...el }); // Capture state for undo
                setAction('moving');

                // Sync Toolbar
                if (el.color) setColor(el.color);
                if (el.size) setBrushSize(el.size);

                return;
            }

            if (tool === 'select') {
                setSelectedElement(null);
                setAction('none');
            }
            return;
        }

        if (tool === 'text' || tool === 'sticky') {
            // Check for existing element hit first (Smart Tool)
            let hitIndex = -1;
            for (let i = elements.length - 1; i >= 0; i--) {
                if (isWithinElement(offsetX, offsetY, elements[i])) {
                    hitIndex = i;
                    break;
                }
            }

            if (hitIndex !== -1) {
                // If we hit something, interact with it instead of creating new text
                setTool('select');
                setSelectedElement({ index: hitIndex, offsetX: offsetX - elements[hitIndex].x, offsetY: offsetY - elements[hitIndex].y });
                setUndoSnapshot({ ...elements[hitIndex] }); // Capture state for undo
                setAction('moving');
                return;
            }

            // Create new element (Text or Sticky)
            const id = crypto.randomUUID();
            const newElement = tool === 'text' ? {
                id,
                type: 'text',
                x: offsetX, y: offsetY,
                text: '',
                color: color,
                size: brushSize,
                width: 100,
                height: brushSize * 5,
                isFixedWidth: false // Default to Auto-Width
            } : {
                id,
                type: 'sticky',
                x: offsetX - 100, // Center on click
                y: offsetY - 100,
                width: 200,
                height: 200,
                text: "Double click to edit..."
            };

            setElements(prev => [...prev, newElement]);
            setHistory(prev => [...prev, { type: 'ADD', element: newElement }]); // FIX: Normalize history format

            // For text, enter edit mode immediately. For sticky, just place it?
            // User habits: Text -> Type immediately. Sticky -> Click to place, double click to edit.
            // But let's follow text pattern? 
            // Actually, for sticky, let's just place it. If user wants to edit they double click.
            // But if we want to mimic text tool "smartness", we just place it and switch to select.

            if (tool === 'text') {
                setEditingElement({
                    index: elements.length,
                    type: 'text',
                    text: '',
                    x: offsetX,
                    y: offsetY,
                    width: 100,
                    height: brushSize * 5
                });
            } else {
                // For sticky, switch to select immediately
                setTool('select');
            }
            return;
        }

        setIsDrawing(true);
        setAction('drawing');
        // ... new drawing logic ...
        setIsDrawing(true);
        setAction('drawing');

        if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
            // Optimization: Use Ref instead of State for strokes
            currentStrokeRef.current = {
                id: crypto.randomUUID(),
                type: tool,
                color,
                size: brushSize / scale,
                points: [{ x: offsetX, y: offsetY }]
            };
            // Do NOT setCurrentElement here to avoid render. 
            // We consciously trigger renderCanvas in loop manually or let requestAnimationFrame handle it?
            // For now, we'll trigger renderCanvas manually in 'draw'
        } else {
            setCurrentElement({
                id: crypto.randomUUID(),
                type: tool,
                color,
                size: brushSize,
                x: offsetX,
                y: offsetY,
                width: 0,
                height: 0
            });
        }
    };

    const draw = (e) => {
        const { x: offsetX, y: offsetY } = getMousePos(e);

        if (socket) {
            // ... cursor logic
            socket.emit('cursor-move', {
                roomId,
                userId: user?.username || 'Guest',
                x: offsetX,
                y: offsetY,
                color: color
            });
        }

        if (action === 'panning') {
            const { clientX, clientY } = e;
            const { startX, startY, initialPan } = draggedElementRef.current;

            // Delta in SCREEN pixels (dividing by scale NOT needed for raw translation if we translate by screen pixels? 
            // Wait. ctx.translate(x,y) happens AFTER ctx.scale? 
            // If we did ctx.scale then ctx.translate, translate is in SCALED units.
            // If we did ctx.translate then ctx.scale, translate is in SCREEN units.
            // In renderCanvas: ctx.scale() then ctx.translate(). 
            // So translate(10, 0) moves 10 * scale pixels?
            // NO. standard transform order:
            // transform(a,b,c,d,e,f) -> e,f are translation.
            // If I did ctx.scale(2,2); ctx.translate(10,10);
            // Drawing at 0,0 lands at 20,20 on screen?
            // Actually, let's verify standard canvas behavior or just test.
            // Usually: Pan should be in "World Units" if inside the scale.
            // If I drag mouse 100px. I want to see 100px move on screen.
            // If scale is 2x. I need to change panOffset by 50px?
            // Let's assume panOffset is in WORLD coords.

            const dx = (clientX - startX) / scale;
            const dy = (clientY - startY) / scale;

            setPanOffset({
                x: initialPan.x + dx,
                y: initialPan.y + dy
            });
            return;
        }

        if (action === 'moving' && selectedElement) {
            const { index, offsetX: initialOffsetX, offsetY: initialOffsetY } = selectedElement;
            const newX = offsetX - initialOffsetX;
            const newY = offsetY - initialOffsetY;

            // Store specific changed props in ref for reliable history
            draggedElementRef.current = { x: newX, y: newY };

            updateElement(index, { x: newX, y: newY });
            return;
        }

        if (action === 'resizing' && selectedElement) {
            const { index } = selectedElement;
            const el = elements[index];
            let newWidth = offsetX - el.x;
            let newHeight = offsetY - el.y;

            if (el.type === 'text') {
                // Calculate height based on wrapping with newWidth
                const ctx = canvasRef.current.getContext('2d');
                const fontSize = (el.size || 5) * 5;
                ctx.font = `${fontSize}px sans-serif`;
                const lineHeight = fontSize * 1.2;

                // Minimum width for text
                newWidth = Math.max(newWidth, 20);

                const newHeightCalc = wrapText(ctx, el.text, 0, 0, newWidth, lineHeight); // Recalc height

                // Set isFixedWidth to true since user is properly resizing it
                const props = { width: newWidth, height: Math.max(newHeightCalc, fontSize), isFixedWidth: true };
                draggedElementRef.current = props;
                updateElement(index, props);
            } else {
                const props = { width: newWidth, height: newHeight };
                draggedElementRef.current = props;
                updateElement(index, props);
            }
            return;
        }

        if (!isDrawing) return;

        const ctx = canvasRef.current.getContext('2d');

        if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
            if (currentStrokeRef.current) {
                const newPoint = { x: offsetX, y: offsetY };
                currentStrokeRef.current.points.push(newPoint);

                // Force Render safely
                renderCanvas();
            }
        } else {
            // ... existing shape preview code ...
            // shape preview also relies on renderCanvas now
            const previewElement = {
                ...currentElement,
                width: offsetX - currentElement.x,
                height: offsetY - currentElement.y,
                endX: offsetX,
                endY: offsetY
            };
            setCurrentElement(previewElement);
        }
    };

    const stopDrawing = () => {
        if (action === 'panning') {
            setAction('none');
            draggedElementRef.current = null;
            document.body.style.cursor = isSpacePressed ? 'grab' : 'default';
            return;
        }

        if (action === 'resizing' || action === 'moving') {
            if (selectedElement && undoSnapshot) {
                // ... handle history ...
                // We need to fetch the final state from elements[index] since draggedElementRef might be stale if we relied on state updates
                // But wait, updateElement updates state.
                // Let's just create generic UPDATE history.
                const index = selectedElement.index;
                const finalElement = elements[index];

                // If nothing changed, don't push history ?
                // Simple equality check?
                // For now push to keep it simple.

                // NOTE: `updateElement` used during drag updates state.
                // We should ideally only update REF during drag and commit on UP. 
                // But for this specific task (Optimizing DRAWING), we focus on strokes.
                // Optimization for drag/resize: Leave as is (React state) for now unless requested.

                setHistory(prev => [...prev, {
                    type: 'UPDATE',
                    id: finalElement.id,
                    index: index,
                    oldProps: undoSnapshot,
                    newProps: finalElement // this includes full object but that's fine
                }]);
                setRedoStack([]);
                setUndoSnapshot(null);
            }
            setAction('none');
            draggedElementRef.current = null;
            document.body.style.cursor = 'default';
            return;
        }

        if (!isDrawing) return;
        setIsDrawing(false);
        setAction('none');

        // Commit Stroke
        if (currentStrokeRef.current) {
            const newElement = currentStrokeRef.current;
            setElements(prev => [...prev, newElement]);
            setHistory(prev => [...prev, { type: 'ADD', element: newElement }]);

            // Emit to socket
            if (socket) {
                socket.emit('draw-element', { roomId, ...newElement });
            }

            currentStrokeRef.current = null;
        } else if (currentElement) {
            // Commit Shape
            // Ensure it has size
            if (currentElement.width === 0 && currentElement.height === 0 && currentElement.type !== 'text') {
                // Too small, ignore? Or Default size?
                // Ignore
                setCurrentElement(null);
                return;
            }

            setElements(prev => [...prev, currentElement]);
            setHistory(prev => [...prev, { type: 'ADD', element: currentElement }]);
            if (socket) {
                socket.emit('draw-element', { roomId, ...currentElement });
            }
            setCurrentElement(null);
        }
    };

    // Actions
    const handleUndo = () => {
        if (history.length === 0) return;
        const newHistory = [...history];
        const lastAction = newHistory.pop();
        setHistory(newHistory);
        setRedoStack(prev => [...prev, lastAction]);

        if (lastAction.type === 'ADD') {
            // Remove the added element
            // Assuming simplified model where ADDs are appended.
            // Safe approach: Filter by ID if IDs are reliable, or just pop if local-only linear.
            // MVP: Pop last element (might be risky if collab inserted stuff? No, 'elements' mixes everyone).
            // We should remove by ID.
            setElements(prev => prev.filter(el => el.id !== lastAction.element.id));
            if (socket) {
                // How to undo ADD in collab? We don't have a 'delete' event yet other than clear?
                // Actually, we do not have a specific 'delete-element' yet.
                // But user didn't ask for remote undo yet. Local undo is priority.
                // MVP: Just local remove.
            }
        } else if (lastAction.type === 'UPDATE') {
            // Revert changes - FIND INDEX BY ID for stability
            const targetIndex = elements.findIndex(el => el.id === lastAction.id);
            if (targetIndex !== -1) {
                updateElement(targetIndex, lastAction.oldProps);
            }
        } else {
            // Fallback for legacy history (if any exists in active session before reload)
            // Just pop from elements logic?
            setElements(prev => prev.slice(0, -1));
        }
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const newRedoStack = [...redoStack];
        const action = newRedoStack.pop();
        setRedoStack(newRedoStack);
        setHistory(prev => [...prev, action]);

        if (action.type === 'ADD') {
            setElements(prev => [...prev, action.element]);
            if (socket) socket.emit('draw-element', { roomId, ...action.element });
        } else if (action.type === 'UPDATE') {
            const targetIndex = elements.findIndex(el => el.id === action.id);
            if (targetIndex !== -1) {
                updateElement(targetIndex, action.newProps);
            } else {
                console.error("[HandleRedo] Element not found for UPDATE:", action.id);
            }
        }
    };

    const handleClear = () => {
        setElements([]);
        setHistory([]);
        if (socket) socket.emit('clear-canvas', roomId);
    };

    const exportImage = async (fileName) => {
        // Default name if not provided (or passed as event object)
        if (!fileName || typeof fileName !== 'string') {
            const date = new Date().toISOString().slice(0, 10);
            fileName = `Whiteboard-${date}`;
        }

        console.log("Exporting Image with Name:", fileName);
        const canvas = canvasRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tCtx = tempCanvas.getContext('2d');

        // Fill bg
        tCtx.fillStyle = darkMode ? '#0f172a' : '#ffffff';
        tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tCtx.drawImage(canvas, 0, 0);

        try {
            // Try Modern File System Access API
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${fileName}.png`,
                    types: [{
                        description: 'PNG Image',
                        accept: { 'image/png': ['.png'] },
                    }],
                });
                const writable = await handle.createWritable();
                const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
                await writable.write(blob);
                await writable.close();

                // Show success feedback
                setShowCopied('saved');
                setTimeout(() => setShowCopied(false), 2000);

                // HYBRID: Trigger standard download for History
                // Fallback to fileName since handle.name might be unreliable or vary by browser
                const finalName = handle.name || `${fileName}.png`;

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = finalName; // Use the name from FS or default
                document.body.appendChild(link);

                // Small delay to ensure browser treats it cleanly
                setTimeout(() => {
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);

                return;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('File Save Error:', err);
                alert("Deep Deep Error: Failed to save file. If you have images on the board, they might be causing security issues (CORS).");
            }
            // If AbortError (user cancelled), we usually stop. 
            // BUT, if the error was NOT AbortError (e.g. security), we might want to try fallback?
            // For now, let's just logging.
            if (err.name === 'AbortError') return;
        }

        try {
            // Standard Download for Browser Download Manager support
            tempCanvas.toBlob((blob) => {
                if (!blob) {
                    alert("Canvas export failed. (Canvas might be tainted)");
                    return;
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.png`;
                document.body.appendChild(link);
                link.click(); // Browser "Ask where to save" setting will trigger File Manager
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 'image/png');
        } catch (e) {
            console.error("Standard download failed:", e);
            alert("Save failed. The canvas might be tainted by external images.");
        }
    };

    const exportPDF = async (fileName) => {
        if (!fileName || typeof fileName !== 'string') {
            const date = new Date().toISOString().slice(0, 10);
            fileName = `Whiteboard-${date}`;
        }

        const canvas = canvasRef.current; // Transparent

        // Create a temp canvas with background for PDF
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.fillStyle = darkMode ? '#0f172a' : '#ffffff';
        tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tCtx.drawImage(canvas, 0, 0);

        const imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

        try {
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${fileName}.pdf`,
                    types: [{
                        description: 'PDF Document',
                        accept: { 'application/pdf': ['.pdf'] },
                    }],
                });
                const writable = await handle.createWritable();
                const blob = pdf.output('blob');
                await writable.write(blob);
                await writable.close();

                setShowCopied('saved');
                setTimeout(() => setShowCopied(false), 2000);

                // HYBRID: Trigger standard download for History
                const finalName = handle.name || `${fileName}.pdf`;

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = finalName;
                document.body.appendChild(link);

                setTimeout(() => {
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);

                return;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('File Save Error:', err);
                // Proceed to fallback or alert
            } else {
                return; // User cancelled
            }
        }

        try {
            pdf.save(`${fileName}.pdf`);
        } catch (e) {
            console.error("PDF Save failed:", e);
            alert("PDF Save failed. Canvas might be tainted.");
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { imageUrl } = res.data;

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                if (w > 500) {
                    const ratio = 500 / w;
                    w = 500;
                    h = h * ratio;
                }
                const newElement = {
                    id: crypto.randomUUID(),
                    type: 'image',
                    x: 100, y: 100,
                    width: w, height: h,
                    dataURL: imageUrl
                };
                setElements(prev => [...prev, newElement]);
                setHistory(prev => [...prev, { type: 'ADD', element: newElement }]);
                setRedoStack([]);
                if (socket) socket.emit('draw-element', { roomId, ...newElement });

                // Auto-switch to select mode so user can move/resize immediately
                setTool('select');
            };
            img.src = imageUrl;

        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed");
        }
        e.target.value = null;
    };

    const addStickyNote = () => {
        setTool('sticky');
    }

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    }

    // Wheel Logic (Zoom & Pan)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            e.preventDefault();

            if (e.ctrlKey || e.metaKey) {
                // Zoom-to-Cursor Logic
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Multiplicative Zoom for smooth feel
                const zoomFactor = 0.1;
                let delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;

                // Calculate new scale bounds
                const newScale = Math.min(Math.max(scale + delta, 0.1), 5); // Kept additive for simple step control, or switch to mul?
                // Stick to Additive for now to match UI controls (+/- 10%), but logic holds.

                // Math: 
                // World = Mouse / Scale - Pan
                // We want World to be constant.
                // Mouse / OldScale - OldPan = Mouse / NewScale - NewPan
                // NewPan = Mouse / NewScale - Mouse / OldScale + OldPan
                // NewPan = OldPan + Mouse * (1/NewScale - 1/OldScale)

                if (newScale === scale) return; // Bounds hit

                const scaleAdjustmentX = mouseX * (1 / newScale - 1 / scale);
                const scaleAdjustmentY = mouseY * (1 / newScale - 1 / scale);

                setPanOffset(prev => ({
                    x: prev.x + scaleAdjustmentX,
                    y: prev.y + scaleAdjustmentY
                }));
                setScale(newScale);

            } else {
                // Pan
                // Divide by scale to keep pan speed consistent with screen pixels
                setPanOffset(prev => ({
                    x: prev.x - e.deltaX / scale,
                    y: prev.y - e.deltaY / scale
                }));
            }
        };

        // Passive: false is required to preventDefault
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        // Prevent default touch actions to avoid swipe-nav/refresh
        canvas.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [scale, panOffset]); // Re-bind on scale change for correct calculation

    // ... drawGrid ...

    const drawGrid = (ctx, width, height, scale, panOffset) => {
        let gridSize = 40; // World unit size
        const dotSize = 1;

        // Dynamic Level of Detail (LOD)
        // Ensure grid points are at least 20px apart on SCREEN.
        // If scale is 0.1, 40 * 0.1 = 4px (too dense).
        // We double gridSize until it's visually sparse enough.
        while (gridSize * scale < 20) {
            gridSize *= 2;
        }

        ctx.save();
        ctx.scale(scale, scale);
        ctx.translate(panOffset.x, panOffset.y);

        // We need to draw grid lines/dots that cover the VISIBLE area.
        // Visible Area in World Coords:
        // Left: -panOffset.x
        // Top: -panOffset.y
        // Right: -panOffset.x + width / scale
        // Bottom: -panOffset.y + height / scale

        const startX = -panOffset.x;
        const startY = -panOffset.y;
        const endX = startX + width / scale;
        const endY = startY + height / scale;

        // Snap to grid
        const gridStartX = Math.floor(startX / gridSize) * gridSize;
        const gridStartY = Math.floor(startY / gridSize) * gridSize;

        ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        for (let x = gridStartX; x < endX; x += gridSize) {
            for (let y = gridStartY; y < endY; y += gridSize) {
                ctx.fillRect(x, y, dotSize, dotSize); // Draw Dot
            }
        }
        ctx.restore();
    };

    return (
        <div className={`relative w-full h-screen overflow-hidden cursor-crosshair transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-gray-100'}`}>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Cursors Overlay */}
            {/* Cursors Overlay */}

            {/* Cursors Overlay */}
            {Object.entries(cursors).map(([userId, cursor]) => (
                <div
                    key={userId}
                    className="absolute pointer-events-none transition-all duration-75 z-50 flex items-center gap-2"
                    style={{ left: cursor.x, top: cursor.y }}
                >
                    <FaMousePointer className="text-xl" style={{ color: cursor.color || '#f00' }} />
                    <span className="text-xs px-2 py-1 rounded bg-slate-800/80 text-white backdrop-blur-sm whitespace-nowrap">
                        {userId}
                    </span>
                </div>
            ))}

            {/* Header / Room Info */}
            <div className={`absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pointer-events-none`}>
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className={`bg-opacity-80 backdrop-blur-md px-4 py-2 rounded-xl border text-sm flex items-center gap-2 shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-600'}`}>
                        <span className="font-semibold text-blue-500">Room:</span>
                        <span className="font-mono">{roomId ? roomId.slice(0, 8) : 'Demo'}...</span>
                        <button onClick={copyRoomId} className="hover:text-blue-500 ml-2 transition-colors"><FaCopy /></button>
                    </div>
                    <AnimatePresence>
                        {showCopied && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded border border-green-200">
                            {showCopied === true ? 'Copied!' : 'Saved Successfully!'}
                        </motion.div>}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-full shadow-lg transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-gray-50'}`}>
                        {darkMode ? <FaSun /> : <FaMoon />}
                    </button>
                </div>
            </div>

            {/* Note/Text Editing Overlay */}
            {editingElement && (
                <textarea
                    autoFocus
                    defaultValue={editingElement.text}
                    onBlur={saveNote}
                    onInput={(e) => {
                        const isFixed = elements[editingElement.index]?.isFixedWidth || editingElement.type === 'sticky';
                        if (!isFixed) {
                            e.target.style.width = '0px';
                            e.target.style.height = '0px';
                            e.target.style.width = Math.max(100, e.target.scrollWidth + 10) + 'px';
                            e.target.style.height = Math.max(50, e.target.scrollHeight) + 'px';
                        } else {
                            // Fixed width: Height grows, width stays
                            e.target.style.height = '0px';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }
                    }}
                    onKeyDown={(e) => {
                        // Allow Shift+Enter for new lines
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            e.target.blur(); // Save and close
                        }
                    }}
                    style={{
                        position: 'absolute',
                        left: (editingElement.x + panOffset.x) * scale,
                        top: (editingElement.y + panOffset.y) * scale,
                        width: Math.max(100, editingElement.width) * scale,
                        height: Math.max(50, editingElement.height) * scale,
                        backgroundColor: editingElement.type === 'sticky' ? '#fef08a' : 'transparent',
                        color: editingElement.type === 'sticky' ? '#000' : (editingElement.color || color),
                        fontSize: (editingElement.type === 'sticky' ? 16 : (elements[editingElement.index]?.size || 5) * 5) * scale + 'px',
                        transformOrigin: 'top left', // Important for reliable scaling
                        fontFamily: 'sans-serif',
                        padding: (editingElement.type === 'sticky' ? 30 : 0) * scale + 'px ' + (10 * scale) + 'px',
                        border: 'none',
                        outline: editingElement.type === 'text' ? '1px dashed #ccc' : 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        zIndex: 10,
                        whiteSpace: (editingElement.type === 'text' && !elements[editingElement.index]?.isFixedWidth) ? 'pre' : 'pre-wrap'
                    }}
                    className={editingElement.type === 'sticky' ? "shadow-inner" : ""}
                    placeholder={editingElement.type === 'text' ? "Type here..." : ""}
                />
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-[#020617] border border-white/10 p-2 rounded-lg shadow-xl z-50">
                <button onClick={() => handleZoom(-0.1)} className="p-2 text-slate-400 hover:text-white transition-colors"><BsZoomOut /></button>
                <span className="text-white font-mono text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-2 text-slate-400 hover:text-white transition-colors"><BsZoomIn /></button>
            </div>

            <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onDoubleClick={(e) => {
                    const { x: offsetX, y: offsetY } = getMousePos(e);
                    // Check for sticky note OR text
                    for (let i = elements.length - 1; i >= 0; i--) {
                        const el = elements[i];
                        if ((el.type === 'sticky' || el.type === 'text') && isWithinElement(offsetX, offsetY, el)) {
                            // Enter Edit Mode (React Way)
                            const initialText = el.text === "Double click to edit..." ? "" : el.text;
                            setEditingElement({
                                index: i,
                                type: el.type,
                                text: initialText,
                                x: el.x,
                                y: el.y,
                                width: el.width || (el.type === 'text' ? 100 : 200),
                                height: el.height || (el.type === 'text' ? 30 : 200),
                                color: el.color
                            });
                            // Sync Toolbar
                            if (el.color) setColor(el.color);
                            if (el.size) setBrushSize(el.size);
                            return;
                        }
                    }
                }}
                className="absolute inset-0 z-0 touch-none"
            />

            {/* Main Toolbar - Minimal Island */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-4">

                {/* Secondary Actions (Undo, Redo, Clear) */}
                <div className="flex items-center gap-1 bg-[#0f172a] border border-white/5 rounded-full p-1.5 shadow-2xl shadow-black/50">
                    <button onClick={handleUndo} className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Undo"><FaUndo /></button>
                    <button onClick={handleRedo} className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Redo"><FaRedo /></button>
                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                    <button onClick={handleClear} className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors" title="Clear All"><FaTrash /></button>
                </div>

                {/* Primary Tools Dock */}
                <div className="flex items-center gap-2 bg-[#020617] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/50 ring-1 ring-white/5">

                    {/* Tools */}
                    <div className="flex items-center gap-1 bg-[#0f172a] rounded-xl p-1 border border-white/5">
                        {[
                            { id: 'pen', icon: FaPen },
                            { id: 'highlighter', icon: FaHighlighter },
                            { id: 'eraser', icon: FaEraser },
                            { id: 'line', icon: FaSlash },
                            { id: 'text', icon: FaFont },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTool(t.id)}
                                className={`p-3 rounded-lg transition-all duration-200 ${tool === t.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <t.icon className={t.id === 'line' ? 'transform -rotate-45' : ''} />
                            </button>
                        ))}
                        <div className="relative">
                            <button
                                onClick={() => setShowShapeMenu(!showShapeMenu)}
                                className={`p-3 rounded-lg transition-all duration-200 ${(tool === 'rect' || tool === 'circle' || tool === 'triangle' || tool === 'pentagon' || tool === 'hexagon' || tool === 'octagon' || tool === 'star')
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                title="Shapes"
                            >
                                <FaDrawPolygon />
                            </button>
                            <AnimatePresence>
                                {showShapeMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-[#0f172a] border border-white/10 rounded-xl p-2 grid grid-cols-4 gap-1 shadow-2xl"
                                    >
                                        {[
                                            { id: 'rect', icon: BsSquare, label: 'Square' },
                                            { id: 'circle', icon: BsCircle, label: 'Circle' },
                                            { id: 'triangle', icon: BsTriangle, label: 'Triangle' },
                                            { id: 'star', icon: BsStar, label: 'Star' },
                                            { id: 'pentagon', icon: BsPentagon, label: 'Pentagon' },
                                            { id: 'hexagon', icon: BsHexagon, label: 'Hexagon' },
                                            { id: 'octagon', icon: BsOctagon, label: 'Octagon' },
                                        ].map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => { setTool(s.id); setShowShapeMenu(false); }}
                                                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${tool === s.id ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                                title={s.label}
                                            >
                                                <s.icon className="text-xl" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-1"></div>

                    {/* Quick Insert */}
                    <div className="flex items-center gap-1">
                        <button onClick={addStickyNote} className="p-3 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors" title="Add Sticky Note">
                            <FaStickyNote />
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="p-3 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors" title="Upload Image">
                            <FaImage />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-1"></div>

                    {/* Properties */}
                    <div className="flex items-center gap-2 px-2">
                        <div className="relative group">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setColor(val);
                                    if (selectedElement) {
                                        updateElement(selectedElement.index, { color: val });
                                    } else if (editingElement) {
                                        // Update editing state for live preview
                                        setEditingElement(prev => ({ ...prev, color: val }));
                                        // Also update actual element (though saveNote will finalize)
                                        updateElement(editingElement.index, { color: val });
                                    }
                                }}
                                className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
                            />
                            <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-black/10 pointer-events-none"></div>
                        </div>

                        <div className="flex flex-col gap-1 w-24">
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={brushSize}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setBrushSize(val);
                                    if (selectedElement) {
                                        const index = selectedElement.index;
                                        const el = elements[index];
                                        if (el.type === 'text') {
                                            // Recalc height for text reflow
                                            const ctx = canvasRef.current.getContext('2d');
                                            const fontSize = val * 5;
                                            ctx.font = `${fontSize}px sans-serif`;
                                            const lineHeight = fontSize * 1.2;
                                            // Keep current width
                                            const newHeight = wrapText(ctx, el.text, 0, 0, el.width, lineHeight);
                                            updateElement(index, { size: val, height: Math.max(newHeight, fontSize) });
                                        } else {
                                            updateElement(index, { size: val });
                                        }
                                    } else if (editingElement) {
                                        // Live update for text editing size
                                        // We need to update editingElement state to trigger textarea font-size change
                                        setEditingElement(prev => ({ ...prev, color: prev.color })); // Force re-render? No, use val.
                                        // Actually `size` isn't in editingElement top-level usually?
                                        // Wait, textarea style uses `elements[editingElement.index]?.size` (Line 934)
                                        // So we MUST update the element itself.

                                        const index = editingElement.index;
                                        const el = elements[index];
                                        if (el.type === 'text') {
                                            const ctx = canvasRef.current.getContext('2d');
                                            const fontSize = val * 5;
                                            ctx.font = `${fontSize}px sans-serif`;
                                            const lineHeight = fontSize * 1.2;
                                            const newHeight = wrapText(ctx, el.text, 0, 0, el.width, lineHeight);
                                            updateElement(index, { size: val, height: Math.max(newHeight, fontSize) });
                                        } else {
                                            updateElement(index, { size: val });
                                        }
                                    }
                                }}
                                className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Whiteboard;
