"""
ScribbleArchitect FastAPI Backend
Main application entry point.
"""
import logging
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Add parent directory to path for lcm import
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.routers import generate, styles, files, process
from app.services.inference import InferenceService
from app.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Resources directory
RESOURCES_DIR = Path(__file__).resolve().parent.parent.parent / "resources"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup: Load models (eager loading)
    logger.info("Starting ScribbleArchitect backend...")
    logger.info("Loading AI models (this may take several minutes on first run)...")
    
    try:
        service = InferenceService.get_instance()
        service.initialize()
        logger.info("Models loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        logger.warning("Server will start but generation will not work until models are loaded")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ScribbleArchitect backend...")


# Create FastAPI app
app = FastAPI(
    title="ScribbleArchitect API",
    description="API for AI-powered architectural sketch generation",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generate.router, prefix="/api/generate", tags=["generation"])
app.include_router(styles.router, prefix="/api/styles", tags=["styles"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(process.router)

# Serve static files (style images, icons)
if RESOURCES_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(RESOURCES_DIR)), name="static")
    logger.info(f"Serving static files from {RESOURCES_DIR}")
else:
    logger.warning(f"Resources directory not found: {RESOURCES_DIR}")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "name": "ScribbleArchitect API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint."""
    service = InferenceService.get_instance()
    
    return HealthResponse(
        status="healthy" if service.model_loaded else "degraded",
        model_loaded=service.model_loaded,
        version="1.0.0"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
