import { Check } from 'lucide-react';
import { CHALLENGES } from '../../lib/art/compose';
import type { Doc } from '../../lib/art/compose';

type Props = { doc: Doc; index: number; onNext: () => void; onClose: () => void };

/** One optional challenge at a time. Ignore it freely. */
export function ChallengePanel({ doc, index, onNext, onClose }: Props) {
  const c = CHALLENGES[index % CHALLENGES.length];
  const done = c.check(doc);
  return (
    <aside className={`pg-challenge ${done ? 'done' : ''}`} aria-label="Creative challenge" onPointerDown={(e) => e.stopPropagation()}>
      <p className="pg-ch-eyebrow">Challenge {String((index % CHALLENGES.length) + 1).padStart(2, '0')}{done && <span className="pg-ch-ok"><Check size={13} aria-hidden="true" /> Nailed it</span>}</p>
      <p className="pg-ch-title">{c.title}</p>
      <p className="pg-ch-hint">{c.hint} <b>{c.progress(doc)}</b></p>
      <div className="pg-ch-actions">
        <button type="button" onClick={onNext}>{done ? 'Next challenge' : 'Skip this one'}</button>
        <button type="button" onClick={onClose}>Ignore challenges</button>
      </div>
    </aside>
  );
}
