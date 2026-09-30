import {
  ImageProcessingOptions,
  TileData,
} from '../types/nes';
import {
  findClosestNESColor,
  findClosestInSubpalette,
  getNESColorByIndex,
  DEFAULT_NES_SUBPALETTES,
  GAMEBOY_4_SUBPALETTE,
} from './nesPalette';

export const NES_WIDTH = 256;
export const NES_HEIGHT = 240;
export const TILES_X = 32;
export const TILES_Y = 30;
export const TOTAL_TILES = TILES_X * TILES_Y; // 960

// Apply brightness, contrast, and saturation adjustments
export function applyAdjustments(
  r: number, g: number, b: number,
  brightness: number, contrast: number, saturation: number
): [number, number, number] {
  // Brightness (-100 to 100)
  r += brightness * 2.55;
  g += brightness * 2.55;
  b += brightness * 2.55;

  // Contrast (-100 to 100)
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  r = factor * (r - 128) + 128;
  g = factor * (g - 128) + 128;
  b = factor * (b - 128) + 128;

  // Saturation (-100 to 100)
  const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
  const satFactor = (saturation + 100) / 100;
  r = gray + (r - gray) * satFactor;
  g = gray + (g - gray) * satFactor;
  b = gray + (b - gray) * satFactor;

  return [
    Math.min(255, Math.max(0, Math.round(r))),
    Math.min(255, Math.max(0, Math.round(g))),
    Math.min(255, Math.max(0, Math.round(b))),
  ];
}

// 4x4 Bayer Matrix for ordered dithering
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Scale and draw image into 256x240 buffer
export function scaleImageToBuffer(
  img: HTMLImageElement | ImageBitmap,
  scaling: ImageProcessingOptions['scaling']
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = NES_WIDTH;
  canvas.height = NES_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, NES_WIDTH, NES_HEIGHT);

  const srcW = img.width;
  const srcH = img.height;

  let dx = 0;
  let dy = 0;
  let dw = NES_WIDTH;
  let dh = NES_HEIGHT;

  if (scaling === 'fit') {
    const scale = Math.min(NES_WIDTH / srcW, NES_HEIGHT / srcH);
    dw = Math.round(srcW * scale);
    dh = Math.round(srcH * scale);
    dx = Math.round((NES_WIDTH - dw) / 2);
    dy = Math.round((NES_HEIGHT - dh) / 2);
  } else if (scaling === 'fill') {
    const scale = Math.max(NES_WIDTH / srcW, NES_HEIGHT / srcH);
    dw = Math.round(srcW * scale);
    dh = Math.round(srcH * scale);
    dx = Math.round((NES_WIDTH - dw) / 2);
    dy = Math.round((NES_HEIGHT - dh) / 2);
  } else if (scaling === 'center') {
    dw = srcW;
    dh = srcH;
    dx = Math.round((NES_WIDTH - dw) / 2);
    dy = Math.round((NES_HEIGHT - dh) / 2);
  } // stretch uses defaults dx=0, dy=0, dw=256, dh=240

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, dx, dy, dw, dh);
  return ctx.getImageData(0, 0, NES_WIDTH, NES_HEIGHT);
}

// Convert 8x8 pixel tile with 2-bit color indices (0..3) to 16-byte NES planar CHR format
export function encodeTile2bpp(pixels: number[][]): Uint8Array {
  const tileBytes = new Uint8Array(16);
  // plane 0: bytes 0..7 (lower bit of each pixel)
  // plane 1: bytes 8..15 (upper bit of each pixel)
  for (let y = 0; y < 8; y++) {
    let p0 = 0;
    let p1 = 0;
    for (let x = 0; x < 8; x++) {
      const colorIndex = pixels[y][x] & 0x03;
      const bit0 = colorIndex & 1;
      const bit1 = (colorIndex >> 1) & 1;
      p0 = (p0 << 1) | bit0;
      p1 = (p1 << 1) | bit1;
    }
    tileBytes[y] = p0;
    tileBytes[8 + y] = p1;
  }
  return tileBytes;
}

