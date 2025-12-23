'use client';

/**
 * Result Canvas - Displays the AI-generated output
 */

import { useEffect, useRef } from 'react';
import styles from './ResultCanvas.module.css';

interface ResultCanvasProps {
    width: number;
    height: number;
    image: string | null;
    isLoading: boolean;
}

export default function ResultCanvas({
    width,
    height,
    image,
    isLoading,
}: ResultCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Draw image when it changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear with light gray
        ctx.fillStyle = '#b4b4b4';
        ctx.fillRect(0, 0, width, height);

        if (image) {
            const img = new window.Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = image.startsWith('data:') ? image : `data:image/png;base64,${image}`;
        }
    }, [image, width, height]);

    return (
        <div className={styles.canvasWrapper}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={styles.canvas}
            />

            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <span>Generating...</span>
                </div>
            )}

            {!image && !isLoading && (
                <div className={styles.placeholder}>
                    <span>AI Output will appear here</span>
                </div>
            )}
        </div>
    );
}
