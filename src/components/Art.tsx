import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { asset } from '../lib/assets';

export type Palette = [string, string, string];

const pv = (p: Palette): CSSProperties =>
  ({ '--a-bg': p[0], '--a-fg': p[1], '--a-ac': p[2] }) as CSSProperties;

/** Labelled marker so placeholder work is never mistaken for real work. */
export function SampleTag({ children = 'Placeholder' }: { children?: ReactNode }) {
  return <span className="sample-tag">{children}</span>;
}

type ImgProps = { src?: string; alt: string; className?: string; fallback?: ReactNode; eager?: boolean };
/**
 * Image from /public. If `src` is empty or the file fails to load, renders `fallback`
 * (designed placeholder) instead of a broken-image icon.
 */
export function Img({ src, alt, className, fallback = null, eager }: ImgProps) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (!src || bad) return <>{fallback}</>;
  return <img className={className} src={asset(src)} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBad(true)} />;
}

/* ---------- Interface mock screens (div based, scale with container) ---------- */

export function WebScreen({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-web" style={pv(p)}>
      <div className="mk-bar"><i /><b>Brand</b><span /><span /><span /><em /></div>
      <div className="mk-hero">
        <h4>Big headline<br />for the page</h4>
        <p /><p className="s" />
        <div className="mk-btns"><em /><i /></div>
        <div className="mk-blob" />
      </div>
      <div className="mk-cards"><div /><div /><div /></div>
    </div>
  );
}

export function DashScreen({ p }: { p: Palette }) {
  const bars = [38, 62, 48, 80, 56, 72, 90, 64, 76];
  return (
    <div aria-hidden="true" className="mk mk-dash" style={pv(p)}>
      <div className="mk-side"><i /><b /><b /><b /><b /></div>
      <div className="mk-main">
        <div className="mk-kpis">{['KPI', 'KPI', 'KPI'].map((k, i) => <div key={i}><small>{k}</small><strong>00</strong></div>)}</div>
        <div className="mk-chart">
          <div className="mk-bars">{bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M0 30 C15 10, 25 34, 40 20 S70 6, 100 14" /></svg>
        </div>
        <div className="mk-rows"><div /><div /><div /></div>
      </div>
    </div>
  );
}

export function MobileScreen({ p, variant = 0 }: { p: Palette; variant?: number }) {
  return (
    <div aria-hidden="true" className={`mk mk-mob v${variant}`} style={pv(p)}>
      <div className="mk-status"><span>9:41</span><i /></div>
      <h4>{['Welcome back', 'Explore', 'Your plan'][variant % 3]}</h4>
      <div className="mk-hero-m" />
      <div className="mk-list"><div /><div /><div /></div>
      <div className="mk-tabs"><i /><i /><i /><i /></div>
    </div>
  );
}

export function ProductScreen({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-prod" style={pv(p)}>
      <div className="mk-comp c1"><b>Button</b><em /></div>
      <div className="mk-comp c2"><b>Toggle</b><i /></div>
      <div className="mk-comp c3"><b>Card</b><div /><div className="s" /></div>
      <div className="mk-comp c4"><b>Input</b><span>Label</span></div>
      <div className="mk-comp c5"><b>Tag</b><u>Active</u><u>Draft</u></div>
    </div>
  );
}

/* ---------- Visual-design art ---------- */
export function BrandArt({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-brand" style={pv(p)}>
      <div className="mk-logo"><i /><i /><i /></div>
      <h4>Brand<br />Name</h4>
      <div className="mk-sw"><span /><span /><span /><span /></div>
    </div>
  );
}

export function PosterArt({ p, label = 'Poster' }: { p: Palette; label?: string }) {
  return (
    <div aria-hidden="true" className="mk mk-poster" style={pv(p)}>
      <div className="mk-circ" /><div className="mk-bar2" /><div className="mk-tri" />
      <h4>{label}<br />Title</h4>
    </div>
  );
}

export function TypeArt({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-type" style={pv(p)}>
      <span>Aa</span><small>Type<br />study</small>
    </div>
  );
}

export function IllustrationArt({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-illus" style={pv(p)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <circle cx="32" cy="38" r="22" className="f1" />
        <rect x="46" y="44" width="38" height="38" rx="2" className="f2" transform="rotate(12 65 63)" />
        <path d="M6 88 Q30 52 54 80 T98 62 V100 H6Z" className="f3" />
      </svg>
    </div>
  );
}

export function SocialArt({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-social" style={pv(p)}>
      <div className="mk-sq"><b>Post</b><i /></div>
      <div className="mk-sq alt"><i /><b>01/03</b></div>
    </div>
  );
}

export function CampaignArt({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-camp" style={pv(p)}>
      <div className="mk-sun" /><div className="mk-stripes"><i /><i /><i /><i /></div>
      <h4>Campaign<br />headline</h4>
    </div>
  );
}

export function MotionArt({ p }: { p: Palette }) {
  return (
    <div aria-hidden="true" className="mk mk-motion" style={pv(p)}>
      <i /><i /><i />
    </div>
  );
}

/* ---------- Frames ---------- */
export function BrowserFrame({ children, url = 'your-project.com', className = '' }: { children: ReactNode; url?: string; className?: string }) {
  return (
    <div className={`frame-browser ${className}`}>
      <div className="fb-top"><span /><span /><span /><em>{url}</em></div>
      <div className="fb-screen">{children}</div>
    </div>
  );
}

export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`frame-phone ${className}`}>
      <div className="fp-notch" />
      <div className="fp-screen">{children}</div>
    </div>
  );
}

function Placeholder({ kind, p }: { kind: string; p: Palette }) {
  switch (kind) {
    case 'web': return <BrowserFrame><WebScreen p={p} /></BrowserFrame>;
    case 'dashboard': return <BrowserFrame url="app.your-product.com"><DashScreen p={p} /></BrowserFrame>;
    case 'mobile': return (
      <div className="phones">
        <PhoneFrame className="ph1"><MobileScreen p={p} variant={0} /></PhoneFrame>
        <PhoneFrame className="ph2"><MobileScreen p={p} variant={1} /></PhoneFrame>
        <PhoneFrame className="ph3"><MobileScreen p={p} variant={2} /></PhoneFrame>
      </div>
    );
    case 'product': return <div className="prod-wrap"><ProductScreen p={p} /></div>;
    case 'brand': return <div className="brand-wrap"><BrandArt p={p} /><div className="brand-card" style={pv(p)}><i /><b>Brand Name</b><small>name@brand.com</small></div></div>;
    default: return <div className="poster-wrap"><PosterArt p={p} /><div className="poster-b"><PosterArt p={[p[2], p[1], p[0]]} label="Series" /></div></div>;
  }
}

/** Large project cover: real image if provided (and loadable), otherwise a composed placeholder per kind. */
export function ProjectArt({ kind, p, src, alt }: { kind: string; p: Palette; src?: string; alt: string }) {
  return <Img src={src} alt={alt} className="cover-img" fallback={<Placeholder kind={kind} p={p} />} />;
}

/** Screenshot inside a browser/phone frame, falling back to a mock screen. */
export function ScreenImg({ src, alt, fallback }: { src?: string; alt: string; fallback: ReactNode }) {
  return <Img src={src} alt={alt} className="screen-img" fallback={fallback} />;
}
