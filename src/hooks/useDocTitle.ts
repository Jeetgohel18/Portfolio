import { useEffect } from 'react';

const BASE = 'Jeet Gohel — UI/UX, Product & Visual Designer';
const DESC = 'Portfolio of Jeet Gohel, a UI/UX, product and visual designer based in Bhavnagar, Gujarat, India.';

/** Sets document title and meta description for the current route. */
export function useDocTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Jeet Gohel` : BASE;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute('content', description ?? DESC);
  }, [title, description]);
}
