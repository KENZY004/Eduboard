import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // Removed in favor of crypto.randomUUID()
import io from 'socket.io-client';
import api from '../lib/api';
import {
    FaEraser, FaPen, FaTrash, FaSignOutAlt, FaShareAlt, FaCopy,
    FaSlash, FaUndo, FaRedo, FaSave, FaMoon, FaSun, FaDownload, FaFilePdf, FaFont,
    FaHighlighter, FaImage, FaStickyNote, FaMousePointer, FaDrawPolygon, FaUserEdit, FaUsers, FaTimes
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

    let user = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        user = null;
    }
    const isStudent = user?.role === 'student';

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
    const [renderTrigger, setRenderTrigger] = useState(0); // Force re-renders for remote strokes

    // Per-student permission states
    const [connectedUsers, setConnectedUsers] = useState([]); // All users in room
    const [allowedStudents, setAllowedStudents] = useState([]); // Students with permission
    const [hasEditPermission, setHasEditPermission] = useState(false); // Current student's permission
    const [showStudentPanel, setShowStudentPanel] = useState(false); // Panel visibility

    const [currentElement, setCurrentElement] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null); // { index, offsetX, offsetY, initialWidth, initialHeight }
    const [editingElement, setEditingElement] = useState(null); // { index, text, x, y, width, height }
    const [action, setAction] = useState('none'); // 'drawing', 'moving', 'resizing'
    const textAreaRef = useRef(null);
    const draggedElementRef = useRef(null); // Fix for stale state in history
    const currentStrokeRef = useRef(null); // Optimization: Mutable ref for drawing to bypass React Render Cycle
    const lastEmitTimeRef = useRef(0); // Throttle socket emissions

    const navigate = useNavigate();
    const { roomId } = useParams();

    // Socket Init + Board Existence Check
    useEffect(() => {
        const token = localStorage.getItem('token');
        const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
            auth: {
                token: token // Add JWT token for Socket.IO authentication
            }
        });
        setSocket(newSocket);

        // Send user data when joining room
        newSocket.emit('join-room', roomId, {
            userId: user?.id,
            username: user?.username || user?.email?.split('@')[0] || 'Anonymous',
            role: user?.role || 'student'
        });

        // Check if board still exists (prevents ghost drawings from deleted boards)
        const checkBoardExists = async () => {
            try {
                const response = await api.get(`/api/boards/${roomId}`);
                if (!response.data) {
                    // Board doesn't exist, clear everything
                    setElements([]);
                    setHistory([]);
                    setRedoStack([]);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    // Board was deleted, clear everything
                    console.log('[BOARD-CHECK] Board was deleted (404), clearing state');
                    setElements([]);
                    setHistory([]);
                    setRedoStack([]);

                    // Clear canvas
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            }
        };

        checkBoardExists();

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

            // Clean up remote stroke when it's finalized
            if (window.remoteStrokes && element.userId) {
                delete window.remoteStrokes[element.userId];
            }
        });

        // Real-time stroke updates (while drawing)
        socket.on('drawing-stroke', (strokeData) => {
            // Store the remote user's current stroke for rendering
            // We use a separate ref to avoid state updates during rapid drawing
            if (strokeData.userId !== user?.id) {
                // Store in a map by userId so multiple users can draw simultaneously
                if (!window.remoteStrokes) window.remoteStrokes = {};
                window.remoteStrokes[strokeData.userId] = strokeData.stroke;
                // Force re-render without modifying elements
                setRenderTrigger(prev => prev + 1);
            }
        });

        // Delete element (for undo synchronization)
        socket.on('delete-element', (elementId) => {
            setElements(prev => {
                const filtered = prev.filter(el => el.id !== elementId);
                return filtered;
            });
        });

        // Clear canvas (when teacher clicks Clear All button)
        socket.on('clear-canvas', () => {
            setElements([]);
            setHistory([]);
            setRedoStack([]);

            // Use requestAnimationFrame to ensure canvas clears after state update
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                });
            });
        });

        socket.on('load-board', async (boardData) => {
            // Handle both old format (array) and new format (object)
            const loadedElements = Array.isArray(boardData) ? boardData : (boardData.elements || []);
            const allowedStudentsList = boardData.allowedStudents || [];

            // Deduplicate loaded elements (Fix for "ghost" images from previous bug)
            const uniqueMap = new Map();
            loadedElements.forEach(el => {
                uniqueMap.set(el.id, el); // Latest wins
            });
            setElements(Array.from(uniqueMap.values()));
            setAllowedStudents(allowedStudentsList);

            // Check if current student has permission
            if (user?.role === 'student') {
                const hasPermission = allowedStudentsList.some(s => s._id === user.id);
                setHasEditPermission(hasPermission);

                // Auto-save board for student (independent copy)
                try {
                    await api.post('/api/boards/save', {
                        roomId: roomId,
                        boardName: boardData.boardName || 'Untitled Board',
                        teacherName: boardData.teacherName || 'Unknown Teacher',
                        elements: loadedElements
                    });
                } catch (err) {
                    // Silently fail if already saved or error occurs
                    if (err.response?.status !== 400) {
                        console.error('[AUTO-SAVE] Error:', err);
                    }
                }
            }
        });

        // Board deleted event - clear everything and redirect
        socket.on('board-deleted', (data) => {
            // Clear all state
            setElements([]);
            setHistory([]);
            setRedoStack([]);

            // Clear canvas
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }

            // Show notification and redirect
            alert('This board has been deleted');
            navigate('/dashboard');
        });

        socket.on('cursor-move', (data) => {
            setCursors(prev => ({ ...prev, [data.userId]: data }));
        });

        // Viewport sync - students follow teacher's view
        socket.on('viewport-change', (viewportData) => {
            // Only students should follow teacher's viewport
            if (isStudent && viewportData.userId !== user?.id) {
                setScale(viewportData.scale);
                setPanOffset(viewportData.panOffset);
            }
        });

        // Room users updated (for teacher's student panel)
        socket.on('room-users-updated', (users) => {
            setConnectedUsers(users);
        });

        // Student editing permission changed (for individual students)
        socket.on('editing-permission-changed', (hasPermission) => {
            if (user?.role === 'student') {
                setHasEditPermission(hasPermission);
            }
        });

        // Theme synchronization (students follow teacher's theme)
        socket.on('theme-changed', (isDark) => {
            if (user?.role === 'student') {
                setDarkMode(isDark);
            } else {
                console.log('[THEME-SYNC] Ignoring theme change (not a student)');
            }
        });

        // Delete element (for undo synchronization)
        socket.on('delete-element', (elementId) => {
            setElements(prev => {
                const filtered = prev.filter(el => el.id !== elementId);
                // Force canvas re-render after state update
                requestAnimationFrame(() => {
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        filtered.forEach(el => drawElement(ctx, el));
                    }
                });

                return filtered;
            });
        });

        // Update element (for eraser redo synchronization and live sticky note editing)
        socket.on('update-element', ({ elementId, updates }) => {
            setElements(prev => {
                const updated = prev.map(el =>
                    el.id === elementId ? { ...el, ...updates } : el
                );

                // Force canvas re-render to show live text changes
                requestAnimationFrame(() => {
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        updated.forEach(el => drawElement(ctx, el));
                    }
                });

                return updated;
            });
        });

        // Sync state (for redo to maintain exact element order)
        socket.on('sync-state', (elements) => {
            setElements(elements);

            // Force canvas re-render to ensure visual consistency
            requestAnimationFrame(() => {
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    elements.forEach(el => drawElement(ctx, el));
                }
            });
        });

        // Draw element (receive new elements from other users)
        socket.on('draw-element', (element) => {
            setElements(prev => {
                // Check if element already exists (by ID)
                const existingIndex = prev.findIndex(el => el.id === element.id);
                if (existingIndex !== -1) {
                    // Update existing element
                    const updated = [...prev];
                    updated[existingIndex] = element;
                    return updated;
                } else {
                    // Add new element
                    return [...prev, element];
                }
            });
        });

        return () => {
            socket.off('draw-element');
            socket.off('drawing-stroke');
            socket.off('load-board');
            socket.off('clear-canvas');
            socket.off('cursor-move');
            socket.off('viewport-change');
            socket.off('room-users-updated');
            socket.off('editing-permission-changed');
            socket.off('theme-changed');
            socket.off('delete-element');
            socket.off('update-element');
            socket.off('sync-state');
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
                ctx.globalAlpha = 1.0; // Full opacity to completely erase
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
                // Reset globalAlpha and globalCompositeOperation after highlighter
                ctx.globalAlpha = 1.0;
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
            // Font size proportional to note size (10% of note width)
            // This ensures text scales with the note and always fits inside
            const fontSize = width * 0.10;
            ctx.font = `${fontSize}px sans-serif`;
            // Use fixed padding in world coordinates that scales with note
            const paddingX = width * 0.05;
            const paddingY = height * 0.15; // Start text lower to avoid overlap
            const lineHeight = fontSize * 1.2;
            const maxTextHeight = height - paddingY * 2; // Available height for text
            wrapText(ctx, text || "", x + paddingX, y + paddingY, width - paddingX * 2, lineHeight, maxTextHeight);
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
        // CRITICAL: Reset all canvas state before restore to prevent contamination
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
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

        // Sort elements by timestamp for consistent z-ordering across clients
        // Elements without timestamp (from old deployed version) get timestamp 0 (render first/bottom)
        const sortedElements = [...elements].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        // Integrate remote users' in-progress strokes into sorted elements for proper z-ordering
        // This maintains real-time drawing while respecting timestamp-based layering
        if (window.remoteStrokes) {
            Object.values(window.remoteStrokes).forEach(stroke => {
                if (stroke && stroke.points && stroke.points.length > 0) {
                    sortedElements.push(stroke);
                }
            });
            // Re-sort to include remote strokes in correct z-order
            sortedElements.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        }

        sortedElements.forEach((element) => {
            // Find original index for selection/editing checks
            const originalIndex = elements.findIndex(el => el.id === element.id);

            // Skip rendering if currently being edited (prevents double text defect)
            if (editingElement && editingElement.index === originalIndex) {
                if (element.type === 'sticky') return;
            }
            drawElement(ctx, element);

            if (selectedElement && selectedElement.index === originalIndex) {
                ctx.save();
                ctx.strokeStyle = '#3b82f6'; // Blue
                ctx.lineWidth = 2 / scale; // Keep border thin
                // Draw border
                const { x, y, width, height } = element;
                // Handle different shapes? For now rect/image/sticky
                if (['rect', 'image', 'sticky', 'triangle', 'pentagon', 'hexagon', 'octagon', 'star'].includes(element.type)) {
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
    }, [elements, darkMode, editingElement, scale, panOffset, currentElement, renderTrigger]);

    // Verify board exists when theme changes (prevents ghost drawings from deleted boards)
    useEffect(() => {
        const verifyBoardOnThemeChange = async () => {
            try {
                const response = await api.get(`/api/boards/${roomId}`);
                if (!response.data) {
                    setElements([]);
                    setHistory([]);
                    setRedoStack([]);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log('[THEME-CHANGE] Board was deleted (404), clearing ghost drawings');
                    setElements([]);
                    setHistory([]);
                    setRedoStack([]);

                    // Force clear canvas
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            }
        };

        verifyBoardOnThemeChange();
    }, [darkMode]);

    // Emit viewport changes for students to follow (teachers only)
    useEffect(() => {
        if (socket && !isStudent && user?.id) {
            socket.emit('viewport-change', {
                roomId,
                userId: user.id,
                scale,
                panOffset
            });
        }
    }, [scale, panOffset, socket, isStudent]);



    const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxHeight) => {
        const paragraphs = text.split('\n');
        let currentY = y;

        paragraphs.forEach(paragraph => {
            let words = paragraph.split(' ');
            let line = '';

            for (let n = 0; n < words.length; n++) {
                // Check if we've exceeded the height boundary
                if (maxHeight && currentY + lineHeight > y + maxHeight) {
                    return; // Stop rendering if we exceed the note's height
                }

                let word = words[n];

                // Check if the word itself is too long to fit on one line
                if (ctx.measureText(word).width > maxWidth) {
                    // Render current line if it has content
                    if (line.trim()) {
                        ctx.fillText(line, x, currentY);
                        currentY += lineHeight;
                        line = '';
                    }

                    // Break the long word into chunks that fit
                    let remainingWord = word;
                    while (remainingWord.length > 0) {
                        if (maxHeight && currentY + lineHeight > y + maxHeight) {
                            return; // Stop if we exceed height
                        }

                        let chunk = '';
                        for (let i = 0; i < remainingWord.length; i++) {
                            let testChunk = chunk + remainingWord[i];
                            if (ctx.measureText(testChunk).width > maxWidth) {
                                break;
                            }
                            chunk = testChunk;
                        }

                        if (chunk.length === 0) chunk = remainingWord[0]; // At least one character
                        ctx.fillText(chunk, x, currentY);
                        currentY += lineHeight;
                        remainingWord = remainingWord.substring(chunk.length);
                    }
                    continue;
                }

                let testLine = line + word + ' ';
                let metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, x, currentY);
                    line = word + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }

            // Check again before rendering the last line
            if (!maxHeight || currentY + lineHeight <= y + maxHeight) {
                ctx.fillText(line, x, currentY);
                currentY += lineHeight;
            }
        });
        return currentY; // Return bottom Y for height check
    }

    // Drawing Logic

    const isWithinElement = (x, y, element) => {
        const { type, x: ex, y: ey, width, height } = element;
        if (type === 'rect' || type === 'image' || type === 'sticky' ||
            type === 'triangle' || type === 'pentagon' || type === 'hexagon' || type === 'octagon' || type === 'star') {
            // For all rectangular elements including images and polygons (using bounding box)
            const w = Math.max(width || 0, 20);
            const h = Math.max(height || 0, 20);
            return x >= ex - 10 && x <= ex + w + 10 && y >= ey - 10 && y <= ey + h + 10;
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
        // For sticky notes, preserve original scale-independent size
        const minHeight = editingElement.type === 'sticky' ? (elements[index].height || 200 / scale) : fontSize;

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

        // Ensure students receive the final state for sticky notes
        if (editingElement.type === 'sticky' && socket && user?.role === 'teacher') {
            socket.emit('update-element', {
                roomId,
                elementId: elements[index].id,
                updates: newProps
            });
        }

        if (user?.role === 'teacher') {
            setHistory(prev => [...prev, {
                type: 'UPDATE',
                id: elements[index].id,
                index: index,
                oldProps,
                newProps
            }]);
        }
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

            // Emit real-time stroke updates to other users (throttled to ~60fps)
            const now = Date.now();
            if (socket && currentStrokeRef.current.points.length > 0 && (now - lastEmitTimeRef.current) > 16) {
                socket.emit('drawing-stroke', {
                    roomId,
                    userId: user?.id,
                    stroke: currentStrokeRef.current
                });
                lastEmitTimeRef.current = now;
            }
        }
    };

    const startDrawing = (e) => {
        // Check if user can edit (teacher always can, student needs permission)
        const canEdit = user?.role === 'teacher' || (user?.role === 'student' && hasEditPermission);
        if (!canEdit) return;

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

        // FIRST: Check resize handle if something is already selected
        if (selectedElement !== null && tool === 'select') {
            const el = elements[selectedElement.index];
            const w = el.width || (el.type === 'text' ? 50 : 0);
            const h = el.height || (el.type === 'text' ? 20 : 0);
            // Scale-independent handle size: always 20px on screen, converted to world coords
            const handleSize = 20 / scale; // Larger hit area that scales with zoom
            if (offsetX >= el.x + w - handleSize && offsetX <= el.x + w + handleSize &&
                offsetY >= el.y + h - handleSize && offsetY <= el.y + h + handleSize) {
                setAction('resizing');
                setIsDrawing(true); // Enable drawing for resize
                setUndoSnapshot({ ...el });
                return;
            }
        }

        // SECOND: Check if clicking on an image or sticky note - always allow selection regardless of current tool
        let priorityHitIndex = -1;
        for (let i = elements.length - 1; i >= 0; i--) {
            if ((elements[i].type === 'image' || elements[i].type === 'sticky') && isWithinElement(offsetX, offsetY, elements[i])) {
                priorityHitIndex = i;
                break;
            }
        }

        // If clicked on an image or sticky note, select it and allow moving
        if (priorityHitIndex !== -1) {
            const el = elements[priorityHitIndex];
            setTool('select');
            setSelectedElement({ index: priorityHitIndex, offsetX: offsetX - el.x, offsetY: offsetY - el.y });
            setUndoSnapshot({ ...el });
            setAction('moving');
            setIsDrawing(true); // Enable drawing mode for movement
            return;
        }

        if (tool === 'select') {
            // ... (select logic)
            // 1. Check Resize Handle (Bottom-Right of selected)
            if (selectedElement !== null) {
                const el = elements[selectedElement.index];
                const w = el.width || (el.type === 'text' ? 50 : 0);
                const h = el.height || (el.type === 'text' ? 20 : 0);
                // allow 10px hit area (in world coordinates)
                const handleSize = 10;
                if (offsetX >= el.x + w - handleSize && offsetX <= el.x + w + handleSize &&
                    offsetY >= el.y + h - handleSize && offsetY <= el.y + h + handleSize) {
                    setAction('resizing');
                    setIsDrawing(true); // Enable drawing for resize
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

        if (tool === 'sticky') {
            // Check for existing element hit first (Smart Tool)
            let hitIndex = -1;
            for (let i = elements.length - 1; i >= 0; i--) {
                if (isWithinElement(offsetX, offsetY, elements[i])) {
                    hitIndex = i;
                    break;
                }
            }

            if (hitIndex !== -1) {
                // If we hit something, interact with it instead of creating new sticky
                setTool('select');
                setSelectedElement({ index: hitIndex, offsetX: offsetX - elements[hitIndex].x, offsetY: offsetY - elements[hitIndex].y });
                setUndoSnapshot({ ...elements[hitIndex] }); // Capture state for undo
                setAction('moving');
                return;
            }

            // Create new sticky note
            const id = crypto.randomUUID();
            const newElement = {
                id,
                type: 'sticky',
                // Scale-independent sizing: Always 200px on screen
                x: offsetX - (100 / scale), // Center on click
                y: offsetY - (100 / scale),
                width: 200 / scale,  // Scale-independent width
                height: 200 / scale, // Scale-independent height
                text: "Double click to edit...",
                timestamp: Date.now() // For consistent z-ordering across clients
            };

            setElements(prev => [...prev, newElement]);
            if (user?.role === 'teacher') {
                setHistory(prev => [...prev, { type: 'ADD', element: newElement }]);
            }

            // Emit immediately so students see note appear
            if (socket) {
                socket.emit('draw-element', { roomId, ...newElement });
            }

            // For sticky, switch to select immediately
            setTool('select');
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
                points: [{ x: offsetX, y: offsetY }],
                timestamp: Date.now() // For consistent z-ordering across clients
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
                height: 0,
                timestamp: Date.now() // For consistent z-ordering across clients
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

            if (el.type === 'image') {
                // Maintain aspect ratio for images
                const aspectRatio = el.aspectRatio || (el.width / el.height);
                newHeight = newWidth / aspectRatio;
                const props = { width: newWidth, height: newHeight };
                draggedElementRef.current = props;
                updateElement(index, props);
            } else if (el.type === 'text') {
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

                // Emit real-time stroke updates (throttled to every 3rd point to reduce network load)
                if (socket && currentStrokeRef.current.points.length % 3 === 0) {
                    socket.emit('drawing-stroke', {
                        roomId,
                        userId: user?.id,
                        stroke: currentStrokeRef.current
                    });
                }

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

                if (user?.role === 'teacher') {
                    setHistory(prev => [...prev, {
                        type: 'UPDATE',
                        id: finalElement.id,
                        index: index,
                        oldProps: undoSnapshot,
                        newProps: finalElement // this includes full object but that's fine
                    }]);
                }
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
            if (user?.role === 'teacher') {
                setHistory(prev => [...prev, { type: 'ADD', element: newElement }]);
            }

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
            if (user?.role === 'teacher') {
                setHistory(prev => [...prev, { type: 'ADD', element: currentElement }]);
            }
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
            setElements(prev => prev.filter(el => el.id !== lastAction.element.id));
            // Emit delete to other users for undo synchronization
            if (socket) {
                socket.emit('delete-element', { roomId, elementId: lastAction.element.id });
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

        if (user?.role === 'teacher') {
            setHistory(prev => [...prev, action]);
        }

        if (action.type === 'ADD') {
            setElements(prev => {
                const newElements = [...prev, action.element];
                // Sync full state to students after redo to maintain order
                if (socket && user?.role === 'teacher') {
                    socket.emit('sync-state', { roomId, elements: newElements });
                }
                return newElements;
            });
        } else if (action.type === 'UPDATE') {
            setElements(prev => {
                const targetIndex = prev.findIndex(el => el.id === action.id);
                if (targetIndex !== -1) {
                    const updatedElements = prev.map((el, idx) =>
                        idx === targetIndex ? { ...el, ...action.newProps } : el
                    );
                    // Sync full state after update
                    if (socket && user?.role === 'teacher') {
                        socket.emit('sync-state', { roomId, elements: updatedElements });
                    }
                    return updatedElements;
                } else {
                    console.error("[HandleRedo] Element not found for UPDATE:", action.id);
                    return prev;
                }
            });
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

        // Create local preview URL for immediate display
        const localURL = URL.createObjectURL(file);

        // Create a temporary image element to get dimensions
        const tempImg = new Image();
        tempImg.onload = async () => {
            let w = tempImg.width;
            let h = tempImg.height;

            // Scale-independent sizing
            const targetScreenSize = 300;
            const scaleFactor = 1 / scale;

            if (w > h) {
                w = targetScreenSize * scaleFactor;
                h = w / (tempImg.width / tempImg.height);
            } else {
                h = targetScreenSize * scaleFactor;
                w = h * (tempImg.width / tempImg.height);
            }

            // Create element with local preview immediately
            const newElement = {
                id: crypto.randomUUID(),
                type: 'image',
                x: -panOffset.x + 100 / scale,
                y: -panOffset.y + 100 / scale,
                width: w,
                height: h,
                dataURL: localURL, // Use local URL for immediate display
                aspectRatio: tempImg.width / tempImg.height,
                timestamp: Date.now(),
                uploading: true // Flag to indicate upload in progress
            };

            const newIndex = elements.length;
            setElements(prev => [...prev, newElement]);

            // Auto-switch to select mode
            setTool('select');
            setSelectedElement({
                index: newIndex,
                offsetX: 0,
                offsetY: 0
            });

            // Convert to base64 for immediate sharing with students
            const canvas = document.createElement('canvas');
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(tempImg, 0, 0);
            const base64URL = canvas.toDataURL('image/jpeg', 0.7); // Compressed for faster transmission

            // Update element with base64 for immediate display
            const previewElement = { ...newElement, dataURL: base64URL };
            setElements(prev => prev.map((el, idx) => idx === newIndex ? previewElement : el));

            // Emit base64 preview to students immediately
            if (socket && user?.role === 'teacher') {
                socket.emit('draw-element', { roomId, ...previewElement });
            }

            // Upload to Cloudinary in background
            const formData = new FormData();
            formData.append('image', file);

            try {
                const res = await api.post('/api/images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { url } = res.data;

                // Update element with Cloudinary URL
                const updatedElement = { ...newElement, dataURL: url, uploading: false };
                setElements(prev => prev.map((el, idx) => idx === newIndex ? updatedElement : el));

                if (user?.role === 'teacher') {
                    setHistory(prev => [...prev, { type: 'ADD', element: updatedElement }]);
                }
                setRedoStack([]);

                // Emit to other users with Cloudinary URL
                if (socket) socket.emit('draw-element', { roomId, ...updatedElement });

                // Clean up local URL
                URL.revokeObjectURL(localURL);

            } catch (error) {
                console.error("Upload failed", error);
                alert("Image upload failed");
                // Remove the failed element
                setElements(prev => prev.filter((_, idx) => idx !== newIndex));
                URL.revokeObjectURL(localURL);
            }
        };

        tempImg.src = localURL;
        e.target.value = null;
    };

    const addStickyNote = () => {
        // Select sticky note tool - user will click on canvas to place it
        setTool('sticky');
    }

    const handleZoom = (delta) => {
        setScale(prev => Math.min(Math.max(prev + delta, 0.1), 5));
    }

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    }

    // Touch pan support for mobile
    const touchStartRef = useRef(null);
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            // Two-finger touch for panning
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartRef.current = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2,
                initialPan: { ...panOffset }
            };
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && touchStartRef.current) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentX = (touch1.clientX + touch2.clientX) / 2;
            const currentY = (touch1.clientY + touch2.clientY) / 2;

            const deltaX = (currentX - touchStartRef.current.x) / scale;
            const deltaY = (currentY - touchStartRef.current.y) / scale;

            setPanOffset({
                x: touchStartRef.current.initialPan.x + deltaX,
                y: touchStartRef.current.initialPan.y + deltaY
            });
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = null;
    };

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

                {/* Theme Toggle - Teacher Only */}
                {user?.role === 'teacher' && (
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={() => {
                                const newTheme = !darkMode;
                                setDarkMode(newTheme);
                                // Sync theme to all students
                                if (socket) {
                                    socket.emit('change-theme', { roomId, isDark: newTheme });
                                } else {
                                    console.error('[THEME-SYNC] Socket not available!');
                                }
                            }}
                            className={`p-3 rounded-full shadow-lg transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-gray-50'}`}
                        >
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                    </div>
                )}
            </div>

            {/* Note/Text Editing Overlay */}
            {editingElement && (
                <textarea
                    autoFocus
                    defaultValue={editingElement.text}
                    onBlur={saveNote}
                    onInput={(e) => {
                        const index = editingElement.index;
                        const newText = e.target.value;

                        // Update local state immediately
                        const updated = [...elements];
                        updated[index] = { ...updated[index], text: newText };

                        // For sticky notes: maintain width, but allow height to grow
                        if (editingElement.type === 'sticky') {
                            // Get textarea dimensions to calculate new height
                            e.target.style.height = '0px';
                            const newHeight = Math.max(e.target.scrollHeight, 200 * scale) / scale;
                            updated[index] = { ...updated[index], height: newHeight };
                            e.target.style.height = newHeight * scale + 'px';
                        }

                        setElements(updated);

                        // Emit updates to students (throttled for sticky notes)
                        if (editingElement.type === 'sticky') {
                            const now = Date.now();
                            if (!window.lastStickyNoteUpdate || now - window.lastStickyNoteUpdate >= 30) {
                                window.lastStickyNoteUpdate = now;
                                if (socket) {
                                    socket.emit('update-element', {
                                        roomId,
                                        elementId: updated[index].id,
                                        updates: { text: newText, height: updated[index].height }
                                    });
                                }
                            } else {
                                if (window.stickyNoteUpdateTimeout) {
                                    clearTimeout(window.stickyNoteUpdateTimeout);
                                }
                                window.stickyNoteUpdateTimeout = setTimeout(() => {
                                    window.lastStickyNoteUpdate = Date.now();
                                    if (socket) {
                                        socket.emit('update-element', {
                                            roomId,
                                            elementId: updated[index].id,
                                            updates: { text: newText, height: updated[index].height }
                                        });
                                    }
                                }, 30 - (now - window.lastStickyNoteUpdate));
                            }
                            return; // Skip the text element auto-resize logic below
                        }

                        const isFixed = elements[editingElement.index]?.isFixedWidth;
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
                        width: ((elements[editingElement.index]?.width || editingElement.width || 100)) * scale,
                        height: ((elements[editingElement.index]?.height || editingElement.height || 50)) * scale,
                        backgroundColor: editingElement.type === 'sticky' ? '#fef08a' : 'transparent',
                        color: editingElement.type === 'sticky' ? '#000' : (editingElement.color || color),
                        fontSize: (() => {
                            if (editingElement.type === 'sticky') {
                                // Font size proportional to note width (10% of width)
                                // Multiply by scale to convert to screen pixels
                                const fontSize = (editingElement.width * 0.10) * scale;
                                return fontSize + 'px';
                            }
                            return ((elements[editingElement.index]?.size || 5) * 5) * scale + 'px';
                        })(),
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

            {/* Zoom Controls - Moved to top-right to avoid overlap */}
            <div className="absolute top-20 right-4 sm:right-6 flex items-center gap-2 bg-[#020617] border border-white/10 p-1.5 sm:p-2 rounded-lg shadow-xl z-50">
                <button onClick={() => handleZoom(-0.1)} className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors"><BsZoomOut /></button>
                <span className="text-white font-mono text-xs sm:text-sm w-10 sm:w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors"><BsZoomIn /></button>
            </div>

            <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={(e) => {
                    const { x: offsetX, y: offsetY } = getMousePos(e);
                    // Check for sticky note only
                    for (let i = elements.length - 1; i >= 0; i--) {
                        const el = elements[i];
                        if (el.type === 'sticky' && isWithinElement(offsetX, offsetY, el)) {
                            // Enter Edit Mode (React Way)
                            const initialText = el.text === "Double click to edit..." ? "" : el.text;
                            setEditingElement({
                                index: i,
                                type: el.type,
                                text: initialText,
                                x: el.x,
                                y: el.y,
                                width: el.width,
                                height: el.height,
                                color: el.color
                            });
                            return;
                        }
                    }
                }}
                className="absolute inset-0 z-0 touch-none"
            />

            {/* View Only Badge for Students */}
            {isStudent && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`px-6 py-3 rounded-full backdrop-blur-xl ${hasEditPermission
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-cyan-500/20 border border-cyan-500/30'
                        }`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${hasEditPermission ? 'bg-green-400' : 'bg-cyan-400'
                                }`}></div>
                            <span className={`font-medium text-sm ${hasEditPermission ? 'text-green-400' : 'text-cyan-400'
                                }`}>
                                {hasEditPermission ? 'Editing Enabled' : 'View Only Mode'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Management Panel for Teachers */}
            {user?.role === 'teacher' && (
                <AnimatePresence>
                    {showStudentPanel && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="fixed right-4 top-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-[70vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <FaUsers className="text-blue-400" />
                                        Connected Students
                                    </h3>
                                    <button onClick={() => setShowStudentPanel(false)} className="text-slate-400 hover:text-white transition-colors">
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {connectedUsers.filter(u => u.role === 'student').length === 0 ? (
                                    <div className="text-center text-slate-400 py-8">
                                        No students connected
                                    </div>
                                ) : (
                                    connectedUsers
                                        .filter(u => u.role === 'student')
                                        .map(student => {
                                            const hasPermission = allowedStudents.some(s => s._id === student.userId);

                                            return (
                                                <div
                                                    key={student.userId}
                                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors mb-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                                            {student.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{student.username}</div>
                                                            <div className="text-xs text-slate-400">
                                                                {hasPermission ? 'Can edit' : 'View only'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            if (hasPermission) {
                                                                socket.emit('revoke-student-permission', { roomId, studentId: student.userId });
                                                                setAllowedStudents(prev => prev.filter(s => s._id !== student.userId));
                                                            } else {
                                                                socket.emit('grant-student-permission', { roomId, studentId: student.userId });
                                                                setAllowedStudents(prev => [...prev, { _id: student.userId, username: student.username }]);
                                                            }
                                                        }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasPermission
                                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                            }`}
                                                    >
                                                        {hasPermission ? 'Revoke' : 'Grant'}
                                                    </button>
                                                </div>
                                            );
                                        })
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="p-3 border-t border-white/10 flex gap-2">
                                <button
                                    onClick={() => {
                                        const studentIds = connectedUsers.filter(u => u.role === 'student').map(s => s.userId);
                                        studentIds.forEach(id => {
                                            socket.emit('grant-student-permission', { roomId, studentId: id });
                                        });
                                        const students = connectedUsers.filter(u => u.role === 'student').map(s => ({ _id: s.userId, username: s.username }));
                                        setAllowedStudents(students);
                                    }}
                                    className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                                >
                                    Grant All
                                </button>
                                <button
                                    onClick={() => {
                                        const studentIds = connectedUsers.filter(u => u.role === 'student').map(s => s.userId);
                                        studentIds.forEach(id => {
                                            socket.emit('revoke-student-permission', { roomId, studentId: id });
                                        });
                                        setAllowedStudents([]);
                                    }}
                                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                                >
                                    Revoke All
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Main Toolbar - Hidden for Students unless editing is enabled */}
            {(user?.role === 'teacher' || (user?.role === 'student' && hasEditPermission)) && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 sm:gap-4 max-w-[95vw]">
                    {/* Secondary Actions (Undo, Redo, Clear) */}
                    <div className="flex items-center gap-1 bg-[#0f172a] border border-white/5 rounded-full p-1 sm:p-1.5 shadow-2xl shadow-black/50">
                        {/* Undo/Redo - Teacher Only */}
                        {user?.role === 'teacher' && (
                            <>
                                <button onClick={handleUndo} className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Undo"><FaUndo className="text-sm sm:text-base" /></button>
                                <button onClick={handleRedo} className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="Redo"><FaRedo className="text-sm sm:text-base" /></button>
                            </>
                        )}
                        {user?.role === 'teacher' && (
                            <>
                                <div className="w-px h-3 sm:h-4 bg-white/10 mx-0.5 sm:mx-1"></div>
                                <button onClick={handleClear} className="p-2 sm:p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors" title="Clear All"><FaTrash className="text-sm sm:text-base" /></button>
                                <div className="w-px h-3 sm:h-4 bg-white/10 mx-0.5 sm:mx-1"></div>
                                <button
                                    onClick={() => setShowStudentPanel(!showStudentPanel)}
                                    className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${showStudentPanel
                                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    title="Manage Student Permissions"
                                >
                                    <FaUsers className="text-sm sm:text-base" />
                                    {connectedUsers.filter(u => u.role === 'student').length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                                            {connectedUsers.filter(u => u.role === 'student').length}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Primary Tools Dock */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-[#020617] border border-white/10 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl shadow-black/50 ring-1 ring-white/5 overflow-visible max-w-full">

                        {/* Tools */}
                        <div className="flex items-center gap-0.5 sm:gap-1 bg-[#0f172a] rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-white/5">
                            {[
                                { id: 'pen', icon: FaPen },
                                { id: 'highlighter', icon: FaHighlighter },
                                { id: 'eraser', icon: FaEraser },
                                { id: 'line', icon: FaSlash },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTool(t.id)}
                                    className={`p-2 sm:p-3 rounded-md sm:rounded-lg transition-all duration-200 ${tool === t.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <t.icon className={`text-sm sm:text-base ${t.id === 'line' ? 'transform -rotate-45' : ''}`} />
                                </button>
                            ))}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowShapeMenu(!showShapeMenu);
                                    }}
                                    className={`p-2 sm:p-3 rounded-md sm:rounded-lg transition-all duration-200 ${(tool === 'rect' || tool === 'circle' || tool === 'triangle' || tool === 'pentagon' || tool === 'hexagon' || tool === 'octagon' || tool === 'star')
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    title="Shapes"
                                >
                                    <FaDrawPolygon className="text-sm sm:text-base" />
                                </button>
                                <AnimatePresence>
                                    {showShapeMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-[#0f172a] border border-white/10 rounded-xl p-2 grid grid-cols-4 gap-1 shadow-2xl z-50"
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

                        {/* Quick Insert */}
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            <button onClick={addStickyNote} className="p-2 sm:p-3 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors" title="Add Sticky Note">
                                <FaStickyNote className="text-sm sm:text-base" />
                            </button>
                            <button onClick={() => fileInputRef.current.click()} className="p-2 sm:p-3 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors" title="Upload Image">
                                <FaImage className="text-sm sm:text-base" />
                            </button>
                        </div>

                        {/* Properties */}
                        <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
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
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
                                />
                                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-black/10 pointer-events-none"></div>
                            </div>

                            <div className="flex flex-col gap-1 w-16 sm:w-24">
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
                </div >
            )}
        </div >
    );
};

export default Whiteboard;
