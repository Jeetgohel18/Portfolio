import { createElement, useEffect, useState, type CSSProperties, type ElementType } from 'react';
import { useInView } from '../../hooks/useInView';

/**
 * Animated headline. Inline markup:  *emphasis*  → light/wide <em>,  ==highlight==  → butter marker.
 * Reveals by character (`by="char"`) or word (`by="word"`) when scrolled into view (or when `active` flips true).
 * Screen readers get the plain text via a visually-hidden copy; the animated spans are aria-hidden.
 */
type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  by?: 'char' | 'word';
  stagger?: number;      // ms between units
  delay?: number;        // ms before first unit
  hover?: boolean;       // letters react to the pointer (char mode)
  active?: boolean;      // controlled trigger (e.g. after the loader); omit to trigger on scroll
  id?: string;
};

type Tok = { kind: 'text' | 'em' | 'mark'; value: string };
const parse = (s: string): Tok[] =>
  s.split(/(\*[^*]+\*|==[^=]+==)/).filter(Boolean).map((p) =>
    p.startsWith('*') ? { kind: 'em', value: p.slice(1, -1) } : p.startsWith('==') ? { kind: 'mark', value: p.slice(2, -2) } : { kind: 'text', value: p });

export function SplitText({ text, as: Tag = 'span', className = '', by = 'word', stagger, delay = 0, hover = false, active, id }: Props) {
  const [ref, seen] = useInView<HTMLElement>('0px 0px -8% 0px');
  const [on, setOn] = useState(false);
  useEffect(() => { if (active === undefined ? seen : active) setOn(true); }, [seen, active]);
  const toks = parse(text);
  // cap the total stagger so long headlines never take more than ~0.9s to finish
  const units = toks.reduce((a, t) => a + (by === 'word' ? t.value.split(/\s+/).filter(Boolean).length : t.value.replace(/\s+/g, '').length), 0);
  const step = Math.min(stagger ?? (by === 'char' ? 24 : 70), 900 / Math.max(units, 1));
  let n = 0;
  const visual = toks.map((t, ti) => {
    const words = t.value.split(/(\s+)/);
    const inner = words.map((w, wi) => {
      if (/^\s+$/.test(w) || w === '') return w ? ' ' : null;
      const i = n++;
      if (by === 'word') {
        return <span key={wi} className="w"><span className="u" style={{ '--i': i } as CSSProperties}>{w}</span></span>;
      }
      return (
        <span key={wi} className="w">
          {Array.from(w).map((c, ci) => <span key={ci} className="u ch" style={{ '--i': n++ } as CSSProperties}>{c}</span>)}
        </span>
      );
    });
    if (t.kind === 'em') return <em key={ti}>{inner}</em>;
    if (t.kind === 'mark') return <span key={ti} className="mark">{inner}</span>;
    return <span key={ti}>{inner}</span>;
  });
  const plain = toks.map((t) => t.value).join('');
  return createElement(
    Tag,
    { ref, id, className: `st ${by} ${hover ? 'hv' : ''} ${on ? 'in' : ''} ${className}`, style: { '--step': `${step}ms`, '--d0': `${delay}ms` } as CSSProperties },
    <span className="sr-only">{plain}</span>,
    <span aria-hidden="true">{visual}</span>,
  );
}
