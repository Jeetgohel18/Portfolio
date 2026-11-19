import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Minus, Plus, Palette, RotateCcw, RotateCw, Trash2, Type, MoveHorizontal } from 'lucide-react';
import { FONT_LABEL, PICKABLE_FONTS } from '../../lib/fix/types';
import type { Align, El, FixPalette, Tools } from '../../lib/fix/types';

type Props = {
  el: El; tools: Tools; palette: FixPalette; style: CSSProperties;
  onSize: (f: number) => void; onRotate: (deg: number) => void; onColour: (hex: string) => void; onFont: () => void;
  onAlign: (a: Align) => void; onRemove: () => void;
};

/** Small contextual toolbar — only the options the current challenge allows. */
export function FixToolbar({ el, tools, palette, style, onSize, onRotate, onColour, onFont, onAlign, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const isText = el.kind === 'text';
  const cur = el.kind === 'text' ? el.color : el.kind === 'shape' ? el.color : el.c;
  const Btn = ({ label, onClick, children, on }: { label: string; onClick: () => void; children: ReactNode; on?: boolean }) => (
    <button type="button" className={`fg-tb ${on ? 'on' : ''}`} onClick={onClick} aria-label={label} title={label}>{children}</button>
  );
  const swatches = [...new Set([...palette.colours, palette.ink, '#fffaf1', palette.bg])];
  return (
    <div className="fg-toolbar" style={style} role="toolbar" aria-label="Selected element controls" onPointerDown={(e) => e.stopPropagation()}>
      <div className="fg-tb-row">
        {tools.resize && (<><Btn label="Smaller" onClick={() => onSize(0.9)}><Minus size={17} /></Btn><Btn label="Larger" onClick={() => onSize(1.12)}><Plus size={17} /></Btn></>)}
        {isText && tools.type && <Btn label={`Font style: ${FONT_LABEL[el.font]}. Click to change`} onClick={onFont}><Type size={17} /><span className="fg-tb-tag">{FONT_LABEL[el.font].split(' ')[0]}</span></Btn>}
        {tools.align && (<>
          <i className="fg-tb-sep" aria-hidden="true" />
          <Btn label="Align to left margin" onClick={() => onAlign('left')} on={isText && el.align === 'left'}><AlignLeft size={17} /></Btn>
          <Btn label="Align to centre" onClick={() => onAlign('center')} on={isText && el.align === 'center'}><AlignCenter size={17} /></Btn>
          <Btn label="Align to right margin" onClick={() => onAlign('right')} on={isText && el.align === 'right'}><AlignRight size={17} /></Btn>
        </>)}
        {tools.move && (isText
          ? (el.rot !== 0 && <Btn label="Straighten" onClick={() => onRotate(-el.rot)}><MoveHorizontal size={17} /></Btn>)
          : <><Btn label="Rotate left" onClick={() => onRotate(-15)}><RotateCcw size={17} /></Btn><Btn label="Rotate right" onClick={() => onRotate(15)}><RotateCw size={17} /></Btn></>)}
        {tools.colour && <Btn label="Change colour" onClick={() => setOpen((v) => !v)} on={open}><span className="fg-tb-dot" style={{ background: cur }} /><Palette size={15} /></Btn>}
        {tools.remove && el.role === 'deco' && <Btn label="Remove this decoration" onClick={onRemove}><Trash2 size={17} /></Btn>}
      </div>
      {open && tools.colour && (
        <div className="fg-tb-colours">
          {swatches.map((c) => <button key={c} type="button" className={`fg-sw ${c.toLowerCase() === cur.toLowerCase() ? 'on' : ''}`} style={{ background: c }} aria-label={`Use ${c.toUpperCase()}`} onClick={() => onColour(c)} />)}
          <code className="fg-hex">{cur.toUpperCase()}</code>
        </div>
      )}
    </div>
  );
}
export { PICKABLE_FONTS };
