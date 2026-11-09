// src/engine/combatEngine.ts
// Expanded combat engine with real opponent attacks, signature abilities, damage calculations, and combat feedback.

import type { Character, Monster, CombatState, Ability, CombatLogEntry, CombatActionFeedback } from '../types/game';
import { mulberry32 } from './rng';

export function startCombat(char: Character, monster: Monster): CombatState {
  // Determine initial intent
  const initialMove = monster.abilities?.[0]?.name || 'a fierce strike';
  return {
    monster: { ...monster },
    playerHp: char.hp,
    playerMana: char.mana,
    turn: 1,
    log: [
      { text: `⚔️ An aggressive ${monster.name} (Lv.${monster.level}) charges into combat!`, kind: 'system' },
      { text: `⚠️ ${monster.name} is preparing ${initialMove}!`, kind: 'enemy' },
    ],
    ended: false,
    playerDefending: false,
    monsterStatus: [],
    playerStatuses: [],
    lastAction: null,
    enemyIntent: `Preparing ${initialMove}`,
    isEnemyAttacking: false,
  };
}

export function playerAttack(
  char: Character,
  state: CombatState
): { state: CombatState; damage: number; crit: boolean; logEntry: string } {
  const r = mulberry32(Date.now() + state.turn * 13);
  
  // Calculate player attack power based on class main stat + weapon
  const weaponDmg = char.equipment?.weapon?.stats?.damage || 8;
  const mainStat =
    char.class === 'Warrior'
      ? char.baseStats.strength
      : char.class === 'Mage'
      ? char.baseStats.intellect
      : char.class === 'Rogue'
      ? char.baseStats.agility
      : (char.baseStats.agility + char.baseStats.strength) / 2;

  const baseDmg = weaponDmg + mainStat * 1.5;
  const variance = 0.85 + r() * 0.3; // 85% to 115%
  
  // Crit chance
  const critChance = Math.min(0.4, 0.1 + (char.baseStats.luck + (char.baseStats.agility * 0.5)) * 0.015);
  const isCrit = r() < critChance;
  const critMultiplier = isCrit ? 1.85 : 1.0;

  // Weakness check
  let weaknessMultiplier = 1.0;
  if (state.monster.weakness) {
    const classElementMap: Record<string, string> = {
      Warrior: 'Physical',
      Mage: 'Fire',
      Rogue: 'Physical',
      Ranger: 'Physical',
    };
    if (classElementMap[char.class]?.toLowerCase() === state.monster.weakness.toLowerCase()) {
      weaknessMultiplier = 1.35;
    }
  }

  // Enemy defense mitigation (capped at 50%)
  const defMitigation = Math.min(0.5, state.monster.defense / (state.monster.defense + 40));
  const totalDamage = Math.max(
    1,
    Math.round(baseDmg * variance * critMultiplier * weaknessMultiplier * (1 - defMitigation))
  );

  const newMonsterHp = Math.max(0, state.monster.hp - totalDamage);
  const ended = newMonsterHp <= 0;
  const victory = ended;

  let logText = isCrit
    ? `⚡ CRITICAL HIT! You slash ${state.monster.name} for ${totalDamage} damage!`
    : `⚔️ You attack ${state.monster.name} for ${totalDamage} damage!`;

  if (weaknessMultiplier > 1.0) {
    logText += ` (Vulnerable to ${state.monster.weakness}!)`;
  }

  const log: CombatLogEntry[] = [...state.log, { text: logText, kind: 'player' }];
  if (victory) {
    log.push({ text: `🏆 ${state.monster.name} collapses in defeat!`, kind: 'system' });
  }

  // Forecast next enemy move
  const nextMove = chooseEnemyMove(state.monster);

  const updatedState: CombatState = {
    ...state,
    monster: { ...state.monster, hp: newMonsterHp },
    log,
    ended,
    victory,
    lastAction: {
      who: 'player',
      name: isCrit ? 'Critical Strike' : 'Attack',
      damage: totalDamage,
      isCrit,
    },
    enemyIntent: ended ? '' : `Preparing ${nextMove.name}`,
    isEnemyAttacking: false,
  };

  return { state: updatedState, damage: totalDamage, crit: isCrit, logEntry: logText };
}

