"""
HuggingFace Line Detection Service
Uses controlnet_aux preprocessors for AI-based line extraction
"""

import logging
from typing import Optional
from PIL import Image
import numpy as np

logger = logging.getLogger(__name__)

# Lazy-loaded detectors to avoid loading models at startup
_hed_detector = None
_lineart_detector = None
_lineart_coarse_detector = None
_pidinet_detector = None


def get_hed_detector():
    """Get or create HED detector (lazy loading)"""
    global _hed_detector
    if _hed_detector is None:
        logger.info("Loading HED detector...")
        from controlnet_aux import HEDdetector
        _hed_detector = HEDdetector.from_pretrained("lllyasviel/Annotators")
        logger.info("HED detector loaded")
    return _hed_detector


def get_lineart_detector():
    """Get or create Lineart detector (lazy loading)"""
    global _lineart_detector
    if _lineart_detector is None:
        logger.info("Loading Lineart detector...")
        from controlnet_aux import LineartDetector
        _lineart_detector = LineartDetector.from_pretrained("lllyasviel/Annotators")
        logger.info("Lineart detector loaded")
    return _lineart_detector


def get_lineart_coarse_detector():
    """Get or create Lineart Anime detector (lazy loading) - using anime style for coarse effect"""
    global _lineart_coarse_detector
    if _lineart_coarse_detector is None:
        logger.info("Loading Lineart Anime detector...")
        from controlnet_aux import LineartAnimeDetector
        _lineart_coarse_detector = LineartAnimeDetector.from_pretrained("lllyasviel/Annotators")
        logger.info("Lineart Anime detector loaded")
    return _lineart_coarse_detector


def get_pidinet_detector():
    """Get or create PiDiNet detector (lazy loading)"""
    global _pidinet_detector
    if _pidinet_detector is None:
        logger.info("Loading PiDiNet detector...")
        from controlnet_aux import PidiNetDetector
        _pidinet_detector = PidiNetDetector.from_pretrained("lllyasviel/Annotators")
        logger.info("PiDiNet detector loaded")
    return _pidinet_detector


def detect_lines_hed(image: Image.Image) -> Image.Image:
    """
    HED (Holistically-Nested Edge Detection)
    Produces smooth edges with good detail preservation
    """
    detector = get_hed_detector()
    result = detector(image)
    return result


def detect_lines_lineart(image: Image.Image) -> Image.Image:
    """
    Lineart detection - clean line art extraction
    Good for architectural drawings
    """
    detector = get_lineart_detector()
    result = detector(image)
    return result


def detect_lines_lineart_coarse(image: Image.Image) -> Image.Image:
    """
    Lineart Coarse - thicker, more stylized lines
    """
    detector = get_lineart_coarse_detector()
    result = detector(image)
    return result


def detect_lines_pidinet(image: Image.Image) -> Image.Image:
    """
    PiDiNet - lightweight and fast edge detection
    """
    detector = get_pidinet_detector()
    result = detector(image)
    return result


def process_with_hf_detector(cv2_image: np.ndarray, method: int) -> np.ndarray:
    """
    Process image with HuggingFace detector
    
    Args:
        cv2_image: OpenCV image (BGR format)
        method: 6=HED, 7=Lineart, 8=Lineart Coarse, 9=PiDiNet
        
    Returns:
        Processed image as numpy array (grayscale, white background)
    """
    import cv2
    
    # Convert BGR to RGB for PIL
    rgb_image = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_image)
    
    # Process with appropriate detector
    if method == 6:
        result = detect_lines_hed(pil_image)
    elif method == 7:
        result = detect_lines_lineart(pil_image)
    elif method == 8:
        result = detect_lines_lineart_coarse(pil_image)
    elif method == 9:
        result = detect_lines_pidinet(pil_image)
    else:
        raise ValueError(f"Unknown HF detector method: {method}")
    
    # Convert result to numpy array
    result_array = np.array(result)
    
    # Ensure grayscale
    if len(result_array.shape) == 3:
        result_array = cv2.cvtColor(result_array, cv2.COLOR_RGB2GRAY)
    
    return result_array


# Method names for API
HF_METHOD_NAMES = {
    6: "HED",
    7: "Lineart",
    8: "Lineart Coarse", 
    9: "PiDiNet"
}
