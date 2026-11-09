// src/engine/craftingSystem.ts
import type { Character, Item } from '../types/game';
import { RECIPES, RECIPE_REGISTRY, countMaterials as countMats } from '../data/recipes';

export const countMaterials = countMats;

export interface CraftResult {
  success: boolean;
  character: Character;
  item?: Item;
  reason?: string;
  messages: string[];
}

export function craft(
  character: Character,
  recipeId: string,
  hasForge: boolean,
  discovered: Set<string>
): CraftResult {
  const recipe = RECIPE_REGISTRY[recipeId];
  if (!recipe) {
    return { success: false, character, messages: ['Unknown recipe.'] };
  }

  if (recipe.requiresForge && !hasForge) {
    return { success: false, character, reason: 'needs-forge', messages: ['This recipe requires a Blacksmith forge.'] };
  }

  const materials = countMaterials(character);
  const missing = recipe.ingredients.find((ing) => (materials[ing.materialName] || 0) < ing.count);
  if (missing) {
    return {
      success: false,
      character,
      reason: 'missing-materials',
      messages: [`Missing materials: need ${missing.count}x ${missing.materialName}.`],
    };
  }

  // Deduct materials from inventory
  const newInventory = [...character.inventory];
  for (const ing of recipe.ingredients) {
    let needed = ing.count;
    for (let i = newInventory.length - 1; i >= 0 && needed > 0; i--) {
      const it = newInventory[i];
      if (it.name === ing.materialName) {
        if ((it.qty || 1) <= needed) {
          needed -= it.qty || 1;
          newInventory.splice(i, 1);
        } else {
          it.qty = (it.qty || 1) - needed;
          needed = 0;
        }
      }
    }
  }

  const slotMap: Record<string, any> = {
    Weapon: 'weapon',
    Armor: 'armor',
    Ring: 'ring',
  };

  const craftedItem: Item = {
    id: `crafted_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: recipe.name,
    description: recipe.description,
    category: recipe.outputCategory as any,
    rarity: recipe.rarity,
    level: recipe.level,
    value: recipe.level * 35,
    slot: slotMap[recipe.outputCategory],
    stats: recipe.stats,
    effect: recipe.effect,
  };

  newInventory.push(craftedItem);

  return {
    success: true,
    character: { ...character, inventory: newInventory },
    item: craftedItem,
    messages: [`Successfully crafted ${recipe.name}!`],
  };
}
