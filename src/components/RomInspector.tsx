import React, { useState } from 'react';
import { parseHeaderBytes, formatHeaderHex, inspectHeaderBytes, KNOWN_MAPPERS } from '../utils/nesHeader';
import { NESHeaderConfig } from '../types/nes';
import { Upload, AlertTriangle, CheckCircle, FileCode, Wrench, Download } from 'lucide-react';

interface RomInspectorProps {
  onLoadRomToEditor: (config: NESHeaderConfig, chrBytes?: Uint8Array) => void;
}

export const RomInspector: React.FC<RomInspectorProps> = ({ onLoadRomToEditor }) => {
  const [romFile, setRomFile] = useState<{
    name: string;
    size: number;
    rawBytes: Uint8Array;
    config: NESHeaderConfig;
    isValid: boolean;
    error?: string;
    hasDirtyBytes: boolean;
  } | null>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const rawBytes = new Uint8Array(buffer);
      const parsed = parseHeaderBytes(rawBytes.subarray(0, 16));

      // Check for legacy "DiskDude!" or dirty bytes in bytes 7-15 for iNES 1.0
      let hasDirtyBytes = false;
      if (parsed.isValid && parsed.config.format === 'ines1') {
        for (let b = 11; b < 16; b++) {
          if (rawBytes[b] !== 0) {
            hasDirtyBytes = true;
            break;
          }
        }
      }

      setRomFile({
        name: file.name,
        size: rawBytes.length,
        rawBytes,
        config: parsed.config,
        isValid: parsed.isValid,
        error: parsed.error,
        hasDirtyBytes,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFixAndCleanRom = () => {
    if (!romFile) return;
    const cleaned = new Uint8Array(romFile.rawBytes);
    // Zero out bytes 11-15
    for (let i = 11; i < 16; i++) {
      cleaned[i] = 0;
    }

    const blob = new Blob([cleaned.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = romFile.name.replace(/\.nes$/i, '_clean.nes');
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToStudio = () => {
    if (!romFile || !romFile.isValid) return;

    // Extract CHR ROM if available
    const header = romFile.rawBytes.subarray(0, 16);
    const trainerSize = (header[6] & 0x04) ? 512 : 0;
    const prgSize = romFile.config.prgRomSizeKB * 1024;
    const chrOffset = 16 + trainerSize + prgSize;
    const chrSize = romFile.config.chrRomSizeKB * 1024;

    let extractedChr: Uint8Array | undefined = undefined;
    if (chrSize > 0 && romFile.rawBytes.length >= chrOffset + chrSize) {
      extractedChr = romFile.rawBytes.subarray(chrOffset, chrOffset + chrSize);
    }

    onLoadRomToEditor(romFile.config, extractedChr);
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-2xl p-8 text-center transition-colors bg-neutral-900/30"
      >
        <Upload className="w-10 h-10 mx-auto text-neutral-500 mb-3" />
        <h3 className="text-base font-semibold text-neutral-200">
          Drop any .nes ROM file to inspect or repair
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
          Analyze the 16-byte iNES or NES 2.0 header, verify checksums, detect dirty DiskDude! bytes,
          and load existing CHR tiles.
        </p>

        <label className="inline-block mt-4">
          <span className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 rounded-lg cursor-pointer transition-colors">
            Browse .nes File
          </span>
          <input
            type="file"
            accept=".nes,.bin,.rom"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
        </label>
      </div>

      {/* ROM Analysis Result */}
      {romFile && (
        <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm text-neutral-100">{romFile.name}</span>
                <span className="text-xs font-mono text-neutral-400">
                  ({(romFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {romFile.isValid ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Valid NES Header</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{romFile.error}</span>
                </div>
              )}
            </div>
          </div>

          {romFile.isValid && (
            <>
              {/* Header Hex Dump */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs flex items-center justify-between">
                <span className="text-neutral-500">Header Hex:</span>
                <span className="text-amber-400 font-bold tracking-widest">
                  {formatHeaderHex(romFile.rawBytes.subarray(0, 16))}
                </span>
              </div>

              {/* Warnings / Dirty Bytes notice */}
              {romFile.hasDirtyBytes && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Legacy dirty bytes detected in padding (bytes 11-15)! This can cause emulator incompatibility with NES 2.0.
                    </span>
                  </div>
                  <button
                    onClick={handleFixAndCleanRom}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded shrink-0 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Clean & Download
                  </button>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded">
                  <span className="text-neutral-500 block">Header Format</span>
                  <span className="font-semibold text-neutral-200 uppercase mt-0.5 block">
                    {romFile.config.format === 'nes2' ? 'NES 2.0 Modern' : 'iNES 1.0'}
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded">
                  <span className="text-neutral-500 block">Mapper</span>
                  <span className="font-semibold text-neutral-200 mt-0.5 block">
                    Mapper {romFile.config.mapper} ({KNOWN_MAPPERS[romFile.config.mapper]?.name || 'Custom'})
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded">
                  <span className="text-neutral-500 block">PRG ROM Size</span>
                  <span className="font-semibold text-neutral-200 font-mono mt-0.5 block">
                    {romFile.config.prgRomSizeKB} KB ({romFile.config.prgRomSizeKB / 16} banks)
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded">
                  <span className="text-neutral-500 block">CHR ROM Size</span>
                  <span className="font-semibold text-neutral-200 font-mono mt-0.5 block">
                    {romFile.config.chrRomSizeKB === 0 ? '0 KB (CHR-RAM)' : `${romFile.config.chrRomSizeKB} KB`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSendToStudio}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Load Header & Graphics Into Studio
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
