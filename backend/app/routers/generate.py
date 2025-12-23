"""
Generation API router.
Handles image generation, example generation, and upscaling endpoints.
"""
import logging
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import Optional
import json
import asyncio

from app.schemas import (
    GenerateRequest, GenerateResponse,
    GenerateExampleRequest, GenerateExampleResponse,
    UpscaleRequest, UpscaleResponse,
    ModelsResponse, ModelInfo
)
from app.services.inference import InferenceService, base64_to_image, image_to_base64

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=GenerateResponse)
async def generate_image(request: GenerateRequest):
    """
    Generate an image from line drawing and color/segmentation inputs.
    """
    try:
        service = InferenceService.get_instance()
        
        # Decode input images
        line_image = base64_to_image(request.line_image)
        color_image = base64_to_image(request.color_image)
        
        # Decode custom ref image if provided
        custom_ref_pil = None
        if request.custom_ref_image:
            custom_ref_pil = base64_to_image(request.custom_ref_image)
        
        # Run inference
        result_image, seed, inference_time = service.generate(
            line_image=line_image,
            color_image=color_image,
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            type_index=request.type_index,
            style_index=request.style_index,
            custom_ref_image=custom_ref_pil,
            steps=request.steps,
            cfg=request.cfg,
            ip_strength=request.ip_strength,
            cn_strength_line=request.cn_strength_line,
            cn_strength_seg=request.cn_strength_seg,
            eta=request.eta,
            seed=request.seed,
            use_hyper=request.use_hyper
        )
        
        # Encode result
        result_base64 = image_to_base64(result_image)
        
        return GenerateResponse(
            image=result_base64,
            seed=seed,
            inference_time=inference_time
        )
        
    except Exception as e:
        logger.error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/example", response_model=GenerateExampleResponse)
async def generate_example(request: GenerateExampleRequest):
    """
    Generate an example sketch for the given type.
    """
    try:
        service = InferenceService.get_instance()
        
        result_image, seed = service.generate_example(
            type_index=request.type_index,
            seed=request.seed
        )
        
        result_base64 = image_to_base64(result_image)
        
        return GenerateExampleResponse(
            image=result_base64,
            seed=seed
        )
        
    except Exception as e:
        logger.error(f"Example generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upscale", response_model=UpscaleResponse)
async def upscale_image(request: UpscaleRequest):
    """
    Upscale an image to higher resolution.
    """
    try:
        service = InferenceService.get_instance()
        
        input_image = base64_to_image(request.image)
        
        result_image = service.upscale(
            image=input_image,
            prompt=request.prompt,
            resolution=request.resolution
        )
        
        result_base64 = image_to_base64(result_image)
        
        return UpscaleResponse(image=result_base64)
        
    except Exception as e:
        logger.error(f"Upscaling failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models", response_model=ModelsResponse)
async def list_models():
    """
    List available models.
    """
    # TODO: Implement model listing and switching
    models = [
        ModelInfo(id="Lykon/dreamshaper-8", name="Dreamshaper8", is_custom=False)
    ]
    
    return ModelsResponse(
        models_list=models,
        current_model="Lykon/dreamshaper-8"
    )


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_json(self, websocket: WebSocket, data: dict):
        await websocket.send_json(data)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time generation.
    Supports live preview as user draws.
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            message_type = data.get("type")
            
            if message_type == "generate":
                # Extract generation parameters
                params = data.get("data", {})
                
                try:
                    # Send progress update
                    await manager.send_json(websocket, {
                        "type": "progress",
                        "data": {"status": "starting", "progress": 0}
                    })
                    
                    service = InferenceService.get_instance()
                    
                    # Decode images
                    line_image = base64_to_image(params.get("line_image", ""))
                    color_image = base64_to_image(params.get("color_image", ""))
                    
                    # Send progress update
                    await manager.send_json(websocket, {
                        "type": "progress",
                        "data": {"status": "generating", "progress": 50}
                    })
                    
                    # Run inference in thread pool to not block
                    loop = asyncio.get_event_loop()
                    result_image, seed, inference_time = await loop.run_in_executor(
                        None,
                        lambda: service.generate(
                            line_image=line_image,
                            color_image=color_image,
                            prompt=params.get("prompt", ""),
                            negative_prompt=params.get("negative_prompt", ""),
                            type_index=params.get("type_index", 0),
                            style_index=params.get("style_index", 0),
                            steps=params.get("steps", 8),
                            cfg=params.get("cfg", 1.5),
                            ip_strength=params.get("ip_strength", 0.8),
                            cn_strength_line=params.get("cn_strength_line", 0.8),
                            cn_strength_seg=params.get("cn_strength_seg", 0.8),
                            eta=params.get("eta", 0.6),
                            seed=params.get("seed", 62),
                            use_hyper=params.get("use_hyper", False)
                        )
                    )
                    
                    # Send result
                    result_base64 = image_to_base64(result_image)
                    
                    await manager.send_json(websocket, {
                        "type": "result",
                        "data": {
                            "image": result_base64,
                            "seed": seed,
                            "inference_time": inference_time
                        }
                    })
                    
                except Exception as e:
                    logger.error(f"WebSocket generation error: {e}")
                    await manager.send_json(websocket, {
                        "type": "error",
                        "data": {"message": str(e)}
                    })
                    
            elif message_type == "ping":
                await manager.send_json(websocket, {"type": "pong"})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")
