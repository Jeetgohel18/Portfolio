const COLORS = ['#ff6a4a', '#ffd75e', '#3b47ff', '#cdbdff', '#bfe6cf'];

/** Small confetti pop at viewport coords. Skipped for reduced motion. */
export function burst(x: number, y: number, n = 18) {
  if (typeof document === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 110;
    p.className = 'confetti';
    p.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 40}px;--r:${Math.random() * 540 - 270}deg;--c:${COLORS[i % COLORS.length]};--w:${6 + Math.random() * 7}px;border-radius:${i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '1px'}`;
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 1100);
  }
}
