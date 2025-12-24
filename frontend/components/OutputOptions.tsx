'use client';

/**
 * Output Options panel - Type/Style selection, prompt input, and reference image upload
 * Supports both preset styles and custom style via ref image + prompt
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './OutputOptions.module.css';
import StyleSelectorModal from './StyleSelectorModal';
import type { TypeInfo, StyleInfo } from '@/lib/types';

interface OutputOptionsProps {
    types: TypeInfo[];
    selectedType: number;
    selectedStyle: number;
    prompt: string;
    customRefImage: string | null;
    liveUpdate: boolean;
    upscale: boolean;
    upscaleResolution: number;
    hideInputZone: boolean;
    floatingDraw: boolean;
    isGenerating: boolean;
    isUpscaling: boolean;           // New: upscaling in progress
    hasGeneratedImage: boolean;     // New: whether an image has been generated
    onTypeChange: (index: number) => void;
    onStyleChange: (index: number) => void;
    onPromptChange: (prompt: string) => void;
    onCustomRefImageChange: (image: string | null) => void;
    onLiveUpdateChange: (enabled: boolean) => void;
    onUpscaleChange: (enabled: boolean) => void;
    onUpscaleResolutionChange: (res: number) => void;
    onUpscale: () => void;          // New: trigger upscale action
    onHideInputChange: (hidden: boolean) => void;
    onFloatingDrawChange: (enabled: boolean) => void;
    onUpdateOutput: () => void;
}

// Info tooltips for each checkbox
const TOOLTIPS = {
    liveUpdate: 'Automatically regenerate the output whenever you stop drawing. Higher GPU usage but instant feedback.',
    upscale: 'Upscale the generated image to a higher resolution using AI.',
    floatingDraw: 'Detach the drawing canvas into a separate window for more flexibility.',
    hideInput: 'Hide the input drawing zone to focus only on the generated result.',
    styleRef: 'Upload a reference image to guide the style of the generation.',
};

// Info button component
function InfoButton({ tooltip }: { tooltip: string }) {
    return (
        <span className={styles.infoButton} title={tooltip}>
            ⓘ
        </span>
    );
}

export default function OutputOptions({
    types,
    selectedType,
    selectedStyle,
    prompt,
    customRefImage,
    liveUpdate,
    upscale,
    upscaleResolution,
    hideInputZone,
    floatingDraw,
    isGenerating,
    isUpscaling,
    hasGeneratedImage,
    onTypeChange,
    onStyleChange,
    onPromptChange,
    onCustomRefImageChange,
    onLiveUpdateChange,
    onUpscaleChange,
    onUpscaleResolutionChange,
    onUpscale,
    onHideInputChange,
    onFloatingDrawChange,
    onUpdateOutput,
}: OutputOptionsProps) {
    const [currentStyles, setCurrentStyles] = useState<StyleInfo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const refImageInputRef = useRef<HTMLInputElement>(null);

    // Update styles when type changes
    useEffect(() => {
        if (types[selectedType]) {
            setCurrentStyles(types[selectedType].styles);
            // Reset style selection when type changes
            if (selectedStyle >= types[selectedType].styles.length) {
                onStyleChange(0);
            }
        }
    }, [types, selectedType, selectedStyle, onStyleChange]);

    const currentType = types[selectedType];
    const currentStyleInfo = currentStyles[selectedStyle];

    // Handle reference image upload
    const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onCustomRefImageChange(dataUrl);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // Clear custom ref image
    const handleClearRefImage = () => {
        onCustomRefImageChange(null);
    };

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Output Options</span>
            </div>

            {/* Style Header */}
            <h3 className={styles.sectionTitle}>Style</h3>

            {/* Clickable Style Preview Card */}
            <div className={styles.stylePreviewCard} onClick={() => setIsModalOpen(true)}>
                {(currentStyleInfo || customRefImage) ? (
                    <>
                        <div className={styles.previewImageWrapper}>
                            <Image
                                src={customRefImage || currentStyleInfo.imageUrl}
                                alt={customRefImage ? "Custom Reference" : currentStyleInfo.name}
                                width={100}
                                height={75}
                                className={styles.previewImage}
                                unoptimized
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                        </div>
                        <div className={styles.previewInfo}>
                            <span
                                className={styles.categoryBadge}
                                style={customRefImage ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : undefined}
                            >
                                {customRefImage ? 'CUSTOM' : (currentType?.category === 'int' ? 'INTERIOR' : 'EXTERIOR')}
                            </span>
                            <span className={styles.clickHint}>
                                {customRefImage ? 'Using custom reference' : 'Click to select style'}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className={styles.previewPlaceholder}>
                        <span>Click to select style</span>
                    </div>
                )}
            </div>

            {/* Style Selector Modal */}
            {isModalOpen && (
                <StyleSelectorModal
                    types={types}
                    selectedType={selectedType}
                    selectedStyle={selectedStyle}
                    onTypeChange={onTypeChange}
                    onStyleChange={onStyleChange}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Prompt Input Section */}
            <div className={styles.promptSection}>
                <label className={styles.sectionTitle}>Prompt</label>
                <textarea
                    className={styles.promptTextarea}
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder="Describe the style you want..."
                    rows={4}
                />
            </div>

            {/* Style Reference (Single Line) */}
            <div className={styles.refRow}>
                <div className={styles.refLabelGroup}>
                    <label className={styles.sectionLabel} style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reference</label>
                    <InfoButton tooltip={TOOLTIPS.styleRef} />
                </div>

                <div className={styles.refControl}>
                    {customRefImage ? (
                        <div className={styles.refStatusMini}>
                            <span className={styles.refStatusIcon}>✓</span>
                            <button
                                className={styles.clearRefButtonSimple}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearRefImage();
                                }}
                                title="Remove reference"
                            >
                                Clear
                            </button>
                        </div>
                    ) : (
                        <button
                            className={styles.uploadButtonMini}
                            onClick={() => refImageInputRef.current?.click()}
                        >
                            <span className={styles.uploadArrow}>↑</span>
                        </button>
                    )}
                </div>
                <input
                    ref={refImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleRefImageUpload}
                />
            </div>

            {/* Action Button */}
            <div className={styles.buttonGroup}>
                <button
                    className={`${styles.button} ${styles.primary}`}
                    onClick={onUpdateOutput}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <span className={styles.spinner} />
                            Generating...
                        </>
                    ) : (
                        'Generate'
                    )}
                </button>
            </div>

            {/* Live Update (Toggle Style) */}
            <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Live update</span>
                <label className={styles.toggleSwitch}>
                    <input
                        type="checkbox"
                        checked={liveUpdate}
                        onChange={(e) => onLiveUpdateChange(e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

            {/* Upscaling Section - Button Style */}
            <div className={styles.upscaleSection}>
                {!upscale ? (
                    <button
                        className={`${styles.button} ${styles.upscaleButtonMain}`}
                        onClick={() => onUpscaleChange(true)}
                        disabled={!hasGeneratedImage || isUpscaling}
                        title={hasGeneratedImage ? 'Upscale the generated image' : 'Generate an image first'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                        Upscale
                    </button>
                ) : (
                    <div className={styles.upscaleExpanded}>
                        <div className={styles.upscaleHeader}>
                            <span className={styles.upscaleTitle}>Upscale Settings</span>
                            <button
                                className={styles.upscaleCloseBtn}
                                onClick={() => onUpscaleChange(false)}
                                title="Cancel"
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.rangeGroup}>
                            <div className={styles.rangeHeader}>
                                <span>Resolution</span>
                                <span>{upscaleResolution}px</span>
                            </div>
                            <input
                                type="range"
                                min="1024"
                                max="4096"
                                step="64"
                                value={upscaleResolution}
                                className={styles.rangeInput}
                                onChange={(e) => onUpscaleResolutionChange(Number(e.target.value))}
                            />
                        </div>
                        <button
                            className={`${styles.button} ${styles.primary}`}
                            onClick={onUpscale}
                            disabled={isUpscaling}
                        >
                            {isUpscaling ? (
                                <>
                                    <span className={styles.spinner} />
                                    Upscaling...
                                </>
                            ) : (
                                'Upscale Now'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
