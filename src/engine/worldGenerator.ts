import type { World, Location, Rarity } from '../types/game';
import { mulberry32, pick, randInt, chance, weightedPick } from './rng';
import {
  KINGDOM_PREFIX, KINGDOM_SUFFIX, LOCATION_NAMES, LOCATION_DESCRIPTIONS,
} from '../data/content';

const LOCATION_TYPES: Location['type'][] = ['village','forest','ruins','cave','mountain','dungeon','castle','lake'];

export function generateWorld(seed: number): World {
  const r = mulberry32(seed);
  const kingdomName = `${pick(r, KINGDOM_PREFIX)} ${pick(r, KINGDOM_SUFFIX)}`;

  const count = randInt(r, 9, 12);
  const locations: Location[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i++) {
    const type = pick(r, LOCATION_TYPES);
    const names: any = LOCATION_NAMES[type];
    let name = '';
    for (let k = 0; k < 20; k++) {
      name = cap(pick(r, names.prefix) + pick(r, names.suffix));
      if (!used.has(name)) break;
    }
    used.add(name);

    const difficulty = randInt(r, 1, 10);
    const dangerLevel: Location['dangerLevel'] =
      difficulty <= 3 ? 'Low' : difficulty <= 6 ? 'Moderate' : difficulty <= 8 ? 'High' : 'Deadly';
    const region = cap(pick(r, ['The Ashen Plains', 'The Hollow Reach', 'The Silver Marches', 'The Broken Vale', 'The Elder Wilds', 'The Deepening']));
    const description = pick(r, LOCATION_DESCRIPTIONS[type]);

    const loot: Rarity[] = ['Common','Common','Uncommon','Uncommon','Rare'];
    if (difficulty >= 8) loot.push('Epic');
    if (difficulty >= 9 && chance(r, 0.4)) loot.push('Legendary');

    locations.push({
      id: `loc_${i}`,
      name,
      region,
      type,
      description,
      difficulty,
      x: randInt(r, 8, 92),
      y: randInt(r, 10, 90),
      discovered: i === 0,
      dangerLevel,
      enemies: pickEnemies(type, difficulty, r),
      lootTable: loot,
    });
  }

  return {
    seed,
    kingdomName,
    locations,
    currentLocationId: locations[0].id,
  };
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function pickEnemies(type: Location['type'], difficulty: number, r: () => number): string[] {
  const base: Record<string, string[]> = {
    forest:   ['dire-wolf', 'giant-spider', 'bandit'],
    ruins:    ['skeleton', 'wraith', 'hollow-knight'],
    cave:     ['giant-spider', 'goblin', 'golem'],
    dungeon:  ['skeleton', 'wraith', 'revenant'],
    mountain: ['dire-wolf', 'colossus'],
    village:  ['bandit', 'cultist'],
    castle:   ['hollow-knight', 'revenant'],
    lake:     ['wraith', 'serpent'],
  };
  const list = base[type] ?? ['bandit'];
  const out: string[] = [];
  const n = difficulty >= 7 ? 3 : 2;
  for (let i = 0; i < n; i++) out.push(pick(r, list));
  return out;
}

export function locationById(w: World, id: string) {
  return w.locations.find(l => l.id === id);
}

export function randomRarityFromTable(r: () => number, table: Rarity[]): Rarity {
  return weightedPick(r, table.map((t) => [t, rarityWeight(t)]));
}

function rarityWeight(r: Rarity): number {
  switch (r) {
    case 'Common': return 60;
    case 'Uncommon': return 30;
    case 'Rare': return 15;
    case 'Epic': return 6;
    case 'Legendary': return 2;
    case 'Mythic': return 0.3;
  }
}