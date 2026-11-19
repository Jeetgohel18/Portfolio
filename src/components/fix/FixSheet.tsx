import { memo, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { svgMarkup } from '../../lib/art/shapes';
import { displayText, lineHeight } from '../../lib/fix/measure';
import { CANVAS_H } from '../../lib/fix/types';
import type { ArtEl, Doc, El, ShapeEl, TextEl } from '../../lib/fix/types';

/** Renders a design. Every size is a multiple of `--cw` (the sheet's pixel width), so it scales perfectly. */
const cw = (v: number) => `calc(var(--cw) * ${+v.toFixed(4)})`;

const TextItem = memo(function TextItem({ e, selected }: { e: TextEl; selected: boolean }) {
  const pad = e.pill ? e.size * 0.5 : 0, tx = e.align === 'center' ? '-50%' : e.align === 'right' ? '-100%' : '0';
  const origin = e.align === 'center' ? 'center top' : e.align === 'right' ? 'right top' : 'left top';
  const style: CSSProperties = { left: cw(e.x), top: cw(e.y), transform: `translateX(${tx}) rotate(${e.rot}deg)`, transformOrigin: origin, marginLeft: e.align === 'left' ? cw(-pad) : e.align === 'right' ? cw(pad) : 0, marginTop: cw(-pad * 0.45) };
  const inner: CSSProperties = { fontSize: cw(e.size), lineHeight: lineHeight(e), color: e.color, textAlign: e.align, background: e.pill, padding: e.pill ? `${cw(pad * 0.45)} ${cw(pad)}` : undefined, borderRadius: e.pill ? '999px' : undefined };
  return (
    <div className={`fg-el fg-text ${selected ? 'is-selected' : ''}`} data-el data-id={e.id} style={style} role="button" tabIndex={0} aria-label={`Text: ${e.text.replace(/\n/g, ' ')}`} aria-pressed={selected}>
      <span className={`fg-t f-${e.font}`} style={inner}>{displayText(e)}</span>
      {selected && <i className="fg-h" data-h="size" aria-hidden="true" />}
    </div>
  );
});

const ShapeItem = memo(function ShapeItem({ e, selected }: { e: ShapeEl; selected: boolean }) {
  const style: CSSProperties = { left: cw(e.x), top: cw(e.y), width: cw(e.w), height: cw(e.h), transform: `translate(-50%,-50%) rotate(${e.rot}deg)` };
  const label = e.role === 'deco' ? 'Decoration' : 'Shape';
  return (
    <div className={`fg-el fg-shape ${selected ? 'is-selected' : ''}`} data-el data-id={e.id} style={style} role="button" tabIndex={0} aria-label={label} aria-pressed={selected}>
      {e.shape === 'squiggle'
        ? <svg viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12 Q13 0 23 12 T43 12 T63 12 T83 12 T103 12 T117 12" fill="none" stroke={e.color} strokeWidth="5" strokeLinecap="round" /></svg>
        : <span className={`fg-fill s-${e.shape}`} style={{ background: e.color }} />}
      {selected && <i className="fg-h" data-h="size" aria-hidden="true" />}
    </div>
  );
});

const ArtItem = memo(function ArtItem({ e, selected }: { e: ArtEl; selected: boolean }) {
  const m = useMemo(() => svgMarkup(e.id, { kind: e.art, c: e.c, c2: e.c2, mat: e.mat }), [e.id, e.art, e.c, e.c2, e.mat]);
  const style: CSSProperties = { left: cw(e.x), top: cw(e.y), width: cw(e.s * m.aspect), height: cw(e.s), transform: `translate(-50%,-50%) rotate(${e.rot}deg)` };
  return (
    <div className={`fg-el fg-art ${selected ? 'is-selected' : ''}`} data-el data-id={e.id} style={style} role="button" tabIndex={0} aria-label={e.role === 'deco' ? 'Decoration' : `Illustration: ${e.art}`} aria-pressed={selected}>
      <span className="fg-art-in" dangerouslySetInnerHTML={{ __html: m.svg }} />
      {selected && <i className="fg-h" data-h="size" aria-hidden="true" />}
    </div>
  );
});

export const renderEl = (e: El, selected: boolean) => e.kind === 'text' ? <TextItem key={e.id} e={e} selected={selected} /> : e.kind === 'shape' ? <ShapeItem key={e.id} e={e} selected={selected} /> : <ArtItem key={e.id} e={e} selected={selected} />;

type Props = HTMLAttributes<HTMLDivElement> & { doc: Doc; selectedId?: string | null; children?: ReactNode; sheetRef?: Ref<HTMLDivElement>; className?: string };
export function FixSheet({ doc, selectedId = null, children, sheetRef, className = '', style, ...rest }: Props) {
  const inner = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = inner.current; if (!el) return;
    const set = () => el.style.setProperty('--cw', `${el.getBoundingClientRect().width}px`);
    set(); const ro = new ResizeObserver(set); ro.observe(el); return () => ro.disconnect();
  }, []);
  return (
    <div {...rest} ref={(el) => { inner.current = el; if (typeof sheetRef === 'function') sheetRef(el); else if (sheetRef) (sheetRef as { current: HTMLDivElement | null }).current = el; }}
      className={`fg-sheet ${className}`} style={{ background: doc.bg, aspectRatio: `1 / ${CANVAS_H}`, ...style }}>
      {doc.els.map((e) => renderEl(e, e.id === selectedId))}
      {children}
    </div>
  );
}
