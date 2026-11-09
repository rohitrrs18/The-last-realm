// src/components/skills/SkillTreeView.tsx
// Interactive visual skill tree with tier rows, passives, rank pips,
// unspent points indicators, and unlock feedback.

import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { Lock, Check, Plus, Zap, Shield, Heart, Sparkles, Award } from 'lucide-react';
import { getSkillTreeRows, SkillNode } from '../../data/skillTrees';
import { computeBonuses, rankOf, canUnlockNode, skillPointsAvailable } from '../../engine/skillTree';
import { toast } from '../ui/Toast';
import { sfx } from '../../audio/sfx';
import { motion } from 'framer-motion';

export function SkillTreeView() {
  const character = useGame((s) => s.character);
  const spendPoint = useGame((s) => s.spendSkillPoint);

  if (!character) return null;

  const ranks = character.skillRanks ?? {};
  const points = skillPointsAvailable(character.level, ranks);
  const bonuses = computeBonuses(character.class, ranks);
  const rows = getSkillTreeRows(character.class);

  const handleSpend = (node: SkillNode) => {
    const success = spendPoint(node.id);
    if (success) {
      sfx.play('achievement');
      toast.success(`Unlocked ${node.name} (Rank ${(ranks[node.id] || 0) + 1})`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <SectionTitle
          kicker={`${character.class} Progression Tree`}
          title="Skill Tree & Masteries"
          subtitle={
            points > 0
              ? `You have ${points} unspent skill point${points === 1 ? '' : 's'}. Choose your talents wisely!`
              : 'Level up in combat and exploration to earn additional skill points.'
          }
          actions={
            <div className="flex items-center gap-3 bg-black/50 px-5 py-2.5 rounded-sm border border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Sparkles size={18} className="text-gold animate-pulse" />
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Unspent Points</div>
                <div className="h-serif text-2xl font-bold text-goldSoft leading-none">{points}</div>
              </div>
            </div>
          }
        />

        {/* Active Passives Overview Bar */}
        <div className="border border-gold/20 rounded-sm bg-panel/80 p-4 shadow-panel">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-gold" />
            <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
              Active Talent Bonuses
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {bonuses.damageBonus > 0 && (
              <span className="px-2.5 py-1 rounded-sm bg-orange-950/40 border border-orange-500/40 text-orange-300 font-semibold">
                +{bonuses.damageBonus}% Attack Power
              </span>
            )}
            {bonuses.defenseBonus > 0 && (
              <span className="px-2.5 py-1 rounded-sm bg-blue-950/40 border border-blue-500/40 text-blue-300 font-semibold">
                +{bonuses.defenseBonus}% Armor Defense
              </span>
            )}
            {bonuses.critBonus > 0 && (
              <span className="px-2.5 py-1 rounded-sm bg-amber-950/40 border border-amber-500/40 text-amber-300 font-semibold">
                +{bonuses.critBonus}% Critical Rate
              </span>
            )}
            {bonuses.maxHp > 0 && (
              <span className="px-2.5 py-1 rounded-sm bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold">
                +{bonuses.maxHp} Max Health
              </span>
            )}
            {bonuses.maxMana > 0 && (
              <span className="px-2.5 py-1 rounded-sm bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 font-semibold">
                +{bonuses.maxMana} Max Mana
              </span>
            )}
            {Object.values(bonuses).every((v) => v === 0) && (
              <span className="text-muted italic text-xs">No talent points allocated yet. Allocate points below.</span>
            )}
          </div>
        </div>

        {/* Tree Rows (Tier 1, Tier 2, Tier 3) */}
        <div className="space-y-6">
          {rows.map((row, tierIndex) => (
            <div key={tierIndex} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gold/15" />
                <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">
                  Tier {tierIndex + 1} Talents {tierIndex > 0 && `(Requires Level ${(tierIndex * 2) + 1})`}
                </span>
                <div className="h-px flex-1 bg-gold/15" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {row.map((node) => {
                  const rank = rankOf(ranks, node.id);
                  const isMaxed = rank >= node.maxRank;
                  const canUnlock = canUnlockNode(character.class, node.id, ranks, character.level, points).ok;

                  return (
                    <motion.div
                      key={node.id}
                      whileHover={{ scale: canUnlock || isMaxed ? 1.02 : 1 }}
                      className={`border rounded-sm p-4 flex flex-col justify-between transition-all ${
                        isMaxed
                          ? 'border-gold bg-gold/15 shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-gold/40'
                          : rank > 0
                          ? 'border-gold/50 bg-black/40 ring-1 ring-gold/20'
                          : canUnlock
                          ? 'border-gold/30 bg-black/50 hover:border-gold'
                          : 'border-white/10 bg-black/25 opacity-60'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm bg-black/40 text-muted border border-white/5">
                            {node.kind}
                          </span>
                          {isMaxed ? (
                            <span className="flex items-center gap-1 text-xs text-gold font-bold">
                              <Check size={14} /> Mastered
                            </span>
                          ) : !canUnlock && rank === 0 ? (
                            <span className="flex items-center gap-1 text-[10px] text-muted">
                              <Lock size={12} /> Locked
                            </span>
                          ) : null}
                        </div>

                        <div className="h-serif text-lg font-bold text-ink">{node.name}</div>
                        <p className="text-xs text-ink2 italic leading-relaxed line-clamp-3">{node.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gold/10 space-y-2.5">
                        {/* Rank Bars */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted font-semibold">
                            <span>Rank</span>
                            <span className={rank > 0 ? 'text-gold' : 'text-muted'}>
                              {rank} / {node.maxRank}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            {Array.from({ length: node.maxRank }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 flex-1 rounded-full ${
                                  i < rank ? 'bg-gold shadow-[0_0_8px_#d4af37]' : 'bg-black/60 border border-white/10'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Spend Button */}
                        {!isMaxed && (
                          <button
                            disabled={!canUnlock}
                            onClick={() => handleSpend(node)}
                            className="w-full py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 shadow-sm"
                          >
                            <Plus size={13} />
                            <span>Unlock ({node.cost} pt)</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
