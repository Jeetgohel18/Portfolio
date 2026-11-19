import { useState } from 'react';
import type { CSSProperties } from 'react';
import { BringToFront, Copy, Droplets, Minus, Plus, Palette, RotateCcw, RotateCw, SendToBack, Trash2 } from 'lucide-react';
import { isHex } from '../../lib/art/colour';
import type { Obj } from '../../lib/art/compose';
import { MAT_LABEL } from '../../lib/art/shapes';
import { useCopy } from './useCopy';

type Props = {
  o: Obj; colours: string[]; style: CSSProperties;
  onRotate: (deg: number) => void; onSize: (factor: number) => void; onColour: (hex: string) => void; onMaterial: () => void;
  onDuplicate: () => void; onFront: () => void; onBack: () => void; onDelete: () => void;
};

/** Small contextual toolbar for the selected object. */
export function ObjectToolbar({ o, colours, style, onRotate, onSize, onColour, onMaterial, onDuplicate, onFront, onBack, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const { copied, copy } = useCopy();
  const isText = o.kind === 'type';
  const Btn = ({ label, onClick, children, on }: { label: string; onClick: () => void; children: React.ReactNode; on?: boolean }) => (
    <button type="button" className={`pg-tb ${on ? 'on' : ''}`} onClick={onClick} aria-label={label} title={label}>{children}</button>
  );
  return (
    <div className="pg-toolbar" style={style} role="toolbar" aria-label="Selected object controls" onPointerDown={(e) => e.stopPropagation()}>
      <div className="pg-tb-row">
        <Btn label="Rotate left 15°" onClick={() => onRotate(-15)}><RotateCcw size={17} /></Btn>
        <Btn label="Rotate right 15°" onClick={() => onRotate(15)}><RotateCw size={17} /></Btn>
        <Btn label="Smaller" onClick={() => onSize(0.88)}><Minus size={17} /></Btn>
        <Btn label="Larger" onClick={() => onSize(1.14)}><Plus size={17} /></Btn>
        <i className="pg-tb-sep" aria-hidden="true" />
        <Btn label="Change colour" onClick={() => setOpen((v) => !v)} on={open}><span className="pg-tb-dot" style={{ background: o.c }} /><Palette size={15} /></Btn>
        {!isText && <Btn label={`Material: ${MAT_LABEL[o.mat]}. Click to change`} onClick={onMaterial}><Droplets size={17} /></Btn>}
        <i className="pg-tb-sep" aria-hidden="true" />
        <Btn label="Duplicate" onClick={onDuplicate}><Copy size={17} /></Btn>
        <Btn label="Bring forward" onClick={onFront}><BringToFront size={17} /></Btn>
        <Btn label="Send backward" onClick={onBack}><SendToBack size={17} /></Btn>
        <Btn label="Delete" onClick={onDelete}><Trash2 size={17} /></Btn>
      </div>
      {open && (
        <div className="pg-tb-colours">
          {colours.map((c) => <button key={c} type="button" className={`pg-sw ${c.toLowerCase() === o.c.toLowerCase() ? 'on' : ''}`} style={{ background: c }} aria-label={`Use ${c.toUpperCase()}`} onClick={() => onColour(c)} />)}
          <label className="pg-sw pg-sw-custom" title="Pick any colour"><input type="color" value={isHex(o.c) ? o.c : '#ff6a4a'} onChange={(e) => onColour(e.target.value)} aria-label="Custom colour" /></label>
          <code className="pg-hex">{o.c.toUpperCase()}</code>
          <button type="button" className="pg-copy" onClick={() => copy(o.c.toUpperCase())} aria-label={`Copy ${o.c.toUpperCase()}`}>{copied === o.c.toUpperCase() ? 'Copied ✓' : 'Copy'}</button>
        </div>
      )}
    </div>
  );
}
