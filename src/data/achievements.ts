// src/data/achievements.ts
// Achievement definitions. ~28 achievements across 6 categories.
// Unlock conditions are evaluated by gameStore.

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AchievementCategory =
  | 'Combat'
  | 'Exploration'
  | 'Progression'
  | 'Quests'
  | 'Factions'
  | 'Hidden';

export type AchievementRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface AchievementCondition {
  /** What kind of stat this achievement tracks. */
  kind:
    | 'monsters-killed'
    | 'bosses-killed'
    | 'locations-discovered'
    | 'quests-completed'
    | 'level-reached'
    | 'gold-earned'
    | 'items-looted'
    | 'items-crafted'
    | 'legendary-items-found'
    | 'npc-friends-made'
    | 'faction-allied'
    | 'faction-hostile'
    | 'decisions-made'
    | 'chains-completed'
    | 'endings-reached'
    | 'custom-flag';
  /** Threshold to hit. */
  threshold: number;
  /** Optional custom flag name (for 'custom-flag'). */
  flag?: string;
}

export interface Achievement {
  /** Stable id. */
  id: string;
  /** Display name. */
  name: string;
  /** Description shown in the toast and codex. */
  description: string;
  /** Category used by the codex tabs. */
  category: AchievementCategory;
  /** Rarity — affects toast styling and codex emphasis. */
  rarity: AchievementRarity;
  /** Optional condition. If missing, must be unlocked manually via code. */
  condition?: AchievementCondition;
  /** Optional flavor line shown when unlocked. */
  flavor?: string;
  /** If true, this achievement is hidden until unlocked. */
  hidden?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Combat achievements                                                */
/* ------------------------------------------------------------------ */

export const COMBAT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first combat.',
    category: 'Combat',
    rarity: 'Common',
    condition: { kind: 'monsters-killed', threshold: 1 },
    flavor: 'The realm is not kind to those who hesitate.',
  },
  {
    id: 'warrior_blooded',
    name: 'Blooded',
    description: 'Win 10 combats.',
    category: 'Combat',
    rarity: 'Uncommon',
    condition: { kind: 'monsters-killed', threshold: 10 },
  },
  {
    id: 'veteran_slayer',
    name: 'Veteran Slayer',
    description: 'Win 50 combats.',
    category: 'Combat',
    rarity: 'Rare',
    condition: { kind: 'monsters-killed', threshold: 50 },
  },
  {
    id: 'legend_of_battle',
    name: 'Legend of Battle',
    description: 'Win 200 combats.',
    category: 'Combat',
    rarity: 'Legendary',
    condition: { kind: 'monsters-killed', threshold: 200 },
    flavor: 'Songs will be sung. Most of them tragic.',
  },
  {
    id: 'first_boss',
    name: 'A Boss Slain',
    description: 'Defeat your first boss.',
    category: 'Combat',
    rarity: 'Rare',
    condition: { kind: 'bosses-killed', threshold: 1 },
  },
  {
    id: 'boss_hunter',
    name: 'Boss Hunter',
    description: 'Defeat 5 bosses.',
    category: 'Combat',
    rarity: 'Epic',
    condition: { kind: 'bosses-killed', threshold: 5 },
  },
  {
    id: 'untouched',
    name: 'Untouched',
    description: 'Win a combat without taking damage.',
    category: 'Combat',
    rarity: 'Rare',
    hidden: true,
    flavor: 'The best fight is the one they never land.',
  },
];

/* ------------------------------------------------------------------ */
/*  Exploration achievements                                           */
/* ------------------------------------------------------------------ */

