'use client';

/**
 * Image Import Modal - Matches Qt import_image() dialog
 * Allows user to choose how to import an uploaded image:
 * - As support for drawing (50% opacity background)
 * - For lines layer (edge detection)
 * - For segmentation layer (semantic segmentation)
 * - For both layers
 */

import { useState } from 'react';
import styles from './ImageImportModal.module.css';

export type ImportMode = 'support' | 'lines' | 'segment' | 'both';

interface ImageImportModalProps {
    imageDataUrl: string;
    lineMethod: number;
    onLineMethodChange: (method: number) => void;
    onImport: (mode: ImportMode) => void;
    onCancel: () => void;
}

const IMPORT_MODES = [
    {
        id: 'support' as ImportMode,
        title: 'As support for drawing',
        description: 'Display image at 50% opacity as reference background',
        icon: '🖼️',
    },
    {
        id: 'lines' as ImportMode,
        title: 'For lines layer',
        description: 'Convert to line drawing using edge detection',
        icon: '✏️',
    },
    {
        id: 'segment' as ImportMode,
        title: 'For segmentation layer',
        description: 'Convert to semantic color segmentation',
        icon: '🎨',
    },
    {
        id: 'both' as ImportMode,
        title: 'For segmentation and line layers',
        description: 'Apply both line extraction and segmentation',
        icon: '⚡',
    },
];

const LINE_METHODS = [
    { id: 0, name: 'Sobel Custom' },
    { id: 2, name: 'Canny + L2' },
    { id: 6, name: 'HED (AI)' },
    { id: 7, name: 'Lineart (AI)' },
    { id: 9, name: 'PiDiNet (AI)' },
];

export default function ImageImportModal({
    imageDataUrl,
    lineMethod,
    onLineMethodChange,
    onImport,
    onCancel,
}: ImageImportModalProps) {
    const [selectedMethod, setSelectedMethod] = useState(lineMethod);

    const handleMethodChange = (method: number) => {
        setSelectedMethod(method);
        onLineMethodChange(method);
    };

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Import Image</h2>
                    <button className={styles.closeButton} onClick={onCancel}>
                        ×
                    </button>
                </div>

                <div className={styles.preview}>
                    <img
                        src={imageDataUrl}
                        alt="Preview"
                        className={styles.previewImage}
                    />
                </div>

                <div className={styles.content}>
                    <p className={styles.question}>How would you like to import this image?</p>

                    <div className={styles.options}>
                        {IMPORT_MODES.map((mode) => (
                            <button
                                key={mode.id}
                                className={styles.optionButton}
                                onClick={() => onImport(mode.id)}
                            >
                                <span className={styles.optionIcon}>{mode.icon}</span>
                                <div className={styles.optionText}>
                                    <span className={styles.optionTitle}>{mode.title}</span>
                                    <span className={styles.optionDesc}>{mode.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Line method selector (visible for lines/both modes) */}
                    <div className={styles.methodSelector}>
                        <label className={styles.label}>Line detection method:</label>
                        <select
                            className={styles.select}
                            value={selectedMethod}
                            onChange={(e) => handleMethodChange(Number(e.target.value))}
                        >
                            {LINE_METHODS.map((method) => (
                                <option key={method.id} value={method.id}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
