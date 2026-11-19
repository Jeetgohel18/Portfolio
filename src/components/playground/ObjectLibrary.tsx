import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as RPE } from 'react';
import { GROUPS, KIND_META, TYPE_WORDS, svgMarkup } from '../../lib/art/shapes';
import type { Group, Kind } from '../../lib/art/shapes';

type Item = { key: string; kind: Kind; text?: string; label: string };
const ITEMS: Record<Group, Item[]> = {
  geometric: [], abstract: [], graphic: [], type: [],
};
for (const g of GROUPS) {
  if (g.id === 'type') ITEMS.type = TYPE_WORDS.map((t) => ({ key: `type-${t}`, kind: 'type', text: t, label: `Text “${t}”` }));
  else ITEMS[g.id] = g.kinds.map((k) => ({ key: k, kind: k, text: k === 'number' ? '07' : undefined, label: KIND_META[k].label }));
}

type Props = {
  colours: string[];
  onAdd: (kind: Kind, text?: string) => void;
  /** Dropped onto the canvas at client coordinates. Returns false if the pointer was not over the stage. */
  onDrop: (kind: Kind, text: string | undefined, clientX: number, clientY: number) => void;
  stageRect: () => DOMRect | null;
};

/** Object tray. Tap/Enter adds an object; dragging one out of the tray drops it exactly where you release it. */
export function ObjectLibrary({ colours, onAdd, onDrop, stageRect }: Props) {
  const [group, setGroup] = useState<Group>('geometric');
  const [ghost, setGhost] = useState<{ item: Item; x: number; y: number; over: boolean } | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);

  const start = (item: Item, e: RPE<HTMLButtonElement>) => {
    if (e.button > 0) return;
    const sx = e.clientX, sy = e.clientY; let dragging = false;
    const over = (x: number, y: number) => { const r = stageRect(); return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        // on touch, a mostly-horizontal swipe should scroll the tray, not drag an object
        if (ev.pointerType === 'touch' && Math.abs(ev.clientX - sx) > Math.abs(ev.clientY - sy)) { stop(); return; }
        dragging = true;
      }
      if (dragging) { ev.preventDefault(); setGhost({ item, x: ev.clientX, y: ev.clientY, over: over(ev.clientX, ev.clientY) }); }
    };
    const up = (ev: PointerEvent) => {
      const was = dragging; stop();
      if (was) { if (over(ev.clientX, ev.clientY)) onDrop(item.kind, item.text, ev.clientX, ev.clientY); }
      else onAdd(item.kind, item.text);
    };
    const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', stop); setGhost(null); cleanup.current = null; };
    window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', stop);
    cleanup.current = stop;
  };

  return (
    <div className="pg-lib">
      <div className="pg-tabs" role="tablist" aria-label="Object categories">
        {GROUPS.map((g) => (
          <button key={g.id} type="button" role="tab" aria-selected={group === g.id} className={group === g.id ? 'on' : ''} onClick={() => setGroup(g.id)}>{g.label}</button>
        ))}
      </div>
      <ul className="pg-items" aria-label={`${group} objects. Drag onto the canvas, or press Enter to add.`}>
        {ITEMS[group].map((it, i) => (
          <li key={it.key}>
            <button type="button" className="pg-item" data-cursor="Drag" aria-label={`Add ${it.label}`} title={it.label}
              onPointerDown={(e) => start(it, e)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAdd(it.kind, it.text); } }}>
              <Thumb item={it} colour={colours[(i + (group.length)) % colours.length]} c2={colours[(i + 2) % colours.length]} />
            </button>
          </li>
        ))}
      </ul>
      {ghost && <div className={`pg-ghost ${ghost.over ? 'over' : ''}`} style={{ left: ghost.x, top: ghost.y } as CSSProperties} aria-hidden="true"><Thumb item={ghost.item} colour={colours[0]} c2={colours[1]} big /></div>}
    </div>
  );
}

const Thumb = memo(function Thumb({ item, colour, c2, big }: { item: Item; colour: string; c2: string; big?: boolean }) {
  const m = useMemo(() => svgMarkup(`th${item.key}${big ? 'b' : ''}`, { kind: item.kind, c: colour, c2, mat: KIND_META[item.kind].mat, text: item.text }), [item, colour, c2, big]);
  return <span className="pg-thumb" style={{ '--asp': m.aspect } as CSSProperties} dangerouslySetInnerHTML={{ __html: m.svg }} />;
});
