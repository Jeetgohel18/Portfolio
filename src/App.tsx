import { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Loader } from './components/Loader';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Cursor } from './components/fx/Cursor';
import Home from './pages/Home';
import CaseStudy from './pages/CaseStudy';
import About from './pages/About';
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import NotFound from './pages/NotFound';

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
  const tone = useCallback((d: boolean) => setDark(d), []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSweep((n) => n + 1);
  }, [pathname]);

  const onHome = pathname === '/';
  return (
    <>
      <Cursor />
      {!loaded && <Loader onDone={done} />}
      <Nav tone={onHome && dark ? 'dark' : 'light'} />
      <ScrollManager />
      {sweep > 0 && <div key={sweep} className="page-curtain" aria-hidden="true"><i /></div>}
      <div key={pathname.split('/')[1] + (pathname.split('/')[2] ?? '')} className="page-wrap">
        <Routes>
          <Route path="/" element={<Home ready={loaded} onTone={tone} />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
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
