import { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { styleOf } from '../../lib/art/compose';
import type { Obj } from '../../lib/art/compose';
import { KIND_META, svgMarkup } from '../../lib/art/shapes';

type Props = { o: Obj; z: number; selected: boolean; enter: boolean };

/** One placed object. Layers (outer→inner): position · overlap-nudge · drop-pop · idle-float · shadow + rotated artwork. */
export const PlaygroundObject = memo(function PlaygroundObject({ o, z, selected, enter }: Props) {
  const m = useMemo(() => svgMarkup(o.id, styleOf(o)), [o.id, o.kind, o.c, o.c2, o.mat, o.text]);
  const label = `${KIND_META[o.kind].label}${o.text ? ` “${o.text}”` : ''}, ${o.c.toUpperCase()}${selected ? ', selected' : ''}`;
  const style = {
    left: `${o.x * 100}%`, top: `${o.y * 100}%`, zIndex: z + 1,
    '--s': o.s, '--asp': m.aspect, '--rot': `${o.rot}deg`, '--i': z, '--bd': `${6 + (z % 5) * 0.9}s`, '--bdl': `${-(z * 1.7)}s`,
  } as CSSProperties;
  return (
    <div className={`po ${selected ? 'is-selected' : ''} ${enter ? 'is-enter' : ''}`} data-obj data-id={o.id} data-cursor="Drag" style={style}
      role="button" tabIndex={0} aria-pressed={selected} aria-label={label}>
      <div className="po-nudge"><div className="po-pop"><div className="po-float">
        {o.kind !== 'type' && o.kind !== 'line' && <i className="po-shadow" />}
        <div className="po-rot">
          <span className="po-art" dangerouslySetInnerHTML={{ __html: m.svg }} />
          {selected && (<>
            <i className="po-box" />
            <i className="po-h po-h-rot" data-h="rot" aria-hidden="true" />
            <i className="po-h po-h-size" data-h="size" aria-hidden="true" />
          </>)}
        </div>
      </div></div></div>
    </div>
  );
});
