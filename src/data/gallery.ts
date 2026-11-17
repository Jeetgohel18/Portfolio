/**
 * Graphic & branding gallery + motion experiments.
 * Set `src` to a file in public/images/projects/graphics/ (or branding/) to replace a placeholder.
 */
export type GalleryCategory = 'Branding' | 'Social media' | 'Posters' | 'Campaign' | 'Illustration' | 'Explorations';

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  /** Layout size in the editorial grid. */
  size: 'tall' | 'wide' | 'square' | 'small' | 'feature';
  art: 'logo' | 'poster' | 'social' | 'campaign' | 'illustration' | 'type';
  palette: [string, string, string];
  src?: string;
};

export const galleryCategories: GalleryCategory[] = ['Branding', 'Social media', 'Posters', 'Campaign', 'Illustration', 'Explorations'];

export const gallery: GalleryItem[] = [
  { id: 'g1', title: 'Identity system', category: 'Branding', size: 'feature', art: 'logo', palette: ['#3b47ff', '#f6f0e4', '#ffd75e'] },
  { id: 'g2', title: 'Poster study 01', category: 'Posters', size: 'tall', art: 'poster', palette: ['#ff6a4a', '#1f1a17', '#fffaf1'] },
  { id: 'g3', title: 'Social series', category: 'Social media', size: 'square', art: 'social', palette: ['#cdbdff', '#1f1a17', '#ff6a4a'] },
  { id: 'g4', title: 'Campaign key visual', category: 'Campaign', size: 'wide', art: 'campaign', palette: ['#1e1416', '#f6f0e4', '#bfe6cf'] },
  { id: 'g5', title: 'Illustration study', category: 'Illustration', size: 'tall', art: 'illustration', palette: ['#ffd75e', '#1f1a17', '#3b47ff'] },
  { id: 'g6', title: 'Type exploration', category: 'Explorations', size: 'small', art: 'type', palette: ['#1f1a17', '#f6f0e4', '#ffd75e'] },
  { id: 'g7', title: 'Logo marks', category: 'Branding', size: 'small', art: 'logo', palette: ['#f6f0e4', '#1f1a17', '#ff6a4a'] },
  { id: 'g8', title: 'Poster study 02', category: 'Posters', size: 'square', art: 'poster', palette: ['#bfe6cf', '#1f1a17', '#3b47ff'] },
  { id: 'g9', title: 'Social carousel', category: 'Social media', size: 'wide', art: 'social', palette: ['#3b47ff', '#fffaf1', '#ffd75e'] },
  { id: 'g10', title: 'Campaign poster', category: 'Campaign', size: 'tall', art: 'campaign', palette: ['#7a1f2b', '#fffaf1', '#ffd75e'] },
  { id: 'g11', title: 'Creative exploration', category: 'Explorations', size: 'square', art: 'type', palette: ['#cdbdff', '#1f1a17', '#3b47ff'] },
];

export type MotionItem = {
  id: string;
  title: string;
  kind: 'MP4' | 'GIF' | 'Prototype' | 'Animation';
  note: string;
  palette: [string, string, string];
  /** public path, e.g. 'videos/logo-reveal.mp4' */
  video?: string;
  /** public path, e.g. 'images/experiments/loader.gif' */
  gif?: string;
  poster?: string;
  /** Interactive prototype URL (Figma/Framer embed) */
  embed?: string;
};

export const motionItems: MotionItem[] = [
  { id: 'm1', title: 'Logo reveal', kind: 'MP4', note: 'Drop an .mp4 in public/videos/', palette: ['#1e1416', '#f6f0e4', '#ff6a4a'] },
  { id: 'm2', title: 'Micro-interaction', kind: 'GIF', note: 'Drop a .gif in public/images/experiments/', palette: ['#ffd75e', '#1f1a17', '#3b47ff'] },
  { id: 'm3', title: 'Prototype', kind: 'Prototype', note: 'Add a Figma / Framer embed URL', palette: ['#cdbdff', '#1f1a17', '#ff6a4a'] },
  { id: 'm4', title: 'Loader study', kind: 'Animation', note: 'Animated visual asset', palette: ['#ff6a4a', '#1f1a17', '#fffaf1'] },
  { id: 'm5', title: 'Page transition', kind: 'MP4', note: 'Drop an .mp4 in public/videos/', palette: ['#3b47ff', '#f6f0e4', '#ffd75e'] },
];
