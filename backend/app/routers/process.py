"""
Image Processing Router - Edge detection and segmentation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image
import base64
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/process", tags=["processing"])


class ProcessLinesRequest(BaseModel):
    """Request for edge detection processing"""
    image: str  # Base64 encoded image
    method: int = 0  # 0-5 for LINE_METHODS


class ProcessSegmentRequest(BaseModel):
    """Request for semantic segmentation"""
    image: str  # Base64 encoded image


class ProcessResponse(BaseModel):
    """Response with processed image"""
    image: str  # Base64 encoded result
    message: str


def get_lcm():
    """Lazy import of lcm module"""
    import sys
    import os
    from pathlib import Path
    
    # Add parent directory to path to import lcm
    backend_dir = Path(__file__).resolve().parent.parent.parent
    project_dir = backend_dir.parent
    if str(project_dir) not in sys.path:
        sys.path.insert(0, str(project_dir))
    
    import lcm
    return lcm


def base64_to_cv2(base64_string: str):
    """Convert base64 string to OpenCV image (numpy array)"""
    import numpy as np
    import cv2
    
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return image


def cv2_to_base64(image) -> str:
    """Convert OpenCV image to base64 string"""
    import cv2
    
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')


def pil_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


@router.post("/lines", response_model=ProcessResponse)
async def process_lines(request: ProcessLinesRequest):
    """
    Convert image to line drawing using edge detection.
    
    Methods:
    - 0: Sobel Custom
    - 1: Canny
    - 2: Canny + L2
    - 3: Canny + BIL
    - 4: Canny + Blur
    - 5: RF Custom
    """
    try:
        lcm = get_lcm()
        
        # Convert base64 to CV2 image
        cv2_image = base64_to_cv2(request.image)
        
        if cv2_image is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process using lcm.screen_to_lines
        processed = lcm.screen_to_lines(cv2_image, request.method)
        
        # Convert back to base64
        result_base64 = cv2_to_base64(processed)
        
        method_names = ['Sobel Custom', 'Canny', 'Canny + L2', 'Canny + BIL', 'Canny + Blur', 'RF Custom']
        method_name = method_names[request.method] if request.method < len(method_names) else 'Unknown'
        
        return ProcessResponse(
            image=result_base64,
            message=f"Processed with {method_name}"
        )
        
    except Exception as e:
        logger.error(f"Line processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.post("/segment", response_model=ProcessResponse)
async def process_segment(request: ProcessSegmentRequest):
    """
    Convert image to semantic segmentation using lcm.img_to_seg.
    Returns a color-coded segmentation image.
    """
    try:
        lcm = get_lcm()
        
        # Convert base64 to CV2 image
        cv2_image = base64_to_cv2(request.image)
        
        if cv2_image is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Process using lcm.img_to_seg
        segmented = lcm.img_to_seg(cv2_image)
        
        # Convert numpy array to PIL Image then to base64
        pil_image = Image.fromarray(segmented)
        result_base64 = pil_to_base64(pil_image)
        
        return ProcessResponse(
            image=result_base64,
            message="Semantic segmentation complete"
        )
        
    except Exception as e:
        logger.error(f"Segmentation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")


@router.get("/methods")
async def get_line_methods():
    """Get available line detection methods"""
    return {
        "methods": [
            {"id": 0, "name": "Sobel Custom"},
            {"id": 1, "name": "Canny"},
            {"id": 2, "name": "Canny + L2"},
            {"id": 3, "name": "Canny + BIL"},
            {"id": 4, "name": "Canny + Blur"},
            {"id": 5, "name": "RF Custom"},
        ]
    }
