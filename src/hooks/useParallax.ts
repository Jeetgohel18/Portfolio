import { useEffect, useRef } from 'react';

/** Scroll parallax: moves the element on Y by `speed` × distance from viewport centre (only while visible). */
export function useParallax<T extends HTMLElement>(speed = 0.12) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let vis = false, raf = 0;
    const apply = () => {
      raf = 0;
      if (!vis) return;
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
      el.style.setProperty('--py-s', `${off.toFixed(1)}px`);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; on(); }, { rootMargin: '20% 0px' });
    io.observe(el);
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { io.disconnect(); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [speed]);
  return ref;
}
