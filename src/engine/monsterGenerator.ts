import type { Monster, MonsterType, Ability } from '../types/game';
import { mulberry32, pick, randInt } from './rng';
import { MONSTER_TEMPLATES } from '../data/content';

const TYPE_ABILITY: Record<MonsterType, Ability[]> = {
  Beast:    [{ id: 'mb_bite', name: 'Savage Bite', description: 'A vicious bite.', cost: 0, cooldown: 2, power: 1.3, kind: 'attack', element: 'physical' }],
  Undead:   [{ id: 'mu_wail', name: 'Soul Wail', description: 'A wail that saps strength.', cost: 0, cooldown: 2, power: 1.2, kind: 'debuff', element: 'shadow' }],
  Demon:    [{ id: 'md_hell', name: 'Hellfire', description: 'Burns with infernal flame.', cost: 0, cooldown: 3, power: 1.8, kind: 'attack', element: 'fire' }],
  Humanoid: [{ id: 'mh_quick', name: 'Quick Slash', description: 'A fast, low-damage slash.', cost: 0, cooldown: 1, power: 1.1, kind: 'attack', element: 'physical' }],
  Ancient:  [{ id: 'ma_slam', name: 'Crushing Slam', description: 'A great stone fist.', cost: 0, cooldown: 3, power: 1.9, kind: 'attack', element: 'physical' }],
  Boss:     [
    { id: 'boss_phase', name: 'Dark Radiance', description: 'Wracking waves of shadow.', cost: 0, cooldown: 3, power: 2.2, kind: 'attack', element: 'shadow' },
    { id: 'boss_heal', name: 'Dark Regeneration', description: 'The boss mends its wounds.', cost: 0, cooldown: 4, power: 0.5, kind: 'heal', element: 'shadow' },
  ],
};

const TYPE_WEAKNESS: Record<MonsterType, string> = {
  Beast: 'Fire', Undead: 'Holy', Demon: 'Ice', Humanoid: 'Physical', Ancient: 'Fire', Boss: 'Holy',
};

export function generateMonster(opts: {
  seed: number; type?: MonsterType; level: number; isBoss?: boolean;
}): Monster {
  const r = mulberry32(opts.seed);
  const type: MonsterType = opts.isBoss ? 'Boss' : (opts.type ?? pick(r, ['Beast','Undead','Demon','Humanoid','Ancient'] as MonsterType[]));
  const names = MONSTER_TEMPLATES[type];
  const name = opts.isBoss
    ? pick(r, MONSTER_TEMPLATES.Boss)
    : pick(r, names);

  const level = Math.max(1, opts.level);
  const hpBase = opts.isBoss ? 180 : 40;
  const hp = Math.round((hpBase + level * (opts.isBoss ? 30 : 12)) * (1 + r() * 0.2));
  const attack = Math.round((6 + level * 3) * (opts.isBoss ? 1.4 : 1));
  const defense = Math.round((2 + level * 1.6) * (opts.isBoss ? 1.3 : 1));
  const speed = Math.round((5 + level * 1.2));
  const xpReward = Math.round((15 + level * 12) * (opts.isBoss ? 3 : 1));
  const goldReward = Math.round((10 + level * 8) * (opts.isBoss ? 4 : 1));

  return {
    id: `mon_${Date.now()}_${Math.floor(r() * 1e6)}`,
    name,
    type,
    level,
    hp, maxHp: hp,
    attack, defense, speed,
    abilities: TYPE_ABILITY[type],
    weakness: TYPE_WEAKNESS[type],
    description: describe(type, name),
    xpReward, goldReward,
    lootChance: opts.isBoss ? 1 : 0.55,
    phase: 1,
  };
}

function describe(type: MonsterType, name: string): string {
  const map: Record<MonsterType, string> = {
    Beast:    `${name} — a predator of the wilds, all teeth and hunger.`,
    Undead:   `${name} — something that should have stayed in the ground.`,
    Demon:    `${name} — infernal, hungry, and patient.`,
    Humanoid: `${name} — a mortal, which is often worse.`,
    Ancient:  `${name} — older than the current age, and slow to anger.`,
    Boss:     `${name} — a being of terrible legend, spoken of in hushed tones.`,
  };
  return map[type];
}