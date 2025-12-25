'use client';

/**
 * MobileBottomBar Component
 * Fixed bottom bar for mobile devices
 * Contains: action buttons, prompt input, style preview card, and tool icons
 */

import Image from 'next/image';
import styles from './MobileBottomBar.module.css';
import type { DrawingTool, TypeInfo, StyleInfo } from '@/lib/types';

interface MobileBottomBarProps {
    // Tool state
    currentTool: DrawingTool;
    onToolChange: (tool: DrawingTool) => void;

    // Prompt state
    prompt: string;
    onPromptChange: (value: string) => void;

    // Style state
    types: TypeInfo[];
    selectedType: number;
    selectedStyle: number;
    onOpenStyleSelector: () => void;

    // Feature toggles
    liveUpdate: boolean;
    onLiveUpdateChange: (value: boolean) => void;
    customRefImage: string | null;
    onImportRefImage: () => void;
    upscale: boolean;
    onUpscaleChange: (value: boolean) => void;
    hasGeneratedImage: boolean;

    // Actions
    onReset: () => void;
    onImportImage: () => void;
    onExport: () => void;
    onColorPalette: () => void;
}

// SVG Tool Icons
const PencilIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
    </svg>
);

const SegmentBrushIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
);

const EraserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
    </svg>
);

const ResetIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const ImportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);

const ExportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// Tool configuration with SVG icons
interface ToolItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    tool?: DrawingTool;
    action?: string;
}

const tools: ToolItem[] = [
    { id: 'pencil', icon: <PencilIcon />, label: 'Pencil', tool: 'pencil' },
    { id: 'spray', icon: <SegmentBrushIcon />, label: 'Segment Brush', tool: 'airbrush' },
    { id: 'eraser', icon: <EraserIcon />, label: 'Eraser', tool: 'eraser' },
    { id: 'reset', icon: <ResetIcon />, label: 'Clear', action: 'reset' },
    { id: 'import', icon: <ImportIcon />, label: 'Import', action: 'import' },
    { id: 'export', icon: <ExportIcon />, label: 'Export', action: 'export' },
];

export default function MobileBottomBar({
    currentTool,
    onToolChange,
    prompt,
    onPromptChange,
    types,
    selectedType,
    selectedStyle,
    onOpenStyleSelector,
    liveUpdate,
    onLiveUpdateChange,
    customRefImage,
    onImportRefImage,
    upscale,
    onUpscaleChange,
    hasGeneratedImage,
    onReset,
    onImportImage,
    onExport,
    onColorPalette,
}: MobileBottomBarProps) {
    const currentType = types[selectedType];
    const currentStyleInfo: StyleInfo | undefined = currentType?.styles[selectedStyle];

    const handleToolClick = (item: ToolItem) => {
        if (item.tool) {
            onToolChange(item.tool);
            // Auto-open color picker for airbrush
            if (item.tool === 'airbrush') {
                setTimeout(() => onColorPalette(), 100);
            }
        } else if (item.action) {
            switch (item.action) {
                case 'reset':
                    onReset();
                    break;
                case 'import':
                    onImportImage();
                    break;
                case 'export':
                    onExport();
                    break;
            }
        }
    };

    const isActive = (item: ToolItem) => {
        return item.tool && currentTool === item.tool;
    };

    return (
        <div className={styles.bottomBar}>
            {/* Action Row: Live Update, Reference, Upscale */}
            <div className={styles.actionRow}>
                {/* Live Update Toggle */}
                <button
                    className={`${styles.actionButton} ${liveUpdate ? styles.actionActive : ''}`}
                    onClick={() => onLiveUpdateChange(!liveUpdate)}
                    aria-label="Live update"
                >
                    <span className={styles.actionLabel}>Live update</span>
                </button>

                {/* Reference Button */}
                <button
                    className={`${styles.actionButton} ${customRefImage ? styles.actionActive : ''}`}
                    onClick={onImportRefImage}
                    aria-label="Reference"
                >
                    <span className={styles.actionLabel}>Reference</span>
                    {customRefImage ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </button>

                {/* Upscale Toggle */}
                <button
                    className={`${styles.actionButton} ${upscale ? styles.actionActive : ''} ${!hasGeneratedImage ? styles.actionDisabled : ''}`}
                    onClick={() => hasGeneratedImage && onUpscaleChange(!upscale)}
                    disabled={!hasGeneratedImage}
                    aria-label="Upscale"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                    <span className={styles.actionLabel}>Upscale</span>
                </button>
            </div>

            {/* Top Row: Prompt + Style Preview */}
            <div className={styles.topRow}>
                <div className={styles.promptWrapper}>
                    <textarea
                        className={styles.promptInput}
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Describe your design..."
                        rows={2}
                    />
                </div>

                <button
                    className={`${styles.styleCard} ${customRefImage ? styles.styleCardCustom : ''}`}
                    onClick={onOpenStyleSelector}
                    aria-label="Select style"
                >
                    {(customRefImage || currentStyleInfo?.imageUrl) ? (
                        <Image
                            src={customRefImage || currentStyleInfo?.imageUrl || ''}
                            alt={customRefImage ? 'Custom Reference' : currentStyleInfo?.name || ''}
                            width={64}
                            height={64}
                            className={styles.styleImage}
                            unoptimized
                        />
                    ) : (
                        <div className={styles.stylePlaceholder}>
                            <span>?</span>
                        </div>
                    )}
                    <span className={styles.styleName}>
                        {customRefImage ? 'Custom' : (currentStyleInfo?.name || 'Select')}
                    </span>
                </button>
            </div>

            {/* Bottom Row: Tool Icons */}
            <div className={styles.toolRow}>
                {tools.map((item) => (
                    <button
                        key={item.id}
                        className={`${styles.toolButton} ${isActive(item) ? styles.active : ''}`}
                        onClick={() => handleToolClick(item)}
                        aria-label={item.label}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}
