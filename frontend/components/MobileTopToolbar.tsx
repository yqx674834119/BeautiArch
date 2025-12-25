'use client';

/**
 * MobileTopToolbar Component
 * Toolbar below header with brush controls and Generate button
 * Uses inline SVG icons for better scalability
 */

import styles from './MobileTopToolbar.module.css';
import type { DrawingTool } from '@/lib/types';

interface MobileTopToolbarProps {
    currentTool: DrawingTool;
    brushSize: number;
    brushColor: string;
    onBrushSizeChange: (size: number) => void;
    viewerLayout: 'split' | 'curtain';
    onLayoutChange: (layout: 'split' | 'curtain') => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

const BRUSH_SIZES = [5, 10, 18, 28, 40];

// SVG Tool Icons
const ToolIcons: Record<string, React.ReactNode> = {
    pencil: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    ),
    airbrush: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
        </svg>
    ),
    eraser: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
            <path d="M22 21H7" />
            <path d="m5 11 9 9" />
        </svg>
    ),
};

export default function MobileTopToolbar({
    currentTool,
    brushSize,
    brushColor,
    onBrushSizeChange,
    viewerLayout,
    onLayoutChange,
    onGenerate,
    isGenerating,
}: MobileTopToolbarProps) {
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
            {/* Tool icon */}
            <div className={styles.toolIcon}>
                {ToolIcons[currentTool] || ToolIcons.pencil}
            </div>

            {/* Size dots */}
            <div className={styles.dotsContainer}>
                {BRUSH_SIZES.map((size, index) => {
                    const isActive = index === activeIndex;
                    const dotSize = 8 + (index * 2);

                    return (
                        <button
                            key={size}
                            className={`${styles.dot} ${isActive ? styles.active : ''}`}
                            onClick={() => onBrushSizeChange(size)}
                            aria-label={`${size}px`}
                            style={{
                                width: dotSize,
                                height: dotSize,
                                backgroundColor: isActive
                                    ? (isSegmentBrush ? brushColor : '#2563eb')
                                    : '#9ca3af',
                            }}
                        />
                    );
                })}
            </div>

            {/* Size label */}
            <span className={styles.sizeLabel}>{brushSize}px</span>

            {/* Layout toggle */}
            <button
                className={`${styles.iconButton} ${viewerLayout === 'curtain' ? styles.active : ''}`}
                onClick={() => onLayoutChange(viewerLayout === 'split' ? 'curtain' : 'split')}
                aria-label={viewerLayout === 'split' ? 'Switch to curtain' : 'Switch to split'}
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

            {/* Generate Button */}
            <button
                className={styles.generateButton}
                onClick={onGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <div className={styles.spinner} />
                        <span>...</span>
                    </>
                ) : (
                    <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                        </svg>
                        <span>Generate</span>
                    </>
                )}
            </button>
        </div>
    );
}
