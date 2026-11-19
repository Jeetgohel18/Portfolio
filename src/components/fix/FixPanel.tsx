import { Eye, EyeOff, Redo2, RotateCcw, Rows3, Timer, Undo2, MessageCircle } from 'lucide-react';
import type { CSSProperties } from 'react';
import { FIX_PALETTES } from '../../lib/fix/palettes';
import type { Challenge, FixPalette } from '../../lib/fix/types';

type Props = {
  ch: Challenge; total: number; tip: string; palette: FixPalette; bg: string;
  canUndo: boolean; canRedo: boolean; guides: boolean; timerOn: boolean; left: number;
  onUndo: () => void; onRedo: () => void; onReset: () => void; onGuides: () => void; onTimer: () => void; onEven: () => void;
  onPalette: (id: string) => void; onBg: (hex: string) => void; onCheck: () => void;
};
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Brief, playful hint, and only the controls this challenge needs. */
export function FixPanel({ ch, total, tip, palette, bg, canUndo, canRedo, guides, timerOn, left, onUndo, onRedo, onReset, onGuides, onTimer, onEven, onPalette, onBg, onCheck }: Props) {
  const bgs = [...new Set([palette.bg, ...palette.colours, '#fffaf1', '#1e1416'])];
  return (
    <aside className="fg-panel" aria-label="Challenge controls">
      <div className="fg-brief">
        <p className="fg-eyebrow">Challenge {String(ch.n).padStart(2, '0')} of {String(total).padStart(2, '0')}</p>
        <h2>{ch.name}</h2>
        <p className="fg-objective">{ch.objective}</p>
        <p className="fg-blurb">{ch.blurb}</p>
      </div>
      <p className="fg-hint" role="status" aria-live="polite"><MessageCircle size={15} aria-hidden="true" /><span>{tip}</span></p>

      <div className="fg-controls" role="group" aria-label="Edit controls">
        <button type="button" className="fg-ctl" onClick={onUndo} disabled={!canUndo} aria-label="Undo"><Undo2 size={17} /></button>
        <button type="button" className="fg-ctl" onClick={onRedo} disabled={!canRedo} aria-label="Redo"><Redo2 size={17} /></button>
        <button type="button" className="fg-ctl" onClick={onReset} aria-label="Reset challenge"><RotateCcw size={17} /></button>
        <button type="button" className={`fg-ctl wide ${guides ? 'on' : ''}`} onClick={onGuides} aria-pressed={guides} aria-label="Alignment guides">{guides ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}<span>Guides</span></button>
        {ch.tools.spacing && <button type="button" className="fg-ctl wide" onClick={onEven} aria-label="Even out spacing"><Rows3 size={16} aria-hidden="true" /><span>Even out spacing</span></button>}
        <button type="button" className={`fg-ctl wide ${timerOn ? 'on' : ''}`} onClick={onTimer} aria-pressed={timerOn} aria-label="Countdown timer"><Timer size={16} aria-hidden="true" /><span>{timerOn ? mmss(left) : 'Timer'}</span></button>
      </div>

      {ch.tools.colour && (
        <div className="fg-colours">
          <p className="fg-label">Palettes</p>
          <ul className="fg-pals">
            {FIX_PALETTES.map((p) => (
              <li key={p.id}><button type="button" className={`fg-pal ${p.id === palette.id ? 'on' : ''}`} onClick={() => onPalette(p.id)} aria-pressed={p.id === palette.id} aria-label={`Apply palette ${p.name}`}>
                <span className="fg-pal-sw" style={{ background: p.bg }}>{p.colours.slice(0, 4).map((c) => <i key={c} style={{ background: c }} />)}</span><span>{p.name}</span>
              </button></li>
            ))}
          </ul>
          <p className="fg-label">Background</p>
          <div className="fg-bgs">{bgs.map((c) => <button key={c} type="button" className={`fg-sw ${c.toLowerCase() === bg.toLowerCase() ? 'on' : ''}`} style={{ background: c } as CSSProperties} aria-label={`Background ${c.toUpperCase()}`} onClick={() => onBg(c)} />)}</div>
        </div>
      )}
      <button type="button" className="fg-check" onClick={onCheck}>Check my design</button>
    </aside>
  );
}
