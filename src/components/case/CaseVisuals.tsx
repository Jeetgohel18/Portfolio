import { useState, type CSSProperties } from 'react';
import { Play } from 'lucide-react';
import { asset } from '../../lib/assets';
import { BrowserFrame, DashScreen, MobileScreen, PhoneFrame, ProductScreen, WebScreen, type Palette } from '../Art';
import type { Project } from '../../data/projects';

export function Screen({ project, i = 0 }: { project: Project; i?: number }) {
  const p = project.palette;
  if (project.kind === 'mobile') return <MobileScreen p={p} variant={i} />;
  if (project.kind === 'dashboard') return <DashScreen p={p} />;
  if (project.kind === 'product') return i % 2 ? <DashScreen p={p} /> : <ProductScreen p={p} />;
  return <WebScreen p={p} />;
}

export function AffinityMap({ ac }: { ac: string }) {
  const groups = ['Theme A', 'Theme B', 'Theme C', 'Theme D'];
  return (
    <div className="cs-affinity" aria-label="Affinity map placeholder" style={{ '--ac': ac } as CSSProperties}>
      {groups.map((g, gi) => (
        <div key={g} className="aff-col">
          <b>{g}</b>
          {Array.from({ length: 3 - (gi % 2) }).map((_, i) => <i key={i} style={{ transform: `rotate(${((i + gi) % 3 - 1) * 1.6}deg)` }}>Sticky note</i>)}
        </div>
      ))}
    </div>
  );
}

export function IaTree() {
  return (
    <div className="cs-tree" aria-label="Information architecture placeholder">
      <div className="t-root">Home</div>
      <div className="t-lv">
        {['Section A', 'Section B', 'Section C'].map((s) => (
          <div key={s} className="t-br"><div className="t-n">{s}</div>
            <div className="t-lf"><span>Page</span><span>Page</span></div></div>
        ))}
      </div>
    </div>
  );
}

export function FlowDiagram() {
  const steps = ['Entry', 'Task', 'Decision', 'Result'];
  return (
    <div className="cs-flow" aria-label="User flow placeholder">
      {steps.map((s, i) => (
        <div key={s} className={`fl-step ${s === 'Decision' ? 'dia' : ''}`}><span>{s}</span>{i < steps.length - 1 && <em aria-hidden="true" />}</div>
      ))}
    </div>
  );
}

export function WireRow() {
  return (
    <div className="cs-wires" aria-label="Wireframes placeholder">
      {[0, 1, 2].map((i) => (
        <div key={i} className="wire"><i /><b /><b className="s" /><div><u /><u /></div></div>
      ))}
    </div>
  );
}

export function TypeSpecimen({ p }: { p: Palette }) {
  return (
    <div className="cs-type" style={{ background: p[0], color: p[1] }}>
      <div className="ty-aa">Aa</div>
      <div className="ty-scale">
        <p style={{ fontSize: 'clamp(28px,4vw,48px)' }}>Display — Heading one</p>
        <p style={{ fontSize: 24 }}>Heading two</p>
        <p style={{ fontSize: 16 }}>Body — The quick brown fox jumps over the lazy dog.</p>
        <p style={{ fontSize: 12, opacity: 0.7 }}>Caption · Typeface name placeholder</p>
      </div>
    </div>
  );
}

