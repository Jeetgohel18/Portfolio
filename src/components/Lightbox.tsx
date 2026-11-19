import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import { asset } from '../lib/assets';
import { lockScroll } from '../lib/scrollLock';

type Props = {
  open: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  title: string;
  caption?: string;
  counter?: string;
  /** Optional extra control rendered in the caption row (e.g. a link to the project). */
  action?: ReactNode;
  children: ReactNode;
};

/** Clicks on these never count as "outside" clicks. */
const KEEP = 'img, video, iframe, figcaption, button, a, .lb-art, .lb-motion, .lb-error, .lb-keep';
const FOCUSABLE = 'button, [href], iframe, video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal preview.
 *
 * Rendered through a portal into <body>. This is deliberate: position:fixed is resolved against the nearest
 * ancestor that has a transform/filter/containment, so inside the page's animated wrapper a "fixed" overlay is
 * laid out against the whole document instead of the viewport (the original blank-overlay bug).
 */
export function Lightbox({ open, onClose, onPrev, onNext, title, caption, counter, action, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  // always call the latest handlers without re-running the open/close effect on every parent render
  const handlers = useRef({ onClose, onPrev, onNext });
  handlers.current = { onClose, onPrev, onNext };

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const unlock = lockScroll();
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');            // background is not focusable / readable while the modal is open
    closeRef.current?.focus({ preventScroll: true });

    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handlers.current.onClose(); return; }
      if (e.key === 'ArrowLeft') { handlers.current.onPrev?.(); return; }
      if (e.key === 'ArrowRight') { handlers.current.onNext?.(); return; }
      if (e.key === 'Tab') {
        const nodes = Array.from(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((n) => !n.hasAttribute('disabled'));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!dialog.current?.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      root?.removeAttribute('inert');
      unlock();
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(KEEP)) return;   // clicks on the image / caption / controls stay open
    handlers.current.onClose();
  };

  return createPortal(
    <div className="lightbox" ref={dialog} role="dialog" aria-modal="true" aria-label={title} onClick={onBackdrop}>
      <button ref={closeRef} type="button" className="lb-btn lb-close" onClick={() => handlers.current.onClose()} aria-label="Close preview"><X /></button>
      {onPrev && <button type="button" className="lb-btn lb-prev" onClick={() => handlers.current.onPrev?.()} aria-label="Previous"><ChevronLeft /></button>}
      {onNext && <button type="button" className="lb-btn lb-next" onClick={() => handlers.current.onNext?.()} aria-label="Next"><ChevronRight /></button>}
      <figure className="lb-fig">
        <div className="lb-stage">{children}</div>
        <figcaption>
          <strong>{counter && <em className="lb-count">{counter}</em>}{title}</strong>
          {caption && <span>{caption}</span>}
          {action}
        </figcaption>
      </figure>
      <p className="sr-only" role="status" aria-live="polite">{counter ? `${counter}. ` : ''}{title}</p>
    </div>,
    document.body,
  );
}

/**
 * Contain-fit image for previews: keeps the file's own aspect ratio (never crops or stretches),
 * shows a skeleton while loading, and falls back to `fallback` + a notice if the file is missing/broken.
 */
export function PreviewImage({ src, alt, fallback = null }: { src: string; alt: string; fallback?: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setState('loading');
    const el = ref.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? 'ok' : 'error');   // already cached / already failed
  }, [src]);

  if (state === 'error') {
    return (
      <div className="lb-error" role="img" aria-label={`${alt} — image unavailable`}>
        {fallback}
        <p className="lb-error-note"><ImageOff /> This image couldn't be loaded.</p>
      </div>
    );
  }
  return (
    <div className={`lb-media ${state}`}>
      {state === 'loading' && <span className="lb-spin" aria-hidden="true" />}
      <img ref={ref} src={asset(src)} alt={alt} decoding="async" draggable={false} onLoad={() => setState('ok')} onError={() => setState('error')} />
    </div>
  );
}
