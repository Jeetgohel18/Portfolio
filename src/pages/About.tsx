import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Coffee, Download, FileText, GraduationCap, Laptop, StickyNote, X } from 'lucide-react';
import { education, experience, personal, skills, tools } from '../data/personal';
import { asset } from '../lib/assets';
import { Portrait } from '../components/Portrait';
import { useDocTitle } from '../hooks/useDocTitle';

type Key = 'story' | 'philosophy' | 'experience' | 'education' | 'skills' | 'tools' | 'interests' | 'resume';

const objects: { key: Key; label: string; hint: string; Icon: typeof BookOpen; cls: string }[] = [
  { key: 'story', label: 'Notebook', hint: 'My story', Icon: BookOpen, cls: 'o-notebook' },
  { key: 'philosophy', label: 'Sticky note', hint: 'Philosophy', Icon: StickyNote, cls: 'o-sticky' },
  { key: 'experience', label: 'Clipboard', hint: 'Experience', Icon: ClipboardList, cls: 'o-clip' },
  { key: 'education', label: 'Diploma', hint: 'Education', Icon: GraduationCap, cls: 'o-edu' },
  { key: 'skills', label: 'Swatches', hint: 'Skills', Icon: FileText, cls: 'o-skills' },
  { key: 'tools', label: 'Laptop', hint: 'Tools', Icon: Laptop, cls: 'o-laptop' },
  { key: 'interests', label: 'Coffee', hint: 'Interests', Icon: Coffee, cls: 'o-cup' },
  { key: 'resume', label: 'Resume card', hint: 'Download', Icon: Download, cls: 'o-resume' },
];

function Panel({ k }: { k: Key }): ReactNode {
  switch (k) {
    case 'story':
      return (<><Portrait /><h2>Hi, I'm <em>{personal.firstName}</em>.</h2>
        <p>I'm a UI/UX, product and visual designer based in {personal.location}. I work across websites, dashboards and SaaS products, mobile apps, branding, graphics and motion.</p>
        <p>I studied Information Technology (B.E., 2021–2025) and now work at {personal.company}. I like to explore ideas quickly — sketching, prototyping and using AI tools such as Claude, ChatGPT and Gemini — then slow down to refine the details that matter.</p></>);
    case 'philosophy':
      return (<><h2>How I <em>think</em></h2><ul className="panel-list">{personal.philosophy.map((p) => <li key={p.title}><b>{p.title}</b><span>{p.body}</span></li>)}</ul></>);
    case 'experience':
      return (<><h2>Experience</h2>{experience.map((e) => (
        <div key={e.company} className="panel-block"><div className="pb-head"><b>{e.company}</b><span>{e.role} · {e.period}</span></div><p>{e.summary}</p>
          <ul className="tag-list">{e.areas.map((a) => <li key={a}>{a}</li>)}</ul></div>))}</>);
    case 'education':
      return (<><h2>Education</h2>{education.map((e) => (
        <div key={e.degree} className="panel-block"><div className="pb-head"><b>{e.degree}</b><span>{e.period}</span></div><p>{e.school}</p><p><strong>{e.note}</strong></p></div>))}</>);
    case 'skills':
      return (<><h2>Skills</h2>{skills.map((g) => <div key={g.group} className="panel-block"><div className="pb-head"><b>{g.group}</b></div><ul className="tag-list">{g.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}</>);
    case 'tools':
      return (<><h2>Tools</h2><ul className="panel-list tools">{tools.map((t) => <li key={t.name}><b>{t.name}</b><span>{t.use}</span></li>)}</ul></>);
    case 'interests':
      return (<><h2>Off the <em>clock</em></h2><p>Things I keep exploring beyond client work:</p><ul className="tag-list">{personal.interests.map((i) => <li key={i}>{i}</li>)}</ul></>);
    case 'resume':
      return (<><h2>Resume</h2><p>Download my resume as a PDF, or read the on-page version.</p>
        <div className="panel-actions"><a className="btn-solid" href={asset(personal.resumePath)} download>Download PDF <Download size={16} /></a><Link className="btn-link" to="/resume">View resume page</Link></div></>);
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
  return (
    <main id="main" className="page about">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">About</p>
          <h1>The <em>desk</em>.</h1>
          <p className="page-sub">Everything on this desk is clickable. Pick something up.</p>
        </header>

        <div className="desk-layout">
          <div className="desk" role="group" aria-label="Interactive desk">
            <div className="desk-lamp" aria-hidden="true" />
            {objects.map((o) => (
              <button key={o.key} className={`obj ${o.cls} ${active === o.key ? 'on' : ''}`} onClick={() => select(o.key)} aria-pressed={active === o.key} aria-label={`${o.label}: ${o.hint}`}>
                <span className="obj-body"><o.Icon size={22} strokeWidth={1.6} /><b>{o.hint}</b></span>
                <span className="obj-tip">{o.label}</span>
              </button>
            ))}
          </div>

          <aside ref={panelRef} className="desk-panel" aria-live="polite" aria-label="Details">
            {active ? (
              <div key={active} className="panel-in">
                <button className="panel-x" onClick={() => setActive(null)} aria-label="Close details"><X size={16} /></button>
                <Panel k={active} />
              </div>
            ) : <p className="panel-empty">Select an object on the desk.</p>}
          </aside>
        </div>
      </div>
    </main>
  );
}
