"""
Pydantic models for API request/response schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class GenerateRequest(BaseModel):
    """Request schema for image generation."""
    line_image: str = Field(..., description="Base64 encoded line drawing image")
    color_image: str = Field(..., description="Base64 encoded color/segmentation image")
    prompt: str = Field(..., description="Generation prompt")
    negative_prompt: str = Field(default="", description="Negative prompt")
    type_index: int = Field(default=0, ge=0, description="Type category index")
    style_index: int = Field(default=0, ge=0, description="Style index within type")
    custom_ref_image: Optional[str] = Field(default=None, description="Base64 encoded custom reference image (overrides type/style)")
    steps: int = Field(default=8, ge=2, le=12, description="Inference steps")
    cfg: float = Field(default=1.5, ge=0.1, le=3.0, description="CFG scale")
    ip_strength: float = Field(default=0.8, ge=0.0, le=1.0, description="IP-Adapter strength")
    cn_strength_line: float = Field(default=0.8, ge=0.0, le=1.0, description="ControlNet line strength")
    cn_strength_seg: float = Field(default=0.8, ge=0.0, le=1.0, description="ControlNet segmentation strength")
    eta: float = Field(default=0.6, ge=0.1, le=1.0, description="ETA parameter")
    seed: int = Field(default=62, ge=0, description="Random seed")
    use_hyper: bool = Field(default=False, description="Use Hyper-SD for faster generation")


class GenerateResponse(BaseModel):
    """Response schema for image generation."""
    image: str = Field(..., description="Base64 encoded generated image")
    seed: int = Field(..., description="Seed used for generation")
    inference_time: float = Field(..., description="Inference time in seconds")


class GenerateExampleRequest(BaseModel):
    """Request schema for generating example sketches."""
    type_index: int = Field(default=0, ge=0, description="Type category index")
    seed: Optional[int] = Field(default=None, description="Random seed (random if not provided)")


class GenerateExampleResponse(BaseModel):
    """Response schema for example generation."""
    image: str = Field(..., description="Base64 encoded example sketch")
    seed: int = Field(..., description="Seed used")


class UpscaleRequest(BaseModel):
    """Request schema for HD upscaling."""
    image: str = Field(..., description="Base64 encoded image to upscale")
    prompt: str = Field(default="highest quality", description="Prompt for upscaling")
    resolution: int = Field(default=2048, ge=1024, le=4096, description="Target resolution")


class UpscaleResponse(BaseModel):
    """Response schema for HD upscaling."""
    image: str = Field(..., description="Base64 encoded upscaled image")


class StyleInfo(BaseModel):
    """Information about a style option."""
    name: str
    image_url: str
    prompt: str


class TypeInfo(BaseModel):
    """Information about a type category."""
    index: int
    name: str
    category: str  # 'int' or 'ext'
    styles: List[StyleInfo]


class TypesResponse(BaseModel):
    """Response schema for listing all types and styles."""
    types: List[TypeInfo]


class ModelInfo(BaseModel):
    """Information about an available model."""
    id: str
    name: str
    is_custom: bool = False


class ModelsResponse(BaseModel):
    """Response schema for listing available models."""
    models_list: List[ModelInfo]
    current_model: str


class WebSocketMessage(BaseModel):
    """Message format for WebSocket communication."""
    type: str  # 'generate', 'progress', 'result', 'error'
    data: dict


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    version: str = "1.0.0"
