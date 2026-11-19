import { useCallback, useEffect, useMemo, useState } from 'react';
import { gallery, galleryCategories, type GalleryCategory, type GalleryItem } from '../data/gallery';
import { BrandArt, CampaignArt, IllustrationArt, Img, PosterArt, SampleTag, SocialArt, TypeArt } from './Art';
import { Lightbox, PreviewImage } from './Lightbox';
import { asset } from '../lib/assets';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';

export function GalleryArt({ g }: { g: GalleryItem }) {
  return <Img src={g.src} alt={g.title} className="cover-img" fallback={<GalleryPlaceholder g={g} />} />;
}

function GalleryPlaceholder({ g }: { g: GalleryItem }) {
  switch (g.art) {
    case 'logo': return <BrandArt p={g.palette} />;
    case 'poster': return <PosterArt p={g.palette} />;
    case 'social': return <SocialArt p={g.palette} />;
    case 'campaign': return <CampaignArt p={g.palette} />;
    case 'illustration': return <IllustrationArt p={g.palette} />;
    default: return <TypeArt p={g.palette} />;
  }
}

/** Large preview: contain-fit real image, or the designed placeholder (4:3) when the item has no image yet. */
function GalleryPreview({ g }: { g: GalleryItem }) {
  const placeholder = <div className="lb-art"><GalleryPlaceholder g={g} /></div>;
  return g.src ? <PreviewImage key={g.id} src={g.src} alt={g.title} fallback={placeholder} /> : placeholder;
}

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
    [items[(idx + 1) % items.length], items[(idx - 1 + items.length) % items.length]].forEach((n) => { if (n?.src) new Image().src = asset(n.src); });
  }, [idx, items]);

  return (
    <section id="visual" className="section stack-top visual">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">04 — Graphic &amp; branding</p>
          <SectionTitle text="Visual *design*" />
          <p className="sec-note">An editorial gallery for branding, social, posters, campaigns and explorations. Select any piece to view larger. <SampleTag /></p>
        </Reveal>
        <div className="filters" role="group" aria-label="Filter gallery">
          {(['All', ...galleryCategories] as const).map((c) => (
            <button key={c} aria-pressed={filter === c} className={filter === c ? 'on' : ''} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="gal-grid" aria-live="polite">
          {items.map((g, i) => (
            <button key={g.id} className={`gal-item s-${g.size} v${i % 4}`} data-cursor="Open" onClick={() => setIdx(i)} aria-label={`Open ${g.title}`}>
              <div className="gal-art"><GalleryArt g={g} /></div>
              <span className="gal-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="gal-cap"><b>{g.title}</b><i>{g.category}</i></span>
            </button>
          ))}
        </div>
      </div>
      <Lightbox open={!!cur} onClose={close} onPrev={items.length > 1 ? prev : undefined} onNext={items.length > 1 ? next : undefined} title={cur?.title ?? ''} caption={cur ? `${cur.category}${cur.src ? '' : ' · sample placeholder'}` : ''} counter={cur && idx !== null ? `${String(idx + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}` : undefined}>
        {cur && <GalleryPreview g={cur} />}
      </Lightbox>
    </section>
  );
}
