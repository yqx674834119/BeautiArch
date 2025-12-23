/**
 * TypeScript types for ScribbleArchitect
 */

// Drawing tool types
export type DrawingTool = 'pencil' | 'brush' | 'eraser' | 'airbrush' | 'bezier';

// Generation parameters
export interface GenerateParams {
    lineImage: string;
    colorImage: string;
    prompt: string;
    negativePrompt: string;
    typeIndex: number;
    styleIndex: number;
    customRefImage?: string;  // Base64 encoded custom reference image (overrides style)
    steps: number;
    cfg: number;
    ipStrength: number;
    cnStrengthLine: number;
    cnStrengthSeg: number;
    eta: number;
    seed: number;
}

// Generation response
export interface GenerateResponse {
    image: string;
    seed: number;
    inferenceTime: number;
}

// Style information
export interface StyleInfo {
    name: string;
    imageUrl: string;
    prompt: string;
}

// Type category information
export interface TypeInfo {
    index: number;
    name: string;
    category: 'int' | 'ext';
    styles: StyleInfo[];
}

// Model information
export interface ModelInfo {
    id: string;
    name: string;
    isCustom: boolean;
}

// WebSocket message types
export interface WSMessage {
    type: 'generate' | 'progress' | 'result' | 'error' | 'ping' | 'pong';
    data: Record<string, unknown>;
}

export interface WSProgressData {
    status: string;
    progress: number;
}

export interface WSResultData {
    image: string;
    seed: number;
    inferenceTime: number;
}

export interface WSErrorData {
    message: string;
}

// Canvas state
export interface CanvasState {
    tool: DrawingTool;
    brushSize: number;
    color: string;
    isDrawing: boolean;
}

// Editor state
export interface EditorState {
    typeIndex: number;
    styleIndex: number;
    prompt: string;
    negativePrompt: string;
    steps: number;
    cfg: number;
    ipStrength: number;
    cnStrengthLine: number;
    cnStrengthSeg: number;
    eta: number;
    seed: number;
    liveUpdate: boolean;
    useSimplePrompts: boolean;
    keepPrompt: boolean;
}

// Health check response
export interface HealthResponse {
    status: 'healthy' | 'degraded';
    modelLoaded: boolean;
    version: string;
}

// File upload response
export interface UploadResponse {
    success: boolean;
    image: string;
    width: number;
    height: number;
    filename: string;
}

// Export response
export interface ExportResponse {
    success: boolean;
    downloadUrl: string;
}
