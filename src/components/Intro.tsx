import { personal } from '../data/personal';
import { Reveal } from './Reveal';

const WORDS = ['UI/UX', 'Product', 'Websites', 'Dashboards', 'Mobile apps', 'Branding', 'Graphics', 'Motion'];

export function Intro() {
  return (
    <section id="intro" className="section stack-top intro-sec" aria-labelledby="intro-h">
      <div className="wrap intro">
        <Reveal className="intro-kicker"><p className="eyebrow">01 — Hello</p></Reveal>
        <Reveal as="h2" className="intro-big">
          <span id="intro-h">I'm a <em>UI/UX</em>, product and visual designer in {personal.location.split(',')[0]} — I care about <em>clarity</em>, craft and the small details that make things feel considered.</span>
        </Reveal>
        <div className="intro-cols">
          {personal.philosophy.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className="intro-col">
              <small>0{i + 1}</small>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </Reveal>
          ))}
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
