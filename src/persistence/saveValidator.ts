// src/persistence/saveValidator.ts
// Save data schema validation. Ensures loaded saves have correct shape,
// repairs minor issues, and reports fatal corruption.

import type { Character, Item, Quest, World } from '../components/types/game';
import { SAVE, LEVEL } from '../constants/game';
import { clamp } from '../utils/clamp';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ValidationSeverity = 'ok' | 'repaired' | 'fatal';

export interface ValidationResult {
  /** Overall result. */
  severity: ValidationSeverity;
  /** Reason if fatal. */
  reason?: string;
  /** What was repaired (if anything). */
  repairs: string[];
  /** The validated (possibly repaired) save payload. */
  payload: any;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Validate a raw save payload. Returns a result with severity:
 *   - 'ok': payload is valid and unmodified
 *   - 'repaired': payload was repaired and is usable
 *   - 'fatal': payload is corrupt and cannot be loaded
 */
export function validateSave(raw: unknown): ValidationResult {
  const repairs: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { severity: 'fatal', reason: 'Save data is not an object', repairs, payload: null };
  }

  const data = raw as Record<string, any>;

  // Version check.
  if (typeof data.version !== 'number') {
    repairs.push('Missing version — assuming v1');
    data.version = 1;
  }
  if (data.version > SAVE.VERSION) {
    return {
      severity: 'fatal',
      reason: `Save version ${data.version} is newer than supported (${SAVE.VERSION}).`,
      repairs,
      payload: null,
    };
  }

  // Character — required.
  if (!data.state || typeof data.state !== 'object') {
    return { severity: 'fatal', reason: 'Save has no state', repairs, payload: null };
  }

  const state = data.state as Record<string, any>;

  // Character validation.
  const charResult = validateCharacter(state.character);
  if (charResult.severity === 'fatal') {
    return {
      severity: 'fatal',
      reason: charResult.reason,
      repairs: [...repairs, ...charResult.repairs],
      payload: null,
    };
  }
  state.character = charResult.payload;
  repairs.push(...charResult.repairs);

  // World validation.
  const worldResult = validateWorld(state.world);
  if (worldResult.severity === 'fatal') {
    return {
      severity: 'fatal',
      reason: worldResult.reason,
      repairs: [...repairs, ...worldResult.repairs],
      payload: null,
    };
  }
  state.world = worldResult.payload;
  repairs.push(...worldResult.repairs);

  // Optional fields — repair silently.
  state.quests = validateQuests(state.quests, repairs);
  state.codex = validateCodex(state.codex, repairs);
  state.log = Array.isArray(state.log) ? state.log.filter((l: any) => typeof l === 'string') : [];
  state.decisionHistory = Array.isArray(state.decisionHistory) ? state.decisionHistory : [];
  state.nextEventCounter = typeof state.nextEventCounter === 'number' ? state.nextEventCounter : 0;

  // Extended fields (defaults if missing).
  if (!state.skillRanks || typeof state.skillRanks !== 'object') {
    state.skillRanks = {};
  }
  if (!state.flags || typeof state.flags !== 'object') {
    state.flags = {};
  }
  if (!state.factionReputation || typeof state.factionReputation !== 'object') {
    state.factionReputation = {};
  }
  if (!state.npcs || !Array.isArray(state.npcs)) {
    state.npcs = [];
  }
  if (!state.chainProgress || !Array.isArray(state.chainProgress)) {
    state.chainProgress = [];
  }
  if (!state.unlockedAchievements || !Array.isArray(state.unlockedAchievements)) {
    state.unlockedAchievements = [];
  }
  if (!state.discoveredRecipes || !Array.isArray(state.discoveredRecipes)) {
    state.discoveredRecipes = [];
  }

  return {
    severity: repairs.length > 0 ? 'repaired' : 'ok',
    repairs,
    payload: data,
  };
}

/* ------------------------------------------------------------------ */
/*  Character validator                                                */
/* ------------------------------------------------------------------ */

