import type { CSSProperties, ReactNode } from 'react';
import { burst } from './burst';

/**
 * Lightweight CSS-only 3D objects (no WebGL, no images). Decorative: aria-hidden unless `interactive`.
 * Position/size via props → CSS vars; pointer parallax via <PointerParallax> ancestor (--px/--py) and `depth`.
 */
export type Tone = 'coral' | 'cobalt' | 'butter' | 'lavender' | 'mint' | 'ink' | 'metal' | 'paper';
export type Kind = 'sphere' | 'cube' | 'torus' | 'capsule' | 'spark' | 'pencil' | 'squiggle' | 'cone' | 'plane';

type Props = {
  kind: Kind;
  tone?: Tone;
  size?: number;            // px; scales the whole object
  depth?: number;           // pointer-parallax strength
  float?: number;           // bob duration (s); 0 = static
  spin?: boolean;           // continuous rotation (cube, torus, spark)
  rot?: number;             // static tilt in degrees
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;    // spark: click for confetti
  label?: string;
};

export function Obj3D({ kind, tone = 'coral', size = 80, depth = 14, float = 7, spin = false, rot = 0, className = '', style, interactive = false, label = 'Pop' }: Props) {
  const vars = { '--sz': `${size}px`, '--depth': depth, '--fl': `${float}s`, '--rot': `${rot}deg`, ...style } as CSSProperties;
  const cls = `obj3 o-${kind} t-${tone} ${spin ? 'spin' : ''} ${float ? 'float' : ''} ${className}`;
  let inner: ReactNode;
  switch (kind) {
    case 'cube':
      inner = <span className="cube">{['f', 'b', 'r', 'l', 't', 'u'].map((f) => <i key={f} className={`face ${f}`} />)}</span>;
      break;
    case 'spark':
      inner = <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 2 C55 32 68 45 98 50 C68 55 55 68 50 98 C45 68 32 55 2 50 C32 45 45 32 50 2Z" /></svg>;
      break;
    case 'pencil':
      inner = <span className="pen"><i className="pe-er" /><i className="pe-fe" /><i className="pe-bd" /><i className="pe-tp" /></span>;
      break;
    case 'plane':
      inner = <svg viewBox="0 0 100 80" aria-hidden="true"><path className="p1" d="M2 36 L98 4 L62 76 L46 48Z" /><path className="p2" d="M98 4 L46 48 L40 70 L52 52Z" /><path className="p3" d="M2 36 L46 48 L98 4Z" /></svg>;
      break;
    case 'squiggle':
      inner = <svg viewBox="0 0 120 24" aria-hidden="true"><path d="M3 12 Q13 0 23 12 T43 12 T63 12 T83 12 T103 12 T117 12" /></svg>;
      break;
    default:
      inner = <span className="body" />;
  }
  if (interactive) {
    return (
      <button type="button" className={`${cls} is-interactive`} style={vars} aria-label={label} data-cursor="Pop"
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); }}>
        <span className="ob">{inner}</span>
      </button>
    );
  }
  return <div className={cls} style={vars} aria-hidden="true"><span className="ob">{inner}</span></div>;
}

/** Inflated, balloon-like type. Decorative glyphs only (use aria-label on the parent if it carries meaning). */
export function Inflated({ children, tone = 'coral', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`inflated t-${tone} ${className}`} aria-hidden="true">{children}</span>;
}
