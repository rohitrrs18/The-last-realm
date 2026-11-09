// src/utils/formatTime.ts
// Time and duration formatting for save slots, autosave indicators, and combat logs.

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Human-readable relative time.
 * @example
 *   formatRelativeTime(Date.now() - 5000)         → 'just now'
 *   formatRelativeTime(Date.now() - 3 * 60000)    → '3 minutes ago'
 *   formatRelativeTime(Date.now() - 2 * 3600000)  → '2 hours ago'
 *   formatRelativeTime(Date.now() - 30 * 86400000) → 'last month'
 */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < 10 * SECOND) return 'just now';
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)} seconds ago`;
  if (diff < 2 * MINUTE) return 'a minute ago';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} minutes ago`;
  if (diff < 2 * HOUR) return 'an hour ago';
  if (diff < DAY) return `${Math.floor(diff / HOUR)} hours ago`;
  if (diff < 2 * DAY) return 'yesterday';
  if (diff < WEEK) return `${Math.floor(diff / DAY)} days ago`;
  if (diff < 2 * WEEK) return 'a week ago';
  if (diff < MONTH) return `${Math.floor(diff / WEEK)} weeks ago`;
  if (diff < 2 * MONTH) return 'last month';
  if (diff < YEAR) return `${Math.floor(diff / MONTH)} months ago`;
  if (diff < 2 * YEAR) return 'last year';
  return `${Math.floor(diff / YEAR)} years ago`;
}

/**
 * Absolute date + time string for save metadata.
 * @example formatAbsoluteTime(1729512345678) → 'Oct 21, 2026 · 3:45 PM'
 */
export function formatAbsoluteTime(timestamp: number): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

/**
 * Short clock string for the autosave indicator.
 * @example formatClock(Date.now()) → '3:45 PM'
 */
export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Format a millisecond duration for combat rounds / animation timers.
 * @example
 *   formatDuration(250)  → '250ms'
 *   formatDuration(2500) → '2.5s'
 *   formatDuration(65000) → '1m 5s'
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0s';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) {
    return Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/**
 * Format a playtime duration (from session start) as H:MM:SS.
 * @example formatPlaytime(3725000) → '1:02:05'
 */
export function formatPlaytime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00:00';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Days elapsed since a timestamp — used by the "returning player" greeting.
 */
export function daysSince(timestamp: number, now = Date.now()): number {
  return Math.floor((now - timestamp) / DAY);
}