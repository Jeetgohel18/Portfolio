import { useCallback, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { motionItems, type MotionItem } from '../data/gallery';
import { asset } from '../lib/assets';
import { MotionArt, SampleTag } from './Art';
import { Lightbox } from './Lightbox';
import { Reveal } from './Reveal';

function Media({ m, full = false }: { m: MotionItem; full?: boolean }) {
  if (m.video) return <video src={asset(m.video)} poster={m.poster ? asset(m.poster) : undefined} muted loop playsInline autoPlay={full} controls={full} preload="metadata" />;
  if (m.gif) return <img src={asset(m.gif)} alt={m.title} loading="lazy" />;
  if (m.embed && full) return <iframe src={m.embed} title={m.title} allowFullScreen loading="lazy" />;
  return <MotionArt p={m.palette} />;
}

export function MotionLab() {
  const [open, setOpen] = useState<number | null>(null);
  const vids = useRef<Record<string, HTMLVideoElement | null>>({});
  const close = useCallback(() => setOpen(null), []);
  const cur = open !== null ? motionItems[open] : null;
  const hover = (m: MotionItem, on: boolean) => {
    const v = vids.current[m.id];
    if (!v) return;
    if (on) v.play().catch(() => undefined); else { v.pause(); v.currentTime = 0; }
  };
  return (
    <section id="motion" className="section motion">
      <div className="wrap">
        <Reveal className="sec-head light">
          <p className="eyebrow">05 — Motion &amp; experiments</p>
          <h2>Motion <em>lab</em></h2>
          <p className="sec-note">Hover to preview, click to watch. Supports MP4, GIF, animated assets and interactive prototypes. <SampleTag /></p>
        </Reveal>
      </div>
      <div className="motion-rail" tabIndex={0} aria-label="Motion experiments, scroll horizontally">
        {motionItems.map((m, i) => (
          <button key={m.id} className="motion-card" onClick={() => setOpen(i)} onMouseEnter={() => hover(m, true)} onMouseLeave={() => hover(m, false)} onFocus={() => hover(m, true)} onBlur={() => hover(m, false)} aria-label={`Play ${m.title}`}>
            <div className="motion-thumb">
              {m.video ? <video ref={(el) => { vids.current[m.id] = el; }} src={asset(m.video)} poster={m.poster ? asset(m.poster) : undefined} muted loop playsInline preload="metadata" /> : <Media m={m} />}
              <span className="motion-play"><Play size={16} /></span>
            </div>
            <span className="motion-meta"><b>{m.title}</b><i>{m.kind}</i></span>
          </button>
        ))}
      </div>
      <Lightbox open={!!cur} onClose={close} title={cur?.title ?? ''} caption={cur ? `${cur.kind} · ${cur.note}` : ''}>
        {cur && <div className="lb-motion"><Media m={cur} full /></div>}
      </Lightbox>
    </section>
  );
}
