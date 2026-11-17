import { useEffect, useRef, type ReactNode } from 'react';

const fine = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Pulls its child toward the pointer when close. No-op on touch devices and with reduced motion. */
export function Magnetic({ children, strength = 0.3, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine() || calm()) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // only react inside the element's own box (+14px), and never travel far — neighbours stay clickable
        const r = el.getBoundingClientRect();
        const m = 14;
        const inside = e.clientX > r.left - m && e.clientX < r.right + m && e.clientY > r.top - m && e.clientY < r.bottom + m;
        if (inside) {
          const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
          const cl = (v: number) => Math.max(-10, Math.min(10, v));
          el.style.transform = `translate(${cl(dx * strength)}px, ${cl(dy * strength)}px)`; el.dataset.on = '1';
        } else if (el.dataset.on) { el.style.transform = ''; delete el.dataset.on; }
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, [strength]);
  return <span ref={ref} className={`magnetic ${className}`}>{children}</span>;
}
