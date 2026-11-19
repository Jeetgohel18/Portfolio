import type { Kind, Mat } from '../art/shapes';
import type { ArtEl, Challenge, Doc, FontStyle, ShapeEl, TextEl, Role, Align } from './types';

/** Challenge data only — no UI, no scoring. Each has a deliberately bad `initial` and a polished (but not the only) `reference`. */
let n = 0;
const id = (p: string) => `${p}${n++}`;
const T = (role: Role, text: string, x: number, y: number, size: number, font: FontStyle, align: Align, color: string, rot = 0, extra: Partial<TextEl> = {}): TextEl =>
  ({ kind: 'text', id: id('t'), role, text, x, y, size, font, align, color, rot, ...extra });
const S = (shape: ShapeEl['shape'], x: number, y: number, w: number, h: number, color: string, rot = 0, role: Role = 'deco'): ShapeEl =>
  ({ kind: 'shape', id: id('s'), role, shape, x, y, w, h, color, rot });
const A = (art: Kind, x: number, y: number, s: number, c: string, c2: string, mat: Mat, rot = 0, role: Role = 'art'): ArtEl =>
  ({ kind: 'art', id: id('a'), role, art, x, y, s, c, c2, mat, rot });

/* ---------------------------- 01 — the chaotic poster ---------------------------- */
const posterInitial: Doc = {
  bg: '#ff3d9a',
  els: [
    S('rect', 0.12, 0.12, 0.05, 0.05, '#39ff88', 25), S('circle', 0.85, 0.07, 0.06, 0.06, '#7a2cff'),
    A('spiral', 0.1, 0.5, 0.12, '#ffffff', '#fff', 'matte', 40, 'deco'), A('star', 0.62, 0.6, 0.09, '#ff0000', '#fff', 'matte', -15, 'deco'),
    S('squiggle', 0.5, 0.78, 0.3, 0.06, '#00d1ff', -12), A('starburst', 0.9, 0.88, 0.1, '#39ff88', '#fff', 'matte', 12, 'deco'), A('ring', 0.07, 0.97, 0.1, '#7a2cff', '#fff', 'matte', 0, 'deco'),
    A('sphere', 0.3, 0.34, 0.16, '#00d1ff', '#ffe600', 'gloss'), A('torus', 0.72, 0.72, 0.13, '#ffe600', '#fff', 'metallic', 30),
    T('headline', 'Design Fest', 0.13, 0.64, 0.065, 'serif', 'left', '#39ff88', -6),
    T('sub', '12–14 JULY', 0.5, 0.12, 0.115, 'mono', 'left', '#ffe600', 4),
    T('info', 'Ahmedabad · Old Mill Grounds', 0.22, 0.93, 0.04, 'caps', 'left', '#00d1ff'),
    T('body', 'Talks. Workshops.\nLive critiques.\nFree chai.', 0.93, 0.42, 0.052, 'display', 'right', '#ffffff', 3),
    T('cta', 'FREE ENTRY', 0.06, 0.82, 0.085, 'bodyItalic', 'left', '#ff0000', -3),
  ],
};
const posterRef: Doc = {
  bg: '#fff1e0',
  els: [
    A('sphere', 0.74, 0.56, 0.36, '#ff6a4a', '#ffd75e', 'gloss', 0), A('torus', 0.82, 0.89, 0.2, '#ffd75e', '#ff6a4a', 'metallic', 24),
    T('headline', 'DESIGN\nFEST', 0.08, 0.07, 0.17, 'display', 'left', '#940428', 0, { lh: 0.9 }),
    T('sub', '12–14 JULY', 0.08, 0.42, 0.06, 'display', 'left', '#940428'),
    T('body', 'Talks. Workshops.\nLive critiques.\nFree chai.', 0.08, 0.53, 0.036, 'body', 'left', '#2a1418', 0, { lh: 1.3 }),
    T('info', 'Ahmedabad · Old Mill Grounds', 0.08, 0.72, 0.026, 'caps', 'left', '#940428'),
    T('cta', 'FREE ENTRY →', 0.08, 0.85, 0.03, 'caps', 'left', '#fffaf1', 0, { pill: '#940428' }),
  ],
};

