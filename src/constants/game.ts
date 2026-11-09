// src/constants/game.ts
// Central game balance constants.
// Every numeric knob in The Last Realm is defined here so tuning is easy
// and no system file hardcodes magic values.

/* ------------------------------------------------------------------ */
/*  Progression                                                        */
/* ------------------------------------------------------------------ */

export const LEVEL = {
  MAX: 50,
  START_XP_NEXT: 100,
  XP_GROWTH: 1.35,               // multiplier applied to xpNext per level
  HP_PER_LEVEL: 12,
  MANA_PER_LEVEL: 6,
  STAT_POINTS_PER_LEVEL: 2,      // future: attribute point allocation
  SKILL_POINTS_PER_LEVEL: 1,     // future: skill tree unlocks
} as const;

/* ------------------------------------------------------------------ */
/*  Character starting HP/Mana is class-defined (see data/classes.ts)  */
/* ------------------------------------------------------------------ */

export const CHARACTER = {
  STARTING_GOLD: 30,
  STARTING_POTIONS: 2,
  DEFAULT_NAME: 'The Nameless',
  INVENTORY_SOFT_CAP: 40,        // warning threshold, not a hard limit
} as const;

/* ------------------------------------------------------------------ */
/*  Combat                                                             */
/* ------------------------------------------------------------------ */

export const COMBAT = {
  BASE_CRIT_CHANCE: 0.06,
  LUCK_CRIT_PER_POINT: 0.005,
  CRIT_MULTIPLIER: 1.8,
  DEFENSE_REDUCTION: 0.5,        // fraction of defense subtracted from damage
  DAMAGE_VARIANCE: 0.3,          // ±15% random roll around base
  FLEE_BASE_CHANCE: 0.5,
  MIN_DAMAGE: 1,
  ENEMY_TURN_DELAY_MS: 700,      // UX delay before enemy attacks after player action
  BOSS_PHASE_2_THRESHOLD: 0.5,   // boss enters phase 2 at 50% HP
  BOSS_PHASE_3_THRESHOLD: 0.2,   // boss enters phase 3 at 20% HP
} as const;

/* ------------------------------------------------------------------ */
/*  Status Effects                                                     */
/* ------------------------------------------------------------------ */

export const STATUS = {
  POISON_DAMAGE_PCT: 0.05,       // % of max HP per turn
  BURN_DAMAGE_PCT: 0.07,
  DEFAULT_DURATION: 3,
  STUN_SKIPS_TURN: true,
  CHILLED_DAMAGE_MOD: 0.7,       // enemy damage multiplied by this when chilled
  SHIELD_ABSORB_PCT: 0.4,
} as const;

/* ------------------------------------------------------------------ */
/*  Item Generation — Rarity Weights                                   */
/* ------------------------------------------------------------------ */

export const RARITY_WEIGHTS = {
  Common:    55,
  Uncommon:  25,
  Rare:      12,
  Epic:      5,
  Legendary: 2.5,
  Mythic:    0.5,
} as const;

export const RARITY_MULTIPLIER = {
  Common:    1.0,
  Uncommon:  1.3,
  Rare:      1.7,
  Epic:      2.2,
  Legendary: 3.2,
  Mythic:    4.5,
} as const;

export const RARITY_SELL_PCT = 0.4;  // items sell for 40% of value

/* ------------------------------------------------------------------ */
/*  Item Generation — Level Scaling                                    */
/* ------------------------------------------------------------------ */

export const ITEM_SCALING = {
  WEAPON_BASE_DMG: 6,
  WEAPON_PER_LEVEL: 2.2,
  ARMOR_BASE_DEF: 4,
  ARMOR_PER_LEVEL: 1.6,
  SHIELD_BASE_DEF: 3,
  SHIELD_PER_LEVEL: 1.4,
  CRIT_BONUS_BASE: 2,
  POTION_HEAL_BASE: 20,
  POTION_HEAL_PER_LEVEL: 10,
  POTION_MANA_BASE: 15,
  POTION_MANA_PER_LEVEL: 8,
} as const;

/* ------------------------------------------------------------------ */
/*  Monster Generation                                                 */
/* ------------------------------------------------------------------ */

