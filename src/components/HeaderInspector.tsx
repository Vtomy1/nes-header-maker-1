import React, { useState } from 'react';
import {
  NESHeaderConfig,
  HeaderFormat,
  MirroringMode,
  TVSystem,
} from '../types/nes';
import {
  generateHeaderBytes,
  inspectHeaderBytes,
  KNOWN_MAPPERS,
  MAPPER_PRESETS,
  exportHeaderAsm,
  exportHeaderC,
  formatHeaderHex,
} from '../utils/nesHeader';
import { Cpu, HardDrive, Tv, Layers, Copy, Check, ShieldCheck, Download, Code2 } from 'lucide-react';

interface HeaderInspectorProps {
  config: NESHeaderConfig;
  onChangeConfig: (config: NESHeaderConfig) => void;
}

export const HeaderInspector: React.FC<HeaderInspectorProps> = ({
  config,
  onChangeConfig,
}) => {
  const [selectedByteIndex, setSelectedByteIndex] = useState<number>(0);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);

  const headerBytes = generateHeaderBytes(config);
  const byteExplanations = inspectHeaderBytes(headerBytes);
  const selectedByte = byteExplanations[selectedByteIndex] || byteExplanations[0];

  const mapperInfo = KNOWN_MAPPERS[config.mapper];

  const handleApplyPreset = (presetId: string) => {
    const preset = MAPPER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChangeConfig({
        ...config,
        ...preset.defaultConfig,
      });
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  const handleDownloadBinaryHeader = () => {
    const blob = new Blob([headerBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nes_header_${config.format}_mapper${config.mapper}.bin`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Presets & Format Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {MAPPER_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  config.mapper === p.mapper && config.prgRomSizeKB === p.defaultConfig.prgRomSizeKB
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                {p.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selector: iNES 1.0 vs NES 2.0 */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            onClick={() => onChangeConfig({ ...config, format: 'ines1' })}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              config.format === 'ines1'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            iNES 1.0 Standard
          </button>
          <button
            onClick={() => onChangeConfig({ ...config, format: 'nes2' })}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              config.format === 'nes2'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            NES 2.0 Modern
          </button>
        </div>
      </div>

      {/* 16-Byte Visual Hex Matrix */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-neutral-400">
            16-Byte Header Hex Map <span className="text-neutral-600 font-mono">(Click byte to inspect)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBinaryHeader}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download 16B Binary
            </button>
            <button
              onClick={() => handleCopy(formatHeaderHex(headerBytes), 'hex')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
            >
              {copiedCodeType === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Hex
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
          {byteExplanations.map((byte) => {
            const isSelected = byte.byteIndex === selectedByteIndex;
            const isMagic = byte.byteIndex < 4;
            const isSize = byte.byteIndex === 4 || byte.byteIndex === 5;
            const isFlags = byte.byteIndex === 6 || byte.byteIndex === 7;

            let badgeColor = 'border-neutral-800 text-neutral-300 bg-neutral-950';
            if (isMagic) badgeColor = 'border-blue-500/30 text-blue-300 bg-blue-950/20';
            else if (isSize) badgeColor = 'border-emerald-500/30 text-emerald-300 bg-emerald-950/20';
            else if (isFlags) badgeColor = 'border-amber-500/30 text-amber-300 bg-amber-950/20';

            return (
              <button
                key={byte.byteIndex}
                onClick={() => setSelectedByteIndex(byte.byteIndex)}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all text-center ${badgeColor} ${
                  isSelected ? 'ring-2 ring-amber-400 border-transparent shadow-lg scale-105' : 'hover:border-neutral-600'
                }`}
              >
                <span className="text-[10px] font-mono text-neutral-500">[{byte.byteIndex}]</span>
                <span className="text-sm font-mono font-bold tracking-wider">${byte.hexValue}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Byte Inspector Card */}
        <div className="mt-4 p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">
                Byte {selectedByte.byteIndex} (${selectedByte.hexValue})
              </span>
              <span className="text-sm font-semibold text-neutral-100">{selectedByte.name}</span>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Binary: %{parseInt(selectedByte.hexValue, 16).toString(2).padStart(8, '0')}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-300 leading-relaxed">{selectedByte.summary}</p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {selectedByte.bits.map((bit, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="font-mono text-amber-400 text-[11px]">{bit.mask}</span>
                <span className="text-neutral-400 truncate mx-2">{bit.description}</span>
                <span className="font-mono font-medium text-neutral-200 shrink-0">{bit.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header Parameters Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Mapper Control */}
        <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              Mapper Number
            </label>
            <span className="text-xs font-mono px-2 py-0.5 bg-neutral-800 rounded text-neutral-300">
              ${config.mapper.toString(16).toUpperCase()}
            </span>
          </div>
          <input
            type="number"
            min={0}
            max={config.format === 'nes2' ? 4095 : 255}
            value={config.mapper}
            onChange={(e) => onChangeConfig({ ...config, mapper: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded font-mono text-sm text-neutral-100 focus:outline-none focus:border-amber-400"
          />
          <div className="text-xs text-neutral-400 min-h-[36px]">
            {mapperInfo ? (
              <div>
                <span className="text-neutral-200 font-medium">{mapperInfo.name}</span>
                <span className="text-neutral-500"> · {mapperInfo.chip}</span>
                <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{mapperInfo.description}</p>
              </div>
            ) : (
              <span className="text-neutral-500">Custom / Unregistered Mapper ID</span>
            )}
          </div>

          {config.format === 'nes2' && (
            <div className="pt-2 border-t border-neutral-800/80">
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Submapper (0-15)
              </label>
              <input
                type="number"
                min={0}
                max={15}
                value={config.submapper}
                onChange={(e) => onChangeConfig({ ...config, submapper: Math.max(0, Math.min(15, parseInt(e.target.value) || 0)) })}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* PRG & CHR ROM Sizes */}
        <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            ROM Memory Sizes
          </label>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>PRG ROM (Code)</span>
              <span className="font-mono text-neutral-200">{config.prgRomSizeKB} KB ({config.prgRomSizeKB / 16} banks)</span>
            </div>
            <select
              value={config.prgRomSizeKB}
              onChange={(e) => onChangeConfig({ ...config, prgRomSizeKB: parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              {[16, 32, 64, 128, 256, 512, 1024, 2048].map((size) => (
                <option key={size} value={size}>
                  {size} KB ({size / 16} × 16KB banks)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>CHR ROM (Tiles)</span>
              <span className="font-mono text-neutral-200">
                {config.chrRomSizeKB === 0 ? '0 KB (CHR RAM)' : `${config.chrRomSizeKB} KB (${config.chrRomSizeKB / 8} banks)`}
              </span>
            </div>
            <select
              value={config.chrRomSizeKB}
              onChange={(e) => onChangeConfig({ ...config, chrRomSizeKB: parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              <option value={0}>0 KB (Board uses 8KB CHR-RAM)</option>
              {[8, 16, 32, 64, 128, 256, 512].map((size) => (
                <option key={size} value={size}>
                  {size} KB ({size / 8} × 8KB banks)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mirroring, TV System & Flags */}
        <div className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            Hardware Configuration
          </label>

          <div>
            <span className="text-xs text-neutral-400 block mb-1">Nametable Mirroring</span>
            <select
              value={config.mirroring}
              onChange={(e) => onChangeConfig({ ...config, mirroring: e.target.value as MirroringMode })}
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              <option value="horizontal">Horizontal (Vertical scrolling games)</option>
              <option value="vertical">Vertical (Horizontal scrolling games)</option>
              <option value="four_screen">Four-Screen VRAM</option>
              <option value="single_screen_a">Single Screen (Page A)</option>
              <option value="single_screen_b">Single Screen (Page B)</option>
            </select>
          </div>

          <div>
            <span className="text-xs text-neutral-400 block mb-1">TV Timing System</span>
            <div className="flex gap-2">
              {(['ntsc', 'pal', 'dual'] as TVSystem[]).map((tv) => (
                <button
                  key={tv}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, tvSystem: tv })}
                  className={`flex-1 py-1 text-xs rounded uppercase font-medium transition-colors ${
                    config.tvSystem === tv
                      ? 'bg-neutral-800 text-amber-400 border border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {tv}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={config.batteryBackedRam}
                onChange={(e) => onChangeConfig({ ...config, batteryBackedRam: e.target.checked })}
                className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0"
              />
              <span>Battery-backed PRG-RAM ($6000-$7FFF)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={config.trainer}
                onChange={(e) => onChangeConfig({ ...config, trainer: e.target.checked })}
                className="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0"
              />
              <span>512-byte Trainer at $7000-$71FF</span>
            </label>
          </div>
        </div>
      </div>

      {/* Assembly & C Header Source Preview */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <Code2 className="w-4 h-4 text-amber-400" />
            ASM & C Source Code Definition
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(exportHeaderAsm(headerBytes, config), 'asm')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
            >
              {copiedCodeType === 'asm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy .asm (ca65)
            </button>
            <button
              onClick={() => handleCopy(exportHeaderC(headerBytes, config), 'c')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
            >
              {copiedCodeType === 'c' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy .h (C Header)
            </button>
          </div>
        </div>

        <pre className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto max-h-48">
          {exportHeaderAsm(headerBytes, config)}
        </pre>
      </div>
    </div>
  );
};
