import { darken, lighten, mix, readable, tone } from './colour';

/**
 * The object library. Every object is drawn as an SVG string (100-unit tall viewBox) so the same drawing is used
 * on screen AND for PNG export. Pseudo-3D comes from per-face shading, specular highlights and material gradients.
 */
export type Mat = 'matte' | 'gloss' | 'translucent' | 'metallic' | 'gradient' | 'glass';
export const MATERIALS: Mat[] = ['matte', 'gloss', 'translucent', 'metallic', 'gradient', 'glass'];
export const MAT_LABEL: Record<Mat, string> = { matte: 'Matte', gloss: 'Glossy', translucent: 'Soft translucent', metallic: 'Metallic', gradient: 'Gradient', glass: 'Glass' };

export type Group = 'geometric' | 'abstract' | 'graphic' | 'type';
export type Kind =
  | 'cube' | 'sphere' | 'pyramid' | 'torus' | 'rcube' | 'cylinder' | 'cone'
  | 'ribbon' | 'blob' | 'liquid' | 'ring' | 'starburst' | 'spiral' | 'flower'
  | 'circle' | 'square' | 'star' | 'line' | 'sticker' | 'number' | 'type';

export type Style = { kind: Kind; c: string; c2: string; mat: Mat; text?: string };
export type TextSpec = { value: string; x: number; y: number; size: number; weight: number; fill: string; fit: number };
export type Drawing = { defs: string; body: string; aspect: number; text?: TextSpec; opacity?: number };

type Stop = [number, string, number];
const f = (n: number) => +n.toFixed(2);

/** Gradient stops for a face of base colour `base` in the given material. */
function stops(mat: Mat, base: string, c2: string): Stop[] {
  switch (mat) {
    case 'matte': return [[0, lighten(base, 0.1), 1], [1, darken(base, 0.04), 1]];
    case 'gloss': return [[0, lighten(base, 0.34), 1], [0.5, base, 1], [1, darken(base, 0.22), 1]];
    case 'translucent': return [[0, lighten(base, 0.3), 0.78], [1, base, 0.62]];
    case 'metallic': { const m = mix(base, '#9aa0aa', 0.4); return [[0, lighten(m, 0.6), 1], [0.26, darken(m, 0.1), 1], [0.5, lighten(m, 0.38), 1], [0.76, darken(m, 0.38), 1], [1, lighten(m, 0.18), 1]]; }
    case 'gradient': return [[0, lighten(base, 0.12), 1], [1, mix(c2, base, 0.15), 1]];
    case 'glass': return [[0, '#ffffff', 0.62], [0.45, lighten(base, 0.2), 0.34], [1, base, 0.62]];
  }
}

class Ctx {
  defs: string[] = [];
  n = 0;
  constructor(readonly id: string, readonly s: Style) {}
  /** Register a gradient and return its url() fill. type: 'l' linear (angle in degrees), 'r' radial (highlight at cx,cy). */
  fill(t: number, type: 'l' | 'r' = 'l', a = 45, cx = 0.35, cy = 0.28): string {
    const gid = `${this.id}g${this.n++}`;
    const base = tone(this.s.c, t);
    const st = stops(this.s.mat, base, this.s.c2).map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join('');
    if (type === 'r') this.defs.push(`<radialGradient id="${gid}" cx="${cx}" cy="${cy}" r="0.85">${st}</radialGradient>`);
    else { const r = (a * Math.PI) / 180; this.defs.push(`<linearGradient id="${gid}" x1="${f(0.5 - Math.cos(r) / 2)}" y1="${f(0.5 - Math.sin(r) / 2)}" x2="${f(0.5 + Math.cos(r) / 2)}" y2="${f(0.5 + Math.sin(r) / 2)}">${st}</linearGradient>`); }
    return `url(#${gid})`;
  }
  /** Specular highlight for glossy / glass materials. */
  shine(shape: string, strength = 0.7): string {
    const m = this.s.mat; if (m !== 'gloss' && m !== 'glass') return '';
    return shape.replace('/>', ` fill="#fff" fill-opacity="${m === 'glass' ? strength * 0.9 : strength}" style="mix-blend-mode:normal"/>`);
  }
  rim(): string { return this.s.mat === 'glass' ? ' stroke="#fff" stroke-opacity=".65" stroke-width="1.6"' : ''; }
}

