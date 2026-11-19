/**
 * REAL PROJECTS — the single source of truth for the homepage cards, filters and project pages.
 *
 * HOW TO ADD A PROJECT
 *  1. Put optimised images in  public/images/projects/<slug>/  (webp/jpg, ≤ 2000px wide, descriptive file names).
 *  2. Add an entry below. Each image needs its real pixel size (w, h) so layouts reserve space and never jump.
 *  3. Describe only what the artwork itself shows. Leave a detail out rather than inventing it.
 *  Sections are built from "blocks" (image · pair · split · text · palette · keywords) — mix them per project;
 *  the page layout, lightbox, sticky section navigation and prev/next links are generated automatically.
 */
export type Discipline = 'ui' | 'brand' | 'graphic';

export const DISCIPLINES: Record<Discipline, string> = {
  ui: 'UI/UX Design',
  brand: 'Branding',
  graphic: 'Graphic Design',
};

export type Img = { src: string; w: number; h: number; alt: string; caption?: string };

export type Block =
  | { kind: 'image'; img: Img; width?: 'full' | 'wide' | 'narrow' }
  | { kind: 'pair'; imgs: [Img, Img]; square?: boolean }
  | { kind: 'split'; img: Img; title: string; body: string; flip?: boolean }
  | { kind: 'text'; title?: string; body: string[] }
  | { kind: 'palette'; colors: { hex: string; label?: string }[]; note?: string }
  | { kind: 'keywords'; words: string[] };

export type Section = {
  id: string;
  title: string;
  lead?: string;
  /** Optional tinted panel so separate design directions never visually blend. */
  theme?: { bg: string; fg: string; accent: string };
  blocks: Block[];
};

export type AccentKind = 'web' | 'mobile' | 'dashboard' | 'product' | 'brand' | 'graphic';

export type Project = {
  slug: string;
  title: string;
  discipline: Discipline;
  /** Label shown on the card, e.g. "Brand Identity". */
  category: string;
  summary: string;
  role: string;
  deliverables: string[];
  cover: Img;
  /** [stage background, ink, accent] used for the card stage and the page hero. */
  palette: [string, string, string];
  /** Which 3D accent objects decorate the card. */
  accent: AccentKind;
  /** 1 = first in "Selected work". Lower comes first; unset projects follow in array order. */
  featured?: number;
  sections: Section[];
};

const P = 'images/projects/';
const img = (path: string, w: number, h: number, alt: string, caption?: string): Img => ({ src: `${P}${path}.webp`, w, h, alt, caption });

/* ───────────────────────────── LUMMI ───────────────────────────── */
const lummi = {
  moodboard: img('lummi/moodboard', 1862, 2217, 'Lummi moodboard: gradient light, silk, white blossom, a green pouch and an embossed card with the logo, plus the colour palette', 'Moodboard and colour direction'),
  letters: img('lummi/letterform-exploration', 2000, 440, 'Four letterform studies representing the letters L, U, M and I, and the combined Lummi symbol', 'Letterform exploration — the symbol is built from the letters L, U, M and I'),
  logoLight: img('lummi/logo-primary', 986, 986, 'Lummi logo in sage green on a pale green background', 'Primary logo — light'),
  logoSage: img('lummi/logo-reversed', 986, 986, 'Lummi logo in pale green on a sage green background', 'Logo — reversed'),
  hand: img('lummi/brand-in-hand', 1997, 1123, 'A hand presenting a pale green Lummi gift box against a green wall', 'Product presentation'),
  banner: img('lummi/campaign-banner', 1997, 1124, 'Lummi campaign visual: a New Collection announcement with pear-cut earrings and a portrait', 'Campaign visual — new collection'),
};

