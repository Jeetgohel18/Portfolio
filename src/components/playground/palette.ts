import type { Finish } from './ColourCube';

/** Starting colours — real hex values; names are only labels. */
export type Item = {
  id: string;
  hex: string;
  name: string;
  kind: 'base' | 'result';
  finish: Finish;
  /** Where a result cube first appears (stage px) before settling into its slot. */
  from?: { x: number; y: number };
};

export const BASE_COLOURS: { hex: string; name: string; finish: Finish }[] = [
  { hex: '#ff6a4a', name: 'Coral', finish: 'gloss' },
  { hex: '#3b47ff', name: 'Cobalt', finish: 'glass' },
  { hex: '#cdbdff', name: 'Lavender', finish: 'matte' },
  { hex: '#ffd75e', name: 'Butter', finish: 'gloss' },
  { hex: '#bfe6cf', name: 'Mint', finish: 'glass' },
  { hex: '#940428', name: 'Burgundy', finish: 'matte' },
  { hex: '#ff9a2e', name: 'Orange', finish: 'gloss' },
  { hex: '#ffb3c7', name: 'Soft pink', finish: 'matte' },
];

export const baseItems = (): Item[] => BASE_COLOURS.map((c, i) => ({ id: `base-${i}`, hex: c.hex, name: c.name, kind: 'base', finish: c.finish }));

export const MAX_RESULTS_ON_STAGE = 3;
const FINISHES: Finish[] = ['gloss', 'matte', 'glass'];
export const finishFor = (n: number): Finish => FINISHES[n % 3];
