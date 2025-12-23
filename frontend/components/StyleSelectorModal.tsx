'use client';

/**
 * Style Selector Modal - Visual style selection with Type tabs and Style grid
 * Replaces the dropdown-based selection with a more intuitive modal interface
 */

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './StyleSelectorModal.module.css';
import type { TypeInfo } from '@/lib/types';

interface StyleSelectorModalProps {
    types: TypeInfo[];
    selectedType: number;
    selectedStyle: number;
    onTypeChange: (index: number) => void;
    onStyleChange: (index: number) => void;
    onClose: () => void;
}

export default function StyleSelectorModal({
    types,
    selectedType,
    selectedStyle,
    onTypeChange,
    onStyleChange,
    onClose,
}: StyleSelectorModalProps) {
    const currentType = types[selectedType];
    const currentStyles = currentType?.styles || [];
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [showLeftArrow, setShowLeftArrow] = useState(false);

    // Check if tabs overflow and need navigation arrows
    useEffect(() => {
        const checkOverflow = () => {
            const container = tabsContainerRef.current;
            if (container) {
                const hasOverflow = container.scrollWidth > container.clientWidth;
                setShowRightArrow(hasOverflow && container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
                setShowLeftArrow(container.scrollLeft > 10);
            }
        };
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [types]);

    const handleScroll = () => {
        const container = tabsContainerRef.current;
        if (container) {
            setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
            setShowLeftArrow(container.scrollLeft > 10);
        }
    };

    const scrollTabs = (direction: 'left' | 'right') => {
        const container = tabsContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleStyleSelect = (styleIndex: number) => {
        onStyleChange(styleIndex);
        onClose();
    };

    const handleTypeSelect = (typeIndex: number) => {
        onTypeChange(typeIndex);
        // Reset style to 0 when type changes
        if (typeIndex !== selectedType) {
            onStyleChange(0);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Select Style</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Type Tabs with navigation arrows */}
                <div className={styles.typeTabsWrapper}>
                    {showLeftArrow && (
                        <button
                            className={`${styles.navArrow} ${styles.navArrowLeft}`}
                            onClick={() => scrollTabs('left')}
                        >
                            ‹
                        </button>
                    )}
                    <div
                        className={styles.typeTabs}
                        ref={tabsContainerRef}
                        onScroll={handleScroll}
                    >
                        <span className={styles.typeLabel}>Type</span>
                        {types.map((type, index) => (
                            <button
                                key={type.index}
                                className={`${styles.typeTab} ${index === selectedType ? styles.typeTabActive : ''}`}
                                onClick={() => handleTypeSelect(index)}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>
                    {showRightArrow && (
                        <button
                            className={`${styles.navArrow} ${styles.navArrowRight}`}
                            onClick={() => scrollTabs('right')}
                        >
                            ›
                        </button>
                    )}
                </div>

                {/* Style Grid */}
                <div className={styles.styleGrid}>
                    {currentStyles.map((style, index) => (
                        <div
                            key={style.name}
                            className={`${styles.styleCard} ${index === selectedStyle ? styles.styleCardActive : ''}`}
                            onClick={() => handleStyleSelect(index)}
                        >
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={style.imageUrl}
                                    alt={style.name}
                                    fill
                                    className={styles.styleImage}
                                    unoptimized
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-style.png';
                                    }}
                                />
                            </div>
                            <span className={styles.styleName}>{style.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
