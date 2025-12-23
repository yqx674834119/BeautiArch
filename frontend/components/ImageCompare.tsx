'use client';

/**
 * ImageCompare Component
 * Curtain/slider comparison - Generated image overlays sketch
 * Draggable vertical divider reveals/hides the generated result
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './ImageCompare.module.css';

interface ImageCompareProps {
    sketchContent: React.ReactNode;   // Drawing canvas (base layer)
    resultContent: React.ReactNode;   // Result canvas (overlay layer)
    hasResult: boolean;               // Whether there's a generated result
}

export default function ImageCompare({
    sketchContent,
    resultContent,
    hasResult,
}: ImageCompareProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dividerPosition, setDividerPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setDividerPosition(Math.max(0, Math.min(100, percentage)));
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTouchStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const touch = e.touches[0];
        const rect = containerRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setDividerPosition(Math.max(0, Math.min(100, percentage)));
    }, [isDragging]);

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

    // If no result, just show the sketch without curtain
    if (!hasResult) {
        return (
            <div className={styles.container}>
                <div className={styles.fullPane}>
                    {sketchContent}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={styles.container}
        >
            {/* Sketch layer (base - full size) */}
            <div className={styles.baseLayer}>
                {sketchContent}
                <span className={styles.label} style={{ left: 12 }}>Sketch</span>
            </div>

            {/* Result layer (overlay - clipped from right) */}
            <div
                className={styles.overlayLayer}
                style={{
                    clipPath: `inset(0 0 0 ${dividerPosition}%)`,
                }}
            >
                {resultContent}
                <span className={styles.label} style={{ right: 12 }}>Generated</span>
            </div>

            {/* Draggable divider */}
            <div
                className={`${styles.divider} ${isDragging ? styles.dragging : ''}`}
                style={{ left: `${dividerPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className={styles.dividerHandle}>
                    <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                        <path d="M4 8L0 12L4 16M8 8L12 12L8 16" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
