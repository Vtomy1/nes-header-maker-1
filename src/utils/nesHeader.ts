import {
  NESHeaderConfig,
  HeaderByteExplanation,
  MapperPreset,
} from '../types/nes';

export const MAPPER_PRESETS: MapperPreset[] = [
  {
    id: 'nrom-128',
    name: 'NROM-128 (Mapper 0)',
    mapper: 0,
    description: 'Standard 16 KB PRG-ROM + 8 KB CHR-ROM. Used by early NES classics.',
    boardExample: 'NES-NROM-128',
    games: ['Super Mario Bros.', 'Donkey Kong', 'Balloon Fight', 'Ice Climber'],
    defaultConfig: {
      format: 'ines1',
      mapper: 0,
      submapper: 0,
      prgRomSizeKB: 16,
      chrRomSizeKB: 8,
      mirroring: 'horizontal',
      batteryBackedRam: false,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
  {
    id: 'nrom-256',
    name: 'NROM-256 (Mapper 0)',
    mapper: 0,
    description: 'Full 32 KB PRG-ROM + 8 KB CHR-ROM with no bankswitching.',
    boardExample: 'NES-NROM-256',
    games: ['Super Mario Bros. (Japan)', 'Excitebike', 'Duck Hunt', 'Clu Clu Land'],
    defaultConfig: {
      format: 'ines1',
      mapper: 0,
      submapper: 0,
      prgRomSizeKB: 32,
      chrRomSizeKB: 8,
      mirroring: 'vertical',
      batteryBackedRam: false,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
  {
    id: 'mmc1-sxrom',
    name: 'MMC1 / SxROM (Mapper 1)',
    mapper: 1,
    description: 'Nintendo MMC1 custom ASIC. Bankswitched PRG and CHR, programmable mirroring.',
    boardExample: 'NES-SNROM / SAROM',
    games: ['The Legend of Zelda', 'Metroid', 'Mega Man 2', 'Kid Icarus'],
    defaultConfig: {
      format: 'ines1',
      mapper: 1,
      submapper: 0,
      prgRomSizeKB: 128,
      chrRomSizeKB: 128,
      mirroring: 'horizontal',
      batteryBackedRam: true,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
  {
    id: 'uxrom',
    name: 'UxROM (Mapper 2)',
    mapper: 2,
    description: 'Bankswitched PRG ROM with 8 KB CHR RAM (no CHR ROM chip on board).',
    boardExample: 'NES-UNROM / UOROM',
    games: ['Mega Man', 'Castlevania', 'Contra', 'DuckTales'],
    defaultConfig: {
      format: 'ines1',
      mapper: 2,
      submapper: 0,
      prgRomSizeKB: 128,
      chrRomSizeKB: 0, // 0 = CHR RAM
      mirroring: 'vertical',
      batteryBackedRam: false,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
  {
    id: 'cnrom',
    name: 'CNROM (Mapper 3)',
    mapper: 3,
    description: 'Fixed 32 KB PRG ROM with up to 32 KB switchable CHR ROM banks.',
    boardExample: 'NES-CNROM',
    games: ['Gradius', 'Adventure Island', 'Solomon\'s Key', 'Arkanoid'],
    defaultConfig: {
      format: 'ines1',
      mapper: 3,
      submapper: 0,
      prgRomSizeKB: 32,
      chrRomSizeKB: 32,
      mirroring: 'vertical',
      batteryBackedRam: false,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
  {
    id: 'mmc3-txrom',
    name: 'MMC3 / TxROM (Mapper 4)',
    mapper: 4,
    description: 'Advanced MMC3 ASIC with scanline IRQ counter, split screen scrolling.',
    boardExample: 'NES-TKROM / TSROM',
    games: ['Super Mario Bros. 3', 'Mega Man 3-6', 'Kirby\'s Adventure', 'Ninja Gaiden'],
    defaultConfig: {
      format: 'nes2',
      mapper: 4,
      submapper: 0,
      prgRomSizeKB: 256,
      chrRomSizeKB: 128,
      mirroring: 'horizontal',
      batteryBackedRam: true,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
  {
    id: 'axrom',
    name: 'AxROM (Mapper 7)',
    mapper: 7,
    description: 'Bankswitched 32 KB PRG pages with single-screen mirroring control.',
    boardExample: 'NES-AOROM / AMROM',
    games: ['Battletoads', 'Marble Madness', 'Cobra Triangle'],
    defaultConfig: {
      format: 'ines1',
      mapper: 7,
      submapper: 0,
      prgRomSizeKB: 128,
      chrRomSizeKB: 0,
      mirroring: 'single_screen_a',
      batteryBackedRam: false,
      trainer: false,
      tvSystem: 'ntsc',
    },
  },
];

export const KNOWN_MAPPERS: Record<number, { name: string; chip: string; description: string }> = {
  0: { name: 'NROM', chip: 'Discrete Logic', description: 'Simple cartridge with no bank switching' },
  1: { name: 'MMC1 / SxROM', chip: 'Nintendo MMC1', description: 'Serial register mapper with configurable PRG/CHR banking' },
  2: { name: 'UxROM', chip: '74HC161 / 74HC32', description: '16KB bankswitchable PRG + 8KB CHR RAM' },
  3: { name: 'CNROM', chip: '74HC161', description: 'Fixed PRG + 8KB bankswitchable CHR ROM' },
  4: { name: 'MMC3 / TxROM', chip: 'Nintendo MMC3', description: 'Scanline IRQ counter, fine CHR banking, PRG banking' },
  5: { name: 'MMC5 / ExROM', chip: 'Nintendo MMC5', description: 'Comprehensive ASIC with extra audio channels and extended RAM' },
  7: { name: 'AxROM', chip: '74HC161', description: '32KB switchable PRG + Single screen VRAM select' },
  9: { name: 'MMC2 / PxROM', chip: 'Nintendo MMC2', description: 'Automatic tile-fetch CHR bank switching (Mike Tyson\'s Punch-Out!!)' },
  10: { name: 'MMC4 / FxROM', chip: 'Nintendo MMC4', description: 'Similar to MMC2 with 16KB PRG banking (Fire Emblem)' },
  11: { name: 'Color Dreams', chip: 'Discrete Logic', description: 'Unlicensed games mapper' },
  19: { name: 'Namco 163', chip: 'Namco 163', description: 'Wavetable sound chip and bankswitching' },
  24: { name: 'VRC6a', chip: 'Konami VRC6', description: 'Konami custom chip with pulse & sawtooth audio (Akumajou Densetsu)' },
  69: { name: 'FME-7 / Sunsoft 5B', chip: 'Sunsoft FME-7', description: 'Fine PRG & CHR banking with Yamaha YM2149 sound' },
};

// Generate 16-byte iNES or NES 2.0 header binary
export function generateHeaderBytes(config: NESHeaderConfig): Uint8Array {
  const header = new Uint8Array(16);

  // Bytes 0-3: Identification "NES\x1A"
  header[0] = 0x4E; // 'N'
  header[1] = 0x45; // 'E'
  header[2] = 0x53; // 'S'
  header[3] = 0x1A; // MS-DOS EOF

  // Byte 4: PRG ROM size in 16 KB units (lower 8 bits)
  const prgUnits = Math.max(1, Math.floor(config.prgRomSizeKB / 16));
  header[4] = prgUnits & 0xFF;

  // Byte 5: CHR ROM size in 8 KB units (lower 8 bits, 0 means CHR RAM)
  const chrUnits = Math.floor(config.chrRomSizeKB / 8);
  header[5] = chrUnits & 0xFF;

  // Byte 6: Flags 6
  // Bit 0: Mirroring (0 = Horizontal, 1 = Vertical)
  // Bit 1: Battery-backed PRG RAM
  // Bit 2: 512-byte Trainer
  // Bit 3: Four-screen VRAM
  // Bit 4-7: Lower nibble of mapper
  let flags6 = 0;
  if (config.mirroring === 'vertical') {
    flags6 |= 0x01;
  } else if (config.mirroring === 'four_screen') {
    flags6 |= 0x08;
  }
  if (config.batteryBackedRam) {
    flags6 |= 0x02;
  }
  if (config.trainer) {
    flags6 |= 0x04;
  }
  flags6 |= (config.mapper & 0x0F) << 4;
  header[6] = flags6;

  // Byte 7: Flags 7
  // Bit 0: VS Unisystem
  // Bit 1: PlayChoice-10
  // Bit 2-3: NES 2.0 flag (if bits 2-3 == 2, it is NES 2.0)
  // Bit 4-7: Upper nibble of mapper (bits 4-7)
  let flags7 = 0;
  if (config.format === 'nes2') {
    flags7 |= 0x08; // bit 3 set, bit 2 clear = %10 = 2
  }
  flags7 |= (config.mapper & 0xF0);
  header[7] = flags7;

  if (config.format === 'nes2') {
    // NES 2.0 Header Bytes
    // Byte 8: Mapper MSB (bits 0-3) and Submapper (bits 4-7)
    const mapperMSB = (config.mapper >> 8) & 0x0F;
    const submapper = config.submapper & 0x0F;
    header[8] = mapperMSB | (submapper << 4);

    // Byte 9: PRG / CHR size MSBs (bits 0-3: PRG MSB, bits 4-7: CHR MSB)
    const prgMSB = (prgUnits >> 8) & 0x0F;
    const chrMSB = (chrUnits >> 8) & 0x0F;
    header[9] = prgMSB | (chrMSB << 4);

    // Byte 10: PRG-RAM (bits 0-3) and PRG-NVRAM (bits 4-7)
    // Encoded as 64 << count bytes, so 8KB = 8192 bytes = 64 << 7 => shift = 7
    const encodeRam = (kb: number) => {
      if (kb <= 0) return 0;
      const bytes = kb * 1024;
      return Math.min(15, Math.max(1, Math.round(Math.log2(bytes / 64))));
    };
    header[10] = (encodeRam(config.prgRamSizeKB) & 0x0F) | ((encodeRam(config.prgNvramSizeKB) & 0x0F) << 4);

    // Byte 11: CHR-RAM (bits 0-3) and CHR-NVRAM (bits 4-7)
    header[11] = (encodeRam(config.chrRamSizeKB) & 0x0F) | ((encodeRam(config.chrNvramSizeKB) & 0x0F) << 4);

    // Byte 12: CPU/PPU timing (0: RP2A03 NTSC, 1: RP2A07 PAL, 2: Multiple-region, 3: Dendy)
    let timing = 0;
    if (config.tvSystem === 'pal') timing = 1;
    else if (config.tvSystem === 'dual') timing = 2;
    header[12] = timing & 0x03;

    // Byte 13: System type (0 = Standard NES)
    header[13] = config.consoleType & 0x0F;

    // Bytes 14-15: Miscellaneous ROMs / Default Expansion device
    header[14] = 0x00;
    header[15] = 0x00;
  } else {
    // iNES 1.0 Header Bytes
    // Byte 8: PRG-RAM size in 8KB units (0 means 8KB for compatibility)
    header[8] = Math.floor(config.prgRamSizeKB / 8) || 0;

    // Byte 9: TV System (Bit 0: 0 = NTSC, 1 = PAL)
    header[9] = config.tvSystem === 'pal' ? 0x01 : 0x00;

    // Byte 10: TV System / PRG-RAM presence (rarely used, kept 0)
    header[10] = 0x00;

    // Bytes 11-15: Unused padding bytes (must be zero)
    header[11] = 0x00;
    header[12] = 0x00;
    header[13] = 0x00;
    header[14] = 0x00;
    header[15] = 0x00;
  }

  return header;
}

// Parse existing 16-byte header
export function parseHeaderBytes(bytes: Uint8Array): {
  config: NESHeaderConfig;
  isValid: boolean;
  error?: string;
} {
  if (bytes.length < 16) {
    return {
      config: createDefaultHeaderConfig(),
      isValid: false,
      error: 'Header must be at least 16 bytes long.',
    };
  }

  // Check signature
  if (bytes[0] !== 0x4E || bytes[1] !== 0x45 || bytes[2] !== 0x53 || bytes[3] !== 0x1A) {
    return {
      config: createDefaultHeaderConfig(),
      isValid: false,
      error: 'Invalid NES header signature! Expected "NES\\x1A" (4E 45 53 1A).',
    };
  }

  const isNES2 = ((bytes[7] >> 2) & 0x03) === 2;
  const flags6 = bytes[6];
  const flags7 = bytes[7];

  // Mapper calculation
  let mapper = (flags6 >> 4) | (flags7 & 0xF0);
  let submapper = 0;

  let prgUnits = bytes[4];
  let chrUnits = bytes[5];

  if (isNES2) {
    const mapperMSB = bytes[8] & 0x0F;
    submapper = (bytes[8] >> 4) & 0x0F;
    mapper |= (mapperMSB << 8);

    const prgMSB = bytes[9] & 0x0F;
    const chrMSB = (bytes[9] >> 4) & 0x0F;
    prgUnits |= (prgMSB << 8);
    chrUnits |= (chrMSB << 8);
  }

  let mirroring: NESHeaderConfig['mirroring'] = 'horizontal';
  if ((flags6 & 0x08) !== 0) {
    mirroring = 'four_screen';
  } else if ((flags6 & 0x01) !== 0) {
    mirroring = 'vertical';
  }

  const battery = (flags6 & 0x02) !== 0;
  const trainer = (flags6 & 0x04) !== 0;

  let tvSystem: NESHeaderConfig['tvSystem'] = 'ntsc';
  if (isNES2) {
    const timing = bytes[12] & 0x03;
    if (timing === 1) tvSystem = 'pal';
    else if (timing === 2) tvSystem = 'dual';
  } else {
    if ((bytes[9] & 0x01) === 1) tvSystem = 'pal';
  }

  const decodeRam = (val: number) => {
    if (val === 0) return 0;
    return Math.round((64 << val) / 1024);
  };

  const config: NESHeaderConfig = {
    format: isNES2 ? 'nes2' : 'ines1',
    mapper,
    submapper,
    prgRomSizeKB: prgUnits * 16,
    chrRomSizeKB: chrUnits * 8,
    mirroring,
    batteryBackedRam: battery,
    trainer,
    tvSystem,
    prgRamSizeKB: isNES2 ? decodeRam(bytes[10] & 0x0F) : (bytes[8] ? bytes[8] * 8 : 8),
    prgNvramSizeKB: isNES2 ? decodeRam((bytes[10] >> 4) & 0x0F) : 0,
    chrRamSizeKB: isNES2 ? decodeRam(bytes[11] & 0x0F) : (chrUnits === 0 ? 8 : 0),
    chrNvramSizeKB: isNES2 ? decodeRam((bytes[11] >> 4) & 0x0F) : 0,
    consoleType: isNES2 ? (bytes[13] & 0x0F) : 0,
  };

  return {
    config,
    isValid: true,
  };
}

export function createDefaultHeaderConfig(): NESHeaderConfig {
  return {
    format: 'ines1',
    mapper: 0,
    submapper: 0,
    prgRomSizeKB: 16,
    chrRomSizeKB: 8,
    mirroring: 'horizontal',
    batteryBackedRam: false,
    trainer: false,
    tvSystem: 'ntsc',
    prgRamSizeKB: 8,
    prgNvramSizeKB: 0,
    chrRamSizeKB: 0,
    chrNvramSizeKB: 0,
    consoleType: 0,
  };
}

// Generate bit-by-bit inspection breakdowns for all 16 bytes
export function inspectHeaderBytes(header: Uint8Array): HeaderByteExplanation[] {
  const isNES2 = ((header[7] >> 2) & 0x03) === 2;
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  const toBin = (n: number) => n.toString(2).padStart(8, '0');

  const explanations: HeaderByteExplanation[] = [];

  // Bytes 0-3
  explanations.push({
    byteIndex: 0,
    hexValue: toHex(header[0]),
    name: 'Magic Identification Byte 0',
    summary: `Character 'N' ($4E). Required NES ROM magic constant.`,
    bits: [{ mask: '7..0', description: 'Constant ASCII letter N', value: toBin(header[0]) }],
  });
  explanations.push({
    byteIndex: 1,
    hexValue: toHex(header[1]),
    name: 'Magic Identification Byte 1',
    summary: `Character 'E' ($45). Required NES ROM magic constant.`,
    bits: [{ mask: '7..0', description: 'Constant ASCII letter E', value: toBin(header[1]) }],
  });
  explanations.push({
    byteIndex: 2,
    hexValue: toHex(header[2]),
    name: 'Magic Identification Byte 2',
    summary: `Character 'S' ($53). Required NES ROM magic constant.`,
    bits: [{ mask: '7..0', description: 'Constant ASCII letter S', value: toBin(header[2]) }],
  });
  explanations.push({
    byteIndex: 3,
    hexValue: toHex(header[3]),
    name: 'Magic Identification Byte 3',
    summary: `Character EOF ($1A). MS-DOS End-Of-File marker character.`,
    bits: [{ mask: '7..0', description: 'Constant MS-DOS EOF byte', value: toBin(header[3]) }],
  });

  // Byte 4
  const prgUnits = header[4];
  explanations.push({
    byteIndex: 4,
    hexValue: toHex(header[4]),
    name: 'PRG ROM Size (LSB)',
    summary: `${prgUnits} × 16 KB = ${prgUnits * 16} KB PRG ROM code.`,
    bits: [{ mask: '7..0', description: 'Number of 16384-byte PRG-ROM banks', value: `${prgUnits} banks (${prgUnits * 16} KB)` }],
  });

  // Byte 5
  const chrUnits = header[5];
  explanations.push({
    byteIndex: 5,
    hexValue: toHex(header[5]),
    name: 'CHR ROM Size (LSB)',
    summary: chrUnits === 0 ? '0 (Board uses CHR RAM instead of CHR ROM)' : `${chrUnits} × 8 KB = ${chrUnits * 8} KB CHR ROM tiles.`,
    bits: [{ mask: '7..0', description: 'Number of 8192-byte CHR-ROM banks', value: chrUnits === 0 ? '0 (CHR-RAM)' : `${chrUnits} banks (${chrUnits * 8} KB)` }],
  });

  // Byte 6: Flags 6
  const f6 = header[6];
  explanations.push({
    byteIndex: 6,
    hexValue: toHex(f6),
    name: 'Flags 6 (Mirroring & Mapper Low)',
    summary: `Mapper bits 0-3: ${(f6 >> 4) & 0x0F}, Mirroring: ${(f6 & 0x08) ? '4-Screen' : ((f6 & 0x01) ? 'Vertical' : 'Horizontal')}, Battery: ${Boolean(f6 & 0x02)}, Trainer: ${Boolean(f6 & 0x04)}`,
    bits: [
      { mask: 'Bit 0', description: 'Nametable Mirroring (0 = Horizontal, 1 = Vertical)', value: (f6 & 0x01) ? '1 (Vertical)' : '0 (Horizontal)' },
      { mask: 'Bit 1', description: 'Cartridge contains battery-backed PRG RAM ($6000-$7FFF)', value: (f6 & 0x02) ? '1 (Present)' : '0 (None)' },
      { mask: 'Bit 2', description: '512-byte Trainer at $7000-$71FF present before PRG', value: (f6 & 0x04) ? '1 (Present)' : '0 (Absent)' },
      { mask: 'Bit 3', description: 'Ignore mirroring bit, provide 4-screen VRAM layout', value: (f6 & 0x08) ? '1 (4-Screen)' : '0 (Disabled)' },
      { mask: 'Bits 7..4', description: 'Lower nibble of mapper number (D0..D3)', value: `$${((f6 >> 4) & 0x0F).toString(16).toUpperCase()}` },
    ],
  });

  // Byte 7: Flags 7
  const f7 = header[7];
  const isNes2Bit = ((f7 >> 2) & 0x03) === 2;
  explanations.push({
    byteIndex: 7,
    hexValue: toHex(f7),
    name: 'Flags 7 (Format & Mapper High)',
    summary: `Format: ${isNes2Bit ? 'NES 2.0' : 'iNES 1.0'}, Mapper bits 4-7: ${(f7 >> 4) & 0x0F}, VS System: ${Boolean(f7 & 0x01)}, PlayChoice: ${Boolean(f7 & 0x02)}`,
    bits: [
      { mask: 'Bit 0', description: 'VS Unisystem Arcade cartridge', value: (f7 & 0x01) ? '1 (VS System)' : '0 (Normal)' },
      { mask: 'Bit 1', description: 'PlayChoice-10 (has 8KB hint screen data)', value: (f7 & 0x02) ? '1 (PlayChoice)' : '0 (Normal)' },
      { mask: 'Bits 3..2', description: 'NES 2.0 Identifier (Value %10 signifies NES 2.0 format)', value: isNes2Bit ? '%10 (NES 2.0 Valid)' : `%${((f7 >> 2) & 0x03).toString(2)} (iNES 1.0)` },
      { mask: 'Bits 7..4', description: 'Upper nibble of mapper number (D4..D7)', value: `$${((f7 >> 4) & 0x0F).toString(16).toUpperCase()}` },
    ],
  });

  // Byte 8
  const f8 = header[8];
  if (isNES2) {
    explanations.push({
      byteIndex: 8,
      hexValue: toHex(f8),
      name: 'NES 2.0: Mapper MSB / Submapper',
      summary: `Mapper bits 8-11: ${f8 & 0x0F}, Submapper: ${(f8 >> 4) & 0x0F}`,
      bits: [
        { mask: 'Bits 3..0', description: 'Mapper highest nibble (D8..D11)', value: `$${(f8 & 0x0F).toString(16).toUpperCase()}` },
        { mask: 'Bits 7..4', description: 'Submapper number (0..15)', value: `${(f8 >> 4) & 0x0F}` },
      ],
    });
  } else {
    explanations.push({
      byteIndex: 8,
      hexValue: toHex(f8),
      name: 'iNES 1.0: PRG-RAM Size',
      summary: f8 === 0 ? '0 (Infers standard 8 KB for compatibility)' : `${f8} × 8 KB = ${f8 * 8} KB PRG RAM`,
      bits: [{ mask: '7..0', description: 'Number of 8192-byte PRG-RAM banks', value: `${f8} (${f8 === 0 ? '8 KB inferred' : `${f8 * 8} KB`})` }],
    });
  }

  // Byte 9
  const f9 = header[9];
  if (isNES2) {
    explanations.push({
      byteIndex: 9,
      hexValue: toHex(f9),
      name: 'NES 2.0: PRG / CHR Size MSBs',
      summary: `PRG size MSB: ${f9 & 0x0F}, CHR size MSB: ${(f9 >> 4) & 0x0F}`,
      bits: [
        { mask: 'Bits 3..0', description: 'PRG-ROM size bits 8..11', value: `${f9 & 0x0F}` },
        { mask: 'Bits 7..4', description: 'CHR-ROM size bits 8..11', value: `${(f9 >> 4) & 0x0F}` },
      ],
    });
  } else {
    explanations.push({
      byteIndex: 9,
      hexValue: toHex(f9),
      name: 'iNES 1.0: TV System',
      summary: (f9 & 0x01) ? 'PAL System' : 'NTSC System',
      bits: [
        { mask: 'Bit 0', description: 'TV System (0 = NTSC, 1 = PAL)', value: (f9 & 0x01) ? '1 (PAL)' : '0 (NTSC)' },
        { mask: 'Bits 7..1', description: 'Reserved (must be zero)', value: `${(f9 >> 1) & 0x7F}` },
      ],
    });
  }

  // Byte 10
  const f10 = header[10];
  if (isNES2) {
    explanations.push({
      byteIndex: 10,
      hexValue: toHex(f10),
      name: 'NES 2.0: PRG-RAM / NVRAM Size',
      summary: `PRG-RAM shift: ${f10 & 0x0F}, PRG-NVRAM shift: ${(f10 >> 4) & 0x0F}`,
      bits: [
        { mask: 'Bits 3..0', description: 'PRG-RAM size: 64 << count bytes', value: (f10 & 0x0F) ? `${(64 << (f10 & 0x0F)) / 1024} KB` : 'None' },
        { mask: 'Bits 7..4', description: 'PRG-NVRAM (battery): 64 << count bytes', value: ((f10 >> 4) & 0x0F) ? `${(64 << ((f10 >> 4) & 0x0F)) / 1024} KB` : 'None' },
      ],
    });
  } else {
    explanations.push({
      byteIndex: 10,
      hexValue: toHex(f10),
      name: 'iNES 1.0: Flags 10 (Unofficial)',
      summary: 'TV system and PRG-RAM presence flags (rarely used, usually $00)',
      bits: [{ mask: '7..0', description: 'Unofficial TV / RAM flags', value: `$${toHex(f10)}` }],
    });
  }

  // Bytes 11-15
  for (let b = 11; b <= 15; b++) {
    const val = header[b];
    if (isNES2) {
      if (b === 11) {
        explanations.push({
          byteIndex: 11,
          hexValue: toHex(val),
          name: 'NES 2.0: CHR-RAM / NVRAM Size',
          summary: `CHR-RAM: ${val & 0x0F}, CHR-NVRAM: ${(val >> 4) & 0x0F}`,
          bits: [
            { mask: 'Bits 3..0', description: 'CHR-RAM size', value: (val & 0x0F) ? `${(64 << (val & 0x0F)) / 1024} KB` : 'None' },
            { mask: 'Bits 7..4', description: 'CHR-NVRAM size', value: ((val >> 4) & 0x0F) ? `${(64 << ((val >> 4) & 0x0F)) / 1024} KB` : 'None' },
          ],
        });
      } else if (b === 12) {
        const timingNames = ['RP2A03 (NTSC)', 'RP2A07 (PAL)', 'Multiple Region', 'Dendy'];
        explanations.push({
          byteIndex: 12,
          hexValue: toHex(val),
          name: 'NES 2.0: CPU/PPU Timing',
          summary: timingNames[val & 0x03] || 'Unknown',
          bits: [{ mask: 'Bits 1..0', description: 'Timing mode', value: `${val & 0x03} (${timingNames[val & 0x03] || ''})` }],
        });
      } else if (b === 13) {
        explanations.push({
          byteIndex: 13,
          hexValue: toHex(val),
          name: 'NES 2.0: Console Type',
          summary: (val & 0x0F) === 0 ? 'Standard NES / Famicom' : `Type ${val & 0x0F}`,
          bits: [{ mask: 'Bits 3..0', description: 'Extended Console Type', value: `${val & 0x0F}` }],
        });
      } else {
        explanations.push({
          byteIndex: b,
          hexValue: toHex(val),
          name: `NES 2.0: Reserved Byte ${b}`,
          summary: 'Must be zero for future standard expansion',
          bits: [{ mask: '7..0', description: 'Reserved', value: `$${toHex(val)}` }],
        });
      }
    } else {
      explanations.push({
        byteIndex: b,
        hexValue: toHex(val),
        name: `iNES 1.0: Padding Byte ${b}`,
        summary: 'Zero padding byte in standard iNES specification',
        bits: [{ mask: '7..0', description: 'Unused / Zero padding', value: `$${toHex(val)}` }],
      });
    }
  }

  return explanations;
}

// Generate Assembly Code (.asm / .inc) for header
export function exportHeaderAsm(header: Uint8Array, config: NESHeaderConfig): string {
  const hex = (b: number) => `$${b.toString(16).padStart(2, '0').toUpperCase()}`;
  const mapperInfo = KNOWN_MAPPERS[config.mapper]?.name || `Mapper ${config.mapper}`;

  return `; =====================================================================
; NES ROM Header (${config.format === 'nes2' ? 'NES 2.0' : 'iNES 1.0'})
; Generated by NES ROM Header & Image Converter
; Target Mapper: ${config.mapper} (${mapperInfo})
; PRG ROM: ${config.prgRomSizeKB} KB | CHR ROM: ${config.chrRomSizeKB} KB
; Mirroring: ${config.mirroring} | TV System: ${config.tvSystem.toUpperCase()}
; =====================================================================

.segment "HEADER"
    .byte $4E, $45, $53, $1A ; "NES" followed by MS-DOS EOF ($1A)
    .byte ${hex(header[4])}              ; PRG-ROM size in 16KB units (${config.prgRomSizeKB} KB)
    .byte ${hex(header[5])}              ; CHR-ROM size in 8KB units (${config.chrRomSizeKB} KB)
    .byte ${hex(header[6])}              ; Flags 6 (Mirroring, Battery, Trainer, Mapper low)
    .byte ${hex(header[7])}              ; Flags 7 (NES 2.0 tag, Mapper high, VS/PlayChoice)
    .byte ${hex(header[8])}              ; ${config.format === 'nes2' ? 'Flags 8 (Mapper MSB, Submapper)' : 'Flags 8 (PRG-RAM size in 8KB units)'}
    .byte ${hex(header[9])}              ; ${config.format === 'nes2' ? 'Flags 9 (PRG/CHR size MSBs)' : 'Flags 9 (TV system NTSC/PAL)'}
    .byte ${hex(header[10])}              ; ${config.format === 'nes2' ? 'Flags 10 (PRG-RAM / NVRAM sizes)' : 'Flags 10 (TV system unofficial)'}
    .byte ${hex(header[11])}              ; ${config.format === 'nes2' ? 'Flags 11 (CHR-RAM / NVRAM sizes)' : 'Padding byte 11'}
    .byte ${hex(header[12])}              ; ${config.format === 'nes2' ? 'Flags 12 (CPU/PPU Timing)' : 'Padding byte 12'}
    .byte ${hex(header[13])}              ; ${config.format === 'nes2' ? 'Flags 13 (Console Type)' : 'Padding byte 13'}
    .byte ${hex(header[14])}              ; Padding byte 14
    .byte ${hex(header[15])}              ; Padding byte 15
`;
}

// Generate C Header (.h)
export function exportHeaderC(header: Uint8Array, config: NESHeaderConfig): string {
  const hex = (b: number) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`;
  return `/**
 * NES ROM Header (${config.format === 'nes2' ? 'NES 2.0' : 'iNES 1.0'})
 * Mapper: ${config.mapper} | PRG: ${config.prgRomSizeKB} KB | CHR: ${config.chrRomSizeKB} KB
 */
#ifndef NES_ROM_HEADER_H
#define NES_ROM_HEADER_H

#include <stdint.h>

static const uint8_t NES_ROM_HEADER[16] = {
    ${Array.from(header).map(hex).join(', ')}
};

#endif // NES_ROM_HEADER_H
`;
}

// Hex representation with space
export function formatHeaderHex(header: Uint8Array): string {
  return Array.from(header)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}
