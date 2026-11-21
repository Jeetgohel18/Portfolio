import { ArrowRight, ArrowUpRight } from 'lucide-react';

/** Two stacked arrows: on parent hover the first slides out, the second slides in. */
export function Arrow({ dir = 'up-right' }: { dir?: 'up-right' | 'right' }) {
  const I = dir === 'right' ? ArrowRight : ArrowUpRight;
  return (
    <span className={`arr ${dir}`} aria-hidden="true">
      <I className="a1" /><I className="a2" />
    </span>
  );
}
