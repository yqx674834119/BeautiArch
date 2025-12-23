/**
 * Static types and styles data - hardcoded from resources/img/AI_ref_images_bo
 * Images are copied to frontend/public/styles/
 */

import type { TypeInfo } from './types';

// Simple prompts for each type (from main.py)
export const SIMPLE_PROMPTS = [
    'A building architectural drawing from a manga',
    'A building architectural render',
    'A building artistic architectural drawing',
    'A city',
    'The cross section of a building',
    'A facade elevation',
    'A floor plan',
    'The drawing of an interior from a manga',
    'The drawing of an interior',
    'Interior architectural render',
    'Isometric building',
    'Isometric cutaway building',
    'Ground plan landscape architect',
];

/**
 * Static types data with all styles from the folders
 */
export const STATIC_TYPES: TypeInfo[] = [
    {
        index: 0,
        name: 'Building Anime',
        category: 'ext',
        styles: [
            { name: 'church_ghibli', prompt: 'A church, big blocky pixels, big blocks, single color, bangladeshi, 2d, flat art', imageUrl: '/styles/building_anime/church_ghibli.png' },
            { name: 'modernhouse_crumb_color', prompt: 'Hand-drawn animation of a office building, weird, surreal', imageUrl: '/styles/building_anime/modernhouse_crumb_color.png' },
            { name: 'oldhouse_ghibli_rain', prompt: 'A bell tower with large bells ringing. Iron doors of houses knocked down. Raining but sun is shining, miyazaki style', imageUrl: '/styles/building_anime/oldhouse_ghibli_rain.png' },
            { name: 'rowhouse_scientific', prompt: 'Row of three houses in detailed comic book art style, blue and red walls, yellow doors, watercolor textures', imageUrl: '/styles/building_anime/rowhouse_scientific_paper.png' },
            { name: 'scifi_slum_blue', prompt: 'Blue cubist skyscraper in a slum in a very flat city', imageUrl: '/styles/building_anime/scifi_slum_blue.png' },
            { name: 'scifi_volcano', prompt: 'Secret penthouse on the side of a volcano, comics style', imageUrl: '/styles/building_anime/scifi_volcano.png' },
            { name: 'scify_flyingpod', prompt: 'A steampunk-style flying city, suspended above cliffside ancient town, drawn in pen and ink in Moebius style', imageUrl: '/styles/building_anime/scify_flyingpod.png' },
            { name: 'skyscrapper_blue', prompt: 'An architectural drawing of a building made with a blue sharpie, in the style of Schuiten', imageUrl: '/styles/building_anime/skyscrapper_blue.png' },
        ],
    },
    {
        index: 1,
        name: 'Building Render',
        category: 'ext',
        styles: [
            { name: 'building_iamblue', prompt: 'Modern building with blue tones', imageUrl: '/styles/building_render/building_iamblue.png' },
            { name: 'building_infrared', prompt: 'Building with infrared reflection', imageUrl: '/styles/building_render/building_infrared_reflection.png' },
            { name: 'building_night', prompt: 'Building at night with traffic', imageUrl: '/styles/building_render/building_night_traffic.png' },
            { name: 'building_orange', prompt: 'Building with orange wavy design', imageUrl: '/styles/building_render/building_orange_wavy.png' },
            { name: 'building_organic', prompt: 'Organic architectural design', imageUrl: '/styles/building_render/building_organic.png' },
        ],
    },
    {
        index: 2,
        name: 'Buildings Art',
        category: 'ext',
        styles: [
            { name: 'autumn_collage', prompt: 'Building in autumn collage style', imageUrl: '/styles/buildings_art/autumn_collage.png' },
            { name: 'blue_pencil', prompt: 'Building in blue pencil sketch', imageUrl: '/styles/buildings_art/blue_pencil.png' },
            { name: 'colorful_collage', prompt: 'Colorful collage building', imageUrl: '/styles/buildings_art/colorful_collage.png' },
            { name: 'concrete_brutalism', prompt: 'Concrete brutalist architecture', imageUrl: '/styles/buildings_art/concrete_brutalism.png' },
            { name: 'geometric_bw', prompt: 'Geometric black and white', imageUrl: '/styles/buildings_art/geometric_black_white.png' },
        ],
    },
    {
        index: 3,
        name: 'Cities',
        category: 'ext',
        styles: [
            { name: 'colorful_city1', prompt: 'Colorful city panorama', imageUrl: '/styles/cities/colorful_city1.png' },
            { name: 'colorful_city2', prompt: 'Colorful city view', imageUrl: '/styles/cities/colorful_city2.png' },
            { name: 'ghibli_fortified', prompt: 'Ghibli style fortified city', imageUrl: '/styles/cities/ghibli_fortified.png' },
            { name: 'greeny_city', prompt: 'Green sustainable city', imageUrl: '/styles/cities/greeny_city.png' },
            { name: 'iso_city', prompt: 'Isometric city view', imageUrl: '/styles/cities/iso_city.png' },
        ],
    },
    {
        index: 4,
        name: 'Cross Sections',
        category: 'int',
        styles: [
            { name: 'cross2', prompt: 'Building cross section', imageUrl: '/styles/cross_sections/cross2.png' },
            { name: 'cross3', prompt: 'Building cross section view', imageUrl: '/styles/cross_sections/cross3.png' },
            { name: 'cross4', prompt: 'Architectural cross section', imageUrl: '/styles/cross_sections/cross4.png' },
            { name: 'cross5', prompt: 'Detailed cross section', imageUrl: '/styles/cross_sections/cross5.png' },
            { name: 'cross10', prompt: 'Modern cross section', imageUrl: '/styles/cross_sections/cross10.png' },
        ],
    },
    {
        index: 5,
        name: 'Facades',
        category: 'ext',
        styles: [
            { name: 'brick_work', prompt: 'Brick facade elevation', imageUrl: '/styles/facades/building_brick_work.png' },
            { name: 'scribbly', prompt: 'Scribbly facade drawing', imageUrl: '/styles/facades/building_scribbly.png' },
            { name: 'terracota', prompt: 'Terracotta facade', imageUrl: '/styles/facades/building_terracota.png' },
            { name: 'wavy_concrete', prompt: 'Wavy concrete facade', imageUrl: '/styles/facades/building_wavy_concrete.png' },
            { name: 'white_on_black', prompt: 'White on black facade', imageUrl: '/styles/facades/building_white_on_black.png' },
        ],
    },
    {
        index: 6,
        name: 'Floor Plans',
        category: 'int',
        styles: [
            { name: 'f_plan1', prompt: 'Floor plan design', imageUrl: '/styles/floor_plans/f_plan1.png' },
            { name: 'f_plan2', prompt: 'Architectural floor plan', imageUrl: '/styles/floor_plans/f_plan2.png' },
            { name: 'f_plan3', prompt: 'Detailed floor plan', imageUrl: '/styles/floor_plans/f_plan3.png' },
            { name: 'f_plan4', prompt: 'Modern floor plan', imageUrl: '/styles/floor_plans/f_plan4.png' },
            { name: 'f_plan5', prompt: 'Clean floor plan', imageUrl: '/styles/floor_plans/f_plan5.png' },
        ],
    },
    {
        index: 7,
        name: 'Interior Anime',
        category: 'int',
        styles: [
            { name: 'bedroom_manga1', prompt: 'Bedroom in manga style', imageUrl: '/styles/interior_anime/bedroom_manga1.png' },
            { name: 'flat_tv', prompt: 'Flat with TV in anime style', imageUrl: '/styles/interior_anime/flat_tv.png' },
            { name: 'kitchen_closeup', prompt: 'Kitchen closeup anime', imageUrl: '/styles/interior_anime/kitchen_closeup.png' },
            { name: 'living_austere', prompt: 'Austere living room anime', imageUrl: '/styles/interior_anime/living_austere.png' },
            { name: 'living_dark_manga', prompt: 'Dark manga living room', imageUrl: '/styles/interior_anime/living_dark_manga.png' },
        ],
    },
    {
        index: 8,
        name: 'Interiors Art',
        category: 'int',
        styles: [
            { name: 'bedroom_van_gogh', prompt: 'Bedroom in Van Gogh style', imageUrl: '/styles/interiors_art/bedroom_van_gogh.png' },
            { name: 'bedroom_yellow', prompt: 'Yellow happiness bedroom', imageUrl: '/styles/interiors_art/bedroom_yellow_happiness.png' },
            { name: 'kitchen_colorful', prompt: 'Colorful kitchen art', imageUrl: '/styles/interiors_art/kitchen_colorful.png' },
            { name: 'kitchen_medieval', prompt: 'Medieval dark kitchen', imageUrl: '/styles/interiors_art/kitchen_medieval_dark.png' },
            { name: 'living_watercolor', prompt: 'Calm watercolor living room', imageUrl: '/styles/interiors_art/living_calm_watercolor.png' },
        ],
    },
    {
        index: 9,
        name: 'Interiors Render',
        category: 'int',
        styles: [
            { name: 'bedroom_pixar', prompt: 'Light Pixar style bedroom', imageUrl: '/styles/interiors_render/bedroom_light_pixar.png' },
            { name: 'bedroom_map', prompt: 'Bedroom with map theme', imageUrl: '/styles/interiors_render/bedroom_map.png' },
            { name: 'bedroom_supercolors', prompt: 'Super colorful bedroom', imageUrl: '/styles/interiors_render/bedroom_supercolors.png' },
            { name: 'flat_modern_wood', prompt: 'Modern wood flat', imageUrl: '/styles/interiors_render/flat_modern_wood.png' },
            { name: 'kitchen_concrete', prompt: 'Concrete kitchen render', imageUrl: '/styles/interiors_render/kitchen_concrete.png' },
        ],
    },
    {
        index: 10,
        name: 'Isometric Buildings',
        category: 'ext',
        styles: [
            { name: 'clay_castle', prompt: 'Clay castle isometric', imageUrl: '/styles/iso_buildings/clay_castle.png' },
            { name: 'clean_church', prompt: 'Clean isometric church', imageUrl: '/styles/iso_buildings/clean_church.png' },
            { name: 'corner_house', prompt: 'Corner house isometric', imageUrl: '/styles/iso_buildings/corner_house.png' },
            { name: 'heatmap', prompt: 'Heatmap isometric building', imageUrl: '/styles/iso_buildings/heatmap.png' },
            { name: 'maquette_white', prompt: 'White maquette model', imageUrl: '/styles/iso_buildings/maquette_white.png' },
        ],
    },
    {
        index: 11,
        name: 'Isometric Cutaway',
        category: 'ext',
        styles: [
            { name: 'autumn_style', prompt: 'Autumn style cutaway', imageUrl: '/styles/iso_cutaway/autumn_style.png' },
            { name: 'clean_render', prompt: 'Clean render cutaway', imageUrl: '/styles/iso_cutaway/clean_render.png' },
            { name: 'clean_sketch', prompt: 'Clean sketch cutaway', imageUrl: '/styles/iso_cutaway/clean_sketch.png' },
            { name: 'concrete_labyrinth', prompt: 'Concrete labyrinth', imageUrl: '/styles/iso_cutaway/concrete_labyrinth.png' },
            { name: 'cosy_night', prompt: 'Cosy night cutaway', imageUrl: '/styles/iso_cutaway/cosy_night.png' },
        ],
    },
    {
        index: 12,
        name: 'Sites / Landscape',
        category: 'ext',
        styles: [
            { name: 'site1', prompt: 'Site plan landscape', imageUrl: '/styles/sites/site1.png' },
            { name: 'site2', prompt: 'Landscape site plan', imageUrl: '/styles/sites/site2.png' },
            { name: 'site3', prompt: 'Ground plan site', imageUrl: '/styles/sites/site3.png' },
            { name: 'site4', prompt: 'Site planning view', imageUrl: '/styles/sites/site4.png' },
            { name: 'site10', prompt: 'Modern site plan', imageUrl: '/styles/sites/site10.png' },
        ],
    },
];

/**
 * Get types - returns static data
 */
export function getStaticTypes(): TypeInfo[] {
    return STATIC_TYPES;
}

/**
 * Get simple prompt for type index
 */
export function getSimplePrompt(typeIndex: number): string {
    return SIMPLE_PROMPTS[typeIndex] || SIMPLE_PROMPTS[0];
}