export function useAbility(
  char: Character,
  state: CombatState,
  ability: Ability
): { state: CombatState; ok: boolean; damage?: number; heal?: number; message?: string } {
  if (state.playerMana < ability.cost) {
    return { state, ok: false, message: 'Not enough mana!' };
  }

  const r = mulberry32(Date.now() + state.turn * 31);
  const newMana = Math.max(0, state.playerMana - ability.cost);

  let newMonsterHp = state.monster.hp;
  let newPlayerHp = state.playerHp;
  let damage = 0;
  let heal = 0;
  const logEntries: CombatLogEntry[] = [];
  let isCrit = false;

  if (ability.kind === 'attack' || ability.kind === 'debuff') {
    const mainStat =
      ability.element === 'fire' || ability.element === 'ice' || ability.element === 'shadow' || ability.element === 'holy'
        ? char.baseStats.intellect * 1.8
        : char.baseStats.strength * 1.6;

    const baseDmg = (mainStat + 10) * ability.power;
    const variance = 0.9 + r() * 0.25;
    isCrit = r() < 0.2;
    const critMult = isCrit ? 1.75 : 1.0;

    // Element weakness
    let elementMult = 1.0;
    if (ability.element && state.monster.weakness && ability.element.toLowerCase() === state.monster.weakness.toLowerCase()) {
      elementMult = 1.45;
    }

    damage = Math.max(2, Math.round(baseDmg * variance * critMult * elementMult));
    newMonsterHp = Math.max(0, state.monster.hp - damage);

    let txt = isCrit
      ? `💥 CRITICAL SPELL! ${ability.name} explodes for ${damage} ${ability.element || ''} damage!`
      : `✨ You unleash ${ability.name} on ${state.monster.name} for ${damage} damage!`;
    if (elementMult > 1.0) txt += ` (Super effective!)`;
    logEntries.push({ text: txt, kind: 'player' });
  } else if (ability.kind === 'heal') {
    heal = Math.round((char.baseStats.intellect * 2 + 25) * ability.power);
    newPlayerHp = Math.min(char.maxHp, state.playerHp + heal);
    logEntries.push({ text: `💚 You cast ${ability.name}, restoring ${heal} HP!`, kind: 'player' });
  } else {
    // Shield / Buff
    logEntries.push({ text: `🛡️ You invoke ${ability.name}, enhancing your defenses!`, kind: 'player' });
  }

  const ended = newMonsterHp <= 0;
  const victory = ended;
  if (victory) {
    logEntries.push({ text: `🏆 ${state.monster.name} was vanquished!`, kind: 'system' });
  }

  const nextMove = chooseEnemyMove(state.monster);

  const updatedState: CombatState = {
    ...state,
    playerMana: newMana,
    playerHp: newPlayerHp,
    monster: { ...state.monster, hp: newMonsterHp },
    log: [...state.log, ...logEntries],
    ended,
    victory,
    lastAction: {
      who: 'player',
      name: ability.name,
      damage: damage > 0 ? damage : undefined,
      heal: heal > 0 ? heal : undefined,
      isCrit,
    },
    enemyIntent: ended ? '' : `Preparing ${nextMove.name}`,
    isEnemyAttacking: false,
  };

  return { state: updatedState, ok: true, damage, heal };
}

