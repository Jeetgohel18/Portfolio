/**
 * HOW TO ADD A PROJECT
 * 1. Add an entry below (copy an existing one).
 * 2. Drop images in public/images/projects/<category>/ and set `cover` / `images`
 *    (path relative to /public, e.g. 'images/projects/websites/acme-cover.jpg').
 * 3. Set `placeholder: false` so the "Sample" badge disappears.
 * 4. Optionally add case-study content in caseStudies.ts (same slug).
 * Anything without an image renders a designed placeholder composition.
 */
export type ProjectKind = 'web' | 'mobile' | 'dashboard' | 'product' | 'brand' | 'graphic';

export type Project = {
  slug: string;
  kind: ProjectKind;
  title: string;
  category: string;
  summary: string;
  role: string;
  year: string;
  platform: string;
  tools: string[];
  /** [background, foreground, accent] — used by placeholder art and case study theme. */
  palette: [string, string, string];
  cover?: string;
  images?: string[];
  /** true = clearly labelled sample content, not real work. */
  placeholder: boolean;
};

export const projects: Project[] = [
  {
    slug: 'website-project',
    kind: 'web',
    title: 'Website Project',
    category: 'Website Design',
    summary: 'Sample slot — a marketing or product website: structure, typography, layout system and responsive behaviour.',
    role: 'Role — to be added',
    year: 'Year — to be added',
    platform: 'Web · Desktop, tablet, mobile',
    tools: ['Figma', 'Framer', 'Photoshop'],
    palette: ['#e9e2d3', '#14130f', '#ff5a24'],
    placeholder: true,
  },
  {
    slug: 'mobile-app-project',
    kind: 'mobile',
    title: 'Mobile App Project',
    category: 'Mobile Application Design',
    summary: 'Sample slot — a mobile application: onboarding, core flows, navigation and interaction patterns.',
    role: 'Role — to be added',
    year: 'Year — to be added',
    platform: 'iOS · Android',
    tools: ['Figma', 'Illustrator'],
    palette: ['#1d2a4a', '#f3efe6', '#7bd6c4'],
    placeholder: true,
  },
  {
    slug: 'saas-dashboard-project',
    kind: 'dashboard',
    title: 'SaaS Dashboard Project',
    category: 'SaaS Dashboard',
    summary: 'Sample slot — a data-heavy product: information hierarchy, tables, charts and a scalable component set.',
    role: 'Role — to be added',
    year: 'Year — to be added',
    platform: 'Web app · Desktop first',
    tools: ['Figma'],
    palette: ['#14130f', '#f3efe6', '#c7f23b'],
    placeholder: true,
  },
  {
    slug: 'product-design-project',
    kind: 'product',
    title: 'Product Design Project',
    category: 'Product Design',
    summary: 'Sample slot — an end-to-end product: problem framing, flows, interface system and prototype.',
    role: 'Role — to be added',
    year: 'Year — to be added',
    platform: 'Web · Mobile',
    tools: ['Figma', 'Claude AI', 'ChatGPT'],
    palette: ['#f1d9cf', '#2a1710', '#d6336c'],
    placeholder: true,
  },
  {
    slug: 'brand-identity-project',
    kind: 'brand',
    title: 'Brand Identity Project',
    category: 'Branding & Visual Identity',
    summary: 'Sample slot — a visual identity: logo, colour, type, applications and brand guidelines.',
    role: 'Role — to be added',
    year: 'Year — to be added',
    platform: 'Print · Digital',
    tools: ['Illustrator', 'Affinity', 'Photoshop'],
    palette: ['#2b3a2f', '#f3efe6', '#f2b84b'],
    placeholder: true,
  },
  {
    slug: 'graphic-design-project',
    kind: 'graphic',
    title: 'Graphic Design Project',
    category: 'Graphic Design',
    summary: 'Sample slot — posters, social creatives and campaign visuals built on a flexible visual language.',
    role: 'Role — to be added',
    year: 'Year — to be added',
    platform: 'Social · Print',
    tools: ['Photoshop', 'Illustrator', 'Affinity'],
    palette: ['#ff5a24', '#14130f', '#f3efe6'],
    placeholder: true,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
