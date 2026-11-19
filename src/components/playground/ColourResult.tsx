import type { CSSProperties } from 'react';
import { onColour } from '../../lib/colour';
import { useCopy } from './useCopy';

export type Focus = { hex: string; name: string; a?: { hex: string; name: string }; b?: { hex: string; name: string }; fresh: boolean; key: number };

/** The "what did I just make" card: swatch, playful name, equation, HEX and a working copy button. */
export function ColourResult({ focus, onExplore }: { focus: Focus | null; onExplore: () => void }) {
  const { copied, copy } = useCopy();
  if (!focus) {
    return (
      <div className="pg-result is-empty">
        <span className="pg-swatch" aria-hidden="true" />
        <div><p className="pg-r-name">Your first shade appears here</p><p className="pg-r-eq">Mix two colours to begin.</p></div>
      </div>
    );
  }
  const ok = copied === focus.hex;
  return (
    <div className="pg-result" key={focus.key} style={{ '--c': focus.hex, '--on': onColour(focus.hex) } as CSSProperties}>
      <span className="pg-swatch" aria-hidden="true"><i /></span>
      <div className="pg-r-body">
        <p className="pg-r-eyebrow">{focus.fresh ? 'New shade discovered!' : 'In your collection'}</p>
        <p className="pg-r-name">{focus.name}</p>
        {focus.a && focus.b && <p className="pg-r-eq"><b style={{ '--c': focus.a.hex } as CSSProperties} />{focus.a.name} + <b style={{ '--c': focus.b.hex } as CSSProperties} />{focus.b.name}</p>}
        <div className="pg-r-row">
          <code className="pg-hex">{focus.hex.toUpperCase()}</code>
          <button type="button" className="pg-chip-btn" onClick={() => copy(focus.hex.toUpperCase())} aria-label={`Copy ${focus.hex.toUpperCase()} to clipboard`}>{ok ? 'Copied ✓' : 'Copy HEX'}</button>
        </div>
      </div>
      <button type="button" className="pg-explore" onClick={onExplore}>Explore My Portfolio <span aria-hidden="true">→</span></button>
    </div>
  );
}
