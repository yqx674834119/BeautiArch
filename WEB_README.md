# ScribbleArchitect Web

Transform simple doodles into architectural works using AI! This is the web-based version of ScribbleArchitect, migrated from the original Qt desktop application.

## Project Structure

```
BeautiArch/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py       # FastAPI application entry
│   │   ├── config.py     # Configuration settings
│   │   ├── schemas.py    # Pydantic models
│   │   ├── routers/      # API route handlers
│   │   │   ├── generate.py   # Generation endpoints + WebSocket
│   │   │   ├── styles.py     # Types/styles endpoints
│   │   │   └── files.py      # File upload/download
│   │   └── services/
│   │       └── inference.py  # AI inference service (wraps lcm.py)
│   └── requirements.txt
│
├── frontend/              # Next.js frontend
│   ├── app/
│   │   ├── page.tsx      # Main editor page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── Toolbar.tsx
│   │   ├── DrawingCanvas.tsx
│   │   ├── ResultCanvas.tsx
│   │   ├── OutputOptions.tsx
│   │   └── AdvancedOptions.tsx
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client + WebSocket
│   │   └── types.ts      # TypeScript types
│   └── public/icons/     # Toolbar icons
│
├── lcm.py                # Original AI inference (reused by backend)
├── resources/            # Style images and assets
└── main.py              # Original Qt application (deprecated)
```

## Quick Start

### Prerequisites

- Python 3.10+ with conda
- Node.js 18+
- CUDA-capable GPU (recommended for fast inference)

### 1. Start the Backend

```bash
# Activate conda environment
conda activate BeautiArch

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Start the server (models will load on startup)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **Note**: First startup will take several minutes as AI models are downloaded and loaded.

### 2. Start the Frontend

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

### 3. Open the Application

Open http://localhost:3000 in your browser.

## Features

### Drawing Tools
- **Pencil**: Fine lines for detailed sketching
- **Brush**: Thicker strokes for bold lines
- **Eraser**: Remove unwanted marks
- **Segmentation Brush**: Color regions for semantic control
- **Bezier Curves**: Smooth curved lines (partial support)

### Generation Controls
- **Type Selection**: Choose architectural category (Building, Interior, City, etc.)
- **Style Selection**: Pick visual style with image preview
- **Live Update**: Auto-regenerate on drawing changes
- **Hyper-SD**: Faster inference mode

### Advanced Options
- **Model Tab**: Seed control, custom prompts
- **Sliders Tab**: Steps, CFG, ControlNet strengths
- **Line Processing**: Edge detection algorithms

### Export
- **Standard Export**: Save result as PNG
- **HD Export**: Upscale to 2048px using tile ControlNet

## API Documentation

Once the backend is running, API docs are available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate/` | Generate image from drawing |
| POST | `/api/generate/example` | Generate example sketch |
| POST | `/api/generate/upscale` | HD upscale |
| GET | `/api/styles/types` | Get all types and styles |
| WS | `/api/generate/ws` | WebSocket for real-time generation |

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Diffusers**: Stable Diffusion with ControlNet
- **PyTorch**: Deep learning framework
- **WebSocket**: Real-time communication

### Frontend
- **Next.js 15**: React framework
- **TypeScript**: Type-safe JavaScript
- **CSS Modules**: Scoped styling

## Configuration

### Backend Environment

| Variable | Default | Description |
|----------|---------|-------------|
| Not required | - | Uses config.py defaults |

### Frontend Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend build check
cd frontend
npm run build
```

### Code Style

- Backend: Black + isort
- Frontend: ESLint + Prettier

## Migration Notes

The web version maintains full compatibility with the Qt application:

- ✅ All drawing tools (except Record Sequence)
- ✅ All generation parameters
- ✅ Style database structure
- ✅ Model inference pipeline
- ✅ Export functionality

Features not ported:
- Screen capture (browser security limitations)
- Record sequence (video recording)
- Floating drawing window

## Troubleshooting

### Backend won't start
- Check CUDA availability: `python -c "import torch; print(torch.cuda.is_available())"`
- Ensure models directory exists

### No styles showing
- Verify `resources/img/AI_ref_images_bo` exists with style folders

### Generation fails
- Check GPU memory (needs ~6GB VRAM)
- Reduce image resolution if needed

## License

Original ScribbleArchitect by Samuel Dubois (sdu@bbri.be)
