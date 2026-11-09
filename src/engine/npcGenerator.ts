// src/engine/npcGenerator.ts
import type { Npc, NpcRole, NpcPersonality, Item } from '../types/game';

const ROLES: NpcRole[] = ['Merchant', 'Blacksmith', 'Villager', 'Guard', 'Scholar', 'Innkeeper', 'Herbalist'];
const PERSONALITIES: NpcPersonality[] = ['Warm', 'Wary', 'Cheerful', 'Grim', 'Scholarly', 'Kind'];

export function generateNpcRoster(
  locationId = 'loc_village',
  locationType = 'village',
  seed = Date.now(),
  playerLevel = 1
): Npc[] {
  const shopItems: Item[] = [
    {
      id: `shop_pot_1_${seed}`,
      name: 'Minor Health Draught',
      description: 'A standard healing brew.',
      category: 'Potion',
      rarity: 'Common',
      level: 1,
      value: 15,
      effect: { heal: 35 },
    },
    {
      id: `shop_pot_2_${seed}`,
      name: 'Mana Vial',
      description: 'Restores magical reserves.',
      category: 'Potion',
      rarity: 'Common',
      level: 1,
      value: 18,
      effect: { mana: 25 },
    },
    {
      id: `shop_wep_1_${seed}`,
      name: 'Iron Broadsword',
      description: 'Sturdy military blade.',
      category: 'Weapon',
      rarity: 'Common',
      level: 1,
      value: 30,
      slot: 'weapon',
      stats: { damage: 12 },
    },
  ];

  return [
    {
      id: `npc_smith_${locationId}`,
      name: 'Torvald the Hammer',
      role: 'Blacksmith',
      personality: 'Grim',
      personalityNote: 'Speaks little, hammers much.',
      faction: 'Crown',
      locationId,
      relationship: 10,
      dialogueTreeId: 'dt_smith',
      shopInventory: shopItems,
      greeting: 'Steel and coal. What brings you to my anvil?',
      farewell: 'Keep your blade oiled.',
      chatter: 'The royal legion used to buy fifty blades a month from me.',
      met: true,
    },
    {
      id: `npc_merch_${locationId}`,
      name: 'Elowen of the Silver Coast',
      role: 'Merchant',
      personality: 'Warm',
      personalityNote: 'Enjoys good trade and tea.',
      faction: 'Free Cities',
      locationId,
      relationship: 15,
      dialogueTreeId: 'dt_merchant',
      shopInventory: shopItems,
      greeting: 'Welcome, wanderer! Fresh goods arrived just yesterday.',
      farewell: 'May fair winds follow your coin purse.',
      chatter: 'Roads to the capital are blocked by bandits lately.',
      met: true,
    },
    {
      id: `npc_herbalist_${locationId}`,
      name: 'Sylas Meadowbloom',
      role: 'Herbalist',
      personality: 'Kind',
      personalityNote: 'Knows every root and blossom.',
      faction: 'Old Faith',
      locationId,
      relationship: 20,
      dialogueTreeId: 'dt_herb',
      shopInventory: shopItems,
      greeting: 'Mind the roots underfoot. The forest provides all remedies.',
      farewell: 'Walk gently beneath the boughs.',
      chatter: 'The sap in the redwoods has turned dark. Something stirs.',
      met: true,
    },
    {
      id: `npc_guard_${locationId}`,
      name: 'Captain Alistair',
      role: 'Guard',
      personality: 'Wary',
      personalityNote: 'Vigilant eye for trouble.',
      faction: 'Crown',
      locationId,
      relationship: 5,
      dialogueTreeId: 'dt_guard',
      shopInventory: [],
      greeting: 'State your purpose in this settlement, stranger.',
      farewell: 'Keep your weapon sheathed in the square.',
      chatter: 'Beasts have crept closer to the gates every night since the eclipse.',
      met: true,
    },
  ];
}

export function generateOneNpc(locationId = 'loc_1', role: NpcRole = 'Villager'): Npc {
  return generateNpcRoster(locationId)[0];
}

export function generateOneNpcOfRole(locationId = 'loc_1', role: NpcRole = 'Villager'): Npc {
  return generateNpcRoster(locationId).find((n) => n.role === role) || generateNpcRoster(locationId)[0];
}

export function npcDialogueTree(id: string) {
  return {};
}

export function adjustNpcRelationship(npc: Npc, delta = 5): Npc {
  return { ...npc, relationship: Math.max(-100, Math.min(100, npc.relationship + delta)) };
}

export function npcRelationshipLabel(rel = 0): string {
  if (rel <= -20) return 'Hostile';
  if (rel < 10) return 'Neutral';
  if (rel < 40) return 'Friendly';
  return 'Devoted';
}

export function npcCanTrade(npc: Npc): boolean {
  return npc.role === 'Merchant' || npc.role === 'Innkeeper' || npc.role === 'Herbalist';
}

export function npcCanForge(npc: Npc): boolean {
  return npc.role === 'Blacksmith';
}

export function npcCanGiveQuests(npc: Npc): boolean {
  return npc.role === 'Quest Giver' || npc.role === 'Guard';
}
