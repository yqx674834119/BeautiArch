/**
 * API route to dynamically load types and styles from public/styles folder
 * This allows adding/removing styles by just modifying the folder contents
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TypeInfo, StyleInfo } from '@/lib/types';

// Type metadata - maps folder names to display names and categories
const TYPE_METADATA: Record<string, { name: string; category: 'int' | 'ext' }> = {
    'building_anime': { name: 'Building Anime', category: 'ext' },
    'building_render': { name: 'Building Render', category: 'ext' },
    'buildings_art': { name: 'Buildings Art', category: 'ext' },
    'cities': { name: 'Cities', category: 'ext' },
    'cross_sections': { name: 'Cross Sections', category: 'int' },
    'facades': { name: 'Facades', category: 'ext' },
    'floor_plans': { name: 'Floor Plans', category: 'int' },
    'interior_anime': { name: 'Interior Anime', category: 'int' },
    'interiors_art': { name: 'Interiors Art', category: 'int' },
    'interiors_render': { name: 'Interiors Render', category: 'int' },
    'iso_buildings': { name: 'Isometric Buildings', category: 'ext' },
    'iso_cutaway': { name: 'Isometric Cutaway', category: 'ext' },
    'sites': { name: 'Sites / Landscape', category: 'ext' },
};

// Order of types (for consistent display)
const TYPE_ORDER = [
    'building_anime',
    'building_render',
    'buildings_art',
    'cities',
    'cross_sections',
    'facades',
    'floor_plans',
    'interior_anime',
    'interiors_art',
    'interiors_render',
    'iso_buildings',
    'iso_cutaway',
    'sites',
];

export async function GET() {
    try {
        const stylesDir = path.join(process.cwd(), 'public', 'styles');
        const types: TypeInfo[] = [];

        // Read all type folders in order
        for (let index = 0; index < TYPE_ORDER.length; index++) {
            const folderName = TYPE_ORDER[index];
            const folderPath = path.join(stylesDir, folderName);

            // Skip if folder doesn't exist
            if (!fs.existsSync(folderPath)) {
                continue;
            }

            const metadata = TYPE_METADATA[folderName];
            if (!metadata) continue;

            // Read all files in the type folder
            const files = fs.readdirSync(folderPath);
            const styles: StyleInfo[] = [];

            // Process each PNG file
            for (const file of files) {
                if (!file.endsWith('.png')) continue;

                const styleName = file.replace('.png', '');
                const txtFile = path.join(folderPath, `${styleName}.txt`);

                // Read prompt from txt file if exists
                let prompt = styleName.replace(/_/g, ' ');
                if (fs.existsSync(txtFile)) {
                    prompt = fs.readFileSync(txtFile, 'utf-8').trim();
                }

                styles.push({
                    name: styleName,
                    prompt: prompt,
                    imageUrl: `/styles/${folderName}/${file}`,
                });
            }

            // Sort styles alphabetically
            styles.sort((a, b) => a.name.localeCompare(b.name));

            types.push({
                index: types.length,
                name: metadata.name,
                category: metadata.category,
                styles: styles,
            });
        }

        return NextResponse.json({ types });
    } catch (error) {
        console.error('Error loading styles:', error);
        return NextResponse.json(
            { error: 'Failed to load styles', types: [] },
            { status: 500 }
        );
    }
}
