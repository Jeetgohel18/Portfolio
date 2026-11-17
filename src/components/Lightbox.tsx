import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Props = { open: boolean; onClose: () => void; onPrev?: () => void; onNext?: () => void; title: string; caption?: string; counter?: string; children: ReactNode };

export function Lightbox({ open, onClose, onPrev, onNext, title, caption, counter, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const nodes = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button, [href], iframe, video[controls], [tabindex]:not([tabindex="-1"])') ?? []).filter((n) => !n.hasAttribute('disabled'));
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!dialog.current?.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      document.body.style.overflow = '';
      lastFocus.current?.focus?.();
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  return (
    <div className="lightbox" ref={dialog} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <button ref={closeRef} className="lb-btn lb-close" onClick={onClose} aria-label="Close"><X /></button>
      {onPrev && <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous"><ChevronLeft /></button>}
      {onNext && <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next"><ChevronRight /></button>}
      <figure className="lb-fig" onClick={(e) => e.stopPropagation()}>
        <div className="lb-stage">{children}</div>
        <figcaption><strong>{counter && <em className="lb-count">{counter}</em>}{title}</strong>{caption && <span>{caption}</span>}</figcaption>
      </figure>
    </div>
  );
}
