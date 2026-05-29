import React, { useEffect, useRef } from 'react';

const MinimapRadar = ({ elements, scale, panOffset, setPanOffset, darkMode }) => {
    const canvasRef = useRef(null);
    
    // Canvas ka width 240 aur height 135 (Perfect 16:9 aspect ratio)
    const width = 240;
    const height = 135;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        const viewX = -panOffset.x;
        const viewY = -panOffset.y;
        const viewW = window.innerWidth / scale;
        const viewH = window.innerHeight / scale;

        if (elements.length === 0) {
            minX = viewX; 
            minY = viewY;
            maxX = viewX + viewW;
            maxY = viewY + viewH;
        } else {
            elements.forEach(el => {
                if (el.x !== undefined && el.y !== undefined) {
                    minX = Math.min(minX, el.x);
                    minY = Math.min(minY, el.y);
                    maxX = Math.max(maxX, el.x + (el.width || 0));
                    maxY = Math.max(maxY, el.y + (el.height || 0));
                }
            });
            minX = Math.min(minX, viewX);
            minY = Math.min(minY, viewY);
            maxX = Math.max(maxX, viewX + viewW);
            maxY = Math.max(maxY, viewY + viewH);
        }

        const padding = 0;
        minX -= padding; minY -= padding;
        maxX += padding; maxY += padding;

        const boardWidth = maxX - minX;
        const boardHeight = maxY - minY;

        const scaleX = width / boardWidth;
        const scaleY = height / boardHeight;
        const mapScale = Math.min(scaleX, scaleY);

        const offsetX = (width - boardWidth * mapScale) / 2;
        const offsetY = (height - boardHeight * mapScale) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(mapScale, mapScale);
        ctx.translate(-minX, -minY);

        // Draw miniature versions of elements
// Draw miniature versions of elements
        elements.forEach(el => {
            // 🌟 ADDED 'eraser' TO THE CONDITION 🌟
            if (el.type === 'pen' || el.type === 'line' || el.type === 'highlighter' || el.type === 'eraser') {
                if (el.points && el.points.length > 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(el.points[0].x, el.points[0].y);
                    el.points.forEach(p => ctx.lineTo(p.x, p.y));
                    
                    if (el.type === 'eraser') {
                        // ERASER LOGIC: Pixels delete karne ke liye
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.strokeStyle = 'rgba(0,0,0,1)';
                        ctx.lineWidth = el.size || 5; 
                    } else {
                        // NORMAL PEN LOGIC
                        ctx.globalCompositeOperation = 'source-over';
                        let strokeColor = el.color;
                        if (!strokeColor || strokeColor === '#ffffff' || strokeColor === '#000000' || strokeColor === '#cbd5e1') {
                            strokeColor = darkMode ? '#ffffff' : '#000000';
                        }
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = Math.max(0.5, 1 / mapScale); 
                    }
                    
                    ctx.stroke();
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = el.type === 'sticky' ? '#fef08a' : (el.color || (darkMode ? '#ffffff' : '#000000'));
                ctx.fillRect(el.x, el.y, el.width || 50, el.height || 50);
            }
        });

        // Draw Viewport Indicator (Blue Box)
        ctx.strokeStyle = '#3b82f6'; 
        ctx.lineWidth = 1.5 / mapScale; 
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'; 
        ctx.fillRect(viewX, viewY, viewW, viewH);
        ctx.strokeRect(viewX, viewY, viewW, viewH);

        ctx.restore();

        canvas.mapData = { minX, minY, mapScale, offsetX, offsetY };
    }, [elements, scale, panOffset, darkMode]);

    const handleMapClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.mapData) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const { minX, minY, mapScale, offsetX, offsetY } = canvas.mapData;

        const worldX = (clickX - offsetX) / mapScale + minX;
        const worldY = (clickY - offsetY) / mapScale + minY;

        const viewW = window.innerWidth / scale;
        const viewH = window.innerHeight / scale;

        setPanOffset({
            x: -(worldX - viewW / 2),
            y: -(worldY - viewH / 2)
        });
    };

    return (
        <div className={`absolute bottom-24 right-4 sm:right-6 w-[240px] flex flex-col border rounded-xl shadow-2xl z-50 overflow-hidden cursor-crosshair backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
            
            {/* Header Area */}
            <div className={`w-full px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider border-b z-10 ${darkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                RADAR MINIMAP
            </div>

            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={handleMapClick}
                className="block w-full"
            />
            
        </div>
    );
};

export default MinimapRadar;