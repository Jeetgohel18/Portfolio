import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as RKE, PointerEvent as RPE, ReactNode, Ref } from 'react';
import type { Obj, Doc } from '../../lib/art/compose';
import { PlaygroundObject } from './PlaygroundObject';
import { ObjectToolbar } from './ObjectToolbar';

export type CanvasHandle = { rect: () => DOMRect | null; burst: (x: number, y: number, colour: string) => void; size: () => { w: number; h: number } };

type Props = {
  doc: Doc; selectedId: string | null; reduced: boolean; intro: boolean; colours: string[]; backdrop: ReactNode; children?: ReactNode;
  onSelect: (id: string | null) => void;
  /** Commit a change to one object (becomes one undo step). */
  onPatch: (id: string, patch: Partial<Obj>) => void;
  onDuplicate: (id: string) => void; onRemove: (id: string) => void; onReorder: (id: string, to: 'front' | 'back') => void; onMaterial: (id: string) => void;
  ref?: Ref<CanvasHandle>;
};
type Spark = { key: number; x: number; y: number; dx: number; dy: number; c: string; w: number };
type Drag = { mode: 'move' | 'rot' | 'size'; id: string; pid: number; el: HTMLElement; ox: number; oy: number; cx: number; cy: number; s0: number; d0: number; a0: number; rot0: number; sx: number; sy: number; moved: boolean; x: number; y: number; s: number; rot: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const SNAP = 9;

export function PlaygroundCanvas({ doc, selectedId, reduced, intro, colours, backdrop, children, onSelect, onPatch, onDuplicate, onRemove, onReorder, onMaterial, ref }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const gv = useRef<HTMLElement>(null), gh = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const drag = useRef<Drag | null>(null);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);
  const live = useRef({ doc, reduced }); live.current = { doc, reduced };

  useEffect(() => {
    const el = stage.current; if (!el) return;
    const measure = () => { const r = el.getBoundingClientRect(); el.style.setProperty('--u', `${Math.min(r.width, r.height)}px`); setSize((p) => (p.w === r.width && p.h === r.height ? p : { w: r.width, h: r.height })); };
    measure(); const ro = new ResizeObserver(measure); ro.observe(el);
    return () => { ro.disconnect(); timers.current.forEach(clearTimeout); };
  }, []);

  const burst = useCallback((x: number, y: number, colour: string) => {
    if (live.current.reduced) return;
    const k = ++seq.current, el = stage.current; if (!el) return;
    const r = el.getBoundingClientRect(), cols = [colour, '#ffd75e', '#ffffff'];
    setSparks((s) => [...s, ...Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + k, d = 34 + (i % 3) * 16; return { key: k * 100 + i, x: x * r.width, y: y * r.height, dx: Math.cos(a) * d, dy: Math.sin(a) * d, c: cols[i % 3], w: 5 + (i % 3) * 2 }; })]);
    timers.current.push(window.setTimeout(() => setSparks((s) => s.filter((p) => Math.floor(p.key / 100) !== k)), 800));
  }, []);

  useImperativeHandle(ref, () => ({ rect: () => stage.current?.getBoundingClientRect() ?? null, burst, size: () => ({ w: size.w, h: size.h }) }), [burst, size]);

  /* ----------------------------- pointer handling ----------------------------- */
  const local = (e: { clientX: number; clientY: number }) => { const r = stage.current!.getBoundingClientRect(); return { px: e.clientX - r.left, py: e.clientY - r.top, w: r.width, h: r.height }; };

  const onPointerDown = (e: RPE<HTMLDivElement>) => {
    if (e.button > 0 || !stage.current) return;
    const t = e.target as Element;
    const handle = t.closest<HTMLElement>('[data-h]'), objEl = t.closest<HTMLElement>('[data-obj]');
    if (!objEl) { if (!t.closest('.pg-toolbar,.pg-challenge,.pg-studio')) onSelect(null); return; }
    const id = objEl.dataset.id!, o = live.current.doc.objs.find((q) => q.id === id); if (!o) return;
    const { px, py, w, h } = local(e), u = Math.min(w, h), cx = o.x * w, cy = o.y * h;
    onSelect(id);
    stage.current.setPointerCapture(e.pointerId);
    const mode = handle?.dataset.h === 'rot' ? 'rot' : handle?.dataset.h === 'size' ? 'size' : 'move';
    drag.current = { mode, id, pid: e.pointerId, el: objEl, ox: cx - px, oy: cy - py, cx, cy, s0: o.s, d0: Math.max(8, Math.hypot(px - cx, py - cy)), a0: Math.atan2(py - cy, px - cx), rot0: o.rot, sx: px, sy: py, moved: false, x: o.x, y: o.y, s: o.s, rot: o.rot };
    void u;
  };

  const showGuides = (gx: number | null, gy: number | null) => {
    if (gv.current) { gv.current.style.opacity = gx === null ? '0' : '1'; if (gx !== null) gv.current.style.left = `${gx}px`; }
    if (gh.current) { gh.current.style.opacity = gy === null ? '0' : '1'; if (gy !== null) gh.current.style.top = `${gy}px`; }
  };

  const onPointerMove = (e: RPE<HTMLDivElement>) => {
    const d = drag.current; if (!d || d.pid !== e.pointerId) return;
    const { px, py, w, h } = local(e), u = Math.min(w, h);
    if (!d.moved) { if (Math.hypot(px - d.sx, py - d.sy) < 4) return; d.moved = true; setDragging(true); }
    if (d.mode === 'move') {
      let x = clamp(px + d.ox, w * 0.02, w * 0.98), y = clamp(py + d.oy, h * 0.02, h * 0.98);
      // magnetic snapping to the centre lines and to other objects' centres
      let gx: number | null = null, gy: number | null = null;
      const targetsX = [w / 2, ...live.current.doc.objs.filter((q) => q.id !== d.id).map((q) => q.x * w)], targetsY = [h / 2, ...live.current.doc.objs.filter((q) => q.id !== d.id).map((q) => q.y * h)];
      for (const tx of targetsX) if (Math.abs(tx - x) < SNAP) { x = tx; gx = tx; break; }
      for (const ty of targetsY) if (Math.abs(ty - y) < SNAP) { y = ty; gy = ty; break; }
      showGuides(gx, gy);
      d.x = x / w; d.y = y / h; d.el.style.left = `${d.x * 100}%`; d.el.style.top = `${d.y * 100}%`;
      // neighbours give way a little where objects overlap
      const me = live.current.doc.objs.find((q) => q.id === d.id)!;
      for (const q of live.current.doc.objs) {
        if (q.id === d.id) continue;
        const nudge = stage.current!.querySelector<HTMLElement>(`[data-id="${q.id}"] .po-nudge`); if (!nudge) continue;
        const dx = q.x * w - x, dy = q.y * h - y, dist = Math.hypot(dx, dy) || 1, reach = ((me.s + q.s) * u) * 0.42;
        if (!live.current.reduced && dist < reach) { const push = Math.min(12, (reach - dist) * 0.25); nudge.style.setProperty('--nx', `${(dx / dist) * push}px`); nudge.style.setProperty('--ny', `${(dy / dist) * push}px`); }
        else { nudge.style.removeProperty('--nx'); nudge.style.removeProperty('--ny'); }
      }
    } else if (d.mode === 'rot') {
      let rot = d.rot0 + ((Math.atan2(py - d.cy, px - d.cx) - d.a0) * 180) / Math.PI;
      rot = ((rot % 360) + 540) % 360 - 180;
      for (const snap of [0, 45, 90, 135, -45, -90, -135, 180, -180]) if (Math.abs(rot - snap) < 4) rot = snap;
      d.rot = Math.round(rot); d.el.style.setProperty('--rot', `${d.rot}deg`);
    } else {
      d.s = clamp((d.s0 * Math.hypot(px - d.cx, py - d.cy)) / d.d0, 0.04, 0.9); d.el.style.setProperty('--s', String(d.s));
    }
  };

  const end = (e: RPE<HTMLDivElement>, cancel: boolean) => {
    const d = drag.current; if (!d || d.pid !== e.pointerId) return;
    drag.current = null; setDragging(false); showGuides(null, null);
    stage.current?.querySelectorAll<HTMLElement>('.po-nudge').forEach((n) => { n.style.removeProperty('--nx'); n.style.removeProperty('--ny'); });
    if (cancel || !d.moved) return;
    if (d.mode === 'move') {
      onPatch(d.id, { x: d.x, y: d.y });
      d.el.classList.remove('is-drop'); void d.el.offsetWidth; d.el.classList.add('is-drop');
      const o = live.current.doc.objs.find((q) => q.id === d.id); burst(d.x, d.y, o?.c ?? '#ffd75e');
    } else if (d.mode === 'rot') onPatch(d.id, { rot: d.rot });
    else onPatch(d.id, { s: d.s });
  };

  const onKeyDown = (e: RKE<HTMLDivElement>) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-obj]'); if (!el || (e.target as Element).closest('.pg-toolbar')) return;
    const id = el.dataset.id!, o = doc.objs.find((q) => q.id === id); if (!o) return;
    const step = e.shiftKey ? 0.04 : 0.01; let handled = true;
    switch (e.key) {
      case 'Enter': case ' ': onSelect(selectedId === id ? null : id); break;
      case 'ArrowLeft': onPatch(id, { x: clamp(o.x - step, 0.02, 0.98) }); break;
      case 'ArrowRight': onPatch(id, { x: clamp(o.x + step, 0.02, 0.98) }); break;
      case 'ArrowUp': onPatch(id, { y: clamp(o.y - step, 0.02, 0.98) }); break;
      case 'ArrowDown': onPatch(id, { y: clamp(o.y + step, 0.02, 0.98) }); break;
      case '[': onPatch(id, { rot: o.rot - 15 }); break;
      case ']': onPatch(id, { rot: o.rot + 15 }); break;
      case '-': case '_': onPatch(id, { s: clamp(o.s * 0.9, 0.04, 0.9) }); break;
      case '+': case '=': onPatch(id, { s: clamp(o.s * 1.12, 0.04, 0.9) }); break;
      case 'Delete': case 'Backspace': onRemove(id); break;
      case 'd': case 'D': onDuplicate(id); break;
      case 'Escape': onSelect(null); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  };

  /* ------------------------------- contextual bar ------------------------------- */
  const sel = doc.objs.find((o) => o.id === selectedId);
  let tbStyle: CSSProperties | null = null;
  if (sel && size.w && !dragging) {
    const u = Math.min(size.w, size.h), half = (sel.s * u * (sel.kind === 'type' ? 1.2 : 1)) / 2;
    const bw = Math.min(size.w - 16, size.w < 560 ? 372 : 430), left = clamp(sel.x * size.w, bw / 2 + 8, size.w - bw / 2 - 8);
    const th = size.w < 560 ? 100 : 54;                                   // toolbar height (two rows on phones)
    const above = sel.y * size.h - half - th - 52 > 6;                     // clear the rotate handle above the object
    tbStyle = { left, top: above ? sel.y * size.h - half - th - 52 : Math.min(size.h - th - 8, sel.y * size.h + half + 38), width: bw };
  }

  const bg = doc.bg;
  return (
    <div ref={stage} className={`pg-stage ${dragging ? 'is-dragging' : ''}`} style={{ '--bg': bg, '--u': '600px' } as CSSProperties}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={(e) => end(e, false)} onPointerCancel={(e) => end(e, true)} onKeyDown={onKeyDown}
      role="application" aria-label="Creative canvas. Drag objects, or select one and use the toolbar. Arrow keys move, [ and ] rotate, plus and minus resize, Delete removes.">
      {backdrop}
      <i className="pg-guide pg-guide-v" ref={gv} aria-hidden="true" /><i className="pg-guide pg-guide-h" ref={gh} aria-hidden="true" />
      {doc.objs.map((o, i) => <PlaygroundObject key={o.id} o={o} z={i} selected={o.id === selectedId} enter={intro} />)}
      {sparks.map((s) => <i key={s.key} className="pg-spark" aria-hidden="true" style={{ left: s.x, top: s.y, '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--c': s.c, '--w': `${s.w}px` } as CSSProperties} />)}
      {sel && tbStyle && (
        <ObjectToolbar o={sel} colours={colours} style={tbStyle}
          onRotate={(deg) => onPatch(sel.id, { rot: sel.rot + deg })} onSize={(f) => onPatch(sel.id, { s: clamp(sel.s * f, 0.04, 0.9) })}
          onColour={(hex) => onPatch(sel.id, { c: hex })} onMaterial={() => onMaterial(sel.id)}
          onDuplicate={() => onDuplicate(sel.id)} onFront={() => onReorder(sel.id, 'front')} onBack={() => onReorder(sel.id, 'back')} onDelete={() => onRemove(sel.id)} />
      )}
      {children}
    </div>
  );
}
