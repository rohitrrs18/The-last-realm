// src/constants/ui.ts
// All user-facing strings and UI copy.
// Centralizing labels here prevents drift between components and
// makes future localization a single-file change.

/* ------------------------------------------------------------------ */
/*  App / Brand                                                        */
/* ------------------------------------------------------------------ */

export const APP = {
  TITLE: 'The Last Realm',
  SUBTITLE: 'Every choice leaves a mark. Every journey writes a different legend.',
  TAGLINE: 'A Tale of the Old Kingdom',
  FOOTER: 'A procedurally crafted realm',
} as const;

/* ------------------------------------------------------------------ */
/*  Screens / Navigation                                               */
/* ------------------------------------------------------------------ */

export const SCREENS = {
  MENU: 'menu',
  CREATE: 'create',
  GAME: 'game',
  SETTINGS: 'settings',
} as const;

export const VIEWS = {
  STORY: 'story',
  CHARACTER: 'character',
  INVENTORY: 'inventory',
  SKILLS: 'skills',
  JOURNAL: 'journal',
  MAP: 'map',
  CODEX: 'codex',
  NPCS: 'npcs',
  CRAFTING: 'crafting',
  FACTIONS: 'factions',
} as const;

export const NAV_LABELS: Record<string, string> = {
  story: 'Story',
  character: 'Character',
  inventory: 'Inventory',
  skills: 'Skills',
  journal: 'Journal',
  map: 'Map',
  codex: 'Codex',
  npcs: 'People',
  crafting: 'Crafting',
  factions: 'Factions',
};

/* ------------------------------------------------------------------ */
/*  Main Menu                                                          */
/* ------------------------------------------------------------------ */

export const MENU_LABELS = {
  NEW_GAME: 'Begin New Journey',
  CONTINUE: 'Continue Journey',
  LOAD: 'Load Saved Game',
  CODEX: 'Game Codex',
  SETTINGS: 'Settings',
  SAVED_JOURNEYS: 'Saved Journeys',
  NO_SAVES: 'No saves found.',
  CLOSE: 'Close',
} as const;

/* ------------------------------------------------------------------ */
/*  Character Creation                                                 */
/* ------------------------------------------------------------------ */

export const CREATE_LABELS = {
  KICKER: 'Forge your legend',
  TITLE: 'Character',
  NAME: 'Name',
  NAME_PLACEHOLDER: 'Enter your name...',
  CLASS: 'Class',
  APPEARANCE: 'Appearance',
  ATTRIBUTES: 'Attributes',
  SUMMARY: 'Summary',
  PASSIVE: 'Passive',
  STARTING_ABILITIES: 'Starting Abilities',
  WORLD_SEED: 'World Seed',
  RANDOMIZE: 'Randomize',
  SEED_HINT: 'The same seed creates the same world.',
  BEGIN: 'Begin the Journey',
  BACK: 'Back',
  HEALTH: 'Health',
  MANA: 'Mana',
} as const;

/* ------------------------------------------------------------------ */
/*  Game Screen                                                        */
/* ------------------------------------------------------------------ */

export const GAME_LABELS = {
  SAVE: 'Save',
  SAVED: 'Saved',
  MENU: 'Menu',
  CHAPTER: 'Chapter',
  WANDER_ON: 'Wander onward →',
  YOU_ARE_HERE: 'You are here',
  TRAVEL: 'Travel',
  HERE: 'Here',
  EMPTY: 'Empty',
  BACK: 'Back',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',
} as const;

/* ------------------------------------------------------------------ */
/*  Character Panel                                                    */
/* ------------------------------------------------------------------ */

export const CHAR_LABELS = {
  CURRENT_LOCATION: 'Current Location',
  ATTRIBUTES: 'Attributes',
  PASSIVE: 'Passive',
  VITALS: 'Vitals',
  HEALTH: 'Health',
  MANA: 'Mana',
  EXPERIENCE: 'Experience',
  GOLD: 'Gold',
  LEVEL: 'Level',
  STRENGTH: 'Strength',
  AGILITY: 'Agility',
  INTELLECT: 'Intellect',
  VITALITY: 'Vitality',
  LUCK: 'Luck',
} as const;

/* ------------------------------------------------------------------ */
/*  Inventory                                                          */
/* ------------------------------------------------------------------ */

