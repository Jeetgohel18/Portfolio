import { luma } from '../art/colour';
import { boxOf, lineHeight } from './measure';
import { CANVAS_H } from './types';
import type { Align, Doc, El, FixPalette } from './types';

/** Pure document edits used by the game UI. */
export const MARGIN = { left: 0.08, center: 0.5, right: 0.92 };
export const patchEl = (d: Doc, id: string, p: Partial<El>): Doc => ({ ...d, els: d.els.map((e) => (e.id === id ? ({ ...e, ...p } as El) : e)) });
export const removeEl = (d: Doc, id: string): Doc => ({ ...d, els: d.els.filter((e) => e.id !== id) });
const contrast = (a: string, b: string) => { const l1 = luma(a), l2 = luma(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
const readableOn = (bg: string, ink: string) => (contrast('#fffaf1', bg) > contrast(ink, bg) ? '#fffaf1' : ink);

/** Apply a curated palette: background, text roles, and every artwork colour (distinct colours map to palette colours in order). */
export function applyPalette(d: Doc, p: FixPalette): Doc {
  const pool = p.colours.filter((c) => contrast(c, p.bg) > 1.35); const use = pool.length ? pool : p.colours;
  const map = new Map<string, string>(); let i = 0; const pick = (c: string) => { const k = c.toLowerCase(); if (!map.has(k)) map.set(k, use[i++ % use.length]); return map.get(k)!; };
  const accent = p.colours.find((c) => contrast(c, p.bg) >= 3) ?? p.ink;
  return {
    bg: p.bg,
    els: d.els.map((e) => {
      if (e.kind === 'text') {
        if (e.pill) { const pill = use[0]; return { ...e, pill, color: readableOn(pill, p.ink) }; }
        return { ...e, color: e.role === 'headline' ? p.ink : e.role === 'sub' ? accent : p.ink };
      }
      if (e.kind === 'shape') return { ...e, color: pick(e.color) };
      const c = pick(e.c); return { ...e, c, c2: use[(use.indexOf(c) + 1) % use.length] };
    }),
  };
}

/** Distribute the vertical gaps between text blocks evenly (first and last blocks stay where they are). */
export function evenSpacing(d: Doc): Doc {
  const ts = d.els.filter((e) => e.kind === 'text').map((e) => ({ e, b: boxOf(e) })).sort((a, b) => a.b.y0 - b.b.y0);
  if (ts.length < 3) return d;
  const hs = ts.map((t) => t.b.y1 - t.b.y0), top = ts[0].b.y0, bottom = ts[ts.length - 1].b.y1;
  const gap = (bottom - top - hs.reduce((a, b) => a + b, 0)) / (ts.length - 1);
  const ys = new Map<string, number>(); let cursor = top;
  ts.forEach((t, i) => { ys.set(t.e.id, t.e.y + (cursor - t.b.y0)); cursor += hs[i] + gap; });
  return { ...d, els: d.els.map((e) => (ys.has(e.id) ? ({ ...e, y: ys.get(e.id)! } as El) : e)) };
}

/** Snap an element to the left margin, the centre line or the right margin (text also takes that alignment). */
export function alignTo(d: Doc, id: string, side: Align): Doc {
  const e = d.els.find((q) => q.id === id); if (!e) return d;
  const m = MARGIN[side === 'left' ? 'left' : side === 'right' ? 'right' : 'center'];
  if (e.kind === 'text') return patchEl(d, id, { align: side, x: m });
  const b = boxOf(e), w = b.x1 - b.x0;
  return patchEl(d, id, { x: side === 'left' ? m + w / 2 : side === 'right' ? m - w / 2 : m });
}

export const nudgeSize = (e: El, f: number): Partial<El> =>
  e.kind === 'text' ? { size: Math.min(0.32, Math.max(0.015, +(e.size * f).toFixed(4))) } : e.kind === 'shape' ? { w: Math.max(0.02, e.w * f), h: Math.max(0.02, e.h * f) } : { s: Math.min(0.9, Math.max(0.03, e.s * f)) };
export const clampPos = (x: number, y: number) => ({ x: Math.min(1, Math.max(0, x)), y: Math.min(CANVAS_H, Math.max(0, y)) });
export const lh = lineHeight;
