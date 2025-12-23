"""
Inference service that wraps the lcm.py AI inference logic.
This service manages model loading and provides inference methods.
"""
import sys
import os
import time
import random
import base64
import io
import logging
from pathlib import Path
from typing import Optional, Tuple, Callable
from PIL import Image

# Add parent directory to path to import lcm
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent))

from app.config import (
    AI_REF_IMAGES_DIR, IMG_W, IMG_H, HD_RES,
    CAT_TYPE, SIMPLE_PROMPTS, EXAMPLE_PROMPTS
)

logger = logging.getLogger(__name__)


class InferenceService:
    """
    Singleton service for AI inference.
    Manages model loading and provides inference methods.
    """
    _instance: Optional['InferenceService'] = None
    _infer: Optional[Callable] = None
    _infer_hyper: Optional[Callable] = None
    _use_hyper: bool = False
    _model_loaded: bool = False

    # Style database (populated from AI_ref_images_bo)
    type_names: list = []
    all_ip_styles: list = []
    all_ip_prompts: list = []
    all_ip_paths: list = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get_instance(cls) -> 'InferenceService':
        """Get the singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self):
        """
        Initialize the service by loading models and building style database.
        Called on application startup (eager loading).
        """
        logger.info("Initializing InferenceService...")
        
        # Build style database
        self._build_style_database()
        
        # Load AI models
        self._load_models()
        
        self._model_loaded = True
        logger.info("InferenceService initialized successfully")

    def _build_style_database(self):
        """Build the style database from AI reference images directory."""
        logger.info(f"Building style database from {AI_REF_IMAGES_DIR}")
        
        self.type_names = []
        self.all_ip_styles = []
        self.all_ip_prompts = []
        self.all_ip_paths = []

        if not AI_REF_IMAGES_DIR.exists():
            logger.warning(f"AI reference images directory not found: {AI_REF_IMAGES_DIR}")
            return

        for idx, type_folder in enumerate(sorted(os.listdir(AI_REF_IMAGES_DIR))):
            type_path = AI_REF_IMAGES_DIR / type_folder
            if type_path.is_dir():
                self.type_names.append(type_folder)

                styles = []
                prompts = []
                image_paths = []

                for file in sorted(os.listdir(type_path)):
                    if file.endswith('.png'):
                        image_path = str(type_path / file)
                        image_paths.append(image_path)

                        # Look for matching text file with prompt
                        prompt_path = image_path.replace('.png', '.txt')
                        prompt = ''
                        if os.path.exists(prompt_path):
                            with open(prompt_path, 'r') as f:
                                prompt = f.read().strip()
                        prompts.append(prompt)

                        # Style name is filename without extension
                        style_name = os.path.splitext(file)[0]
                        styles.append(style_name)

                self.all_ip_styles.append(styles)
                self.all_ip_prompts.append(prompts)
                self.all_ip_paths.append(image_paths)

        logger.info(f"Loaded {len(self.type_names)} types with styles")

    def _load_models(self):
        """Load the AI models for inference."""
        logger.info("Loading AI models (this may take a while)...")
        
        try:
            # Import lcm module
            import lcm
            
            # Load standard model
            logger.info("Loading standard ControlNet model...")
            self._infer = lcm.load_models_multiple_cn()
            
            # Load Hyper-SD model
            logger.info("Loading Hyper-SD model...")
            self._infer_hyper = lcm.load_models_multiple_cn_hyper()
            
            logger.info("All models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise

    @property
    def model_loaded(self) -> bool:
        """Check if models are loaded."""
        return self._model_loaded

    def get_types_and_styles(self) -> list:
        """Get all types and their styles."""
        types = []
        for idx, type_name in enumerate(self.type_names):
            category = CAT_TYPE[idx] if idx < len(CAT_TYPE) else 'ext'
            styles = []
            
            for style_idx, style_name in enumerate(self.all_ip_styles[idx]):
                styles.append({
                    'name': style_name,
                    'image_url': f"/static/img/AI_ref_images_bo/{type_name}/{style_name}.png",
                    'prompt': self.all_ip_prompts[idx][style_idx] if style_idx < len(self.all_ip_prompts[idx]) else ''
                })
            
            types.append({
                'index': idx,
                'name': type_name,
                'category': category,
                'styles': styles
            })
        
        return types

    def get_style_image_path(self, type_index: int, style_index: int) -> str:
        """Get the file path for a style image."""
        if type_index < len(self.all_ip_paths) and style_index < len(self.all_ip_paths[type_index]):
            return self.all_ip_paths[type_index][style_index]
        return ""

    def get_prompt_for_style(self, type_index: int, style_index: int, use_simple: bool = False) -> str:
        """Get the prompt for a style."""
        if use_simple and type_index < len(SIMPLE_PROMPTS):
            return SIMPLE_PROMPTS[type_index]
        
        if type_index < len(self.all_ip_prompts) and style_index < len(self.all_ip_prompts[type_index]):
            return self.all_ip_prompts[type_index][style_index]
        
        return ""

    def generate(
        self,
        line_image: Image.Image,
        color_image: Image.Image,
        prompt: str,
        negative_prompt: str = "",
        type_index: int = 0,
        style_index: int = 0,
        custom_ref_image: Optional[Image.Image] = None,
        steps: int = 8,
        cfg: float = 1.5,
        ip_strength: float = 0.8,
        cn_strength_line: float = 0.8,
        cn_strength_seg: float = 0.8,
        eta: float = 0.6,
        seed: int = 62,
        use_hyper: bool = False
    ) -> Tuple[Image.Image, int, float]:
        """
        Generate an image from line and color inputs.
        
        Args:
            custom_ref_image: Optional PIL Image to use as reference instead of preset style
        
        Returns:
            Tuple of (generated_image, seed_used, inference_time)
        """
        if not self._model_loaded:
            raise RuntimeError("Models not loaded. Call initialize() first.")

        # Use custom ref image if provided, otherwise look up by index
        if custom_ref_image is not None:
            # Save custom ref to temp file for IP-Adapter
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                custom_ref_image.save(tmp.name)
                ip_image_ref = tmp.name
        else:
            # Get style reference image path from preset
            ip_image_ref = self.get_style_image_path(type_index, style_index)
        
        # Ensure images are correct size
        if line_image.size != (IMG_W, IMG_H):
            line_image = line_image.resize((IMG_W, IMG_H), Image.BICUBIC)
        if color_image.size != (IMG_W, IMG_H):
            color_image = color_image.resize((IMG_W, IMG_H), Image.BICUBIC)

        # Select inference function
        infer_func = self._infer_hyper if use_hyper else self._infer
        
        cn_strengths = [cn_strength_line, cn_strength_seg]

        start_time = time.time()
        
        result = infer_func(
            prompt=prompt,
            negative_prompt=negative_prompt,
            images=[line_image, color_image],
            num_inference_steps=steps,
            guidance_scale=cfg,
            seed=seed,
            ip_scale=ip_strength,
            ip_image_to_use=ip_image_ref,
            cn_strength=cn_strengths,
            eta=eta
        )
        
        inference_time = time.time() - start_time
        
        return result, seed, inference_time

    def generate_example(
        self,
        type_index: int = 0,
        seed: Optional[int] = None
    ) -> Tuple[Image.Image, int]:
        """
        Generate an example sketch for the given type.
        
        Returns:
            Tuple of (example_image, seed_used)
        """
        if not self._model_loaded:
            raise RuntimeError("Models not loaded. Call initialize() first.")

        if seed is None:
            seed = random.randrange(0, 2 ** 63)

        # Create blank white image
        white_image = Image.new("RGB", (IMG_W, IMG_H), "white")
        
        # Get example prompt for this type
        prompt = EXAMPLE_PROMPTS[type_index] if type_index < len(EXAMPLE_PROMPTS) else EXAMPLE_PROMPTS[0]
        negative_prompt = 'realistic, colors, detailed, writing, text'

        result = self._infer(
            prompt=prompt,
            negative_prompt=negative_prompt,
            images=[white_image, white_image],
            num_inference_steps=7,
            guidance_scale=0.7,
            strength=0.9,
            seed=seed,
            ip_scale=0.2,
            ip_image_to_use=str(Path(__file__).parent.parent.parent.parent / 'resources' / 'img' / 'examples' / 'city_default.png'),
            cn_strength=[0, 0],
        )

        # Convert to binary (black and white)
        grayscale = result.convert("L")
        
        # Simple threshold
        threshold = 128
        binary = grayscale.point(lambda x: 0 if x < threshold else 255, '1')
        
        return binary.convert("RGB"), seed

    def upscale(
        self,
        image: Image.Image,
        prompt: str = "highest quality",
        resolution: int = HD_RES
    ) -> Image.Image:
        """
        Upscale an image to higher resolution.
        """
        import lcm
        return lcm.tile_upscale(image, prompt, resolution)


# Helper functions for image encoding/decoding
def base64_to_image(base64_str: str) -> Image.Image:
    """Convert base64 string to PIL Image."""
    # Remove data URL prefix if present
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    
    image_data = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(image_data)).convert("RGB")


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to base64 string."""
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode()