export const INVENTORY_LABELS = {
  TITLE: 'Inventory',
  GOLD: 'Gold',
  EQUIPPED: 'Equipped',
  SATCHEL: 'Satchel',
  EMPTY: 'Your satchel is empty.',
  EQUIP: 'Equip',
  UNEQUIP: 'Unequip',
  USE: 'Use',
  SELL: 'Sell',
  DROP: 'Drop',
  DAMAGE: 'Damage',
  DEFENSE: 'Defense',
  RESTORES_HP: 'Restores',
  RESTORES_MP: 'Restores',
  SLOTS: {
    weapon: 'Weapon',
    armor: 'Armor',
    shield: 'Shield',
    ring: 'Ring',
    amulet: 'Amulet',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Combat                                                             */
/* ------------------------------------------------------------------ */

export const COMBAT_LABELS = {
  ENCOUNTER: 'Encounter',
  ROUND: 'Round',
  ENEMY_HEALTH: 'Enemy Health',
  ATTACK: 'Attack',
  DEFEND: 'Defend',
  POTION: 'Potion',
  FLEE: 'Flee',
  ABILITIES: 'Abilities',
  WEAKNESS: 'Weakness',
  CRITICAL: 'Critical strike!',
  VICTORY: 'Victory',
  DEFEAT: 'Defeat',
  YOU_DIE: 'You fall to the darkness...',
  ENEMY_FALLS: 'The {name} falls.',
  ENEMY_STRIKES: 'The {name} strikes you for {dmg} damage.',
  YOU_STRIKE: 'You strike for {dmg} damage.',
  NOT_ENOUGH_MANA: 'Not enough mana.',
  ABILITY_ON_COOLDOWN: 'Ability on cooldown.',
  FLED: 'You escape into the wilds.',
  FLEE_FAILED: 'You fail to flee!',
  MANA: 'mana',
  CD: 'CD',
} as const;

/* ------------------------------------------------------------------ */
/*  Journal                                                            */
/* ------------------------------------------------------------------ */

export const JOURNAL_LABELS = {
  TITLE: 'Journal',
  NO_QUESTS: 'No quests recorded yet.',
  OBJECTIVES: 'Objectives',
  REWARD: 'Reward',
  COMPLETED: 'Completed',
  ACTIVE: 'Active',
  FAILED: 'Failed',
} as const;

/* ------------------------------------------------------------------ */
/*  World Map                                                          */
/* ------------------------------------------------------------------ */

export const MAP_LABELS = {
  TITLE: 'World Map',
  SEED: 'Seed',
  UNDISCOVERED: '???',
  LEGEND: 'Legend',
  DIFFICULTY: 'Difficulty',
  LOCATIONS: 'Discovered Locations',
} as const;

export const DANGER_LABELS = {
  Low: 'Low',
  Moderate: 'Moderate',
  High: 'High',
  Deadly: 'Deadly',
} as const;

/* ------------------------------------------------------------------ */
/*  Codex                                                              */
/* ------------------------------------------------------------------ */

export const CODEX_LABELS = {
  TITLE: 'Codex',
  SUBTITLE: 'Everything you have seen or heard of, recorded.',
  TABS: {
    monsters: 'Bestiary',
    items: 'Arsenal',
    locations: 'Atlas',
    npcs: 'Personae',
    factions: 'Orders',
    lore: 'Chronicles',
  },
  EMPTY: {
    monsters: 'No monsters recorded.',
    items: 'No items recorded.',
    locations: 'No locations recorded.',
    npcs: 'No faces remembered.',
    factions: 'No factions encountered.',
    lore: 'No lore discovered.',
  },
  SEARCH: 'Search the archive...',
  NO_RESULTS: 'Nothing matches your search.',
} as const;

/* ------------------------------------------------------------------ */
/*  NPCs                                                               */
/* ------------------------------------------------------------------ */

export const NPC_LABELS = {
  TITLE: 'People',
  NO_NPCS: 'The roads are empty here.',
  TALK: 'Talk',
  TRADE: 'Trade',
  FORGE: 'Forge',
  RELATIONSHIP: 'Relationship',
  ROLE: 'Role',
  FACTION: 'Faction',
  FAREWELL: 'Farewell',
} as const;

export const RELATIONSHIP_LABELS = {
  HOSTILE: 'Hostile',
  UNFRIENDLY: 'Unfriendly',
  NEUTRAL: 'Neutral',
  FRIENDLY: 'Friendly',
  ALLIED: 'Allied',
} as const;

/* ------------------------------------------------------------------ */
/*  Merchant / Blacksmith                                              */
/* ------------------------------------------------------------------ */

export const SHOP_LABELS = {
  BUY: 'Buy',
  SELL: 'Sell',
  YOUR_GOLD: 'Your Gold',
  MERCHANT_GOLD: "Merchant's Gold",
  EMPTY_STOCK: 'Out of stock.',
  EMPTY_INVENTORY: 'Nothing to sell.',
  CANT_AFFORD: 'Not enough gold.',
  UPGRADE: 'Upgrade',
  UPGRADE_COST: 'Cost',
  REPAIR: 'Repair',
  MAX_LEVEL: 'Already at maximum.',
} as const;

/* ------------------------------------------------------------------ */
/*  Skills                                                             */
/* ------------------------------------------------------------------ */

export const SKILL_LABELS = {
  TITLE: 'Skills',
  POINTS_AVAILABLE: 'Skill Points Available',
  TIER: 'Tier',
  LOCKED: 'Locked',
  UNLOCKED: 'Unlocked',
  MAX_RANK: 'Max rank',
  RANK: 'Rank',
  UNLOCK_COST: 'Cost',
  MANA: 'mana',
  COOLDOWN: 'Cooldown',
  ELEMENT: 'Element',
} as const;

/* ------------------------------------------------------------------ */
/*  Progression                                                        */
/* ------------------------------------------------------------------ */

export const LEVELUP_LABELS = {
  KICKER: 'A new chapter begins',
  TITLE: 'Level {n}',
  HEALTH_GAIN: 'Health increased',
  MANA_GAIN: 'Mana increased',
  SKILL_POINT: 'Skill point earned',
  CONTINUE: 'Continue',
} as const;

export const ACHIEVEMENT_LABELS = {
  UNLOCKED: 'Achievement Unlocked',
  PROGRESS: 'Progress',
} as const;

/* ------------------------------------------------------------------ */
/*  Factions                                                           */
/* ------------------------------------------------------------------ */

export const FACTION_LABELS = {
  TITLE: 'Factions',
  NO_FACTIONS: 'You have not met any factions yet.',
  REPUTATION: 'Reputation',
  STANDING: 'Standing',
} as const;

/* ------------------------------------------------------------------ */
/*  Crafting                                                           */
/* ------------------------------------------------------------------ */

export const CRAFTING_LABELS = {
  TITLE: 'Crafting',
  RECIPES: 'Recipes',
  MATERIALS: 'Materials',
  CRAFT: 'Craft',
  MISSING: 'Missing materials',
  KNOWN: 'Known',
  UNKNOWN: 'Undiscovered recipe',
  EMPTY: 'No recipes known.',
} as const;

/* ------------------------------------------------------------------ */
/*  Loot / Rewards                                                     */
/* ------------------------------------------------------------------ */

export const LOOT_LABELS = {
  TITLE: 'Spoils of Victory',
  GOLD: 'Gold',
  EXPERIENCE: 'Experience',
  ITEM: 'Item',
  TAKE_ALL: 'Take All',
  CONTINUE: 'Continue',
} as const;

/* ------------------------------------------------------------------ */
/*  Endings                                                            */
/* ------------------------------------------------------------------ */

export const ENDING_LABELS = {
  KICKER: 'The tale concludes',
  TITLE: 'Your Legend',
  JOURNEY_STATS: 'Journey Stats',
  DECISIONS: 'Decisions Remembered',
  PLAY_AGAIN: 'Begin a New Journey',
  MAIN_MENU: 'Return to Menu',
} as const;

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

export const SETTINGS_LABELS = {
  KICKER: 'Options',
  TITLE: 'Settings',
  AUDIO: 'Audio',
  MUTE: 'Mute',
  MUTED: 'Muted',
  ON: 'On',
  VOLUME: 'Volume',
  ACCESSIBILITY: 'Accessibility',
  REDUCED_MOTION: 'Reduce motion',
  SAVED_JOURNEYS: 'Saved Journeys',
  NO_SAVES: 'No saves.',
  DELETE: 'Delete',
  BACK_TO_MENU: 'Back to Menu',
  DANGER_ZONE: 'Danger Zone',
  RESET_ALL: 'Delete All Saves',
  RESET_CONFIRM: 'This will permanently delete all saves. Are you sure?',
} as const;

/* ------------------------------------------------------------------ */
/*  Save System                                                        */
/* ------------------------------------------------------------------ */

export const SAVE_LABELS = {
  AUTO_SAVING: 'Saving...',
  AUTO_SAVED: 'Saved',
  SAVE_FAILED: 'Save failed',
  LOAD_FAILED: 'Could not load save',
  SLOT_FULL: 'All slots full. Delete one to save.',
  VERSION_MISMATCH: 'Save format is from an older version and cannot be loaded.',
} as const;

/* ------------------------------------------------------------------ */
/*  Common Buttons                                                     */
/* ------------------------------------------------------------------ */

export const COMMON = {
  OK: 'OK',
  YES: 'Yes',
  NO: 'No',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  CONTINUE: 'Continue',
  CLOSE: 'Close',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  DELETE: 'Delete',
  LOADING: 'Loading...',
  ERROR: 'Something went wrong.',
  RETRY: 'Retry',
} as const;

/* ------------------------------------------------------------------ */
/*  Toast / Notification Messages                                      */
/* ------------------------------------------------------------------ */

export const TOASTS = {
  ITEM_ADDED: 'Item added to inventory',
  ITEM_EQUIPPED: 'Item equipped',
  ITEM_SOLD: 'Item sold',
  ITEM_CONSUMED: 'Potion consumed',
  QUEST_ADDED: 'Quest added',
  QUEST_COMPLETED: 'Quest completed',
  ACHIEVEMENT: 'Achievement unlocked',
  LEVEL_UP: 'Level up!',
  REPUTATION_UP: 'Your standing has improved',
  REPUTATION_DOWN: 'Your standing has worsened',
  FACTION_HOSTILE: 'You have made an enemy',
  FACTION_ALLIED: 'You have made an ally',
  SAVE_SUCCESS: 'Journey saved',
  CRAFT_SUCCESS: 'Item crafted',
  CRAFT_FAILED: 'Not enough materials',
  UPGRADE_SUCCESS: 'Item upgraded',
  UPGRADE_FAILED: 'Cannot upgrade further',
} as const;