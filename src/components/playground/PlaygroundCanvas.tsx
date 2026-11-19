import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as RKeyboardEvent, PointerEvent as RPointerEvent, Ref } from 'react';
import { Obj3D } from '../fx/Obj3D';
import { ColourCube } from './ColourCube';
import type { Item } from './palette';

export type CanvasHandle = {
  /** Glide two cubes together and mix them (used by Surprise me and tap-to-mix). */
  mix: (aId: string, bId: string) => void;
  select: (id: string | null) => void;
  /** Snap every cube back to its home position. */
  reset: () => void;
};

type Props = {
  items: Item[];
  reduced: boolean;
  /** Pure lookup of what two cubes would make (hex used for the blend preview). */
  resolve: (aId: string, bId: string) => string | null;
  /** Called once the two cubes have met. `at` is the meeting point in stage px. */
  onMix: (aId: string, bId: string, at: { x: number; y: number }) => void;
  onSelect: (id: string | null) => void;
  ref?: Ref<CanvasHandle>;
};

type Body = {
  el: HTMLElement; tilt: HTMLElement | null;
  x: number; y: number; px: number; vx: number; vy: number; hx: number; hy: number;
  drag: boolean; lock: { sx: number; sy: number; tx: number; ty: number; t0: number; dur: number } | null;
  spawn: number | null; near: boolean; rx: number; ry: number;
};

type Blend = { key: number; x: number; y: number; a: string; b: string; res: string };
type Spark = { key: number; x: number; y: number; dx: number; dy: number; c: string; s: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2; };
const TAP = 7;

/** Cube size + home positions for the current stage shape. Ring of base cubes around a central mixing floor; results settle in the middle. */
function layout(w: number, h: number, items: Item[]) {
  const portrait = w / h < 0.85 || w < 560;
  const size = clamp(Math.min(w * (portrait ? 0.17 : 0.105), h * 0.17), 40, 88);
  const homes = new Map<string, { x: number; y: number }>();
  // leave room at the bottom for the cube labels and the instruction line
  const top = size * (portrait ? 0.95 : 0.75), bottom = h - size * 0.75 - (portrait ? 52 : 40);
  const cx = w / 2, cy = (top + bottom) / 2;
  const rx = w * 0.5 - size * 0.85, ry = Math.max(size, (bottom - top) / 2);
  const jit = [0.03, -0.04, 0.02, -0.03, 0.04, -0.02, 0.03, -0.04];
  let b = 0, r = 0;
  for (const it of items) {
    if (it.kind === 'base') {
      if (portrait) {
        // compact stage: two rows of four, mixing floor + results in the band between them
        const col = b % 4, row = b < 4 ? 0 : 1;
        const x = w * (0.14 + col * 0.24), stagger = (col % 2) * size * 0.2;
        homes.set(it.id, { x, y: row === 0 ? top + stagger : bottom - ((col + 1) % 2) * size * 0.2 });
      } else {
        const ang = ((-112.5 + b * 45) * Math.PI) / 180 + jit[b % 8];
        homes.set(it.id, { x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * ry });
      }
      b++;
    } else {
      const slotGap = size * 1.36;
      homes.set(it.id, { x: cx + (r - 1) * slotGap, y: cy + size * 0.1 });
      r++;
    }
  }
  return { size, homes };
}

