import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft } from 'lucide-react';
import { CHALLENGES } from '../../lib/fix/challenges';
import { applyPalette, evenSpacing } from '../../lib/fix/ops';
import { FIX_PALETTES } from '../../lib/fix/palettes';
import { feedback, nextTip, scoreDesign, stars as starsOf } from '../../lib/fix/scoring';
import type { Result } from '../../lib/fix/scoring';
import type { Doc } from '../../lib/fix/types';
import { burst } from '../fx/burst';
import { useOverlay } from '../playground/useOverlay';
import { FixCanvas } from './FixCanvas';
import { FixPanel } from './FixPanel';
import { FixResults } from './FixResults';
import '../../styles/fixgame.css';

type Props = { onReveal: () => void; onDone: () => void; onBack: (e?: MouseEvent<HTMLElement>) => void };
type Hist = { past: Doc[]; present: Doc; future: Doc[] };
const fresh = (): Hist[] => CHALLENGES.map((c) => ({ past: [], present: c.initial, future: [] }));

export default function FixThisDesign({ onReveal, onDone, onBack }: Props) {
  const { phase, origin, leave, reduced, later } = useOverlay(onReveal, onDone);
  const [ci, setCi] = useState(0);
  const [hists, setHists] = useState<Hist[]>(fresh);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteId, setPaletteId] = useState<string>('sunset-club');
  const [guides, setGuides] = useState(true);
  const [timer, setTimer] = useState({ on: false, left: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [starsBy, setStarsBy] = useState<number[]>([0, 0, 0]);
  const ch = CHALLENGES[ci], hist = hists[ci], doc = hist.present;
  const palette = FIX_PALETTES.find((p) => p.id === paletteId) ?? FIX_PALETTES[0];
  const live = useRef({ doc, ci }); live.current = { doc, ci };

  const commit = useCallback((d: Doc) => setHists((hs) => hs.map((h, i) => (i === live.current.ci && h.present !== d ? { past: [...h.past.slice(-59), h.present], present: d, future: [] } : h))), []);
  const undo = useCallback(() => setHists((hs) => hs.map((h, i) => (i === live.current.ci && h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h))), []);
  const redo = useCallback(() => setHists((hs) => hs.map((h, i) => (i === live.current.ci && h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h))), []);
  const reset = useCallback(() => { commit(CHALLENGES[live.current.ci].initial); setSelectedId(null); setResult(null); setTimer((t) => ({ ...t, left: CHALLENGES[live.current.ci].seconds })); }, [commit]);

  const check = useCallback(() => {
    const { doc: d, ci: i } = live.current, r = scoreDesign(d, CHALLENGES[i]);
    setResult(r); setSelectedId(null); setTimer((t) => ({ ...t, on: false }));
    setStarsBy((s) => s.map((v, k) => (k === i ? Math.max(v, starsOf(r.total)) : v)));
    later(() => { if (r.total >= 75) burst(window.innerWidth / 2, window.innerHeight * 0.3, 26); }, 250);
  }, [later]);

  // optional countdown; at zero the design is checked automatically
  useEffect(() => {
    if (!timer.on || result) return;
    const id = window.setInterval(() => setTimer((t) => (t.left <= 1 ? { on: false, left: 0 } : { ...t, left: t.left - 1 })), 1000);
    return () => clearInterval(id);
  }, [timer.on, result]);
  useEffect(() => { if (!timer.on && timer.left === 0 && result === null && timerStarted.current) { timerStarted.current = false; check(); } }, [timer, result, check]);
  const timerStarted = useRef(false);

  const go = (i: number) => { setCi(i); setSelectedId(null); setResult(null); setTimer({ on: false, left: 0 }); };
  const tip = useMemo(() => nextTip(scoreDesign(doc, ch)), [doc, ch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const style = { '--tint': doc.bg, '--ox': origin.x, '--oy': origin.y } as CSSProperties;
  return createPortal(
    <div className={`pg fg ${phase}`} style={style} role="region" aria-label="Fix This Design — a visual design challenge">
      <div className="pg-inner fg-inner">
        <header className="pg-head fg-head">
          <div className="fg-head-l">
            <button type="button" className="fg-back" onClick={onBack} aria-label="Back to game selection"><ArrowLeft size={16} aria-hidden="true" /><span>Games</span></button>
            <p className="pg-brand"><i aria-hidden="true" />Fix This Design</p>
          </div>
          <ol className="fg-pips" aria-label="Challenges">
            {CHALLENGES.map((c, i) => (
              <li key={c.id}><button type="button" className={`fg-pip ${i === ci ? 'on' : ''}`} onClick={() => go(i)} aria-current={i === ci ? 'step' : undefined} aria-label={`Challenge ${c.n}: ${c.name}${starsBy[i] ? `, ${starsBy[i]} stars` : ''}`}>
                <b>{c.n}</b><span className="fg-pip-name">{c.name.replace('The ', '')}</span><span className="fg-pip-stars" aria-hidden="true">{[0, 1, 2].map((k) => <i key={k} className={k < starsBy[i] ? 'on' : ''} />)}</span>
              </button></li>
            ))}
          </ol>
          <button type="button" className="btn-solid pg-skip" onClick={leave} data-cursor="Enter">Skip to Portfolio <span aria-hidden="true">→</span></button>
        </header>

        <div className="fg-main">
          <div className="fg-stage">
            <FixCanvas key={ch.id} doc={doc} tools={ch.tools} palette={palette} guides={guides} selectedId={selectedId} onSelect={setSelectedId} onCommit={commit} />
          </div>
          <FixPanel ch={ch} total={CHALLENGES.length} tip={tip} palette={palette} bg={doc.bg}
            canUndo={hist.past.length > 0} canRedo={hist.future.length > 0} guides={guides} timerOn={timer.on} left={timer.left || ch.seconds}
            onUndo={undo} onRedo={redo} onReset={reset} onGuides={() => setGuides((g) => !g)}
            onTimer={() => setTimer((t) => { timerStarted.current = !t.on; return t.on ? { on: false, left: 0 } : { on: true, left: ch.seconds }; })}
            onEven={() => commit(evenSpacing(doc))}
            onPalette={(id) => { setPaletteId(id); commit(applyPalette(doc, FIX_PALETTES.find((p) => p.id === id)!)); }}
            onBg={(hex) => commit({ ...doc, bg: hex })} onCheck={check} />
        </div>

        {result && (
          <FixResults ch={ch} doc={doc} result={result} stars={starsOf(result.total)} hasNext={ci < CHALLENGES.length - 1} reduced={reduced}
            onTry={() => { setResult(null); }} onNext={() => go(ci + 1)} onGames={() => onBack()} onEnter={() => leave()} />
        )}
        <p className="sr-only" role="status" aria-live="polite">{result ? `Score ${result.total} out of 100. ${feedback(result.total)}` : ''}</p>
      </div>
      <div className="pg-wipe" aria-hidden="true" />
    </div>,
    document.body,
  );
}
