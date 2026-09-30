import React, { useState, useRef, useEffect } from 'react';
import {
  ImageProcessingOptions,
  DitherAlgorithm,
  QuantizeMode,
  ScalingMode,
  NESConversionResult,
  NESHeaderConfig,
} from '../types/nes';
import { scaleImageToBuffer, processImageToNES, NES_WIDTH, NES_HEIGHT } from '../utils/nesGraphics';
import { buildCompleteNESRom } from '../utils/nesRomBuilder';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { DEFAULT_NES_SUBPALETTES } from '../utils/nesPalette';
import {
  Sliders,
  Tv,
  Grid,
  Maximize2,
  Upload,
  Layers,
  Sparkles,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface ImageConverterProps {
  headerConfig: NESHeaderConfig;
  subpalettes: number[][];
  onConversionUpdated: (result: NESConversionResult) => void;
  externalChrBytes?: Uint8Array;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({
  headerConfig,
  subpalettes,
  onConversionUpdated,
}) => {
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(SAMPLE_IMAGES[0].generateDataUrl());
  const [activeSampleId, setActiveSampleId] = useState<string>(SAMPLE_IMAGES[0].id);

  // Processing options
  const [options, setOptions] = useState<ImageProcessingOptions>({
    dither: 'floyd_steinberg',
    quantizeMode: 'nes_subpalettes',
    scaling: 'fit',
    brightness: 0,
    contrast: 10,
    saturation: 15,
  });

  // Display toggles
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showTileGrid, setShowTileGrid] = useState<boolean>(false);
  const [showAttributeGrid, setShowAttributeGrid] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<{
    uniqueTiles: number;
    dedupRatio: number;
  }>({ uniqueTiles: 0, dedupRatio: 0 });

  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-run conversion when image, options, subpalettes, or headerConfig change
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Scale image into 256x240 buffer
      const scaledData = scaleImageToBuffer(img, options.scaling);

      // Draw original scaled image to originalCanvas if needed
      if (originalCanvasRef.current) {
        const origCtx = originalCanvasRef.current.getContext('2d');
        if (origCtx) {
          origCtx.imageSmoothingEnabled = false;
          origCtx.putImageData(scaledData, 0, 0);
        }
      }

      // 2. Process to NES graphics
      const graphics = processImageToNES(scaledData, options, subpalettes);

      // 3. Render quantized NES graphics to screen canvas
      if (screenCanvasRef.current) {
        const screenCtx = screenCanvasRef.current.getContext('2d');
        if (screenCtx) {
          screenCtx.imageSmoothingEnabled = false;
          screenCtx.putImageData(graphics.previewImageData, 0, 0);
        }
      }

      // 4. Build complete ROM and notify parent
      const result = buildCompleteNESRom(headerConfig, graphics);
      setStats({
        uniqueTiles: result.uniqueTileCount,
        dedupRatio: result.tileDeduplicationRatio,
      });
      onConversionUpdated(result);
    };
    img.src = currentImageSrc;
  }, [currentImageSrc, options, subpalettes, headerConfig, onConversionUpdated]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentImageSrc(event.target.result as string);
          setActiveSampleId('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (sampleId: string) => {
    const sample = SAMPLE_IMAGES.find((s) => s.id === sampleId);
    if (sample) {
      setCurrentImageSrc(sample.generateDataUrl());
      setActiveSampleId(sample.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Selector & Image Upload Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Sample Art
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleClick(sample.id)}
                className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  activeSampleId === sample.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-lg text-xs font-medium cursor-pointer transition-colors">
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Custom Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Main Studio Viewport & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Screen Display Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-4">
          {/* Top Canvas Bar Controls */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200">
                NES Screen Buffer
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                256×240 px (32×30 tiles)
              </span>
            </div>

            {/* Quick View Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`px-2 py-1 text-[11px] rounded transition-colors flex items-center gap-1 ${
                  showOriginal
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
                title="Toggle Original vs NES Render"
              >
                <Eye className="w-3 h-3" />
                Original
              </button>

              <button
                onClick={() => setShowScanlines(!showScanlines)}
                className={`p-1.5 text-xs rounded transition-colors ${
                  showScanlines
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
                title="Toggle CRT Scanlines"
              >
                <Tv className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowTileGrid(!showTileGrid)}
                className={`px-2 py-1 text-[11px] rounded transition-colors flex items-center gap-1 ${
                  showTileGrid
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
                title="Toggle 8x8 Tile Grid"
              >
                <Grid className="w-3 h-3" />
                8×8
              </button>

              <button
                onClick={() => setShowAttributeGrid(!showAttributeGrid)}
                className={`px-2 py-1 text-[11px] rounded transition-colors flex items-center gap-1 ${
                  showAttributeGrid
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
                title="Toggle 16x16 Attribute Grid"
              >
                <Layers className="w-3 h-3" />
                16×16
              </button>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-0.5 ml-1 bg-neutral-950 border border-neutral-800 rounded p-0.5">
                {[1, 2, 2.5].map((z) => (
                  <button
                    key={z}
                    onClick={() => setZoomLevel(z)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                      zoomLevel === z
                        ? 'bg-neutral-800 text-amber-300'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NES Display Screen Frame */}
          <div className="relative border-4 border-neutral-800 rounded-xl overflow-hidden bg-black shadow-2xl">
            {/* The Main 256x240 NES Canvas */}
            <canvas
              ref={screenCanvasRef}
              width={NES_WIDTH}
              height={NES_HEIGHT}
              className={`pixelated block ${showOriginal ? 'hidden' : 'block'}`}
              style={{
                width: `${NES_WIDTH * zoomLevel}px`,
                height: `${NES_HEIGHT * zoomLevel}px`,
              }}
            />

            {/* Optional Original Image View */}
            <canvas
              ref={originalCanvasRef}
              width={NES_WIDTH}
              height={NES_HEIGHT}
              className={`pixelated block ${showOriginal ? 'block' : 'hidden'}`}
              style={{
                width: `${NES_WIDTH * zoomLevel}px`,
                height: `${NES_HEIGHT * zoomLevel}px`,
              }}
            />

            {/* CRT Scanline Overlay */}
            {showScanlines && !showOriginal && (
              <div className="absolute inset-0 crt-scanlines pointer-events-none" />
            )}

            {/* 8x8 Tile Grid Overlay */}
            {showTileGrid && !showOriginal && (
              <div
                className="absolute inset-0 pointer-events-none grid grid-cols-32 grid-rows-30 opacity-20"
                style={{
                  gridTemplateColumns: 'repeat(32, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(30, minmax(0, 1fr))',
                }}
              >
                {Array.from({ length: 960 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-cyan-400" />
                ))}
              </div>
            )}

            {/* 16x16 Attribute Box Grid Overlay */}
            {showAttributeGrid && !showOriginal && (
              <div
                className="absolute inset-0 pointer-events-none grid opacity-30"
                style={{
                  gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
                }}
              >
                {Array.from({ length: 240 }).map((_, i) => (
                  <div key={i} className="border-2 border-amber-400" />
                ))}
              </div>
            )}
          </div>

          {/* Screen Metrics Row */}
          <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 block text-[11px]">Unique 8×8 Tiles</span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {stats.uniqueTiles} <span className="text-neutral-500 font-normal text-xs">/ 256</span>
              </span>
            </div>

            <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 block text-[11px]">Deduplication Savings</span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {stats.dedupRatio}%
              </span>
            </div>

            <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
              <span className="text-neutral-500 block text-[11px]">Screen Format</span>
              <span className="font-mono text-xs font-semibold text-neutral-300">
                NTSC 256×240
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quantization & Image Tuning Controls (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              NES Graphics Converter Settings
            </h3>
          </div>

          {/* Dithering Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Dithering Algorithm
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'floyd_steinberg', label: 'Floyd-Steinberg' },
                { id: 'atkinson', label: 'Atkinson' },
                { id: 'bayer', label: 'Bayer 4×4 Ordered' },
                { id: 'none', label: 'None (Nearest)' },
              ].map((algo) => (
                <button
                  key={algo.id}
                  onClick={() =>
                    setOptions({ ...options, dither: algo.id as DitherAlgorithm })
                  }
                  className={`px-2.5 py-1.5 text-xs rounded transition-colors text-left truncate ${
                    options.dither === algo.id
                      ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 font-semibold'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantization Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Color Architecture
            </label>
            <div className="space-y-1">
              {[
                {
                  id: 'nes_subpalettes',
                  label: 'Authentic NES 16×16 Attributes',
                  desc: 'Enforces hardware rule: 1 universal background + 4 subpalettes of 3 colors each per 16x16 attribute cell.',
                },
                {
                  id: 'grayscale_4',
                  label: '4-Color Retro Game Boy / Mono',
                  desc: '4 uniform luminance steps suitable for minimal tile budgets.',
                },
                {
                  id: 'master_palette_free',
                  label: 'Full 64-Color NES Master Palette',
                  desc: 'Nearest color from 2C02 palette without attribute limits.',
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    setOptions({ ...options, quantizeMode: mode.id as QuantizeMode })
                  }
                  className={`w-full p-2 text-left rounded border transition-colors ${
                    options.quantizeMode === mode.id
                      ? 'bg-neutral-800 border-amber-500/40 text-neutral-100'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-semibold block text-neutral-200">
                    {mode.label}
                  </span>
                  <span className="text-[11px] text-neutral-500 leading-tight block mt-0.5">
                    {mode.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Image Scaling */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 block">
              Aspect & Scaling
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'fit', label: 'Fit' },
                { id: 'fill', label: 'Fill' },
                { id: 'stretch', label: 'Stretch' },
                { id: 'center', label: 'Center' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setOptions({ ...options, scaling: s.id as ScalingMode })
                  }
                  className={`py-1 text-xs rounded uppercase font-medium transition-colors ${
                    options.scaling === s.id
                      ? 'bg-neutral-800 text-amber-400 border border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Adjustments (Brightness, Contrast, Saturation) */}
          <div className="pt-2 border-t border-neutral-800/80 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Brightness</span>
                <span className="font-mono">{options.brightness > 0 ? `+${options.brightness}` : options.brightness}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={options.brightness}
                onChange={(e) =>
                  setOptions({ ...options, brightness: parseInt(e.target.value) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Contrast</span>
                <span className="font-mono">{options.contrast > 0 ? `+${options.contrast}` : options.contrast}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={options.contrast}
                onChange={(e) =>
                  setOptions({ ...options, contrast: parseInt(e.target.value) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Saturation</span>
                <span className="font-mono">{options.saturation > 0 ? `+${options.saturation}` : options.saturation}</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={options.saturation}
                onChange={(e) =>
                  setOptions({ ...options, saturation: parseInt(e.target.value) })
                }
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
