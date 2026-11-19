import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DISCIPLINES, getProject, orderedProjects, projectImages, type Block, type Img as ImgT, type Project, type Section } from '../data/projects';
import { Img } from '../components/Art';
import { Lightbox, PreviewImage } from '../components/Lightbox';
import { Reveal } from '../components/Reveal';
import { SplitText } from '../components/fx/SplitText';
import { Magnetic } from '../components/fx/Magnetic';
import { Arrow } from '../components/fx/Arrow';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useDocTitle } from '../hooks/useDocTitle';

type Open = (src: string) => void;

/** Readable text colour for a swatch. */
const inkOn = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const l = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  return l > 150 ? '#1f1a17' : '#fffaf1';
};

function Pic({ img, open, eager }: { img: ImgT; open: Open; eager?: boolean }) {
  return (
    <figure className="pj-fig">
      <button type="button" className="pj-pic" style={{ aspectRatio: `${img.w} / ${img.h}` }} onClick={() => open(img.src)} data-cursor="View" aria-label={`Enlarge: ${img.alt}`}>
        <Img src={img.src} alt={img.alt} width={img.w} height={img.h} eager={eager} fallback={<span className="pj-missing">Image unavailable</span>} />
      </button>
      {img.caption && <figcaption>{img.caption}</figcaption>}
    </figure>
  );
}

function BlockView({ b, open }: { b: Block; open: Open }) {
  switch (b.kind) {
    case 'image': return <Reveal variant="mask" className={`pj-block w-${b.width ?? 'full'}`}><Pic img={b.img} open={open} /></Reveal>;
    case 'pair': return <div className={`pj-block pj-pair ${b.square ? 'sq' : ''}`}>{b.imgs.map((im, i) => <Reveal key={im.src} variant="mask" delay={i * 90}><Pic img={im} open={open} /></Reveal>)}</div>;
    case 'split': return (
      <div className={`pj-block pj-split ${b.flip ? 'flip' : ''}`}>
        <Reveal variant="mask"><Pic img={b.img} open={open} /></Reveal>
        <Reveal delay={120} className="pj-copy"><h3>{b.title}</h3><p>{b.body}</p></Reveal>
      </div>
    );
    case 'text': return <Reveal className="pj-block pj-text">{b.title && <h3>{b.title}</h3>}{b.body.map((t) => <p key={t}>{t}</p>)}</Reveal>;
    case 'keywords': return <Reveal className="pj-block pj-keys" as="ul">{b.words.map((w) => <li key={w}>{w}</li>)}</Reveal>;
    case 'palette': return (
      <Reveal className="pj-block pj-palette">
        <ul>{b.colors.map((c) => <li key={c.hex} style={{ background: c.hex, color: inkOn(c.hex) }}><b>{c.label ?? 'Colour'}</b><code>{c.hex.toUpperCase()}</code></li>)}</ul>
        {b.note && <p className="pj-note">{b.note}</p>}
      </Reveal>
    );
  }
}

function SectionView({ s, n, open }: { s: Section; n: number; open: Open }) {
  const style = s.theme ? ({ '--sb': s.theme.bg, '--sf': s.theme.fg, '--sa': s.theme.accent } as CSSProperties) : undefined;
  return (
    <section id={s.id} className={`pj-sec ${s.theme ? 'themed' : ''}`} style={style} aria-labelledby={`${s.id}-h`}>
      <Reveal className="pj-head">
        <span className="pj-num">{String(n).padStart(2, '0')}</span>
        <SplitText as="h2" id={`${s.id}-h`} by="word" text={s.title} />
        {s.lead && <p>{s.lead}</p>}
      </Reveal>
      {s.blocks.map((b, i) => <BlockView key={i} b={b} open={open} />)}
    </section>
  );
}

