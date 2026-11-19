import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { gallery, galleryCategories, type GalleryCategory } from '../data/gallery';
import { Img } from './Art';
import { Lightbox, PreviewImage } from './Lightbox';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';
import { Arrow } from './fx/Arrow';
import { asset } from '../lib/assets';

export function GalleryShowcase() {
  const [filter, setFilter] = useState<GalleryCategory | 'All'>('All');
  const [idx, setIdx] = useState<number | null>(null);
  const items = useMemo(() => gallery.filter((g) => filter === 'All' || g.category === filter), [filter]);
  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length)), [items.length]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);
  const cur = idx !== null ? items[idx] : null;

  // warm the cache for the neighbours so prev/next feels instant
  useEffect(() => {
    if (idx === null) return;
    [items[(idx + 1) % items.length], items[(idx - 1 + items.length) % items.length]].forEach((n) => { if (n) new Image().src = asset(n.src); });
  }, [idx, items]);

  return (
    <section id="visual" className="section stack-top visual">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">03 — Visual design</p>
          <SectionTitle text="Visual *design*" />
          <p className="sec-note">Logos, packaging and campaign visuals from my brand identity projects. Select any piece to view it larger.</p>
        </Reveal>
        <div className="filters" role="group" aria-label="Filter gallery">
          {(['All', ...galleryCategories] as const).map((c) => (
            <button key={c} aria-pressed={filter === c} className={filter === c ? 'on' : ''} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className={`gal-grid ${filter !== 'All' ? 'uniform' : ''}`} aria-live="polite">
          {items.map((g, i) => (
            <button key={g.id} className={`gal-item s-${g.size} v${i % 4}`} data-cursor="Open" style={filter !== 'All' ? { aspectRatio: `${g.w} / ${g.h}` } : undefined} onClick={() => setIdx(i)} aria-label={`Open ${g.title} — ${g.project}`}>
              <div className="gal-art"><Img src={g.src} alt={g.alt} className="cover-img" width={g.w} height={g.h} /></div>
              <span className="gal-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="gal-cap"><b>{g.title}</b><i>{g.project}</i></span>
            </button>
          ))}
        </div>
      </div>
      <Lightbox open={!!cur} onClose={close} onPrev={items.length > 1 ? prev : undefined} onNext={items.length > 1 ? next : undefined}
        title={cur?.title ?? ''} caption={cur ? `${cur.project} · ${cur.category}` : ''}
        counter={cur && idx !== null ? `${String(idx + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}` : undefined}
        action={cur && <Link to={`/work/${cur.slug}`} className="lb-link" onClick={close}>View project <Arrow /></Link>}>
        {cur && <PreviewImage key={cur.id} src={cur.src} alt={cur.alt} />}
      </Lightbox>
    </section>
  );
}
