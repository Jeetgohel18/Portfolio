import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { getProject, projects, type Project } from '../data/projects';
import { SECTION_TEMPLATE, getCaseStudy, type SectionContent, type SectionId, type SectionTemplate } from '../data/caseStudies';
import { BrowserFrame, ProjectArt, SampleTag } from '../components/Art';
import { Lightbox } from '../components/Lightbox';
import { Reveal } from '../components/Reveal';
import { AffinityMap, Annotated, ComponentKit, DeviceStage, FinalStage, FlowDiagram, IaTree, ImageGrid, JourneyStrip, PrototypeEmbed, Screen, Swatches, TypeSpecimen, WireRow } from '../components/case/CaseVisuals';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useDocTitle } from '../hooks/useDocTitle';
import { asset } from '../lib/assets';

type Open = (src: string, alt: string, caption?: string) => void;

/** Sections where the heading sits beside the content. Others stack with large visuals beneath. */
const SPLIT: SectionId[] = ['overview', 'problem', 'outcomes', 'learnings'];

function Topics({ t, c, rows = false }: { t: SectionTemplate; c?: SectionContent; rows?: boolean }) {
  if (!t.topics.length) return null;
  return (
    <div className={rows ? 'cs-rows' : 'cs-topics'}>
      {t.topics.map((tp, i) => {
        const real = c?.items?.find((it) => it.title.toLowerCase() === tp.title.toLowerCase());
        return (
          <Reveal key={tp.title} delay={i * 60} className={`cs-topic ${real ? '' : 'is-ph'}`}>
            {rows && <span className="row-n">{String(i + 1).padStart(2, '0')}</span>}
            <div>
              <h4>{tp.title}</h4>
              <p>{real ? real.body : tp.hint}</p>
              {!real && <small>Placeholder</small>}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

function Learnings({ t, c }: { t: SectionTemplate; c?: SectionContent }) {
  const [open, setOpen] = useState<string | null>(t.topics[0]?.title ?? null);
  return (
    <div className="cs-acc">
      {t.topics.map((tp, i) => {
        const real = c?.items?.find((it) => it.title.toLowerCase() === tp.title.toLowerCase());
        const isOpen = open === tp.title;
        const id = `acc-${i}`;
        return (
          <div key={tp.title} className={`acc-item ${isOpen ? 'open' : ''}`}>
            <h3>
              <button aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : tp.title)}>
                <span><small>{String(i + 1).padStart(2, '0')}</small>{tp.title}</span><ChevronDown size={20} />
              </button>
            </h3>
            <div id={id} role="region" aria-label={tp.title} className="acc-body"><div><p>{real ? real.body : tp.hint}</p>{!real && <small>Placeholder</small>}</div></div>
          </div>
        );
      })}
    </div>
  );
}

function Visuals({ id, project, c, open }: { id: SectionId; project: Project; c?: SectionContent; open: Open }) {
  const title = SECTION_TEMPLATE.find((s) => s.id === id)?.title ?? '';
  const hasImgs = !!c?.images?.length;
  if (id === 'final') {
    return (
      <>
        {c?.desktop?.length || c?.mobile?.length
          ? <div className="cs-panel themed"><DeviceStage desktop={c.desktop} mobile={c.mobile} onOpen={open} /></div>
          : <div className="cs-panel themed"><FinalStage project={project} onOpen={open} /></div>}
        {hasImgs ? <ImageGrid images={c!.images!} label={title} onOpen={open} /> : <Annotated project={project} />}
      </>
    );
  }
  if (hasImgs && id !== 'introduction') return <ImageGrid images={c!.images!} label={title} onOpen={open} />;
  switch (id) {
    case 'problem': return <div className="cs-quote"><p>“Replace this with your real problem statement.”</p><small>Placeholder — no research data is implied.</small></div>;
    case 'research': return <AffinityMap ac={project.palette[2]} />;
    case 'strategy': return <><IaTree /><JourneyStrip /></>;
    case 'ux': return <><FlowDiagram /><WireRow /></>;
    case 'visual': return (
      <div className="cs-panel themed bento">
        <TypeSpecimen p={project.palette} /><Swatches p={project.palette} /><ComponentKit p={project.palette} />
      </div>
    );
    case 'prototype': return <PrototypeEmbed url={c?.embedUrl} video={c?.video} title={project.title} />;
    default: return null;
  }
}

export default function CaseStudy() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  const cfg = getCaseStudy(slug);
  const [zoom, setZoom] = useState<{ src: string; alt: string; caption?: string } | null>(null);
  const progress = useScrollProgress();
  const sections = useMemo(() => SECTION_TEMPLATE.filter((s) => !cfg.hiddenSections?.includes(s.id)), [cfg.hiddenSections]);
  const active = useActiveSection(sections.map((s) => s.id), [slug]);
  const open = useCallback<Open>((src, alt, caption) => setZoom({ src, alt, caption }), []);
  useEffect(() => {
    // keep the active pill visible in the horizontally-scrolling mobile bar
    if (!window.matchMedia('(max-width: 960px)').matches) return;
    document.querySelector<HTMLElement>('.cs-nav a.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [active]);
  useDocTitle(project ? `${project.title} — Case study` : 'Not found', project?.summary);

  if (!project) return <Navigate to="/" replace />;
  const i = projects.findIndex((p) => p.slug === slug);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', `#${id}`); };
  const num = (id: SectionId) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0');
  const theme = { '--cs-bg': project.palette[0], '--cs-fg': project.palette[1], '--cs-ac': project.palette[2] } as React.CSSProperties;
  const cover = cfg.cover ?? project.cover;

  return (
    <div className="cs" style={theme}>
      <div className="cs-progress" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><i style={{ transform: `scaleX(${progress})` }} /></div>
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
              <section key={s.id} id={s.id} className="cs-sec cs-intro" aria-labelledby="cs-title">
                <p className="eyebrow">{project.category} {project.placeholder && <SampleTag>Sample case study</SampleTag>}</p>
                <h1 id="cs-title">{project.title}</h1>
                <p className="cs-lead">{c?.lead ?? project.summary}</p>
                <div className="cs-cover" style={{ background: project.palette[0] }}>
                  <div className="cover-in"><ProjectArt kind={project.kind} p={project.palette} src={cover} alt={`${project.title} cover`} /></div>
                  <span className="cover-chip">{project.platform}</span>
                </div>
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
              <section key={s.id} id={s.id} className="cs-sec cs-next" aria-label="Next project">
                <p className="eyebrow">{num(s.id)} — Keep exploring</p>
                <div className="next-grid">
                  {[{ p: prev, dir: 'Previous', r: false }, { p: next, dir: 'Next', r: true }].map(({ p, dir, r }) => (
                    <Link key={dir} to={`/work/${p.slug}`} className={`next-card ${r ? 'r' : ''}`} style={{ '--nbg': p.palette[0], '--nfg': p.palette[1], '--nac': p.palette[2] } as React.CSSProperties}>
                      <small>{!r && <ArrowLeft size={14} />} {dir} project {r && <ArrowRight size={14} />}</small>
                      <b>{p.title}</b><span>{p.category}</span>
                      <i className="next-chip" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
                <Link to="/" className="btn-solid">Back to homepage <ArrowUpRight size={16} /></Link>
              </section>
            );
          }

          const split = SPLIT.includes(s.id);
          const head = (
            <Reveal className="cs-head">
              <span className="cs-num">{num(s.id)}</span>
              <h2>{s.title}</h2>
              <p>{c?.lead ?? s.lead}</p>
            </Reveal>
          );
          return (
            <section key={s.id} id={s.id} className={`cs-sec sec-${s.id} ${split ? 'is-split' : ''}`} aria-label={s.title}>
              {split ? (
                <>
                  {head}
                  <div className="split-body">
                    {s.id === 'learnings' ? <Learnings t={s} c={c} /> : <Topics t={s} c={c} rows />}
                    <Visuals id={s.id} project={project} c={c} open={open} />
                  </div>
                </>
              ) : (
                <>
                  {head}
                  <Topics t={s} c={c} />
                  <Visuals id={s.id} project={project} c={c} open={open} />
                </>
              )}
            </section>
          );
        })}
      </main>

      <Lightbox open={!!zoom} onClose={() => setZoom(null)} title={zoom?.alt ?? ''} caption={zoom?.caption}>
        {zoom && (zoom.src ? <img src={asset(zoom.src)} alt={zoom.alt} /> : <div className="lb-art"><BrowserFrame><Screen project={project} /></BrowserFrame></div>)}
      </Lightbox>
    </div>
  );
}
