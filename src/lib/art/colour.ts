/** Small hex-colour helpers for the playground (no DOM). */
export type RGB = [number, number, number];
export const isHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s);
export function hexToRgb(hex: string): RGB { const h = hex.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB; }
export function rgbToHex([r, g, b]: RGB): string { return '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join(''); }
export const mix = (a: string, b: string, t: number) => { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t) as RGB); };
export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
export const darken = (c: string, t: number) => mix(c, '#000000', t);
/** tone > 0 lightens, tone < 0 darkens. */
export const tone = (c: string, t: number) => (t >= 0 ? lighten(c, t) : darken(c, -t));
export function luma(hex: string) { const [r, g, b] = hexToRgb(hex).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
/** Ink or paper, whichever reads better on `bg`. */
export const readable = (bg: string) => (luma(bg) > 0.36 ? '#1f1a17' : '#fffaf1');
export function hue(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return { h: 0, s: 0, l: (mx + mn) / 2 };
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
  const l = (mx + mn) / 2; return { h, s: d / (1 - Math.abs(2 * l - 1)), l };
}
/** Warm = reds, oranges, yellows, warm pinks and browns. */
export function isWarm(hex: string) { const { h, s } = hue(hex); return s < 0.12 ? false : h <= 75 || h >= 330; }
