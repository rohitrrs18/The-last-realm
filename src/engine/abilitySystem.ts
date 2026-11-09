// src/engine/abilitySystem.ts
import type { Character, Monster, Ability } from '../types/game';

export function tickCooldowns(cooldowns: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [k, v] of Object.entries(cooldowns || {})) {
    if (v > 1) next[k] = v - 1;
  }
  return next;
}

export function chooseMonsterAbility(monster: Monster): Ability | undefined {
  if (!monster.abilities || monster.abilities.length === 0) return undefined;
  // Pick an ability if available
  const available = monster.abilities.filter((a) => {
    const cd = monster.cooldowns?.[a.id] ?? 0;
    return cd <= 0;
  });
  if (available.length === 0) return undefined;
  // 50% chance to use special ability if available
  if (Math.random() < 0.5) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return undefined;
}

export function bossPhaseStatuses(phase: number) {
  if (phase === 2) {
    return [{ id: 'enrage', name: 'Enraged', turns: 99 }];
  }
  return [];
}
