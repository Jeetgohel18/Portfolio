import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Loader } from './components/Loader';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Cursor } from './components/fx/Cursor';
import Home from './pages/Home';
import ProjectPage from './pages/Project';
import About from './pages/About';
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import NotFound from './pages/NotFound';

/** Entry experience: lazy-loaded so it never slows the portfolio; if it fails to load or crashes the portfolio simply opens. */
const Arcade = lazy(() => import('./components/playground/Arcade'));
const PLAYED = 'jg-played';

class PlaygroundGuard extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function PlaygroundShell({ onSkip }: { onSkip: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'var(--paper)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px var(--gut)' }} role="status" aria-label="Loading colour playground">
      <p style={{ margin: 0, font: '600 12px var(--font-body)', letterSpacing: '.14em', textTransform: 'uppercase' }}>Jeet Gohel — Creative Playground</p>
      <button type="button" className="btn-solid" onClick={onSkip}>Skip to Portfolio <span aria-hidden="true">→</span></button>
    </div>
  );
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [dark, setDark] = useState(false);
  const { pathname } = useLocation();
  const first = useRef(true);
  const [sweep, setSweep] = useState(0);
  const done = useCallback(() => setLoaded(true), []);
  // First visit of the session landing on "/" opens with the colour playground; deep links and return visits do not.
  const [intro, setIntro] = useState(() => {
    if (window.location.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/, ''), '') !== '/' && window.location.pathname !== '/') return false;
    try { return sessionStorage.getItem(PLAYED) !== '1' && !/[?&]intro=0\b/.test(window.location.search); } catch { return true; }
  });
  const reveal = useCallback(() => {
    try { sessionStorage.setItem(PLAYED, '1'); sessionStorage.setItem('jg-loaded', '1'); } catch { /* storage unavailable */ }
    setLoaded(true);
  }, []);
  const finishIntro = useCallback(() => setIntro(false), []);
  const skipAll = useCallback(() => { reveal(); finishIntro(); }, [reveal, finishIntro]);
  const tone = useCallback((d: boolean) => setDark(d), []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSweep((n) => n + 1);
  }, [pathname]);

  const onHome = pathname === '/';
  return (
    <>
      <Cursor />
      {intro && (
        <PlaygroundGuard onFail={skipAll}>
          <Suspense fallback={<PlaygroundShell onSkip={skipAll} />}>
            <Arcade onReveal={reveal} onDone={finishIntro} />
          </Suspense>
        </PlaygroundGuard>
      )}
      {!loaded && !intro && <Loader onDone={done} />}
      <Nav tone={onHome && dark ? 'dark' : 'light'} />
      <ScrollManager />
      {sweep > 0 && <div key={sweep} className="page-curtain" aria-hidden="true"><i /></div>}
      <div key={pathname.split('/')[1] + (pathname.split('/')[2] ?? '')} className="page-wrap">
        <Routes>
          <Route path="/" element={<Home ready={loaded} onTone={tone} />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}
