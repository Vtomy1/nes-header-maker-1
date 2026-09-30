import React, { useState, useEffect, useRef } from 'react';
import { decodeTile2bpp } from '../utils/nesGraphics';
import { getNESColorByIndex } from '../utils/nesPalette';

interface PatternTableViewerProps {
  chrRomBytes: Uint8Array;
  subpalettes: number[][];
  nametableBytes: Uint8Array;
}

export const PatternTableViewer: React.FC<PatternTableViewerProps> = ({
  chrRomBytes,
  subpalettes,
  nametableBytes,
}) => {
  const [selectedTable, setSelectedTable] = useState<0 | 1>(0); // 0: $0000-$0FFF, 1: $1000-$1FFF
  const [activeSubpalIndex, setActiveSubpalIndex] = useState<number>(0);
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Count usage of each tile in the 960-tile nametable
  const tileUsage = React.useMemo(() => {
    const counts = new Uint16Array(256);
    for (let i = 0; i < nametableBytes.length; i++) {
      counts[nametableBytes[i]]++;
    }
    return counts;
  }, [nametableBytes]);

  // Render 128x128 Pattern Table (16x16 tiles of 8x8 pixels)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    const imgData = ctx.createImageData(128, 128);

    const tableOffset = selectedTable * 4096;
    const currentSubpal = subpalettes[activeSubpalIndex] || [0x0F, 0x00, 0x10, 0x20];

    const rgbColors = currentSubpal.map(c => getNESColorByIndex(c));

    for (let tileIdx = 0; tileIdx < 256; tileIdx++) {
      const tileOffset = tableOffset + tileIdx * 16;
      const tileBytes = chrRomBytes.subarray(tileOffset, tileOffset + 16);
      const decodedGrid = decodeTile2bpp(tileBytes);

      const tileX = (tileIdx % 16) * 8;
      const tileY = Math.floor(tileIdx / 16) * 8;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const colorIdx = decodedGrid[y][x];
          const color = rgbColors[colorIdx] || rgbColors[0];

          const px = tileX + x;
          const py = tileY + y;
          const pi = (py * 128 + px) * 4;

          imgData.data[pi] = color.r;
          imgData.data[pi + 1] = color.g;
          imgData.data[pi + 2] = color.b;
          imgData.data[pi + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [chrRomBytes, selectedTable, activeSubpalIndex, subpalettes]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 128 / rect.width;
    const x = Math.floor((e.clientX - rect.left) * scale);
    const y = Math.floor((e.clientY - rect.top) * scale);

    if (x >= 0 && x < 128 && y >= 0 && y < 128) {
      const tileCol = Math.floor(x / 8);
      const tileRow = Math.floor(y / 8);
      const idx = tileRow * 16 + tileCol;
      setHoveredTileIndex(idx);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredTileIndex(null);
  };

  // Inspect hovered or first tile
  const inspectingIdx = hoveredTileIndex !== null ? hoveredTileIndex : 0;
  const inspectingOffset = selectedTable * 4096 + inspectingIdx * 16;
  const inspectingBytes = chrRomBytes.subarray(inspectingOffset, inspectingOffset + 16);
  const inspectingGrid = decodeTile2bpp(inspectingBytes);
  const curPal = subpalettes[activeSubpalIndex] || [0x0F, 0x00, 0x10, 0x20];
  const curRgb = curPal.map(c => getNESColorByIndex(c));

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100">CHR Pattern Table Viewer</h3>
          <p className="text-xs text-neutral-400">2bpp planar tiles (16 bytes per 8×8 tile)</p>
        </div>

        {/* Table Selector & Palette Preview Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pattern Table 0 vs 1 */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setSelectedTable(0)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                selectedTable === 0 ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              $0000-$0FFF (BG)
            </button>
            <button
              onClick={() => setSelectedTable(1)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                selectedTable === 1 ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              $1000-$1FFF (SP)
            </button>
          </div>

          {/* Subpalette Selector for previewing */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-neutral-500 mr-1">Palette:</span>
            {subpalettes.map((pal, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSubpalIndex(idx)}
                className={`flex items-center p-0.5 rounded border transition-all ${
                  activeSubpalIndex === idx ? 'border-amber-400 ring-1 ring-amber-400' : 'border-neutral-800 hover:border-neutral-700'
                }`}
                title={`Subpalette ${idx}`}
              >
                <div className="flex">
                  {pal.map((colIdx, ci) => (
                    <span
                      key={ci}
                      className="w-2.5 h-3.5 first:rounded-l last:rounded-r"
                      style={{ backgroundColor: getNESColorByIndex(colIdx).hex }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Pattern Table 128x128 (scaled up to 256x256) */}
        <div className="flex flex-col items-center">
          <div className="relative border border-neutral-800 rounded bg-black p-1 shadow-inner inline-block">
            <canvas
              ref={canvasRef}
              width={128}
              height={128}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="w-64 h-64 pixelated cursor-crosshair block"
            />
            {/* Grid overlay */}
            <div className="pointer-events-none absolute inset-1 grid grid-cols-16 grid-rows-16 opacity-10">
              {Array.from({ length: 256 }).map((_, i) => (
                <div key={i} className="border-r border-b border-white" />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 font-mono">
            Hover over tile to inspect raw 2bpp bytes
          </span>
        </div>

        {/* Selected Tile Inspector */}
        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-xs rounded font-bold">
                Tile ${inspectingIdx.toString(16).padStart(2, '0').toUpperCase()}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Dec: {inspectingIdx} · Offset: ${inspectingOffset.toString(16).padStart(4, '0').toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              Screen Usage: <span className="font-mono text-amber-400 font-bold">{tileUsage[inspectingIdx]}</span>
            </span>
          </div>

          <div className="flex gap-4 items-start">
            {/* 8x8 Zoomed View (scaled 16x = 128px) */}
            <div className="w-24 h-24 border border-neutral-700 bg-black rounded p-0.5 shrink-0 grid grid-cols-8 grid-rows-8">
              {inspectingGrid.map((row, ry) =>
                row.map((val, rx) => (
                  <div
                    key={`${ry}-${rx}`}
                    style={{ backgroundColor: curRgb[val]?.hex || '#000000' }}
                    className="w-full h-full border-[0.5px] border-black/30"
                    title={`Pixel (${rx},${ry}): color ${val}`}
                  />
                ))
              )}
            </div>

            {/* Raw 16-byte CHR Data Breakdown (Plane 0 vs Plane 1) */}
            <div className="flex-1 space-y-1.5 text-[11px] font-mono">
              <div className="text-neutral-400 font-sans text-xs">Plane 0 (Low Bit) & Plane 1 (High Bit)</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-neutral-900 border border-neutral-800/80 rounded">
                  <div className="text-neutral-500 mb-1">Plane 0 (Bytes 0..7)</div>
                  {Array.from(inspectingBytes.subarray(0, 8)).map((b, i) => (
                    <div key={i} className="flex justify-between text-neutral-300">
                      <span className="text-neutral-500">${i.toString(16)}:</span>
                      <span className="text-emerald-400">${b.toString(16).padStart(2, '0').toUpperCase()}</span>
                      <span className="text-neutral-400">%{b.toString(2).padStart(8, '0')}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2 bg-neutral-900 border border-neutral-800/80 rounded">
                  <div className="text-neutral-500 mb-1">Plane 1 (Bytes 8..15)</div>
                  {Array.from(inspectingBytes.subarray(8, 16)).map((b, i) => (
                    <div key={i} className="flex justify-between text-neutral-300">
                      <span className="text-neutral-500">${(8 + i).toString(16)}:</span>
                      <span className="text-blue-400">${b.toString(16).padStart(2, '0').toUpperCase()}</span>
                      <span className="text-neutral-400">%{b.toString(2).padStart(8, '0')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
