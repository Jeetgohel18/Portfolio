import { personal } from '../data/personal';
import { Reveal } from './Reveal';

export function Intro() {
  return (
    <section id="intro" className="section intro wrap">
      <Reveal className="intro-kicker"><p className="eyebrow">01 — Hello</p></Reveal>
      <Reveal as="h2" className="intro-big">
        I'm a <em>UI/UX</em>, product and visual designer in {personal.location.split(',')[0]} — I care about <em>clarity</em>, craft and the small details that make things feel considered.
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
      <Reveal className="intro-strip">
        {['UI/UX', 'Product', 'Websites', 'Dashboards', 'Mobile apps', 'Branding', 'Graphics', 'Motion'].map((t) => <span key={t}>{t}</span>)}
      </Reveal>
    </section>
  );
}
