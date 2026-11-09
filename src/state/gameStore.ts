// src/state/gameStore.ts
import { create } from 'zustand';
import type {
  GameState, Character, World, CombatState, StoryEvent, Item, Monster, Quest, Npc, FactionId, ActiveView, Screen, GameSettings, ChainProgress, AchievementProgress,
} from '../types/game';

import { CLASSES } from '../data/classes';
import { initialReputationMap } from '../data/factions';
import { getAchievement } from '../data/achievements';

import { generateWorld } from '../engine/worldGenerator';
import { generateMonster } from '../engine/monsterGenerator';
import { generateItem } from '../engine/itemGenerator';
import { generateEvent } from '../engine/eventGenerator';
import { generateNpcRoster } from '../engine/npcGenerator';
import { startCombat, playerAttack, useAbility, enemyTurn, attemptFlee } from '../engine/combatEngine';
import { applyQuestEvent, grantQuestRewards } from '../engine/questSystem';
import { initQuestSystem, advanceChainStage } from '../engine/questSystem';
import { applyReputationBatch, type ReputationMap } from '../engine/reputationSystem';
import { resolveDecision, type Decision } from '../engine/decisionResolver';
import { evaluateEnding, canConclude } from '../engine/endingEvaluator';
import { buildConditionContext } from './conditionContext';
import { craft } from '../engine/craftingSystem';
import { spendPoint as spendSkillPoint, sanitizeRanks, skillPointsAvailable } from '../engine/skillTree';
import { validateSave } from '../persistence/saveValidator';
import { migrateSave } from '../persistence/migrations';
import { rollTravel } from '../engine/explorationSystem';
import { toast } from '../components/ui/Toast';
import { applyXp } from '../engine/experienceSystem';
import { saveGame } from '../persistence/saveManager';

const defaultSettings: GameSettings = {
  muted: false,
  volume: 0.4,
  reducedMotion: false,
};

interface GameStore extends GameState {
  setScreen: (s: Screen) => void;
  setActiveView: (v: ActiveView) => void;
  createCharacter: (p: { name: string; className: Character['class']; appearance: number; seed: number; }) => void;
  travelTo: (locationId: string) => void;
  doChoice: (choiceId: string) => void;
  generateNextEvent: () => void;
  attack: () => void;
  cast: (abilityId: string) => void;
  defend: () => void;
  flee: () => void;
  consumeItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  buyFromMerchant: (npcId: string, itemId: string, price: number) => void;
  sellToMerchant: (npcId: string, itemId: string, price: number) => void;
  talkToNpc: (npcId: string) => void;
  applyDialogueOutcome: (npcId: string, effects: { relationshipDelta: number; goldDelta: number; reputation: Partial<Record<FactionId, number>>; flags: string[]; questIds: string[]; }) => void;
  spendSkillPoint: (nodeId: string) => boolean;
  craftRecipe: (recipeId: string, hasForge: boolean) => boolean;
  handleQuestEvent: (event: { kind: string; value?: string | number; count?: number }) => void;
  advanceChainDecision: (chainId: string, choiceId: string) => void;
  unlockAchievement: (id: string) => boolean;
  trackAchievementProgress: (kind: string, value: number) => void;
  evaluateAndSetEnding: () => boolean;
  clearEnding: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setReducedMotion: (v: boolean) => void;
  loadFromSave: (payload: any) => boolean;
  reset: () => void;
}

