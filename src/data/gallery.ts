/**
 * "Visual design" gallery — a curated selection of real work, each linking back to its project.
 * To add a piece: add an item here pointing at an image that already lives in public/images/projects/.
 * `size` controls its footprint in the editorial grid.
 */
export type GalleryCategory = 'Logos' | 'Packaging' | 'Campaign';

export type GalleryItem = {
  id: string;
  title: string;
  project: string;
  slug: string;
  category: GalleryCategory;
  size: 'wide' | 'square' | 'half' | 'feature';
  src: string;
  w: number;
  h: number;
  alt: string;
};

export const galleryCategories: GalleryCategory[] = ['Logos', 'Packaging', 'Campaign'];

const P = 'images/projects/';
export const gallery: GalleryItem[] = [
  { id: 'g1', title: 'Gift box presentation', project: 'Lummi', slug: 'lummi', category: 'Packaging', size: 'feature', src: `${P}lummi/brand-in-hand.webp`, w: 1997, h: 1123, alt: 'A hand presenting a pale green Lummi gift box' },
  { id: 'g2', title: 'Logo — burgundy on cream', project: 'NOAH · Concept 01', slug: 'noah', category: 'Logos', size: 'square', src: `${P}noah/concept-1-logo-primary.webp`, w: 986, h: 986, alt: 'NOAH concept 1 logo in burgundy on cream' },
  { id: 'g3', title: 'Logo — sage on pale green', project: 'Lummi', slug: 'lummi', category: 'Logos', size: 'square', src: `${P}lummi/logo-primary.webp`, w: 986, h: 986, alt: 'Lummi logo in sage green on a pale green background' },
  { id: 'g4', title: 'Coffee bag with hang tag', project: 'NOAH · Concept 01', slug: 'noah', category: 'Packaging', size: 'wide', src: `${P}noah/concept-1-packaging.webp`, w: 1997, h: 1123, alt: 'NOAH concept 1 cream coffee bag with burgundy hang tag' },
  { id: 'g5', title: 'Logo — lavender on white', project: 'NOAH · Concept 02', slug: 'noah', category: 'Logos', size: 'half', src: `${P}noah/concept-2-logo-primary.webp`, w: 986, h: 987, alt: 'NOAH concept 2 logo in lavender on white' },
  { id: 'g6', title: 'Logo — charcoal on lavender', project: 'NOAH · Concept 02', slug: 'noah', category: 'Logos', size: 'half', src: `${P}noah/concept-2-logo-reversed.webp`, w: 986, h: 986, alt: 'NOAH concept 2 logo in charcoal on lavender' },
  { id: 'g7', title: 'New collection', project: 'Lummi', slug: 'lummi', category: 'Campaign', size: 'wide', src: `${P}lummi/campaign-banner.webp`, w: 1997, h: 1124, alt: 'Lummi campaign visual: a new collection announcement with earrings and a portrait' },
  { id: 'g8', title: 'Logo — sage on cream', project: 'NOAH · Concept 03', slug: 'noah', category: 'Logos', size: 'square', src: `${P}noah/concept-3-logo-primary.webp`, w: 986, h: 986, alt: 'NOAH concept 3 logo in sage on cream' },
  { id: 'g9', title: 'Logo — cream on burgundy', project: 'NOAH · Concept 01', slug: 'noah', category: 'Logos', size: 'square', src: `${P}noah/concept-1-logo-reversed.webp`, w: 986, h: 986, alt: 'NOAH concept 1 logo in cream on burgundy' },
  { id: 'g10', title: 'Coffee bag on dark blue', project: 'NOAH · Concept 02', slug: 'noah', category: 'Packaging', size: 'wide', src: `${P}noah/concept-2-packaging.webp`, w: 1997, h: 1123, alt: 'NOAH concept 2 white coffee bag with lavender label' },
  { id: 'g11', title: 'Packaging in use', project: 'NOAH · Concept 03', slug: 'noah', category: 'Packaging', size: 'wide', src: `${P}noah/concept-3-in-hand.webp`, w: 1997, h: 1123, alt: 'Two hands holding NOĀH coffee bags' },
  { id: 'g12', title: 'Logo — cream on sage', project: 'NOAH · Concept 03', slug: 'noah', category: 'Logos', size: 'square', src: `${P}noah/concept-3-logo-reversed.webp`, w: 986, h: 986, alt: 'NOAH concept 3 logo in cream on sage' },
];
