import { useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { projects, type Project } from '../data/projects';
import { ProjectArt, SampleTag } from './Art';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';
import { Arrow } from './fx/Arrow';
import { Magnetic } from './fx/Magnetic';
import { Obj3D } from './fx/Obj3D';
import { ACCENTS } from './fx/accents';
import { PointerParallax } from './fx/PointerParallax';

function Row({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false);
  const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const tilt = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!fine) return;
    const el = e.currentTarget.querySelector<HTMLElement>('.work-stage'); if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`); el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
  };
  const reset = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget.querySelector<HTMLElement>('.work-stage'); el?.style.setProperty('--rx', '0deg'); el?.style.setProperty('--ry', '0deg');
  };
  const num = String(i + 1).padStart(2, '0');
  return (
    <article className={`work-row k-${p.kind} ${i % 2 ? 'flip' : ''}`} style={{ '--ac': p.palette[2], '--stage': p.palette[0], '--stage-fg': p.palette[1] } as CSSProperties}>
      <Reveal className="work-meta">
        <div className="work-top"><span className="work-num">{num}</span><span className="work-cat label">{p.category}</span></div>
        <h3>{p.title}</h3>
        <p className="work-sum">{p.summary}</p>
        <ul className="work-chips" aria-label="Tools">{p.tools.map((t) => <li key={t}>{t}</li>)}</ul>
        <button className="work-more" aria-expanded={open} aria-controls={`wd-${p.slug}`} onClick={() => setOpen((o) => !o)}>
          <Plus className={open ? 'rot' : ''} /> Project details
        </button>
        <div id={`wd-${p.slug}`} className={`work-details ${open ? 'open' : ''}`}>
          <dl>
            <div><dt>Role</dt><dd>{p.role}</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
            <div><dt>Platform</dt><dd>{p.platform}</dd></div>
          </dl>
        </div>
        <div className="work-cta">
          <Magnetic><Link className="btn-solid" to={`/work/${p.slug}`}>Read case study <Arrow /></Link></Magnetic>
          {p.placeholder && <SampleTag>Sample slot</SampleTag>}
        </div>
      </Reveal>
      <Reveal variant="mask" delay={120} className="work-visual-wrap">
        <Link to={`/work/${p.slug}`} className="work-visual" data-cursor="View" onMouseMove={tilt} onMouseLeave={reset} aria-label={`${p.title} — read case study`}>
          <div className="work-stage">
            <ProjectArt kind={p.kind} p={p.palette} src={p.cover} alt={`${p.title} cover`} />
          </div>
        </Link>
        <PointerParallax>
          {ACCENTS[p.kind].map((a, k) => <Obj3D key={k} kind={a.kind} tone={a.tone} size={a.size} depth={a.depth ?? 12 + k * 8} float={7 + k * 2} spin={a.spin} rot={a.rot ?? 0} style={a.style} className="hide-m" />)}
        </PointerParallax>
      </Reveal>
    </article>
  );
}

export function SelectedWork() {
  return (
    <section id="work" className="section stack-top work">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">02 — Selected work</p>
          <SectionTitle text="Selected *work*" count="06" />
          <p className="sec-note">Six slots across the disciplines I work in. Currently <strong>sample placeholders</strong> — real projects replace them via <code>src/data/projects.ts</code>.</p>
        </Reveal>
        {projects.map((p, i) => <Row key={p.slug} p={p} i={i} />)}
      </div>
    </section>
  );
}
