import type { Rarity } from '../types/game';

export function formatRarityColor(r: Rarity): string {
  switch (r) {
    case 'Common': return 'text-ink2';
    case 'Uncommon': return 'text-forest';
    case 'Rare': return 'text-[#6c8cc2]';
    case 'Epic': return 'text-[#a97ac4]';
    case 'Legendary': return 'text-gold';
    case 'Mythic': return 'text-crimson';
  }
}