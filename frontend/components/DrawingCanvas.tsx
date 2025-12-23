'use client';

/**
 * Drawing Canvas component
 * Implements dual-layer drawing (line layer + color layer) similar to Qt Canvas
 * Uses useImperativeHandle for proper ref method exposure
 */

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import styles from './DrawingCanvas.module.css';
import type { DrawingTool } from '@/lib/types';

interface DrawingCanvasProps {
    width: number;
    height: number;
    tool: DrawingTool;
    brushSize: number;
    color: string;
    onDrawingEnd: () => void;
    onCanvasChange: (lineData: string, colorData: string) => void;
    isLoading?: boolean;
}

// Exposed methods interface
export interface DrawingCanvasHandle {
    clearCanvas: () => void;
    setLineImage: (src: string) => void;
    setColorImage: (src: string) => void;
    setSupportImage: (src: string) => void;
    getCanvasData: () => { lineImage: string; colorImage: string };
}

// Tool colors
const TOOL_COLORS: Record<DrawingTool, string> = {
    pencil: '#2d2d2d',
    brush: '#000000',
    eraser: '#ffffff',
    airbrush: '#783c3c',
    bezier: '#000000',
};

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas(
    { width, height, tool, brushSize, color, onDrawingEnd, onCanvasChange, isLoading = false },
    ref
) {
    const lineCanvasRef = useRef<HTMLCanvasElement>(null);
    const colorCanvasRef = useRef<HTMLCanvasElement>(null);
    const displayCanvasRef = useRef<HTMLCanvasElement>(null);
    const supportImageRef = useRef<HTMLImageElement | null>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [showCursor, setShowCursor] = useState(false);

    // Get the active layer based on tool
    const getActiveCanvas = useCallback(() => {
        // Airbrush draws on color layer, others on line layer
        return tool === 'airbrush' ? colorCanvasRef.current : lineCanvasRef.current;
    }, [tool]);

    // Get current drawing color
    const getCurrentColor = useCallback(() => {
        if (tool === 'airbrush') {
            return color;
        }
        if (tool === 'eraser') {
            return '#ffffff';
        }
        return TOOL_COLORS[tool] || '#000000';
    }, [tool, color]);

    // Composite layers onto display canvas
    const compositeCanvases = useCallback(() => {
        const displayCanvas = displayCanvasRef.current;
        const lineCanvas = lineCanvasRef.current;
        const colorCanvas = colorCanvasRef.current;

        if (!displayCanvas || !lineCanvas || !colorCanvas) return;

        const ctx = displayCanvas.getContext('2d');
        if (!ctx) return;

        // Clear display canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw support image first (if any)
        if (supportImageRef.current) {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(supportImageRef.current, 0, 0, width, height);
            ctx.globalAlpha = 1.0;
        }

        // Draw color layer
        ctx.drawImage(colorCanvas, 0, 0);

        // Draw line layer with multiply blend mode
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(lineCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
    }, [width, height]);

    // Initialize canvases
    useEffect(() => {
        const lineCanvas = lineCanvasRef.current;
        const colorCanvas = colorCanvasRef.current;

        if (!lineCanvas || !colorCanvas) return;

        const lineCtx = lineCanvas.getContext('2d');
        const colorCtx = colorCanvas.getContext('2d');

        if (lineCtx) {
            lineCtx.fillStyle = '#ffffff';
            lineCtx.fillRect(0, 0, width, height);
        }

        if (colorCtx) {
            colorCtx.clearRect(0, 0, width, height);
        }

        compositeCanvases();
    }, [width, height, compositeCanvases]);

    // Notify parent of canvas data
    const notifyCanvasChange = useCallback(() => {
        const lineCanvas = lineCanvasRef.current;
        const colorCanvas = colorCanvasRef.current;
        if (lineCanvas && colorCanvas) {
            onCanvasChange(
                lineCanvas.toDataURL('image/png'),
                colorCanvas.toDataURL('image/png')
            );
        }
    }, [onCanvasChange]);

    // Clear both canvases
    const clearCanvas = useCallback(() => {
        const lineCanvas = lineCanvasRef.current;
        const colorCanvas = colorCanvasRef.current;

        if (lineCanvas) {
            const ctx = lineCanvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
            }
        }

        if (colorCanvas) {
            const ctx = colorCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, width, height);
            }
        }

        supportImageRef.current = null;
        compositeCanvases();
        notifyCanvasChange();
    }, [width, height, compositeCanvases, notifyCanvasChange]);

    // Set image on line layer
    const setLineImage = useCallback((imageSrc: string) => {
        const lineCanvas = lineCanvasRef.current;
        if (!lineCanvas) return;

        const ctx = lineCanvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            compositeCanvases();
            notifyCanvasChange();
        };
        img.onerror = (e) => {
            console.error('Failed to load line image:', e);
        };
        img.src = imageSrc;
    }, [width, height, compositeCanvases, notifyCanvasChange]);

    // Set image on color layer
    const setColorImage = useCallback((imageSrc: string) => {
        const colorCanvas = colorCanvasRef.current;
        if (!colorCanvas) return;

        const ctx = colorCanvas.getContext('2d');
        if (!ctx) return;

        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            compositeCanvases();
            notifyCanvasChange();
        };
        img.onerror = (e) => {
            console.error('Failed to load color image:', e);
        };
        img.src = imageSrc;
    }, [width, height, compositeCanvases, notifyCanvasChange]);

    // Set support image (reference background)
    const setSupportImage = useCallback((imageSrc: string) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            supportImageRef.current = img;
            compositeCanvases();
        };
        img.onerror = (e) => {
            console.error('Failed to load support image:', e);
        };
        img.src = imageSrc;
    }, [compositeCanvases]);

    // Get canvas data
    const getCanvasData = useCallback(() => {
        const lineCanvas = lineCanvasRef.current;
        const colorCanvas = colorCanvasRef.current;
        return {
            lineImage: lineCanvas?.toDataURL('image/png') || '',
            colorImage: colorCanvas?.toDataURL('image/png') || '',
        };
    }, []);

    // Expose methods via ref using useImperativeHandle
    useImperativeHandle(ref, () => ({
        clearCanvas,
        setLineImage,
        setColorImage,
        setSupportImage,
        getCanvasData,
    }), [clearCanvas, setLineImage, setColorImage, setSupportImage, getCanvasData]);

    // Get point from event
    const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = displayCanvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;

        let clientX: number, clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, [width, height]);

    // Draw a line segment
    const drawLine = useCallback(
        (from: { x: number; y: number }, to: { x: number; y: number }) => {
            const canvas = getActiveCanvas();
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);

            ctx.strokeStyle = getCurrentColor();
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.stroke();

            compositeCanvases();
        },
        [getActiveCanvas, getCurrentColor, brushSize, compositeCanvases]
    );

    // Handle mouse/touch down
    const handleStart = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            const point = getPoint(e);
            if (!point) return;

            setIsDrawing(true);
            setLastPoint(point);

            // Draw a dot at the start point
            const canvas = getActiveCanvas();
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
                    ctx.fillStyle = getCurrentColor();
                    ctx.fill();
                    compositeCanvases();
                }
            }
        },
        [getPoint, getActiveCanvas, brushSize, getCurrentColor, compositeCanvases]
    );

    // Handle mouse/touch move
    const handleMove = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (!isDrawing || !lastPoint) return;

            const point = getPoint(e);
            if (!point) return;

            drawLine(lastPoint, point);
            setLastPoint(point);
        },
        [isDrawing, lastPoint, getPoint, drawLine]
    );

    // Handle mouse/touch end
    const handleEnd = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            setLastPoint(null);
            notifyCanvasChange();
            onDrawingEnd();
        }
    }, [isDrawing, onDrawingEnd, notifyCanvasChange]);

    return (
        <div className={styles.canvasWrapper}>
            {/* Hidden line layer */}
            <canvas
                ref={lineCanvasRef}
                width={width}
                height={height}
                className={styles.hiddenCanvas}
            />

            {/* Hidden color layer */}
            <canvas
                ref={colorCanvasRef}
                width={width}
                height={height}
                className={styles.hiddenCanvas}
            />

            {/* Visible display canvas */}
            <canvas
                ref={displayCanvasRef}
                width={width}
                height={height}
                className={styles.displayCanvas}
                onMouseDown={handleStart}
                onMouseMove={(e) => {
                    handleMove(e);
                    // Update cursor position
                    const rect = displayCanvasRef.current?.getBoundingClientRect();
                    if (rect) {
                        setCursorPos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                        });
                    }
                }}
                onMouseUp={handleEnd}
                onMouseLeave={() => {
                    handleEnd();
                    setShowCursor(false);
                }}
                onMouseEnter={() => setShowCursor(true)}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
            />

            {/* Brush info */}
            <div className={styles.brushInfo}>
                {tool === 'airbrush' ? 'Segm. Brush' : tool} • {brushSize}px
            </div>

            {/* Custom brush cursor */}
            {showCursor && cursorPos && (
                <div
                    className={styles.customCursor}
                    style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        width: brushSize,
                        height: brushSize,
                        backgroundColor: tool === 'eraser'
                            ? 'rgba(255, 255, 255, 0.5)'
                            : tool === 'airbrush'
                                ? color
                                : '#2d2d2d',
                        borderColor: tool === 'eraser' ? '#666' : 'white',
                    }}
                />
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <span>Processing...</span>
                </div>
            )}
        </div>
    );
});

export default DrawingCanvas;
