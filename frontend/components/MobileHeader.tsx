'use client';

/**
 * MobileHeader Component
 * Top navigation bar for mobile devices
 * Contains: hamburger menu, title, and camera/import button
 */

import Image from 'next/image';
import styles from './MobileHeader.module.css';

interface MobileHeaderProps {
    onMenuOpen: () => void;
    onImportImage: () => void;
}

export default function MobileHeader({
    onMenuOpen,
    onImportImage,
}: MobileHeaderProps) {
    return (
        <header className={styles.header}>
            {/* Hamburger Menu Button */}
            <button
                className={styles.menuButton}
                onClick={onMenuOpen}
                aria-label="Open menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Title */}
            <h1 className={styles.title}>LivableCity AI</h1>

            {/* Camera/Import Button */}
            <button
                className={styles.cameraButton}
                onClick={onImportImage}
                aria-label="Import image"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
            </button>
        </header>
    );
}
