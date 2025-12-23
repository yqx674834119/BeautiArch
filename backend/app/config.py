"""
Configuration settings for the ScribbleArchitect backend.
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # BeautiArch root
RESOURCES_DIR = BASE_DIR / "resources"
AI_REF_IMAGES_DIR = RESOURCES_DIR / "img" / "AI_ref_images_bo"
ICONS_DIR = RESOURCES_DIR / "img" / "icon"

# Model cache path
CACHE_PATH = os.path.join(os.path.expanduser("~"), ".cache", "scribble_architect")

# Image dimensions (matching Qt app)
IMG_W = 1024
IMG_H = 768
HD_RES = 2048

# Default generation parameters
DEFAULT_STEPS = 8
DEFAULT_CFG = 1.5
DEFAULT_IP_STRENGTH = 0.8
DEFAULT_CN_STRENGTH = 0.8
DEFAULT_SEED = 62

# Category types for interior/exterior
CAT_TYPE = ['ext', 'ext', 'ext', 'ext', 'int', 'ext', 'int', 'int', 'int', 'int', 'ext', 'ext']

# Simple prompts for each type
SIMPLE_PROMPTS = [
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
    'Ground plan landscape architect'
]

# Example prompts for generating examples
EXAMPLE_PROMPTS = [
    'black and white coloring book illustration of a building, white background, lineart, inkscape, simple lines',
    'black and white coloring book illustration of a building, white background, lineart, inkscape, simple lines',
    'black and white coloring book illustration of a building, white background, lineart, inkscape, simple lines',
    'black and white coloring book illustration of a city, white background, lineart, inkscape, simple lines',
    'cross section of a building, children coloring book, white background, lineart, inkscape, simple lines',
    'a building facade in a children coloring book, coloring page, lineart, white background',
    'coloring page of a simple floor plan, lineart, orthographic, CAD',
    'coloring page of an interior, line art, white background',
    'coloring page of an interior, line art, white background',
    'coloring page of an interior, line art, white background',
    'isometric building in a coloring book, line art, white background, simplistic',
    'a site map, black and white, coloring book drawing, line art',
    'some architectural drawing'
]