export const useGame = create<GameStore>((set, get) => ({
  screen: 'menu',
  activeView: 'story',
  character: null,
  world: null,
  currentEvent: null,
  combat: null,
  quests: [],
  chainProgress: [],
  npcs: [],
  factionReputation: initialReputationMap(),
  flags: {},
  codex: { monsters: {}, items: {}, locations: {}, npcs: {}, lore: {} },
  log: [],
  decisionHistory: [],
  unlockedAchievements: [],
  achievementProgress: {},
  discoveredRecipes: [],
  ending: null,
  settings: defaultSettings,
  nextEventCounter: 0,

  setScreen: (screen) => set({ screen }),
  setActiveView: (activeView) => set({ activeView }),

  createCharacter: ({ name, className, appearance, seed }) => {
    const cls = CLASSES[className];
    const char: Character = {
      name: name || 'The Nameless',
      class: className,
      appearance,
      level: 1,
      xp: 0,
      xpNext: 100,
      hp: cls.maxHp,
      maxHp: cls.maxHp,
      mana: cls.maxMana,
      maxMana: cls.maxMana,
      baseStats: { ...cls.stats },
      abilities: [...cls.abilities],
      equipment: {},
      inventory: [
        generateItem({ seed: seed + 1, category: 'Potion', level: 1, rarity: 'Common' }),
        generateItem({ seed: seed + 2, category: 'Potion', level: 1, rarity: 'Common' }),
        generateItem({ seed: seed + 3, category: 'Weapon', level: 1, rarity: 'Common' }),
      ],
      gold: 30,
      statusEffects: [],
      cooldowns: {},
      skillRanks: {},
    };

    const world = generateWorld(seed);
    const startingLoc = world.locations[0];
    const questState = initQuestSystem(1, startingLoc.type, seed + 99);
    const startingNpcs = generateNpcRoster(startingLoc.id, startingLoc.type, seed, 1);

    set({
      character: char,
      world,
      currentEvent: generateEvent(seed + 99),
      screen: 'game',
      activeView: 'story',
      quests: questState.quests,
      chainProgress: questState.chainProgress,
      npcs: startingNpcs,
      factionReputation: initialReputationMap(),
      flags: {},
      codex: { monsters: {}, items: {}, locations: { [startingLoc.id]: startingLoc }, npcs: {}, lore: {} },
      log: [`You begin your journey in ${startingLoc.name}, within the ${world.kingdomName}.`],
      decisionHistory: [],
      unlockedAchievements: [],
      achievementProgress: {},
      discoveredRecipes: [],
      ending: null,
      nextEventCounter: 0,
    });
  },

  travelTo: (locationId) => {
    const { world, character } = get();
    if (!world || !character) return;
    const target = world.locations.find((l) => l.id === locationId);
    const current = world.locations.find((l) => l.id === world.currentLocationId);
    if (!target || target.id === current?.id) return;

    const updatedLocations = world.locations.map((l) => l.id === locationId ? { ...l, discovered: true } : l);
    const newNpcs = generateNpcRoster(target.id, target.type, world.seed, character.level);
    const otherNpcs = get().npcs.filter((n) => n.locationId !== target.id);
    const travelOutcome = current ? rollTravel(current, target, character.level, Date.now()) : null;

    set({
      world: { ...world, currentLocationId: locationId, locations: updatedLocations },
      npcs: [...otherNpcs, ...newNpcs],
      activeView: 'story',
    });

    get().handleQuestEvent({ kind: 'visit-location', value: target.type });

    if (travelOutcome) {
      const log = [...get().log, `Traveling to ${target.name}: ${travelOutcome.narrative}`];
      set({ log });
      if (travelOutcome.kind === 'ambush' && travelOutcome.monsterType) {
        const monster = generateMonster({ seed: Date.now(), type: travelOutcome.monsterType, level: character.level });
        set({ combat: startCombat(character, monster) });
        return;
      }
    }
    get().generateNextEvent();
  },

  generateNextEvent: () => {
    const { nextEventCounter } = get();
    set({ currentEvent: generateEvent(Date.now() + nextEventCounter * 17), nextEventCounter: nextEventCounter + 1 });
  },

  doChoice: (choiceId) => {
    const state = get();
    const { currentEvent, character } = state;
    if (!currentEvent || !character) return;
    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    let newChar = { ...character };
    if (choice.reward?.xp) {
      const result = applyXp({ xp: newChar.xp, xpNext: newChar.xpNext, level: newChar.level, gained: choice.reward.xp });
      newChar = { ...newChar, xp: result.xp, xpNext: result.xpNext, level: result.level };
    }
    if (choice.reward?.gold) newChar.gold += choice.reward.gold;
    if (choice.reward?.item) newChar.inventory.push(generateItem({ seed: Date.now(), level: newChar.level }));

    const decisionHistory = [...state.decisionHistory, { eventId: currentEvent.id, choiceId, timestamp: Date.now() }];
    set({ character: newChar, decisionHistory, log: [...state.log, `→ ${choice.outcome}`] });
    get().trackAchievementProgress('decisions-made', 1);
    get().handleQuestEvent({ kind: 'collect-item' });

    if (Math.random() < 0.5) {
      const monster = generateMonster({ seed: Date.now(), level: newChar.level, isBoss: Math.random() < 0.08 });
      set({ combat: startCombat(newChar, monster), codex: { ...state.codex, monsters: { ...state.codex.monsters, [monster.id]: monster } } });
    } else {
      get().generateNextEvent();
    }
  },

  attack: () => {
    const { character, combat } = get();
    if (!character || !combat || combat.ended) return;
    const res = playerAttack(character, combat);
    if (res.state.ended && res.state.victory) handleVictory(res.state);
    else {
      set({ combat: res.state });
      setTimeout(() => {
        const s = get().combat;
        const c = get().character;
        if (!s || !c || s.ended) return;
        const next = enemyTurn(c, s);
        set({ combat: next });
        if (next.ended && !next.victory) handleDefeat(next);
      }, 700);
    }
  },

  cast: (abilityId) => {
    const { character, combat } = get();
    if (!character || !combat || combat.ended) return;
    const ability = character.abilities.find((a) => a.id === abilityId);
    if (!ability) return;
    const res = useAbility(character, combat, ability);
    if (!res.ok) { toast.error(res.message ?? 'Cannot cast.'); return; }

    set({ combat: res.state, character: { ...character, mana: res.state.playerMana, cooldowns: { ...character.cooldowns, [ability.id]: ability.cooldown } } });
    if (res.state.ended && res.state.victory) handleVictory(res.state);
    else {
      setTimeout(() => {
        const s = get().combat;
        const c = get().character;
        if (!s || !c || s.ended) return;
        const next = enemyTurn(c, s);
        set({ combat: next });
        if (next.ended && !next.victory) handleDefeat(next);
      }, 700);
    }
  },

  defend: () => {
    const { character, combat } = get();
    if (!character || !combat || combat.ended) return;
    set({ combat: { ...combat, playerDefending: true, log: [...combat.log, { text: 'You raise your guard.', kind: 'player' }] } });
    setTimeout(() => {
      const s = get().combat;
      const c = get().character;
      if (!s || !c) return;
      const next = enemyTurn(c, s);
      set({ combat: next });
      if (next.ended && !next.victory) handleDefeat(next);
    }, 700);
  },

  flee: () => {
    const { combat, log } = get();
    if (!combat) return;
    if (attemptFlee(Date.now())) {
      set({ combat: null, log: [...log, 'You escape into the wilds.'] });
      get().generateNextEvent();
    } else {
      set({ combat: { ...combat, log: [...combat.log, { text: 'You fail to flee!', kind: 'system' }] } });
      setTimeout(() => {
        const s = get().combat;
        const c = get().character;
        if (!s || !c) return;
        const next = enemyTurn(c, s);
        set({ combat: next });
      }, 600);
    }
  },

  consumeItem: (itemId) => {
    const { character, log } = get();
    if (!character) return;
    const item = character.inventory.find((i) => i.id === itemId);
    if (!item || !item.effect) return;
    const newChar = { ...character };
    if (item.effect.heal) newChar.hp = Math.min(newChar.maxHp, newChar.hp + item.effect.heal);
    if (item.effect.mana) newChar.mana = Math.min(newChar.maxMana, newChar.mana + item.effect.mana);
    newChar.inventory = newChar.inventory.filter((i) => i.id !== itemId);
    set({ character: newChar, log: [...log, `You consume ${item.name}.`] });
  },

  equipItem: (itemId) => {
    const { character, log } = get();
    if (!character) return;
    const item = character.inventory.find((i) => i.id === itemId);
    if (!item || !item.slot) return;
    const newChar = { ...character };
    const prev = newChar.equipment[item.slot];
    if (prev) newChar.inventory.push(prev);
    newChar.equipment = { ...newChar.equipment, [item.slot]: item };
    newChar.inventory = newChar.inventory.filter((i) => i.id !== itemId);
    set({ character: newChar, log: [...log, `Equipped ${item.name}.`] });
  },

  sellItem: (itemId) => {
    const { character } = get();
    if (!character) return;
    const item = character.inventory.find((i) => i.id === itemId);
    if (!item) return;
    set({ character: { ...character, gold: character.gold + Math.round(item.value * 0.4), inventory: character.inventory.filter((i) => i.id !== itemId) } });
  },

  buyFromMerchant: (npcId, itemId, price) => {
    const { character, npcs } = get();
    if (!character || character.gold < price) return;
    const npc = npcs.find((n) => n.id === npcId);
    const item = npc?.shopInventory.find((i) => i.id === itemId);
    if (!item) return;
    set({
      character: { ...character, gold: character.gold - price, inventory: [...character.inventory, item] },
      npcs: npcs.map((n) => n.id === npcId ? { ...n, shopInventory: n.shopInventory.filter((i) => i.id !== itemId) } : n)
    });
  },

  sellToMerchant: (_, itemId, price) => {
    const { character } = get();
    if (!character) return;
    const item = character.inventory.find((i) => i.id === itemId);
    if (!item) return;
    set({ character: { ...character, gold: character.gold + price, inventory: character.inventory.filter((i) => i.id !== itemId) } });
  },

  talkToNpc: (npcId) => {
    const state = get();
    const npc = state.npcs.find((n) => n.id === npcId);
    if (!npc) return;
    set({
      npcs: state.npcs.map((n) => n.id === npcId ? { ...n, met: true } : n),
      codex: { ...state.codex, npcs: { ...(state.codex.npcs ?? {}), [npcId]: { ...npc, met: true } } }
    });
    get().handleQuestEvent({ kind: 'talk-npc', value: npc.role });
  },

  applyDialogueOutcome: (npcId, effects) => {
    const state = get();
    if (!state.character) return;
    const nextNpcs = state.npcs.map((n) => n.id === npcId ? { ...n, relationship: Math.max(-100, Math.min(100, n.relationship + effects.relationshipDelta)) } : n);
    const nextFlags = { ...state.flags };
    for (const f of effects.flags) nextFlags[f] = true;
    let nextRep = state.factionReputation;
    if (Object.keys(effects.reputation).length > 0) {
      nextRep = applyReputationBatch(nextRep, effects.reputation).reputation as any;
    }
    set({
      npcs: nextNpcs,
      character: { ...state.character, gold: Math.max(0, state.character.gold + effects.goldDelta) },
      flags: nextFlags,
      factionReputation: nextRep,
    });
  },

  spendSkillPoint: (nodeId) => {
    const { character } = get();
    if (!character) return false;
    const points = skillPointsAvailable(character.level, character.skillRanks ?? {});
    const result = spendSkillPoint(character.class, nodeId, character.skillRanks ?? {}, character.level, points);
    if (!result.ok) { toast.error(result.reason ?? 'Cannot unlock.'); return false; }
    set({ character: { ...character, skillRanks: result.ranks } });
    return true;
  },

  craftRecipe: (recipeId, hasForge) => {
    const { character, discoveredRecipes } = get();
    if (!character) return false;
    const result = craft(character, recipeId, hasForge, new Set(discoveredRecipes));
    if (!result.success && result.reason !== 'roll-failed') { toast.error(result.messages[0]); return false; }
    set({ character: result.character });
    if (result.success) toast.success(result.messages[0]); else toast.error(result.messages[0]);
    return result.success;
  },

  handleQuestEvent: (event) => {
    const state = get();
    const result = applyQuestEvent({ quests: state.quests, chainProgress: state.chainProgress, completedCount: 0, chainsCompletedCount: 0 }, event as any);
    let updatedCharacter = state.character;

    for (const q of result.completed) {
      if (updatedCharacter) {
        const grant = grantQuestRewards(updatedCharacter, q, Date.now());
        updatedCharacter = grant.character;
        grant.messages.forEach((m: string) => toast.success(m));
      }
      get().trackAchievementProgress('quests-completed', 1);
    }
    set({ quests: result.state.quests, character: updatedCharacter });
  },

  advanceChainDecision: (chainId, choiceId) => {
    const { chainProgress, character, quests } = get();
    if (!character) return;
    const result = resolveDecision({ id: choiceId, effects: [] }, character, Date.now());
    set({ character: result.character });
    const advance = advanceChainStage({ quests, chainProgress, completedCount: 0, chainsCompletedCount: 0 }, chainId, result.flagsToSet);
    set({ quests: advance.state.quests, chainProgress: advance.state.chainProgress });
    if (advance.chainCompleted) { get().trackAchievementProgress('chains-completed', 1); toast.success('Main chain complete'); }
  },

  unlockAchievement: (id) => {
    const { unlockedAchievements } = get();
    if (unlockedAchievements.includes(id)) return false;
    const ach = getAchievement(id);
    if (!ach) return false;
    set({ unlockedAchievements: [...unlockedAchievements, id] });
    toast.achievement(ach.name, { title: `Achievement · ${ach.name}`, body: ach.description });
    return true;
  },

  trackAchievementProgress: (kind, value) => {
    const { achievementProgress } = get();
    const prev = achievementProgress[kind] ?? { current: 0, target: 0 };
    set({ achievementProgress: { ...achievementProgress, [kind]: { ...prev, current: prev.current + value } } });
  },

  evaluateAndSetEnding: () => {
    const state = get();
    const ctx = buildConditionContext(state);
    if (!canConclude(ctx)) return false;
    const result = evaluateEnding(ctx);
    set({ ending: { endingId: result.ending.id, timestamp: Date.now(), couldHaveEndedWith: result.audit.filter((a) => a.matched).map((a) => a.endingId) } });
    if (result.achievementId) get().unlockAchievement(result.achievementId);
    return true;
  },

  clearEnding: () => set({ ending: null }),
  toggleMute: () => set({ settings: { ...get().settings, muted: !get().settings.muted } }),
  setVolume: (v) => set({ settings: { ...get().settings, volume: Math.max(0, Math.min(1, v)) } }),
  setReducedMotion: (v) => set({ settings: { ...get().settings, reducedMotion: v } }),

  loadFromSave: (raw) => {
    const validation = validateSave(raw);
    if (validation.severity === 'fatal') { toast.error('Save corrupt.'); return false; }
    const migration = migrateSave(validation.payload);
    const s = migration.payload.state;
    set({
      character: { ...s.character, skillRanks: sanitizeRanks(s.character.class, s.character.skillRanks ?? {}) },
      world: s.world, quests: s.quests ?? [], chainProgress: s.chainProgress ?? [], npcs: s.npcs ?? [], factionReputation: s.factionReputation ?? initialReputationMap(), flags: s.flags ?? {}, codex: s.codex ?? { monsters: {}, items: {}, locations: {}, npcs: {}, lore: {} }, log: s.log ?? [], decisionHistory: s.decisionHistory ?? [], unlockedAchievements: s.unlockedAchievements ?? [], achievementProgress: s.achievementProgress ?? {}, discoveredRecipes: s.discoveredRecipes ?? [], ending: s.ending ?? null, currentEvent: s.currentEvent ?? generateEvent(Date.now()), nextEventCounter: s.nextEventCounter ?? 0, screen: 'game', activeView: 'story', combat: null,
    });
    toast.success('Journey resumed.');
    return true;
  },

  // **THIS IS THE FIXED RESET FUNCTION**
  reset: () => {
    const state = get();
    if (state.character) {
      try {
        saveGame(undefined, state);
      } catch (e) {
        console.warn('AutoSave on reset failed:', e);
      }
    }
    set({
      screen: 'menu',
      activeView: 'story',
      character: null,
      world: null,
      currentEvent: null,
      combat: null,
      quests: [],
      chainProgress: [],
      npcs: [],
      factionReputation: initialReputationMap(),
      flags: {},
      codex: { monsters: {}, items: {}, locations: {}, npcs: {}, lore: {} },
      log: [],
      decisionHistory: [],
      unlockedAchievements: [],
      achievementProgress: {},
      discoveredRecipes: [],
      ending: null,
      nextEventCounter: 0,
    });
  },
}));

