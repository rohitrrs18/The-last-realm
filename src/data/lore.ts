// src/data/lore.ts
// Lore entries for the Codex archive and realm history.

export interface LoreEntry {
  id: string;
  title: string;
  category: 'Ages' | 'Factions' | 'Magic' | 'Beasts';
  author: string;
  summary: string;
  content: string;
}

export const LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'lore_fall',
    title: 'The Cataclysm of the Sunken Citadel',
    category: 'Ages',
    author: 'Archivist Malachai',
    summary: 'How the royal capital vanished beneath the waves of basalt.',
    content:
      'In the final year of the Golden Age, high sorcerers of the Crown attempted to harness the core leyline beneath the citadel. The stone cracked, turning water into steam and ground into liquid glass. The throne sank into the abyss, leaving only blackened ruins above.',
  },
  {
    id: 'lore_runes',
    title: 'Origins of Runecarving',
    category: 'Magic',
    author: 'Lady Vespera of the Synod',
    summary: 'The language through which mortal will alters physical iron.',
    content:
      'Runes are not mere script; they are crystallizations of celestial geometry. When hammered into hot steel with the blood of a vanquished beast, the metal remembers the flame forever, refusing to dull against dragon scales.',
  },
  {
    id: 'lore_redwood',
    title: 'The Whispering Redwoods',
    category: 'Beasts',
    author: 'Ranger Rowan',
    summary: 'Sentience among the giant pines of the old continent.',
    content:
      'Do not sleep at the base of the weeping redwoods without salt at your feet. The roots hear the heartbeat of warm mortals, slowly wrapping around their legs while they dream of paradise.',
  },
  {
    id: 'lore_crown',
    title: 'The Bloodline of Aethelgard',
    category: 'Factions',
    author: 'Commander Gareth',
    summary: 'The line of kings that refused to submit to mortality.',
    content:
      'The crown of Aethelgard carries a curse: he who wears it shall not die by sickness or age, but by blade alone. Five centuries have passed, and rumors persist that the Undying King still watches from the sunken gate.',
  },
];
