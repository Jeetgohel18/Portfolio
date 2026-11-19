import { useCallback, useEffect, useRef, useState } from 'react';

/** Copy text with the async Clipboard API, falling back to execCommand. `copied` holds the last copied value for ~1.6s. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(async (text: string) => {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch { /* fall through */ }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
      } catch { ok = false; }
    }
    if (ok) { setCopied(text); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setCopied(null), 1600); }
    return ok;
  }, []);
  return { copied, copy };
}
