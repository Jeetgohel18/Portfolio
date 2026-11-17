import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { personal } from '../data/personal';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div>
          <p className="eyebrow">Let's make something</p>
          <a className="footer-mail" href={`mailto:${personal.email}`}>{personal.email}</a>
        </div>
        <ul className="footer-links">
          <li><a href={personal.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a></li>
          <li><a href={personal.behance} target="_blank" rel="noreferrer">Behance <ArrowUpRight size={14} /></a></li>
          <li><Link to="/resume">Resume</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <p className="footer-fine">© {new Date().getFullYear()} {personal.name} · {personal.location}</p>
      </div>
    </footer>
  );
}
