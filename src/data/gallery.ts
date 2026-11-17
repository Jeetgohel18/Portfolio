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
  { id: 'g1', title: 'Identity system', category: 'Branding', size: 'feature', art: 'logo', palette: ['#2b3a2f', '#f3efe6', '#f2b84b'] },
  { id: 'g2', title: 'Poster study 01', category: 'Posters', size: 'tall', art: 'poster', palette: ['#ff5a24', '#14130f', '#f3efe6'] },
  { id: 'g3', title: 'Social series', category: 'Social media', size: 'square', art: 'social', palette: ['#f1d9cf', '#2a1710', '#d6336c'] },
  { id: 'g4', title: 'Campaign key visual', category: 'Campaign', size: 'wide', art: 'campaign', palette: ['#1d2a4a', '#f3efe6', '#7bd6c4'] },
  { id: 'g5', title: 'Illustration study', category: 'Illustration', size: 'tall', art: 'illustration', palette: ['#e9e2d3', '#14130f', '#ff5a24'] },
  { id: 'g6', title: 'Type exploration', category: 'Explorations', size: 'small', art: 'type', palette: ['#14130f', '#f3efe6', '#c7f23b'] },
  { id: 'g7', title: 'Logo marks', category: 'Branding', size: 'small', art: 'logo', palette: ['#f3efe6', '#14130f', '#ff5a24'] },
  { id: 'g8', title: 'Poster study 02', category: 'Posters', size: 'square', art: 'poster', palette: ['#c7f23b', '#14130f', '#f3efe6'] },
  { id: 'g9', title: 'Social carousel', category: 'Social media', size: 'wide', art: 'social', palette: ['#14130f', '#f3efe6', '#ff5a24'] },
  { id: 'g10', title: 'Campaign poster', category: 'Campaign', size: 'tall', art: 'campaign', palette: ['#d6336c', '#f3efe6', '#14130f'] },
  { id: 'g11', title: 'Creative exploration', category: 'Explorations', size: 'square', art: 'type', palette: ['#7bd6c4', '#14130f', '#f3efe6'] },
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
  { id: 'm1', title: 'Logo reveal', kind: 'MP4', note: 'Drop an .mp4 in public/videos/', palette: ['#14130f', '#f3efe6', '#ff5a24'] },
  { id: 'm2', title: 'Micro-interaction', kind: 'GIF', note: 'Drop a .gif in public/images/experiments/', palette: ['#e9e2d3', '#14130f', '#d6336c'] },
  { id: 'm3', title: 'Prototype', kind: 'Prototype', note: 'Add a Figma / Framer embed URL', palette: ['#1d2a4a', '#f3efe6', '#7bd6c4'] },
  { id: 'm4', title: 'Loader study', kind: 'Animation', note: 'Animated visual asset', palette: ['#ff5a24', '#14130f', '#f3efe6'] },
  { id: 'm5', title: 'Page transition', kind: 'MP4', note: 'Drop an .mp4 in public/videos/', palette: ['#2b3a2f', '#f3efe6', '#f2b84b'] },
];
