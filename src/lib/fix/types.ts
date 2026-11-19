import type { Kind, Mat } from '../art/shapes';

/** Fix This Design — data model. Canvas units: width = 1, height = CANVAS_H (a 4:5 poster). */
export const CANVAS_H = 1.25;
export type FontStyle = 'display' | 'displayLight' | 'body' | 'bodyItalic' | 'caps' | 'serif' | 'mono';
/** Styles offered in the picker (serif / mono only appear in the deliberately bad starting designs). */
export const PICKABLE_FONTS: FontStyle[] = ['display', 'displayLight', 'body', 'bodyItalic', 'caps'];
export const FONT_LABEL: Record<FontStyle, string> = { display: 'Display bold', displayLight: 'Display light', body: 'Text', bodyItalic: 'Text italic', caps: 'Small caps', serif: 'Serif', mono: 'Mono' };
export type Align = 'left' | 'center' | 'right';
export type Role = 'headline' | 'sub' | 'body' | 'info' | 'cta' | 'art' | 'deco';

type Base = { id: string; role: Role; x: number; y: number; rot: number };
/** Text: x is the anchor (left edge / centre / right edge depending on `align`), y is the top of the block. */
export type TextEl = Base & { kind: 'text'; text: string; size: number; font: FontStyle; align: Align; color: string; lh?: number; pill?: string };
/** Shape: x,y is the centre; w,h in canvas-width units. */
export type ShapeEl = Base & { kind: 'shape'; shape: 'circle' | 'rect' | 'squiggle' | 'pill'; w: number; h: number; color: string; opacity?: number };
/** 3D-style art from the Playground library: x,y is the centre; s is its height in canvas-width units. */
export type ArtEl = Base & { kind: 'art'; art: Kind; c: string; c2: string; mat: Mat; s: number };
export type El = TextEl | ShapeEl | ArtEl;
export type Doc = { bg: string; els: El[] };

export type FixPalette = { id: string; name: string; bg: string; ink: string; colours: string[] };
export type Category = 'alignment' | 'spacing' | 'hierarchy' | 'colour' | 'balance';
export const CATEGORIES: Category[] = ['alignment', 'spacing', 'hierarchy', 'colour', 'balance'];
export const CAT_LABEL: Record<Category, string> = { alignment: 'Alignment', spacing: 'Spacing', hierarchy: 'Visual hierarchy', colour: 'Colour harmony', balance: 'Composition balance' };
export type Weights = Record<Category, number>;

export type Tools = { colour: boolean; type: boolean; align: boolean; spacing: boolean; remove: boolean; resize: boolean; move: boolean };
export type Challenge = {
  id: string; n: number; name: string; objective: string; blurb: string;
  initial: Doc; reference: Doc; tools: Tools; weights: Weights; seconds: number;
};
