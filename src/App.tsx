/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  NESHeaderConfig,
  NESConversionResult,
} from './types/nes';
import { createDefaultHeaderConfig } from './utils/nesHeader';
import { DEFAULT_NES_SUBPALETTES } from './utils/nesPalette';
import { HeaderInspector } from './components/HeaderInspector';
import { ImageConverter } from './components/ImageConverter';
import { PatternTableViewer } from './components/PatternTableViewer';
import { PaletteBar } from './components/PaletteBar';
import { RomInspector } from './components/RomInspector';
import { ExportModal } from './components/ExportModal';
import {
  Gamepad2,
  HardDrive,
  Cpu,
  Layers,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'pattern' | 'palette' | 'inspector' | 'docs'>('studio');
  const [headerConfig, setHeaderConfig] = useState<NESHeaderConfig>(createDefaultHeaderConfig());
  const [subpalettes, setSubpalettes] = useState<number[][]>(DEFAULT_NES_SUBPALETTES);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Conversion result maintained from ImageConverter
  const [conversionResult, setConversionResult] = useState<NESConversionResult | null>(null);

  const handleConversionUpdated = (result: NESConversionResult) => {
    setConversionResult(result);
  };

  const handleLoadRomFromInspector = (loadedConfig: NESHeaderConfig, chrBytes?: Uint8Array) => {
    setHeaderConfig(loadedConfig);
    if (chrBytes && conversionResult) {
      const updatedChr = new Uint8Array(8192);
      updatedChr.set(chrBytes.subarray(0, 8192));
      setConversionResult({
        ...conversionResult,
        chrRomBytes: updatedChr,
      });
    }
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (Action) */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50" />
              NES ROM Studio
            </span>
          </div>

          {/* Zone 2: 4-6 Clean Text Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <button
              onClick={() => setActiveTab('studio')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'studio'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              Image & Header Studio
            </button>

            <button
              onClick={() => setActiveTab('pattern')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'pattern'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              CHR Pattern Table
            </button>

            <button
              onClick={() => setActiveTab('palette')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'palette'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              Subpalettes
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'inspector'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              ROM Inspector & Fixer
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`transition-colors pb-0.5 ${
                activeTab === 'docs'
                  ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                  : 'hover:text-neutral-200'
              }`}
            >
              iNES Specification
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExportOpen(true)}
              disabled={!conversionResult}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ROM & Assets</span>
            </button>
          </div>
        </div>
      </header>

      {/* Clean Unboxed Metadata Status Kicker (Zero-Pill Rule) */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-neutral-200 uppercase tracking-wider">
              {headerConfig.format === 'nes2' ? 'NES 2.0 Modern' : 'iNES 1.0 Standard'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Mapper {headerConfig.mapper}</span>
            <span aria-hidden="true">·</span>
            <span>PRG: {headerConfig.prgRomSizeKB} KB</span>
            <span aria-hidden="true">·</span>
            <span>CHR: {headerConfig.chrRomSizeKB === 0 ? '0 KB (RAM)' : `${headerConfig.chrRomSizeKB} KB`}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{headerConfig.mirroring.replace('_', ' ')} Mirroring</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase">{headerConfig.tvSystem}</span>
          </div>

          {conversionResult && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
              <span>Tiles: {conversionResult.uniqueTileCount}/256</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">{conversionResult.tileDeduplicationRatio}% Deduplicated</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Mobile Tab Selectors */}
        <div className="flex md:hidden overflow-x-auto gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
          {[
            { id: 'studio', label: 'Studio' },
            { id: 'pattern', label: 'Pattern Table' },
            { id: 'palette', label: 'Palettes' },
            { id: 'inspector', label: 'Inspector' },
            { id: 'docs', label: 'Docs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded whitespace-nowrap ${
                activeTab === tab.id ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Studio (Image Converter + Header Inspector) */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            <section>
              <div className="mb-3">
                <h1 className="text-xl font-bold text-neutral-100">Image to NES ROM & Graphics Pipeline</h1>
                <p className="text-xs text-neutral-400">
                  Quantize images to authentic NES 2C02 hardware specifications (256×240 resolution, 2bpp planar tiles, 16×16 attribute grid).
                </p>
              </div>
              <ImageConverter
                headerConfig={headerConfig}
                subpalettes={subpalettes}
                onConversionUpdated={handleConversionUpdated}
              />
            </section>

            <section className="pt-4 border-t border-neutral-800">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-neutral-100">16-Byte ROM Header Inspector & Editor</h2>
                <p className="text-xs text-neutral-400">
                  Inspect every bit of the iNES or NES 2.0 header. Switch mappers, adjust PRG/CHR bank counts, and export ASM definitions.
                </p>
              </div>
              <HeaderInspector config={headerConfig} onChangeConfig={setHeaderConfig} />
            </section>
          </div>
        )}

        {/* Tab 2: Pattern Table Viewer */}
        {activeTab === 'pattern' && conversionResult && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100">CHR-ROM Pattern Tables</h2>
              <p className="text-xs text-neutral-400">
                Inspect 8×8 tiles in 2bpp planar bitplanes, hover to view binary representation, and examine tile reuse.
              </p>
            </div>
            <PatternTableViewer
              chrRomBytes={conversionResult.chrRomBytes}
              subpalettes={subpalettes}
              nametableBytes={conversionResult.nametableBytes}
            />
          </div>
        )}

        {/* Tab 3: Subpalette Editor */}
        {activeTab === 'palette' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100">NES PPU Subpalette Configuration</h2>
              <p className="text-xs text-neutral-400">
                Customize the 4 background subpalettes from the 64-color RP2C02 master palette. Slot 0 is universal background.
              </p>
            </div>
            <PaletteBar
              subpalettes={subpalettes}
              onChangeSubpalettes={setSubpalettes}
              onResetDefault={() => setSubpalettes(DEFAULT_NES_SUBPALETTES)}
            />
          </div>
        )}

        {/* Tab 4: ROM File Inspector & Header Fixer */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-100">NES ROM Header Inspector & Repair Tool</h2>
              <p className="text-xs text-neutral-400">
                Validate real cartridge ROM dumps, eliminate dirty DiskDude! bytes, inspect memory mapping, and import into the studio.
              </p>
            </div>
            <RomInspector onLoadRomToEditor={handleLoadRomFromInspector} />
          </div>
        )}

        {/* Tab 5: Technical Docs & Spec Reference */}
        {activeTab === 'docs' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-100">NES ROM Header & Graphics Architecture</h2>
              <p className="text-xs text-neutral-400">
                Reference guide for Nintendo Entertainment System cartridge format and PPU graphics constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-neutral-200">The 16-Byte iNES Header</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Introduced by Marat Fayzullin in 1996 for the iNES emulator, standardizing cartridge dumps into a uniform file format:
                </p>
                <ul className="space-y-1 font-mono text-[11px] text-neutral-300 list-disc list-inside">
                  <li>Bytes 0-3: Identification "NES\x1A" ($4E $45 $53 $1A)</li>
                  <li>Byte 4: PRG ROM size in 16 KB units</li>
                  <li>Byte 5: CHR ROM size in 8 KB units (0 = CHR RAM)</li>
                  <li>Byte 6: Flags 6 (Mirroring, Battery, Trainer, Mapper low)</li>
                  <li>Byte 7: Flags 7 (Format, Mapper high, VS/PlayChoice)</li>
                  <li>Byte 8: Flags 8 (PRG-RAM size in 8KB units)</li>
                  <li>Byte 9: Flags 9 (TV system NTSC/PAL)</li>
                  <li>Bytes 10-15: Reserved padding bytes (must be zero)</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-neutral-200">NES 2.0 Modern Extension</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Defined in 2006 to fix ambiguities in iNES 1.0. Identified by setting bits 2 and 3 of Byte 7 to <code className="text-amber-400">%10</code>:
                </p>
                <ul className="space-y-1 font-mono text-[11px] text-neutral-300 list-disc list-inside">
                  <li>Byte 8: 12-bit Mapper MSB & 4-bit Submapper</li>
                  <li>Byte 9: PRG-ROM & CHR-ROM size MSBs (up to 64 MB)</li>
                  <li>Byte 10: PRG-RAM & PRG-NVRAM shift counts</li>
                  <li>Byte 11: CHR-RAM & CHR-NVRAM shift counts</li>
                  <li>Byte 12: CPU/PPU timing (NTSC, PAL, Dendy)</li>
                  <li>Byte 13: Extended console & hardware types</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-neutral-200">2bpp Planar Tile Encoding</h3>
                <p className="text-neutral-400 leading-relaxed">
                  The Picture Processing Unit (PPU) decodes graphics in 8×8 pixel tiles using two 8-byte bitplanes (16 bytes per tile total).
                </p>
                <p className="text-neutral-400 leading-relaxed">
                  Plane 0 holds the low bit of each pixel and Plane 1 holds the high bit. Combining bit 0 and bit 1 produces color index 0, 1, 2, or 3.
                </p>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                <h3 className="font-semibold text-neutral-200">Attribute Table & Color Constraints</h3>
                <p className="text-neutral-400 leading-relaxed">
                  The NES screen is 256×240 pixels (32×30 tiles). A 64-byte attribute table specifies which of the 4 subpalettes is used by each 16×16 pixel block.
                </p>
                <p className="text-neutral-400 leading-relaxed">
                  Each subpalette has 4 colors. The first color ($3F00) is shared as the universal background color across the entire screen.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>NES ROM Header & Image Converter</span>
          <span>Authentic 6502 Machine Code & 2C02 PPU Graphics Engine</span>
        </div>
      </footer>

      {/* Export Modal */}
      {conversionResult && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          config={headerConfig}
          result={conversionResult}
        />
      )}
    </div>
  );
}
