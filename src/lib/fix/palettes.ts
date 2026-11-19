import type { FixPalette } from './types';

/** Curated palettes for the colour challenge. `ink` is the text colour that reads on `bg`. */
export const FIX_PALETTES: FixPalette[] = [
  { id: 'sunset-club', name: 'Sunset Club', bg: '#fff1e0', ink: '#2a1418', colours: ['#ff6a4a', '#ffd75e', '#940428', '#ff9a2e', '#ffb3c7'] },
  { id: 'electric-garden', name: 'Electric Garden', bg: '#f1f7ee', ink: '#101a2e', colours: ['#3b47ff', '#2fbf71', '#ffd75e', '#bfe6cf', '#cdbdff'] },
  { id: 'midnight-bloom', name: 'Midnight Bloom', bg: '#1e1416', ink: '#fffaf1', colours: ['#cdbdff', '#ff6a4a', '#ffb3c7', '#3b47ff', '#ffd75e'] },
  { id: 'soft-studio', name: 'Soft Studio', bg: '#f3ecdc', ink: '#2b2118', colours: ['#c9a27e', '#8c4a2f', '#5d6b3a', '#e3d3ae', '#bfe6cf'] },
  { id: 'citrus-pop', name: 'Citrus Pop', bg: '#fffdea', ink: '#1f2a12', colours: ['#ffd75e', '#ff9a2e', '#2fbf71', '#ff6a4a', '#3b47ff'] },
];