export const EXPLORATION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    name: 'First Steps',
    description: 'Discover your first location.',
    category: 'Exploration',
    rarity: 'Common',
    condition: { kind: 'locations-discovered', threshold: 1 },
  },
  {
    id: 'wayfarer',
    name: 'Wayfarer',
    description: 'Discover 5 locations.',
    category: 'Exploration',
    rarity: 'Uncommon',
    condition: { kind: 'locations-discovered', threshold: 5 },
  },
  {
    id: 'wanderer',
    name: 'Wanderer',
    description: 'Discover 10 locations.',
    category: 'Exploration',
    rarity: 'Rare',
    condition: { kind: 'locations-discovered', threshold: 10 },
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    description: 'Discover every location in a world.',
    category: 'Exploration',
    rarity: 'Epic',
    hidden: true,
    condition: { kind: 'locations-discovered', threshold: 12 },
  },
];

/* ------------------------------------------------------------------ */
/*  Progression achievements                                           */
/* ------------------------------------------------------------------ */

export const PROGRESSION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'level_5',
    name: 'Journeyman',
    description: 'Reach level 5.',
    category: 'Progression',
    rarity: 'Common',
    condition: { kind: 'level-reached', threshold: 5 },
  },
  {
    id: 'level_10',
    name: 'Veteran',
    description: 'Reach level 10.',
    category: 'Progression',
    rarity: 'Uncommon',
    condition: { kind: 'level-reached', threshold: 10 },
  },
  {
    id: 'level_20',
    name: 'Master',
    description: 'Reach level 20.',
    category: 'Progression',
    rarity: 'Rare',
    condition: { kind: 'level-reached', threshold: 20 },
  },
  {
    id: 'level_50',
    name: 'Legend',
    description: 'Reach level 50.',
    category: 'Progression',
    rarity: 'Legendary',
    condition: { kind: 'level-reached', threshold: 50 },
    flavor: 'There are no more levels. Only the realm.',
  },
  {
    id: 'wealthy',
    name: 'Wealthy',
    description: 'Amass 1,000 gold.',
    category: 'Progression',
    rarity: 'Uncommon',
    condition: { kind: 'gold-earned', threshold: 1000 },
  },
  {
    id: 'rich',
    name: 'Rich',
    description: 'Amass 10,000 gold.',
    category: 'Progression',
    rarity: 'Epic',
    condition: { kind: 'gold-earned', threshold: 10000 },
    flavor: 'Gold is not the point. But it does open doors.',
  },
];

/* ------------------------------------------------------------------ */
/*  Quests achievements                                                */
/* ------------------------------------------------------------------ */

export const QUEST_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    name: 'The Task Accepted',
    description: 'Complete your first quest.',
    category: 'Quests',
    rarity: 'Common',
    condition: { kind: 'quests-completed', threshold: 1 },
  },
  {
    id: 'quest_10',
    name: 'Quest-Taker',
    description: 'Complete 10 quests.',
    category: 'Quests',
    rarity: 'Uncommon',
    condition: { kind: 'quests-completed', threshold: 10 },
  },
  {
    id: 'quest_50',
    name: 'Chronicler',
    description: 'Complete 50 quests.',
    category: 'Quests',
    rarity: 'Rare',
    condition: { kind: 'quests-completed', threshold: 50 },
    flavor: 'The journal is heavy now.',
  },
  {
    id: 'first_chain',
    name: 'The Story Told',
    description: 'Complete a main quest chain.',
    category: 'Quests',
    rarity: 'Epic',
    condition: { kind: 'chains-completed', threshold: 1 },
  },
  {
    id: 'all_chains',
    name: 'All Roads',
    description: 'Complete all main quest chains.',
    category: 'Quests',
    rarity: 'Legendary',
    condition: { kind: 'chains-completed', threshold: 3 },
    flavor: 'Three endings. All yours.',
  },
];

/* ------------------------------------------------------------------ */
/*  Faction achievements                                               */
/* ------------------------------------------------------------------ */

