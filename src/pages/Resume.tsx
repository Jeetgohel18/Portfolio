import { Download } from 'lucide-react';
import { education, experience, personal, skills, tools } from '../data/personal';
import { asset } from '../lib/assets';
import { Reveal } from '../components/Reveal';
import { useDocTitle } from '../hooks/useDocTitle';

export default function Resume() {
  useDocTitle('Resume');
  return (
    <main id="main" className="page resume">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">Resume</p>
          <h1>{personal.name}</h1>
          <p className="page-sub">{personal.title} · {personal.location}</p>
          <a className="btn-solid" href={asset(personal.resumePath)} download>Download resume (PDF) <Download size={16} /></a>
        </header>

        <div className="res-grid">
          <Reveal as="section" className="res-sec"><h2>Profile</h2><p>{personal.intro} I work across UI/UX, product, website, dashboard and mobile design, branding and graphics, motion, and AI-assisted creative workflows.</p></Reveal>
          <Reveal as="section" className="res-sec"><h2>Experience</h2>
            {experience.map((e) => (
              <div key={e.company} className="res-item"><div><b>{e.company}</b><span>{e.role}</span></div><span className="res-date">{e.period}</span>
                <ul>{e.areas.map((a) => <li key={a}>{a}</li>)}</ul></div>))}
          </Reveal>
          <Reveal as="section" className="res-sec"><h2>Education</h2>
            {education.map((e) => <div key={e.degree} className="res-item"><div><b>{e.degree}</b><span>{e.school} · {e.note}</span></div><span className="res-date">{e.period}</span></div>)}
          </Reveal>
          <Reveal as="section" className="res-sec"><h2>Skills</h2>
            {skills.map((g) => <div key={g.group} className="res-skill"><b>{g.group}</b><ul className="tag-list">{g.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}
          </Reveal>
          <Reveal as="section" className="res-sec"><h2>Tools</h2>
            <ul className="tag-list">{tools.map((t) => <li key={t.name}>{t.name}</li>)}</ul>
          </Reveal>
        </div>
        <p className="form-note res-note">The PDF lives at <code>public/{personal.resumePath}</code> — replace that file to update the download.</p>
      </div>
    </main>
  );
}
