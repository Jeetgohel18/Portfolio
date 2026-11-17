import { useState } from 'react';
import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { BrowserFrame, DashScreen, MobileScreen, PhoneFrame, SampleTag, ScreenImg, WebScreen } from './Art';
import { showcase } from '../data/showcase';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';
import { Obj3D } from './fx/Obj3D';
import { PointerParallax } from './fx/PointerParallax';

const P: [string, string, string] = ['#1e1416', '#f6f0e4', '#ffd75e'];
const P2: [string, string, string] = ['#f1e4c8', '#1f1a17', '#3b47ff'];
const P3: [string, string, string] = ['#cdbdff', '#1f1a17', '#ff6a4a'];

const sizes = { desktop: { w: 100, label: 'Desktop', Icon: Laptop }, tablet: { w: 64, label: 'Tablet', Icon: Tablet }, mobile: { w: 34, label: 'Mobile', Icon: Smartphone } } as const;

export function Showcase() {
  const [vp, setVp] = useState<keyof typeof sizes>('desktop');
  const [lens, setLens] = useState({ x: 62, y: 38, on: false });
  return (
    <section id="interfaces" className="section stack-top showcase">
      <div className="wrap">
        <Reveal className="sec-head light">
          <p className="eyebrow">03 — Interfaces</p>
          <SectionTitle text="Product & *dashboard* showcase" />
          <p className="sec-note">Browser and device presentations for websites, SaaS dashboards and mobile apps. <SampleTag /></p>
        </Reveal>

        <Reveal variant="mask" className="show-hero">
          <PointerParallax>
            <Obj3D kind="sphere" tone="coral" size={84} depth={28} float={9} className="hide-m" style={{ left: '-2%', top: '-9%' }} />
            <Obj3D kind="torus" tone="butter" size={92} depth={20} float={8} spin className="hide-m" style={{ right: '1%', top: '-12%' }} />
            <Obj3D kind="cube" tone="lavender" size={52} depth={34} float={7} spin className="hide-m" style={{ left: '6%', bottom: '-7%' }} />
          </PointerParallax>
          <div
            className="show-dash" data-cursor="Zoom"
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true }); }}
            onMouseLeave={() => setLens((l) => ({ ...l, on: false }))}
          >
            <BrowserFrame url="app.your-product.com"><ScreenImg src={showcase.dashboard} alt="Dashboard screenshot" fallback={<DashScreen p={P} />} /></BrowserFrame>
            <div className={`lens ${lens.on ? 'on' : ''}`} style={{ left: `${lens.x}%`, top: `${lens.y}%` }} aria-hidden="true">
              <div className="lens-inner" style={{ transformOrigin: `${lens.x}% ${lens.y}%` }}>
                <div className="lens-zoom" style={{ transform: `scale(2.4) translate(${50 - lens.x}%, ${50 - lens.y}%)`, transformOrigin: '50% 50%' }}>
                  <ScreenImg src={showcase.dashboard} alt="" fallback={<DashScreen p={P} />} />
                </div>
              </div>
              <span>Close-up</span>
            </div>
          </div>
          <PhoneFrame className="show-phone"><ScreenImg src={showcase.mobile[0]} alt="Mobile screenshot" fallback={<MobileScreen p={P3} variant={0} />} /></PhoneFrame>
          <p className="show-cap">Hover the dashboard — interface close-up lens.</p>
        </Reveal>

        <div className="show-grid">
          <Reveal className="show-card">
            <p className="eyebrow">Responsive preview</p>
            <div className="vp-switch" role="radiogroup" aria-label="Preview viewport">
              {(Object.keys(sizes) as (keyof typeof sizes)[]).map((k) => {
                const { Icon, label } = sizes[k];
                return <button key={k} role="radio" aria-checked={vp === k} className={vp === k ? 'on' : ''} onClick={() => setVp(k)}><Icon />{label}</button>;
              })}
            </div>
            <div className="vp-stage">
              <div className="vp-frame" style={{ width: `${sizes[vp].w}%` }}>
                <BrowserFrame url="your-project.com"><ScreenImg src={showcase.website} alt="Website screenshot" fallback={<WebScreen p={P2} />} /></BrowserFrame>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="show-card show-mobiles">
            <p className="eyebrow">Mobile flows</p>
            <div className="mob-row">
              {[0, 1, 2].map((i) => (
                <PhoneFrame key={i}><ScreenImg src={showcase.mobile[i]} alt={`Mobile screenshot ${i + 1}`} fallback={<MobileScreen p={P3} variant={i} />} /></PhoneFrame>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
