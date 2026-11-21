import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowDown, Flower2, Leaf, Moon, Snowflake, Sun, Sunrise, Sunset, Waves } from 'lucide-react';
import { SplitText } from './fx/SplitText';
import { Obj3D } from './fx/Obj3D';
import { PointerParallax } from './fx/PointerParallax';
import { Magnetic } from './fx/Magnetic';
import { personal } from '../data/personal';
import { currentSeason, formatHour, phaseName, seasons, seasonLabel, skyState, type Season } from '../lib/sky';
import { useReducedMotion } from '../hooks/useReducedMotion';

const CX = 50, CY = 80, RX = 42, RY = 66; // arc geometry, % of stage

const rand = (n: number) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
const STARS = Array.from({ length: 70 }, (_, i) => ({ x: rand(i + 1) * 100, y: rand(i + 101) * 62, s: 1 + rand(i + 201) * 2, d: rand(i + 301) * 4 }));
const BITS = Array.from({ length: 22 }, (_, i) => ({ x: rand(i + 7) * 100, d: rand(i + 17) * -14, t: 9 + rand(i + 27) * 10, s: 0.6 + rand(i + 37) * 0.9, w: (rand(i + 47) - 0.5) * 160 }));

// Static layers are memoised so dragging the sun only re-renders what actually changes.
const Stars = memo(function Stars() {
  return (
    <div className="sky-stars" aria-hidden="true">
      {STARS.map((s, i) => <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}
    </div>
  );
});
const Particles = memo(function Particles({ season }: { season: Season }) {
  return (
    <div className={`particles p-${season}`} aria-hidden="true">
      {BITS.map((b, i) => <i key={`${season}-${i}`} style={{ left: `${b.x}%`, animationDelay: `${b.d}s`, animationDuration: `${b.t}s`, '--s': b.s, '--w': `${b.w}px` } as CSSProperties} />)}
    </div>
  );
});
const Landscape = memo(function Landscape() {
  return (
    <>
      <svg className="land back" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 210 C180 120 340 190 520 150 S860 70 1040 140 S1340 170 1440 120 V400 H0Z" fill="var(--hill1)" /></svg>
      <svg className="land mid" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 250 C220 190 380 270 600 220 S980 170 1160 230 S1380 240 1440 200 V400 H0Z" fill="var(--hill2)" /></svg>
      <svg className="trees" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        {[[170, 190, 1], [300, 210, 0.8], [1090, 195, 1.1], [1240, 215, 0.85], [1350, 200, 0.7]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-4" y="0" width="8" height="70" fill="var(--trunk)" />
            <path d="M0 22 L-22 4 M0 34 L24 12" stroke="var(--trunk)" strokeWidth="4" strokeLinecap="round" />
            <circle className="leaf" cx="0" cy="-8" r="34" /><circle className="leaf" cx="-26" cy="14" r="22" /><circle className="leaf" cx="28" cy="10" r="24" />
          </g>
        ))}
      </svg>
      <svg className="land front" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 300 C260 250 480 330 760 290 S1180 250 1440 296 V400 H0Z" fill="var(--hill3)" /></svg>
    </>
  );
});

const PRESETS = [
  { label: 'Dawn', hour: 6.3, Icon: Sunrise }, { label: 'Day', hour: 12.5, Icon: Sun }, { label: 'Dusk', hour: 17.95, Icon: Sunset }, { label: 'Night', hour: 23.2, Icon: Moon },
];
const SEASON_ICON = { spring: Flower2, summer: Waves, autumn: Leaf, winter: Snowflake } as const;

