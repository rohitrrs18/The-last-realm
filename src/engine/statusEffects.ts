// src/engine/statusEffects.ts
export function createStatusEffect(id: string, name = 'Effect', turns = 3, kind: any = 'buff') {
  return { id, name, turns, kind };
}
