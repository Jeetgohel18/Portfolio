import { useRef, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { projects, type Project } from '../data/projects';
import { ProjectArt, SampleTag } from './Art';
import { Reveal } from './Reveal';

function Row({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false);
  const cur = useRef<HTMLSpanElement>(null);
  const move = (e: MouseEvent) => {
    const c = cur.current; if (!c) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    c.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%,-50%)`;
  };
  const num = String(i + 1).padStart(2, '0');
  return (
    <article className={`work-row k-${p.kind} ${i % 2 ? 'flip' : ''}`} style={{ '--ac': p.palette[2] } as React.CSSProperties}>
      <Reveal className="work-meta">
        <span className="work-num">{num}</span>
        <p className="eyebrow">{p.category}</p>
        <h3>{p.title}</h3>
        <p className="work-sum">{p.summary}</p>
        <button className="work-more" aria-expanded={open} aria-controls={`wd-${p.slug}`} onClick={() => setOpen((o) => !o)}>
          <Plus size={14} className={open ? 'rot' : ''} /> Project details
        </button>
        <div id={`wd-${p.slug}`} className={`work-details ${open ? 'open' : ''}`}>
          <dl>
            <div><dt>Role</dt><dd>{p.role}</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
            <div><dt>Platform</dt><dd>{p.platform}</dd></div>
            <div><dt>Tools</dt><dd>{p.tools.join(' · ')}</dd></div>
          </dl>
        </div>
        <Link className="btn-link" to={`/work/${p.slug}`}>Read case study <ArrowUpRight size={16} /></Link>
        {p.placeholder && <SampleTag>Sample slot</SampleTag>}
      </Reveal>
      <Reveal variant="mask" delay={120} className="work-visual-wrap">
        <Link to={`/work/${p.slug}`} className="work-visual" onMouseMove={move} aria-label={`${p.title} — read case study`}
          style={{ background: p.kind === 'web' || p.kind === 'product' ? undefined : undefined }}>
          <div className="work-stage" style={{ background: p.palette[0] }}>
            <ProjectArt kind={p.kind} p={p.palette} src={p.cover} alt={`${p.title} cover`} />
          </div>
          <span className="work-cursor" ref={cur} aria-hidden="true">View</span>
        </Link>
      </Reveal>
    </article>
  );
}

export function SelectedWork() {
  return (
    <section id="work" className="section work">
      <div className="wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">02 — Selected work</p>
          <h2>Selected <em>work</em></h2>
          <p className="sec-note">Six slots across the disciplines I work in. Currently <strong>sample placeholders</strong> — real projects replace them via <code>src/data/projects.ts</code>.</p>
        </Reveal>
        {projects.map((p, i) => <Row key={p.slug} p={p} i={i} />)}
      </div>
    </section>
  );
}
