import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Coffee, Download, FileText, GraduationCap, Laptop, StickyNote, X, type LucideIcon } from 'lucide-react';
import { education, experience, personal, skills, tools } from '../data/personal';
import { asset } from '../lib/assets';
import { useDocTitle } from '../hooks/useDocTitle';
import { Portrait } from '../components/Portrait';
import { SplitText } from '../components/fx/SplitText';
import { Obj3D, type Tone } from '../components/fx/Obj3D';
import { PointerParallax } from '../components/fx/PointerParallax';
import { Magnetic } from '../components/fx/Magnetic';
import { Arrow } from '../components/fx/Arrow';

type Key = 'story' | 'philosophy' | 'experience' | 'education' | 'skills' | 'tools' | 'interests' | 'resume';

const objects: { key: Key; label: string; hint: string; Icon: LucideIcon; cls: string; tone: Tone }[] = [
  { key: 'story', label: 'Notebook', hint: 'My story', Icon: BookOpen, cls: 'o-notebook', tone: 'cobalt' },
  { key: 'philosophy', label: 'Sticky note', hint: 'Philosophy', Icon: StickyNote, cls: 'o-sticky', tone: 'butter' },
  { key: 'experience', label: 'Clipboard', hint: 'Experience', Icon: ClipboardList, cls: 'o-clip', tone: 'paper' },
  { key: 'education', label: 'Badge', hint: 'Education', Icon: GraduationCap, cls: 'o-edu', tone: 'coral' },
  { key: 'skills', label: 'Swatches', hint: 'Skills', Icon: FileText, cls: 'o-skills', tone: 'mint' },
  { key: 'tools', label: 'Laptop', hint: 'Tools', Icon: Laptop, cls: 'o-laptop', tone: 'metal' },
  { key: 'interests', label: 'Coffee', hint: 'Interests', Icon: Coffee, cls: 'o-cup', tone: 'butter' },
  { key: 'resume', label: 'Resume card', hint: 'Download', Icon: Download, cls: 'o-resume', tone: 'lavender' },
];

function Panel({ k }: { k: Key }): ReactNode {
  switch (k) {
    case 'story':
      return (<><Portrait /><h2>Hi, I'm <em>{personal.firstName}</em>.</h2>
        <p>I'm a UI/UX, product and visual designer based in {personal.location}. I work across websites, dashboards and SaaS products, mobile apps, branding, graphics and motion.</p>
        <p>I studied Information Technology (B.E., 2021–2025) and now work at {personal.company}. I like to explore ideas quickly — sketching, prototyping and using AI tools such as Claude, ChatGPT and Gemini — then slow down to refine the details that matter.</p></>);
    case 'philosophy':
      return (<><h2>How I <em>think</em></h2><ul className="panel-list">{personal.philosophy.map((p, i) => <li key={p.title}><small>0{i + 1}</small><b>{p.title}</b><span>{p.body}</span></li>)}</ul></>);
    case 'experience':
      return (<><h2>Experi<em>ence</em></h2>{experience.map((e) => (
        <div key={e.company} className="panel-block"><div className="pb-head"><b>{e.company}</b><span>{e.role} · {e.period}</span></div><p>{e.summary}</p>
          <ul className="tag-list">{e.areas.map((a) => <li key={a}>{a}</li>)}</ul></div>))}</>);
    case 'education':
      return (<><h2>Educa<em>tion</em></h2>{education.map((e) => (
        <div key={e.degree} className="panel-block"><div className="pb-head"><b>{e.degree}</b><span>{e.period}</span></div><p>{e.school}</p><p><strong>{e.note}</strong></p></div>))}</>);
    case 'skills':
      return (<><h2>Skills</h2>{skills.map((g) => <div key={g.group} className="panel-block"><div className="pb-head"><b>{g.group}</b></div><ul className="tag-list">{g.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}</>);
    case 'tools':
      return (<><h2>Tools</h2><ul className="panel-list tools">{tools.map((t) => <li key={t.name}><b>{t.name}</b><span>{t.use}</span></li>)}</ul></>);
    case 'interests':
      return (<><h2>Off the <em>clock</em></h2><p>Things I keep exploring beyond client work:</p><ul className="tag-list">{personal.interests.map((i) => <li key={i}>{i}</li>)}</ul></>);
    case 'resume':
      return (<><h2>Resume</h2><p>Download my resume as a PDF, or read the on-page version.</p>
        <div className="panel-actions"><Magnetic><a className="btn-solid" href={asset(personal.resumePath)} download>Download PDF <Download /></a></Magnetic><Link className="btn-link" to="/resume">View resume page <Arrow /></Link></div></>);
  }
}

export default function About() {
  useDocTitle('About');
  const [active, setActive] = useState<Key | null>('story');
  const panelRef = useRef<HTMLElement>(null);
  const select = (k: Key) => {
    setActive(k);
    // on narrow screens the panel sits below the desk — bring it into view
    if (window.matchMedia('(max-width: 900px)').matches) {
      window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  const cur = objects.find((o) => o.key === active);

  return (
    <main id="main" className="page about">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">About</p>
          <SplitText as="h1" by="char" hover text="The *desk*." />
          <p className="page-sub">Everything on this desk is clickable. Pick something up.</p>
        </header>

        <div className="desk-layout">
          <div className="desk" role="group" aria-label="Interactive desk">
            <div className="desk-mat" aria-hidden="true" />
            <div className="desk-lamp" aria-hidden="true" />
            <PointerParallax>
              <Obj3D kind="pencil" tone="butter" size={30} depth={14} float={8} rot={-34} className="hide-m" style={{ left: '40%', bottom: '4%' }} />
              <Obj3D kind="sphere" tone="coral" size={46} depth={22} float={7} className="hide-m" style={{ left: '3%', bottom: '3%' }} />
              <Obj3D kind="cube" tone="lavender" size={34} depth={26} float={6} spin className="hide-m" style={{ right: '3%', top: '47%' }} />
              <Obj3D kind="spark" tone="butter" size={34} depth={18} float={6} spin className="hide-m" style={{ left: '44%', top: '40%' }} />
            </PointerParallax>
            {objects.map((o) => (
              <button key={o.key} className={`obj ${o.cls} ${active === o.key ? 'on' : ''}`} data-cursor="Open" onClick={() => select(o.key)} aria-pressed={active === o.key} aria-label={`${o.label}: ${o.hint}`}>
                <span className="obj-body">
                  <o.Icon /><b>{o.hint}</b>
                  {o.key === 'interests' && <span className="steam" aria-hidden="true"><i /><i /><i /></span>}
                </span>
                <span className="obj-tip">{o.label}</span>
              </button>
            ))}
          </div>

          <aside ref={panelRef} className="desk-panel" aria-live="polite" aria-label="Details">
            {active && cur ? (
              <div key={active} className="panel-in">
                <button className="panel-x" onClick={() => setActive(null)} aria-label="Close details"><X /></button>
                <span className={`panel-ic t-${cur.tone}`} aria-hidden="true"><cur.Icon /></span>
                <Panel k={active} />
              </div>
            ) : <p className="panel-empty">Select an object on the desk.</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
