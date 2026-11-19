import { aspectOf } from '../art/shapes';
import type { El, FontStyle, TextEl } from './types';

/** Model-based bounding boxes (canvas units) so scoring and snapping are deterministic and need no DOM. */
export type Box = { x0: number; y0: number; x1: number; y1: number };
const CHAR: Record<FontStyle, number> = { display: 0.47, displayLight: 0.5, body: 0.52, bodyItalic: 0.5, caps: 0.66, serif: 0.52, mono: 0.6 };
export const lineHeight = (e: TextEl) => e.lh ?? (e.font === 'display' || e.font === 'displayLight' ? 0.95 : 1.2);
export const lines = (e: TextEl) => e.text.split('\n');
export const displayText = (e: TextEl) => (e.font === 'caps' ? e.text.toUpperCase() : e.text);

export function textBox(e: TextEl): Box {
  const ls = lines(e).map((l) => (e.font === 'caps' ? l.toUpperCase() : l));
  const upper = ls.every((l) => l === l.toUpperCase());
  const w = Math.max(...ls.map((l) => l.length)) * e.size * (CHAR[e.font] + (upper && e.font !== 'caps' ? 0.08 : 0));
  const h = ls.length * e.size * lineHeight(e);
  const pad = e.pill ? e.size * 0.5 : 0;
  const x0 = e.align === 'left' ? e.x : e.align === 'center' ? e.x - w / 2 : e.x - w;
  return { x0: x0 - pad, y0: e.y - pad * 0.45, x1: x0 + w + pad, y1: e.y + h + pad * 0.45 };
}

export function boxOf(e: El): Box {
  if (e.kind === 'text') return textBox(e);
  if (e.kind === 'shape') return { x0: e.x - e.w / 2, y0: e.y - e.h / 2, x1: e.x + e.w / 2, y1: e.y + e.h / 2 };
  const a = aspectOf({ kind: e.art, c: e.c, c2: e.c2, mat: e.mat });
  return { x0: e.x - (e.s * a) / 2, y0: e.y - e.s / 2, x1: e.x + (e.s * a) / 2, y1: e.y + e.s / 2 };
}

/** The x-lines an element can align to (text: its anchor; others: left / centre / right). */
export function xLines(e: El): number[] {
  if (e.kind === 'text') return [e.x];
  const b = boxOf(e); return [b.x0, (b.x0 + b.x1) / 2, b.x1];
}
export const area = (b: Box) => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
export function overlap(a: Box, b: Box) { return area({ x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) }); }
