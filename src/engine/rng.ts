// src/engine/rng.ts
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

export function randInt(r: () => number, min: number, max: number): number {
  return min + Math.floor(r() * (max - min + 1));
}

export function rollChance(r: () => number, prob: number): boolean {
  return r() < prob;
}

export const chance = rollChance;

export function weightedPick<T>(r: () => number, entries: [T, number][]): T {
  const sum = entries.reduce((s, e) => s + e[1], 0);
  let threshold = r() * sum;
  for (const [val, weight] of entries) {
    if (threshold <= weight) return val;
    threshold -= weight;
  }
  return entries[0][0];
}
