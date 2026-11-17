import { SplitText } from './fx/SplitText';

/** Section heading with character reveal. Inline markup: *emphasis*, ==highlight==. */
export function SectionTitle({ text, count, className = '' }: { text: string; count?: string; className?: string }) {
  return (
    <div className={`sec-title ${className}`}>
      <SplitText as="h2" by="char" stagger={22} text={text} />
      {count && <sup className="count" aria-label={`${count} items`}>({count})</sup>}
    </div>
  );
}
