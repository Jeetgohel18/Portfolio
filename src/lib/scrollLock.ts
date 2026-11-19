/**
 * Reference-counted page scroll lock for overlays (lightbox, mobile menu).
 * - Locks <html> + <body>, compensates for the vanishing scrollbar (via --sbw) so the page doesn't jump.
 * - Restores the exact previous inline styles only when the LAST lock is released,
 *   so two overlays can never leave the page stuck or re-enable scrolling too early.
 */
let count = 0;
let saved: { html: string; body: string; pad: string } | null = null;

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const html = document.documentElement;
  const body = document.body;
  if (count++ === 0) {
    const sbw = Math.max(0, window.innerWidth - html.clientWidth);
    saved = { html: html.style.overflow, body: body.style.overflow, pad: body.style.paddingRight };
    html.style.setProperty('--sbw', `${sbw}px`);
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--count === 0 && saved) {
      html.style.overflow = saved.html;
      body.style.overflow = saved.body;
      body.style.paddingRight = saved.pad;
      html.style.removeProperty('--sbw');
      saved = null;
    }
  };
}
