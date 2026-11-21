import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as RPE } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted, unlockAudio } from './audio';
import { DashEngine } from './engine';
import type { Action, GameState } from './engine';
import { useOverlay } from './useOverlay';
import '../styles/dash.css';

type Props = { onReveal: () => void; onDone: () => void };
const BEST_KEY = 'dd-best';
const coarse = () => window.matchMedia('(pointer: coarse)').matches;

/** DESIGN DASH — the client is chasing! Minimal UI: the 3D world is the focus. */
export default function DesignDash({ onReveal, onDone }: Props) {
  const { phase, origin, leave } = useOverlay(onReveal, onDone);
  const host = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null);
  const eng = useRef<DashEngine | null>(null);
  const scoreEl = useRef<HTMLElement>(null), itemsEl = useRef<HTMLElement>(null), last = useRef({ score: 0, items: 0 });
  const [state, setState] = useState<GameState>('ready');
  const [fail, setFail] = useState(false);
  const [best, setBest] = useState(() => { try { return +(sessionStorage.getItem(BEST_KEY) ?? 0); } catch { return 0; } });
  const [final, setFinal] = useState({ score: 0, items: 0, record: false });
  const [muted, setMute] = useState(false);
  const bestRef = useRef(best); bestRef.current = best;

  useEffect(() => {
    const el = host.current; if (!el) return;
    let e: DashEngine;
    try {
      e = new DashEngine(el, {
        onHud: (h) => { last.current = { score: h.score, items: h.items }; if (scoreEl.current) scoreEl.current.textContent = String(h.score); if (itemsEl.current) itemsEl.current.textContent = String(h.items); },
        onState: (s) => {
          setState(s);
          if (s === 'over') {
            const sc = last.current.score, rec = sc > bestRef.current;
            if (rec) { setBest(sc); try { sessionStorage.setItem(BEST_KEY, String(sc)); } catch { /* ignore */ } }
            setFinal({ score: sc, items: last.current.items, record: rec });
          }
        },
        onEvent: (ev) => { if (ev === 'hit') { const r = root.current; if (r) { r.classList.remove('is-hit'); void r.offsetWidth; r.classList.add('is-hit'); } } },
      });
    } catch { setFail(true); return; }
    eng.current = e;
    const ro = new ResizeObserver(() => e.resize()); ro.observe(el);
    if (new URLSearchParams(window.location.search).has('dashdebug')) (window as unknown as { __dash: DashEngine }).__dash = e;
    const hidden = () => { if (document.hidden) e.pause(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { ro.disconnect(); document.removeEventListener('visibilitychange', hidden); e.dispose(); eng.current = null; delete (window as unknown as { __dash?: DashEngine }).__dash; };
  }, []);

  const play = useCallback(() => { unlockAudio(); eng.current?.start(); }, []);
  const togglePause = useCallback(() => { const e = eng.current; if (!e) return; if (e.state === 'playing') e.pause(); else if (e.state === 'paused') e.resume(); }, []);

  useEffect(() => {
    const map: Record<string, Action> = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', ArrowDown: 'slide', s: 'slide', S: 'slide' };
    const onKey = (ev: KeyboardEvent) => {
      const e = eng.current; if (!e) return;
      if (ev.key === 'Escape' || ev.key === 'p' || ev.key === 'P') { if (e.state === 'playing' || e.state === 'paused') { ev.preventDefault(); togglePause(); } return; }
      if ((ev.key === 'Enter' || ev.key === ' ') && (e.state === 'ready' || e.state === 'over') && !(ev.target as HTMLElement).closest('button')) { ev.preventDefault(); play(); return; }
      const a = map[ev.key]; if (a) { ev.preventDefault(); e.input(a); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [play, togglePause]);

  // swipe controls: act as soon as the finger has moved far enough, then keep tracking from there
  const sw = useRef<{ id: number; x: number; y: number } | null>(null);
  const onDown = (e: RPE<HTMLDivElement>) => { sw.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; };
  const onMove = (e: RPE<HTMLDivElement>) => {
    const s = sw.current; if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y, T = 26;
    if (Math.abs(dx) < T && Math.abs(dy) < T) return;
    eng.current?.input(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy < 0 ? 'jump' : 'slide'));
    sw.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onUp = () => { sw.current = null; };

  const exit = (e: React.MouseEvent<HTMLElement>) => { eng.current?.pause(); leave(e); };
  const style = { '--ox': origin.x, '--oy': origin.y } as CSSProperties;
  const hint = coarse() ? 'Swipe ← → to switch lanes · ↑ jump · ↓ slide' : '← → switch lane  ·  ↑ jump  ·  ↓ slide';

  return createPortal(
    <div ref={root} className={`dd ${phase} s-${state}`} style={style} role="region" aria-label="Design Dash — endless runner game">
      <div className="dd-inner">
        <div ref={host} className="dd-stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden="true" />
        <div className="dd-flash" aria-hidden="true" />

        {fail ? (
          <div className="dd-card" role="alert"><h2>Can’t run 3D here</h2><p>This device or browser has no WebGL, so the game can’t start.</p><button type="button" className="dd-btn" onClick={exit}>Go to portfolio →</button></div>
        ) : (<>
          <header className="dd-hud">
            <button type="button" className="dd-pill dd-exit" onClick={exit} data-cursor="Exit"><ArrowLeft size={15} aria-hidden="true" /><span>Portfolio</span></button>
            <p className="dd-score" aria-live="off"><b ref={scoreEl}>0</b><small>score</small></p>
            <div className="dd-right">
              <p className="dd-items" aria-label="Collected items"><i aria-hidden="true" /><b ref={itemsEl}>0</b></p>
              <button type="button" className="dd-round" onClick={() => { setMuted(!isMuted()); setMute(isMuted()); }} aria-label={muted ? 'Unmute sound' : 'Mute sound'}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
              <button type="button" className="dd-round" onClick={togglePause} aria-label={state === 'paused' ? 'Resume' : 'Pause'} disabled={state !== 'playing' && state !== 'paused'}>{state === 'paused' ? <Play size={17} /> : <Pause size={17} />}</button>
            </div>
          </header>

          {state === 'ready' && (
            <div className="dd-start">
              <h1>Design <em>Dash</em></h1>
              <p className="dd-tag">The client is chasing!</p>
              <button type="button" className="dd-btn big" onClick={play} data-cursor="Play">PLAY</button>
              <p className="dd-hint">{hint}</p>
            </div>
          )}
          {state === 'paused' && (
            <div className="dd-card" role="dialog" aria-label="Paused"><h2>Paused</h2><button type="button" className="dd-btn" onClick={togglePause}>Resume</button><button type="button" className="dd-link" onClick={exit}>Exit to portfolio →</button></div>
          )}
          {state === 'over' && (
            <div className="dd-card over" role="dialog" aria-label="Game over">
              <p className="dd-over-k">Caught!</p>
              <p className="dd-final"><b>{final.score}</b><small>{final.record ? 'new best!' : `best ${best}`}</small></p>
              <p className="dd-over-i">{final.items} items collected</p>
              <button type="button" className="dd-btn big" onClick={play} autoFocus>REPLAY</button>
              <button type="button" className="dd-link" onClick={exit}>Exit to portfolio →</button>
            </div>
          )}
        </>)}
      </div>
      <div className="dd-wipe" aria-hidden="true" />
      <p className="sr-only" role="status" aria-live="polite">{state === 'over' ? `Caught! Score ${final.score}.` : state === 'paused' ? 'Paused' : ''}</p>
    </div>,
    document.body,
  );
}
