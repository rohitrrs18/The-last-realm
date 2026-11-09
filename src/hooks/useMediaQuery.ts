// src/hooks/useMediaQuery.ts
// Reactive media query hook for responsive layout decisions.
// Uses matchMedia (not window.innerWidth polling) for efficiency and
// correctly cleans up listeners on unmount.

import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query.
 * @example
 *   const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe initial value — false on server, real value after mount.
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    // Sync in case the query changed between render and effect.
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    // addEventListener is modern; fall back to addListener for old Safari.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    } else {
      // @ts-ignore — legacy API
      mql.addListener(onChange);
      // @ts-ignore
      return () => mql.removeListener(onChange);
    }
  }, [query]);

  return matches;
}

/* ------------------------------------------------------------------ */
/*  Tailwind-aligned named breakpoints (keep in sync with config)     */
/* ------------------------------------------------------------------ */

/** >= 640px */
export const useIsSm = () => useMediaQuery('(min-width: 640px)');
/** >= 768px */
export const useIsMd = () => useMediaQuery('(min-width: 768px)');
/** >= 1024px — left side panel becomes visible */
export const useIsLg = () => useMediaQuery('(min-width: 1024px)');
/** >= 1280px — right side panel becomes visible */
export const useIsXl = () => useMediaQuery('(min-width: 1280px)');
/** >= 1536px */
export const useIs2xl = () => useMediaQuery('(min-width: 1536px)');

/** True on screens below `lg` — used to switch to mobile single-column layout. */
export const useIsCompact = () => useMediaQuery('(max-width: 1023px)');

/** True when the user prefers reduced motion (system-level, distinct from in-app setting). */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/** True when the device supports hover (i.e. not touch-only). */
export const useHasHover = () => useMediaQuery('(hover: hover)');