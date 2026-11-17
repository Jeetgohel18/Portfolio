import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Props = { open: boolean; onClose: () => void; onPrev?: () => void; onNext?: () => void; title: string; caption?: string; children: ReactNode };

export function Lightbox({ open, onClose, onPrev, onNext, title, caption, children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => {
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
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <button ref={closeRef} className="lb-btn lb-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      {onPrev && <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous"><ChevronLeft size={22} /></button>}
      {onNext && <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next"><ChevronRight size={22} /></button>}
      <figure className="lb-fig" onClick={(e) => e.stopPropagation()}>
        <div className="lb-stage">{children}</div>
        <figcaption><strong>{title}</strong>{caption && <span>{caption}</span>}</figcaption>
      </figure>
    </div>
  );
}
