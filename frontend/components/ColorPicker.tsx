'use client';

/**
 * Color Picker component for segmentation brush
 * Matches Qt ColorDialog with category-based colors
 */

import styles from './ColorPicker.module.css';
import Image from 'next/image';

interface ColorOption {
    name: string;
    color: string;
    rgb: number[];
}

interface ColorPickerProps {
    colors: ColorOption[];
    currentColor: string;
    onSelect: (color: string) => void;
    onClose: () => void;
    category: 'int' | 'ext';
}

// Interior colors - matching Qt in_categories.csv
const INTERIOR_COLORS: ColorOption[] = [
    { name: 'wall', color: '#784131', rgb: [120, 65, 49] },
    { name: 'floor', color: '#9c9c9c', rgb: [156, 156, 156] },
    { name: 'ceiling', color: '#f4f4f4', rgb: [244, 244, 244] },
    { name: 'bed', color: '#6464c8', rgb: [100, 100, 200] },
    { name: 'window', color: '#be8c3c', rgb: [190, 140, 60] },
    { name: 'door', color: '#dc78dc', rgb: [220, 120, 220] },
    { name: 'table', color: '#a0a028', rgb: [160, 160, 40] },
    { name: 'chair', color: '#508cc8', rgb: [80, 140, 200] },
    { name: 'sofa', color: '#287850', rgb: [40, 120, 80] },
    { name: 'plant', color: '#14aa50', rgb: [20, 170, 80] },
    { name: 'curtain', color: '#dc8264', rgb: [220, 130, 100] },
    { name: 'lamp', color: '#e6e632', rgb: [230, 230, 50] },
    { name: 'tv', color: '#323232', rgb: [50, 50, 50] },
    { name: 'desk', color: '#8b4513', rgb: [139, 69, 19] },
    { name: 'carpet', color: '#8b0000', rgb: [139, 0, 0] },
    { name: 'shelves', color: '#a0522d', rgb: [160, 82, 45] },
    { name: 'shower', color: '#add8e6', rgb: [173, 216, 230] },
    { name: 'faucet', color: '#c0c0c0', rgb: [192, 192, 192] },
    { name: 'oven', color: '#2f4f4f', rgb: [47, 79, 79] },
    { name: 'radiator', color: '#ffffff', rgb: [255, 255, 255] },
    { name: 'dresser', color: '#deb887', rgb: [222, 184, 135] },
    { name: 'stairs', color: '#8b7355', rgb: [139, 115, 85] },
    { name: 'clock', color: '#ffd700', rgb: [255, 215, 0] },
    { name: 'wallart', color: '#ff69b4', rgb: [255, 105, 180] },
];

// Exterior colors - matching Qt out_categories.csv
const EXTERIOR_COLORS: ColorOption[] = [
    { name: 'sky', color: '#4682b4', rgb: [70, 130, 180] },
    { name: 'building', color: '#8b4513', rgb: [139, 69, 19] },
    { name: 'road', color: '#808080', rgb: [128, 128, 128] },
    { name: 'grass', color: '#228b22', rgb: [34, 139, 34] },
    { name: 'tree', color: '#006400', rgb: [0, 100, 0] },
    { name: 'water', color: '#1e90ff', rgb: [30, 144, 255] },
    { name: 'plant', color: '#14aa50', rgb: [20, 170, 80] },
    { name: 'wall', color: '#784131', rgb: [120, 65, 49] },
    { name: 'window', color: '#be8c3c', rgb: [190, 140, 60] },
    { name: 'door', color: '#dc78dc', rgb: [220, 120, 220] },
    { name: 'balcony', color: '#cd853f', rgb: [205, 133, 63] },
    { name: 'people', color: '#ffa07a', rgb: [255, 160, 122] },
];

export default function ColorPicker({
    currentColor,
    onSelect,
    onClose,
    category,
}: ColorPickerProps) {
    const colors = category === 'int' ? INTERIOR_COLORS : EXTERIOR_COLORS;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Select a Color</h3>
                    <span className={styles.category}>
                        {category === 'int' ? 'Interior' : 'Exterior'}
                    </span>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.grid}>
                    {colors.map((option) => (
                        <button
                            key={option.name}
                            className={`${styles.colorButton} ${currentColor === option.color ? styles.active : ''}`}
                            onClick={() => onSelect(option.color)}
                            title={option.name}
                        >
                            <div className={styles.iconWrapper}>
                                <Image
                                    src={`/SkeletonSkin/icons/cat_${option.name}.png`}
                                    alt={option.name}
                                    width={40}
                                    height={40}
                                    className={styles.icon}
                                    onError={(e) => {
                                        // Hide icon if not found, show color swatch instead
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                            <div
                                className={styles.colorSwatch}
                                style={{ backgroundColor: option.color }}
                            />
                            <span className={styles.colorName}>{option.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
