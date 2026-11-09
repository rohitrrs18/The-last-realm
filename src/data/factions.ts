// src/data/factions.ts
// Faction definitions: standing tiers, inter-faction relationships,
// and player-facing copy. Feeds reputationSystem, faction UI, and endings.

/* ------------------------------------------------------------------ */
/*  Types                                                              */
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

export interface FactionRelation {
  /** Target faction. */
  faction: FactionId;
  /** -1 (mortal enemies) to 1 (close allies). */
  affinity: number;
}

export interface Faction {
  id: FactionId;
  /** Display name. */
  name: string;
  /** One-line tagline. */
  tagline: string;
  /** Longer description shown in codex/faction screen. */
  description: string;
  /** Player's reputation with this faction at game start. */
  startingReputation: number;
  /** If true, this faction has no reputation tracking (used for 'None'). */
  inert?: boolean;
  /** Cross-faction relationships. */
  relations: FactionRelation[];
  /** Color token for UI accents. */
  accentColor: string;
  /** Icon theme hint for the UI. */
  emblemHint: 'crown' | 'flame' | 'tower' | 'skull' | 'compass' | 'sword' | 'void';
}

/* ------------------------------------------------------------------ */
/*  Faction definitions                                                */
/* ------------------------------------------------------------------ */

export const FACTIONS: Record<FactionId, Faction> = {
  Crown: {
    id: 'Crown',
    name: 'The Crown',
    tagline: 'The old kingdom and its king that never died.',
    description:
      'What remains of the royal house. Bureaucratic, careful, and patient. They believe the realm can be saved through order — and they are usually right, but never kind.',
    startingReputation: 10,
    relations: [
      { faction: 'Old Faith', affinity: 0.4 },
      { faction: 'Free Cities', affinity: 0.2 },
      { faction: 'Hollow Cult', affinity: -0.8 },
      { faction: 'Wanderers', affinity: -0.1 },
      { faction: 'Mercenary Guild', affinity: 0.1 },
    ],
    accentColor: '#B79A65',
    emblemHint: 'crown',
  },
  'Old Faith': {
    id: 'Old Faith',
    name: 'The Old Faith',
    tagline: 'The gods who were here before the kingdom.',
    description:
      'Priests and keepers of older rites. They remember what the Crown has forgotten, and they are not always careful what they ask for. Holy magic runs in their veins.',
    startingReputation: 0,
    relations: [
      { faction: 'Crown', affinity: 0.4 },
      { faction: 'Free Cities', affinity: 0.1 },
      { faction: 'Hollow Cult', affinity: -0.6 },
      { faction: 'Wanderers', affinity: 0.3 },
      { faction: 'Mercenary Guild', affinity: -0.2 },
    ],
    accentColor: '#E8E3D7',
    emblemHint: 'flame',
  },
  'Free Cities': {
    id: 'Free Cities',
    name: 'The Free Cities',
    tagline: 'Traders, tinkerers, and the only ones still making money.',
    description:
      'A loose alliance of merchant-city-states. They have no king and no gods — only contracts. They fund the roads, own the ships, and remember every debt.',
    startingReputation: 5,
    relations: [
      { faction: 'Crown', affinity: 0.2 },
      { faction: 'Old Faith', affinity: 0.1 },
      { faction: 'Hollow Cult', affinity: -0.4 },
      { faction: 'Wanderers', affinity: 0.2 },
      { faction: 'Mercenary Guild', affinity: 0.5 },
    ],
    accentColor: '#536B52',
    emblemHint: 'tower',
  },
  'Hollow Cult': {
    id: 'Hollow Cult',
    name: 'The Hollow Cult',
    tagline: 'They worship what the world forgot.',
    description:
      'A scattered cult that traces its lineage to the Hollow Queen. They are patient, quiet, and everywhere — and they do not believe the living should be trusted with the dead.',
    startingReputation: -20,
    relations: [
      { faction: 'Crown', affinity: -0.8 },
      { faction: 'Old Faith', affinity: -0.6 },
      { faction: 'Free Cities', affinity: -0.4 },
      { faction: 'Wanderers', affinity: -0.3 },
      { faction: 'Mercenary Guild', affinity: 0.1 },
    ],
    accentColor: '#A97AC4',
    emblemHint: 'skull',
  },
  Wanderers: {
    id: 'Wanderers',
    name: 'The Wanderers',
    tagline: 'Those who go where the roads end.',
    description:
      'No formal organization — just a shared understanding. Wanderers keep the old paths, share what they find, and refuse to settle. Every long road has a Wanderer on it.',
    startingReputation: 5,
    relations: [
      { faction: 'Crown', affinity: -0.1 },
      { faction: 'Old Faith', affinity: 0.3 },
      { faction: 'Free Cities', affinity: 0.2 },
      { faction: 'Hollow Cult', affinity: -0.3 },
      { faction: 'Mercenary Guild', affinity: 0.1 },
    ],
    accentColor: '#6C8CC2',
    emblemHint: 'compass',
  },
  'Mercenary Guild': {
    id: 'Mercenary Guild',
    name: 'The Mercenary Guild',
    tagline: 'A blade for coin. Nothing personal.',
    description:
      'A neutral, well-organized trade guild of soldiers-for-hire. They do not take sides — only contracts — which makes them both the most reliable and least trusted faction in the realm.',
    startingReputation: 0,
    relations: [
      { faction: 'Crown', affinity: 0.1 },
      { faction: 'Old Faith', affinity: -0.2 },
      { faction: 'Free Cities', affinity: 0.5 },
      { faction: 'Hollow Cult', affinity: 0.1 },
      { faction: 'Wanderers', affinity: 0.1 },
    ],
    accentColor: '#873F3B',
    emblemHint: 'sword',
  },
  None: {
    id: 'None',
    name: 'Unaffiliated',
    tagline: 'No faction, no loyalty.',
    description: 'No formal allegiance. Some prefer it that way.',
    startingReputation: 0,
    inert: true,
    relations: [],
    accentColor: '#77746B',
    emblemHint: 'void',
  },
};

