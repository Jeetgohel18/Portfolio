import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { lockScroll } from '../../lib/scrollLock';
import '../../styles/playground.css';

/** Shared full-screen overlay behaviour: scroll lock + inert page, and the colour-wipe → iris exit into the portfolio. */
export function usePrefersReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const f = () => setR(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, []);
  return r;
}

export function useOverlay(onReveal: () => void, onDone: () => void) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<'play' | 'leaving' | 'out'>('play');
  const [origin, setOrigin] = useState({ x: '92%', y: '40px' });
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const app = document.getElementById('root'); const unlock = lockScroll(); app?.setAttribute('inert', '');
    return () => { unlock(); app?.removeAttribute('inert'); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => { if (phase === 'out') document.getElementById('root')?.removeAttribute('inert'); }, [phase]);
  const leave = useCallback((e?: MouseEvent<HTMLElement>) => {
    if (phase !== 'play') return;
    if (e) { const r = e.currentTarget.getBoundingClientRect(); setOrigin({ x: `${Math.round(r.left + r.width / 2)}px`, y: `${Math.round(r.top + r.height / 2)}px` }); }
    if (reduced) { onReveal(); onDone(); return; }
    setPhase('leaving');
    timers.current.push(window.setTimeout(() => { onReveal(); setPhase('out'); }, 640), window.setTimeout(onDone, 1400));
  }, [phase, reduced, onReveal, onDone]);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
  return { phase, origin, leave, reduced, later };
}
