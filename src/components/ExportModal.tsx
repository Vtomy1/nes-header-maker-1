import React, { useState } from 'react';
import { NESConversionResult, NESHeaderConfig } from '../types/nes';
import { exportHeaderAsm, exportHeaderC, formatHeaderHex } from '../utils/nesHeader';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  Palette as PaletteIcon,
  X,
  Gamepad2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NESHeaderConfig;
  result: NESConversionResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
  result,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const triggerDownload = (bytes: Uint8Array, filename: string, mime = 'application/octet-stream') => {
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-neutral-100">Export NES Assets & ROM</h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Download: Playable .nes ROM */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-neutral-100">Playable NES ROM (.nes)</span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                {(result.fullRomBytes.length / 1024).toFixed(1)} KB
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Complete cartridge ROM with your custom {config.format.toUpperCase()} header, bootable 6502 viewer code, and 2bpp CHR tiles. Ready to run in Mesen, FCEUX, or Nestopia!
            </p>
          </div>
          <button
            onClick={() => triggerDownload(result.fullRomBytes, `nes_picture_viewer_m${config.mapper}.nes`)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-md"
          >
            Download .nes ROM
          </button>
        </div>

        {/* Secondary Asset Downloads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Raw Header Binary */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-200 block">16-Byte Header (.bin)</span>
              <span className="text-neutral-500 text-[11px] font-mono">16 bytes raw binary</span>
            </div>
            <button
              onClick={() => triggerDownload(result.headerBytes, `header_mapper${config.mapper}.bin`)}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
              title="Download Header"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* CHR-ROM */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-200 block">CHR-ROM Tileset (.chr)</span>
              <span className="text-neutral-500 text-[11px] font-mono">
                {result.chrRomBytes.length} bytes (YY-CHR format)
              </span>
            </div>
            <button
              onClick={() => triggerDownload(result.chrRomBytes, 'tileset.chr')}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
              title="Download CHR"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Nametable + Attribute */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-200 block">Nametable & Attributes (.nam)</span>
              <span className="text-neutral-500 text-[11px] font-mono">1024 bytes (960 NT + 64 ATTR)</span>
            </div>
            <button
              onClick={() => {
                const combined = new Uint8Array(1024);
                combined.set(result.nametableBytes, 0);
                combined.set(result.attributeBytes, 960);
                triggerDownload(combined, 'screen.nam');
              }}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
              title="Download Nametable"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Palette Data */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-200 block">Palette File (.pal)</span>
              <span className="text-neutral-500 text-[11px] font-mono">32 bytes PPU palette</span>
            </div>
            <button
              onClick={() => triggerDownload(result.paletteBytes, 'palette.pal')}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded transition-colors"
              title="Download Palette"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Source Code Exporters */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">Source Code Include</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(exportHeaderAsm(result.headerBytes, config), 'asm')}
                className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors flex items-center gap-1.5"
              >
                {copiedType === 'asm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy ca65 .asm
              </button>
              <button
                onClick={() => handleCopy(exportHeaderC(result.headerBytes, config), 'c')}
                className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors flex items-center gap-1.5"
              >
                {copiedType === 'c' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy C .h
              </button>
            </div>
          </div>

          <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-36">
            {exportHeaderAsm(result.headerBytes, config)}
          </pre>
        </div>
      </div>
    </div>
  );
};
