import {
  NESConversionResult,
  NESHeaderConfig,
} from '../types/nes';
import { generateHeaderBytes } from './nesHeader';
import { ProcessedNESGraphics } from './nesGraphics';

// Builds an authentic 6502 machine code PRG-ROM (16KB or 32KB) that displays
// the nametable, attribute table, and palette on screen.
export function buildBootablePrgRom(
  prgSizeKB: number,
  paletteBytes: Uint8Array,
  nametableBytes: Uint8Array,
  attributeBytes: Uint8Array
): Uint8Array {
  const prgSizeBytes = Math.max(16384, prgSizeKB * 1024);
  const prg = new Uint8Array(prgSizeBytes);

  // For 16KB PRG ROM: mapped at $C000 - $FFFF
  // For 32KB PRG ROM: mapped at $8000 - $FFFF (Code at $8000)
  const baseAddress = prgSizeBytes === 16384 ? 0xC000 : 0x8000;

  // Layout inside PRG ROM:
  // Offset 0x0000: Reset & Main Loop Code (~0x0080 bytes)
  // Offset 0x0100: Palette data (32 bytes)
  // Offset 0x0200: Nametable & Attribute table (1024 bytes: 960 NT + 64 ATTR)
  // Offset (prgSizeBytes - 6): 6502 Interrupt Vectors ($FFFA-$FFFF)

  const paletteOffset = 0x0100;
  const nametableOffset = 0x0200;

  const palAddr = baseAddress + paletteOffset;
  const ntAddr = baseAddress + nametableOffset;

  // Copy Palette into PRG
  prg.set(paletteBytes.subarray(0, 32), paletteOffset);

  // Copy Nametable (960) + Attribute table (64) = 1024 bytes
  prg.set(nametableBytes.subarray(0, 960), nametableOffset);
  prg.set(attributeBytes.subarray(0, 64), nametableOffset + 960);

  // Assembly Code Generation (starting at offset 0x0000 = baseAddress):
  let pc = 0;

  // 1. SEI (Disable IRQ)
  prg[pc++] = 0x78;
  // 2. CLD (Disable decimal mode)
  prg[pc++] = 0xD8;
  // 3. LDX #$FF, TXS (Initialize stack)
  prg[pc++] = 0xA2; prg[pc++] = 0xFF;
  prg[pc++] = 0x9A;
  // 4. Disable PPU NMIs and rendering:
  // LDA #$00, STA $2000, STA $2001
  prg[pc++] = 0xA9; prg[pc++] = 0x00;
  prg[pc++] = 0x8D; prg[pc++] = 0x00; prg[pc++] = 0x20;
  prg[pc++] = 0x8D; prg[pc++] = 0x01; prg[pc++] = 0x20;

  // 5. Wait for VBlank 1:
  // vblank1: BIT $2002, BPL vblank1
  const v1 = pc;
  prg[pc++] = 0x2C; prg[pc++] = 0x02; prg[pc++] = 0x20;
  prg[pc++] = 0x10; prg[pc++] = (v1 - (pc + 1)) & 0xFF; // relative jump -5 ($FB)

  // 6. Wait for VBlank 2:
  // vblank2: BIT $2002, BPL vblank2
  const v2 = pc;
  prg[pc++] = 0x2C; prg[pc++] = 0x02; prg[pc++] = 0x20;
  prg[pc++] = 0x10; prg[pc++] = (v2 - (pc + 1)) & 0xFF; // relative jump -5 ($FB)

  // 7. Load Palette into PPU $3F00:
  // LDA #$3F, STA $2006
  prg[pc++] = 0xA9; prg[pc++] = 0x3F;
  prg[pc++] = 0x8D; prg[pc++] = 0x06; prg[pc++] = 0x20;
  // LDA #$00, STA $2006
  prg[pc++] = 0xA9; prg[pc++] = 0x00;
  prg[pc++] = 0x8D; prg[pc++] = 0x06; prg[pc++] = 0x20;

  // LDX #$00
  prg[pc++] = 0xA2; prg[pc++] = 0x00;
  // load_pal: LDA palAddr, X
  const lp = pc;
  prg[pc++] = 0xBD; prg[pc++] = palAddr & 0xFF; prg[pc++] = (palAddr >> 8) & 0xFF;
  // STA $2007
  prg[pc++] = 0x8D; prg[pc++] = 0x07; prg[pc++] = 0x20;
  // INX
  prg[pc++] = 0xE8;
  // CPX #$20 (32 bytes)
  prg[pc++] = 0xE0; prg[pc++] = 0x20;
  // BNE load_pal
  prg[pc++] = 0xD0; prg[pc++] = (lp - (pc + 1)) & 0xFF;

  // 8. Load Nametable into PPU $2000 (1024 bytes = 4 pages of 256 bytes):
  // LDA #$20, STA $2006
  prg[pc++] = 0xA9; prg[pc++] = 0x20;
  prg[pc++] = 0x8D; prg[pc++] = 0x06; prg[pc++] = 0x20;
  // LDA #$00, STA $2006
  prg[pc++] = 0xA9; prg[pc++] = 0x00;
  prg[pc++] = 0x8D; prg[pc++] = 0x06; prg[pc++] = 0x20;

  // 4 unrolled loops for pages 0, 1, 2, 3
  for (let page = 0; page < 4; page++) {
    const pageAddr = ntAddr + page * 256;
    // LDX #$00
    prg[pc++] = 0xA2; prg[pc++] = 0x00;
    const lPage = pc;
    // LDA pageAddr, X
    prg[pc++] = 0xBD; prg[pc++] = pageAddr & 0xFF; prg[pc++] = (pageAddr >> 8) & 0xFF;
    // STA $2007
    prg[pc++] = 0x8D; prg[pc++] = 0x07; prg[pc++] = 0x20;
    // INX
    prg[pc++] = 0xE8;
    // BNE lPage
    prg[pc++] = 0xD0; prg[pc++] = (lPage - (pc + 1)) & 0xFF;
  }

  // 9. Reset Scroll to (0, 0):
  // LDA #$00, STA $2005, STA $2005
  prg[pc++] = 0xA9; prg[pc++] = 0x00;
  prg[pc++] = 0x8D; prg[pc++] = 0x05; prg[pc++] = 0x20;
  prg[pc++] = 0x8D; prg[pc++] = 0x05; prg[pc++] = 0x20;

  // 10. Enable Screen:
  // LDA #%00001010 (show background, show background in leftmost 8px)
  prg[pc++] = 0xA9; prg[pc++] = 0x0E;
  prg[pc++] = 0x8D; prg[pc++] = 0x01; prg[pc++] = 0x20;

  // LDA #%10000000 (enable NMI, background pattern table at $0000)
  prg[pc++] = 0xA9; prg[pc++] = 0x80;
  prg[pc++] = 0x8D; prg[pc++] = 0x00; prg[pc++] = 0x20;

  // 11. Main Loop:
  // loop: JMP loop
  const loopAddr = baseAddress + pc;
  prg[pc++] = 0x4C; prg[pc++] = loopAddr & 0xFF; prg[pc++] = (loopAddr >> 8) & 0xFF;

  // 12. NMI Handler (at next byte):
  const nmiAddr = baseAddress + pc;
  // RTI
  prg[pc++] = 0x40;

  // 13. Interrupt Vectors at the end of PRG ROM:
  // $FFFA: NMI Vector
  // $FFFC: Reset Vector
  // $FFFE: IRQ/BRK Vector
  const vecOffset = prgSizeBytes - 6;

  // NMI Vector
  prg[vecOffset] = nmiAddr & 0xFF;
  prg[vecOffset + 1] = (nmiAddr >> 8) & 0xFF;

  // Reset Vector
  prg[vecOffset + 2] = baseAddress & 0xFF;
  prg[vecOffset + 3] = (baseAddress >> 8) & 0xFF;

  // IRQ Vector
  prg[vecOffset + 4] = nmiAddr & 0xFF;
  prg[vecOffset + 5] = (nmiAddr >> 8) & 0xFF;

  return prg;
}

