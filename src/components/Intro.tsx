import { Compass, Eye, LayoutGrid } from 'lucide-react';
import { personal } from '../data/personal';
import { Reveal } from './Reveal';
import { SplitText } from './fx/SplitText';
import { Obj3D } from './fx/Obj3D';
import { PointerParallax } from './fx/PointerParallax';

const WORDS = ['UI/UX', 'Product', 'Websites', 'Dashboards', 'Mobile apps', 'Branding', 'Graphics', 'Motion'];
const ICONS = [
  { Icon: Eye, tone: 'butter' },
  { Icon: LayoutGrid, tone: 'lavender' },
  { Icon: Compass, tone: 'mint' },
] as const;

export function Intro() {
  return (
    <section id="intro" className="section stack-top intro-sec" aria-labelledby="intro-h">
      <PointerParallax>
        <Obj3D kind="pencil" tone="butter" size={46} depth={16} float={8} rot={-28} className="hide-m" style={{ right: '5%', top: '10%' }} />
        <Obj3D kind="sphere" tone="lavender" size={72} depth={26} float={9} className="hide-m" style={{ right: '16%', top: '46%' }} />
        <Obj3D kind="squiggle" tone="coral" size={70} depth={10} float={0} spin className="hide-m" style={{ right: '3%', top: '34%' }} />
      </PointerParallax>
      <div className="wrap intro">
        <Reveal className="intro-kicker"><p className="eyebrow">01 — Hello</p></Reveal>
        <SplitText as="h2" id="intro-h" className="intro-big" by="word" stagger={55}
          text={`I'm a *UI/UX*, product and visual designer in ==${personal.location.split(',')[0]}== — I care about *clarity*, craft and the small details that make things feel considered.`} />
        <div className="intro-cols">
          {personal.philosophy.map((p, i) => {
            const { Icon, tone } = ICONS[i % ICONS.length];
            return (
              <Reveal key={p.title} delay={i * 90} className="intro-col">
                <span className={`ic-tile t-${tone}`}><Icon /></span>
                <small>0{i + 1}</small>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
      <div className="marquee" aria-label={`Disciplines: ${WORDS.join(', ')}`}>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((k) => (
            <ul key={k}>{WORDS.map((w) => <li key={w}>{w}<i /></li>)}</ul>
          ))}
        </div>
      </div>
    </section>
  );
}