function Neighbours({ p }: { p: Project }) {
  const list = orderedProjects();
  if (list.length < 2) return null;
  const i = list.findIndex((x) => x.slug === p.slug);
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  return (
    <nav className="pj-next" aria-label="More projects">
      {[{ q: prev, dir: 'Previous' }, { q: next, dir: 'Next' }].map(({ q, dir }) => (
        <Link key={dir} to={`/work/${q.slug}`} className="pj-next-card" style={{ '--nbg': q.palette[0], '--nfg': q.palette[1] } as CSSProperties}>
          <Img src={q.cover.src} alt="" className="pj-next-img" width={q.cover.w} height={q.cover.h} />
          <span className="pj-next-copy"><small>{dir === 'Previous' && <ArrowLeft />} {dir} project {dir === 'Next' && <ArrowRight />}</small><b>{q.title}</b><i>{q.category}</i></span>
        </Link>
      ))}
    </nav>
  );
}

export default function ProjectPage() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  const [idx, setIdx] = useState<number | null>(null);
  const progress = useScrollProgress();
  const ids = useMemo(() => (project ? project.sections.map((s) => s.id) : []), [project]);
  const active = useActiveSection(ids, [slug]);
  useDocTitle(project ? `${project.title} — ${project.category}` : 'Not found', project?.summary);

  const gallery = useMemo(() => {
    if (!project) return [] as ImgT[];
    const g = projectImages(project);
    return g.some((x) => x.src === project.cover.src) ? g : [project.cover, ...g];
  }, [project]);
  const open = useCallback<Open>((src) => setIdx(Math.max(0, gallery.findIndex((g) => g.src === src))), [gallery]);
  const close = useCallback(() => setIdx(null), []);
  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length)), [gallery.length]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % gallery.length)), [gallery.length]);

  if (!project) return <Navigate to="/" replace />;
  const cur = idx !== null ? gallery[idx] : null;
  const theme = { '--pj-bg': project.palette[0], '--pj-fg': project.palette[1], '--pj-ac': project.palette[2] } as CSSProperties;
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <main id="main" className="pj" style={theme}>
      <div className="pj-progress" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><i style={{ transform: `scaleX(${progress})` }} /></div>

      <header className="pj-hero wrap">
        <p className="eyebrow">{DISCIPLINES[project.discipline]} · {project.category}</p>
        <SplitText as="h1" by="word" stagger={90} text={project.title} />
        <p className="pj-sum">{project.summary}</p>
        <dl className="pj-meta">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Discipline</dt><dd>{DISCIPLINES[project.discipline]}</dd></div>
          <div className="wide"><dt>Deliverables</dt><dd>{project.deliverables.join(' · ')}</dd></div>
        </dl>
        <Reveal variant="mask" className="pj-cover" >
          <Pic img={project.cover} open={open} eager />
        </Reveal>
      </header>

      <div className="pj-body wrap">
        <nav className="pj-nav" aria-label="Project sections">
          <Link to="/#work" className="pj-back"><ArrowLeft /> All work</Link>
          <ol>
            {project.sections.map((s, i) => (
              <li key={s.id}><a href={`#${s.id}`} onClick={go(s.id)} className={active === s.id ? 'active' : ''} aria-current={active === s.id ? 'true' : undefined}><small>{String(i + 1).padStart(2, '0')}</small><span>{s.title}</span></a></li>
            ))}
          </ol>
        </nav>
        <div className="pj-main">
          {project.sections.map((s, i) => <SectionView key={s.id} s={s} n={i + 1} open={open} />)}
          <Neighbours p={project} />
          <Magnetic><Link to="/" className="btn-solid pj-home">Back to homepage <Arrow /></Link></Magnetic>
        </div>
      </div>

      <Lightbox open={!!cur} onClose={close} onPrev={gallery.length > 1 ? prev : undefined} onNext={gallery.length > 1 ? next : undefined}
        title={cur?.alt ?? ''} caption={cur?.caption ?? project.title} counter={cur && idx !== null ? `${String(idx + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}` : undefined}>
        {cur && <PreviewImage key={cur.src} src={cur.src} alt={cur.alt} />}
      </Lightbox>
    </main>
  );
}
