import { hexToRgb, luma } from '../art/colour';
import { area, boxOf, overlap, xLines } from './measure';
import { FIX_PALETTES } from './palettes';
import { CANVAS_H, CATEGORIES } from './types';
import type { Category, Challenge, Doc, El, TextEl, Weights } from './types';

/**
 * "Check my design" — a fun, transparent, deterministic score. NOT a professional evaluation, and not AI:
 * every number comes from measurable properties of the composition (positions, sizes, colours).
 * Five categories, each 0–100, combined with the challenge's published weights.
 */
export type CatResult = { score: number; note: string };
export type Result = { total: number; cats: Record<Category, CatResult>; weights: Weights };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pct = (v: number) => Math.round(clamp(v) * 100);
const TOL = 0.01, MARGINS = [0.08, 0.5, 0.92];
const texts = (d: Doc) => d.els.filter((e): e is TextEl => e.kind === 'text');
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const dist = (a: string, b: string) => { const A = hexToRgb(a), B = hexToRgb(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
const contrast = (a: string, b: string) => { const l1 = luma(a), l2 = luma(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

/** 1 — Alignment: how many elements sit on a shared line or on the margin / centre guides; tilted elements lose credit. */
function alignment(d: Doc): CatResult {
  const els = d.els; if (!els.length) return { score: 0, note: 'Nothing to align.' };
  let credit = 0, aligned = 0;
  for (const e of els) {
    let best = 0;
    for (const l of xLines(e)) {
      if (MARGINS.some((m) => Math.abs(m - l) < TOL)) { best = 1; break; }
      const mates = els.filter((o) => o !== e && xLines(o).some((q) => Math.abs(q - l) < TOL)).length;
      best = Math.max(best, mates >= 2 ? 1 : mates === 1 ? 0.6 : 0);
    }
    if (Math.abs(e.rot) > 3) best *= e.kind === 'text' ? 0.45 : 0.8;
    if (e.role === 'deco') best *= 0.5;                                   // clutter earns little credit
    credit += best; if (best >= 0.99) aligned++;
  }
  const s = credit / els.length;
  return { score: pct(s), note: `${aligned} of ${els.length} elements sit on a shared line or margin${els.some((e) => e.kind === 'text' && Math.abs(e.rot) > 3) ? '; tilted text loses points' : ''}.` };
}

/** 2 — Spacing: even gaps between stacked text blocks, no collisions, comfortable edge margins. */
function spacing(d: Doc): CatResult {
  const ts = texts(d).map((t) => ({ t, b: boxOf(t) })).sort((a, b) => a.b.y0 - b.b.y0);
  const gaps: number[] = []; for (let i = 1; i < ts.length; i++) gaps.push(ts[i].b.y0 - ts[i - 1].b.y1);
  let gapScore = 1, cv = 0;
  if (gaps.length >= 2) { const m = gaps.reduce((a, b) => a + b, 0) / gaps.length, sd = Math.sqrt(gaps.reduce((a, g) => a + (g - m) ** 2, 0) / gaps.length); cv = sd / Math.max(0.02, Math.abs(m)); gapScore = 1 - clamp((cv - 0.35) / 0.85); if (gaps.some((g) => g < 0)) gapScore *= 0.6; }
  const bs = d.els.map((e) => ({ e, b: boxOf(e) })); let collide = 0, pairs = 0;
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
    if (bs[i].e.kind !== 'text' && bs[j].e.kind !== 'text') continue;               // art overlapping art is allowed
    pairs++; const o = overlap(bs[i].b, bs[j].b), m = Math.min(area(bs[i].b), area(bs[j].b)) || 1;
    if (o / m > 0.12) collide++;
  }
  const collideScore = 1 - clamp(collide / Math.max(2, pairs * 0.25));
  const out = bs.filter(({ b }) => b.x0 < 0.04 || b.x1 > 0.96 || b.y0 < 0.03 || b.y1 > CANVAS_H - 0.03).length;
  const marginScore = 1 - clamp(out / Math.max(1, bs.length) * 2);
  const clutter = d.els.filter((e) => e.role === 'deco').length, clutterScore = 1 - clamp(clutter * 0.07, 0, 0.45);
  const s = (0.45 * gapScore + 0.35 * collideScore + 0.2 * marginScore) * clutterScore;
  return { score: pct(s), note: `${gaps.length >= 2 ? `Gaps between text blocks vary by ${Math.round(cv * 100)}%` : 'Few text blocks to compare'}; ${collide} overlapping pair${collide === 1 ? '' : 's'}; ${out} element${out === 1 ? '' : 's'} too close to the edge${clutter ? `; ${clutter} decoration${clutter === 1 ? '' : 's'} adding clutter` : ''}.` };
}

/** 3 — Hierarchy: the headline should be clearly the biggest, with distinct size tiers and few font families. */
function hierarchy(d: Doc): CatResult {
  const ts = texts(d); if (ts.length < 2) return { score: 0, note: 'Needs at least a headline and supporting text.' };
  const head = ts.filter((t) => t.role === 'headline').sort((a, b) => b.size - a.size)[0] ?? [...ts].sort((a, b) => b.size - a.size)[0];
  const rest = ts.filter((t) => t !== head), body = median(rest.map((t) => t.size)) || 0.001;
  const ratio = head.size / body, ratioScore = clamp((ratio - 1.2) / 1.8);
  const tiers: number[] = []; for (const s of [...ts.map((t) => t.size)].sort((a, b) => b - a)) if (!tiers.length || tiers[tiers.length - 1] / s > 1.25) tiers.push(s);
  const tierScore = tiers.length >= 3 ? 1 : tiers.length === 2 ? 0.7 : 0.2;
  const fams = new Set(ts.map((t) => (t.font === 'display' || t.font === 'displayLight' ? 'd' : t.font === 'serif' ? 's' : t.font === 'mono' ? 'm' : 'b'))).size;
  const famScore = fams <= 2 ? 1 : fams === 3 ? 0.55 : 0.2;
  const biggest = ts.every((t) => t === head || t.size <= head.size * 1.05) ? 1 : 0.5;
  const s = (0.5 * ratioScore + 0.3 * tierScore + 0.2 * famScore) * biggest;
  return { score: pct(s), note: `Headline is ${ratio.toFixed(1)}× the body text, ${tiers.length} size level${tiers.length === 1 ? '' : 's'}, ${fams} font ${fams === 1 ? 'family' : 'families'}${biggest < 1 ? ' — something is bigger than the headline' : ''}.` };
}

/** 4 — Colour: text must be readable on its background, and the whole design should stick to one palette. */
function colour(d: Doc): CatResult {
  const ts = texts(d); let read = 1;
  if (ts.length) read = ts.reduce((a, t) => { const against = t.pill ?? d.bg, need = t.size >= 0.06 ? 3 : 4.5; return a + clamp(contrast(t.color, against) / need); }, 0) / ts.length;
  const used: string[] = [d.bg]; const push = (c: string) => { if (!used.some((u) => dist(u, c) < 24)) used.push(c); };
  for (const e of d.els) { if (e.kind === 'text') { push(e.color); if (e.pill) push(e.pill); } else if (e.kind === 'shape') push(e.color); else { push(e.c); } }
  let best = 0; for (const p of FIX_PALETTES) { const set = [p.bg, p.ink, ...p.colours]; best = Math.max(best, used.filter((u) => set.some((c) => dist(u, c) < 46)).length / used.length); }
  const countScore = used.length <= 6 ? 1 : 1 - clamp((used.length - 6) / 4);
  const s = 0.45 * read + 0.4 * best + 0.15 * countScore;
  return { score: pct(s), note: `${Math.round(read * 100)}% of text is easy to read; ${Math.round(best * 100)}% of your ${used.length} colours belong to one palette.` };
}

/** 5 — Balance: visual weight centred, healthy amount of ink vs. space, no empty quadrants. */
function balance(d: Doc): CatResult {
  if (!d.els.length) return { score: 0, note: 'Empty canvas.' };
  let W = 0, cx = 0, cy = 0, total = 0; const q = [0, 0, 0, 0];
  for (const e of d.els) {
    const b = boxOf(e), a = area(b) * (e.kind === 'art' ? 1.4 : e.kind === 'text' ? 1 : 0.8) * (e.role === 'deco' ? 0.8 : 1); W += a; total += area(b);
    const mx = (b.x0 + b.x1) / 2, my = (b.y0 + b.y1) / 2; cx += mx * a; cy += my * a; q[(mx > 0.5 ? 1 : 0) + (my > CANVAS_H / 2 ? 2 : 0)] += a;
  }
  cx /= W; cy /= W; const off = Math.hypot(cx - 0.5, (cy - CANVAS_H / 2) / CANVAS_H), s1 = 1 - clamp(off / 0.22);
  const cov = total / CANVAS_H, s2 = cov < 0.12 ? clamp(cov / 0.12) : cov <= 0.62 ? 1 : 1 - clamp((cov - 0.62) / 0.3);
  const empty = q.filter((v) => v / W < 0.05).length, s3 = 1 - empty * 0.3;
  return { score: pct(0.5 * s1 + 0.3 * s2 + 0.2 * clamp(s3)), note: `Weight is ${Math.round(off * 100)}% off-centre; ${Math.round(cov * 100)}% of the canvas is covered; ${empty} empty quadrant${empty === 1 ? '' : 's'}.` };
}

export function scoreDesign(d: Doc, ch: Pick<Challenge, 'weights'>): Result {
  const cats = { alignment: alignment(d), spacing: spacing(d), hierarchy: hierarchy(d), colour: colour(d), balance: balance(d) } as Record<Category, CatResult>;
  const wsum = CATEGORIES.reduce((a, c) => a + ch.weights[c], 0);
  const total = Math.round(CATEGORIES.reduce((a, c) => a + cats[c].score * ch.weights[c], 0) / wsum);
  return { total, cats, weights: ch.weights };
}

/** A playful nudge about the weakest category. */
const TIPS: Record<Category, string> = {
  alignment: 'Things are drifting — line your text up on the same edge.',
  spacing: 'Give your elements room to breathe, and keep the gaps even.',
  hierarchy: 'Your headline is shy. Make the most important thing the biggest thing.',
  colour: 'The colours are fighting. Pick one palette and let it lead.',
  balance: 'The weight feels lopsided — nudge things towards the centre.',
};
export function nextTip(r: Result): string {
  const worst = [...CATEGORIES].sort((a, b) => r.cats[a].score - r.cats[b].score)[0];
  return r.cats[worst].score >= 90 ? 'That is looking sharp. Ready to check it?' : TIPS[worst];
}
export const feedback = (t: number) => (t >= 90 ? 'Spot on. That is portfolio-worthy.' : t >= 75 ? "Not bad. You've got an eye for design." : t >= 55 ? 'Getting there. The bones are good.' : t >= 35 ? 'A brave attempt. A few more tweaks?' : 'That is… still quite chaotic. One more go?');
export const stars = (t: number) => (t >= 85 ? 3 : t >= 65 ? 2 : t >= 40 ? 1 : 0);
export type { El };
