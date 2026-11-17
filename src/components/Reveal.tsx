import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

type Props = { as?: ElementType; delay?: number; className?: string; children: ReactNode; variant?: 'up' | 'fade' | 'mask' };

/** Scroll-triggered reveal. CSS handles the motion (and reduced-motion). */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, variant = 'up' }: Props) {
  const [ref, seen] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={`reveal rv-${variant} ${seen ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