const poly = (pts: number[][], fill: string, extra = '') => `<polygon points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="2.4" stroke-linejoin="round"${extra}/>`;
const starPts = (n: number, R: number, r: number, cx = 50, cy = 50, rot = -Math.PI / 2) => Array.from({ length: n * 2 }, (_, i) => { const a = rot + (i * Math.PI) / n, rr = i % 2 ? r : R; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });

type Builder = (x: Ctx) => { body: string; aspect?: number; text?: TextSpec };

const B: Record<Kind, Builder> = {
  cube: (x) => ({ body:
    poly([[50, 6], [91, 28], [50, 50], [9, 28]], x.fill(0.22, 'l', 90)) +
    poly([[9, 28], [50, 50], [50, 94], [9, 72]], x.fill(0, 'l', 60)) +
    poly([[50, 50], [91, 28], [91, 72], [50, 94]], x.fill(-0.3, 'l', 60)) +
    x.shine('<polygon points="20,30 46,16 58,22 32,36"/>', 0.45) }),
  rcube: (x) => ({ body:
    `<rect x="9" y="12" width="82" height="82" rx="26" fill="${x.fill(-0.32, 'l', 90)}"/>` +
    `<rect x="9" y="6" width="82" height="82" rx="26" fill="${x.fill(0, 'r', 45, 0.3, 0.22)}"${x.rim()}/>` +
    `<rect x="17" y="13" width="66" height="30" rx="15" fill="#fff" fill-opacity="${x.s.mat === 'matte' ? 0.12 : 0.26}"/>` +
    x.shine('<ellipse cx="32" cy="24" rx="12" ry="6" transform="rotate(-24 32 24)"/>', 0.7) }),
  sphere: (x) => ({ body:
    `<circle cx="50" cy="50" r="44" fill="${x.fill(0, 'r', 0, 0.34, 0.28)}"${x.rim()}/>` +
    `<circle cx="50" cy="50" r="41" fill="none" stroke="${darken(x.s.c, 0.3)}" stroke-opacity=".18" stroke-width="6"/>` +
    x.shine('<ellipse cx="34" cy="28" rx="13" ry="7.5" transform="rotate(-32 34 28)"/>', 0.75) }),
  pyramid: (x) => ({ body:
    poly([[50, 5], [8, 78], [54, 95]], x.fill(0.12, 'l', 70)) +
    poly([[50, 5], [54, 95], [93, 76]], x.fill(-0.32, 'l', 70)) +
    x.shine('<polygon points="48,16 26,56 40,60"/>', 0.35) }),
  torus: (x) => ({ body:
    `<path fill-rule="evenodd" d="M50 6a44 44 0 1 0 0.01 0zM50 33a17 17 0 1 1-0.01 0z" fill="${x.fill(0, 'l', 50)}"${x.rim()}/>` +
    `<circle cx="50" cy="50" r="17.5" fill="none" stroke="${darken(x.s.c, 0.35)}" stroke-opacity=".35" stroke-width="3"/>` +
    `<path d="M16 34a38 38 0 0 1 40-24" fill="none" stroke="#fff" stroke-opacity="${x.s.mat === 'matte' ? 0.18 : 0.55}" stroke-width="4" stroke-linecap="round"/>` }),
  cylinder: (x) => ({ body:
    `<path d="M15 24V76a35 14 0 0 0 70 0V24Z" fill="${x.fill(0, 'l', 0)}"${x.rim()}/>` +
    `<ellipse cx="50" cy="24" rx="35" ry="14" fill="${x.fill(0.28, 'l', 45)}"${x.rim()}/>` +
    x.shine('<rect x="24" y="34" width="7" height="38" rx="3.5"/>', 0.5) }),
  cone: (x) => ({ body:
    `<path d="M50 5L88 78a38 15 0 0 1-76 0Z" fill="${x.fill(0, 'l', 0)}"${x.rim()}/>` +
    `<path d="M50 5L60 28 40 28Z" fill="${lighten(x.s.c, 0.3)}" opacity=".25"/>` +
    x.shine('<polygon points="44,22 40,70 48,72 50,26"/>', 0.45) }),
  ribbon: (x) => {
    let body = ''; const n = 9, pts: { x: number; y1: number; y2: number; t: number }[] = [];
    for (let i = 0; i <= n; i++) { const a = i * 0.82, yc = 50 + 21 * Math.sin(a), h = 6 + 28 * Math.abs(Math.cos(a)); pts.push({ x: 5 + (i * 90) / n, y1: yc - h / 2, y2: yc + h / 2, t: Math.cos(a) >= 0 ? 0.18 : -0.26 }); }
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[i + 1]; body += poly([[a.x, a.y1], [b.x, b.y1], [b.x, b.y2], [a.x, a.y2]], x.fill((a.t + b.t) / 2, 'l', 90)); }
    return { body };
  },
  blob: (x) => ({ body:
    `<path d="M52 6C74 5 94 24 91 48C88 74 71 95 47 92C23 89 7 73 9 49C11 26 30 7 52 6Z" fill="${x.fill(0, 'r', 0, 0.3, 0.25)}"${x.rim()}/>` +
    x.shine('<ellipse cx="33" cy="27" rx="14" ry="7" transform="rotate(-30 33 27)"/>', 0.65) }),
  liquid: (x) => ({ body:
    `<path d="M50 5C58 28 87 38 85 63C83 85 65 95 48 93C27 91 12 80 14 58C16 38 42 30 50 5Z" fill="${x.fill(0, 'r', 0, 0.32, 0.4)}"${x.rim()}/>` +
    x.shine('<ellipse cx="34" cy="62" rx="6" ry="13" transform="rotate(14 34 62)"/>', 0.6) }),
  ring: (x) => ({ body:
    `<g transform="rotate(-22 50 50)"><ellipse cx="50" cy="50" rx="42" ry="17" fill="none" stroke="${x.fill(-0.3, 'l', 0)}" stroke-width="13"/>` +
    `<path d="M8 50a42 17 0 0 0 84 0" fill="none" stroke="${x.fill(0.1, 'l', 0)}" stroke-width="13" stroke-linecap="butt"/>` +
    `<path d="M14 56a38 14 0 0 0 44 12" fill="none" stroke="#fff" stroke-opacity="${x.s.mat === 'matte' ? 0.12 : 0.45}" stroke-width="3" stroke-linecap="round"/></g>` }),
  starburst: (x) => ({ body:
    `<polygon points="${starPts(12, 47, 31).map((p) => p.map(f).join(',')).join(' ')}" fill="${x.fill(0, 'r', 0, 0.35, 0.3)}" stroke="${x.fill(0, 'r', 0, 0.35, 0.3)}" stroke-width="3" stroke-linejoin="round"${x.rim()}/>` +
    `<circle cx="50" cy="50" r="13" fill="${lighten(x.s.c, 0.5)}" opacity=".35"/>` }),
  spiral: (x) => {
    let d = ''; for (let i = 0; i <= 90; i++) { const t = i / 90, a = t * Math.PI * 5.2, r = 4 + t * 40; d += `${i ? 'L' : 'M'}${f(50 + Math.cos(a) * r)} ${f(50 + Math.sin(a) * r)}`; }
    return { body: `<path d="${d}" fill="none" stroke="${x.fill(0, 'l', 40)}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` };
  },
  flower: (x) => {
    let body = ''; for (let i = 0; i < 8; i++) body += `<ellipse cx="50" cy="26" rx="12" ry="24" transform="rotate(${i * 45} 50 50)" fill="${x.fill(i % 2 ? 0.1 : -0.06, 'r', 0, 0.5, 0.2)}"${x.rim()}/>`;
    return { body: body + `<circle cx="50" cy="50" r="12" fill="${x.s.c2}"/><circle cx="46" cy="46" r="4" fill="#fff" opacity=".5"/>` };
  },
  circle: (x) => ({ body: `<circle cx="50" cy="50" r="44" fill="${x.fill(0, 'l', 60)}"${x.rim()}/>` }),
  square: (x) => ({ body: `<rect x="8" y="8" width="84" height="84" rx="7" fill="${x.fill(0, 'l', 60)}"${x.rim()}/>` }),
  star: (x) => ({ body: `<polygon points="${starPts(5, 47, 20, 50, 52).map((p) => p.map(f).join(',')).join(' ')}" fill="${x.fill(0, 'l', 60)}" stroke="${x.fill(0, 'l', 60)}" stroke-width="5" stroke-linejoin="round"/>` }),
  line: (x) => ({ aspect: 3, body: `<path d="M12 52q18-34 36 0t36 0t36 0t36 0t36 0" fill="none" stroke="${x.fill(0, 'l', 0)}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` }),
  sticker: (x) => {
    const pts = Array.from({ length: 32 }, (_, i) => { const a = (i * Math.PI) / 16, r = i % 2 ? 40 : 46; return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r]; });
    return { body: `<polygon points="${pts.map((p) => p.map(f).join(',')).join(' ')}" fill="${x.fill(0, 'l', 60)}" stroke="${x.fill(0, 'l', 60)}" stroke-width="3" stroke-linejoin="round"/>` +
      `<circle cx="50" cy="50" r="30" fill="none" stroke="${readable(x.s.c)}" stroke-opacity=".7" stroke-width="2" stroke-dasharray="3 5"/>` +
      `<polygon points="${starPts(5, 17, 7, 50, 51).map((p) => p.map(f).join(',')).join(' ')}" fill="${readable(x.s.c)}"/>` };
  },
  number: (x) => ({ body: `<rect x="6" y="6" width="88" height="88" rx="18" fill="${x.fill(0, 'l', 60)}"${x.rim()}/>`, text: { value: x.s.text ?? '07', x: 50, y: 69, size: 56, weight: 700, fill: readable(x.s.c), fit: 66 } }),
  type: (x) => {
    const t = x.s.text ?? 'PLAY.'; const aspect = Math.max(1.1, t.length * 0.62 + 0.3);
    return { aspect, body: `<rect width="${f(aspect * 100)}" height="100" fill="#000" fill-opacity="0"/>`, text: { value: t, x: aspect * 50, y: 78, size: 88, weight: 700, fill: x.s.c, fit: aspect * 100 - 6 } };
  },
};