export const MONSTER = {
  BEAST_BASE_HP: 40,
  BOSS_BASE_HP: 180,
  HP_PER_LEVEL: 12,
  BOSS_HP_PER_LEVEL: 30,
  BASE_ATTACK: 6,
  ATTACK_PER_LEVEL: 3,
  BOSS_ATTACK_MULT: 1.4,
  BASE_DEFENSE: 2,
  DEFENSE_PER_LEVEL: 1.6,
  BOSS_DEFENSE_MULT: 1.3,
  BASE_SPEED: 5,
  SPEED_PER_LEVEL: 1.2,
  XP_BASE: 15,
  XP_PER_LEVEL: 12,
  BOSS_XP_MULT: 3,
  GOLD_BASE: 10,
  GOLD_PER_LEVEL: 8,
  BOSS_GOLD_MULT: 4,
  BOSS_SPAWN_CHANCE: 0.1,
  ELITE_SPAWN_CHANCE: 0.15,
  LOOT_CHANCE: 0.55,
} as const;

/* ------------------------------------------------------------------ */
/*  World Generation                                                   */
/* ------------------------------------------------------------------ */

export const WORLD = {
  LOCATIONS_MIN: 9,
  LOCATIONS_MAX: 12,
  DIFFICULTY_MIN: 1,
  DIFFICULTY_MAX: 10,
  DANGER_LOW_MAX: 3,             // difficulty <= 3 → Low
  DANGER_MODERATE_MAX: 6,        // <= 6 → Moderate
  DANGER_HIGH_MAX: 8,            // <= 8 → High
  SPAWN_X_MIN: 8,
  SPAWN_X_MAX: 92,
  SPAWN_Y_MIN: 10,
  SPAWN_Y_MAX: 90,
} as const;

/* ------------------------------------------------------------------ */
/*  Story & Events                                                     */
/* ------------------------------------------------------------------ */

export const NARRATIVE = {
  COMBAT_AFTER_CHOICE_CHANCE: 0.5,   // 50% chance an event choice triggers combat
  TRAVEL_ENCOUNTER_CHANCE: 0.35,     // 35% chance travel triggers encounter
  MAX_LOG_ENTRIES: 100,              // keep chronicle bounded
  MAX_DECISION_HISTORY: 500,
} as const;

/* ------------------------------------------------------------------ */
/*  NPCs                                                               */
/* ------------------------------------------------------------------ */

export const NPC = {
  MIN_PER_LOCATION: 1,
  MAX_PER_LOCATION: 3,
  MERCHANT_CHANCE: 0.4,
  BLACKSMITH_CHANCE: 0.25,
  QUEST_GIVER_CHANCE: 0.3,
  BASE_RELATIONSHIP: 0,
  RELATIONSHIP_MIN: -100,
  RELATIONSHIP_MAX: 100,
  RELATIONSHIP_FRIENDLY: 30,
  RELATIONSHIP_HOSTILE: -30,
} as const;

/* ------------------------------------------------------------------ */
/*  Factions & Reputation                                              */
/* ------------------------------------------------------------------ */

export const REPUTATION = {
  MIN: -100,
  MAX: 100,
  NEUTRAL_THRESHOLD: 10,
  ALLIED_THRESHOLD: 60,
  HOSTILE_THRESHOLD: -40,
  QUEST_REWARD_DELTA: 5,
  HOSTILE_ACTION_DELTA: -15,
} as const;

/* ------------------------------------------------------------------ */
/*  Skill Trees                                                        */
/* ------------------------------------------------------------------ */

export const SKILLS = {
  NODES_PER_TREE: 9,
  TIER_1_LEVEL: 1,
  TIER_2_LEVEL: 3,
  TIER_3_LEVEL: 6,
  TIER_4_LEVEL: 10,
  MAX_RANK_PER_NODE: 3,
} as const;

/* ------------------------------------------------------------------ */
/*  Save System                                                        */
/* ------------------------------------------------------------------ */

export const SAVE = {
  VERSION: 1,
  MAX_SLOTS: 6,
  AUTO_SAVE_DEBOUNCE_MS: 3000,
  STORAGE_KEY: 'tlr_saves_v1',
} as const;

/* ------------------------------------------------------------------ */
/*  Audio                                                              */
/* ------------------------------------------------------------------ */

export const AUDIO = {
  DEFAULT_VOLUME: 0.4,
  MASTER_GAIN: 0.6,
  AMBIENT_FADE_MS: 1500,
  SFX_VOLUME: 0.7,
} as const;

/* ------------------------------------------------------------------ */
/*  UI                                                                 */
/* ------------------------------------------------------------------ */

export const UI = {
  TOAST_DURATION_MS: 4000,
  MODAL_ANIMATION_MS: 250,
  HEALTH_BAR_ANIMATION_MS: 500,
  PANEL_BREAKPOINT_LEFT: 1024,   // lg — left panel visible
  PANEL_BREAKPOINT_RIGHT: 1280,  // xl — right panel visible
} as const;