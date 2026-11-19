/**
 * Colour mixing for the Colour Playground — pure functions, no DOM, no animation.
 *
 * MODEL (a visually intuitive digital pigment simulation, NOT exact paint chemistry)
 * ---------------------------------------------------------------------------------
 * Averaging RGB gives muddy "light-mixing" results (blue + yellow = grey). Painters mix
 * SUBTRACTIVELY on the red–yellow–blue (RYB) wheel (blue + yellow = green). So:
 *
 *  1. Each sRGB hex is converted to RYB coordinates by numerically inverting the Gosset–Chen
 *     RYB colour cube (trilinear interpolation between the 8 corner colours of the cube).
 *  2. The two RYB coordinates are averaged (50 / 50 pigment concentrations) — this decides the
 *     HUE of the mix (red + yellow → orange, yellow + blue → green, red + blue → purple) and
 *     lets white-ish colours tint while dark ones deepen.
 *  3. The cube cannot reach every sRGB colour (e.g. saturated cobalt), so the part of each input
 *     that the cube cannot express is measured in OKLCH (lightness offset, chroma ratio, hue
 *     offset) and the average of those offsets is re-applied to the mix. This keeps results
 *     vivid, and guarantees mix(a, a) === a.
 *  4. The result is gamut-mapped by reducing chroma until it fits in sRGB.
 *
 * Every step is deterministic and symmetric: mix(a, b) === mix(b, a), and the same two inputs
 * always return the same hex.
 */

export type RGB = [number, number, number];

/* ------------------------------ hex / sRGB helpers ------------------------------ */

