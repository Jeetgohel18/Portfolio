import { memo } from 'react';
import type { CSSProperties } from 'react';

export type Finish = 'gloss' | 'matte' | 'glass';

/** The 3D object itself: a six-faced CSS cube with its own soft shadow. Position/drag lives in PlaygroundCanvas. */
export const ColourCube = memo(function ColourCube({ hex, finish, index }: { hex: string; finish: Finish; index: number }) {
  const style = { '--c': hex, '--spin': `${15 + (index % 5) * 3}s`, '--bob': `${5.5 + (index % 4) * 0.9}s`, '--delay': `${-(index * 1.3)}s` } as CSSProperties;
  return (
    <span className={`pg-cube-wrap f-${finish}`} style={style} aria-hidden="true">
      <i className="pg-shadow" />
      <span className="pg-bob">
        <span className="pg-tilt">
          <span className="pg-cube">
            {['f', 'b', 'r', 'l', 't', 'u'].map((f) => <i key={f} className={`pf ${f}`} />)}
          </span>
        </span>
      </span>
    </span>
  );
});