/* --------------------------- 02 — the colour disaster --------------------------- */
const nightLayout = (c: { bg: string; head: string; sub: string; info: string; moon: string; cone: string; sphere: string; star: string; ribbon: string }): Doc => ({
  bg: c.bg,
  els: [
    S('circle', 0.5, 0.66, 0.46, 0.46, c.moon, 0, 'art'),
    A('ribbon', 0.84, 0.5, 0.16, c.ribbon, c.sub, 'gloss', -8), A('cone', 0.19, 0.74, 0.22, c.cone, c.sub, 'gloss', -10),
    A('sphere', 0.84, 0.8, 0.16, c.sphere, c.sub, 'gloss'), A('star', 0.5, 0.64, 0.14, c.star, c.sub, 'matte', 8),
    T('headline', 'NIGHT\nMARKET', 0.5, 0.07, 0.17, 'display', 'center', c.head, 0, { lh: 0.9 }),
    T('sub', 'FRI–SUN · OLD CITY', 0.5, 0.41, 0.03, 'caps', 'center', c.sub),
    T('info', 'Food · Music · Lanterns', 0.5, 0.92, 0.034, 'body', 'center', c.info),
  ],
});
const nightInitial = nightLayout({ bg: '#ff8a00', head: '#ff2bd6', sub: '#39ff88', info: '#00ffd5', moon: '#6a00ff', cone: '#ff0000', sphere: '#00ffd5', star: '#ffee00', ribbon: '#00a2ff' });
const nightRef = nightLayout({ bg: '#1e1416', head: '#fffaf1', sub: '#ff6a4a', info: '#cdbdff', moon: '#ffd75e', cone: '#ff6a4a', sphere: '#cdbdff', star: '#ffb3c7', ribbon: '#3b47ff' });

/* ------------------------- 03 — the typography mess ------------------------- */
const typeInitial: Doc = {
  bg: '#f3ecdc',
  els: [
    A('sphere', 0.78, 0.47, 0.22, '#c9a27e', '#e3d3ae', 'gloss'),
    T('headline', 'Slow\nSunday', 0.45, 0.2, 0.095, 'serif', 'center', '#8c4a2f', 0),
    T('info', 'ISSUE 07 — SUMMER', 0.85, 0.07, 0.085, 'bodyItalic', 'right', '#5d6b3a', 0),
    T('sub', 'How to do nothing,\nbeautifully', 0.12, 0.55, 0.08, 'mono', 'left', '#2b2118', 0),
    T('body', 'Why your best ideas arrive\nwhile the kettle boils.', 0.6, 0.71, 0.07, 'display', 'center', '#8c4a2f', 0),
    T('body', 'Plus: a field guide to\nlong lunches.', 0.2, 0.84, 0.062, 'serif', 'left', '#5d6b3a', 0),
    T('info', 'Words by the editors', 0.93, 0.95, 0.075, 'caps', 'right', '#2b2118', 0),
  ],
};
const typeRef: Doc = {
  bg: '#f3ecdc',
  els: [
    A('sphere', 0.76, 0.7, 0.3, '#c9a27e', '#e3d3ae', 'gloss'),
    T('info', 'ISSUE 07 — SUMMER', 0.08, 0.045, 0.03, 'caps', 'left', '#5d6b3a'),
    T('headline', 'Slow\nSunday', 0.08, 0.11, 0.22, 'display', 'left', '#8c4a2f', 0, { lh: 0.9 }),
    T('sub', 'How to do nothing,\nbeautifully', 0.08, 0.55, 0.07, 'displayLight', 'left', '#2b2118', 0, { lh: 1.05 }),
    T('body', 'Why your best ideas arrive while\nthe kettle boils. Plus: a field\nguide to long lunches.', 0.08, 0.74, 0.034, 'body', 'left', '#2b2118', 0, { lh: 1.3 }),
    T('info', 'WORDS BY THE EDITORS', 0.08, 0.92, 0.025, 'caps', 'left', '#5d6b3a'),
  ],
};

const all = { colour: true, type: true, align: true, spacing: true, remove: true, resize: true, move: true };
export const CHALLENGES: Challenge[] = [
  { id: 'poster', n: 1, name: 'The Chaotic Poster', objective: 'Make this poster look professionally designed.', blurb: 'Tame the type, line things up, bin the clutter.', initial: posterInitial, reference: posterRef, tools: all, seconds: 120,
    weights: { alignment: 25, spacing: 20, hierarchy: 20, colour: 20, balance: 15 } },
  { id: 'colour', n: 2, name: 'The Colour Disaster', objective: 'Give this design a better colour identity.', blurb: 'The layout is fine. The colours are having a fight.', initial: nightInitial, reference: nightRef, tools: { ...all, type: false, spacing: false, remove: false }, seconds: 90,
    weights: { alignment: 10, spacing: 10, hierarchy: 10, colour: 55, balance: 15 } },
  { id: 'type', n: 3, name: 'The Typography Mess', objective: 'Give this design a clear visual hierarchy.', blurb: 'Seven similar sizes, one cover. Decide what matters.', initial: typeInitial, reference: typeRef, tools: { ...all, colour: false, remove: false }, seconds: 120,
    weights: { alignment: 20, spacing: 20, hierarchy: 40, colour: 10, balance: 10 } },
];
