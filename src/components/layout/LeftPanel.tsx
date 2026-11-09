// src/components/layout/LeftPanel.tsx — Premium sidebar with animated HP/Mana bars, biome icon, character level

import { useGame } from '../../state/gameStore';
import { motion } from 'framer-motion';
import { Heart, Droplets, Coins, MapPin, ChevronRight } from 'lucide-react';

const CLASS_ACCENT: Record<string, string> = {
  Warrior: '#c97d3a',
  Mage:    '#6e8fd4',
  Rogue:   '#9f6fba',
  Ranger:  '#6ba876',
};

const CLASS_EMOJI: Record<string, string> = {
  Warrior: '⚔️',
  Mage:    '🔮',
  Rogue:   '🗡️',
  Ranger:  '🏹',
};

const BIOME_ICONS: Record<string, string> = {
  village: '🏘', forest: '🌲', ruins: '🏛', cave: '🕳',
  mountain: '⛰', dungeon: '💀', castle: '🏰', lake: '💧',
};

function AnimatedBar({
  label, icon, value, max, color, bgColor,
}: {
  label: string; icon: React.ReactNode; value: number; max: number;
  color: string; bgColor: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const low = pct < 25;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1 text-muted">{icon} {label}</span>
        <span className="font-medium tabular-nums" style={{ color }}>
          {value}<span className="text-muted/60">/{max}</span>
        </span>
      </div>
      <div className="bar-track">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${bgColor}, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {low && (
        <div className="text-[9px] animate-pulse-soft" style={{ color }}>
          ⚠ Low {label}
        </div>
      )}
    </div>
  );
}

export function LeftPanel() {
  const char  = useGame(s => s.character);
  const world = useGame(s => s.world);
  if (!char || !world) return null;

  const loc    = world.locations.find(l => l.id === world.currentLocationId);
  const accent = CLASS_ACCENT[char.class] ?? '#b79a65';
  const hpPct  = char.hp / Math.max(1, char.maxHp);
  const xpPct  = char.xp / Math.max(1, char.xpNext);

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r shrink-0"
      style={{ background: 'rgba(8,7,5,0.92)', borderColor: 'rgba(183,154,101,0.08)', backdropFilter: 'blur(12px)' }}>
      
      {/* Character header */}
      <div className="relative p-5 border-b" style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div className="flex items-start gap-3">
          {/* Class emblem */}
          <div className="w-12 h-12 rounded-sm flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
            {CLASS_EMOJI[char.class] ?? '⚔️'}
          </div>
          <div className="min-w-0">
            <div className="h-serif text-lg text-ink leading-tight truncate">{char.name}</div>
            <div className="text-[11px] mt-0.5" style={{ color: accent }}>
              {char.class}
            </div>
            <div className="text-[10px] text-muted">Level {char.level}</div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[9px] text-muted">
            <span>Experience</span>
            <span>{char.xp} / {char.xpNext}</span>
          </div>
          <div className="h-1 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, #6a5010, #c0a040, #d4c060)` }}
              animate={{ width: `${xpPct * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="p-4 space-y-3 border-b" style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
        <AnimatedBar
          label="Health"
          icon={<Heart size={9} />}
          value={char.hp}
          max={char.maxHp}
          color="#e04444"
          bgColor="#7a1f1f"
        />
        <AnimatedBar
          label="Mana"
          icon={<Droplets size={9} />}
          value={char.mana}
          max={char.maxMana}
          color="#6090d4"
          bgColor="#1a2a5a"
        />
      </div>

      {/* Gold */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <Coins size={11} className="text-gold/70" /> Gold
          </span>
          <span className="text-sm h-serif text-gold">{char.gold.toLocaleString()}</span>
        </div>
      </div>

      {/* Location */}
      {loc && (
        <div className="p-4 border-b" style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
          <div className="text-[9px] uppercase tracking-widest text-muted mb-2">Current Location</div>
          <div className="flex items-start gap-2">
            <span className="text-lg">{BIOME_ICONS[loc.type] ?? '📍'}</span>
            <div>
              <div className="text-sm text-ink font-medium">{loc.name}</div>
              <div className="text-[10px] text-muted">{loc.region}</div>
              <div className="text-[9px] mt-0.5 px-1.5 py-0.5 rounded-sm inline-block"
                style={{ background: 'rgba(183,154,101,0.08)', color: 'rgba(183,154,101,0.6)' }}>
                {loc.dangerLevel} Danger
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status effects */}
      {char.statusEffects.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
          <div className="text-[9px] uppercase tracking-widest text-muted mb-2">Status Effects</div>
          <div className="flex flex-wrap gap-1.5">
            {char.statusEffects.map(e => (
              <span key={e.id} className="text-[10px] px-2 py-0.5 rounded-sm"
                style={{ background: 'rgba(135,60,60,0.3)', color: '#ff9090', border: '1px solid rgba(200,60,60,0.2)' }}>
                {e.name} ({e.turns})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer + bottom decoration */}
      <div className="flex-1" />
      <div className="p-4 border-t" style={{ borderColor: 'rgba(183,154,101,0.06)' }}>
        <div className="text-[9px] text-muted/40 text-center italic">
          "The realm endures."
        </div>
      </div>
    </aside>
  );
}