export const KIND_META: Record<Kind, { label: string; group: Group; mat: Mat; base: number }> = {
  cube: { label: 'Cube', group: 'geometric', mat: 'matte', base: 0.24 },
  rcube: { label: 'Rounded cube', group: 'geometric', mat: 'glass', base: 0.24 },
  sphere: { label: 'Sphere', group: 'geometric', mat: 'gloss', base: 0.26 },
  pyramid: { label: 'Pyramid', group: 'geometric', mat: 'gradient', base: 0.24 },
  torus: { label: 'Torus', group: 'geometric', mat: 'metallic', base: 0.26 },
  cylinder: { label: 'Cylinder', group: 'geometric', mat: 'matte', base: 0.22 },
  cone: { label: 'Cone', group: 'geometric', mat: 'gloss', base: 0.24 },
  ribbon: { label: 'Twisted ribbon', group: 'abstract', mat: 'gloss', base: 0.3 },
  blob: { label: 'Organic blob', group: 'abstract', mat: 'gradient', base: 0.26 },
  liquid: { label: 'Liquid shape', group: 'abstract', mat: 'gloss', base: 0.24 },
  ring: { label: 'Floating ring', group: 'abstract', mat: 'metallic', base: 0.28 },
  starburst: { label: 'Starburst', group: 'abstract', mat: 'matte', base: 0.24 },
  spiral: { label: 'Spiral', group: 'abstract', mat: 'matte', base: 0.22 },
  flower: { label: 'Abstract flower', group: 'abstract', mat: 'translucent', base: 0.26 },
  circle: { label: 'Circle', group: 'graphic', mat: 'matte', base: 0.18 },
  square: { label: 'Square', group: 'graphic', mat: 'matte', base: 0.16 },
  star: { label: 'Star', group: 'graphic', mat: 'matte', base: 0.16 },
  line: { label: 'Decorative line', group: 'graphic', mat: 'matte', base: 0.16 },
  sticker: { label: 'Sticker', group: 'graphic', mat: 'matte', base: 0.16 },
  number: { label: 'Number block', group: 'graphic', mat: 'matte', base: 0.16 },
  type: { label: 'Typography', group: 'type', mat: 'matte', base: 0.22 },
};
export const GROUPS: { id: Group; label: string; kinds: Kind[] }[] = [
  { id: 'geometric', label: 'Geometric', kinds: ['cube', 'sphere', 'pyramid', 'torus', 'rcube', 'cylinder', 'cone'] },
  { id: 'abstract', label: 'Abstract', kinds: ['ribbon', 'blob', 'liquid', 'ring', 'starburst', 'spiral', 'flower'] },
  { id: 'graphic', label: 'Graphic', kinds: ['circle', 'square', 'star', 'line', 'sticker', 'number'] },
  { id: 'type', label: 'Type', kinds: ['type'] },
];
export const TYPE_WORDS = ['PLAY.', 'CREATE.', 'EXPERIMENT.', 'CHAOS.', 'DESIGN.', '3D', '2026.'];

