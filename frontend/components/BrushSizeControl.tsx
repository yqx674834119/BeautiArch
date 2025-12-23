'use client';

/**
 * Brush Size Control Component
 * Positioned in the bottom-left of the Viewer/canvas area
 * Larger dots for better visibility + integrated Color button for Segment Brush
 */

import Image from 'next/image';
import styles from './BrushSizeControl.module.css';
import type { DrawingTool } from '@/lib/types';

interface BrushSizeControlProps {
    currentTool: DrawingTool;
    brushSize: number;
    brushColor: string;
    onBrushSizeChange: (size: number) => void;
    onColorPalette: () => void;
}

// Predefined brush sizes represented by dots
const BRUSH_SIZES = [2, 5, 10, 18, 28, 40, 50];

// Tool icons mapping
const TOOL_ICONS: Record<string, string> = {
    pencil: 'pencil.png',
    airbrush: 'brush_color.png',
    eraser: 'eraser.png',
};

export default function BrushSizeControl({
    currentTool,
    brushSize,
    brushColor,
    onBrushSizeChange,
    onColorPalette,
}: BrushSizeControlProps) {
    // Only show for drawing tools
    if (!['pencil', 'airbrush', 'eraser'].includes(currentTool)) {
        return null;
    }

    // Get the closest size in the predefined list
    const getClosestSizeIndex = () => {
        let closest = 0;
        let minDiff = Math.abs(BRUSH_SIZES[0] - brushSize);
        for (let i = 1; i < BRUSH_SIZES.length; i++) {
            const diff = Math.abs(BRUSH_SIZES[i] - brushSize);
            if (diff < minDiff) {
                minDiff = diff;
                closest = i;
            }
        }
        return closest;
    };

    const activeIndex = getClosestSizeIndex();
    const isSegmentBrush = currentTool === 'airbrush';

    return (
        <div className={styles.container}>
            {/* Size section */}
            <div className={styles.sizeSection}>
                <div className={styles.sizeHeader}>
                    <span className={styles.thicknessLabel}>size</span>
                    <span className={styles.sizeValue}>{brushSize}px</span>
                </div>

            </div>

            {/* Dots row */}
            <div className={styles.dotsSection}>
                <div className={styles.toolIcon}>
                    <Image
                        src={`/icons/${TOOL_ICONS[currentTool] || 'pencil.png'}`}
                        alt={currentTool}
                        width={20}
                        height={20}
                    />
                </div>

                <div className={styles.dotsContainer}>
                    {BRUSH_SIZES.map((size, index) => {
                        const isActive = index === activeIndex;
                        // Larger dots: 6px to 18px
                        const dotSize = 6 + (index * 2);

                        return (
                            <button
                                key={size}
                                className={`${styles.dot} ${isActive ? styles.active : ''}`}
                                onClick={() => onBrushSizeChange(size)}
                                title={`${size}px`}
                                style={{
                                    width: dotSize,
                                    height: dotSize,
                                    backgroundColor: isActive
                                        ? (isSegmentBrush ? brushColor : '#2757d3')
                                        : '#9ca3af',
                                }}
                            />
                        );
                    })}
                    <span className={styles.plusIcon}>+</span>
                </div>
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Color section - shows for Segment Brush */}
            {isSegmentBrush ? (
                <div className={styles.colorSection} onClick={onColorPalette}>
                    <div
                        className={styles.colorSwatch}
                        style={{ backgroundColor: brushColor }}
                    />
                    {/* <span className={styles.colorLabel}>Color</span> */}
                </div>
            ) : (
                <div className={styles.colorPlaceholder} />
            )}
        </div>
    );
}
