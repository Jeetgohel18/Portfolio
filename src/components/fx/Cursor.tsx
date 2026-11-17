import { useEffect, useRef } from 'react';

/**
 * Context-aware cursor follower. Only active for fine pointers without reduced motion.
 * Native cursor stays everywhere except elements marked data-cursor="Label" (e.g. project previews, the sun),
 * where a labelled bubble replaces it. Links/buttons get a subtle ring.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = dot.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('has-cursor');
    let x = -100, y = -100, cx = -100, cy = -100, raf = 0, visible = false;
    const label = el.querySelector('span') as HTMLSpanElement;
    const tick = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!visible) { visible = true; cx = x; cy = y; el.classList.add('on'); }
      const t = (e.target as Element | null);
      const tagged = t?.closest?.('[data-cursor]') as HTMLElement | null;
      const link = t?.closest?.('a, button, [role="slider"], [role="radio"], input, textarea, label');
      const text = tagged?.dataset.cursor ?? '';
      if (label.textContent !== text) label.textContent = text;
      el.classList.toggle('label', !!tagged);
      el.classList.toggle('link', !tagged && !!link);
      el.classList.toggle('down', false);
    };
    const leave = () => { visible = false; el.classList.remove('on'); };
    const down = () => el.classList.add('down');
    const up = () => el.classList.remove('down');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up);
    };
  }, []);
  return <div ref={dot} className="cursor" aria-hidden="true"><i /><span /></div>;
}