export function aspectOf(s: Style): number { return B[s.kind]({ id: 'a', s, defs: [], n: 0, fill: () => '#000', shine: () => '', rim: () => '' } as unknown as Ctx).aspect ?? 1; }

/** Draw an object. `id` must be unique per instance on the page (gradient ids). */
export function draw(id: string, s: Style): Drawing {
  const ctx = new Ctx(id, s);
  const out = B[s.kind](ctx);
  const translucent = s.mat === 'translucent' && s.kind !== 'type';
  return { defs: ctx.defs.join(''), body: out.body, aspect: out.aspect ?? 1, text: out.text, opacity: translucent ? 0.92 : 1 };
}

const esc = (t: string) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

/** Inner SVG markup (without the <svg> wrapper text for HTML rendering). `withText` draws text via SVG (screen); export draws text on canvas. */
export function svgMarkup(id: string, s: Style, withText = true): { svg: string; aspect: number; text?: TextSpec } {
  const d = draw(id, s);
  const t = withText && d.text ? `<text x="${d.text.x}" y="${d.text.y}" text-anchor="middle" font-family="'Bricolage Grotesque Variable','Bricolage Grotesque','Helvetica Neue',Arial,sans-serif" font-weight="${d.text.weight}" font-size="${d.text.size}" fill="${d.text.fill}" textLength="${f(Math.min(d.text.fit, esc(d.text.value).length * d.text.size * 0.7))}" lengthAdjust="spacingAndGlyphs">${esc(d.text.value)}</text>` : '';
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(d.aspect * 100)} 100" width="${f(d.aspect * 100)}" height="100" overflow="visible"><defs>${d.defs}</defs><g opacity="${d.opacity}">${d.body}</g>${t}</svg>`, aspect: d.aspect, text: d.text };
}