export function Swatches({ p }: { p: Palette }) {
  const names = ['Base', 'Ink', 'Accent'];
  const light = (c: string) => {
    const n = parseInt(c.slice(1), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 140;
  };
  return (
    <div className="cs-swatches">
      {p.map((c, i) => (
        <div key={c + i} style={{ background: c, color: light(c) ? '#14130f' : '#f3efe6' }}>
          <b>{names[i]}</b><code>{c.toUpperCase()}</code>
        </div>
      ))}
    </div>
  );
}

export function ComponentKit({ p }: { p: Palette }) {
  return (
    <div className="cs-kit" style={{ '--a-bg': p[0], '--a-fg': p[1], '--a-ac': p[2] } as CSSProperties}>
      <button type="button" tabIndex={-1}>Primary</button>
      <button type="button" tabIndex={-1} className="ghost">Secondary</button>
      <label><span>Input</span><input tabIndex={-1} readOnly placeholder="Placeholder" aria-label="Sample input" /></label>
      <span className="chip">Tag</span><span className="chip on">Active</span>
      <div className="toggle"><i /></div>
    </div>
  );
}

/** Annotated interface with working hotspots. */
export function Annotated({ project }: { project: Project }) {
  const [on, setOn] = useState(0);
  const notes = [
    { x: 22, y: 30, t: 'Annotation 1', d: 'Describe a key decision about this part of the interface.' },
    { x: 68, y: 48, t: 'Annotation 2', d: 'Explain an interaction or detail the viewer should notice.' },
    { x: 40, y: 80, t: 'Annotation 3', d: 'Point out how this solves a user problem.' },
  ];
  return (
    <div className="cs-annot">
      <div className="an-stage">
        <BrowserFrame url="annotated-screen"><Screen project={project} /></BrowserFrame>
        {notes.map((n, i) => (
          <button key={i} className={`hot ${on === i ? 'on' : ''}`} style={{ left: `${n.x}%`, top: `${n.y}%` }} onClick={() => setOn(i)} onMouseEnter={() => setOn(i)} aria-label={n.t}>{i + 1}</button>
        ))}
      </div>
      <div className="an-note" aria-live="polite">
        <small>Annotated interface · placeholder</small>
        <h4>{notes[on].t}</h4>
        <p>{notes[on].d}</p>
      </div>
    </div>
  );
}

export function PrototypeEmbed({ url, video, title }: { url?: string; video?: string; title: string }) {
  const [live, setLive] = useState(false);
  if (video) return <video className="cs-proto-vid" src={asset(video)} controls muted loop playsInline preload="metadata" />;
  if (url) {
    return (
      <div className="cs-proto">
        {live ? <iframe src={url} title={`${title} prototype`} allowFullScreen /> : (
          <button onClick={() => setLive(true)} className="proto-start"><Play />Load interactive prototype</button>
        )}
      </div>
    );
  }
  return (
    <div className="cs-proto empty">
      <div><Play /><b>Interactive prototype placeholder</b><span>Set <code>embedUrl</code> (Figma / Framer) or <code>video</code> in caseStudies.ts</span></div>
    </div>
  );
}

export function PhonePair({ project }: { project: Project }) {
  return (
    <div className="cs-phones">
      {[0, 1, 2].map((i) => <PhoneFrame key={i}><MobileScreen p={project.palette} variant={i} /></PhoneFrame>)}
    </div>
  );
}

/* ---------- Added in refinement pass ---------- */
import { Img, ScreenImg } from '../Art';
import { imgAlt, imgCaption, imgSrc, type CaseImage } from '../../data/caseStudies';

/** Masonry-style grid that preserves each image's natural proportions. First image spans the full width. */
export function ImageGrid({ images, label, onOpen }: { images: CaseImage[]; label: string; onOpen: (src: string, alt: string, caption?: string) => void }) {
  return (
    <div className="cs-grid">
      {images.map((im, i) => {
        const src = imgSrc(im), alt = imgAlt(im, `${label} ${i + 1}`), cap = imgCaption(im);
        return (
          <figure key={src + i} className={i === 0 ? 'first' : ''}>
            <button type="button" onClick={() => onOpen(src, alt, cap)} aria-label={`Enlarge: ${alt}`}>
              <Img src={src} alt={alt} fallback={<div className="img-missing">Image not found<code>{src}</code></div>} />
            </button>
            {cap && <figcaption>{cap}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}

/** Real desktop + mobile screenshots on a themed stage. */
export function DeviceStage({ desktop = [], mobile = [], onOpen }: { desktop?: CaseImage[]; mobile?: CaseImage[]; onOpen: (src: string, alt: string, caption?: string) => void }) {
  return (
    <div className="cs-devices">
      {desktop.map((d, i) => (
        <button key={'d' + i} type="button" className="dev-desk" onClick={() => onOpen(imgSrc(d), imgAlt(d, `Desktop screen ${i + 1}`), imgCaption(d))} aria-label={`Enlarge desktop screen ${i + 1}`}>
          <BrowserFrame><ScreenImg src={imgSrc(d)} alt={imgAlt(d, `Desktop screen ${i + 1}`)} fallback={<div className="img-missing">Image not found<code>{imgSrc(d)}</code></div>} /></BrowserFrame>
        </button>
      ))}
      {mobile.length > 0 && (
        <div className="dev-mobs">
          {mobile.map((m, i) => (
            <button key={'m' + i} type="button" onClick={() => onOpen(imgSrc(m), imgAlt(m, `Mobile screen ${i + 1}`), imgCaption(m))} aria-label={`Enlarge mobile screen ${i + 1}`}>
              <PhoneFrame><ScreenImg src={imgSrc(m)} alt={imgAlt(m, `Mobile screen ${i + 1}`)} fallback={<div className="img-missing">Not found</div>} /></PhoneFrame>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Big placeholder device composition for the Final Design panel. */
export function FinalStage({ project, onOpen }: { project: Project; onOpen: (src: string, alt: string) => void }) {
  return (
    <div className="cs-stage">
      <button type="button" className="stage-desk" onClick={() => onOpen('', 'Desktop screen')} aria-label="Enlarge desktop screen placeholder">
        <BrowserFrame url="your-project.com"><Screen project={project} /></BrowserFrame>
      </button>
      <div className="stage-phones">
        <PhoneFrame className="sp1"><MobileScreen p={project.palette} variant={0} /></PhoneFrame>
        <PhoneFrame className="sp2"><MobileScreen p={project.palette} variant={1} /></PhoneFrame>
      </div>
      <span className="stage-tag">Placeholder mockups</span>
    </div>
  );
}

export function JourneyStrip() {
  const stages = ['Discover', 'Consider', 'Act', 'Return'];
  return (
    <div className="cs-journey" aria-label="User journey placeholder">
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40 C60 8, 90 56, 150 30 S250 4, 300 34 S370 50, 400 18" /></svg>
      <ol>{stages.map((s, i) => <li key={s}><small>0{i + 1}</small><b>{s}</b><span>Describe this stage</span></li>)}</ol>
    </div>
  );
}
