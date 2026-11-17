import { Download } from 'lucide-react';
import { SplitText } from '../components/fx/SplitText';
import { Magnetic } from '../components/fx/Magnetic';
import { Obj3D } from '../components/fx/Obj3D';
import { PointerParallax } from '../components/fx/PointerParallax';
import { education, experience, personal, skills, tools } from '../data/personal';
import { asset } from '../lib/assets';
import { Reveal } from '../components/Reveal';
import { Portrait } from '../components/Portrait';
import { useDocTitle } from '../hooks/useDocTitle';

export default function Resume() {
  useDocTitle('Resume');
  return (
    <main id="main" className="page resume">
      <PointerParallax>
        <Obj3D kind="pencil" tone="butter" size={40} depth={20} float={8} rot={-26} className="hide-m" style={{ right: '8%', top: '11%' }} />
        <Obj3D kind="torus" tone="lavender" size={92} depth={26} float={9} spin className="hide-m" style={{ right: '19%', top: '18%' }} />
        <Obj3D kind="spark" tone="coral" size={46} depth={16} float={6} spin className="hide-m" style={{ right: '5%', top: '27%' }} />
      </PointerParallax>
      <div className="wrap">
        <header className="page-head">
          <Portrait className="sm" />
          <p className="eyebrow">Resume</p>
          <SplitText as="h1" by="char" hover text={personal.name} />
          <p className="page-sub">{personal.title} · {personal.location}</p>
          <Magnetic><a className="btn-solid" href={asset(personal.resumePath)} download>Download resume (PDF) <Download /></a></Magnetic>
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
