import { NESColor } from '../types/nes';

// Authentic RP2C02 NES Palette (FCEUX / Mesen standard reference)
export const NES_MASTER_PALETTE: NESColor[] = [
  { index: 0x00, hex: '#666666', r: 102, g: 102, b: 102, name: 'Dark Gray' },
  { index: 0x01, hex: '#002A88', r: 0, g: 42, b: 136, name: 'Deep Azure' },
  { index: 0x02, hex: '#1412A7', r: 20, g: 18, b: 167, name: 'Deep Blue' },
  { index: 0x03, hex: '#3B00A4', r: 59, g: 0, b: 164, name: 'Deep Violet' },
  { index: 0x04, hex: '#5C007E', r: 92, g: 0, b: 126, name: 'Deep Magenta' },
  { index: 0x05, hex: '#6E0040', r: 110, g: 0, b: 64, name: 'Deep Rose' },
  { index: 0x06, hex: '#6C0600', r: 108, g: 6, b: 0, name: 'Deep Red' },
  { index: 0x07, hex: '#561D00', r: 86, g: 29, b: 0, name: 'Deep Orange-Brown' },
  { index: 0x08, hex: '#333500', r: 51, g: 53, b: 0, name: 'Deep Olive' },
  { index: 0x09, hex: '#0B4800', r: 11, g: 72, b: 0, name: 'Deep Forest Green' },
  { index: 0x0A, hex: '#005200', r: 0, g: 82, b: 0, name: 'Deep Green' },
  { index: 0x0B, hex: '#004F08', r: 0, g: 79, b: 8, name: 'Deep Emerald' },
  { index: 0x0C, hex: '#00404D', r: 0, g: 64, b: 77, name: 'Deep Cyan' },
  { index: 0x0D, hex: '#000000', r: 0, g: 0, b: 0, name: 'Pitch Black' },
  { index: 0x0E, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black (Mirror)' },
  { index: 0x0F, hex: '#000000', r: 0, g: 0, b: 0, name: 'Universal Black' },

  { index: 0x10, hex: '#ADADAD', r: 173, g: 173, b: 173, name: 'Medium Gray' },
  { index: 0x11, hex: '#155FD9', r: 21, g: 95, b: 217, name: 'Sky Blue' },
  { index: 0x12, hex: '#4240FF', r: 66, g: 64, b: 255, name: 'Electric Blue' },
  { index: 0x13, hex: '#7527FE', r: 117, g: 39, b: 254, name: 'Purple' },
  { index: 0x14, hex: '#A01ACC', r: 160, g: 26, b: 204, name: 'Magenta' },
  { index: 0x15, hex: '#B71E7B', r: 183, g: 30, b: 123, name: 'Crimson Pink' },
  { index: 0x16, hex: '#B53120', r: 181, g: 49, b: 32, name: 'Red Orange' },
  { index: 0x17, hex: '#994E00', r: 153, g: 78, b: 0, name: 'Rust Amber' },
  { index: 0x18, hex: '#6B6D00', r: 107, g: 109, b: 0, name: 'Olive Green' },
  { index: 0x19, hex: '#388700', r: 56, g: 135, b: 0, name: 'Lime Green' },
  { index: 0x1A, hex: '#0C9300', r: 12, g: 147, b: 0, name: 'Emerald' },
  { index: 0x1B, hex: '#008F32', r: 0, g: 143, b: 50, name: 'Mint Green' },
  { index: 0x1C, hex: '#007C8D', r: 0, g: 124, b: 141, name: 'Teal Blue' },
  { index: 0x1D, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },
  { index: 0x1E, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },
  { index: 0x1F, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },

  { index: 0x20, hex: '#FFFFFF', r: 255, g: 255, b: 255, name: 'Pure White' },
  { index: 0x21, hex: '#64B0FF', r: 100, g: 176, b: 255, name: 'Pastel Cyan' },
  { index: 0x22, hex: '#9290FF', r: 146, g: 144, b: 255, name: 'Periwinkle' },
  { index: 0x23, hex: '#C676FF', r: 198, g: 118, b: 255, name: 'Lilac' },
  { index: 0x24, hex: '#F36AFF', r: 243, g: 106, b: 255, name: 'Bright Pink' },
  { index: 0x25, hex: '#FE6ECC', r: 254, g: 110, b: 204, name: 'Carnation' },
  { index: 0x26, hex: '#FE8170', r: 254, g: 129, b: 112, name: 'Coral' },
  { index: 0x27, hex: '#EA9E22', r: 234, g: 158, b: 34, name: 'Golden Amber' },
  { index: 0x28, hex: '#BCBE00', r: 188, g: 190, b: 0, name: 'Yellow Green' },
  { index: 0x29, hex: '#88D800', r: 136, g: 216, b: 0, name: 'Chartreuse' },
  { index: 0x2A, hex: '#5CE430', r: 92, g: 228, b: 48, name: 'Bright Green' },
  { index: 0x2B, hex: '#45E082', r: 69, g: 224, b: 130, name: 'Aquamarine' },
  { index: 0x2C, hex: '#48CDDE', r: 72, g: 205, b: 222, name: 'Light Turquoise' },
  { index: 0x2D, hex: '#4F4F4F', r: 79, g: 79, b: 79, name: 'Slate Gray' },
  { index: 0x2E, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },
  { index: 0x2F, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },

  { index: 0x30, hex: '#FFFFFF', r: 255, g: 255, b: 255, name: 'Pure White (Mirror)' },
  { index: 0x31, hex: '#C0E0FF', r: 192, g: 224, b: 255, name: 'Ice Blue' },
  { index: 0x32, hex: '#D3D2FF', r: 211, g: 210, b: 255, name: 'Lavender' },
  { index: 0x33, hex: '#E8C8FF', r: 232, g: 200, b: 255, name: 'Pale Violet' },
  { index: 0x34, hex: '#FBC2FF', r: 251, g: 194, b: 255, name: 'Pale Rose' },
  { index: 0x35, hex: '#FEC4EA', r: 254, g: 196, b: 234, name: 'Blush' },
  { index: 0x36, hex: '#FECCC5', r: 254, g: 204, b: 197, name: 'Pale Peach' },
  { index: 0x37, hex: '#F7D8A5', r: 247, g: 216, b: 165, name: 'Vanilla Cream' },
  { index: 0x38, hex: '#E4E594', r: 228, g: 229, b: 148, name: 'Pale Sand' },
  { index: 0x39, hex: '#CFEF96', r: 207, g: 239, b: 150, name: 'Pale Celery' },
  { index: 0x3A, hex: '#BDF4AB', r: 189, g: 244, b: 171, name: 'Pastel Mint' },
  { index: 0x3B, hex: '#B3F3CE', r: 179, g: 243, b: 206, name: 'Seafoam' },
  { index: 0x3C, hex: '#B5EBF2', r: 181, g: 235, b: 242, name: 'Pale Aqua' },
  { index: 0x3D, hex: '#B8B8B8', r: 184, g: 184, b: 184, name: 'Light Gray' },
  { index: 0x3E, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },
  { index: 0x3F, hex: '#000000', r: 0, g: 0, b: 0, name: 'Black' },
];

export function getNESColorByIndex(index: number): NESColor {
  const normalizedIndex = index & 0x3F;
  return NES_MASTER_PALETTE[normalizedIndex] || NES_MASTER_PALETTE[0x0F];
}

// Perceptually weighted Euclidean RGB distance (redmean color distance)
export function colorDistanceSquared(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return (((512 + rmean) * dr * dr) >> 8) + 4 * dg * dg + (((767 - rmean) * db * db) >> 8);
}

// Find closest color index in NES master palette
export function findClosestNESColor(r: number, g: number, b: number): number {
  let closestIndex = 0x0F;
  let minDistance = Infinity;

  // Search only unique non-black duplicated entries or valid colors
  for (let i = 0; i < 64; i++) {
    // skip mirrored blacks
    if (i === 0x0E || i === 0x1D || i === 0x1E || i === 0x1F || i === 0x2E || i === 0x3E || i === 0x3F) {
      continue;
    }
    const color = NES_MASTER_PALETTE[i];
    const dist = colorDistanceSquared(r, g, b, color.r, color.g, color.b);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  return closestIndex;
}

// Find closest color within a specific 4-color subpalette
export function findClosestInSubpalette(
  r: number, g: number, b: number,
  subpalette: number[]
): { paletteIndex: number; nesColorIndex: number } {
  let bestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < subpalette.length; i++) {
    const nesColor = getNESColorByIndex(subpalette[i]);
    const dist = colorDistanceSquared(r, g, b, nesColor.r, nesColor.g, nesColor.b);
    if (dist < minDistance) {
      minDistance = dist;
      bestIndex = i;
    }
  }

  return {
    paletteIndex: bestIndex,
    nesColorIndex: subpalette[bestIndex]
  };
}

// Default Authentic NES Subpalettes (e.g. Classic Overworld: Black + Blues, Black + Greens, Black + Reds, Black + Gold/Browns)
export const DEFAULT_NES_SUBPALETTES: number[][] = [
  [0x0F, 0x11, 0x21, 0x30], // Black, Sky Blue, Pastel Cyan, White
  [0x0F, 0x16, 0x27, 0x37], // Black, Red Orange, Amber, Vanilla
  [0x0F, 0x09, 0x19, 0x29], // Black, Dark Forest, Lime, Chartreuse
  [0x0F, 0x00, 0x10, 0x20], // Black, Dark Gray, Medium Gray, White
];

// Classic GameBoy 4-color subpalette mapped to NES
export const GAMEBOY_4_SUBPALETTE: number[] = [
  0x0F, // Black
  0x08, // Dark Olive
  0x19, // Olive Lime
  0x30, // Light Cream/White
];
