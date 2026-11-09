// src/components/loot/LootDropModal.tsx
// Epic victory and post-combat loot drop modal with rewards celebration,
// animated gold/XP counters, item rarity cards, and fanfare sound.

import { motion } from 'framer-motion';
import { Trophy, Coins, Sparkles, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import type { Item } from '../../types/game';
import { formatRarityColor } from '../../utils/format';
import { sfx } from '../../audio/sfx';

interface Props {
  monsterName: string;
  xpGained: number;
  goldGained: number;
  itemsDropped: Item[];
  onClaim: () => void;
}

export function LootDropModal({ monsterName, xpGained, goldGained, itemsDropped, onClaim }: Props) {
  const handleClaim = () => {
    sfx.play('gold-pickup');
    onClaim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="bg-panel border-2 border-gold/40 rounded-sm max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col"
      >
        {/* Banner with radiant glow */}
        <div className="p-6 text-center border-b border-gold/20 bg-gradient-to-b from-[#25180c] to-[#120c06] relative overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
          <div className="w-14 h-14 mx-auto rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center text-gold mb-3 shadow-[0_0_20px_#d4af37]">
            <Trophy size={28} />
          </div>

          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold/80 mb-1">
            Victory Proclaimed
          </div>
          <h2 className="h-cinzel text-3xl font-bold text-ink">Spoils of Conquest</h2>
          <p className="text-xs text-ink2 italic mt-1">You triumphed against {monsterName}!</p>
        </div>

        {/* Rewards Section */}
        <div className="p-6 space-y-5 bg-black/40">
          {/* XP & Gold Gain Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-sm bg-black/60 border border-gold/20 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold">
                <Coins size={16} />
                <span>Gold Plundered</span>
              </div>
              <div className="h-serif text-2xl font-bold text-gold">+{goldGained}</div>
            </div>

            <div className="p-3.5 rounded-sm bg-black/60 border border-gold/20 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs text-purple-400 font-bold">
                <Sparkles size={16} />
                <span>Experience</span>
              </div>
              <div className="h-serif text-2xl font-bold text-purple-300">+{xpGained} XP</div>
            </div>
          </div>

          {/* Dropped Items */}
          {itemsDropped && itemsDropped.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Items Acquired</div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {itemsDropped.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-sm border bg-black/60 border-gold/20 flex items-center justify-between"
                  >
                    <div>
                      <div className={`text-sm font-bold ${formatRarityColor(item.rarity)}`}>{item.name}</div>
                      <div className="text-[10px] text-muted">
                        {item.rarity} · {item.category} · Lv.{item.level}
                      </div>
                    </div>
                    {item.stats?.damage && <span className="text-xs font-bold text-amber-400">+{item.stats.damage} Dmg</span>}
                    {item.stats?.defense && <span className="text-xs font-bold text-blue-400">+{item.stats.defense} Def</span>}
                    {item.effect?.heal && <span className="text-xs font-bold text-emerald-400">+{item.effect.heal} HP</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            className="w-full py-4 rounded-sm font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black shadow-lg transition-transform active:scale-[0.99]"
          >
            <CheckCircle2 size={16} />
            <span>Claim Spoils & Continue</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
