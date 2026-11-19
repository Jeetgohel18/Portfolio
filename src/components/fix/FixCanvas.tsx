import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as RKE, PointerEvent as RPE, ReactNode } from 'react';
import { boxOf, xLines } from '../../lib/fix/measure';
import { alignTo, MARGIN, nudgeSize, patchEl, removeEl } from '../../lib/fix/ops';
import { CANVAS_H, PICKABLE_FONTS } from '../../lib/fix/types';
import type { Align, Doc, El, FixPalette, Tools } from '../../lib/fix/types';
import { FixSheet } from './FixSheet';
import { FixToolbar } from './FixToolbar';

type Props = {
  doc: Doc; tools: Tools; palette: FixPalette; guides: boolean; selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Called with the new document whenever an edit is finished (one undo step). */
  onCommit: (d: Doc) => void;
  children?: ReactNode;
};
type Drag = { mode: 'move' | 'size'; id: string; pid: number; sx: number; sy: number; el0: El; cx: number; cy: number; d0: number; moved: boolean };

const SNAP = 0.014;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function FixCanvas({ doc, tools, palette, guides, selectedId, onSelect, onCommit, children }: Props) {
  const sheet = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<Doc | null>(null);
  const [snap, setSnap] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const drag = useRef<Drag | null>(null);
  const live = draft ?? doc;
  const liveRef = useRef(live); liveRef.current = live;
  useEffect(() => { setDraft(null); }, [doc]);

  const sel = live.els.find((e) => e.id === selectedId) ?? null;

  const onDown = (e: RPE<HTMLDivElement>) => {
    if (e.button > 0 || !sheet.current) return;
    const t = e.target as Element, handle = t.closest<HTMLElement>('[data-h]'), node = t.closest<HTMLElement>('[data-el]');
    if (!node) { if (!t.closest('.fg-toolbar')) onSelect(null); return; }
    const id = node.dataset.id!, el = liveRef.current.els.find((q) => q.id === id); if (!el) return;
    onSelect(id);
    const r = sheet.current.getBoundingClientRect(), nr = node.getBoundingClientRect();
    const cx = nr.left + nr.width / 2, cy = nr.top + nr.height / 2;
    const mode = handle ? 'size' : 'move';
    if ((mode === 'move' && !tools.move) || (mode === 'size' && !tools.resize)) return;
    sheet.current.setPointerCapture(e.pointerId);
    drag.current = { mode, id, pid: e.pointerId, sx: e.clientX - r.left, sy: e.clientY - r.top, el0: el, cx, cy, d0: Math.max(10, Math.hypot(e.clientX - cx, e.clientY - cy)), moved: false };
  };

  const onMove = (e: RPE<HTMLDivElement>) => {
    const d = drag.current; if (!d || d.pid !== e.pointerId || !sheet.current) return;
    const r = sheet.current.getBoundingClientRect(), w = r.width, px = e.clientX - r.left, py = e.clientY - r.top;
    if (!d.moved) { if (Math.hypot(px - d.sx, py - d.sy) < 4) return; d.moved = true; }
    const base = doc;
    if (d.mode === 'size') {
      const f = Math.hypot(e.clientX - d.cx, e.clientY - d.cy) / d.d0, e0 = d.el0;
      const next = e0.kind === 'text' ? { size: clamp(e0.size * f, 0.015, 0.32) } : e0.kind === 'shape' ? { w: Math.max(0.02, e0.w * f), h: Math.max(0.02, e0.h * f) } : { s: clamp(e0.s * f, 0.03, 0.9) };
      setDraft(patchEl(base, d.id, next)); return;
    }
    let x = clamp(d.el0.x + (px - d.sx) / w, 0, 1), y = clamp(d.el0.y + (py - d.sy) / w, 0, CANVAS_H);
    const probe = { ...d.el0, x, y } as El, others = base.els.filter((q) => q.id !== d.id);
    // magnetic snapping to margins / centre and to other elements' edges
    let gx: number | null = null, gy: number | null = null;
    const tx = [MARGIN.left, MARGIN.center, MARGIN.right, ...others.flatMap(xLines)];
    let best = SNAP; for (const l of xLines(probe)) for (const t of tx) { const df = t - l; if (Math.abs(df) < best) { best = Math.abs(df); x += df; gx = t; } }
    const pb = boxOf({ ...probe, x } as El), ty = [CANVAS_H / 2, 0.06, CANVAS_H - 0.06, ...others.flatMap((o) => { const b = boxOf(o); return [b.y0, (b.y0 + b.y1) / 2, b.y1]; })];
    best = SNAP; for (const l of [pb.y0, (pb.y0 + pb.y1) / 2, pb.y1]) for (const t of ty) { const df = t - l; if (Math.abs(df) < best) { best = Math.abs(df); y += df; gy = t; } }
    setSnap({ x: gx, y: gy });
    setDraft(patchEl(base, d.id, { x: +x.toFixed(4), y: +y.toFixed(4) }));
  };

  const finish = (e: RPE<HTMLDivElement>, cancel: boolean) => {
    const d = drag.current; if (!d || d.pid !== e.pointerId) return;
    drag.current = null; setSnap({ x: null, y: null });
    if (cancel || !d.moved) { setDraft(null); return; }
    if (liveRef.current !== doc) onCommit(liveRef.current);
  };

  const edit = (p: Partial<El>) => { if (sel) onCommit(patchEl(doc, sel.id, p)); };
  const onKey = (e: RKE<HTMLDivElement>) => {
    const node = (e.target as Element).closest<HTMLElement>('[data-el]'); if (!node || (e.target as Element).closest('.fg-toolbar')) return;
    const id = node.dataset.id!, el = doc.els.find((q) => q.id === id); if (!el) return;
    const st = e.shiftKey ? 0.04 : 0.01; let ok = true;
    switch (e.key) {
      case 'Enter': case ' ': onSelect(selectedId === id ? null : id); break;
      case 'ArrowLeft': if (tools.move) onCommit(patchEl(doc, id, { x: el.x - st })); break;
      case 'ArrowRight': if (tools.move) onCommit(patchEl(doc, id, { x: el.x + st })); break;
      case 'ArrowUp': if (tools.move) onCommit(patchEl(doc, id, { y: el.y - st })); break;
      case 'ArrowDown': if (tools.move) onCommit(patchEl(doc, id, { y: el.y + st })); break;
      case '+': case '=': if (tools.resize) onCommit(patchEl(doc, id, nudgeSize(el, 1.12))); break;
      case '-': case '_': if (tools.resize) onCommit(patchEl(doc, id, nudgeSize(el, 0.9))); break;
      case 'Delete': case 'Backspace': if (tools.remove && el.role === 'deco') { onCommit(removeEl(doc, id)); onSelect(null); } break;
      case 'Escape': onSelect(null); break;
      default: ok = false;
    }
    if (ok) e.preventDefault();
  };

  // toolbar position (from the model box, as a fraction of the sheet)
  let tb: CSSProperties | null = null;
  if (sel && !drag.current) {
    const b = boxOf(sel), left = clamp(((b.x0 + b.x1) / 2) * 100, 30, 70), above = b.y0 > 0.2;
    tb = { left: `${left}%`, top: above ? `calc(var(--cw) * ${(b.y0 - 0.03).toFixed(3)})` : `calc(var(--cw) * ${(b.y1 + 0.04).toFixed(3)})`, transform: `translate(-50%, ${above ? '-100%' : '0'})` };
  }
  const font = () => { if (sel?.kind === 'text') { const i = PICKABLE_FONTS.indexOf(sel.font); edit({ font: PICKABLE_FONTS[(i + 1) % PICKABLE_FONTS.length] }); } };
  const colourOf = (hex: string) => { if (!sel) return; edit(sel.kind === 'text' ? { color: hex } : sel.kind === 'shape' ? { color: hex } : { c: hex }); };
  const showGuides = guides || snap.x !== null || snap.y !== null;

  return (
    <FixSheet doc={live} selectedId={selectedId} sheetRef={(el) => { sheet.current = el; }} className={`fg-canvas ${drag.current?.moved ? 'is-dragging' : ''}`}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={(e) => finish(e, false)} onPointerCancel={(e) => finish(e, true)} onKeyDown={onKey}
      role="application" aria-label="Design canvas. Drag elements, or select one and use the toolbar. Arrow keys move, plus and minus resize.">
      {showGuides && (<>
        {guides && [MARGIN.left, MARGIN.center, MARGIN.right].map((m) => <i key={m} className="fg-guide v soft" style={{ left: `calc(var(--cw) * ${m})` }} aria-hidden="true" />)}
        {snap.x !== null && <i className="fg-guide v hot" style={{ left: `calc(var(--cw) * ${snap.x})` }} aria-hidden="true" />}
        {snap.y !== null && <i className="fg-guide h hot" style={{ top: `calc(var(--cw) * ${snap.y})` }} aria-hidden="true" />}
      </>)}
      {sel && tb && (
        <FixToolbar el={sel} tools={tools} palette={palette} style={tb}
          onSize={(f) => edit(nudgeSize(sel, f))} onRotate={(deg) => edit({ rot: Math.round(sel.rot + deg) })} onColour={colourOf} onFont={font}
          onAlign={(a: Align) => { if (sel) onCommit(alignTo(doc, sel.id, a)); }} onRemove={() => { onCommit(removeEl(doc, sel.id)); onSelect(null); }} />
      )}
      {children}
    </FixSheet>
  );
}