/* ───────────────────────────── NOAH ───────────────────────────── */
const n1 = {
  mood: img('noah/concept-1-moodboard', 1810, 2080, 'NOAH concept 1 moodboard: coffee farmers, ripe cherries, roasted bean texture, cups and the burgundy and cream palette', 'Concept 01 — moodboard'),
  story: img('noah/concept-1-coffee-cherry-story', 1626, 625, 'Four stages of the coffee cherry: Grow, Pick, Process, Dry', 'From cherry to bean — Grow · Pick · Process · Dry'),
  mark: img('noah/concept-1-logo-illustration', 1438, 1020, 'NOAH concept 1 emblem: two coffee farmers and a coffee plant illustrated inside a coffee-bean silhouette, annotated', 'The emblem — farm landscape, farmers, berries and plant'),
  light: img('noah/concept-1-logo-primary', 986, 986, 'NOAH concept 1 logo in burgundy on cream', 'Logo — burgundy on cream'),
  dark: img('noah/concept-1-logo-reversed', 986, 986, 'NOAH concept 1 logo in cream on burgundy', 'Logo — cream on burgundy'),
  pack: img('noah/concept-1-packaging', 1997, 1123, 'NOAH concept 1 cream coffee bag with a burgundy hang tag, surrounded by coffee beans and cherries', 'Packaging application'),
};
const n2 = {
  mood: img('noah/concept-2-moodboard', 1799, 2070, 'NOAH concept 2 moodboard: coffee crema, lavender latte, lavender fields, coffee grounds and a lavender palette', 'Concept 02 — moodboard'),
  mark: img('noah/concept-2-logo-concept', 1918, 1460, 'NOAH concept 2 character mark: a figure tasting a coffee bean inside a circle, with four annotations', 'The mark — "The Coffee Ritual"'),
  light: img('noah/concept-2-logo-primary', 986, 987, 'NOAH concept 2 logo in lavender on white', 'Logo — lavender on white'),
  dark: img('noah/concept-2-logo-reversed', 986, 986, 'NOAH concept 2 logo in charcoal on lavender', 'Logo — charcoal on lavender'),
  pack: img('noah/concept-2-packaging', 1997, 1123, 'NOAH concept 2 white coffee bag with a lavender label on a dark blue background', 'Packaging application'),
};
const n3 = {
  mood: img('noah/concept-3-moodboard', 1795, 2080, 'NOAH concept 3 moodboard: green coffee beans, sage leaves, water, a pour-over and a cup, with a sage and cream palette', 'Concept 03 — moodboard'),
  roast: img('noah/concept-3-roast-development', 1982, 1000, 'Roast development: seven coffee beans from green to dark roast across 12 minutes', 'Roast development — colour change from heat reaction'),
  letters: img('noah/concept-3-letterform-study', 1857, 750, 'NOĀH wordmark constructed on a grid with four annotations', 'Wordmark construction'),
  light: img('noah/concept-3-logo-primary', 986, 986, 'NOĀH logo in sage on cream', 'Logo — sage on cream'),
  dark: img('noah/concept-3-logo-reversed', 986, 986, 'NOĀH logo in cream on sage', 'Logo — cream on sage'),
  hand: img('noah/concept-3-in-hand', 1997, 1123, 'Two hands holding NOĀH coffee bags, one white and one sage green, with illustrated brewing equipment', 'Packaging in use'),
};

