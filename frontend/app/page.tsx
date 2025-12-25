'use client';

/**
 * ScribbleArchitect - Main Editor Page
 * Web version of the Qt application
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './page.module.css';
import Toolbar from '@/components/Toolbar';
import DrawingCanvas, { type DrawingCanvasHandle } from '@/components/DrawingCanvas';
import ResultCanvas from '@/components/ResultCanvas';
import OutputOptions from '@/components/OutputOptions';
import AdvancedOptions from '@/components/AdvancedOptions';
import ColorPicker from '@/components/ColorPicker';
import ImageImportModal, { type ImportMode } from '@/components/ImageImportModal';
import ViewerToolbar from '@/components/ViewerToolbar';
import CurtainDivider from '@/components/CurtainDivider';
import MobileHeader from '@/components/MobileHeader';
import MobileBottomBar from '@/components/MobileBottomBar';
import MobileTopToolbar from '@/components/MobileTopToolbar';
import StyleSelectorModal from '@/components/StyleSelectorModal';
import type { DrawingTool, TypeInfo, GenerateParams, EditorState } from '@/lib/types';
import * as api from '@/lib/api';

// Canvas dimensions
const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 384;

// Segmentation colors
const SEGMENTATION_COLORS = [
  { name: 'wall', color: '#784131', rgb: [120, 65, 49] },
  { name: 'floor', color: '#9c9c9c', rgb: [156, 156, 156] },
  { name: 'ceiling', color: '#f4f4f4', rgb: [244, 244, 244] },
  { name: 'bed', color: '#6464c8', rgb: [100, 100, 200] },
  { name: 'window', color: '#be8c3c', rgb: [190, 140, 60] },
  { name: 'door', color: '#dc78dc', rgb: [220, 120, 220] },
  { name: 'table', color: '#a0a028', rgb: [160, 160, 40] },
  { name: 'chair', color: '#508cc8', rgb: [80, 140, 200] },
  { name: 'sofa', color: '#287850', rgb: [40, 120, 80] },
  { name: 'plant', color: '#14aa50', rgb: [20, 170, 80] },
  { name: 'curtain', color: '#dc8264', rgb: [220, 130, 100] },
  { name: 'lamp', color: '#e6e632', rgb: [230, 230, 50] },
  { name: 'sky', color: '#4682b4', rgb: [70, 130, 180] },
  { name: 'grass', color: '#228b22', rgb: [34, 139, 34] },
  { name: 'road', color: '#808080', rgb: [128, 128, 128] },
  { name: 'building', color: '#8b4513', rgb: [139, 69, 19] },
  { name: 'tree', color: '#006400', rgb: [0, 100, 0] },
  { name: 'water', color: '#1e90ff', rgb: [30, 144, 255] },
];

// Default editor state
const defaultState: EditorState = {
  typeIndex: 0,
  styleIndex: 0,
  prompt: 'A building architectural render',
  negativePrompt: '',
  steps: 8,
  cfg: 1.5,
  ipStrength: 0.8,
  cnStrengthLine: 0.8,
  cnStrengthSeg: 0.8,
  eta: 0.6,
  seed: 62,
  liveUpdate: false,
  useSimplePrompts: false,
  keepPrompt: false,
};

export default function Home() {
  // SSR safety
  const [isMounted, setIsMounted] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  // UI state
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pencil');
  const [brushColor, setBrushColor] = useState('#784131');
  const [brushSize, setBrushSize] = useState(10);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [hideInputZone, setHideInputZone] = useState(false);
  const [floatingDraw, setFloatingDraw] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [viewerLayout, setViewerLayout] = useState<'split' | 'curtain'>('curtain');
  const [dividerPosition, setDividerPosition] = useState(50); // percentage for curtain mode

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportImage, setPendingImportImage] = useState<string | null>(null);
  const [lineMethod, setLineMethod] = useState(0);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Data state
  const [types, setTypes] = useState<TypeInfo[]>([]);
  const [editorState, setEditorState] = useState<EditorState>(defaultState);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<{ lineImage: string; colorImage: string } | null>(null);
  const [customRefImage, setCustomRefImage] = useState<string | null>(null);
  // Upscale state - only available after image is generated
  const [upscale, setUpscale] = useState(false);
  const [upscaleResolution, setUpscaleResolution] = useState(2048);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null); // Store original before upscale

  // Refs - using proper typed ref
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refImageInputRef = useRef<HTMLInputElement>(null);
  const canvasDataRef = useRef<{ lineImage: string; colorImage: string } | null>(null);

  // SSR safety + mobile detection
  useEffect(() => {
    setIsMounted(true);

    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load types from API (dynamically reads from public/styles folder)
  useEffect(() => {
    if (!isMounted) return;

    // Call API to get types dynamically from folder
    api.getTypes()
      .then(({ types: loadedTypes }) => {
        setTypes(loadedTypes);

        // Set initial prompt from first style
        if (loadedTypes.length > 0 && loadedTypes[0].styles.length > 0) {
          setEditorState((prev) => ({
            ...prev,
            prompt: loadedTypes[0].styles[0].prompt || defaultState.prompt,
          }));
        }

        setStatusMessage(`Loaded ${loadedTypes.length} types`);
      })
      .catch((error) => {
        console.error('Failed to load types:', error);
        setStatusMessage('Failed to load types');
      });

    // Check backend health
    api.checkHealth()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, [isMounted]);

  // Handle type change
  const handleTypeChange = useCallback((index: number) => {
    setEditorState((prev) => ({
      ...prev,
      typeIndex: index,
      styleIndex: 0,
    }));

    if (!editorState.keepPrompt && types[index]?.styles[0]) {
      const prompt = editorState.useSimplePrompts
        ? getSimplePrompt(index)
        : types[index].styles[0].prompt;

      setEditorState((prev) => ({
        ...prev,
        prompt: prompt || prev.prompt,
      }));
    }
  }, [editorState.keepPrompt, editorState.useSimplePrompts, types]);

  const getSimplePrompt = (typeIndex: number) => {
    const simplePrompts = [
      'A building architectural drawing from a manga',
      'A building architectural render',
      'A building artistic architectural drawing',
      'A city',
      'The cross section of a building',
      'A facade elevation',
      'A floor plan',
      'The drawing of an interior from a manga',
      'The drawing of an interior',
      'Interior architectural render',
      'Isometric building',
      'Ground plan landscape architect'
    ];
    return simplePrompts[typeIndex] || simplePrompts[0];
  };

  // Handle style change
  const handleStyleChange = useCallback((index: number) => {
    setEditorState((prev) => ({
      ...prev,
      styleIndex: index,
    }));

    if (!editorState.keepPrompt && types[editorState.typeIndex]?.styles[index]) {
      const prompt = editorState.useSimplePrompts
        ? getSimplePrompt(editorState.typeIndex)
        : types[editorState.typeIndex].styles[index].prompt;

      setEditorState((prev) => ({
        ...prev,
        prompt: prompt || prev.prompt,
      }));
    }
  }, [editorState.keepPrompt, editorState.useSimplePrompts, editorState.typeIndex, types]);

  // Handle canvas change
  const handleCanvasChange = useCallback((lineImage: string, colorImage: string) => {
    const newData = { lineImage, colorImage };
    setCanvasData(newData);
    canvasDataRef.current = newData; // Keep ref in sync for Live Update
  }, []);

  // Handle drawing end - Live Update
  const handleDrawingEnd = useCallback(() => {
    if (editorState.liveUpdate && canvasDataRef.current) {
      // Use ref to get latest canvas data and trigger generation
      const currentData = canvasDataRef.current;

      // Trigger generation with current data
      setIsGenerating(true);
      setStatusMessage('Live generating...');

      const params = {
        lineImage: currentData.lineImage,
        colorImage: currentData.colorImage,
        prompt: editorState.prompt,
        negativePrompt: editorState.negativePrompt,
        typeIndex: editorState.typeIndex,
        styleIndex: editorState.styleIndex,
        customRefImage: customRefImage || undefined,
        steps: editorState.steps,
        cfg: editorState.cfg,
        ipStrength: editorState.ipStrength,
        cnStrengthLine: editorState.cnStrengthLine,
        cnStrengthSeg: editorState.cnStrengthSeg,
        eta: editorState.eta,
        seed: editorState.seed,
      };

      api.generate(params)
        .then((result) => {
          setResultImage(result.image);
          setOriginalImage(result.image);
          setStatusMessage(`Generated in ${result.inferenceTime?.toFixed(2) || '?'}s`);
        })
        .catch((error) => {
          console.error('Live generation failed:', error);
          setStatusMessage('Generation failed');
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [editorState, customRefImage]);

  // Generate image
  const handleGenerate = useCallback(async () => {
    if (!canvasData) {
      setStatusMessage('Please draw something first');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Generating...');
    // Reset upscale state on new generation
    setUpscale(false);
    setOriginalImage(null);

    try {
      const params: GenerateParams = {
        lineImage: canvasData.lineImage,
        colorImage: canvasData.colorImage,
        prompt: editorState.prompt,
        negativePrompt: editorState.negativePrompt,
        typeIndex: editorState.typeIndex,
        styleIndex: editorState.styleIndex,
        customRefImage: customRefImage || undefined,
        steps: editorState.steps,
        cfg: editorState.cfg,
        ipStrength: editorState.ipStrength,
        cnStrengthLine: editorState.cnStrengthLine,
        cnStrengthSeg: editorState.cnStrengthSeg,
        eta: editorState.eta,
        seed: editorState.seed,
      };

      const result = await api.generate(params);
      setResultImage(result.image);
      setOriginalImage(result.image); // Store for potential upscaling
      setStatusMessage(`Generated in ${result.inferenceTime?.toFixed(2) || '?'}s`);
    } catch (error) {
      console.error('Generation failed:', error);
      setStatusMessage('Generation failed - check backend connection');
    } finally {
      setIsGenerating(false);
    }
  }, [canvasData, editorState, customRefImage]);

  // Upscale image - separate action after generation
  const handleUpscale = useCallback(async () => {
    if (!originalImage) {
      setStatusMessage('Generate an image first');
      return;
    }

    setIsUpscaling(true);
    setStatusMessage('Upscaling...');

    try {
      const upscaleResult = await api.upscale(
        originalImage,
        editorState.prompt,
        upscaleResolution
      );
      setResultImage(upscaleResult.image);
      setStatusMessage(`Upscaled to ${upscaleResolution}px`);
    } catch (error) {
      console.error('Upscaling failed:', error);
      setStatusMessage('Upscaling failed');
    } finally {
      setIsUpscaling(false);
    }
  }, [originalImage, editorState.prompt, upscaleResolution]);

  // Export image
  const handleExport = useCallback(() => {
    if (!resultImage) {
      setStatusMessage('No image to export');
      return;
    }

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${resultImage}`;
    link.download = 'result.png';
    link.click();
    setStatusMessage('Image exported');
  }, [resultImage]);

  // Import image
  const handleImportImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Import reference image (for style reference)
  const handleImportRefImage = useCallback(() => {
    refImageInputRef.current?.click();
  }, []);

  // Handle reference image file selection
  const handleRefImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomRefImage(dataUrl);
      setStatusMessage('Reference image set');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPendingImportImage(dataUrl);
      setShowImportModal(true);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, []);

  // Handle import mode selection
  const handleImportModeSelect = useCallback(async (mode: ImportMode) => {
    if (!pendingImportImage) return;

    setShowImportModal(false);
    setIsProcessingImport(true);
    setStatusMessage(`Processing image (${mode})...`);

    try {
      const canvas = drawingCanvasRef.current;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      switch (mode) {
        case 'support':
          canvas.setSupportImage(pendingImportImage);
          setStatusMessage('Image set as drawing support');
          break;

        case 'lines':
          const linesResult = await api.processLines(pendingImportImage, lineMethod);
          canvas.setLineImage(`data:image/png;base64,${linesResult.image}`);
          setStatusMessage('Line extraction complete');
          break;

        case 'segment':
          const segResult = await api.processSegment(pendingImportImage);
          canvas.setColorImage(`data:image/png;base64,${segResult.image}`);
          setStatusMessage('Segmentation complete');
          break;

        case 'both':
          const [linesRes, segRes] = await Promise.all([
            api.processLines(pendingImportImage, lineMethod),
            api.processSegment(pendingImportImage),
          ]);
          canvas.setLineImage(`data:image/png;base64,${linesRes.image}`);
          canvas.setColorImage(`data:image/png;base64,${segRes.image}`);
          setStatusMessage('Line + segmentation complete');
          break;
      }

      if (editorState.liveUpdate) {
        setTimeout(() => handleGenerate(), 300);
      }
    } catch (error) {
      console.error('Import processing failed:', error);
      setStatusMessage('Image processing failed - check backend');
    } finally {
      setIsProcessingImport(false);
      setPendingImportImage(null);
    }
  }, [pendingImportImage, lineMethod, editorState.liveUpdate, handleGenerate]);

  // Reset canvas - calls the canvas method directly
  const handleReset = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      canvas.clearCanvas();
      setStatusMessage('Canvas cleared');
    }
    setCanvasData(null);
    setResultImage(null);
  }, []);

  // Color palette
  const handleColorPalette = useCallback(() => {
    setShowColorPicker(true);
  }, []);

  // Handle color selection
  const handleColorSelect = useCallback((color: string) => {
    setBrushColor(color);
    setShowColorPicker(false);
  }, []);

  // Import custom style
  const handleImportStyle = useCallback(() => {
    setStatusMessage('Custom style import: Feature coming soon');
  }, []);

  // Handle tool change
  const handleToolChange = useCallback((tool: DrawingTool) => {
    setCurrentTool(tool);
    if (tool === 'airbrush') {
      setShowColorPicker(true);
    }
  }, []);

  // Don't render until mounted
  if (!isMounted) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading ScribbleArchitect...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isMobile ? styles.mobileLayout : ''}`}>
      {/* Mobile Header - only on mobile */}
      {isMobile && (
        <MobileHeader
          onMenuOpen={() => setShowMobileMenu(true)}
          onImportImage={handleImportImage}
        />
      )}

      {/* Left Toolbar - hidden on mobile */}
      {!isMobile && (
        <Toolbar
          currentTool={currentTool}
          brushColor={brushColor}
          onToolChange={handleToolChange}
          onColorPalette={handleColorPalette}
          onImportImage={handleImportImage}
          onExport={handleExport}
          onReset={handleReset}
        />
      )}

      {/* Mobile Top Toolbar - below header on mobile */}
      {isMobile && (
        <MobileTopToolbar
          currentTool={currentTool}
          brushSize={brushSize}
          brushColor={brushColor}
          onBrushSizeChange={setBrushSize}
          viewerLayout={viewerLayout}
          onLayoutChange={setViewerLayout}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}

      {/* Main Canvas Area */}
      <main className={styles.main}>
        {/* Floating Viewer Toolbar - show on desktop or mobile top section */}
        {!isMobile && (
          <div className={styles.viewerToolbar}>
            <ViewerToolbar
              currentTool={currentTool}
              brushSize={brushSize}
              brushColor={brushColor}
              onBrushSizeChange={setBrushSize}
              onColorPalette={handleColorPalette}
              viewerLayout={viewerLayout}
              onLayoutChange={setViewerLayout}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* Mobile Floating Tool Badge */}
        {isMobile && (
          <div className={styles.floatingToolBadge}>
            <span>{currentTool} • {brushSize}px</span>
          </div>
        )}

        <div className={`${styles.canvasArea} ${viewerLayout === 'split' ? styles.splitMode : styles.curtainMode}`}>
          {/* Drawing Canvas - always rendered */}
          {!hideInputZone && (
            <div
              className={styles.canvasWrapper}
              style={{
                position: viewerLayout === 'curtain' ? 'absolute' : 'relative',
                zIndex: 1,
              }}
            >
              <DrawingCanvas
                ref={drawingCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                tool={currentTool}
                brushSize={brushSize}
                color={brushColor}
                onDrawingEnd={handleDrawingEnd}
                onCanvasChange={handleCanvasChange}
                isLoading={isProcessingImport}
              />
            </div>
          )}

          {/* Result Canvas - only shown when there's a result */}
          {resultImage && (
            <div
              className={styles.canvasWrapper}
              style={{
                position: viewerLayout === 'curtain' ? 'absolute' : 'relative',
                zIndex: 2,
                clipPath: viewerLayout === 'curtain'
                  ? `inset(0 0 0 ${dividerPosition}%)`
                  : 'none',
              }}
            >
              <ResultCanvas
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                image={resultImage}
                isLoading={isGenerating}
              />
            </div>
          )}

          {/* Result placeholder in split mode when no result */}
          {viewerLayout === 'split' && !resultImage && (
            <div className={styles.canvasWrapper}>
              <ResultCanvas
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                image={null}
                isLoading={isGenerating}
              />
            </div>
          )}

          {/* Curtain divider - only in curtain mode with result */}
          {viewerLayout === 'curtain' && resultImage && (
            <CurtainDivider
              position={dividerPosition}
              onPositionChange={setDividerPosition}
            />
          )}
        </div>
      </main>

      {/* Right Panel - hidden on mobile */}
      {!isMobile && (
        <aside className={styles.rightPanel}>
          <OutputOptions
            types={types}
            selectedType={editorState.typeIndex}
            selectedStyle={editorState.styleIndex}
            prompt={editorState.prompt}
            customRefImage={customRefImage}
            liveUpdate={editorState.liveUpdate}
            upscale={upscale}
            upscaleResolution={upscaleResolution}
            hideInputZone={hideInputZone}
            floatingDraw={floatingDraw}
            isGenerating={isGenerating}
            isUpscaling={isUpscaling}
            hasGeneratedImage={!!originalImage}
            onTypeChange={handleTypeChange}
            onStyleChange={handleStyleChange}
            onPromptChange={(val) => setEditorState((prev) => ({ ...prev, prompt: val }))}
            onCustomRefImageChange={setCustomRefImage}
            onLiveUpdateChange={(val) => setEditorState((prev) => ({ ...prev, liveUpdate: val }))}
            onUpscaleChange={setUpscale}
            onUpscaleResolutionChange={setUpscaleResolution}
            onUpscale={handleUpscale}
            onHideInputChange={setHideInputZone}
            onFloatingDrawChange={setFloatingDraw}
            onUpdateOutput={handleGenerate}
          />

          {/* Logo Section */}
          <div className={styles.logoSection}>
            <div className={styles.logoDivider} />
            <div className={styles.logoWrapper}>
              <img
                src="/SkeletonSkin/Logo.png"
                alt="LivableCityLAB"
                className={styles.logo}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Bar - only on mobile */}
      {isMobile && (
        <MobileBottomBar
          currentTool={currentTool}
          onToolChange={handleToolChange}
          prompt={editorState.prompt}
          onPromptChange={(val) => setEditorState((prev) => ({ ...prev, prompt: val }))}
          types={types}
          selectedType={editorState.typeIndex}
          selectedStyle={editorState.styleIndex}
          onOpenStyleSelector={() => setShowStyleSelector(true)}
          liveUpdate={editorState.liveUpdate}
          onLiveUpdateChange={(val) => setEditorState((prev) => ({ ...prev, liveUpdate: val }))}
          customRefImage={customRefImage}
          onImportRefImage={handleImportRefImage}
          upscale={upscale}
          onUpscaleChange={setUpscale}
          hasGeneratedImage={!!originalImage}
          onReset={handleReset}
          onImportImage={handleImportImage}
          onExport={handleExport}
          onColorPalette={handleColorPalette}
        />
      )}

      {/* Status Bar - hide on mobile */}
      {!isMobile && (
        <footer className={styles.statusBar}>
          <span className={`${styles.connectionStatus} ${isConnected ? styles.connected : ''}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          <span className={styles.statusMessage}>{statusMessage}</span>
        </footer>
      )}

      {/* Hidden file input for canvas import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Hidden file input for reference image */}
      <input
        ref={refImageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleRefImageFileChange}
      />

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPicker
          colors={SEGMENTATION_COLORS}
          currentColor={brushColor}
          onSelect={handleColorSelect}
          onClose={() => setShowColorPicker(false)}
          category={types[editorState.typeIndex]?.category || 'ext'}
        />
      )}

      {/* Image Import Modal */}
      {showImportModal && pendingImportImage && (
        <ImageImportModal
          imageDataUrl={pendingImportImage}
          lineMethod={lineMethod}
          onLineMethodChange={setLineMethod}
          onImport={handleImportModeSelect}
          onCancel={() => {
            setShowImportModal(false);
            setPendingImportImage(null);
          }}
        />
      )}

      {/* Style Selector Modal - for both desktop and mobile */}
      {showStyleSelector && (
        <StyleSelectorModal
          types={types}
          selectedType={editorState.typeIndex}
          selectedStyle={editorState.styleIndex}
          onTypeChange={handleTypeChange}
          onStyleChange={handleStyleChange}
          onClose={() => setShowStyleSelector(false)}
        />
      )}
    </div>
  );
}
