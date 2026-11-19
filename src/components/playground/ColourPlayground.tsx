import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { colourName, mixColours } from '../../lib/colour';
import { lockScroll } from '../../lib/scrollLock';
import { PlaygroundCanvas } from './PlaygroundCanvas';
import type { CanvasHandle } from './PlaygroundCanvas';
import { ColourResult } from './ColourResult';
import type { Focus } from './ColourResult';
import { DiscoveredColours } from './DiscoveredColours';
import type { Found } from './DiscoveredColours';
import { baseItems, finishFor, MAX_RESULTS_ON_STAGE } from './palette';
import type { Item } from './palette';
import '../../styles/playground.css';

type Props = {
  /** Called when the exit transition starts revealing the portfolio underneath. */
  onReveal: () => void;
  /** Called when the playground can be unmounted. */
  onDone: () => void;
};

function usePrefersReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return r;
}

export default function ColourPlayground({ onReveal, onDone }: Props) {
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = useState<Item[]>(baseItems);
  const [found, setFound] = useState<Found[]>([]);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [phase, setPhase] = useState<'play' | 'leaving' | 'out'>('play');
  const [origin, setOrigin] = useState({ x: '92%', y: '40px' });
  const canvas = useRef<CanvasHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const latest = useRef({ items, found });
  latest.current = { items, found };
  const seq = useRef(0);
  const timers = useRef<number[]>([]);

  // Modal-ish while visible: page behind is inert and unscrollable; released as the reveal starts.
  useEffect(() => {
    const app = document.getElementById('root');
    const unlock = lockScroll();
    app?.setAttribute('inert', '');
    return () => { unlock(); app?.removeAttribute('inert'); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => {
    if (phase === 'out') document.getElementById('root')?.removeAttribute('inert');
  }, [phase]);

  const tint = focus?.hex ?? '#ffd75e';

  const resolve = useCallback((aId: string, bId: string) => {
    const a = latest.current.items.find((i) => i.id === aId), b = latest.current.items.find((i) => i.id === bId);
    return a && b ? mixColours(a.hex, b.hex) : null;
  }, []);

  const onSelect = useCallback((id: string | null) => {
    const it = latest.current.items.find((i) => i.id === id);
    root.current?.style.setProperty('--pg-a', it?.hex ?? '#ffd75e');
  }, []);

  const onMix = useCallback((aId: string, bId: string, at: { x: number; y: number }) => {
    const { items: cur, found: fnd } = latest.current;
    const a = cur.find((i) => i.id === aId), b = cur.find((i) => i.id === bId);
    if (!a || !b) return;
    const hex = mixColours(a.hex, b.hex), name = colourName(hex);
    const isNew = !fnd.some((f) => f.hex === hex);
    const rec: Found = { hex, name, a: { hex: a.hex, name: a.name }, b: { hex: b.hex, name: b.name } };
    if (isNew) setFound((f) => [...f, rec]);
    setFocus({ ...rec, fresh: isNew, key: ++seq.current });
    root.current?.style.setProperty('--pg-b', hex);
    const onStage = cur.find((i) => i.hex === hex);
    if (onStage) { canvas.current?.select(onStage.id); return; }
    const id = `res-${seq.current}`;
    setItems((list) => {
      const bases = list.filter((i) => i.kind === 'base');
      const results = list.filter((i) => i.kind === 'result').slice(-(MAX_RESULTS_ON_STAGE - 1));
      return [...bases, ...results, { id, hex, name, kind: 'result', finish: finishFor(fnd.length), from: at }];
    });
    canvas.current?.select(id);
  }, []);

  const pick = useCallback((hex: string) => {
    const rec = latest.current.found.find((f) => f.hex === hex); if (!rec) return;
    setFocus({ ...rec, fresh: false, key: ++seq.current });
    const onStage = latest.current.items.find((i) => i.hex === hex);
    if (onStage) { canvas.current?.select(onStage.id); return; }
    const id = `res-${++seq.current}`;
    setItems((list) => {
      const bases = list.filter((i) => i.kind === 'base');
      const results = list.filter((i) => i.kind === 'result').slice(-(MAX_RESULTS_ON_STAGE - 1));
      return [...bases, ...results, { id, hex, name: rec.name, kind: 'result', finish: finishFor(latest.current.found.length) }];
    });
    canvas.current?.select(id);
  }, []);

  const surprise = useCallback(() => {
    const list = latest.current.items;
    const pairs: [Item, Item][] = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) pairs.push([list[i], list[j]]);
    // Fisher–Yates shuffle, then prefer a pair that makes a shade nobody has found yet
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; }
    const fresh = pairs.find(([a, b]) => { const h = mixColours(a.hex, b.hex); return !latest.current.found.some((f) => f.hex === h) && !list.some((i) => i.hex === h); }) ?? pairs[0];
    if (fresh) canvas.current?.mix(fresh[0].id, fresh[1].id);
  }, []);

  const reset = useCallback(() => {
    setItems(baseItems()); setFound([]); setFocus(null);
    canvas.current?.reset();
    root.current?.style.setProperty('--pg-a', '#ffd75e'); root.current?.style.setProperty('--pg-b', '#cdbdff');
  }, []);

  const leave = useCallback((e?: MouseEvent<HTMLElement>) => {
    if (phase !== 'play') return;
    if (e) { const r = e.currentTarget.getBoundingClientRect(); setOrigin({ x: `${Math.round(r.left + r.width / 2)}px`, y: `${Math.round(r.top + r.height / 2)}px` }); }
    if (reduced) { onReveal(); onDone(); return; }
    setPhase('leaving');
    timers.current.push(window.setTimeout(() => { onReveal(); setPhase('out'); }, 640));
    timers.current.push(window.setTimeout(onDone, 640 + 760));
  }, [phase, reduced, onReveal, onDone]);

  const style = useMemo(() => ({ '--tint': tint, '--ox': origin.x, '--oy': origin.y } as CSSProperties), [tint, origin]);

  return createPortal(
    <div ref={root} className={`pg ${phase}`} style={style} role="region" aria-label="Colour playground">
      <div className="pg-inner">
        <header className="pg-head">
          <p className="pg-brand"><i aria-hidden="true" />Jeet Gohel — Creative Playground<span className="pg-tag">Interactive experiment</span></p>
          <button type="button" className="btn-solid pg-skip" onClick={leave} data-cursor="Enter">Skip to Portfolio <span aria-hidden="true">→</span></button>
        </header>

        <div className="pg-intro">
          <h1>A little play with <em>colour.</em></h1>
          <p className="pg-sub">Pick. Mix. Discover something unexpected.</p>
        </div>

        <PlaygroundCanvas ref={canvas} items={items} reduced={reduced} resolve={resolve} onMix={onMix} onSelect={onSelect} />

        <div className="pg-dock">
          <ColourResult focus={focus} onExplore={() => leave()} />
          <DiscoveredColours found={found} activeHex={focus?.hex} onPick={pick} />
          <div className="pg-actions">
            <button type="button" className="btn-line pg-act" onClick={surprise}>Surprise me</button>
            <button type="button" className="btn-line pg-act" onClick={reset}>Reset</button>
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{focus ? `${focus.fresh ? 'New shade discovered: ' : ''}${focus.name}, ${focus.hex.toUpperCase()}` : ''}</p>
      </div>
      <div className="pg-wipe" aria-hidden="true" />
    </div>,
    document.body,
  );
}
