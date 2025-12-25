'use client';

/**
 * Left toolbar component with simplified drawing tools
 * Using inline SVG icons for better scalability and performance
 */

import styles from './Toolbar.module.css';
import type { DrawingTool } from '@/lib/types';

interface ToolbarProps {
    currentTool: DrawingTool;
    brushColor: string;
    onToolChange: (tool: DrawingTool) => void;
    onColorPalette: () => void;
    onImportImage: () => void;
    onExport: () => void;
    onReset: () => void;
}

// SVG Icon Components
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
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
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
    // Drawing tools
    { id: 'pencil', icon: <PencilIcon />, label: 'Pencil', tool: 'pencil' },
    { id: 'spray', icon: <SegmentBrushIcon />, label: 'Segment\nBrush', tool: 'airbrush' },
    { id: 'eraser', icon: <EraserIcon />, label: 'Eraser', tool: 'eraser' },
    // Action buttons
    { id: 'reset', icon: <ResetIcon />, label: 'Start Again', action: 'reset' },
    { id: 'import', icon: <ImportIcon />, label: 'Import', action: 'import' },
    { id: 'export', icon: <ExportIcon />, label: 'Export', action: 'export' },
];

export default function Toolbar({
    currentTool,
    onToolChange,
    onColorPalette,
    onImportImage,
    onExport,
    onReset,
}: ToolbarProps) {
    const handleClick = (item: ToolItem) => {
        if (item.tool) {
            onToolChange(item.tool);
            // Auto-open color picker for airbrush
            if (item.tool === 'airbrush') {
                setTimeout(() => onColorPalette(), 100);
            }
        } else if (item.action) {
            switch (item.action) {
                case 'palette':
                    onColorPalette();
                    break;
                case 'import':
                    onImportImage();
                    break;
                case 'export':
                    onExport();
                    break;
                case 'reset':
                    onReset();
                    break;
            }
        }
    };

    const isActive = (item: ToolItem) => {
        return item.tool && currentTool === item.tool;
    };

    // Split into drawing tools and action tools
    const drawingTools = tools.filter(t => ['pencil', 'spray', 'eraser'].includes(t.id));
    const actionTools = tools.filter(t => ['reset', 'import', 'export'].includes(t.id));

    return (
        <aside className={styles.toolbar}>
            <div className={styles.toolList}>
                {/* Drawing tools */}
                {drawingTools.map((item) => (
                    <button
                        key={item.id}
                        className={`${styles.toolButton} ${isActive(item) ? styles.active : ''}`}
                        onClick={() => handleClick(item)}
                        title={item.label}
                    >
                        <div className={styles.iconWrapper}>
                            {item.icon}
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </button>
                ))}

                <div className={styles.separator} />

                {/* Action tools */}
                {actionTools.map((item) => (
                    <button
                        key={item.id}
                        className={styles.toolButton}
                        onClick={() => handleClick(item)}
                        title={item.label}
                    >
                        <div className={styles.iconWrapper}>
                            {item.icon}
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}
