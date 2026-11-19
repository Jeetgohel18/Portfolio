import { Shuffle } from 'lucide-react';
import { PALETTES } from '../../lib/art/palettes';
import type { Palette } from '../../lib/art/palettes';
import { useCopy } from './useCopy';

type Props = { palette: Palette; bg: string; onPalette: (id: string) => void; onBg: (hex: string) => void; onRandomise: () => void };

/** Curated palettes, background colour, randomise, and HEX copy. */
export function ColourStudio({ palette, bg, onPalette, onBg, onRandomise }: Props) {
  const { copied, copy } = useCopy();
  const bgChoices = [...new Set([...palette.bgs, ...palette.colours, '#fffaf1', '#1e1416'])];
  return (
    <div className="pg-studio" role="dialog" aria-label="Colour studio" onPointerDown={(e) => e.stopPropagation()}>
      <div className="pg-studio-head"><h2>Colour studio</h2>
        <button type="button" className="pg-mini" onClick={onRandomise}><Shuffle size={14} aria-hidden="true" /> Randomise</button></div>
      <ul className="pg-pals">
        {PALETTES.map((p) => (
          <li key={p.id}>
            <button type="button" className={`pg-pal ${p.id === palette.id ? 'on' : ''}`} onClick={() => onPalette(p.id)} aria-pressed={p.id === palette.id} aria-label={`Apply palette ${p.name}`}>
              <span className="pg-pal-sw">{p.colours.map((c) => <i key={c} style={{ background: c }} />)}</span>
              <span className="pg-pal-name">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="pg-studio-label">Background</p>
      <div className="pg-bgs">
        {bgChoices.map((c) => <button key={c} type="button" className={`pg-sw ${c.toLowerCase() === bg.toLowerCase() ? 'on' : ''}`} style={{ background: c }} onClick={() => onBg(c)} aria-label={`Background ${c.toUpperCase()}`} />)}
        <code className="pg-hex">{bg.toUpperCase()}</code>
        <button type="button" className="pg-copy" onClick={() => copy(bg.toUpperCase())} aria-label={`Copy background ${bg.toUpperCase()}`}>{copied === bg.toUpperCase() ? 'Copied ✓' : 'Copy'}</button>
      </div>
    </div>
  );
}