/* ------------------------------------------------------------------ */
/*  Standing tiers                                                     */
/* ------------------------------------------------------------------ */

export interface StandingDef {
  tier: StandingTier;
  /** Min reputation to enter this tier. */
  min: number;
  /** Max reputation to stay in this tier. */
  max: number;
  /** Player-facing label. */
  label: string;
  /** Description shown in the faction screen. */
  description: string;
  /** Text color token. */
  color: string;
}

export const STANDINGS: StandingDef[] = [
  {
    tier: 'Hostile',
    min: -100,
    max: -40,
    label: 'Hostile',
    description: 'They will act against you when they can.',
    color: '#873F3B',
  },
  {
    tier: 'Unfriendly',
    min: -39,
    max: -1,
    label: 'Unfriendly',
    description: 'They will not help you without reason.',
    color: '#B7793A',
  },
  {
    tier: 'Neutral',
    min: 0,
    max: 29,
    label: 'Neutral',
    description: 'They will deal with you, and no further.',
    color: '#AAA496',
  },
  {
    tier: 'Friendly',
    min: 30,
    max: 59,
    label: 'Friendly',
    description: 'They will help you, within reason.',
    color: '#536B52',
  },
  {
    tier: 'Allied',
    min: 60,
    max: 100,
    label: 'Allied',
    description: 'They will stand with you when it matters.',
    color: '#B79A65',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Look up a faction by id, with `None` fallback. */
export function getFaction(id: FactionId): Faction {
  return FACTIONS[id] ?? FACTIONS.None;
}

/** Which standing tier a reputation value belongs to. */
export function tierForReputation(reputation: number): StandingDef {
  for (const s of STANDINGS) {
    if (reputation >= s.min && reputation <= s.max) return s;
  }
  return reputation < -100 ? STANDINGS[0] : STANDINGS[STANDINGS.length - 1];
}

/** Get affinity from one faction toward another (0 if unknown or inert). */
export function affinityBetween(
  from: FactionId,
  to: FactionId
): number {
  const src = FACTIONS[from];
  if (!src || src.inert) return 0;
  const rel = src.relations.find((r) => r.faction === to);
  return rel?.affinity ?? 0;
}

/** All non-inert factions. */
export function activeFactions(): Faction[] {
  return Object.values(FACTIONS).filter((f) => !f.inert);
}

/** Initial reputation map for a new game. */
export function initialReputationMap(): Record<FactionId, number> {
  const map = {} as Record<FactionId, number>;
  for (const id of Object.keys(FACTIONS) as FactionId[]) {
    map[id] = FACTIONS[id].startingReputation;
  }
  return map;
}

/** Short player-facing text for a standing tier. */
export function standingLabel(tier: StandingTier): string {
  return STANDINGS.find((s) => s.tier === tier)?.label ?? 'Neutral';
}

/** Text color for a standing tier. */
export function standingColor(tier: StandingTier): string {
  return STANDINGS.find((s) => s.tier === tier)?.color ?? '#AAA496';
}