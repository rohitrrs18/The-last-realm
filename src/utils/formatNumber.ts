// src/utils/formatNumber.ts
// Compact number formatting for gold, XP, damage, and inventory values.

import { clamp } from './clamp';

/**
 * Format a number compactly.
 * @example
 *   formatNumber(842)       → '842'
 *   formatNumber(1245)      → '1.2k'
 *   formatNumber(34500)     → '34.5k'
 *   formatNumber(1250000)   → '1.25M'
 */
export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs < 1000) return `${sign}${Math.floor(abs)}`;
  if (abs < 1_000_000) {
    const v = abs / 1000;
    return `${sign}${trim(v.toFixed(decimals))}k`;
  }
  if (abs < 1_000_000_000) {
    const v = abs / 1_000_000;
    return `${sign}${trim(v.toFixed(decimals))}M`;
  }
  const v = abs / 1_000_000_000;
  return `${sign}${trim(v.toFixed(decimals))}B`;
}

/** Remove trailing `.0` so `1.0k` becomes `1k`. */
function trim(s: string): string {
  return s.replace(/\.0+$/, '');
}

/**
 * Format a value with thousands separators.
 * @example
 *   formatThousands(1245678) → '1,245,678'
 */
export function formatThousands(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.round(value).toLocaleString('en-US');
}

/**
 * Format a percentage (0..1) as a whole-number percent string.
 * @example
 *   formatPercent(0.856) → '86%'
 */
export function formatPercent(value: number, decimals = 0): string {
  const pct = clamp(value, 0, 1) * 100;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Format a signed delta, always showing + or -.
 * @example
 *   formatDelta(5)  → '+5'
 *   formatDelta(-3) → '−3'
 */
export function formatDelta(value: number): string {
  if (value === 0) return '0';
  const sign = value > 0 ? '+' : '−';
  return `${sign}${Math.abs(Math.round(value))}`;
}

/**
 * Format a difficulty value (1..10) with its tier word.
 * @example
 *   formatDifficulty(7) → '7 · High'
 */
export function formatDifficulty(value: number): string {
  const v = Math.round(value);
  const tier = v <= 3 ? 'Low' : v <= 6 ? 'Moderate' : v <= 8 ? 'High' : 'Deadly';
  return `${v} · ${tier}`;
}