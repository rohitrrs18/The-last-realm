// src/engine/levelingSystem.ts
import type { Character } from '../types/game';

export interface LevelUpSummary {
  newLevel: number;
  hpGained: number;
  manaGained: number;
  statPointsAwarded: number;
}

export function computeDerivedStats(char: Character, bonuses: any = {}) {
  const bonusHp = bonuses?.maxHp || 0;
  const bonusMana = bonuses?.maxMana || 0;
  return {
    maxHp: char.maxHp + bonusHp,
    maxMana: char.maxMana + bonusMana,
    damageBonus: bonuses?.damageBonus || 0,
    defenseBonus: bonuses?.defenseBonus || 0,
    critChance: (bonuses?.critBonus || 0) + (char.baseStats?.luck || 10) * 0.5,
    evasion: bonuses?.evasionBonus || 0,
    spellPower: 1 + (bonuses?.spellPower || 0) * 0.01,
    strength: char.baseStats?.strength || 10,
    agility: char.baseStats?.agility || 10,
    intellect: char.baseStats?.intellect || 10,
    vitality: char.baseStats?.vitality || 10,
    luck: char.baseStats?.luck || 10,
  };
}
