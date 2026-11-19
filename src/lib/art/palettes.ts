export type Palette = { id: string; name: string; colours: string[]; bgs: string[] };

/** Curated palettes (4–6 colours + suggested backgrounds). Colours are real HEX values. */
export const PALETTES: Palette[] = [
  { id: 'sunset-club', name: 'Sunset Club', colours: ['#ff6a4a', '#ffd75e', '#940428', '#ff9a2e', '#ffb3c7'], bgs: ['#fff1e0', '#2a1418'] },
  { id: 'electric-garden', name: 'Electric Garden', colours: ['#3b47ff', '#bfe6cf', '#ffd75e', '#2fbf71', '#cdbdff'], bgs: ['#f1f7ee', '#101a2e'] },
  { id: 'midnight-bloom', name: 'Midnight Bloom', colours: ['#cdbdff', '#ff6a4a', '#ffb3c7', '#3b47ff', '#ffd75e'], bgs: ['#1e1416', '#2b1c2f'] },
  { id: 'peach-theory', name: 'Peach Theory', colours: ['#ffb89e', '#ff8a65', '#e85d75', '#ffd9c7', '#940428'], bgs: ['#fff6ee', '#f6d7c6'] },
  { id: 'candy-factory', name: 'Candy Factory', colours: ['#ff7eb6', '#4fc3ff', '#ffe14d', '#8a5cff', '#5ee6b0'], bgs: ['#fffaf1', '#ffe6f1'] },
  { id: 'ocean-dream', name: 'Ocean Dream', colours: ['#0a2c6b', '#3b47ff', '#4fb3d9', '#bfe6cf', '#e9f6ff'], bgs: ['#e9f3fb', '#0b1d3f'] },
  { id: 'earth-study', name: 'Earth Study', colours: ['#8c4a2f', '#c9a27e', '#5d6b3a', '#e3d3ae', '#2b2118'], bgs: ['#f3ecdc', '#33281e'] },
];
export const getPalette = (id: string) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];
