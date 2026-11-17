import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { getProject, projects, type Project } from '../data/projects';
import { SECTION_TEMPLATE, getCaseStudy, type SectionContent, type SectionId, type SectionTemplate } from '../data/caseStudies';
import { BrowserFrame, Img, ProjectArt, SampleTag } from '../components/Art';
import { Lightbox } from '../components/Lightbox';
import { Reveal } from '../components/Reveal';
import { AffinityMap, Annotated, ComponentKit, FlowDiagram, IaTree, PhonePair, PrototypeEmbed, Screen, Swatches, TypeSpecimen, WireRow } from '../components/case/CaseVisuals';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { asset } from '../lib/assets';
import { useDocTitle } from '../hooks/useDocTitle';

function Topics({ t, c }: { t: SectionTemplate; c?: SectionContent }) {
  if (!t.topics.length) return null;
  return (
    <div className="cs-topics">
      {t.topics.map((tp) => {
        const real = c?.items?.find((i) => i.title.toLowerCase() === tp.title.toLowerCase());
        return (
          <Reveal key={tp.title} className={`cs-topic ${real ? '' : 'is-ph'}`}>
            <h4>{tp.title}</h4>
            <p>{real ? real.body : tp.hint}</p>
            {!real && <small>Placeholder</small>}
          </Reveal>
        );
      })}
    </div>
  );
}

function RealImages({ images, label, onOpen }: { images: string[]; label: string; onOpen: (src: string, alt: string) => void }) {
  return (
    <div className="cs-gallery">
      {images.map((src, i) => (
        <button key={src} className="cs-img" onClick={() => onOpen(src, `${label} ${i + 1}`)} aria-label={`Zoom ${label} ${i + 1}`}>
          <Img src={src} alt={`${label} ${i + 1}`} />
        </button>
      ))}
    </div>
  );
}

function Visual({ id, project, c, open }: { id: SectionId; project: Project; c?: SectionContent; open: (src: string, alt: string) => void }) {
  if (c?.images?.length && id !== 'introduction') return <RealImages images={c.images} label={SECTION_TEMPLATE.find((s) => s.id === id)!.title} onOpen={open} />;
  switch (id) {
    case 'research': return <AffinityMap ac={project.palette[2]} />;
    case 'strategy': return <IaTree />;
    case 'ux': return <><FlowDiagram /><WireRow /></>;
    case 'visual': return <><TypeSpecimen p={project.palette} /><Swatches p={project.palette} /><ComponentKit p={project.palette} /></>;
    case 'final': return (
      <>
        <Annotated project={project} />
        <div className="cs-final-grid">
          <button className="cs-zoom" onClick={() => open('', 'Desktop screen')} aria-label="Zoom desktop screen"><BrowserFrame><Screen project={project} /></BrowserFrame><span>Desktop</span></button>
          <div className="cs-zoom"><PhonePair project={project} /><span>Mobile</span></div>
        </div>
      </>
    );
    case 'prototype': return <PrototypeEmbed url={c?.embedUrl} video={c?.video} title={project.title} />;
    case 'problem': return <div className="cs-quote"><p>“Replace this with your real problem statement.”</p><small>Placeholder — no research data is implied.</small></div>;
    default: return null;
  }
}

function Learnings({ t, c }: { t: SectionTemplate; c?: SectionContent }) {
  const [open, setOpen] = useState<string | null>(t.topics[0]?.title ?? null);
  return (
    <div className="cs-acc">
      {t.topics.map((tp) => {
        const real = c?.items?.find((i) => i.title.toLowerCase() === tp.title.toLowerCase());
        const isOpen = open === tp.title;
        return (
          <div key={tp.title} className={`acc-item ${isOpen ? 'open' : ''}`}>
            <button aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : tp.title)}>{tp.title}<ChevronDown size={18} /></button>
            <div className="acc-body"><div><p>{real ? real.body : tp.hint}</p>{!real && <small>Placeholder</small>}</div></div>
          </div>
        );
      })}
    </div>
  );
}

