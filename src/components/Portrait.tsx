import { personal } from '../data/personal';
import { Img } from './Art';

/** Profile photo from personal.portrait, or a monogram until a photo is set. */
export function Portrait({ className = '' }: { className?: string }) {
  return (
    <figure className={`portrait ${className}`}>
      <Img
        src={personal.portrait || undefined}
        alt={`Portrait of ${personal.name}`}
        fallback={<div className="portrait-ph" role="img" aria-label="JG monogram"><span>JG</span></div>}
      />
    </figure>
  );
}
