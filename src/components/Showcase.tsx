import { useState } from 'react';
import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { BrowserFrame, DashScreen, MobileScreen, PhoneFrame, SampleTag, ScreenImg, WebScreen } from './Art';
import { showcase } from '../data/showcase';
import { Reveal } from './Reveal';

const P: [string, string, string] = ['#14130f', '#f3efe6', '#c7f23b'];
const P2: [string, string, string] = ['#e9e2d3', '#14130f', '#ff5a24'];
const P3: [string, string, string] = ['#1d2a4a', '#f3efe6', '#7bd6c4'];

const sizes = { desktop: { w: 100, label: 'Desktop', Icon: Laptop }, tablet: { w: 64, label: 'Tablet', Icon: Tablet }, mobile: { w: 34, label: 'Mobile', Icon: Smartphone } } as const;

export function Showcase() {
  const [vp, setVp] = useState<keyof typeof sizes>('desktop');
  const [lens, setLens] = useState({ x: 62, y: 38, on: false });
  return (
    <section id="interfaces" className="section stack-top showcase">
      <div className="wrap">
        <Reveal className="sec-head light">
          <p className="eyebrow">03 — Interfaces</p>
          <h2>Product &amp; <em>dashboard</em> showcase</h2>
          <p className="sec-note">Browser and device presentations for websites, SaaS dashboards and mobile apps. <SampleTag /></p>
        </Reveal>

        <Reveal variant="mask" className="show-hero">
          <div
            className="show-dash"
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
                return <button key={k} role="radio" aria-checked={vp === k} className={vp === k ? 'on' : ''} onClick={() => setVp(k)}><Icon size={16} />{label}</button>;
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
