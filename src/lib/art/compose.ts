import { hue, isWarm, luma, readable } from './colour';
import { getPalette, PALETTES } from './palettes';
import type { Palette } from './palettes';
import { KIND_META, TYPE_WORDS } from './shapes';
import type { Kind, Mat, Style } from './shapes';

/** One object on the canvas. x/y are 0–1 of the stage; s is the object height as a fraction of min(stage w, h). */
export type Obj = { id: string; kind: Kind; x: number; y: number; s: number; rot: number; c: string; c2: string; mat: Mat; text?: string };
export type Doc = { bg: string; paletteId: string; objs: Obj[] };
export const styleOf = (o: Obj): Style => ({ kind: o.kind, c: o.c, c2: o.c2, mat: o.mat, text: o.text });

let counter = 0;
export const newId = () => `o${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Small seeded RNG so a composition can be reproduced from its seed. */
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const HEROES: Kind[] = ['sphere', 'torus', 'blob', 'starburst', 'rcube', 'flower', 'ring', 'liquid', 'cube', 'pyramid'];
const MIDS: Kind[] = ['cube', 'cylinder', 'cone', 'pyramid', 'ribbon', 'liquid', 'torus', 'rcube', 'sphere', 'blob', 'ring', 'flower'];
const ACCENTS: Kind[] = ['star', 'circle', 'sticker', 'spiral', 'square', 'number', 'sphere', 'cone', 'starburst'];
const HERO_MATS: Mat[] = ['gloss', 'glass', 'metallic', 'gradient'];
const MIX_MATS: Mat[] = ['matte', 'gloss', 'translucent', 'gradient', 'glass'];

export const defaultStyle = (kind: Kind, c: string, c2: string, text?: string): Pick<Obj, 'kind' | 'c' | 'c2' | 'mat' | 'text' | 's'> => ({ kind, c, c2, mat: KIND_META[kind].mat, text, s: KIND_META[kind].base });

/**
 * MAGIC SHUFFLE — rule-based, not random scatter:
 *  • hierarchy: one oversized hero (≈0.5), 2–3 mid objects (≈0.2–0.3), 3–4 small accents (≈0.07–0.12)
 *  • the hero sits near a rule-of-thirds point; mids orbit it with ~25% controlled overlap and ≥110° spacing
 *  • accents are placed by rejection sampling: kept away from edges (negative space) and from each other
 *  • colour: the hero takes the palette's lead colour, objects never share one flat colour; contrast with the background is enforced
 * Works in "unit space" where the shorter stage side = 1, so it is aspect-ratio safe.
 */
export function composeArtwork(seed: number, aspect: number, paletteId?: string, avoidHeadline = false): Doc {
  const r = rng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const pal: Palette = paletteId ? getPalette(paletteId) : pick(PALETTES);
  const W = aspect >= 1 ? aspect : 1, H = aspect >= 1 ? 1 : 1 / aspect;
  // keep the opening headline readable: no objects in its zone (left on wide stages, top on tall ones)
  const minX = avoidHeadline && aspect >= 1.1 ? W * 0.44 : 0, minY = avoidHeadline && aspect < 1.1 ? H * 0.36 : 0;
  const bg = r() < 0.72 ? pal.bgs[0] : pal.bgs[1];
  const dark = luma(bg) < 0.3;
  // usable colours: drop any that vanish into the background
  const byContrast = [...pal.colours].sort((a, b) => Math.abs(luma(b) - luma(bg)) - Math.abs(luma(a) - luma(bg)));
  const cols = byContrast.filter((c) => Math.abs(luma(c) - luma(bg)) > 0.12).length >= 3 ? byContrast.filter((c) => Math.abs(luma(c) - luma(bg)) > 0.12) : byContrast.slice(0, 3);
  const cycle = [...cols].sort(() => r() - 0.5);
  let ci = 0; const nextCol = () => cycle[ci++ % cycle.length];

  const placed: { x: number; y: number; r: number }[] = [];
  const objs: Obj[] = [];
  const add = (kind: Kind, s: number, x: number, y: number, c: string, mat: Mat, text?: string) => {
    const asp = kind === 'line' ? 3 : kind === 'type' ? Math.max(1.1, (text?.length ?? 5) * 0.62 + 0.3) : 1;
    const o: Obj = { id: newId(), kind, x: x / W, y: y / H, s, rot: Math.round((r() - 0.5) * (kind === 'type' ? 24 : 70)), c, c2: pick(cycle.filter((q) => q !== c).length ? cycle.filter((q) => q !== c) : cycle), mat, text };
    objs.push(o); placed.push({ x, y, r: (s * Math.max(asp, 1)) / 2 });
  };

  // 1 — hero near a thirds point
  const hx = minX ? W * 0.7 : W * (r() < 0.5 ? 0.36 : 0.64), hy = minY ? H * 0.66 : H * (r() < 0.5 ? 0.42 : 0.56);
  const heroS = 0.5 + r() * 0.1;
  const heroKind = pick(HEROES);
  add(heroKind, heroS, hx, hy, nextCol(), pick(HERO_MATS));

  // 2 — optional typographic anchor, behind the hero (low z), tilted
  if (!avoidHeadline && r() < 0.55) {
    const word = pick(TYPE_WORDS);
    const tc = dark ? '#fffaf1' : cycle[cycle.length - 1];
    const s = 0.2 + r() * 0.06;
    add('type', s, W * 0.5 + (hx < W / 2 ? 0.14 : -0.14) * W, H * (hy > H / 2 ? 0.3 : 0.74), tc, 'matte', word);
    objs.unshift(objs.pop()!);
  }

  // 3 — mids orbit the hero, spaced ≥110° apart, overlapping ~25%
  const nMid = 2 + Math.floor(r() * 2);
  let ang = r() * Math.PI * 2;
  for (let i = 0; i < nMid; i++) {
    ang += (Math.PI * 2) / nMid + (r() - 0.5) * 0.5;
    const s = 0.2 + r() * 0.1, kind = pick(MIDS);
    const dist = (heroS / 2 + s / 2) * 0.78;
    let x = 0, y = 0;
    for (let t = 0; t < 14; t++) {            // rotate around the hero until the spot keeps controlled overlap
      x = hx + Math.cos(ang) * dist; y = hy + Math.sin(ang) * dist;
      x = Math.min(W - s / 2 - 0.05, Math.max(s / 2 + 0.05, minX + s / 2, x)); y = Math.min(H - s / 2 - 0.05, Math.max(s / 2 + 0.05, minY + s / 2, y));
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= 0.5 * (p.r + s / 2))) break;
      ang += 0.55;
    }
    add(kind, s, x, y, nextCol(), pick(MIX_MATS));
  }

  // 4 — small accents by rejection sampling (keeps negative space + spacing)
  const nAcc = 3 + Math.floor(r() * 2);
  for (let i = 0; i < nAcc; i++) {
    const s = 0.07 + r() * 0.05, kind = pick(ACCENTS);
    for (let t = 0; t < 80; t++) {
      const x = Math.max(minX + s / 2, s / 2 + 0.08) + r() * (W - s - 0.16 - Math.max(0, minX - 0.08)), y = Math.max(minY + s / 2, s / 2 + 0.08) + r() * (H - s - 0.16 - Math.max(0, minY - 0.08));
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) > p.r + s / 2 + 0.05)) { add(kind, s, x, y, nextCol(), kind === 'sphere' ? 'gloss' : 'matte'); break; }
    }
  }
  return { bg, paletteId: pal.id, objs };
}

/* -------------------------- mini challenges -------------------------- */

export type Challenge = { id: string; title: string; hint: string; check: (d: Doc) => boolean; progress: (d: Doc) => string };
const distinct = (d: Doc) => new Set(d.objs.map((o) => o.c.toLowerCase())).size;

export const CHALLENGES: Challenge[] = [
  { id: 'three', title: 'Create something using only three objects.', hint: 'Exactly 3 objects.', check: (d) => d.objs.length === 3, progress: (d) => `${d.objs.length} / 3 objects` },
  { id: 'warm', title: 'Make a composition using only warm colours.', hint: 'Reds, oranges, yellows, warm pinks — at least 3 objects.', check: (d) => d.objs.length >= 3 && d.objs.every((o) => isWarm(o.c)), progress: (d) => `${d.objs.filter((o) => isWarm(o.c)).length} / ${d.objs.length} warm` },
  { id: 'sym', title: 'Create something symmetrical.', hint: 'Mirror objects left ↔ right around the centre line.', check: (d) => symmetrical(d), progress: (d) => (symmetrical(d) ? 'Mirrored ✓' : 'Not mirrored yet') },
  { id: 'big', title: 'Use one oversized object and three small objects.', hint: 'One ≥ 0.36 size, three ≤ 0.2 size, nothing else.', check: (d) => d.objs.length === 4 && d.objs.filter((o) => o.s >= 0.36).length === 1 && d.objs.filter((o) => o.s <= 0.2).length === 3, progress: (d) => `${d.objs.filter((o) => o.s >= 0.36).length} big · ${d.objs.filter((o) => o.s <= 0.2).length} small` },
  { id: 'two', title: 'Create a composition with no more than two colours.', hint: 'Up to 2 distinct object colours, at least 2 objects.', check: (d) => d.objs.length >= 2 && distinct(d) <= 2, progress: (d) => `${distinct(d)} colour${distinct(d) === 1 ? '' : 's'}` },
];

function symmetrical(d: Doc) {
  if (d.objs.length < 2) return false;
  const used = new Set<string>();
  return d.objs.every((o) => {
    if (Math.abs(o.x - 0.5) < 0.035) return true;                 // sits on the axis
    if (used.has(o.id)) return true;
    const m = d.objs.find((q) => q.id !== o.id && !used.has(q.id) && Math.abs(q.x - (1 - o.x)) < 0.05 && Math.abs(q.y - o.y) < 0.05 && Math.abs(q.s - o.s) < 0.05 && q.c.toLowerCase() === o.c.toLowerCase() && q.kind === o.kind);
    if (m) { used.add(o.id); used.add(m.id); return true; }
    return false;
  });
}

export { readable, hue };
