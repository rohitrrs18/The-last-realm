// src/types/game.ts
// Complete type definitions for THE LAST REALM.
// Expanded to support: NPCs, factions, skill trees, quest chains,
// achievements, crafting, endings, and the expanded combat engine with real opponent attacks.

/* ------------------------------------------------------------------ */
/*  Core enums                                                         */
/* ------------------------------------------------------------------ */

export type ClassName = 'Warrior' | 'Mage' | 'Rogue' | 'Ranger';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type ItemCategory =
  | 'Weapon'
  | 'Armor'
  | 'Shield'
  | 'Ring'
  | 'Amulet'
  | 'Potion'
  | 'Quest'
  | 'Material';

export type MonsterType =
  | 'Beast'
  | 'Undead'
  | 'Demon'
  | 'Humanoid'
  | 'Ancient'
  | 'Boss';

export type Element = 'physical' | 'fire' | 'ice' | 'holy' | 'shadow';

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

export interface Stats {
  strength: number;
  agility: number;
  intellect: number;
  vitality: number;
  luck: number;
}

/* ------------------------------------------------------------------ */
/*  Abilities                                                          */
/* ------------------------------------------------------------------ */

export interface Ability {
  id: string;
  name: string;
  description: string;
  /** Mana cost. */
  cost: number;
  /** Cooldown in turns. */
  cooldown: number;
  /** Damage/heal multiplier. */
  power: number;
  kind: 'attack' | 'heal' | 'buff' | 'debuff';
  element?: Element;
}

/* ------------------------------------------------------------------ */
/*  Items                                                              */
/* ------------------------------------------------------------------ */

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: Rarity;
  level: number;
  value: number;
  slot?: 'weapon' | 'armor' | 'shield' | 'ring' | 'amulet';
  stats?: Partial<Stats> & {
    damage?: number;
    defense?: number;
    crit?: number;
    hp?: number;
    mana?: number;
  };
  ability?: string;
  stackable?: boolean;
  qty?: number;
  effect?: { heal?: number; mana?: number };
}

/* ------------------------------------------------------------------ */
/*  Character                                                          */
/* ------------------------------------------------------------------ */

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  shield?: Item;
  ring?: Item;
  amulet?: Item;
}

export interface StatusEffect {
  id: string;
  name: string;
  turns: number;
  kind: 'poison' | 'burn' | 'stun' | 'buff' | 'shield';
}

