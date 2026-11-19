import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Download, Palette as PaletteIcon, Redo2, RotateCcw, Shuffle, Target, Undo2 } from 'lucide-react';
import { luma, readable } from '../../lib/art/colour';
import { CHALLENGES, composeArtwork, defaultStyle, newId, rng } from '../../lib/art/compose';
import type { Doc, Obj } from '../../lib/art/compose';
import { downloadBlob, renderPng } from '../../lib/art/exportPng';
import { getPalette, PALETTES } from '../../lib/art/palettes';
import { MATERIALS } from '../../lib/art/shapes';
import type { Kind } from '../../lib/art/shapes';
import { lockScroll } from '../../lib/scrollLock';
import { PlaygroundCanvas } from './PlaygroundCanvas';
import type { CanvasHandle } from './PlaygroundCanvas';
import { ObjectLibrary } from './ObjectLibrary';
import { ColourStudio } from './ColourStudio';
import { ChallengePanel } from './ChallengePanel';
import '../../styles/playground.css';

type Props = { onReveal: () => void; onDone: () => void };
type Hist = { past: Doc[]; present: Doc; future: Doc[] };

const EMPTY: Doc = { bg: '#fff1e0', paletteId: PALETTES[0].id, objs: [] };
const SEED = 21;

function usePrefersReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const f = () => setR(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, []);
  return r;
}

