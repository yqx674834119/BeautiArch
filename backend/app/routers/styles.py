"""
Styles API router.
Handles fetching types, styles, and prompts.
"""
import logging
from fastapi import APIRouter, HTTPException

from app.schemas import TypesResponse, TypeInfo, StyleInfo
from app.services.inference import InferenceService
from app.config import CAT_TYPE, SIMPLE_PROMPTS

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/types", response_model=TypesResponse)
async def get_types():
    """
    Get all available types and their styles.
    """
    try:
        service = InferenceService.get_instance()
        types_data = service.get_types_and_styles()
        
        types = []
        for t in types_data:
            styles = [StyleInfo(**s) for s in t['styles']]
            types.append(TypeInfo(
                index=t['index'],
                name=t['name'],
                category=t['category'],
                styles=styles
            ))
        
        return TypesResponse(types=types)
        
    except Exception as e:
        logger.error(f"Failed to get types: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/types/{type_index}/prompt")
async def get_type_prompt(type_index: int, use_simple: bool = False):
    """
    Get the default prompt for a type.
    """
    try:
        service = InferenceService.get_instance()
        prompt = service.get_prompt_for_style(type_index, 0, use_simple)
        
        return {"prompt": prompt}
        
    except Exception as e:
        logger.error(f"Failed to get prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/types/{type_index}/styles/{style_index}/prompt")
async def get_style_prompt(type_index: int, style_index: int, use_simple: bool = False):
    """
    Get the prompt for a specific style.
    """
    try:
        service = InferenceService.get_instance()
        prompt = service.get_prompt_for_style(type_index, style_index, use_simple)
        
        return {"prompt": prompt}
        
    except Exception as e:
        logger.error(f"Failed to get prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_categories():
    """
    Get category information (interior/exterior).
    """
    return {
        "categories": CAT_TYPE,
        "simple_prompts": SIMPLE_PROMPTS
    }
