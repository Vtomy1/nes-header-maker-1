import React, { useState } from 'react';
import { getNESColorByIndex, NES_MASTER_PALETTE } from '../utils/nesPalette';
import { Palette, RotateCcw, X } from 'lucide-react';

interface PaletteBarProps {
  subpalettes: number[][];
  onChangeSubpalettes: (newPalettes: number[][]) => void;
  onResetDefault: () => void;
}

export const PaletteBar: React.FC<PaletteBarProps> = ({
  subpalettes,
  onChangeSubpalettes,
  onResetDefault,
}) => {
  const [editingSlot, setEditingSlot] = useState<{ paletteIndex: number; colorSlot: number } | null>(null);

  const handleSelectNESColor = (nesColorCode: number) => {
    if (!editingSlot) return;
    const { paletteIndex, colorSlot } = editingSlot;

    const newPalettes = subpalettes.map((p, pIdx) => {
      // If editing slot 0 (Universal BG), update slot 0 across ALL subpalettes
      if (colorSlot === 0) {
        return [nesColorCode, p[1], p[2], p[3]];
      }
      if (pIdx === paletteIndex) {
        const copy = [...p];
        copy[colorSlot] = nesColorCode;
        return copy;
      }
      return p;
    });

    onChangeSubpalettes(newPalettes);
    setEditingSlot(null);
  };

  const handleApplyPreset = (presetPalettes: number[][]) => {
    onChangeSubpalettes(presetPalettes);
  };

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-neutral-100">NES PPU Subpalettes ($3F00 - $3F0F)</h3>
          <span className="text-[11px] text-neutral-500 font-mono">16 colors (4 subpalettes × 4 colors)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <button
            onClick={() =>
              handleApplyPreset([
                [0x0F, 0x11, 0x21, 0x30], // Blue Sky
                [0x0F, 0x16, 0x27, 0x37], // Red/Gold
                [0x0F, 0x09, 0x19, 0x29], // Greens
                [0x0F, 0x00, 0x10, 0x20], // Grayscale
              ])
            }
            className="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Overworld
          </button>
          <button
            onClick={() =>
              handleApplyPreset([
                [0x0F, 0x02, 0x12, 0x22], // Deep Night Blues
                [0x0F, 0x06, 0x16, 0x26], // Blood Red
                [0x0F, 0x04, 0x14, 0x24], // Deep Purple
                [0x0F, 0x07, 0x17, 0x27], // Torch Fire
              ])
            }
            className="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Dungeon
          </button>
          <button
            onClick={() =>
              handleApplyPreset([
                [0x0F, 0x08, 0x19, 0x30],
                [0x0F, 0x08, 0x19, 0x30],
                [0x0F, 0x08, 0x19, 0x30],
                [0x0F, 0x08, 0x19, 0x30],
              ])
            }
            className="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Game Boy
          </button>
          <button
            onClick={onResetDefault}
            className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Reset to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Subpalette Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {subpalettes.map((subpal, palIdx) => (
          <div key={palIdx} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">Subpalette {palIdx}</span>
              <span className="text-[10px] font-mono text-neutral-500">
                PPU ${ (0x3F00 + palIdx * 4).toString(16).toUpperCase() }
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {subpal.map((colorIdx, slotIdx) => {
                const nesColor = getNESColorByIndex(colorIdx);
                const isUniversal = slotIdx === 0;
                const isSelected =
                  editingSlot?.paletteIndex === palIdx && editingSlot?.colorSlot === slotIdx;

                return (
                  <button
                    key={slotIdx}
                    onClick={() => setEditingSlot({ paletteIndex: palIdx, colorSlot: slotIdx })}
                    className={`group relative flex flex-col items-center p-1 rounded border transition-all ${
                      isSelected
                        ? 'ring-2 ring-amber-400 border-transparent shadow-lg scale-105'
                        : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <div
                      className="w-full h-7 rounded shadow-inner"
                      style={{ backgroundColor: nesColor.hex }}
                    />
                    <span className="text-[10px] font-mono font-medium text-neutral-300 mt-1">
                      ${colorIdx.toString(16).padStart(2, '0').toUpperCase()}
                    </span>
                    {isUniversal && (
                      <span className="text-[8px] text-neutral-500 tracking-tight">BG</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Full 64-Color NES Master Palette Modal / Popover */}
      {editingSlot && (
        <div className="p-4 bg-neutral-950 border border-amber-500/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-300">
                Pick NES Master Color for Subpalette {editingSlot.paletteIndex}, Slot {editingSlot.colorSlot}
              </span>
              {editingSlot.colorSlot === 0 && (
                <span className="text-[10px] text-neutral-400">(Universal BG color)</span>
              )}
            </div>
            <button
              onClick={() => setEditingSlot(null)}
              className="p-1 text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-16 gap-1">
            {NES_MASTER_PALETTE.map((c) => (
              <button
                key={c.index}
                onClick={() => handleSelectNESColor(c.index)}
                className="group relative flex flex-col items-center p-1 rounded hover:scale-110 transition-transform bg-neutral-900 border border-neutral-800 hover:border-amber-400"
                title={`$${c.index.toString(16).padStart(2, '0').toUpperCase()}: ${c.name}`}
              >
                <div className="w-5 h-5 rounded" style={{ backgroundColor: c.hex }} />
                <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
                  ${c.index.toString(16).padStart(2, '0').toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
