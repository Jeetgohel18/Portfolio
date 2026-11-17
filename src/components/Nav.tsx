import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navigation } from '../data/navigation';
import { personal } from '../data/personal';
import { useActiveSection } from '../hooks/useActiveSection';

export function Nav({ tone }: { tone: 'light' | 'dark' }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const onHome = pathname === '/';
  const section = useActiveSection(onHome ? ['top', 'work'] : [], [pathname]);

  useEffect(() => { setOpen(false); }, [pathname, hash]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const isActive = (to: string, sec?: string) => {
    if (to.startsWith('/#')) return onHome && section === sec;
    return pathname === to;
  };

  const goWork = (e: React.MouseEvent) => {
    if (onHome) {
      e.preventDefault();
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', '/#work');
    }
  };

  return (
    <header className={`nav ${tone} ${scrolled ? 'scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Link to="/" className="nav-brand" aria-label={`${personal.name} — home`} onClick={() => onHome && window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="nav-dot" />{personal.name}
      </Link>
      <nav aria-label="Primary" className="nav-links">
        {navigation.map((n) =>
          n.to.startsWith('/#') ? (
            <a key={n.label} href={n.to} onClick={goWork} className={`nav-link ${isActive(n.to, n.section) ? 'active' : ''}`} aria-current={isActive(n.to, n.section) ? 'location' : undefined}>
              <span data-text={n.label}>{n.label}</span>
            </a>
          ) : (
            <NavLink key={n.label} to={n.to} className={({ isActive: a }) => `nav-link ${n.label === 'Resume' ? 'cta' : ''} ${a ? 'active' : ''}`}>
              <span data-text={n.label}>{n.label}</span>
            </NavLink>
          ),
        )}
      </nav>
      <button ref={toggle} className="nav-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
        {open ? <X /> : <Menu />}
      </button>
      <div id="mobile-menu" className={`mobile-menu ${open ? 'open' : ''}`} inert={!open}>
        {navigation.map((n, i) => (
          <a
            key={n.label}
            href={n.to}
            style={{ transitionDelay: open ? `${120 + i * 70}ms` : '0ms' }}
            onClick={(e) => { e.preventDefault(); setOpen(false); n.to.startsWith('/#') && onHome ? goWork(e) : navigate(n.to); }}
          >
            <small>0{i + 1}</small>{n.label}
          </a>
        ))}
        <p>{personal.location}</p>
      </div>
    </header>
  );
}
