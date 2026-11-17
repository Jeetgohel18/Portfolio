import type { CSSProperties } from 'react';
import type { ProjectKind } from '../../data/projects';
import type { Kind, Tone } from './Obj3D';

export type Accent = { kind: Kind; tone: Tone; size: number; style: CSSProperties; depth?: number; rot?: number; spin?: boolean };

/** Decorative 3D accents per project type — they poke out of preview cards / next-project cards for depth. */
export const ACCENTS: Record<ProjectKind, Accent[]> = {
  web: [{ kind: 'cube', tone: 'cobalt', size: 58, style: { right: '-2%', top: '-5%' }, spin: true }, { kind: 'spark', tone: 'butter', size: 46, style: { left: '-2%', bottom: '8%' }, spin: true }],
  mobile: [{ kind: 'sphere', tone: 'coral', size: 70, style: { left: '-3%', top: '-6%' } }, { kind: 'torus', tone: 'butter', size: 80, style: { right: '-3%', bottom: '4%' }, spin: true }],
  dashboard: [{ kind: 'capsule', tone: 'butter', size: 40, style: { left: '-3%', top: '4%' }, rot: -18 }, { kind: 'sphere', tone: 'metal', size: 58, style: { right: '-2%', top: '-6%' } }],
  product: [{ kind: 'torus', tone: 'cobalt', size: 74, style: { right: '-3%', top: '-7%' }, spin: true }, { kind: 'cube', tone: 'coral', size: 46, style: { left: '-2%', bottom: '6%' }, spin: true }],
  brand: [{ kind: 'sphere', tone: 'butter', size: 64, style: { right: '-2%', bottom: '-5%' } }, { kind: 'squiggle', tone: 'ink', size: 70, style: { left: '-3%', top: '6%' }, spin: true }],
  graphic: [{ kind: 'spark', tone: 'coral', size: 66, style: { left: '-3%', top: '-6%' }, spin: true }, { kind: 'capsule', tone: 'lavender', size: 38, style: { right: '-3%', bottom: '10%' }, rot: 22 }],
};
