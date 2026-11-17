import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { personal } from '../data/personal';
import { Reveal } from './Reveal';

/** Bridge between the homepage and the interactive About + Contact experiences. */
export function DeskTeasers() {
  return (
    <section className="section teasers">
      <div className="wrap teasers-grid">
        <Reveal as="div" className="teaser teaser-about" >
          <Link to="/about" id="about-teaser" aria-label="Visit the interactive desk — about me">
            <p className="eyebrow">06 — About</p>
            <h2>Pull up a <em>chair</em>.</h2>
            <p>My desk holds the story — a notebook, a resume card, the tools I use. Open things up.</p>
            <div className="mini-desk" aria-hidden="true">
              <div className="md-notebook"><i /><i /><i /></div>
              <div className="md-card" />
              <div className="md-cup" />
              <div className="md-pen" />
            </div>
            <span className="btn-link">Open the desk <ArrowUpRight size={16} /></span>
          </Link>
        </Reveal>
        <Reveal as="div" delay={120} className="teaser teaser-contact">
          <Link to="/contact" id="contact-teaser" aria-label="Write me a letter — contact">
            <p className="eyebrow">07 — Contact</p>
            <h2>Write me a <em>letter</em>.</h2>
            <p>{personal.email}</p>
            <div className="mini-env" aria-hidden="true"><div className="me-flap" /><div className="me-paper"><i /><i /><i /></div><div className="me-body" /></div>
            <span className="btn-link">Open the letter <ArrowUpRight size={16} /></span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
