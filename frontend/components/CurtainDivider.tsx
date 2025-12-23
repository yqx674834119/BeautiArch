'use client';

/**
 * CurtainDivider Component
 * Controlled draggable divider for curtain comparison mode
 * Position is 0-100% relative to the canvas, not the parent container
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './CurtainDivider.module.css';

interface CurtainDividerProps {
    position: number;           // Current position (0-100 percentage of canvas width)
    onPositionChange: (pos: number) => void;  // Callback when position changes
}

export default function CurtainDivider({ position, onPositionChange }: CurtainDividerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [canvasOffset, setCanvasOffset] = useState({ left: 0, width: 0 });

    // Calculate canvas offset on mount and resize
    useEffect(() => {
        const updateCanvasOffset = () => {
            if (!containerRef.current) return;
            const parent = containerRef.current.parentElement;
            if (!parent) return;

            const canvasWrapper = parent.querySelector('[class*="canvasWrapper"]');
            if (!canvasWrapper) return;

            const parentRect = parent.getBoundingClientRect();
            const canvasRect = canvasWrapper.getBoundingClientRect();

            setCanvasOffset({
                left: canvasRect.left - parentRect.left,
                width: canvasRect.width,
            });
        };

        updateCanvasOffset();
        window.addEventListener('resize', updateCanvasOffset);
        return () => window.removeEventListener('resize', updateCanvasOffset);
    }, []);

    // Convert canvas-relative position (0-100%) to parent-relative position (pixels)
    const getParentPosition = () => {
        return canvasOffset.left + (position / 100) * canvasOffset.width;
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const parent = containerRef.current.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const canvasWrapper = parent.querySelector('[class*="canvasWrapper"]');
        if (!canvasWrapper) return;

        const canvasRect = canvasWrapper.getBoundingClientRect();

        // Calculate mouse X relative to canvas
        const mouseX = e.clientX;
        const canvasRelativeX = mouseX - canvasRect.left;

        // Convert to percentage (0-100)
        const percentage = (canvasRelativeX / canvasRect.width) * 100;

        // Clamp to 0-100
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        onPositionChange(clampedPercentage);

        // Update canvas offset
        setCanvasOffset({
            left: canvasRect.left - parentRect.left,
            width: canvasRect.width,
        });
    }, [isDragging, onPositionChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const parent = containerRef.current.parentElement;
        if (!parent) return;

        const touch = e.touches[0];
        const parentRect = parent.getBoundingClientRect();
        const canvasWrapper = parent.querySelector('[class*="canvasWrapper"]');
        if (!canvasWrapper) return;

        const canvasRect = canvasWrapper.getBoundingClientRect();

        const canvasRelativeX = touch.clientX - canvasRect.left;
        const percentage = (canvasRelativeX / canvasRect.width) * 100;
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        onPositionChange(clampedPercentage);

        setCanvasOffset({
            left: canvasRect.left - parentRect.left,
            width: canvasRect.width,
        });
    }, [isDragging, onPositionChange]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

    // Calculate the actual left position in pixels for the divider
    const dividerLeft = getParentPosition();

    return (
        <div
            ref={containerRef}
            className={`${styles.divider} ${isDragging ? styles.dragging : ''}`}
            style={{ left: `${dividerLeft}px` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className={styles.handle}>
                <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                    <path d="M4 8L0 12L4 16M8 8L12 12L8 16" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            </div>
        </div>
    );
}
