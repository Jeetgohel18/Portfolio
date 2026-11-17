import { useEffect } from 'react';

const BASE = 'Jeet Gohel — UI/UX, Product & Visual Designer';
export function useDocTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Jeet Gohel` : BASE;
  }, [title]);
}