function validateCharacter(raw: unknown): ValidationResult {
  const repairs: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { severity: 'fatal', reason: 'Character data is missing', repairs, payload: null };
  }

  const c = raw as Record<string, any>;

  if (typeof c.name !== 'string' || c.name.length === 0) {
    c.name = 'The Nameless';
    repairs.push('Defaulted character name');
  }

  const validClasses = ['Warrior', 'Mage', 'Rogue', 'Ranger'];
  if (!validClasses.includes(c.class)) {
    c.class = 'Warrior';
    repairs.push('Defaulted character class');
  }

  c.level = clampNumber(c.level, 1, LEVEL.MAX, 1);
  c.xp = clampNumber(c.xp, 0, Number.MAX_SAFE_INTEGER, 0);
  c.xpNext = clampNumber(c.xpNext, 1, Number.MAX_SAFE_INTEGER, 100);
  c.hp = clampNumber(c.hp, 0, Number.MAX_SAFE_INTEGER, 100);
  c.maxHp = clampNumber(c.maxHp, 1, Number.MAX_SAFE_INTEGER, 100);
  c.mana = clampNumber(c.mana, 0, Number.MAX_SAFE_INTEGER, 30);
  c.maxMana = clampNumber(c.maxMana, 1, Number.MAX_SAFE_INTEGER, 30);
  c.gold = clampNumber(c.gold, 0, Number.MAX_SAFE_INTEGER, 0);
  c.appearance = clampNumber(c.appearance, 0, 3, 0);

  // Clamp HP/mana to max.
  if (c.hp > c.maxHp) c.hp = c.maxHp;
  if (c.mana > c.maxMana) c.mana = c.maxMana;

  // Base stats.
  if (!c.baseStats || typeof c.baseStats !== 'object') {
    c.baseStats = { strength: 10, agility: 10, intellect: 10, vitality: 10, luck: 10 };
    repairs.push('Rebuilt base stats');
  } else {
    for (const key of ['strength', 'agility', 'intellect', 'vitality', 'luck']) {
      c.baseStats[key] = clampNumber(c.baseStats[key], 0, 999, 10);
    }
  }

  // Abilities.
  c.abilities = Array.isArray(c.abilities) ? c.abilities.filter(isValidAbility) : [];

  // Equipment.
  if (!c.equipment || typeof c.equipment !== 'object') {
    c.equipment = {};
    repairs.push('Rebuilt equipment');
  }

  // Inventory.
  if (!Array.isArray(c.inventory)) {
    c.inventory = [];
    repairs.push('Rebuilt inventory');
  } else {
    c.inventory = c.inventory.filter(isValidItem);
  }

  // Cooldowns.
  if (!c.cooldowns || typeof c.cooldowns !== 'object') {
    c.cooldowns = {};
  }

  // Status effects.
  if (!Array.isArray(c.statusEffects)) {
    c.statusEffects = [];
  }

  return {
    severity: repairs.length > 0 ? 'repaired' : 'ok',
    repairs,
    payload: c,
  };
}

/* ------------------------------------------------------------------ */
/*  World validator                                                    */
/* ------------------------------------------------------------------ */

function validateWorld(raw: unknown): ValidationResult {
  const repairs: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { severity: 'fatal', reason: 'World data is missing', repairs, payload: null };
  }

  const w = raw as Record<string, any>;

  if (!Array.isArray(w.locations) || w.locations.length === 0) {
    return { severity: 'fatal', reason: 'World has no locations', repairs, payload: null };
  }

  w.locations = w.locations.filter((l: any) => l && typeof l.id === 'string');

  if (w.locations.length === 0) {
    return { severity: 'fatal', reason: 'World has no valid locations', repairs, payload: null };
  }

  if (typeof w.currentLocationId !== 'string' || !w.locations.find((l: any) => l.id === w.currentLocationId)) {
    w.currentLocationId = w.locations[0].id;
    repairs.push('Fixed current location');
  }

  w.seed = typeof w.seed === 'number' ? w.seed : 0;
  if (typeof w.kingdomName !== 'string') {
    w.kingdomName = 'Nameless Realm';
    repairs.push('Defaulted kingdom name');
  }

  return {
    severity: repairs.length > 0 ? 'repaired' : 'ok',
    repairs,
    payload: w,
  };
}

/* ------------------------------------------------------------------ */
/*  Quests                                                             */
/* ------------------------------------------------------------------ */

function validateQuests(raw: unknown, repairs: string[]): Quest[] {
  if (!Array.isArray(raw)) {
    if (raw !== undefined) repairs.push('Rebuilt quest list');
    return [];
  }
  return raw.filter((q: any) => {
    if (!q || typeof q.id !== 'string' || typeof q.title !== 'string') return false;
    if (!Array.isArray(q.objectives)) q.objectives = [];
    if (typeof q.status !== 'string') q.status = 'active';
    return true;
  });
}

/* ------------------------------------------------------------------ */
/*  Codex                                                              */
/* ------------------------------------------------------------------ */

function validateCodex(raw: unknown, repairs: string[]): any {
  if (!raw || typeof raw !== 'object') {
    if (raw !== undefined) repairs.push('Rebuilt codex');
    return { monsters: {}, items: {}, locations: {} };
  }
  const c = raw as Record<string, any>;
  if (!c.monsters || typeof c.monsters !== 'object') c.monsters = {};
  if (!c.items || typeof c.items !== 'object') c.items = {};
  if (!c.locations || typeof c.locations !== 'object') c.locations = {};
  return c;
}

/* ------------------------------------------------------------------ */
/*  Item / ability shape                                               */
/* ------------------------------------------------------------------ */

function isValidItem(i: any): i is Item {
  return (
    i &&
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    typeof i.category === 'string' &&
    typeof i.rarity === 'string'
  );
}

function isValidAbility(a: any): boolean {
  return (
    a &&
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    typeof a.power === 'number'
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return clamp(num, min, max);
}

/* ------------------------------------------------------------------ */
/*  Strict validation (optional)                                       */
/* ------------------------------------------------------------------ */

/**
 * Strict validation — returns boolean only. Useful for quick checks.
 */
export function isValidSave(raw: unknown): boolean {
  const result = validateSave(raw);
  return result.severity !== 'fatal';
}

/**
 * Validation report — human-readable summary of repairs and issues.
 */
export function validationReport(result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`Severity: ${result.severity}`);
  if (result.reason) lines.push(`Reason: ${result.reason}`);
  if (result.repairs.length > 0) {
    lines.push('Repairs:');
    for (const r of result.repairs) lines.push(`  • ${r}`);
  }
  return lines.join('\n');
}