export function PlaygroundCanvas({ items, reduced, resolve, onMix, onSelect, ref }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [blend, setBlend] = useState<Blend | null>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);

  // Mutable engine state lives in refs: dragging/animating never re-renders React.
  const E = useRef({
    bodies: new Map<string, Body>(), w: 0, h: 0, size: 64, raf: 0, last: 0, z: 10,
    drag: null as null | { id: string; pid: number; ox: number; oy: number; sx: number; sy: number; moved: boolean; tx: number; ty: number },
    trail: [] as { x: number; y: number; t: number }[], busy: false, timers: [] as number[], key: 0, nearId: null as string | null,
  }).current;
  const live = useRef({ items, reduced, resolve, onMix, onSelect, selected });
  live.current = { items, reduced, resolve, onMix, onSelect, selected };

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => { E.timers = E.timers.filter((t) => t !== id); fn(); }, ms);
    E.timers.push(id);
  }, [E]);

  const choose = useCallback((id: string | null) => { setSelected(id); live.current.onSelect(id); }, []);

  /* ----------------------------- animation loop ----------------------------- */
  const write = useCallback((b: Body) => {
    const s = b.spawn === null ? 1 : Math.max(0.001, easeOutBack(clamp(b.spawn, 0, 1)));
    b.el.style.transform = `translate3d(${(b.x - E.size / 2).toFixed(2)}px,${(b.y - E.size / 2).toFixed(2)}px,0) scale(${s.toFixed(3)})`;
  }, [E]);

  const drawTrail = useCallback((now: number) => {
    const cv = trailRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const dpr = cv.width / Math.max(1, E.w);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, E.w, E.h);
    E.trail = E.trail.filter((p) => now - p.t < 420);
    if (E.trail.length < 2) return;
    const hex = E.drag ? live.current.items.find((i) => i.id === E.drag!.id)?.hex ?? '#3b47ff' : '#3b47ff';
    ctx.lineCap = 'round';
    for (let i = 1; i < E.trail.length; i++) {
      const p0 = E.trail[i - 1], p1 = E.trail[i];
      const age = 1 - (now - p1.t) / 420;
      ctx.strokeStyle = hex; ctx.globalAlpha = Math.max(0, age) * 0.5;
      ctx.lineWidth = E.size * 0.34 * age;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [E]);

  const frame = useCallback((now: number) => {
    const dt = Math.min(0.034, (now - (E.last || now)) / 1000) || 0.016;
    E.last = now;
    let active = false;
    const dragBody = E.drag ? E.bodies.get(E.drag.id) : undefined;
    const R = E.size * 2.3;
    let nearest: { id: string; d: number } | null = null;

    E.bodies.forEach((b, id) => {
      const prevX = b.x, prevY = b.y;
      if (b.lock) {
        const t = clamp((now - b.lock.t0) / b.lock.dur, 0, 1);
        const e = easeIO(t);
        b.x = b.lock.sx + (b.lock.tx - b.lock.sx) * e; b.y = b.lock.sy + (b.lock.ty - b.lock.sy) * e;
        b.vx = b.vy = 0; active = true;
      } else if (b.drag && E.drag) {
        const k = 1 - Math.exp(-dt * (live.current.reduced ? 60 : 26));
        let tx = E.drag.tx + E.drag.ox, ty = E.drag.ty + E.drag.oy;
        tx = clamp(tx, E.size / 2, E.w - E.size / 2); ty = clamp(ty, E.size / 2, E.h - E.size / 2);
        // magnetic pull towards a close neighbour
        E.bodies.forEach((o, oid) => {
          if (oid === id || o.lock) return;
          const d = Math.hypot(o.x - b.x, o.y - b.y);
          if (d < R && d > 1) { const s = (1 - d / R) ** 2; tx += ((o.x - b.x) / d) * s * E.size * 0.16; ty += ((o.y - b.y) / d) * s * E.size * 0.16; }
          if (!nearest || d < nearest.d) nearest = { id: oid, d };
        });
        b.x += (tx - b.x) * k; b.y += (ty - b.y) * k; b.vx = b.vy = 0; active = true;
      } else {
        let ax = (b.hx - b.x) * 90 - b.vx * 15, ay = (b.hy - b.y) * 90 - b.vy * 15;
        if (dragBody && dragBody !== b) {
          const d = Math.hypot(dragBody.x - b.x, dragBody.y - b.y);
          if (d < R && d > 1) { const s = (1 - d / R) ** 2; ax += ((dragBody.x - b.x) / d) * s * E.size * 0.62 * 90; ay += ((dragBody.y - b.y) / d) * s * E.size * 0.62 * 90; }
        }
        if (live.current.reduced) { b.x = b.hx; b.y = b.hy; b.vx = b.vy = 0; }
        else { b.vx += ax * dt; b.vy += ay * dt; b.x += b.vx * dt; b.y += b.vy * dt; }
        if (Math.abs(b.hx - b.x) < 0.35 && Math.abs(b.hy - b.y) < 0.35 && Math.abs(b.vx) < 2 && Math.abs(b.vy) < 2) { b.x = b.hx; b.y = b.hy; b.vx = b.vy = 0; } else active = true;
      }
      if (b.spawn !== null) { b.spawn += dt / 0.55; if (b.spawn >= 1) b.spawn = null; else active = true; }
      write(b);
      // tilt from velocity (visual only)
      if (b.tilt) {
        const sx = (b.x - prevX) / dt, sy = (b.y - prevY) / dt;
        const trx = live.current.reduced ? 0 : clamp(-sy * 0.03, -22, 22), try_ = live.current.reduced ? 0 : clamp(sx * 0.03, -22, 22);
        b.rx += (trx - b.rx) * 0.2; b.ry += (try_ - b.ry) * 0.2;
        if (Math.abs(b.rx) > 0.05 || Math.abs(b.ry) > 0.05) { b.tilt.style.transform = `rotateX(${b.rx.toFixed(2)}deg) rotateY(${b.ry.toFixed(2)}deg)`; active = true; }
        else if (b.rx !== 0 || b.ry !== 0) { b.rx = b.ry = 0; b.tilt.style.transform = ''; }
      }
    });

    // merge-ready highlight on the closest cube while dragging
    const nId = nearest && (nearest as { id: string; d: number }).d < E.size * 1.2 ? (nearest as { id: string; d: number }).id : null;
    if (nId !== E.nearId) {
      if (E.nearId) E.bodies.get(E.nearId)?.el.classList.remove('is-near');
      if (nId) E.bodies.get(nId)?.el.classList.add('is-near');
      E.nearId = nId;
    }
    if (E.drag && !live.current.reduced) {
      if (E.drag.moved && dragBody) { E.trail.push({ x: dragBody.x, y: dragBody.y, t: now }); if (E.trail.length > 30) E.trail.shift(); }
    }
    if (E.trail.length) { drawTrail(now); active = true; } else if (trailRef.current && E.drag === null) drawTrail(now);

    if (active || E.drag) E.raf = requestAnimationFrame(frame); else { E.raf = 0; E.last = 0; }
  }, [E, write, drawTrail]);

  const wake = useCallback(() => { if (!E.raf) { E.last = 0; E.raf = requestAnimationFrame(frame); } }, [E, frame]);

  /* --------------------------------- layout --------------------------------- */
  const applyLayout = useCallback((snap: boolean) => {
    const stage = stageRef.current; if (!stage || !E.w) return;
    const { size, homes } = layout(E.w, E.h, live.current.items);
    E.size = size; stage.style.setProperty('--sz', `${size}px`);
    E.bodies.forEach((b, id) => {
      const h = homes.get(id); if (!h) return;
      b.hx = h.x; b.hy = h.y;
      if (snap) { b.x = h.x; b.y = h.y; b.vx = b.vy = 0; write(b); }
    });
    wake();
  }, [E, write, wake]);

  useEffect(() => {
    const stage = stageRef.current; if (!stage) return;
    const measure = () => {
      const r = stage.getBoundingClientRect(); E.w = r.width; E.h = r.height;
      const cv = trailRef.current;
      if (cv) { const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      applyLayout(true);
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(stage);
    return () => { ro.disconnect(); cancelAnimationFrame(E.raf); E.raf = 0; E.timers.forEach(clearTimeout); E.timers = []; };
  }, [E, applyLayout]);

  // item list changed (result added / removed): recompute homes, let cubes glide
  useEffect(() => { applyLayout(false); }, [items, applyLayout]);

  const refs = useRef(new Map<string, (el: HTMLElement | null) => void>());
  const refFor = (id: string) => {
    let fn = refs.current.get(id);
    if (!fn) {
      fn = (el) => {
        if (!el) { E.bodies.delete(id); refs.current.delete(id); return; }
        const it = live.current.items.find((i) => i.id === id);
        const { homes } = layout(E.w || 1, E.h || 1, live.current.items);
        const h = homes.get(id) ?? { x: 0, y: 0 };
        const from = it?.from;
        const b: Body = { el, tilt: el.querySelector('.pg-tilt'), x: from?.x ?? h.x, y: from?.y ?? h.y, px: 0, vx: 0, vy: 0, hx: h.x, hy: h.y, drag: false, lock: null, spawn: from ? 0 : null, near: false, rx: 0, ry: 0 };
        E.bodies.set(id, b); write(b); wake();
      };
      refs.current.set(id, fn);
    }
    return fn;
  };

  /* ------------------------------- mixing flow ------------------------------- */
  const startMix = useCallback((aId: string, bId: string) => {
    const A = E.bodies.get(aId), B = E.bodies.get(bId);
    if (E.busy || !A || !B || aId === bId) return;
    const res = live.current.resolve(aId, bId); if (!res) return;
    const ia = live.current.items.find((i) => i.id === aId), ib = live.current.items.find((i) => i.id === bId);
    if (!ia || !ib) return;
    E.busy = true; E.drag = null; A.drag = B.drag = false;
    const reduced = live.current.reduced;
    const mx = clamp((A.x + B.x) / 2, E.size, E.w - E.size), my = clamp((A.y + B.y) / 2, E.size, E.h - E.size);
    const gap = E.size * 0.34, now = performance.now(), dur = reduced ? 0 : 440;
    const dirx = B.x >= A.x ? 1 : -1;
    A.lock = { sx: A.x, sy: A.y, tx: mx - gap * dirx, ty: my, t0: now, dur: Math.max(1, dur) };
    B.lock = { sx: B.x, sy: B.y, tx: mx + gap * dirx, ty: my, t0: now, dur: Math.max(1, dur) };
    A.el.style.zIndex = B.el.style.zIndex = String(++E.z);
    wake();
    later(() => {
      const key = ++E.key;
      setBlend({ key, x: mx, y: my, a: ia.hex, b: ib.hex, res });
      if (!reduced) {
        const cols = [ia.hex, ib.hex, res];
        setSparks(Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2 + (i % 3) * 0.2, d = E.size * (0.9 + ((i * 37) % 10) / 9);
          return { key: key * 100 + i, x: mx, y: my, dx: Math.cos(a) * d, dy: Math.sin(a) * d, c: cols[i % 3], s: 6 + (i % 4) * 2 };
        }));
      }
      A.el.style.opacity = B.el.style.opacity = '0';
      later(() => {
        live.current.onMix(aId, bId, { x: mx, y: my });
        // the two source colours are inexhaustible: return them home
        A.lock = B.lock = null; A.x = A.hx; A.y = A.hy; B.x = B.hx; B.y = B.hy; write(A); write(B);
        later(() => { A.el.style.opacity = B.el.style.opacity = ''; }, reduced ? 0 : 380);
        later(() => { setBlend(null); setSparks([]); E.busy = false; }, reduced ? 0 : 700);
        wake();
      }, reduced ? 0 : 520);
    }, reduced ? 0 : dur + 30);
  }, [E, later, wake, write]);

  const tap = useCallback((id: string) => {
    const cur = live.current.selected;
    if (cur && cur !== id) { choose(null); startMix(cur, id); }
    else choose(cur === id ? null : id);
  }, [choose, startMix]);

  useImperativeHandle(ref, () => ({
    mix: (a, b) => { choose(null); startMix(a, b); },
    select: (id) => choose(id),
    reset: () => {
      E.timers.forEach(clearTimeout); E.timers = []; E.busy = false; E.drag = null; setBlend(null); setSparks([]); choose(null);
      E.bodies.forEach((b) => { b.lock = null; b.drag = false; b.el.style.opacity = ''; b.el.classList.remove('is-near'); });
      applyLayout(true);
    },
  }), [E, choose, startMix, applyLayout]);

  /* --------------------------------- pointer --------------------------------- */
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (E.busy || e.button > 0) return;
    const el = (e.target as Element).closest<HTMLElement>('[data-cube]'); if (!el) return;
    const id = el.dataset.id!; const b = E.bodies.get(id); const stage = stageRef.current; if (!b || !stage) return;
    const r = stage.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
    stage.setPointerCapture(e.pointerId);
    E.drag = { id, pid: e.pointerId, ox: b.x - px, oy: b.y - py, sx: px, sy: py, moved: false, tx: px, ty: py };
    b.drag = true; b.vx = b.vy = 0; b.el.style.zIndex = String(++E.z); b.el.classList.add('is-grab');
    wake();
  };
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = E.drag; const stage = stageRef.current; if (!d || d.pid !== e.pointerId || !stage) return;
    const r = stage.getBoundingClientRect(); d.tx = e.clientX - r.left; d.ty = e.clientY - r.top;
    if (!d.moved && Math.hypot(d.tx - d.sx, d.ty - d.sy) > TAP) { d.moved = true; choose(d.id); }
  };
  const endDrag = (e: RPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = E.drag; if (!d || d.pid !== e.pointerId) return;
    const b = E.bodies.get(d.id); E.drag = null;
    if (!b) return;
    b.drag = false; b.el.classList.remove('is-grab');
    if (cancelled) { wake(); return; }
    if (!d.moved) { tap(d.id); wake(); return; }
    // dropped close to another cube → mix
    let best: { id: string; d: number } | null = null;
    E.bodies.forEach((o, id) => { if (id === d.id) return; const dist = Math.hypot(o.x - b.x, o.y - b.y); if (dist < E.size * 1.2 && (!best || dist < best.d)) best = { id, d: dist }; });
    const hit = best as { id: string; d: number } | null;
    if (hit) { choose(null); startMix(d.id, hit.id); } else { wake(); }
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = (e.target as Element).closest<HTMLElement>('[data-cube]'); if (!el) return;
    e.preventDefault(); if (!E.busy) tap(el.dataset.id!);
  };

  const sel = items.find((i) => i.id === selected);
  return (
    <div
      className="pg-stage" ref={stageRef}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e, false)} onPointerCancel={(e) => endDrag(e, true)} onKeyDown={onKey}
      role="group" aria-label="Colour mixing stage. Drag one colour onto another, or select two colours, to mix them."
    >
      <div className="pg-floor" aria-hidden="true"><i /><i /></div>
      <div className="pg-decor" aria-hidden="true">
        <Obj3D kind="sphere" tone="butter" size={46} float={8} depth={10} className="pg-d1" />
        <Obj3D kind="torus" tone="cobalt" size={62} float={9} spin depth={8} className="pg-d2" />
        <Obj3D kind="spark" tone="coral" size={30} float={6} spin className="pg-d3" />
        <Obj3D kind="capsule" tone="lavender" size={44} float={7} depth={6} rot={-24} className="pg-d4" />
      </div>
      <canvas ref={trailRef} className="pg-trail" aria-hidden="true" />
      {items.map((it, i) => (
        <div
          key={it.id} ref={refFor(it.id)} data-cube data-id={it.id} data-cursor="Drag"
          className={`pg-body ${selected === it.id ? 'is-selected' : ''} ${it.kind === 'result' ? 'is-result' : ''}`}
          role="button" tabIndex={0} aria-pressed={selected === it.id}
          aria-label={`${it.name}, ${it.hex.toUpperCase()}${selected === it.id ? ', selected' : ''}. ${selected && selected !== it.id ? 'Press Enter to mix with the selected colour.' : 'Press Enter to select.'}`}
          style={{ '--c': it.hex } as CSSProperties}
        >
          <ColourCube hex={it.hex} finish={it.finish} index={i} />
          <span className="pg-label">{it.kind === 'result' ? it.hex.toUpperCase() : it.name}</span>
        </div>
      ))}
      {blend && (
        <div className="pg-blend" key={blend.key} style={{ left: blend.x, top: blend.y, '--a': blend.a, '--b': blend.b, '--r': blend.res } as CSSProperties} aria-hidden="true"><i /><i /></div>
      )}
      {sparks.map((s) => (
        <i key={s.key} className="pg-spark" aria-hidden="true" style={{ left: s.x, top: s.y, '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--c': s.c, '--w': `${s.s}px` } as CSSProperties} />
      ))}
      <p className="pg-hint">{sel ? <>Now pick another colour to mix with <b>{sel.name}</b>.</> : 'Drag two colours together to mix them.'}</p>
    </div>
  );
}
