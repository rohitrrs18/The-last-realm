// src/utils/id.ts
// Unique ID generation for items, monsters, NPCs, quests, events, saves.
// Format: `${prefix}_${timestamp36}_${counter36}_${random}`
// Guaranteed non-colliding within a session; across sessions the
// timestamp prefix makes collisions astronomically unlikely.

let counter = 0;

function nextCounter(): string {
  counter = (counter + 1) % 0xffffff;
  return counter.toString(36);
}

function randSuffix(len = 4): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += Math.floor(Math.random() * 36).toString(36);
  }
  return s;
}

/**
 * Generate a unique ID with an optional prefix.
 * @example uid('item') → 'item_lxt8k3_1_a2f9'
 */
export function uid(prefix = 'id'): string {
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${nextCounter()}_${randSuffix()}`;
}

/** Reset the internal counter — used only by tests. */
export function __resetIdCounter(): void {
  counter = 0;
}

/**
 * Derive a deterministic short hash from a string.
 * Useful for seeded generation where the same input should yield the
 * same ID (e.g. one codex entry per monster template).
 */
export function hashString(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

/** Deterministic ID from a content string + optional salt. */
export function contentId(kind: string, content: string, salt = ''): string {
  return `${kind}_${hashString(content + salt)}`;
}