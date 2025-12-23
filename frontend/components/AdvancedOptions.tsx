'use client';

/**
 * Advanced Options panel - Model, Sliders, and Line Processing tabs
 */

import { useState } from 'react';
import styles from './AdvancedOptions.module.css';

interface AdvancedOptionsProps {
    // Model tab
    seed: number;
    prompt: string;
    negativePrompt: string;
    useSimplePrompts: boolean;
    keepPrompt: boolean;
    onSeedChange: (seed: number) => void;
    onPromptChange: (prompt: string) => void;
    onNegativePromptChange: (prompt: string) => void;
    onUseSimplePromptsChange: (use: boolean) => void;
    onKeepPromptChange: (keep: boolean) => void;

    // Sliders tab
    steps: number;
    cfg: number;
    ipStrength: number;
    cnStrengthLine: number;
    cnStrengthSeg: number;
    eta: number;
    onStepsChange: (steps: number) => void;
    onCfgChange: (cfg: number) => void;
    onIpStrengthChange: (strength: number) => void;
    onCnStrengthLineChange: (strength: number) => void;
    onCnStrengthSegChange: (strength: number) => void;
    onEtaChange: (eta: number) => void;

    // Line processing tab
    lineProcessingType: number;
    onLineProcessingChange: (type: number) => void;
}

const LINE_METHODS = [
    'Sobel Custom',
    'Canny',
    'Canny + L2',
    'Canny + BIL',
    'Canny + Blur',
    'RF Custom',
];

export default function AdvancedOptions({
    seed,
    prompt,
    negativePrompt,
    useSimplePrompts,
    keepPrompt,
    onSeedChange,
    onPromptChange,
    onNegativePromptChange,
    onUseSimplePromptsChange,
    onKeepPromptChange,
    steps,
    cfg,
    ipStrength,
    cnStrengthLine,
    cnStrengthSeg,
    eta,
    onStepsChange,
    onCfgChange,
    onIpStrengthChange,
    onCnStrengthLineChange,
    onCnStrengthSegChange,
    onEtaChange,
    lineProcessingType,
    onLineProcessingChange,
}: AdvancedOptionsProps) {
    const [activeTab, setActiveTab] = useState<'model' | 'sliders' | 'line'>('sliders');

    return (
        <div className={styles.panel}>
            <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>Advanced Options</span>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'model' ? styles.active : ''}`}
                    onClick={() => setActiveTab('model')}
                >
                    Model
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'sliders' ? styles.active : ''}`}
                    onClick={() => setActiveTab('sliders')}
                >
                    Sliders
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'line' ? styles.active : ''}`}
                    onClick={() => setActiveTab('line')}
                >
                    Line p...
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {/* Model Tab */}
                {activeTab === 'model' && (
                    <div className={styles.tabPane}>
                        <div className={styles.field}>
                            <label className={styles.label}>Seed</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={seed}
                                onChange={(e) => onSeedChange(Number(e.target.value))}
                                min={0}
                                max={9999}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Prompt</label>
                            <textarea
                                className={styles.textarea}
                                value={prompt}
                                onChange={(e) => onPromptChange(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Negative prompt</label>
                            <textarea
                                className={styles.textarea}
                                value={negativePrompt}
                                onChange={(e) => onNegativePromptChange(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={useSimplePrompts}
                                    onChange={(e) => onUseSimplePromptsChange(e.target.checked)}
                                />
                                <span>Use super simple prompts</span>
                            </label>

                            <label className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    checked={keepPrompt}
                                    onChange={(e) => onKeepPromptChange(e.target.checked)}
                                />
                                <span>Keep prompt</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Sliders Tab */}
                {activeTab === 'sliders' && (
                    <div className={styles.tabPane}>
                        <div className={styles.sliderField}>
                            <label className={styles.sliderLabel}>
                                Steps
                                <span className={styles.sliderValue}>{steps}</span>
                            </label>
                            <input
                                type="range"
                                className={styles.slider}
                                value={steps}
                                onChange={(e) => onStepsChange(Number(e.target.value))}
                                min={2}
                                max={12}
                                step={1}
                            />
                        </div>

                        <div className={styles.sliderField}>
                            <label className={styles.sliderLabel}>
                                Cfg
                                <span className={styles.sliderValue}>{cfg.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                className={styles.slider}
                                value={cfg * 10}
                                onChange={(e) => onCfgChange(Number(e.target.value) / 10)}
                                min={1}
                                max={30}
                                step={1}
                            />
                        </div>

                        <div className={styles.sliderField}>
                            <label className={styles.sliderLabel}>
                                IP strength
                                <span className={styles.sliderValue}>{(ipStrength * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                className={styles.slider}
                                value={ipStrength * 100}
                                onChange={(e) => onIpStrengthChange(Number(e.target.value) / 100)}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className={styles.sliderField}>
                            <label className={styles.sliderLabel}>
                                CN strength line
                                <span className={styles.sliderValue}>{(cnStrengthLine * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                className={styles.slider}
                                value={cnStrengthLine * 100}
                                onChange={(e) => onCnStrengthLineChange(Number(e.target.value) / 100)}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className={styles.sliderField}>
                            <label className={styles.sliderLabel}>
                                CN strength segmentation
                                <span className={styles.sliderValue}>{(cnStrengthSeg * 100).toFixed(0)}%</span>
                            </label>
                            <input
                                type="range"
                                className={styles.slider}
                                value={cnStrengthSeg * 100}
                                onChange={(e) => onCnStrengthSegChange(Number(e.target.value) / 100)}
                                min={1}
                                max={100}
                                step={1}
                            />
                        </div>
                    </div>
                )}

                {/* Line Processing Tab */}
                {activeTab === 'line' && (
                    <div className={styles.tabPane}>
                        <div className={styles.field}>
                            <label className={styles.label}>Processing type</label>
                            <select
                                className={styles.select}
                                value={lineProcessingType}
                                onChange={(e) => onLineProcessingChange(Number(e.target.value))}
                            >
                                {LINE_METHODS.map((method, index) => (
                                    <option key={method} value={index}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