export default function CaseStudy() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  const cfg = getCaseStudy(slug);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const progress = useScrollProgress();

  const sections = useMemo(() => SECTION_TEMPLATE.filter((s) => !cfg.hiddenSections?.includes(s.id)), [cfg.hiddenSections]);
  const active = useActiveSection(sections.map((s) => s.id), [slug]);
  const open = useCallback((src: string, alt: string) => setZoom({ src, alt }), []);
  useDocTitle(project ? `${project.title} — Case study` : 'Not found');

  if (!project) return <Navigate to="/" replace />;
  const i = projects.findIndex((p) => p.slug === slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const num = (id: SectionId) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0');
  const theme = { '--cs-bg': project.palette[0], '--cs-fg': project.palette[1], '--cs-ac': project.palette[2] } as React.CSSProperties;

  return (
    <div className="cs" style={theme}>
      <div className="cs-progress" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></div>
      <nav className="cs-nav" aria-label="Case study sections">
        <Link to="/#work" className="cs-back"><ArrowLeft size={14} /> All work</Link>
        <ol>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={go(s.id)} className={active === s.id ? 'active' : ''} aria-current={active === s.id ? 'true' : undefined}>
                <small>{num(s.id)}</small><span>{s.nav}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <main id="main" className="cs-main">
        {sections.map((s) => {
          const c = cfg.content?.[s.id];
          if (s.id === 'introduction') {
            return (
              <section key={s.id} id={s.id} className="cs-sec cs-intro">
                <p className="eyebrow">{project.category} {project.placeholder && <SampleTag>Sample case study</SampleTag>}</p>
                <h1>{project.title}</h1>
                <p className="cs-lead">{c?.lead ?? project.summary}</p>
                <div className="cs-cover"><div style={{ background: project.palette[0] }}><ProjectArt kind={project.kind} p={project.palette} src={project.cover} alt={project.title} /></div></div>
                <dl className="cs-meta">
                  <div><dt>Role</dt><dd>{project.role}</dd></div>
                  <div><dt>Timeline</dt><dd>{project.year}</dd></div>
                  <div><dt>Platform</dt><dd>{project.platform}</dd></div>
                  <div><dt>Tools</dt><dd>{project.tools.join(', ')}</dd></div>
                </dl>
              </section>
            );
          }
          if (s.id === 'next') {
            return (
              <section key={s.id} id={s.id} className="cs-sec cs-next">
                <p className="eyebrow">{num(s.id)} — Keep exploring</p>
                <div className="next-grid">
                  <Link to={`/work/${prev.slug}`} className="next-card"><small><ArrowLeft size={14} /> Previous project</small><b>{prev.title}</b><span>{prev.category}</span></Link>
                  <Link to={`/work/${next.slug}`} className="next-card r"><small>Next project <ArrowRight size={14} /></small><b>{next.title}</b><span>{next.category}</span></Link>
                </div>
                <Link to="/" className="btn-solid">Back to homepage</Link>
              </section>
            );
          }
          return (
            <section key={s.id} id={s.id} className="cs-sec">
              <Reveal className="cs-head">
                <span className="cs-num">{num(s.id)}</span>
                <h2>{s.title}</h2>
                <p>{c?.lead ?? s.lead}</p>
              </Reveal>
              {s.id === 'learnings' ? <Learnings t={s} c={c} /> : <Topics t={s} c={c} />}
              <Visual id={s.id} project={project} c={c} open={open} />
            </section>
          );
        })}
      </main>

      <Lightbox open={!!zoom} onClose={() => setZoom(null)} title={zoom?.alt ?? ''}>
        {zoom && (zoom.src ? <img src={asset(zoom.src)} alt={zoom.alt} /> : <div className="lb-art"><BrowserFrame><Screen project={project} /></BrowserFrame></div>)}
      </Lightbox>
    </div>
  );
}
