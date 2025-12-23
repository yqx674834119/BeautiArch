/**
 * API client for ScribbleArchitect backend
 * Uses relative URLs to work with Next.js rewrites
 */

import type {
    GenerateParams,
    GenerateResponse,
    TypeInfo,
    HealthResponse,
    UploadResponse,
    ExportResponse,
    WSMessage,
} from './types';

// API base URL - use relative path to leverage Next.js rewrites
// In production, set NEXT_PUBLIC_API_URL to the actual API server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Make an API request
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Health check
 */
export async function checkHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>('/api/health');
}

/**
 * Get all types and styles (from local API that scans public/styles folder)
 */
export async function getTypes(): Promise<{ types: TypeInfo[] }> {
    return apiRequest<{ types: TypeInfo[] }>('/api/styles');
}

/**
 * Get prompt for a style
 */
export async function getStylePrompt(
    typeIndex: number,
    styleIndex: number,
    useSimple: boolean = false
): Promise<{ prompt: string }> {
    return apiRequest<{ prompt: string }>(
        `/api/styles/types/${typeIndex}/styles/${styleIndex}/prompt?use_simple=${useSimple}`
    );
}

/**
 * Generate an image
 */
export async function generate(params: GenerateParams): Promise<GenerateResponse> {
    // Backend returns snake_case, need to transform to camelCase
    const response = await apiRequest<{
        image: string;
        seed: number;
        inference_time: number;
    }>('/api/generate/', {
        method: 'POST',
        body: JSON.stringify({
            line_image: params.lineImage,
            color_image: params.colorImage,
            prompt: params.prompt,
            negative_prompt: params.negativePrompt,
            type_index: params.typeIndex,
            style_index: params.styleIndex,
            custom_ref_image: params.customRefImage || null,
            steps: params.steps,
            cfg: params.cfg,
            ip_strength: params.ipStrength,
            cn_strength_line: params.cnStrengthLine,
            cn_strength_seg: params.cnStrengthSeg,
            eta: params.eta,
            seed: params.seed,
        }),
    });

    // Transform snake_case to camelCase
    return {
        image: response.image,
        seed: response.seed,
        inferenceTime: response.inference_time,
    };
}

/**
 * Generate an example sketch
 */
export async function generateExample(
    typeIndex: number,
    seed?: number
): Promise<{ image: string; seed: number }> {
    return apiRequest('/api/generate/example', {
        method: 'POST',
        body: JSON.stringify({
            type_index: typeIndex,
            seed: seed,
        }),
    });
}

/**
 * Upscale an image
 */
export async function upscale(
    image: string,
    prompt: string = 'highest quality',
    resolution: number = 2048
): Promise<{ image: string }> {
    return apiRequest('/api/generate/upscale', {
        method: 'POST',
        body: JSON.stringify({
            image,
            prompt,
            resolution,
        }),
    });
}

/**
 * Upload an image file
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail);
    }

    return response.json();
}

/**
 * Export an image for download
 */
export async function exportImage(
    image: string,
    filename: string,
    format: 'png' | 'jpg' = 'png'
): Promise<ExportResponse> {
    return apiRequest('/api/files/export', {
        method: 'POST',
        body: JSON.stringify({
            image,
            filename,
            format,
        }),
    });
}

/**
 * Convert image to line drawing (edge detection)
 */
export async function processLines(
    image: string,
    method: number = 0
): Promise<{ image: string; message: string }> {
    return apiRequest('/api/process/lines', {
        method: 'POST',
        body: JSON.stringify({
            image,
            method,
        }),
    });
}

/**
 * Convert image to semantic segmentation
 */
export async function processSegment(
    image: string
): Promise<{ image: string; message: string }> {
    return apiRequest('/api/process/segment', {
        method: 'POST',
        body: JSON.stringify({
            image,
        }),
    });
}

/**
 * Get available line detection methods
 */
export async function getLineMethods(): Promise<{
    methods: Array<{ id: number; name: string }>;
}> {
    return apiRequest('/api/process/methods');
}

/**
 * WebSocket connection manager for real-time generation
 */
export class GenerationWebSocket {
    private ws: WebSocket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private messageHandlers: Map<string, (data: unknown) => void> = new Map();

    constructor() {
        this.connect();
    }

    private connect() {
        // Use ws://localhost:8000 for WebSocket
        const wsUrl = 'ws://localhost:8000/api/generate/ws';

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.clearReconnectTimer();
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WSMessage = JSON.parse(event.data);
                const handler = this.messageHandlers.get(message.type);
                if (handler) {
                    handler(message.data);
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private scheduleReconnect() {
        if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
                this.connect();
            }, 3000);
        }
    }

    private clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    on(type: string, handler: (data: unknown) => void) {
        this.messageHandlers.set(type, handler);
    }

    off(type: string) {
        this.messageHandlers.delete(type);
    }

    generate(params: GenerateParams) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'generate',
                data: {
                    line_image: params.lineImage,
                    color_image: params.colorImage,
                    prompt: params.prompt,
                    negative_prompt: params.negativePrompt,
                    type_index: params.typeIndex,
                    style_index: params.styleIndex,
                    steps: params.steps,
                    cfg: params.cfg,
                    ip_strength: params.ipStrength,
                    cn_strength_line: params.cnStrengthLine,
                    cn_strength_seg: params.cnStrengthSeg,
                    eta: params.eta,
                    seed: params.seed,
                },
            }));
        } else {
            console.error('WebSocket not connected');
        }
    }

    ping() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
        }
    }

    close() {
        this.clearReconnectTimer();
        this.ws?.close();
        this.ws = null;
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
let wsInstance: GenerationWebSocket | null = null;

export function getWebSocket(): GenerationWebSocket {
    if (!wsInstance) {
        wsInstance = new GenerationWebSocket();
    }
    return wsInstance;
}
