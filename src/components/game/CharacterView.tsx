// src/components/game/CharacterView.tsx — Upgraded character view with 3D portrait, polished stats, equipment grid

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Droplets, Coins, Swords, Shield, Star, Zap, Package } from 'lucide-react';
import { useGame } from '../../state/gameStore';
import { CLASSES, APPEARANCES } from '../../data/classes';
import { formatRarityColor } from '../../utils/format';
import { formatNumber } from '../../utils/formatNumber';
import { computeDerivedStats } from '../../engine/levelingSystem';
import { computeBonuses } from '../../engine/skillTree';
import { Character3DViewer } from '../character/Character3DViewer';
import type { Stats } from '../../types/game';

const CLASS_ACCENT: Record<string, string> = {
  Warrior: '#c97d3a', Mage: '#6e8fd4', Rogue: '#9f6fba', Ranger: '#6ba876',
};

const RARITY_BADGE: Record<string, { bg: string; color: string }> = {
  Common:    { bg: 'rgba(100,100,100,0.2)', color: '#aaa' },
  Uncommon:  { bg: 'rgba(60,120,60,0.2)',   color: '#6c6' },
  Rare:      { bg: 'rgba(60,80,160,0.2)',   color: '#6af' },
  Epic:      { bg: 'rgba(100,60,160,0.2)',  color: '#c8f' },
  Legendary: { bg: 'rgba(160,100,20,0.2)',  color: '#fa0' },
  Mythic:    { bg: 'rgba(160,20,20,0.3)',   color: '#f44' },
};

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-sm p-3 flex flex-col gap-1"
      style={{ background: 'rgba(10,8,5,0.6)', border: '1px solid rgba(183,154,101,0.08)' }}
    >
      <div className="flex items-center gap-1.5 text-muted">
        <span style={{ color: color ?? '#b79a65' }}>{icon}</span>
        <span className="text-[9px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="h-serif text-xl" style={{ color: color ?? '#D2C3A0' }}>{value}</div>
    </motion.div>
  );
}