export function normaliseHex(hex: string): string {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return `#${full.slice(0, 6).toLowerCase()}`;
}
export function hexToRgb(hex: string): RGB {
  const h = normaliseHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
}
export function rgbToHex(rgb: RGB): string {
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('')}`;
}
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (l: number) => { const v = Math.min(1, Math.max(0, l)); return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055; };

/* ------------------------------------ OKLab ------------------------------------ */

type LCh = { L: number; C: number; h: number };

function rgbToLCh(rgb: RGB): LCh {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: Math.atan2(B, A) };
}

function lchToLinear({ L, C, h }: LCh): RGB {
  const A = C * Math.cos(h), B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH → sRGB, reducing chroma until the colour fits the sRGB gamut. */
function lchToRgbInGamut(lch: LCh): RGB {
  let { C } = lch;
  let lin = lchToLinear({ ...lch, C });
  for (let i = 0; i < 40 && lin.some((v) => v < -0.0005 || v > 1.0005); i++) {
    C *= 0.94;
    lin = lchToLinear({ ...lch, C });
  }
  return lin.map(toSrgb) as RGB;
}

const wrap = (a: number) => ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

/* ------------------------------ RYB colour cube ------------------------------ */

/** Corner colours (sRGB 0–1) of the RYB cube, keyed by [red, yellow, blue] ∈ {0,1}. After Gosset & Chen (2004). */
const CUBE: Record<string, RGB> = {
  '000': [1, 1, 1],           // white (no pigment)
  '100': [1, 0, 0],           // red
  '010': [1, 1, 0],           // yellow
  '001': [0.163, 0.373, 0.6], // blue
  '110': [1, 0.5, 0],         // orange
  '101': [0.5, 0, 0.5],       // purple
  '011': [0, 0.66, 0.2],      // green
  '111': [0.2, 0.094, 0],     // all pigments → near black
};

export function rybToRgb([r, y, b]: RGB): RGB {
  const out: RGB = [0, 0, 0];
  for (const key in CUBE) {
    const w = (key[0] === '1' ? r : 1 - r) * (key[1] === '1' ? y : 1 - y) * (key[2] === '1' ? b : 1 - b);
    const c = CUBE[key];
    out[0] += w * c[0]; out[1] += w * c[1]; out[2] += w * c[2];
  }
  return out;
}

/** Numerically invert rybToRgb (damped Gauss–Newton, clamped to the cube). Fixed iteration count ⇒ deterministic. */
export function rgbToRyb(target: RGB): RGB {
  let p: RGB = [0.3, 0.3, 0.3];
  const e = 1e-4;
  for (let it = 0; it < 60; it++) {
    const f0 = rybToRgb(p);
    const f = [f0[0] - target[0], f0[1] - target[1], f0[2] - target[2]];
    // Jacobian columns by forward difference
    const J = [0, 1, 2].map((i) => {
      const q: RGB = [...p]; q[i] += e;
      const fi = rybToRgb(q);
      return [(fi[0] - f0[0]) / e, (fi[1] - f0[1]) / e, (fi[2] - f0[2]) / e];
    }); // J[col][row]
    // Solve (JᵀJ + λI) d = Jᵀ f
    const A = [0, 1, 2].map((i) => [0, 1, 2].map((j) => J[i][0] * J[j][0] + J[i][1] * J[j][1] + J[i][2] * J[j][2] + (i === j ? 1e-6 : 0)));
    const bv = [0, 1, 2].map((i) => J[i][0] * f[0] + J[i][1] * f[1] + J[i][2] * f[2]);
    const d = solve3(A, bv);
    p = [0, 1, 2].map((i) => Math.min(1, Math.max(0, p[i] - 0.7 * d[i]))) as RGB;
  }
  return p;
}

function solve3(A: number[][], b: number[]): number[] {
  const m = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < 3; c++) {
    let piv = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[piv][c])) piv = r;
    [m[c], m[piv]] = [m[piv], m[c]];
    const div = m[c][c] || 1e-12;
    for (let k = c; k < 4; k++) m[c][k] /= div;
    for (let r = 0; r < 3; r++) if (r !== c) { const fct = m[r][c]; for (let k = c; k < 4; k++) m[r][k] -= fct * m[c][k]; }
  }
  return [m[0][3], m[1][3], m[2][3]];
}

/* --------------------------------- the mixer --------------------------------- */

const cache = new Map<string, string>();

/** Deterministic, symmetric pigment-style mix of two hex colours (50 / 50). */
export function mixColours(hexA: string, hexB: string): string {
  const a = normaliseHex(hexA), b = normaliseHex(hexB);
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [x, y] = a < b ? [a, b] : [b, a];             // canonical order ⇒ exact symmetry despite float arithmetic

  const A = hexToRgb(x), B = hexToRgb(y);
  const pa = rgbToRyb(A), pb = rgbToRyb(B);
  const cubeA = rybToRgb(pa), cubeB = rybToRgb(pb);
  const mid = rybToRgb([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2]);

  const la = rgbToLCh(A), lb = rgbToLCh(B);
  const ca = rgbToLCh(cubeA), cb = rgbToLCh(cubeB);
  const lm = rgbToLCh(mid);

  const dL = (la.L - ca.L + lb.L - cb.L) / 2;                                       // lightness the cube could not express
  const gain = (la.C / Math.max(ca.C, 1e-3) + lb.C / Math.max(cb.C, 1e-3)) / 2;    // chroma the cube could not express
  const dH = (wrap(la.h - ca.h) + wrap(lb.h - cb.h)) / 2;                           // hue drift of the inversion

  const out = rgbToHex(lchToRgbInGamut({ L: lm.L + dL, C: lm.C * gain, h: lm.h + dH }));
  cache.set(key, out);
  return out;
}

/* ------------------------------ naming (controlled) ------------------------------ */

type Tone = 'deep' | 'mid' | 'light';
type Family = 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'neutral';

const NAMES: Record<Family, Record<Tone, string[]>> = {
  red:     { deep: ['Midnight Berry', 'Garnet Hour', 'Cherry Static'], mid: ['Poppy Signal', 'Red Lantern', 'Cherry Pop'], light: ['Rosy Cheek', 'Strawberry Milk', 'Blush Note'] },
  orange:  { deep: ['Burnt Toast', 'Ember Glow', 'Copper Kettle'], mid: ['Sunset Jam', 'Marmalade Sky', 'Tangerine Dream'], light: ['Peach Theory', 'Apricot Haze', 'Creamsicle'] },
  yellow:  { deep: ['Mustard Seed', 'Honey Ledger', 'Amber Archive'], mid: ['Citrus Pop', 'Lemon Zest', 'Buttercup Beat'], light: ['Butter Cloud', 'Custard Light', 'Pale Sunbeam'] },
  green:   { deep: ['Forest Ink', 'Pine Ledger', 'Moss Theory'], mid: ['Fresh Clover', 'Garden Pop', 'Basil Beat'], light: ['Mint Whisper', 'Sage Cloud', 'Pistachio Dust'] },
  teal:    { deep: ['Deep Lagoon', 'Teal Ledger', 'Harbour Night'], mid: ['Ocean Candy', 'Lagoon Pop', 'Seaglass Beat'], light: ['Aqua Breeze', 'Glacier Mint', 'Pool Light'] },
  blue:    { deep: ['Midnight Cobalt', 'Ink Ocean', 'Deep Signal'], mid: ['Electric Current', 'Cobalt Pop', 'Blue Static'], light: ['Sky Candy', 'Powder Day', 'Cloud Nine'] },
  purple:  { deep: ['Midnight Plum', 'Velvet Night', 'Grape Ledger'], mid: ['Electric Bloom', 'Violet Static', 'Grape Soda'], light: ['Lavender Dust', 'Lilac Haze', 'Orchid Mist'] },
  pink:    { deep: ['Raspberry Noir', 'Mulberry Note', 'Berry Ledger'], mid: ['Flamingo Pop', 'Bubblegum Theory', 'Hot Petal'], light: ['Rose Quartz Dust', 'Cotton Candy', 'Petal Whisper'] },
  neutral: { deep: ['Charcoal Mood', 'Ink Study', 'Smoke Signal'], mid: ['Stone Theory', 'Pebble Note', 'Dusty Studio'], light: ['Paper Cloud', 'Oat Milk', 'Chalk Whisper'] },
};

export function colourFamily(hex: string): { family: Family; tone: Tone } {
  const { L, C, h } = rgbToLCh(hexToRgb(hex));
  const deg = ((h * 180) / Math.PI + 360) % 360;
  const tone: Tone = L < 0.5 ? 'deep' : L > 0.8 ? 'light' : 'mid';
  if (C < 0.035) return { family: 'neutral', tone };
  let family: Family;
  if (deg >= 12 && deg < 40) family = 'red';
  else if (deg >= 40 && deg < 78) family = 'orange';
  else if (deg >= 78 && deg < 112) family = 'yellow';
  else if (deg >= 112 && deg < 168) family = 'green';
  else if (deg >= 168 && deg < 215) family = 'teal';
  else if (deg >= 215 && deg < 278) family = 'blue';
  else if (deg >= 278 && deg < 338) family = 'purple';
  else family = 'pink';                                   // 338° → 12° (magenta-pink to rose)
  // a pale red reads as a blush/pink, not "red"
  if (family === 'red' && tone === 'light') return { family: 'pink', tone };
  return { family, tone };
}

/** Playful name chosen from a fixed list by colour family + tone; the same hex always gets the same name. */
export function colourName(hex: string): string {
  const { family, tone } = colourFamily(hex);
  const list = NAMES[family][tone];
  let hash = 0;
  for (const ch of normaliseHex(hex)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return list[hash % list.length];
}

/** Readable text colour (ink or paper) for a swatch. */
export function onColour(hex: string): '#1f1a17' | '#fffaf1' {
  return rgbToLCh(hexToRgb(hex)).L > 0.62 ? '#1f1a17' : '#fffaf1';
}
