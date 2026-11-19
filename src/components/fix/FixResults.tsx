import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { CAT_LABEL, CATEGORIES } from '../../lib/fix/types';
import type { Challenge, Doc } from '../../lib/fix/types';
import { feedback } from '../../lib/fix/scoring';
import type { Result } from '../../lib/fix/scoring';
import { FixSheet } from './FixSheet';

type Props = {
  ch: Challenge; doc: Doc; result: Result; stars: number; hasNext: boolean; reduced: boolean;
  onTry: () => void; onNext: () => void; onGames: () => void; onEnter: () => void;
};

/** Score, category breakdown, and a Before / Yours / Reference comparison. */
export function FixResults({ ch, doc, result, stars, hasNext, reduced, onTry, onNext, onGames, onEnter }: Props) {
  const [view, setView] = useState<'compare' | 'before' | 'yours' | 'reference'>('compare');
  const [pos, setPos] = useState(50);
  const [shown, setShown] = useState(reduced ? result.total : 0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => {                                   // count the score up
    if (reduced) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / 900); setShown(Math.round(result.total * (1 - (1 - k) ** 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [result.total, reduced]);
  const wsum = CATEGORIES.reduce((a, c) => a + ch.weights[c], 0);
  return (
    <div className="fg-results" role="dialog" aria-modal="false" aria-label="Your results" tabIndex={-1} ref={ref}>
      <div className="fg-res-left">
        <p className="fg-eyebrow">{ch.name} — results</p>
        <h2 className="fg-verdict">{feedback(result.total)}</h2>
        <div className="fg-score" aria-label={`Score ${result.total} out of 100`}>
          <b>{shown}</b><span>/100</span>
          <span className="fg-stars" aria-label={`${stars} of 3 stars`}>{[0, 1, 2].map((i) => <i key={i} className={i < stars ? 'on' : ''} style={{ '--i': i } as CSSProperties} />)}</span>
        </div>
        <ul className="fg-cats">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <div className="fg-cat-h"><span>{CAT_LABEL[c]}</span><b>{result.cats[c].score}</b><small>{Math.round((ch.weights[c] / wsum) * 100)}% of total</small></div>
              <div className="fg-bar"><i style={{ width: `${result.cats[c].score}%` }} /></div>
              <p>{result.cats[c].note}</p>
            </li>
          ))}
        </ul>
        <p className="fg-fine">A fun, transparent score — it measures alignment, spacing, size contrast, colour and balance from your layout. It is not a professional verdict.</p>
      </div>

      <div className="fg-res-right">
        <div className="fg-seg" role="tablist" aria-label="Compare">
          {(['compare', 'before', 'yours', 'reference'] as const).map((v) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v === 'compare' ? 'Slide to compare' : v === 'before' ? 'Before' : v === 'yours' ? 'Yours' : 'Reference'}</button>
          ))}
        </div>
        <div className="fg-compare">
          {view === 'compare' ? (
            <div className="fg-cmp" style={{ '--p': `${pos}%` } as CSSProperties}>
              <FixSheet doc={ch.reference} className="fg-static" />
              <div className="fg-cmp-top"><FixSheet doc={doc} className="fg-static" /></div>
              <i className="fg-cmp-line" aria-hidden="true"><b>⇄</b></i>
              <span className="fg-cmp-tag l">Yours</span><span className="fg-cmp-tag r">Reference</span>
              <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Reveal: drag to compare your design with the reference" />
            </div>
          ) : <FixSheet doc={view === 'before' ? ch.initial : view === 'yours' ? doc : ch.reference} className="fg-static" />}
        </div>
        <p className="fg-fine">The reference is one art-directed solution. Good design has many right answers.</p>
      </div>

      <div className="fg-res-actions">
        <button type="button" className="fg-btn" onClick={onTry}>Try again</button>
        <button type="button" className="fg-btn primary" onClick={onNext} disabled={!hasNext}>{hasNext ? 'Next challenge →' : 'That was the last one'}</button>
        <button type="button" className="fg-btn" onClick={onGames}>Choose another game</button>
        <button type="button" className="fg-btn dark" onClick={onEnter}>Enter portfolio →</button>
      </div>
    </div>
  );
}
