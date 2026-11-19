import { styleOf } from './compose';
import type { Doc } from './compose';
import { svgMarkup } from './shapes';

/** CompositionExporter — renders the artwork (background + objects only, no UI) to a PNG blob using the Canvas 2D API. */
const loadImage = (svg: string) => new Promise<HTMLImageElement>((res, rej) => {
  const img = new Image(); img.onload = () => res(img); img.onerror = () => rej(new Error('svg render failed'));
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

export async function renderPng(doc: Doc, stageW: number, stageH: number, maxEdge = 2400): Promise<Blob> {
  const scale = Math.min(3, Math.max(1, maxEdge / Math.max(stageW, stageH)));
  const W = Math.round(stageW * scale), H = Math.round(stageH * scale), u = Math.min(W, H);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'); if (!ctx) throw new Error('no 2d context');
  ctx.fillStyle = doc.bg; ctx.fillRect(0, 0, W, H);
  try { await (document as Document & { fonts?: FontFaceSet }).fonts?.load("700 88px 'Bricolage Grotesque Variable'"); } catch { /* fall back to system font */ }

  const drawn = await Promise.all(doc.objs.map(async (o, i) => {
    const m = svgMarkup(`x${i}`, styleOf(o), false);
    const img = m.svg.includes('<g opacity') ? await loadImage(m.svg) : null;
    return { o, m, img };
  }));

  for (const { o, m, img } of drawn) {
    const h = o.s * u, w = h * m.aspect;
    ctx.save();
    ctx.translate(o.x * W, o.y * H);
    // soft contact shadow (not rotated with the object)
    if (o.kind !== 'type' && o.kind !== 'line') {
      ctx.save(); ctx.translate(0, h * 0.52); ctx.scale(1, 0.16);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.42); g.addColorStop(0, 'rgba(31,26,23,.28)'); g.addColorStop(1, 'rgba(31,26,23,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.rotate((o.rot * Math.PI) / 180);
    if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
    if (m.text) {
      const t = m.text, k = h / 100;
      ctx.save(); ctx.translate(-w / 2, -h / 2);
      ctx.font = `${t.weight} ${t.size * k}px 'Bricolage Grotesque Variable','Bricolage Grotesque','Helvetica Neue',Arial,sans-serif`;
      ctx.fillStyle = t.fill; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      const natural = ctx.measureText(t.value).width, target = Math.min(t.fit, t.value.length * t.size * 0.7) * k;
      ctx.translate(t.x * k - target / 2, t.y * k); ctx.scale(target / Math.max(1, natural), 1);
      ctx.fillText(t.value, 0, 0); ctx.restore();
    }
    ctx.restore();
  }
  return new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