// Decode 16-byte NES planar CHR tile to 8x8 color indices (0..3)
export function decodeTile2bpp(tileBytes: Uint8Array): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < 8; y++) {
    const row: number[] = [];
    const p0 = tileBytes[y];
    const p1 = tileBytes[8 + y];
    for (let x = 0; x < 8; x++) {
      const shift = 7 - x;
      const bit0 = (p0 >> shift) & 1;
      const bit1 = (p1 >> shift) & 1;
      row.push((bit1 << 1) | bit0);
    }
    grid.push(row);
  }
  return grid;
}

export interface ProcessedNESGraphics {
  previewImageData: ImageData;
  chrRomBytes: Uint8Array;
  nametableBytes: Uint8Array;
  attributeBytes: Uint8Array;
  paletteBytes: Uint8Array;
  uniqueTileCount: number;
  totalTileCount: number;
  subpalettes: number[][];
}

// Full NES conversion pipeline
export function processImageToNES(
  sourceImageData: ImageData,
  options: ImageProcessingOptions,
  customSubpalettes?: number[][]
): ProcessedNESGraphics {
  const width = NES_WIDTH;
  const height = NES_HEIGHT;
  const src = new Float32Array(width * height * 3);

  // 1. Pre-process and apply brightness / contrast / saturation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const [r, g, b] = applyAdjustments(
        sourceImageData.data[i],
        sourceImageData.data[i + 1],
        sourceImageData.data[i + 2],
        options.brightness,
        options.contrast,
        options.saturation
      );
      const si = (y * width + x) * 3;
      src[si] = r;
      src[si + 1] = g;
      src[si + 2] = b;
    }
  }

  // Choose subpalettes
  let activeSubpalettes = customSubpalettes || DEFAULT_NES_SUBPALETTES;
  if (options.quantizeMode === 'grayscale_4') {
    activeSubpalettes = [
      GAMEBOY_4_SUBPALETTE,
      GAMEBOY_4_SUBPALETTE,
      GAMEBOY_4_SUBPALETTE,
      GAMEBOY_4_SUBPALETTE,
    ];
  }

  // 2. Attribute assignment per 16x16 pixel block (16 blocks horiz x 15 blocks vert)
  // For authentic NES hardware, each 16x16 block selects 1 of the 4 subpalettes
  const blockPalettes: number[][] = [];
  for (let by = 0; by < 15; by++) {
    blockPalettes[by] = [];
    for (let bx = 0; bx < 16; bx++) {
      if (options.quantizeMode === 'grayscale_4') {
        blockPalettes[by][bx] = 0;
        continue;
      }

      // Find which of the 4 subpalettes best covers this 16x16 block
      let bestPalIdx = 0;
      let minTotalDist = Infinity;

      for (let p = 0; p < 4; p++) {
        let palDist = 0;
        // Sample every 2 pixels in the 16x16 block for fast, accurate matching
        for (let py = 0; py < 16; py += 2) {
          for (let px = 0; px < 16; px += 2) {
            const sx = bx * 16 + px;
            const sy = by * 16 + py;
            const si = (sy * width + sx) * 3;
            const r = src[si];
            const g = src[si + 1];
            const b = src[si + 2];
            const closest = findClosestInSubpalette(r, g, b, activeSubpalettes[p]);
            const nesColor = getNESColorByIndex(closest.nesColorIndex);
            const dr = r - nesColor.r;
            const dg = g - nesColor.g;
            const db = b - nesColor.b;
            palDist += dr * dr + dg * dg + db * db;
          }
        }
        if (palDist < minTotalDist) {
          minTotalDist = palDist;
          bestPalIdx = p;
        }
      }
      blockPalettes[by][bx] = bestPalIdx;
    }
  }

  // 3. Pixel quantization with chosen dithering algorithm
  // Also store 2-bit color index (0..3) for each pixel
  const pixelIndices: Uint8Array = new Uint8Array(width * height);
  const quantizedNESIndices: Uint8Array = new Uint8Array(width * height);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d')!;
  const previewImageData = outCtx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    const blockY = Math.min(14, Math.floor(y / 16));

    for (let x = 0; x < width; x++) {
      const blockX = Math.min(15, Math.floor(x / 16));
      const chosenPalIndex = blockPalettes[blockY][blockX];
      const curSubpal = activeSubpalettes[chosenPalIndex];

      const si = (y * width + x) * 3;
      let r = src[si];
      let g = src[si + 1];
      let b = src[si + 2];

      if (options.dither === 'bayer') {
        const threshold = (BAYER_4X4[y % 4][x % 4] - 7.5) * 4;
        r = Math.min(255, Math.max(0, r + threshold));
        g = Math.min(255, Math.max(0, g + threshold));
        b = Math.min(255, Math.max(0, b + threshold));
      }

      let subpalColorIdx = 0;
      let nesColorCode = curSubpal[0];

      if (options.quantizeMode === 'master_palette_free') {
        nesColorCode = findClosestNESColor(r, g, b);
        subpalColorIdx = nesColorCode & 0x03;
      } else {
        const match = findClosestInSubpalette(r, g, b, curSubpal);
        subpalColorIdx = match.paletteIndex;
        nesColorCode = match.nesColorIndex;
      }

      const finalColor = getNESColorByIndex(nesColorCode);

      pixelIndices[y * width + x] = subpalColorIdx;
      quantizedNESIndices[y * width + x] = nesColorCode;

      const pi = (y * width + x) * 4;
      previewImageData.data[pi] = finalColor.r;
      previewImageData.data[pi + 1] = finalColor.g;
      previewImageData.data[pi + 2] = finalColor.b;
      previewImageData.data[pi + 3] = 255;

      // Error diffusion (Floyd-Steinberg or Atkinson)
      if (options.dither === 'floyd_steinberg' || options.dither === 'atkinson') {
        const errR = r - finalColor.r;
        const errG = g - finalColor.g;
        const errB = b - finalColor.b;

        const distribute = (dx: number, dy: number, factor: number) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nsi = (ny * width + nx) * 3;
            src[nsi] += errR * factor;
            src[nsi + 1] += errG * factor;
            src[nsi + 2] += errB * factor;
          }
        };

        if (options.dither === 'floyd_steinberg') {
          distribute(1, 0, 7 / 16);
          distribute(-1, 1, 3 / 16);
          distribute(0, 1, 5 / 16);
          distribute(1, 1, 1 / 16);
        } else if (options.dither === 'atkinson') {
          // Atkinson distributes 1/8 each to 6 neighbors
          distribute(1, 0, 1 / 8);
          distribute(2, 0, 1 / 8);
          distribute(-1, 1, 1 / 8);
          distribute(0, 1, 1 / 8);
          distribute(1, 1, 1 / 8);
          distribute(0, 2, 1 / 8);
        }
      }
    }
  }

  // 4. Extract 8x8 Tiles & Deduplicate into Pattern Table
  const uniqueTiles: TileData[] = [];
  const tileHashMap = new Map<string, number>();
  const nametableBytes = new Uint8Array(TOTAL_TILES); // 960 bytes

  for (let ty = 0; ty < TILES_Y; ty++) {
    for (let tx = 0; tx < TILES_X; tx++) {
      const tileGrid: number[][] = [];
      for (let py = 0; py < 8; py++) {
        const row: number[] = [];
        for (let px = 0; px < 8; px++) {
          const x = tx * 8 + px;
          const y = ty * 8 + py;
          row.push(pixelIndices[y * width + x]);
        }
        tileGrid.push(row);
      }

      const encoded = encodeTile2bpp(tileGrid);
      const hash = Array.from(encoded).map(b => b.toString(16).padStart(2, '0')).join('');

      let tileIndex: number;
      if (tileHashMap.has(hash)) {
        tileIndex = tileHashMap.get(hash)!;
      } else {
        if (uniqueTiles.length < 256) {
          tileIndex = uniqueTiles.length;
          uniqueTiles.push({
            plane0: encoded.subarray(0, 8),
            plane1: encoded.subarray(8, 16),
            pixelIndices: tileGrid,
            hash,
          });
          tileHashMap.set(hash, tileIndex);
        } else {
          // Fallback to nearest tile or modulo to fit in 256 tiles pattern table
          tileIndex = (uniqueTiles.length - 1) % 256;
        }
      }

      nametableBytes[ty * TILES_X + tx] = tileIndex & 0xFF;
    }
  }

  // 5. Construct 8 KB CHR-ROM buffer (512 tiles x 16 bytes = 8192 bytes)
  // Left pattern table ($0000-$0FFF) contains background tiles (up to 256 tiles = 4096 bytes)
  // Right pattern table ($1000-$1FFF) can contain extra/sprite tiles or font, padded with 0
  const chrRomBytes = new Uint8Array(8192);
  for (let i = 0; i < uniqueTiles.length && i < 256; i++) {
    const offset = i * 16;
    chrRomBytes.set(uniqueTiles[i].plane0, offset);
    chrRomBytes.set(uniqueTiles[i].plane1, offset + 8);
  }

  // 6. Generate 64-byte NES Attribute Table
  // Each attribute byte controls four 16x16 pixel blocks arranged in a 32x32 pixel area:
  // bit 0-1: Top-Left 16x16
  // bit 2-3: Top-Right 16x16
  // bit 4-5: Bottom-Left 16x16
  // bit 6-7: Bottom-Right 16x16
  // The screen is 8 blocks wide (32px * 8 = 256px) and 8 blocks high (30 tiles = 240px, last row only has 16px high)
  const attributeBytes = new Uint8Array(64);
  for (let ay = 0; ay < 8; ay++) {
    for (let ax = 0; ax < 8; ax++) {
      const bx = ax * 2;
      const by = ay * 2;

      const tl = (by < 15 && bx < 16) ? blockPalettes[by][bx] : 0;
      const tr = (by < 15 && bx + 1 < 16) ? blockPalettes[by][bx + 1] : tl;
      const bl = (by + 1 < 15 && bx < 16) ? blockPalettes[by + 1][bx] : tl;
      const br = (by + 1 < 15 && bx + 1 < 16) ? blockPalettes[by + 1][bx + 1] : tr;

      const attr = (tl & 3) | ((tr & 3) << 2) | ((bl & 3) << 4) | ((br & 3) << 6);
      attributeBytes[ay * 8 + ax] = attr;
    }
  }

  // 7. Palette Bytes (32 bytes: 16 BG + 16 Sprite)
  const paletteBytes = new Uint8Array(32);
  const universalBg = activeSubpalettes[0][0];

  for (let p = 0; p < 4; p++) {
    paletteBytes[p * 4] = universalBg;
    paletteBytes[p * 4 + 1] = activeSubpalettes[p][1];
    paletteBytes[p * 4 + 2] = activeSubpalettes[p][2];
    paletteBytes[p * 4 + 3] = activeSubpalettes[p][3];

    // Mirror to sprite palettes
    paletteBytes[16 + p * 4] = universalBg;
    paletteBytes[16 + p * 4 + 1] = activeSubpalettes[p][1];
    paletteBytes[16 + p * 4 + 2] = activeSubpalettes[p][2];
    paletteBytes[16 + p * 4 + 3] = activeSubpalettes[p][3];
  }

  return {
    previewImageData,
    chrRomBytes,
    nametableBytes,
    attributeBytes,
    paletteBytes,
    uniqueTileCount: uniqueTiles.length,
    totalTileCount: TOTAL_TILES,
    subpalettes: activeSubpalettes,
  };
}
