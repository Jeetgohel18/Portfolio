import { useEffect, useState, type ReactNode } from 'react';
import { asset } from '../lib/assets';

type ImgProps = { src?: string; alt: string; className?: string; fallback?: ReactNode; eager?: boolean; width?: number; height?: number };

/**
 * Image from /public. If `src` is empty or the file fails to load, renders `fallback` instead of a broken-image icon.
 * Pass width/height (the file's real pixel size) so the browser reserves space and the layout never jumps.
 */
export function Img({ src, alt, className, fallback = null, eager, width, height }: ImgProps) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (!src || bad) return <>{fallback}</>;
  return <img className={className} src={asset(src)} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBad(true)} />;
}
