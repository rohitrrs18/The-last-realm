import type { Item, Rarity, ItemCategory } from '../types/game';
import { mulberry32, pick, randInt, chance } from './rng';
import { WEAPON_PREFIX, WEAPON_NOUN, ITEM_EPITHETS } from '../data/content';

export function generateItem(opts: { seed: number; category?: ItemCategory; level: number; rarity?: Rarity }): Item {
  const r = mulberry32(opts.seed);
  const rarity: Rarity = opts.rarity ?? weightedRarity(r);
  const category: ItemCategory = opts.category ?? pick(r, ['Weapon','Armor','Shield','Ring','Amulet','Potion'] as ItemCategory[]);
  const level = opts.level;

  const prefix = pick(r, WEAPON_PREFIX);
  const noun = pick(r, WEAPON_NOUN[category] ?? ['Relic']);
  const useEpithet = rarity === 'Epic' || rarity === 'Legendary' || rarity === 'Mythic';
  const name = useEpithet
    ? `${prefix} ${noun} ${pick(r, ITEM_EPITHETS)}`
    : `${prefix} ${noun}`;

  const multiplier = rarityMultiplier(rarity);

  const item: Item = {
    id: `item_${Date.now()}_${Math.floor(r() * 1e6)}`,
    name: cap(name),
    description: describeItem(category, rarity, r),
    category,
    rarity,
    level,
    value: Math.round((10 + level * 8) * multiplier),
  };

  if (['Weapon','Armor','Shield','Ring','Amulet'].includes(category)) {
    item.slot = category.toLowerCase() as any;
    item.stats = {};
    if (category === 'Weapon') item.stats.damage = Math.round((6 + level * 2.2) * multiplier);
    if (category === 'Armor') item.stats.defense = Math.round((4 + level * 1.6) * multiplier);
    if (category === 'Shield') item.stats.defense = Math.round((3 + level * 1.4) * multiplier);
    if (category === 'Ring' || category === 'Amulet') item.stats.luck = Math.round(1 * multiplier) + 1;
    if (rarity !== 'Common') item.stats.crit = Math.round(2 * multiplier);
    if (rarity === 'Legendary' || rarity === 'Mythic') {
      item.ability = pick(r, ['Flame Rend','Soul Leech','Arcane Surge','Ember Ward']);
    }
  }

  if (category === 'Potion') {
    item.stackable = true;
    item.qty = 1;
    item.effect = chance(r, 0.7)
      ? { heal: 20 + level * 10 }
      : { mana: 15 + level * 8 };
    item.description = `A ${rarity.toLowerCase()} draught. Restores ${item.effect.heal ? 'health' : 'mana'} when consumed.`;
  }

  return item;
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function rarityMultiplier(r: Rarity): number {
  return { Common: 1, Uncommon: 1.3, Rare: 1.7, Epic: 2.2, Legendary: 3.2, Mythic: 4.5 }[r];
}

function weightedRarity(r: () => number): Rarity {
  const table: { value: Rarity; weight: number }[] = [
    { value: 'Common', weight: 55 },
    { value: 'Uncommon', weight: 25 },
    { value: 'Rare', weight: 12 },
    { value: 'Epic', weight: 5 },
    { value: 'Legendary', weight: 2.5 },
    { value: 'Mythic', weight: 0.5 },
  ];
  const total = table.reduce((s, t) => s + t.weight, 0);
  let x = r() * total;
  for (const t of table) { if (x < t.weight) return t.value; x -= t.weight; }
  return 'Common';
}

function describeItem(category: ItemCategory, rarity: Rarity, r: () => number): string {
  const tone: Record<Rarity, string> = {
    Common: 'A serviceable piece, worn but honest.',
    Uncommon: 'Crafted with care by a forgotten hand.',
    Rare: 'A piece with a past, and likely a grudge.',
    Epic: 'Its presence hums faintly with old power.',
    Legendary: 'Songs have been sung of this. Most of them tragic.',
    Mythic: 'Older than the realm itself. Few have held it and returned.',
  };
  return `${tone[rarity]} (${category})`;
}