export const FACTION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_friend',
    name: 'A Friend in Court',
    description: 'Reach Friendly standing with any faction.',
    category: 'Factions',
    rarity: 'Uncommon',
    condition: { kind: 'faction-allied', threshold: 1 },
  },
  {
    id: 'allied',
    name: 'Sworn Ally',
    description: 'Reach Allied standing with any faction.',
    category: 'Factions',
    rarity: 'Epic',
    condition: { kind: 'faction-allied', threshold: 2 },
  },
  {
    id: 'enemy_of_the_crown',
    name: 'Enemy of the Crown',
    description: 'Reach Hostile standing with the Crown.',
    category: 'Factions',
    rarity: 'Rare',
    hidden: true,
    condition: { kind: 'faction-hostile', threshold: 1 },
    flavor: 'Some would call it a mistake. Others, a beginning.',
  },
  {
    id: 'people_person',
    name: 'Well Met',
    description: 'Befriend 5 NPCs.',
    category: 'Factions',
    rarity: 'Uncommon',
    condition: { kind: 'npc-friends-made', threshold: 5 },
  },
];

/* ------------------------------------------------------------------ */
/*  Hidden achievements                                                */
/* ------------------------------------------------------------------ */

export const HIDDEN_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_legendary',
    name: 'Legend in Hand',
    description: 'Acquire a Legendary item.',
    category: 'Hidden',
    rarity: 'Epic',
    hidden: true,
    condition: { kind: 'legendary-items-found', threshold: 1 },
    flavor: 'Hold it carefully. It is holding you back.',
  },
  {
    id: 'first_mythic',
    name: 'The Mythic',
    description: 'Acquire a Mythic item.',
    category: 'Hidden',
    rarity: 'Legendary',
    hidden: true,
    condition: { kind: 'legendary-items-found', threshold: 2 },
    flavor: 'Few have held one. Fewer have given it back.',
  },
  {
    id: 'craftsman',
    name: 'Craftsman',
    description: 'Craft 5 items.',
    category: 'Hidden',
    rarity: 'Rare',
    hidden: true,
    condition: { kind: 'items-crafted', threshold: 5 },
  },
  {
    id: 'decision_maker',
    name: 'A Dozen Crossroads',
    description: 'Make 12 significant decisions.',
    category: 'Hidden',
    rarity: 'Uncommon',
    condition: { kind: 'decisions-made', threshold: 12 },
  },
  {
    id: 'first_ending',
    name: 'The Tale Concludes',
    description: 'Reach your first ending.',
    category: 'Hidden',
    rarity: 'Epic',
    condition: { kind: 'endings-reached', threshold: 1 },
    flavor: 'Every journey writes a different legend.',
  },
];

/* ------------------------------------------------------------------ */
/*  Registry                                                           */
/* ------------------------------------------------------------------ */

export const ACHIEVEMENTS: Achievement[] = [
  ...COMBAT_ACHIEVEMENTS,
  ...EXPLORATION_ACHIEVEMENTS,
  ...PROGRESSION_ACHIEVEMENTS,
  ...QUEST_ACHIEVEMENTS,
  ...FACTION_ACHIEVEMENTS,
  ...HIDDEN_ACHIEVEMENTS,
];

export const ACHIEVEMENT_REGISTRY: Record<string, Achievement> = (() => {
  const map: Record<string, Achievement> = {};
  for (const a of ACHIEVEMENTS) map[a.id] = a;
  return map;
})();

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENT_REGISTRY[id];
}

/** Visual accent color per rarity. */
export function achievementRarityColor(r: AchievementRarity): string {
  switch (r) {
    case 'Common': return '#AAA496';
    case 'Uncommon': return '#536B52';
    case 'Rare': return '#6C8CC2';
    case 'Epic': return '#A97AC4';
    case 'Legendary': return '#B79A65';
  }
}

/** Achievements in a category (used by codex/achievements screen). */
export function achievementsByCategory(c: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === c);
}

/** All achievement categories in display order. */
export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Combat',
  'Exploration',
  'Progression',
  'Quests',
  'Factions',
  'Hidden',
];