export const projects: Project[] = [
  {
    slug: 'lummi',
    title: 'Lummi',
    discipline: 'brand',
    category: 'Brand Identity',
    summary: 'A soft, minimal and elegant brand identity: a letterform symbol built from L, U, M and I, a palette of natural greens and warm neutrals, and its application on product and campaign visuals.',
    role: 'Brand identity design',
    deliverables: ['Logo concept', 'Letterform exploration', 'Moodboard', 'Colour direction', 'Product & campaign visuals'],
    cover: lummi.hand,
    palette: ['#e5edd6', '#313131', '#5c6241'],
    accent: 'brand',
    featured: 5,
    sections: [
      {
        id: 'direction', title: 'Creative direction',
        lead: 'The brief reads in the artwork itself: clean, minimal, elegant, premium and timeless.',
        blocks: [
          { kind: 'keywords', words: ['Clean', 'Minimal', 'Elegant', 'Premium', 'Timeless', 'Soft & luminous', 'Feminine & gentle'] },
          { kind: 'split', img: lummi.moodboard, title: 'Moodboard', body: 'Diffused gradient light, flowing silk, white blossom and a green velvet pouch set the references. An embossed card in deep olive shows how the symbol sits on natural, tactile surfaces.' },
        ],
      },
      {
        id: 'logo', title: 'Logo & letterforms',
        lead: 'One flowing symbol made from four letters.',
        blocks: [
          { kind: 'image', img: lummi.letters, width: 'wide' },
          { kind: 'pair', imgs: [lummi.logoLight, lummi.logoSage], square: true },
        ],
      },
      {
        id: 'colour', title: 'Colour',
        lead: 'Natural green and warm neutral tones.',
        blocks: [
          { kind: 'palette', colors: [{ hex: '#e5edd6' }, { hex: '#a9b98a' }, { hex: '#5c6241' }, { hex: '#f4efe5' }, { hex: '#313131' }], note: 'Colours taken directly from the supplied artwork.' },
        ],
      },
      {
        id: 'applications', title: 'Brand in use',
        lead: 'Product and campaign presentation.',
        blocks: [
          { kind: 'image', img: lummi.hand, width: 'full' },
          { kind: 'image', img: lummi.banner, width: 'full' },
        ],
      },
    ],
  },
  {
    slug: 'noah',
    title: 'NOAH',
    discipline: 'brand',
    category: 'Brand Identity Exploration',
    summary: 'Three separate brand identity directions for a coffee brand — each a complete concept with its own moodboard, logo, colour palette and packaging. Presented side by side, never blended.',
    role: 'Brand identity design',
    deliverables: ['Three logo concepts', 'Moodboards', 'Logo variations', 'Colour palettes', 'Packaging applications'],
    cover: n1.pack,
    palette: ['#fff9c7', '#3c2722', '#940428'],
    accent: 'brand',
    featured: 6,
    sections: [
      {
        id: 'concept-01', title: 'Concept 01', lead: 'The fruit reveals the coffee within. An origin story told through the coffee cherry, its farmers and its plant.',
        theme: { bg: '#fffbe0', fg: '#3c2722', accent: '#940428' },
        blocks: [
          { kind: 'split', img: n1.mood, title: 'Moodboard & direction', body: 'Hand-picked ripe cherries, tea-terrace landscapes, a halved fruit and roasted texture anchor the concept in origin. Cream, burgundy and a soft blue carry the palette.' },
          { kind: 'image', img: n1.story, width: 'wide' },
          { kind: 'image', img: n1.mark, width: 'wide' },
          { kind: 'pair', imgs: [n1.light, n1.dark], square: true },
          { kind: 'palette', colors: [{ hex: '#fff9c7' }, { hex: '#940428' }, { hex: '#c7d8ea' }, { hex: '#3c2722' }, { hex: '#313131' }], note: 'Concept 01 palette, taken from the artwork.' },
          { kind: 'image', img: n1.pack, width: 'full' },
        ],
      },
      {
        id: 'concept-02', title: 'Concept 02', lead: 'NOAH — The Coffee Ritual. A friendly character mark that puts the drinking moment at the centre.',
        theme: { bg: '#efedfa', fg: '#282828', accent: '#6f65c9' },
        blocks: [
          { kind: 'split', img: n2.mood, title: 'Moodboard & direction', body: 'Swirling crema, a lavender latte, lavender fields at sunrise and dark grounds set a calm, ritual mood. A single lavender is paired with white and charcoal.', flip: true },
          { kind: 'image', img: n2.mark, width: 'wide' },
          { kind: 'pair', imgs: [n2.light, n2.dark], square: true },
          { kind: 'palette', colors: [{ hex: '#ffffff' }, { hex: '#c2bce5' }, { hex: '#070603' }], note: 'Concept 02 palette, taken from the artwork.' },
          { kind: 'image', img: n2.pack, width: 'full' },
        ],
      },
      {
        id: 'concept-03', title: 'Concept 03', lead: 'Rooted in nature. Crafted for the coffee ritual. Soft organic letterforms and a green, natural palette.',
        theme: { bg: '#f3f6ee', fg: '#2c3a2a', accent: '#6f8a62' },
        blocks: [
          { kind: 'split', img: n3.mood, title: 'Moodboard & direction', body: 'Green coffee, sage leaves, clear water, a pour-over and a hand-held cup lead into a sage and cream palette with a macron-marked wordmark.' },
          { kind: 'image', img: n3.roast, width: 'wide' },
          { kind: 'image', img: n3.letters, width: 'wide' },
          { kind: 'pair', imgs: [n3.light, n3.dark], square: true },
          { kind: 'palette', colors: [{ hex: '#fffdea' }, { hex: '#afc2a2' }, { hex: '#ffffff' }, { hex: '#000000' }], note: 'Concept 03 palette, taken from the artwork.' },
          { kind: 'image', img: n3.hand, width: 'full' },
        ],
      },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Homepage order: `featured` ascending, then declaration order. */
export const orderedProjects = () =>
  [...projects].sort((a, b) => (a.featured ?? 999) - (b.featured ?? 999));

/** Every image on a project page, in reading order — drives the lightbox gallery. */
export function projectImages(p: Project): Img[] {
  const out: Img[] = [];
  for (const s of p.sections) for (const b of s.blocks) {
    if (b.kind === 'image' || b.kind === 'split') out.push(b.img);
    if (b.kind === 'pair') out.push(...b.imgs);
  }
  return out;
}
