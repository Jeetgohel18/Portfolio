import { useEffect, useRef, type ReactNode } from 'react';

/** Sets --px / --py (-1…1) on its element from the pointer position; children use them via `translate`. */
export function PointerParallax({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, run = true, vis = true;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);
    const move = (e: PointerEvent) => { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; };
    const tick = () => {
      if (run && vis) {
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        el.style.setProperty('--px', cx.toFixed(3)); el.style.setProperty('--py', cy.toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { run = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', move); };
  }, []);
  return <div ref={ref} className={`pp ${className}`}>{children}</div>;
}
