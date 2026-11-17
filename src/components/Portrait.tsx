import { personal } from '../data/personal';
import { Img } from './Art';

/** Profile photo from personal.portrait, or a designed monogram placeholder. */
export function Portrait({ className = '' }: { className?: string }) {
  return (
    <figure className={`portrait ${className}`}>
      <Img
        src={personal.portrait || undefined}
        alt={`Portrait of ${personal.name}`}
        fallback={<div className="portrait-ph" role="img" aria-label="Portrait placeholder"><span>JG</span><small>Add portrait</small></div>}
      />
    </figure>
  );
}
