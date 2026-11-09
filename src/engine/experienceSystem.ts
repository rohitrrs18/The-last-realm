// src/engine/experienceSystem.ts
export interface XpInput {
  xp: number;
  xpNext: number;
  level: number;
  gained: number;
}

export function applyXp(input: XpInput) {
  let { xp, xpNext, level, gained } = input;
  xp += gained;
  let leveledUp = false;

  while (xp >= xpNext) {
    xp -= xpNext;
    level += 1;
    xpNext = Math.round(xpNext * 1.35);
    leveledUp = true;
  }

  return { xp, xpNext, level, leveledUp };
}
