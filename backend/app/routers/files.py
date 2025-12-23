"""
Files API router.
Handles file upload, download, and image export.
"""
import logging
import os
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
import tempfile
from pathlib import Path

from app.services.inference import base64_to_image, image_to_base64

logger = logging.getLogger(__name__)
router = APIRouter()

# Temporary storage for exports
TEMP_DIR = Path(tempfile.gettempdir()) / "scribble_architect"
TEMP_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file and return as base64.
    """
    try:
        contents = await file.read()
        
        from PIL import Image
        import io
        
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        base64_data = image_to_base64(image)
        
        return {
            "success": True,
            "image": base64_data,
            "width": image.width,
            "height": image.height,
            "filename": file.filename
        }
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")


@router.post("/export")
async def export_image(data: dict):
    """
    Export an image for download.
    Accepts base64 image data and returns a download URL.
    """
    try:
        image_data = data.get("image")
        filename = data.get("filename", "result.png")
        format_type = data.get("format", "png").lower()
        
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Decode image
        image = base64_to_image(image_data)
        
        # Generate unique filename
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        safe_filename = f"{unique_id}_{filename}"
        
        # Save to temp directory
        filepath = TEMP_DIR / safe_filename
        
        if format_type == "jpg" or format_type == "jpeg":
            image.save(filepath, "JPEG", quality=95)
        else:
            image.save(filepath, "PNG")
        
        return {
            "success": True,
            "download_url": f"/api/files/download/{safe_filename}"
        }
        
    except Exception as e:
        logger.error(f"Export failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{filename}")
async def download_file(filename: str):
    """
    Download an exported file.
    """
    filepath = TEMP_DIR / filename
    
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/octet-stream"
    )


@router.delete("/cleanup")
async def cleanup_temp_files():
    """
    Clean up temporary files.
    """
    try:
        import shutil
        count = 0
        for file in TEMP_DIR.iterdir():
            if file.is_file():
                file.unlink()
                count += 1
        
        return {"success": True, "deleted": count}
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
