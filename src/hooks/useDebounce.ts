// src/hooks/useDebounce.ts
// Debounce utilities for autosave, search input, and rate-limited actions.

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of quiet. Useful for search inputs and expensive filters.
 *
 * @example
 *   const debouncedSearch = useDebounce(search, 300);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * Returns a debounced version of `callback`. The returned function is
 * stable across renders so it can be passed to children without causing
 * re-renders. The latest `callback` is always the one that fires.
 *
 * @example
 *   const save = useDebouncedCallback(() => saveGame(), 3000);
 *   useEffect(() => save(), [state, save]);
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 300
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | null>(null);

  // Keep the latest callback without resetting the debounce timer.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Clean up on unmount so pending timers never fire on unmounted components.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Throttle a callback to run at most once per `limitMs`. Unlike debounce,
 * the first call fires immediately; subsequent calls within the window are
 * dropped. Used for combat attack buttons to prevent double-click exploits.
 *
 * @example
 *   const attack = useThrottledCallback(() => doAttack(), 400);
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  limitMs = 400
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const lastRunRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Args) => {
      const now = Date.now();
      if (now - lastRunRef.current < limitMs) return;
      lastRunRef.current = now;
      callbackRef.current(...args);
    },
    [limitMs]
  );
}

/**
 * Fires a callback at a fixed interval while `enabled` is true.
 * Used for periodic autosave ticks and combat tick indicators.
 *
 * @example
 *   useInterval(() => autoSave(), 30000, true);
 */
export function useInterval(callback: () => void, delayMs: number, enabled = true): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => callbackRef.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs, enabled]);
}