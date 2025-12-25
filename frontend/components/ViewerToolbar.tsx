'use client';

/**
 * ViewerToolbar Component
 * Floating toolbar in top-left of viewer area
 * Contains: BrushSize control, layout toggle, and space for future buttons
 */

import Image from 'next/image';
import styles from './ViewerToolbar.module.css';
import type { DrawingTool } from '@/lib/types';

interface ViewerToolbarProps {
    // Brush controls
    currentTool: DrawingTool;
    brushSize: number;
    brushColor: string;
    onBrushSizeChange: (size: number) => void;
    onColorPalette: () => void;
    // Layout controls
    viewerLayout: 'split' | 'curtain';
    onLayoutChange: (layout: 'split' | 'curtain') => void;
    // Actions
    onGenerate: () => void;
    isGenerating: boolean;
}

const BRUSH_SIZES = [5, 10, 18, 28, 40, 50];

const TOOL_ICONS: Record<string, string> = {
    pencil: 'pencil.png',
    airbrush: 'brush_color.png',
    eraser: 'eraser.png',
};

export default function ViewerToolbar({
    currentTool,
    brushSize,
    brushColor,
    onBrushSizeChange,
    onColorPalette,
    viewerLayout,
    onLayoutChange,
    onGenerate,
    isGenerating,
}: ViewerToolbarProps) {
    const isDrawingTool = ['pencil', 'airbrush', 'eraser'].includes(currentTool);
    const isSegmentBrush = currentTool === 'airbrush';

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

    return (
        <div className={styles.toolbar}>
            {/* Brush Size Section - only for drawing tools */}
            {isDrawingTool && (
                <>
                    <div className={styles.section}>
                        {/* Tool icon */}
                        <div className={styles.toolIcon}>
                            <Image
                                src={`/icons/${TOOL_ICONS[currentTool] || 'pencil.png'}`}
                                alt={currentTool}
                                width={18}
                                height={18}
                            />
                        </div>

                        {/* Size dots */}
                        <div className={styles.dotsContainer}>
                            {BRUSH_SIZES.map((size, index) => {
                                const isActive = index === activeIndex;
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
                        </div>

                        {/* Size label */}
                        <span className={styles.sizeLabel}>{brushSize}px</span>
                    </div>

                    {/* Color button - only for Segment Brush */}
                    {isSegmentBrush && (
                        <>
                            <div className={styles.divider} />
                            <button
                                className={styles.colorButton}
                                onClick={onColorPalette}
                                title="选择颜色"
                            >
                                <div
                                    className={styles.colorSwatch}
                                    style={{ backgroundColor: brushColor }}
                                />
                            </button>
                        </>
                    )}

                    <div className={styles.divider} />
                </>
            )}

            {/* Layout Toggle */}
            <button
                className={`${styles.iconButton} ${viewerLayout === 'curtain' ? styles.active : ''}`}
                onClick={() => onLayoutChange(viewerLayout === 'split' ? 'curtain' : 'split')}
                title={viewerLayout === 'split' ? 'Switch to curtain' : 'Switch to split'}
            >
                {viewerLayout === 'split' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="3" x2="12" y2="21" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="4 2" />
                        <polygon points="10,10 14,12 10,14" fill="currentColor" />
                    </svg>
                )}
            </button>

            <div className={styles.divider} />

            {/* Generate Button */}
            <button
                className={styles.generateButton}
                onClick={onGenerate}
                disabled={isGenerating}
                title="Generate Image"
            >
                {isGenerating ? (
                    <>
                        <div className={styles.spinner} />
                        <span className={styles.generateLabel}>Generating...</span>
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                        </svg>
                        <span className={styles.generateLabel}>Generate</span>
                    </>
                )}
            </button>
        </div>
    );
}
