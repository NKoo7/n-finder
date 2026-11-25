/**
 * Deterministic parameters for generated fallback artwork. The same id always yields the
 * same art. Pure and framework-free so it can be tested.
 */
export interface PosterShape {
  cx: number;
  cy: number;
  r: number;
  /** 0..1 */
  opacity: number;
}

export interface PosterArt {
  shapes: PosterShape[];
  /** Horizontal horizon line position, 0..300 in poster coordinates. */
  horizon: number;
  /** Rotation of the accent band, degrees. */
  angle: number;
}

/** 32-bit FNV-1a hash. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Small deterministic generator seeded from the hash. */
function sequence(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

export interface PosterPalette {
  /** Gradient stops, top to bottom. */
  from: string;
  via: string;
  to: string;
  /** Accent used for shapes and the horizon band. */
  accent: string;
}

const POSTER_PALETTES: readonly PosterPalette[] = [
  { from: "#4c1d95", via: "#7c3aed", to: "#120b22", accent: "#f472b6" },
  { from: "#831843", via: "#db2777", to: "#120b22", accent: "#4ade80" },
  { from: "#14532d", via: "#16a34a", to: "#120b22", accent: "#f472b6" },
  { from: "#1e3a8a", via: "#2563eb", to: "#120b22", accent: "#a78bfa" },
  { from: "#701a75", via: "#c026d3", to: "#120b22", accent: "#4ade80" },
  { from: "#1e1b4b", via: "#4f46e5", to: "#120b22", accent: "#60a5fa" },
  { from: "#064e3b", via: "#059669", to: "#120b22", accent: "#60a5fa" },
  { from: "#581c87", via: "#9333ea", to: "#120b22", accent: "#22d3ee" },
];

/** Deterministic vibrant palette per film id. */
export function posterPalette(id: string): PosterPalette {
  return POSTER_PALETTES[hashString(id) % POSTER_PALETTES.length];
}

export function posterArt(id: string): PosterArt {
  const next = sequence(hashString(id));
  const shapes: PosterShape[] = Array.from({ length: 3 }, () => ({
    cx: Math.round(20 + next() * 160),
    cy: Math.round(30 + next() * 170),
    r: Math.round(30 + next() * 70),
    opacity: Math.round((0.06 + next() * 0.16) * 100) / 100,
  }));
  return {
    shapes,
    horizon: Math.round(150 + next() * 60),
    angle: Math.round(-24 + next() * 48),
  };
}