function handleVictory(combat: CombatState) {
  const state = useGame.getState();
  if (!state.character) return;
  const c = { ...state.character };
  c.xp += combat.monster.xpReward;
  c.gold += combat.monster.goldReward;
  c.hp = combat.playerHp;
  c.mana = combat.playerMana;

  if (Math.random() < combat.monster.lootChance) {
    c.inventory.push(generateItem({ seed: Date.now(), level: c.level }));
  }

  while (c.xp >= c.xpNext) {
    c.xp -= c.xpNext;
    c.level += 1;
    c.xpNext = Math.round(c.xpNext * 1.35);
    c.maxHp += 12; c.hp = c.maxHp;
    c.maxMana += 6; c.mana = c.maxMana;
  }

  const cd: Record<string, number> = {};
  for (const k of Object.keys(c.cooldowns)) cd[k] = Math.max(0, c.cooldowns[k] - 1);
  c.cooldowns = cd;

  useGame.setState({
    character: c, combat: null, log: [...state.log, `Defeated ${combat.monster.name} (+${combat.monster.xpReward} XP).`],
    codex: { ...state.codex, monsters: { ...state.codex.monsters, [combat.monster.id]: combat.monster } },
  });
  useGame.getState().trackAchievementProgress('monsters-killed', 1);
  if (combat.monster.type === 'Boss') useGame.getState().trackAchievementProgress('bosses-killed', 1);
  useGame.getState().generateNextEvent();
}

function handleDefeat(combat: CombatState) {
  const state = useGame.getState();
  if (!state.character) return;
  useGame.setState({ character: { ...state.character, hp: Math.max(1, Math.round(state.character.maxHp * 0.5)) }, combat: null, log: [...state.log, 'You fall — but the realm is not done with you.'] });
  toast.error('Defeated', { body: 'You wake with half your health.' });
}