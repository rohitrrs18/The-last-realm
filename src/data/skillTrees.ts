// src/data/skillTrees.ts
// Comprehensive 3-tier skill trees for each champion class.

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  kind: 'passive' | 'ability' | 'statBoost';
  tier: number;
  maxRank: number;
  cost: number;
  levelRequires: number;
  requires: string[];
  passive?: {
    effect:
      | 'critBonus'
      | 'damageBonus'
      | 'defenseBonus'
      | 'evasionBonus'
      | 'manaRegen'
      | 'hpRegen'
      | 'spellPower'
      | 'armorPenetration'
      | 'accuracyBonus';
    perRank: number;
  };
  statPerRank?: {
    hp?: number;
    mana?: number;
    strength?: number;
    agility?: number;
    intellect?: number;
    vitality?: number;
    luck?: number;
    defense?: number;
  };
  abilityId?: string;
}

export interface SkillTree {
  className: string;
  rootNodeId: string;
  nodes: SkillNode[];
}

export const SKILL_TREES: Record<string, SkillTree> = {
  Warrior: {
    className: 'Warrior',
    rootNodeId: 'w_iron_skin',
    nodes: [
      // Tier 1
      {
        id: 'w_iron_skin',
        name: 'Iron Skin',
        description: 'Hardens constitution, increasing physical defense by 12% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'defenseBonus', perRank: 12 },
      },
      {
        id: 'w_heavy_cleave',
        name: 'Heavy Cleave',
        description: 'Imbues weapon attacks with crushing force, increasing melee damage by 15% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'damageBonus', perRank: 15 },
      },
      {
        id: 'w_juggernaut',
        name: 'Juggernaut Vigor',
        description: 'Increases max health by 25 and vitality by 4 per rank.',
        kind: 'statBoost',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        statPerRank: { hp: 25, vitality: 4 },
      },
      // Tier 2
      {
        id: 'w_bulwark',
        name: 'Bulwark Mastery',
        description: 'Reinforces shield defenses, adding 20% bonus defense.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['w_iron_skin'],
        passive: { effect: 'defenseBonus', perRank: 20 },
      },
      {
        id: 'w_berserk',
        name: 'Berserker Blood',
        description: 'Increases critical strike rate by 12% per rank.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['w_heavy_cleave'],
        passive: { effect: 'critBonus', perRank: 12 },
      },
      // Tier 3
      {
        id: 'w_titan',
        name: 'Titan of the Last Realm',
        description: 'Mastery over battlefield warfare. Increases damage by 35% and defense by 35%.',
        kind: 'passive',
        tier: 3,
        maxRank: 1,
        cost: 3,
        levelRequires: 5,
        requires: ['w_bulwark', 'w_berserk'],
        passive: { effect: 'damageBonus', perRank: 35 },
      },
    ],
  },
  Mage: {
    className: 'Mage',
    rootNodeId: 'm_arcane_flow',
    nodes: [
      // Tier 1
      {
        id: 'm_arcane_flow',
        name: 'Arcane Resonance',
        description: 'Deepens the pool of internal mana, increasing max mana by 30 per rank.',
        kind: 'statBoost',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        statPerRank: { mana: 30, intellect: 3 },
      },
      {
        id: 'm_pyroclasm',
        name: 'Pyromancy Spark',
        description: 'Infuses offensive spells with scorching fire, boosting spell damage by 18% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'damageBonus', perRank: 18 },
      },
      {
        id: 'm_frost_barrier',
        name: 'Glacial Ward',
        description: 'Envelops the caster in frost, reducing incoming damage by 12% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'defenseBonus', perRank: 12 },
      },
      // Tier 2
      {
        id: 'm_mystic_surge',
        name: 'Mystic Surge',
        description: 'Channeling critical magical anomalies, boosting spell critical rate by 15% per rank.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['m_pyroclasm'],
        passive: { effect: 'critBonus', perRank: 15 },
      },
      {
        id: 'm_astral_aegis',
        name: 'Astral Aegis',
        description: 'Magical shield that absorbs incoming strikes, adding 25% defense.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['m_frost_barrier'],
        passive: { effect: 'defenseBonus', perRank: 25 },
      },
      // Tier 3
      {
        id: 'm_archon',
        name: 'Ascended Archmage',
        description: 'Unleashes infinite celestial energy. Spell damage surges by 40%.',
        kind: 'passive',
        tier: 3,
        maxRank: 1,
        cost: 3,
        levelRequires: 5,
        requires: ['m_mystic_surge'],
        passive: { effect: 'damageBonus', perRank: 40 },
      },
    ],
  },
  Rogue: {
    className: 'Rogue',
    rootNodeId: 'r_serrated_edge',
    nodes: [
      // Tier 1
      {
        id: 'r_serrated_edge',
        name: 'Serrated Edge',
        description: 'Hones daggers to a razor sharpness, increasing weapon damage by 15% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'damageBonus', perRank: 15 },
      },
      {
        id: 'r_phantom_agility',
        name: 'Phantom Agility',
        description: 'Swift footwork that increases critical strike chance by 12% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'critBonus', perRank: 12 },
      },
      {
        id: 'r_shadow_cloak',
        name: 'Shadow Cloak',
        description: 'Enshrouds movement in shadow, increasing defense and evasion by 12% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'defenseBonus', perRank: 12 },
      },
      // Tier 2
      {
        id: 'r_viper_venom',
        name: 'Viper Venom',
        description: 'Coats blades in deadly nightshade, adding 20% bonus strike damage.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['r_serrated_edge'],
        passive: { effect: 'damageBonus', perRank: 20 },
      },
      {
        id: 'r_lethality',
        name: 'Backstab Lethality',
        description: 'Devastating stealth strikes that amplify critical damage by 20%.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['r_phantom_agility'],
        passive: { effect: 'critBonus', perRank: 20 },
      },
      // Tier 3
      {
        id: 'r_shadow_reaper',
        name: 'Master of Shadows',
        description: 'Become the invisible reaper. Damage increases by 40% with lethal bleed.',
        kind: 'passive',
        tier: 3,
        maxRank: 1,
        cost: 3,
        levelRequires: 5,
        requires: ['r_lethality'],
        passive: { effect: 'damageBonus', perRank: 40 },
      },
    ],
  },
  Ranger: {
    className: 'Ranger',
    rootNodeId: 'rg_eagle_eye',
    nodes: [
      // Tier 1
      {
        id: 'rg_eagle_eye',
        name: 'Eagle Eye',
        description: 'Keen long-distance perception increases critical strike chance by 12% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'critBonus', perRank: 12 },
      },
      {
        id: 'rg_true_flight',
        name: 'True-Flight Arrow',
        description: 'Increases ranged bow damage by 15% per rank.',
        kind: 'passive',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        passive: { effect: 'damageBonus', perRank: 15 },
      },
      {
        id: 'rg_sylva_ward',
        name: 'Sylva Ward',
        description: 'The forest spirits protect you, boosting health by 25 and defense by 10% per rank.',
        kind: 'statBoost',
        tier: 1,
        maxRank: 3,
        cost: 1,
        levelRequires: 1,
        requires: [],
        statPerRank: { hp: 25, defense: 10 },
      },
      // Tier 2
      {
        id: 'rg_volley',
        name: 'Hail of Arrows',
        description: 'Rapid-fire shots that deal an additional 20% weapon damage.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['rg_true_flight'],
        passive: { effect: 'damageBonus', perRank: 20 },
      },
      {
        id: 'rg_predator',
        name: 'Predator Instinct',
        description: 'Exploits monstrous weaknesses, increasing critical strike rate by 15%.',
        kind: 'passive',
        tier: 2,
        maxRank: 2,
        cost: 2,
        levelRequires: 3,
        requires: ['rg_eagle_eye'],
        passive: { effect: 'critBonus', perRank: 15 },
      },
      // Tier 3
      {
        id: 'rg_wild_hunt',
        name: 'Avatar of the Wild Hunt',
        description: 'Legendary archery prowess. Bow damage surges by 40% with piercing arrows.',
        kind: 'passive',
        tier: 3,
        maxRank: 1,
        cost: 3,
        levelRequires: 5,
        requires: ['rg_volley'],
        passive: { effect: 'damageBonus', perRank: 40 },
      },
    ],
  },
};

export function getSkillTree(className: string): SkillTree {
  return SKILL_TREES[className] || SKILL_TREES.Warrior;
}

export function getSkillNode(className: string, id: string): SkillNode | undefined {
  const tree = getSkillTree(className);
  return tree.nodes.find((n) => n.id === id);
}

export function getSkillTreeRows(className: string): SkillNode[][] {
  const tree = getSkillTree(className);
  const tier1 = tree.nodes.filter((n) => n.tier === 1);
  const tier2 = tree.nodes.filter((n) => n.tier === 2);
  const tier3 = tree.nodes.filter((n) => n.tier === 3);
  return [tier1, tier2, tier3];
}
