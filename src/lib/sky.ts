export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as RGB;
const css = (c: RGB) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// hour → [top, middle, bottom]
const KEYS: [number, string, string, string][] = [
  [0, '#070b1f', '#0d1633', '#1a2347'],
  [4.5, '#0e1534', '#2b2656', '#5b4478'],
  [6, '#3a4a8c', '#c9708a', '#ffb07a'],
  [7.5, '#5f8fd0', '#9cc4e6', '#ffe0b0'],
  [10, '#3f86d6', '#7db9ec', '#cfe8f6'],
  [13, '#2f7fd8', '#6fb3ee', '#c3e4f7'],
  [16.5, '#4a88d0', '#98c2e6', '#f0ecd0'],
  [18.2, '#3a4a94', '#e07a88', '#ffb36b'],
  [19.5, '#1d2354', '#58407a', '#c8607a'],
  [21, '#0b1230', '#1a2350', '#2d3562'],
  [24, '#070b1f', '#0d1633', '#1a2347'],
];

const SEASON = {
  spring: { tint: '#ffc9dc', amt: 0.1, hill: ['#a8cf8c', '#86b873', '#5e9a60'], label: 'Spring' },
  summer: { tint: '#ffe28a', amt: 0.1, hill: ['#86b86c', '#62995a', '#43803f'], label: 'Summer' },
  autumn: { tint: '#ff9a52', amt: 0.14, hill: ['#dd9f55', '#c27536', '#97502a'], label: 'Autumn' },
  winter: { tint: '#d7e8ff', amt: 0.16, hill: ['#eef3fa', '#d3deec', '#b4c4da'], label: 'Winter' },
} as const;

export const seasonLabel = (s: Season) => SEASON[s].label;

export function skyState(hour: number, season: Season) {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && h >= KEYS[i + 1][0]) i++;
  const [h0, ...a] = KEYS[i];
  const [h1, ...b] = KEYS[i + 1];
  const t = smooth(0, 1, (h - h0) / (h1 - h0));
  const tint = hex(SEASON[season].tint);
  const night = hex('#080d22');
  // sun elevation: 0 at 6h, 1 at 12h, 0 at 18h
  const theta = ((h - 6) / 24) * Math.PI * 2;
  const elev = Math.sin(theta);
  const daylight = smooth(-0.12, 0.3, elev);
  const cols = [0, 1, 2].map((k) =>
    mix(mix(hex(a[k]), hex(b[k]), t), tint, SEASON[season].amt * (0.4 + 0.6 * daylight)),
  );
  const hills = SEASON[season].hill.map((c) => css(mix(night, hex(c), 0.22 + 0.78 * daylight)));
  const dusk = smooth(0.35, 0, Math.abs(elev)) * (1 - 0) ; // warm glow near horizon
  return {
    top: css(cols[0]),
    mid: css(cols[1]),
    bottom: css(cols[2]),
    hills,
    theta,
    daylight,
    stars: 1 - smooth(-0.25, 0.1, elev),
    glow: dusk,
    dark: daylight < 0.5,
    sunVisible: elev > -0.18,
  };
}

export function formatHour(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const ap = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}

export function phaseName(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  if (h < 4.5 || h >= 21) return 'Night';
  if (h < 7.5) return 'Sunrise';
  if (h < 11) return 'Morning';
  if (h < 16) return 'Daytime';
  if (h < 17.8) return 'Afternoon';
  if (h < 20) return 'Sunset';
  return 'Dusk';
}

export function currentSeason(): Season {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 8) return 'summer';
  if (m >= 9 && m <= 10) return 'autumn';
  return 'winter';
}
