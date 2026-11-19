import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { CHALLENGES } from '../../lib/fix/challenges';
import { svgMarkup } from '../../lib/art/shapes';
import type { Kind, Mat } from '../../lib/art/shapes';
import { FixSheet } from '../fix/FixSheet';
import { useOverlay } from './useOverlay';
import '../../styles/arcade.css';

const CreativePlayground = lazy(() => import('./CreativePlayground'));
const FixThisDesign = lazy(() => import('../fix/FixThisDesign'));
type Game = 'playground' | 'fix';
type Props = { onReveal: () => void; onDone: () => void };

/** Floating 3D composition for the Design Playground card (same drawings the game uses). */
const PREVIEW: { k: Kind; c: string; c2: string; m: Mat; x: number; y: number; w: number; r: number; d: number }[] = [
  { k: 'sphere', c: '#ff6a4a', c2: '#ffd75e', m: 'gloss', x: 34, y: 46, w: 34, r: 0, d: 1 },
  { k: 'torus', c: '#3b47ff', c2: '#cdbdff', m: 'metallic', x: 68, y: 30, w: 26, r: 18, d: -1.4 },
  { k: 'rcube', c: '#cdbdff', c2: '#fff', m: 'glass', x: 74, y: 70, w: 20, r: -12, d: 1.8 },
  { k: 'star', c: '#ffd75e', c2: '#fff', m: 'matte', x: 14, y: 22, w: 11, r: 14, d: -2 },
  { k: 'blob', c: '#bfe6cf', c2: '#2fbf71', m: 'gradient', x: 16, y: 76, w: 17, r: 0, d: 1.2 },
  { k: 'cone', c: '#940428', c2: '#ff6a4a', m: 'gloss', x: 52, y: 80, w: 12, r: 12, d: -1 },
  { k: 'starburst', c: '#ff9a2e', c2: '#fff', m: 'matte', x: 48, y: 14, w: 11, r: 0, d: 2 },
];

function PlaygroundArt() {
  const items = useMemo(() => PREVIEW.map((p, i) => ({ ...p, i, m2: svgMarkup(`ac${i}`, { kind: p.k, c: p.c, c2: p.c2, mat: p.m }) })), []);
  return (
    <div className="ac-art ac-art-play" aria-hidden="true">
      {items.map((o) => (
        <span key={o.i} className="ac-obj" style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, '--asp': o.m2.aspect, '--r': `${o.r}deg`, '--d': o.d, '--i': o.i } as CSSProperties} dangerouslySetInnerHTML={{ __html: o.m2.svg }} />
      ))}
    </div>
  );
}

function FixArt() {
  const c = CHALLENGES[0];
  return (
    <div className="ac-art ac-art-fix" aria-hidden="true">
      <div className="ac-poster">
        <FixSheet doc={c.initial} className="ac-sheet" />
        <div className="ac-fixed"><FixSheet doc={c.reference} className="ac-sheet" /></div>
        <i className="ac-sweep" />
      </div>
      <span className="ac-stamp">Fixed</span>
    </div>
  );
}

function Select({ onPick, onReveal, onDone }: Props & { onPick: (g: Game, e: MouseEvent<HTMLElement>) => void }) {
  const { phase, origin, leave } = useOverlay(onReveal, onDone);
  return createPortal(
    <div className={`pg ac ${phase}`} style={{ '--tint': '#ffd75e', '--ox': origin.x, '--oy': origin.y } as CSSProperties} role="region" aria-label="Choose a game">
      <div className="pg-inner ac-inner">
        <header className="pg-head">
          <p className="pg-brand"><i aria-hidden="true" />Jeet Gohel / Playground</p>
          <button type="button" className="btn-solid pg-skip" onClick={leave} data-cursor="Enter">Skip to Portfolio <span aria-hidden="true">→</span></button>
        </header>
        <div className="ac-main">
          <div className="ac-intro">
            <h1>What are we <em>playing</em> today?</h1>
            <p>Pick your playground. Experiment, create and have a little fun.</p>
          </div>
          <div className="ac-cards">
            <button type="button" className="ac-card ac-card-play" onClick={(e) => onPick('playground', e)} data-cursor="Play" aria-label="Design Playground — Start creating">
              <PlaygroundArt />
              <span className="ac-kicker">Game 01 · Freestyle</span>
              <span className="ac-title">Design Playground</span>
              <span className="ac-desc">Create something unexpected. Play with shapes, colours and 3D objects.</span>
              <span className="ac-cta">Start creating <b aria-hidden="true">→</b></span>
            </button>
            <button type="button" className="ac-card ac-card-fix" onClick={(e) => onPick('fix', e)} data-cursor="Play" aria-label="Fix This Design — Fix it">
              <FixArt />
              <span className="ac-kicker">Game 02 · Challenge</span>
              <span className="ac-title">Fix This Design</span>
              <span className="ac-desc">Not everything needs to be perfect. Some things just need a better designer.</span>
              <span className="ac-cta">Fix it <b aria-hidden="true">→</b></span>
            </button>
          </div>
        </div>
      </div>
      <div className="pg-wipe" aria-hidden="true" />
    </div>,
    document.body,
  );
}

function Loading({ onSkip }: { onSkip: () => void }) {
  return createPortal(
    <div className="pg ac-loading" role="status" aria-label="Loading game"><button type="button" className="btn-solid pg-skip" onClick={onSkip}>Skip to Portfolio <span aria-hidden="true">→</span></button></div>,
    document.body,
  );
}

/** Game selection → Design Playground or Fix This Design. Both can return here; Skip to Portfolio is always on screen. */
export default function Arcade({ onReveal, onDone }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [wipe, setWipe] = useState<{ x: number; y: number; c: string; out: boolean } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const skip = useCallback(() => { onReveal(); onDone(); }, [onReveal, onDone]);

  const go = useCallback((to: Game | null, e?: MouseEvent<HTMLElement>) => {
    const r = e?.currentTarget.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2, y = r ? r.top + r.height / 2 : window.innerHeight / 2;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setGame(to); return; }
    setWipe({ x, y, c: to === 'fix' ? '#940428' : to === 'playground' ? '#ffd75e' : '#fff1e0', out: false });
    timers.current.push(window.setTimeout(() => { setGame(to); setWipe((w) => (w ? { ...w, out: true } : w)); }, 520), window.setTimeout(() => setWipe(null), 1050));
  }, []);

  return (
    <>
      {game === null && <Select onPick={go} onReveal={onReveal} onDone={onDone} />}
      {game === 'playground' && <Suspense fallback={<Loading onSkip={skip} />}><CreativePlayground onReveal={onReveal} onDone={onDone} onBack={(e) => go(null, e)} /></Suspense>}
      {game === 'fix' && <Suspense fallback={<Loading onSkip={skip} />}><FixThisDesign onReveal={onReveal} onDone={onDone} onBack={(e) => go(null, e)} /></Suspense>}
      {wipe && createPortal(<div className={`ac-wipe ${wipe.out ? 'out' : ''}`} style={{ '--x': `${wipe.x}px`, '--y': `${wipe.y}px`, '--c': wipe.c } as CSSProperties} aria-hidden="true" />, document.body)}
    </>
  );
}