export function CharacterView() {
  const character = useGame((s) => s.character);
  if (!character) return null;

  const classDef    = CLASSES[character.class];
  const appearance  = APPEARANCES[character.appearance] ?? APPEARANCES[0];
  const skillRanks  = (character as any).skillRanks ?? {};
  const bonuses     = useMemo(() => computeBonuses(character.class, skillRanks), [character.class, skillRanks]);
  const derived     = useMemo(() => computeDerivedStats(character, bonuses), [character, bonuses]);
  const accent      = CLASS_ACCENT[character.class] ?? '#b79a65';
  const xpPct       = (character.xp / Math.max(1, character.xpNext)) * 100;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="relative px-5 py-4 border-b" style={{ borderColor: 'rgba(183,154,101,0.08)', background: 'rgba(8,7,5,0.6)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: accent + '80' }}>
          {character.class} · Level {character.level}
        </div>
        <h1 className="h-cinzel text-2xl text-ink">{character.name || 'The Nameless'}</h1>
        <p className="text-xs text-muted italic mt-0.5">{appearance.desc}</p>
      </div>

      <div className="p-5 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">

          {/* Left: 3D Portrait + Vitals */}
          <div className="space-y-4">
            <Character3DViewer className={character.class} size="md" showOrbit={true} />

            {/* Vitals */}
            <div className="rounded-sm p-4 space-y-3"
              style={{ background: 'rgba(10,8,5,0.8)', border: '1px solid rgba(183,154,101,0.1)' }}>
              <div className="text-[9px] uppercase tracking-widest text-muted mb-3">Vitals</div>

              {[
                { label: 'Health', value: character.hp, max: derived.maxHp, color: '#e04444', bg: '#7a1f1f', icon: <Heart size={10} /> },
                { label: 'Mana',   value: character.mana, max: derived.maxMana, color: '#6090d4', bg: '#1a2a5a', icon: <Droplets size={10} /> },
                { label: 'XP',     value: character.xp, max: character.xpNext, color: '#d4c060', bg: '#6a5010', icon: <Star size={10} /> },
              ].map(bar => {
                const pct = Math.max(0, Math.min(100, (bar.value / Math.max(1, bar.max)) * 100));
                return (
                  <div key={bar.label} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-muted">{bar.icon} {bar.label}</span>
                      <span style={{ color: bar.color }}>{bar.value}<span className="text-muted/60">/{bar.max}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${bar.bg}, ${bar.color})` }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
                <span className="flex items-center gap-1.5 text-[10px] text-muted"><Coins size={10} className="text-gold/60" /> Gold</span>
                <span className="text-sm h-serif text-gold">{formatNumber(character.gold)}</span>
              </div>
            </div>
          </div>

          {/* Right: Stats + Equipment */}
          <div className="space-y-4">
            {/* Attributes */}
            <div className="rounded-sm p-4" style={{ background: 'rgba(10,8,5,0.8)', border: '1px solid rgba(183,154,101,0.1)' }}>
              <div className="text-[9px] uppercase tracking-widest text-muted mb-3">Base Attributes</div>
              <div className="grid grid-cols-5 gap-2">
                {(['strength','agility','intellect','vitality','luck'] as Array<keyof Stats>).map(key => {
                  const val = character.baseStats[key] + (bonuses[key] || 0);
                  const bonus = bonuses[key] ?? 0;
                  return (
                    <div key={key} className="text-center rounded-sm p-2.5"
                      style={{ background: `${accent}0a`, border: `1px solid ${accent}18` }}>
                      <div className="text-[8px] uppercase tracking-widest text-muted mb-1">{key.slice(0,3)}</div>
                      <div className="h-serif text-lg" style={{ color: accent }}>{val}</div>
                      {bonus > 0 && <div className="text-[8px] text-green-400">+{bonus}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Damage" value={`+${derived.damageBonus}`} icon={<Swords size={11} />} color="#e06060" />
              <StatCard label="Defense" value={`+${derived.defenseBonus}`} icon={<Shield size={11} />} color="#6090d4" />
              <StatCard label="Crit Chance" value={`${Math.round(derived.critChance * 100)}%`} icon={<Zap size={11} />} color="#d4c060" />
              <StatCard label="Evasion" value={`${Math.round(derived.evasion * 100)}%`} icon={<Star size={11} />} color="#80d090" />
            </div>

            {/* Equipment */}
            <div className="rounded-sm p-4" style={{ background: 'rgba(10,8,5,0.8)', border: '1px solid rgba(183,154,101,0.1)' }}>
              <div className="text-[9px] uppercase tracking-widest text-muted mb-3">Equipment</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['weapon','armor','shield','ring','amulet'] as const).map(slot => {
                  const item   = character.equipment[slot];
                  const rarity = item ? (RARITY_BADGE[item.rarity] ?? RARITY_BADGE.Common) : null;
                  return (
                    <div key={slot}
                      className="rounded-sm p-2.5 transition-all duration-200"
                      style={{
                        background: item ? `${rarity?.bg}` : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${item ? (rarity?.color + '30') : 'rgba(255,255,255,0.04)'}`,
                      }}
                    >
                      <div className="text-[8px] uppercase tracking-widest text-muted/60 mb-1">{slot}</div>
                      {item ? (
                        <>
                          <div className="text-xs font-medium truncate" style={{ color: rarity?.color }}>{item.name}</div>
                          <div className="text-[9px] text-muted mt-0.5">{item.rarity} · Lv{item.level}</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-muted/30">
                          <Package size={10} />
                          <span className="text-[10px] italic">Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Abilities */}
            <div className="rounded-sm p-4" style={{ background: 'rgba(10,8,5,0.8)', border: '1px solid rgba(183,154,101,0.1)' }}>
              <div className="text-[9px] uppercase tracking-widest text-muted mb-3">Abilities</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {character.abilities.map(ability => (
                  <div key={ability.id} className="ability-card rounded-sm px-3 py-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap size={11} style={{ color: accent }} />
                      <span className="text-xs text-ink font-medium">{ability.name}</span>
                    </div>
                    <p className="text-[10px] text-muted/80 leading-relaxed mb-1.5">{ability.description}</p>
                    <div className="flex gap-2 text-[9px]">
                      <span style={{ color: '#6090d4' }}>{ability.cost} mana</span>
                      {ability.cooldown > 0 && <span className="text-muted">· {ability.cooldown}t CD</span>}
                      {ability.element && <span style={{ color: accent }}>· {ability.element}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}