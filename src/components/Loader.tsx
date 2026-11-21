import { useEffect, useState } from 'react';
import { personal } from '../data/personal';

const KEY = 'jg-loaded';

/** Short name-reveal loader. Waits for fonts, shows once per session, never longer than ~2.4s. */
export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let skip = false;
    try { skip = sessionStorage.getItem(KEY) === '1'; } catch { /* storage unavailable */ }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skip) { onDone(); return; }
    const min = reduced ? 300 : 1500;
    const start = performance.now();
    let raf = 0;
    let ready = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const cap = window.setTimeout(() => { ready = true; }, 2400);
    (fonts?.ready ?? Promise.resolve()).then(() => { ready = true; });
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / min);
      const shown = ready ? p : Math.min(p, 0.9);
      setPct(Math.round(shown * 100));
      if (ready && p >= 1) {
        setLeaving(true);
        try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
        window.setTimeout(onDone, reduced ? 0 : 750);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(cap); };
  }, [onDone]);

  return (
    <div className={`loader ${leaving ? 'leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading portfolio">
      <div className="loader-name" aria-hidden="true">
        {personal.name.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 45}ms` }}>{c === ' ' ? ' ' : c}</span>
        ))}
      </div>
      <div className="loader-meta" aria-hidden="true">
        <span>{personal.roles[0]}</span>
        <span className="loader-pct">{String(pct).padStart(3, '0')}</span>
      </div>
      <div className="loader-line" aria-hidden="true"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
    </div>
  );
}
