// src/utils/clamp.ts
// Numeric helpers used across combat, progression, and UI.

/** Clamp a value between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/** Clamp to 0..1 — handy for percentage animations and audio gain. */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Linear interpolation between a and b by t (0..1). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Percentage of `value` relative to `max`, clamped 0..100. */
export function percent(value: number, max: number): number {
  if (max <= 0) return 0;
  return clamp01(value / max) * 100;
}

/** Round to the nearest multiple of `step` (default 1). */
export function roundTo(value: number, step = 1): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/** Round down to an integer, never below `min` (default 0). */
export function floorMin(value: number, min = 0): number {
  return Math.max(Math.floor(value), min);
}

/** Ensure a value is a positive integer (defaults to 1). */
export function positiveInt(value: number, fallback = 1): number {
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}