export function enemyTurn(char: Character, state: CombatState): CombatState {
  if (state.ended || state.monster.hp <= 0) return state;

  const r = mulberry32(Date.now() + state.turn * 47);
  const move = chooseEnemyMove(state.monster);

  // Base monster attack
  const rawAttack = state.monster.attack * move.power;
  const variance = 0.88 + r() * 0.28;
  const isCrit = r() < 0.12; // 12% crit chance for opponent
  const critMultiplier = isCrit ? 1.6 : 1.0;

  // Player defense mitigation from armor & equipment
  const armorDefense = (char.equipment?.armor?.stats?.defense || 0) + (char.equipment?.shield?.stats?.defense || 0) + char.baseStats.vitality;
  const defReduction = Math.min(0.45, armorDefense / (armorDefense + 50));

  let finalDamage = Math.max(1, Math.round(rawAttack * variance * critMultiplier * (1 - defReduction)));
  const isBlocked = state.playerDefending;

  if (isBlocked) {
    // Guard reduces damage by 65%
    finalDamage = Math.max(1, Math.round(finalDamage * 0.35));
  }

  const newPlayerHp = Math.max(0, state.playerHp - finalDamage);
  const ended = newPlayerHp <= 0;
  const victory = false;

  let logText = '';
  if (isBlocked) {
    logText = `🛡️ BLOCKED! You braced your guard against ${state.monster.name}'s ${move.name}! Absorbed most damage (took ${finalDamage} HP).`;
  } else if (isCrit) {
    logText = `🔥 CRITICAL BLOW! ${state.monster.name} lunges fiercely with ${move.name} for ${finalDamage} damage!`;
  } else {
    logText = `💥 ${state.monster.name} strikes with ${move.name} dealing ${finalDamage} damage!`;
  }

  const log: CombatLogEntry[] = [...state.log, { text: logText, kind: 'enemy' }];

  if (ended) {
    log.push({ text: `💀 You have fallen in combat against ${state.monster.name}!`, kind: 'system' });
  } else {
    // Forecast next move
    const nextMove = chooseEnemyMove(state.monster);
    log.push({ text: `⚠️ ${state.monster.name} readies ${nextMove.name}!`, kind: 'system' });
  }

  return {
    ...state,
    playerHp: newPlayerHp,
    turn: state.turn + 1,
    playerDefending: false, // Reset guard
    ended,
    victory,
    log,
    lastAction: {
      who: 'enemy',
      name: move.name,
      damage: finalDamage,
      isCrit,
      isBlocked,
    },
    enemyIntent: ended ? '' : `Preparing ${chooseEnemyMove(state.monster).name}`,
    isEnemyAttacking: true,
  };
}

function chooseEnemyMove(monster: Monster): { name: string; power: number; element?: string } {
  // If monster has special abilities
  if (monster.abilities && monster.abilities.length > 0) {
    const special = monster.abilities[Math.floor(Math.random() * monster.abilities.length)];
    return { name: special.name, power: special.power || 1.3, element: special.element };
  }

  // Default moves per type
  const typeMoves: Record<string, { name: string; power: number }[]> = {
    Beast: [
      { name: 'Savage Bite', power: 1.2 },
      { name: 'Feral Claw Swipe', power: 1.0 },
      { name: 'Predatory Pounce', power: 1.4 },
    ],
    Undead: [
      { name: 'Cursed Cleave', power: 1.15 },
      { name: 'Soul Siphon', power: 1.3 },
      { name: 'Grave Chill', power: 1.25 },
    ],
    Demon: [
      { name: 'Hellfire Blast', power: 1.5 },
      { name: 'Shadow Rend', power: 1.35 },
      { name: 'Infernal Strike', power: 1.2 },
    ],
    Humanoid: [
      { name: 'Precision Thrust', power: 1.1 },
      { name: 'Heavy Shield Bash', power: 1.25 },
      { name: 'Battle Cry Slash', power: 1.3 },
    ],
    Ancient: [
      { name: 'Cataclysmic Slam', power: 1.6 },
      { name: 'Stone Gaze', power: 1.2 },
      { name: 'Primal Shockwave', power: 1.4 },
    ],
    Boss: [
      { name: 'Cataclysmic Annihilation', power: 1.9 },
      { name: 'Dark Radiance', power: 1.6 },
      { name: 'Soul Reaper', power: 1.7 },
    ],
  };

  const moves = typeMoves[monster.type] || typeMoves.Beast;
  return moves[Math.floor(Math.random() * moves.length)];
}

export function attemptFlee(seed: number): boolean {
  const r = mulberry32(seed);
  return r() < 0.65; // 65% escape chance
}