// Combine Header + optional Trainer + PRG + CHR into a valid, playable .nes ROM
export function buildCompleteNESRom(
  config: NESHeaderConfig,
  graphics: ProcessedNESGraphics
): NESConversionResult {
  const headerBytes = generateHeaderBytes(config);

  const prgRomBytes = buildBootablePrgRom(
    config.prgRomSizeKB,
    graphics.paletteBytes,
    graphics.nametableBytes,
    graphics.attributeBytes
  );

  const chrSizeBytes = config.chrRomSizeKB === 0 ? 0 : Math.max(8192, config.chrRomSizeKB * 1024);
  const finalChrRom = new Uint8Array(chrSizeBytes);
  if (chrSizeBytes > 0) {
    finalChrRom.set(graphics.chrRomBytes.subarray(0, Math.min(chrSizeBytes, graphics.chrRomBytes.length)));
  }

  // Trainer (512 bytes if enabled)
  const trainerSize = config.trainer ? 512 : 0;
  const trainerBytes = new Uint8Array(trainerSize);

  const totalLength = 16 + trainerSize + prgRomBytes.length + finalChrRom.length;
  const fullRomBytes = new Uint8Array(totalLength);

  let offset = 0;
  fullRomBytes.set(headerBytes, offset);
  offset += 16;

  if (config.trainer) {
    fullRomBytes.set(trainerBytes, offset);
    offset += trainerSize;
  }

  fullRomBytes.set(prgRomBytes, offset);
  offset += prgRomBytes.length;

  if (finalChrRom.length > 0) {
    fullRomBytes.set(finalChrRom, offset);
  }

  const dedupRatio = ((graphics.totalTileCount - graphics.uniqueTileCount) / graphics.totalTileCount) * 100;

  return {
    headerBytes,
    chrRomBytes: finalChrRom,
    nametableBytes: graphics.nametableBytes,
    attributeBytes: graphics.attributeBytes,
    paletteBytes: graphics.paletteBytes,
    prgRomBytes,
    fullRomBytes,
    uniqueTileCount: graphics.uniqueTileCount,
    totalTileCount: graphics.totalTileCount,
    tileDeduplicationRatio: Math.max(0, parseFloat(dedupRatio.toFixed(1))),
    activeSubpalettes: graphics.subpalettes,
    previewImageData: graphics.previewImageData,
  };
}