export interface Character {
  name: string;
  class: ClassName;
  appearance: number;
  level: number;
  xp: number;
  xpNext: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  baseStats: Stats;
  abilities: Ability[];
  equipment: Equipment;
  inventory: Item[];
  gold: number;
  statusEffects: StatusEffect[];
  cooldowns: Record<string, number>;
  /** Allocated skill tree ranks (node id → rank). */
  skillRanks: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/*  World                                                              */
/* ------------------------------------------------------------------ */

export type LocationType =
  | 'village'
  | 'forest'
  | 'ruins'
  | 'cave'
  | 'mountain'
  | 'dungeon'
  | 'castle'
  | 'lake';

export type DangerLevel = 'Low' | 'Moderate' | 'High' | 'Deadly';

export interface Location {
  id: string;
  name: string;
  region: string;
  type: LocationType;
  description: string;
  difficulty: number;
  x: number;
  y: number;
  discovered: boolean;
  dangerLevel: DangerLevel;
  enemies: string[];
  lootTable: Rarity[];
}

export interface World {
  seed: number;
  kingdomName: string;
  locations: Location[];
  currentLocationId: string;
}

/* ------------------------------------------------------------------ */
/*  Monsters                                                           */
/* ------------------------------------------------------------------ */

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: Ability[];
  weakness?: string;
  description: string;
  xpReward: number;
  goldReward: number;
  lootChance: number;
  phase?: number;
  statuses?: StatusEffect[];
  cooldowns?: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/*  Combat                                                             */
/* ------------------------------------------------------------------ */

export interface CombatLogEntry {
  text: string;
  kind: 'player' | 'enemy' | 'system';
}

export interface CombatActionFeedback {
  who: 'player' | 'enemy';
  name: string;
  damage?: number;
  heal?: number;
  isCrit?: boolean;
  isBlocked?: boolean;
}

export interface CombatState {
  monster: Monster;
  playerHp: number;
  playerMana: number;
  turn: number;
  log: CombatLogEntry[];
  ended: boolean;
  victory?: boolean;
  playerDefending: boolean;
  monsterStatus: { id: string; name: string; turns: number }[];
  playerStatuses?: { id: string; name: string; turns: number }[];
  /** Real attack action details for visual feedback */
  lastAction?: CombatActionFeedback | null;
  /** Opponent intent for next turn */
  enemyIntent?: string;
  /** Opponent is currently in attacking animation */
  isEnemyAttacking?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Quests                                                             */
/* ------------------------------------------------------------------ */

export type QuestCategory = 'main' | 'side' | 'exploration' | 'bounty';

export interface QuestObjective {
  id: string;
  text: string;
  done: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  reward: { xp: number; gold: number; item?: Rarity };
  category: QuestCategory;
  status: 'active' | 'completed' | 'failed';
}

/* ------------------------------------------------------------------ */
/*  Story events                                                       */
/* ------------------------------------------------------------------ */

export interface StoryEventChoice {
  id: string;
  label: string;
  outcome: string;
  reward?: { xp?: number; gold?: number; item?: boolean };
  consequence?: string;
}

export interface StoryEvent {
  id: string;
  title: string;
  narrative: string;
  choices: StoryEventChoice[];
}

/* ------------------------------------------------------------------ */
/*  NPCs                                                               */
/* ------------------------------------------------------------------ */

export type NpcRole =
  | 'Merchant'
  | 'Blacksmith'
  | 'Villager'
  | 'Guard'
  | 'Scholar'
  | 'Traveller'
  | 'Quest Giver'
  | 'Innkeeper'
  | 'Herbalist';

export type NpcPersonality =
  | 'Warm'
  | 'Curt'
  | 'Wary'
  | 'Cheerful'
  | 'Grim'
  | 'Scholarly'
  | 'Trickster'
  | 'Kind'
  | 'Bitter'
  | 'Proud';

export interface Npc {
  id: string;
  name: string;
  role: NpcRole;
  personality: NpcPersonality;
  personalityNote: string;
  faction: string;
  locationId: string;
  relationship: number;
  dialogueTreeId: string;
  shopInventory: Item[];
  greeting: string;
  farewell: string;
  chatter: string;
  met: boolean;
}

/* ------------------------------------------------------------------ */
/*  Factions                                                           */
/* ------------------------------------------------------------------ */

export type FactionId =
  | 'Crown'
  | 'Old Faith'
  | 'Free Cities'
  | 'Hollow Cult'
  | 'Wanderers'
  | 'Mercenary Guild'
  | 'None';

export type StandingTier =
  | 'Hostile'
  | 'Unfriendly'
  | 'Neutral'
  | 'Friendly'
  | 'Allied';

/* ------------------------------------------------------------------ */
/*  Chain progress                                                     */
/* ------------------------------------------------------------------ */

export interface ChainProgress {
  chainId: string;
  stageId: string;
  flags: string[];
  stagesCompleted: number;
  finished: boolean;
}

/* ------------------------------------------------------------------ */
/*  Codex                                                              */
/* ------------------------------------------------------------------ */

export interface CodexState {
  monsters: Record<string, Monster>;
  items: Record<string, Item>;
  locations: Record<string, Location>;
  npcs?: Record<string, Npc>;
  lore?: Record<string, any>;
}

/* ------------------------------------------------------------------ */
/*  Achievements                                                       */
/* ------------------------------------------------------------------ */

export interface AchievementProgress {
  current: number;
  target: number;
}

/* ------------------------------------------------------------------ */
/*  Endings                                                            */
/* ------------------------------------------------------------------ */

export type OutcomeKind =
  | 'justice'
  | 'mercy'
  | 'power'
  | 'destruction'
  | 'redemption'
  | 'sacrifice';

export interface EndingSummary {
  endingId: string;
  timestamp: number;
  couldHaveEndedWith: string[];
}

/* ------------------------------------------------------------------ */
/*  Decision history                                                   */
/* ------------------------------------------------------------------ */

export interface DecisionRecord {
  eventId: string;
  choiceId: string;
  timestamp: number;
  outcome?: OutcomeKind;
}

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

export interface GameSettings {
  muted: boolean;
  volume: number;
  reducedMotion: boolean;
}

/* ------------------------------------------------------------------ */
/*  Screens & views                                                    */
/* ------------------------------------------------------------------ */

export type Screen = 'menu' | 'create' | 'game' | 'settings';

export type ActiveView =
  | 'story'
  | 'character'
  | 'inventory'
  | 'skills'
  | 'journal'
  | 'map'
  | 'codex'
  | 'npcs'
  | 'crafting'
  | 'factions';

/* ------------------------------------------------------------------ */
/*  Main game state                                                    */
/* ------------------------------------------------------------------ */

export interface GameState {
  screen: Screen;
  activeView: ActiveView;
  character: Character | null;
  world: World | null;
  currentEvent: StoryEvent | null;
  combat: CombatState | null;
  quests: Quest[];
  chainProgress: ChainProgress[];
  npcs: Npc[];
  factionReputation: Record<FactionId, number>;
  flags: Record<string, boolean>;
  codex: CodexState;
  log: string[];
  decisionHistory: DecisionRecord[];
  unlockedAchievements: string[];
  achievementProgress: Record<string, AchievementProgress>;
  discoveredRecipes: string[];
  ending: EndingSummary | null;
  settings: GameSettings;
  nextEventCounter: number;
}
