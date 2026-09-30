export type MirroringMode = 'horizontal' | 'vertical' | 'four_screen' | 'single_screen_a' | 'single_screen_b';
export type TVSystem = 'ntsc' | 'pal' | 'dual';
export type HeaderFormat = 'ines1' | 'nes2';

export interface NESHeaderConfig {
  format: HeaderFormat;
  mapper: number;
  submapper: number;
  prgRomSizeKB: number; // in KB (e.g. 16, 32, 64, 128, 256, 512)
  chrRomSizeKB: number; // in KB (0 = CHR RAM, 8, 16, 32, 64, 128)
  mirroring: MirroringMode;
  batteryBackedRam: boolean;
  trainer: boolean;
  tvSystem: TVSystem;
  prgRamSizeKB: number; // in KB (e.g. 8)
  prgNvramSizeKB: number; // NES 2.0
  chrRamSizeKB: number; // NES 2.0
  chrNvramSizeKB: number; // NES 2.0
  consoleType: number; // 0 = Standard NES, 1 = Vs System, 2 = Playchoice 10, etc.
}

export interface HeaderByteExplanation {
  byteIndex: number;
  hexValue: string;
  name: string;
  summary: string;
  bits: {
    mask: string;
    description: string;
    value: string;
  }[];
}

export type DitherAlgorithm = 'none' | 'floyd_steinberg' | 'atkinson' | 'bayer';
export type QuantizeMode = 'nes_subpalettes' | 'grayscale_4' | 'master_palette_free';
export type ScalingMode = 'fit' | 'fill' | 'stretch' | 'center';

export interface ImageProcessingOptions {
  dither: DitherAlgorithm;
  quantizeMode: QuantizeMode;
  scaling: ScalingMode;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
}

export interface NESColor {
  index: number;
  hex: string;
  r: number;
  g: number;
  b: number;
  name: string;
}

export interface TileData {
  plane0: Uint8Array; // 8 bytes
  plane1: Uint8Array; // 8 bytes
  pixelIndices: number[][]; // 8x8 array of 0..3
  hash: string;
}

export interface NESConversionResult {
  headerBytes: Uint8Array; // 16 bytes
  chrRomBytes: Uint8Array; // typically 8192 bytes (512 tiles x 16 bytes)
  nametableBytes: Uint8Array; // 960 bytes (32x30)
  attributeBytes: Uint8Array; // 64 bytes
  paletteBytes: Uint8Array; // 32 bytes (16 BG + 16 Sprite)
  prgRomBytes: Uint8Array; // 16384 or 32768 bytes bootable 6502 viewer code
  fullRomBytes: Uint8Array; // Header + [Trainer] + PRG + CHR
  uniqueTileCount: number;
  totalTileCount: number;
  tileDeduplicationRatio: number;
  activeSubpalettes: number[][]; // 4 subpalettes x 4 colors
  previewImageData: ImageData | null;
}

export interface MapperPreset {
  id: string;
  name: string;
  mapper: number;
  description: string;
  boardExample: string;
  games: string[];
  defaultConfig: Partial<NESHeaderConfig>;
}
