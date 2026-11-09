// src/data/recipes.ts
import type { Item, Rarity, ItemCategory } from '../types/game';

export interface CraftingIngredient {
  materialName: string;
  count: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  outputCategory: 'Potion' | 'Weapon' | 'Armor' | 'Ring';
  rarity: Rarity;
  level: number;
  ingredients: CraftingIngredient[];
  requiresForge: boolean;
  requiresDiscovery: boolean;
  stats?: any;
  effect?: { heal?: number; mana?: number };
}

export const RECIPES: Recipe[] = [
  // Potions
  {
    id: 'rec_hp_potion',
    name: 'Healing Draught',
    description: 'Brewed from wild herbs to soothe battle wounds.',
    outputCategory: 'Potion',
    rarity: 'Common',
    level: 1,
    ingredients: [{ materialName: 'Medicinal Herb', count: 2 }],
    requiresForge: false,
    requiresDiscovery: false,
    effect: { heal: 40 },
  },
  {
    id: 'rec_mana_elixir',
    name: 'Mana Elixir',
    description: 'A shimmering azure vial distilled from powdered starlight.',
    outputCategory: 'Potion',
    rarity: 'Common',
    level: 1,
    ingredients: [{ materialName: 'Arcane Dust', count: 2 }],
    requiresForge: false,
    requiresDiscovery: false,
    effect: { mana: 30 },
  },
  {
    id: 'rec_vitality_remedy',
    name: 'Elixir of Rejuvenation',
    description: 'Restores both body and spirit in the heat of battle.',
    outputCategory: 'Potion',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Medicinal Herb', count: 3 }, { materialName: 'Arcane Dust', count: 2 }],
    requiresForge: false,
    requiresDiscovery: false,
    effect: { heal: 75, mana: 50 },
  },
  {
    id: 'rec_stoneskin_brew',
    name: 'Stoneskin Tonic',
    description: 'Hardens skin into granite, protecting against deadly strikes.',
    outputCategory: 'Potion',
    rarity: 'Rare',
    level: 4,
    ingredients: [{ materialName: 'Iron Ore', count: 2 }, { materialName: 'Medicinal Herb', count: 2 }],
    requiresForge: false,
    requiresDiscovery: false,
    effect: { heal: 100 },
  },

  // Weapons
  {
    id: 'rec_iron_blade',
    name: 'Forged Steel Blade',
    description: 'A finely balanced longsword beaten into shape at the forge.',
    outputCategory: 'Weapon',
    rarity: 'Uncommon',
    level: 2,
    ingredients: [{ materialName: 'Iron Ore', count: 4 }],
    requiresForge: true,
    requiresDiscovery: false,
    stats: { damage: 16, strength: 3 },
  },
  {
    id: 'rec_shadow_daggers',
    name: 'Twin Viper Daggers',
    description: 'Serrated blades quenched in midnight oils for swift assassinations.',
    outputCategory: 'Weapon',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Iron Ore', count: 3 }, { materialName: 'Arcane Dust', count: 3 }],
    requiresForge: true,
    requiresDiscovery: false,
    stats: { damage: 22, crit: 15, agility: 4 },
  },
  {
    id: 'rec_arcane_staff',
    name: 'Rune-Carved Oak Staff',
    description: 'Channeling conduit crafted from enchanted heartwood.',
    outputCategory: 'Weapon',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Enchanted Wood', count: 4 }, { materialName: 'Arcane Dust', count: 3 }],
    requiresForge: false,
    requiresDiscovery: false,
    stats: { damage: 20, intellect: 6, mana: 25 },
  },
  {
    id: 'rec_sylva_bow',
    name: 'Sylva Recurve Bow',
    description: 'Lithe composite bow stringed with spun silk and silver.',
    outputCategory: 'Weapon',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Enchanted Wood', count: 3 }, { materialName: 'Leather Scraps', count: 3 }],
    requiresForge: false,
    requiresDiscovery: false,
    stats: { damage: 21, agility: 5, crit: 10 },
  },

  // Armor
  {
    id: 'rec_plated_cuirass',
    name: 'Reinforced Steel Cuirass',
    description: 'Heavy chest armor designed to withstand monstrous claws.',
    outputCategory: 'Armor',
    rarity: 'Uncommon',
    level: 2,
    ingredients: [{ materialName: 'Iron Ore', count: 5 }],
    requiresForge: true,
    requiresDiscovery: false,
    stats: { defense: 14, hp: 30, vitality: 3 },
  },
  {
    id: 'rec_stalker_leathers',
    name: 'Shadowstalker Brigandine',
    description: 'Pliant boiled leather reinforced with dark iron studs.',
    outputCategory: 'Armor',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Leather Scraps', count: 5 }, { materialName: 'Iron Ore', count: 2 }],
    requiresForge: false,
    requiresDiscovery: false,
    stats: { defense: 11, agility: 4, crit: 8 },
  },
  {
    id: 'rec_astral_vestment',
    name: 'Astral Silk Vestment',
    description: 'Robe woven with warding threads that absorb magical shockwaves.',
    outputCategory: 'Armor',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Arcane Dust', count: 4 }, { materialName: 'Medicinal Herb', count: 2 }],
    requiresForge: false,
    requiresDiscovery: false,
    stats: { defense: 8, intellect: 6, mana: 40 },
  },

  // Rings
  {
    id: 'rec_vitality_band',
    name: 'Band of the Iron Heart',
    description: 'A heavy signet ring that pulses with steadfast vitality.',
    outputCategory: 'Ring',
    rarity: 'Rare',
    level: 2,
    ingredients: [{ materialName: 'Iron Ore', count: 3 }, { materialName: 'Medicinal Herb', count: 2 }],
    requiresForge: true,
    requiresDiscovery: false,
    stats: { hp: 35, vitality: 4 },
  },
  {
    id: 'rec_arcane_ring',
    name: 'Ring of Arcane Flow',
    description: 'Focuses internal mana flow, speeding up recovery.',
    outputCategory: 'Ring',
    rarity: 'Rare',
    level: 3,
    ingredients: [{ materialName: 'Arcane Dust', count: 4 }],
    requiresForge: false,
    requiresDiscovery: false,
    stats: { mana: 30, intellect: 4 },
  },
];

export const RECIPE_REGISTRY: Record<string, Recipe> = {};
for (const r of RECIPES) {
  RECIPE_REGISTRY[r.id] = r;
}

export function recipesForLevel(level: number): Recipe[] {
  return RECIPES.filter((r) => r.level <= level);
}

export function countMaterials(character: any): Record<string, number> {
  const counts: Record<string, number> = {
    'Medicinal Herb': 3,
    'Arcane Dust': 2,
    'Iron Ore': 4,
    'Leather Scraps': 3,
    'Enchanted Wood': 2,
  };
  if (!character?.inventory) return counts;
  for (const item of character.inventory) {
    if (item.category === 'Material') {
      counts[item.name] = (counts[item.name] || 0) + (item.qty || 1);
    }
  }
  return counts;
}

export function recipeAvailability(character: any, hasForge: boolean, discovered: Set<string>) {
  const materials = countMaterials(character);
  return RECIPES.map((recipe) => {
    const hasMaterials = recipe.ingredients.every((ing) => (materials[ing.materialName] || 0) >= ing.count);
    const hasStation = !recipe.requiresForge || hasForge;
    const isDiscovered = !recipe.requiresDiscovery || discovered.has(recipe.id);
    return {
      recipe,
      canCraft: hasMaterials && hasStation && isDiscovered,
      missingMaterials: recipe.ingredients.filter((ing) => (materials[ing.materialName] || 0) < ing.count),
    };
  });
}
