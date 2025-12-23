'use client';

/**
 * Left toolbar component with simplified drawing tools
 * Only essential buttons as requested
 */

import Image from 'next/image';
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

// Simplified tool list as requested
interface ToolItem {
    id: string;
    icon: string;
    label: string;
    tool?: DrawingTool;
    action?: string;
}

const tools: ToolItem[] = [
    // Drawing tools
    { id: 'pencil', icon: 'pencil.png', label: 'Pencil', tool: 'pencil' },
    { id: 'spray', icon: 'brush_color.png', label: 'Segment\nBrush', tool: 'airbrush' },
    { id: 'eraser', icon: 'eraser.png', label: 'Eraser', tool: 'eraser' },
    // Action buttons
    { id: 'reset', icon: 'mop.png', label: 'Start Again', action: 'reset' },
    { id: 'import', icon: 'image.png', label: 'Import', action: 'import' },
    { id: 'export', icon: 'save.png', label: 'Export', action: 'export' },
];

export default function Toolbar({
    currentTool,
    brushColor,
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
                            <Image
                                src={`/icons/${item.icon}`}
                                alt={item.label}
                                width={24}
                                height={24}
                                className={styles.icon}
                            />
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
                            <Image
                                src={`/icons/${item.icon}`}
                                alt={item.label}
                                width={24}
                                height={24}
                                className={styles.icon}
                            />
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}