export function SkyHero({ ready, onTone }: { ready: boolean; onTone: (dark: boolean) => void }) {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [hour, setHour] = useState(() => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; });
  const [season, setSeason] = useState<Season>(currentSeason);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const raf = useRef(0);
  const root = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sky = useMemo(() => skyState(hour, season), [hour, season]);
  useEffect(() => { onTone(sky.dark); }, [sky.dark, onTone]);


  // Convert pointer to hour. `isMoon`: the grabbed orb sits on the opposite side of the cycle.
  const pointerToHour = useCallback((e: { clientX: number; clientY: number }, isMoon: boolean) => {
    const r = stage.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    const u = (CX - px) / RX, v = (CY - py) / RY;
    let th = Math.atan2(v, u);
    if (isMoon) th -= Math.PI;
    return ((6 + (th / (Math.PI * 2)) * 24) % 24 + 24) % 24;
  }, []);

  const tween = useCallback((target: number) => {
    cancelAnimationFrame(raf.current);
    setTouched(true);
    if (reduced) { setHour(target); return; }
    const from = hour;
    let diff = (target - from) % 24;
    if (diff < 0) diff += 24;             // always travel forward in time
    const start = performance.now(), dur = 1100 + diff * 40;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setHour((from + diff * e) % 24);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [hour, reduced]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onDown = (moon: boolean) => (e: PointerEvent<HTMLButtonElement>) => {
    cancelAnimationFrame(raf.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true); setTouched(true);
    setHour(pointerToHour(e, moon));
  };
  const pending = useRef<number | null>(null);
  const onMove = (moon: boolean) => (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const h = pointerToHour(e, moon);
    if (pending.current === null) {
      pending.current = requestAnimationFrame(() => { pending.current = null; setHour(h); });
    } else {
      // keep only the latest sample per frame
      cancelAnimationFrame(pending.current);
      pending.current = requestAnimationFrame(() => { pending.current = null; setHour(h); });
    }
  };
  const onUp = () => setDragging(false);
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 0.25;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setTouched(true); setHour((h) => (h + step) % 24); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setTouched(true); setHour((h) => (h - step + 24) % 24); }
    if (e.key === 'Home') { e.preventDefault(); setHour(6); }
    if (e.key === 'End') { e.preventDefault(); setHour(18); }
  };

  const th = sky.theta;
  const sunPos = { left: `${CX - RX * Math.cos(th)}%`, top: `${CY - RY * Math.sin(th)}%` };
  const moonPos = { left: `${CX + RX * Math.cos(th)}%`, top: `${CY + RY * Math.sin(th)}%` };
  const sunOn = Math.sin(th) > -0.18;
  const elevVisible = sunOn ? Math.sin(th) : -Math.sin(th); // how far the visible orb is above the horizon (hint hides when it is low behind the hills)
  const label = `${formatHour(hour)}, ${phaseName(hour)}`;

  const style = {
    '--sky-top': sky.top, '--sky-mid': sky.mid, '--sky-bot': sky.bottom,
    '--hill1': sky.hills[0], '--hill2': sky.hills[1], '--hill3': sky.hills[2],
    '--day': sky.daylight.toFixed(3), '--night': (1 - sky.daylight).toFixed(3), '--stars': sky.stars.toFixed(3),
    '--glow': sky.glow.toFixed(3),
  } as CSSProperties;

  return (
    <section id="top" ref={root} className={`sky ${sky.dark ? 'is-dark' : 'is-light'} season-${season} ${dragging ? 'dragging' : ''} ${ready ? 'ready' : ''} ${offscreen ? 'paused' : ''}`} style={style} aria-label="Introduction">
      <div className="sky-stage" ref={stage}>
        <div className="sky-bg" />
        <div className="sky-glow" />
        <Stars />
        <div className="birds" aria-hidden="true"><svg viewBox="0 0 24 10"><path d="M1 7 Q6 0 12 6 Q18 0 23 7" /></svg><svg viewBox="0 0 24 10"><path d="M1 7 Q6 0 12 6 Q18 0 23 7" /></svg><svg viewBox="0 0 24 10"><path d="M1 7 Q6 0 12 6 Q18 0 23 7" /></svg></div>
        <div className="sky-clouds" aria-hidden="true">
          <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" /><div className="cloud c4" />
        </div>

        {/* Sun */}
        <button
          type="button"
          data-cursor="Drag" className={`orb sun ${sunOn ? 'on' : ''}`}
          style={sunPos}
          role="slider"
          aria-label="Time of day. Drag the sun, or use arrow keys"
          aria-valuemin={0} aria-valuemax={24} aria-valuenow={Math.round(hour * 10) / 10} aria-valuetext={label}
          tabIndex={sunOn ? 0 : -1}
          onPointerDown={onDown(false)} onPointerMove={onMove(false)} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
        ><span className="orb-core" /></button>
        {/* Moon */}
        <button
          type="button"
          data-cursor="Drag" className={`orb moon ${!sunOn ? 'on' : ''}`}
          style={moonPos}
          role="slider"
          aria-label="Time of day. Drag the moon, or use arrow keys"
          aria-valuemin={0} aria-valuemax={24} aria-valuenow={Math.round(hour * 10) / 10} aria-valuetext={label}
          tabIndex={sunOn ? -1 : 0}
          onPointerDown={onDown(true)} onPointerMove={onMove(true)} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
        ><span className="orb-core" /></button>

        <div className={`drag-hint ${touched || elevVisible < 0.24 ? 'gone' : ''}`} style={{ left: `clamp(64px, ${sunOn ? sunPos.left : moonPos.left}, calc(100% - 64px))`, top: sunOn ? sunPos.top : moonPos.top }} aria-hidden="true">
          <span>Drag me</span>
        </div>

        <PointerParallax>
          <Obj3D kind="torus" tone="coral" size={118} depth={22} float={9} spin style={{ left: '17%', top: '5%' }} className="hide-m" />
          <Obj3D kind="cube" tone="cobalt" size={78} depth={30} float={8} spin style={{ left: '55%', top: '30%' }} className="hide-m" />
          <Obj3D kind="sphere" tone="metal" size={108} depth={36} float={10} style={{ right: '7%', top: '47%' }} />
          <Obj3D kind="capsule" tone="lavender" size={44} depth={18} float={6} rot={-24} style={{ right: '23%', top: '14%' }} className="hide-m" />
          <Obj3D kind="spark" tone="butter" size={62} depth={26} float={7} spin interactive label="Pop confetti" style={{ left: '37%', top: '9%' }} />
        </PointerParallax>
        <Particles season={season} />
        <Landscape />
      </div>

      {/* Copy */}
      <div className="sky-copy wrap">
        <p className="eyebrow sky-eyebrow">{personal.roles.join(' · ')}</p>
        <h1 className="sky-title">
          <SplitText as="span" className="line l1" by="char" hover active={ready} delay={150} text="Hi, I'm" />
          <span className="name-wrap">
            <SplitText as="span" className="line l2" by="char" hover active={ready} delay={420} stagger={55} text={`${personal.firstName}.`} />
            <svg className="badge" viewBox="0 0 120 120" aria-hidden="true">
              <defs><path id="circ" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
              <circle cx="60" cy="60" r="58" className="b-bg" />
              <text><textPath href="#circ" startOffset="0">UI/UX ✺ PRODUCT ✺ VISUAL ✺ MOTION ✺</textPath></text>
              <path className="b-star" d="M60 44 C61.6 54 66 58.4 76 60 C66 61.6 61.6 66 60 76 C58.4 66 54 61.6 44 60 C54 58.4 58.4 54 60 44Z" />
            </svg>
          </span>
        </h1>
        <p className="sky-lede">{personal.intro}</p>
      </div>

      {/* Controls */}
      <div className="sky-controls wrap">
        <div className="sky-dock">
          <div className="sky-readout" aria-live="off">
            {sky.dark ? <Moon /> : <Sun />}
            <strong>{formatHour(hour)}</strong>
            <span>{phaseName(hour)}</span>
          </div>
          <div className="sky-chips" role="group" aria-label="Jump to time of day">
            {PRESETS.map(({ label, hour: h, Icon }) => (
              <button key={label} type="button" onClick={() => tween(h)} aria-label={label} title={label}><Icon /><span className="lbl">{label}</span></button>
            ))}
          </div>
          <div className="sky-seasons" role="radiogroup" aria-label="Season">
            {seasons.map((se) => {
              const I = SEASON_ICON[se];
              return (
                <button key={se} type="button" role="radio" aria-checked={season === se} aria-label={seasonLabel(se)} title={seasonLabel(se)} className={season === se ? 'on' : ''} onClick={() => { setSeason(se); setTouched(true); }}><I /><span className="lbl">{seasonLabel(se)}</span></button>
              );
            })}
          </div>
        </div>
        <Magnetic><a className="sky-scroll" href="#intro" onClick={(e) => { e.preventDefault(); document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' }); }} aria-label="Scroll to content"><ArrowDown /></a></Magnetic>
      </div>
    </section>
  );
}
