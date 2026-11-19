import type { CSSProperties } from 'react';
import { useCopy } from './useCopy';

export type Found = { hex: string; name: string; a?: { hex: string; name: string }; b?: { hex: string; name: string } };

/** Compact strip of every shade found this session. Select one to bring it back onto the stage; copy its HEX. */
export function DiscoveredColours({ found, activeHex, onPick }: { found: Found[]; activeHex?: string; onPick: (hex: string) => void }) {
  const { copied, copy } = useCopy();
  return (
    <section className="pg-found" aria-label="Discovered colours">
      <h2 className="pg-found-h"><span>Shades discovered</span><b aria-live="polite">{found.length}</b></h2>
      {found.length === 0 ? (
        <p className="pg-found-empty">Nothing yet — go on, mix something.</p>
      ) : (
        <ul className="pg-found-list">
          {found.map((f) => (
            <li key={f.hex} className={f.hex === activeHex ? 'on' : ''}>
              <button type="button" className="pg-dot" style={{ '--c': f.hex } as CSSProperties} onClick={() => onPick(f.hex)} aria-label={`${f.name}, ${f.hex.toUpperCase()}. Put it back on the stage`} title={`${f.name} ${f.hex.toUpperCase()}`} />
              <button type="button" className="pg-dot-copy" onClick={() => copy(f.hex.toUpperCase())} aria-label={`Copy ${f.hex.toUpperCase()}`}>{copied === f.hex.toUpperCase() ? '✓' : f.hex.slice(1, 7).toUpperCase()}</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