export default function CreativePlayground({ onReveal, onDone }: Props) {
  const reduced = usePrefersReducedMotion();
  const [hist, setHist] = useState<Hist>({ past: [], present: EMPTY, future: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [studio, setStudio] = useState(false);
  const [challenge, setChallenge] = useState<{ on: boolean; i: number }>({ on: false, i: 0 });
  const [phase, setPhase] = useState<'play' | 'leaving' | 'out'>('play');
  const [origin, setOrigin] = useState({ x: '92%', y: '40px' });
  const [toast, setToast] = useState('');
  const [intro, setIntro] = useState(true);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const canvas = useRef<CanvasHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const doc = hist.present;
  const live = useRef({ doc, selectedId }); live.current = { doc, selectedId };
  const palette = getPalette(doc.paletteId);
  const colourCursor = useRef(0);

  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);

  /* ---------- history ---------- */
  const commit = useCallback((fn: (d: Doc) => Doc) => {
    setHist((h) => { const n = fn(h.present); return n === h.present ? h : { past: [...h.past.slice(-59), h.present], present: n, future: [] }; });
    setTouched(true);
  }, []);
  const undo = useCallback(() => setHist((h) => (h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h)), []);
  const redo = useCallback(() => setHist((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h)), []);

  // modal-ish while visible
  useEffect(() => {
    const app = document.getElementById('root'); const unlock = lockScroll(); app?.setAttribute('inert', '');
    return () => { unlock(); app?.removeAttribute('inert'); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => { if (phase === 'out') document.getElementById('root')?.removeAttribute('inert'); }, [phase]);

  // curated first composition, built once the canvas has been measured
  useEffect(() => {
    const id = window.setTimeout(() => {
      const s = canvas.current?.size(); const aspect = s && s.h ? s.w / s.h : 1.6;
      setHist({ past: [], present: composeArtwork(SEED, aspect, 'sunset-club', true), future: [] });
    }, 30);
    const done = window.setTimeout(() => setIntro(false), 2400);
    return () => { clearTimeout(id); clearTimeout(done); };
  }, []);

  // selecting an object closes the colour studio (they would overlap on small screens); opening the studio clears the selection
  const select = useCallback((id: string | null) => { setSelectedId(id); if (id) setStudio(false); }, []);
  const toggleStudio = useCallback(() => { setStudio((v) => !v); setSelectedId(null); }, []);

  /* ---------- editing operations ---------- */
  const patch = useCallback((id: string, p: Partial<Obj>) => commit((d) => ({ ...d, objs: d.objs.map((o) => (o.id === id ? { ...o, ...p } : o)) })), [commit]);
  const remove = useCallback((id: string) => { commit((d) => ({ ...d, objs: d.objs.filter((o) => o.id !== id) })); setSelectedId(null); }, [commit]);
  const duplicate = useCallback((id: string) => {
    const src = live.current.doc.objs.find((o) => o.id === id); if (!src) return;
    const copy: Obj = { ...src, id: newId(), x: Math.min(0.97, src.x + 0.04), y: Math.min(0.97, src.y + 0.05) };
    commit((d) => ({ ...d, objs: [...d.objs, copy] })); setSelectedId(copy.id); canvas.current?.burst(copy.x, copy.y, copy.c);
  }, [commit]);
  const reorder = useCallback((id: string, to: 'front' | 'back') => commit((d) => {
    const o = d.objs.find((q) => q.id === id); if (!o) return d;
    const rest = d.objs.filter((q) => q.id !== id); return { ...d, objs: to === 'front' ? [...rest, o] : [o, ...rest] };
  }), [commit]);
  const cycleMaterial = useCallback((id: string) => commit((d) => ({ ...d, objs: d.objs.map((o) => (o.id === id ? { ...o, mat: MATERIALS[(MATERIALS.indexOf(o.mat) + 1) % MATERIALS.length] } : o)) })), [commit]);

  const place = useCallback((kind: Kind, text: string | undefined, at?: { x: number; y: number }) => {
    const d = live.current.doc, pal = getPalette(d.paletteId);
    const cols = pal.colours.filter((c) => Math.abs(luma(c) - luma(d.bg)) > 0.1); const use = cols.length ? cols : pal.colours;
    const c = use[colourCursor.current++ % use.length], c2 = use[colourCursor.current % use.length];
    const base = defaultStyle(kind, c, c2, text);
    const s = canvas.current?.size() ?? { w: 800, h: 600 }; const u = Math.min(s.w, s.h);
    let pos = at;
    if (!pos) { // first free spot spiralling out from the centre
      const asp = s.w / s.h;
      for (let i = 0; i < 40 && !pos; i++) {
        const a = i * 2.4, r = 0.03 * i; const x = 0.5 + (Math.cos(a) * r) / Math.max(1, asp) * 1.4, y = 0.5 + Math.sin(a) * r * 0.9;
        if (d.objs.every((o) => Math.hypot((o.x - x) * s.w, (o.y - y) * s.h) > (o.s + base.s) * u * 0.34)) pos = { x, y };
      }
      pos ??= { x: 0.5, y: 0.5 };
    }
    const o: Obj = { id: newId(), ...base, x: Math.min(0.96, Math.max(0.04, pos.x)), y: Math.min(0.96, Math.max(0.04, pos.y)), rot: Math.round((Math.random() - 0.5) * 24) };
    commit((dd) => ({ ...dd, objs: [...dd.objs, o] })); setSelectedId(o.id); canvas.current?.burst(o.x, o.y, o.c);
  }, [commit]);

  const drop = useCallback((kind: Kind, text: string | undefined, cx: number, cy: number) => {
    const r = canvas.current?.rect(); if (!r) return;
    place(kind, text, { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height });
  }, [place]);

  /* ---------- palettes ---------- */
  const applyPalette = useCallback((id: string, shuffle = false) => {
    const pal = getPalette(id);
    commit((d) => {
      const order: string[] = []; for (const o of d.objs) if (!order.includes(o.c.toLowerCase())) order.push(o.c.toLowerCase());
      const r = rng(Date.now() & 0xffff); const src = shuffle ? [...pal.colours].sort(() => r() - 0.5) : pal.colours;
      const map = new Map(order.map((c, i) => [c, src[i % src.length]]));
      return { bg: pal.bgs[0], paletteId: id, objs: d.objs.map((o, i) => ({ ...o, c: map.get(o.c.toLowerCase()) ?? o.c, c2: src[(i + 2) % src.length] })) };
    });
  }, [commit]);
  const randomise = useCallback(() => { const others = PALETTES.filter((p) => p.id !== live.current.doc.paletteId); applyPalette(others[Math.floor(Math.random() * others.length)].id, true); }, [applyPalette]);
  const setBg = useCallback((hex: string) => commit((d) => ({ ...d, bg: hex })), [commit]);

  /* ---------- magic shuffle, reset, export ---------- */
  const shuffle = useCallback(() => {
    const s = canvas.current?.size(); const aspect = s && s.h ? s.w / s.h : 1.6;
    const next = composeArtwork((Math.random() * 4294967295) >>> 0, aspect);
    commit(() => next); setSelectedId(null);
    for (const o of next.objs.slice(0, 5)) canvas.current?.burst(o.x, o.y, o.c);
  }, [commit]);
  const reset = useCallback(() => { commit((d) => ({ ...EMPTY, paletteId: d.paletteId, bg: getPalette(d.paletteId).bgs[0], objs: [] })); setSelectedId(null); }, [commit]);

  const flash = useCallback((msg: string) => { setToast(msg); later(() => setToast(''), 2600); }, [later]);
  const download = useCallback(async () => {
    const s = canvas.current?.size(); if (!s || busy) return;
    setBusy(true);
    try { const blob = await renderPng(live.current.doc, s.w, s.h); downloadBlob(blob, 'jeet-gohel-playground.png'); flash('Saved — your creation is in your downloads ✓'); }
    catch { flash('Sorry, the export failed. Try again?'); }
    setBusy(false);
  }, [busy, flash]);

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (t.closest('input,textarea')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && live.current.selectedId && !t.closest('[data-obj]')) remove(live.current.selectedId);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, remove]);

  /* ---------- leaving ---------- */
  const leave = useCallback((e?: MouseEvent<HTMLElement>) => {
    if (phase !== 'play') return;
    if (e) { const r = e.currentTarget.getBoundingClientRect(); setOrigin({ x: `${Math.round(r.left + r.width / 2)}px`, y: `${Math.round(r.top + r.height / 2)}px` }); }
    if (reduced) { onReveal(); onDone(); return; }
    setPhase('leaving');
    later(() => { onReveal(); setPhase('out'); }, 640); later(onDone, 640 + 760);
  }, [phase, reduced, onReveal, onDone, later]);

  const colours = useMemo(() => [...new Set([...palette.colours, ...doc.objs.map((o) => o.c)])].slice(0, 8), [palette, doc.objs]);
  const used = new Set(doc.objs.map((o) => o.c.toLowerCase())).size;
  const ink = readable(doc.bg);
  const emColour = useMemo(() => [...palette.colours].sort((a, b) => Math.abs(luma(b) - luma(doc.bg)) - Math.abs(luma(a) - luma(doc.bg)))[0], [palette, doc.bg]);
  const style = { '--tint': doc.bg, '--ox': origin.x, '--oy': origin.y, '--em': emColour, '--stage-ink': ink } as CSSProperties;

  const backdrop = (
    <div className="pg-backdrop">
      <p className="pg-kicker">The Playground</p>
      <h1>Make something <em>unexpected.</em></h1>
      <p className="pg-sub">A little space to experiment, create and play.</p>
      <p className="pg-how">Drag it. Twist it. Mix it. See what happens.</p>
      {doc.objs.length === 0 && <p className="pg-empty">Pick an object below — or hit <b>Make it random</b>.</p>}
    </div>
  );

  return createPortal(
    <div ref={root} className={`pg ${phase} ${touched ? 'touched' : ''}`} style={style} role="region" aria-label="The Playground — an interactive design experiment">
      <div className="pg-inner">
        <header className="pg-head">
          <p className="pg-brand"><i aria-hidden="true" />Jeet Gohel / Playground<span className="pg-tag">Interactive design experiment</span></p>
          <button type="button" className="btn-solid pg-skip" onClick={leave} data-cursor="Enter">Skip to Portfolio <span aria-hidden="true">→</span></button>
        </header>

        <PlaygroundCanvas ref={canvas} doc={doc} selectedId={selectedId} reduced={reduced} intro={intro} colours={colours} backdrop={backdrop}
          onSelect={select} onPatch={patch} onDuplicate={duplicate} onRemove={remove} onReorder={reorder} onMaterial={cycleMaterial}>
          {challenge.on && <ChallengePanel doc={doc} index={challenge.i} onNext={() => setChallenge((c) => ({ ...c, i: (c.i + 1) % CHALLENGES.length }))} onClose={() => setChallenge((c) => ({ ...c, on: false }))} />}
          {studio && <ColourStudio palette={palette} bg={doc.bg} onPalette={(id) => applyPalette(id)} onBg={setBg} onRandomise={randomise} />}
        </PlaygroundCanvas>

        <div className="pg-tray">
          <ObjectLibrary colours={palette.colours} onAdd={(k, t) => place(k, t)} onDrop={drop} stageRect={() => canvas.current?.rect() ?? null} />
          <div className="pg-actions" role="group" aria-label="Playground actions">
            <button type="button" className="pg-btn primary" onClick={shuffle}><Shuffle size={16} aria-hidden="true" /> Make it random</button>
            <button type="button" className={`pg-btn ${studio ? 'on' : ''}`} onClick={toggleStudio} aria-expanded={studio} aria-label="Colour studio"><PaletteIcon size={16} aria-hidden="true" /><span>Colour</span></button>
            <button type="button" className={`pg-btn ${challenge.on ? 'on' : ''}`} onClick={() => setChallenge((c) => ({ ...c, on: !c.on }))} aria-pressed={challenge.on} aria-label="Creative challenge"><Target size={16} aria-hidden="true" /><span>Challenge</span></button>
            <button type="button" className="pg-btn icon" onClick={undo} disabled={!hist.past.length} aria-label="Undo"><Undo2 size={17} /></button>
            <button type="button" className="pg-btn icon" onClick={redo} disabled={!hist.future.length} aria-label="Redo"><Redo2 size={17} /></button>
            <button type="button" className="pg-btn icon" onClick={reset} aria-label="Reset canvas"><RotateCcw size={17} /></button>
            <button type="button" className="pg-btn dark" onClick={download} disabled={!doc.objs.length || busy}><Download size={16} aria-hidden="true" /> Download my creation</button>
            {touched && <button type="button" className="pg-btn link" onClick={() => leave()}>Explore My Portfolio <span aria-hidden="true">→</span></button>}
            <p className="pg-count" aria-live="polite">{doc.objs.length} object{doc.objs.length === 1 ? '' : 's'} · {used} colour{used === 1 ? '' : 's'}</p>
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{toast}</p>
        {toast && <p className="pg-toast" aria-hidden="true">{toast}</p>}
      </div>
      <div className="pg-wipe" aria-hidden="true" />
    </div>,
    document.body,
  );
}
