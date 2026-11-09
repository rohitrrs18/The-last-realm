// src/components/npc/NpcList.tsx
// Rich, immersive NPC Roster with role emblems, relationship ratings,
// personality dossiers, and direct interaction buttons.

import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { MessageCircle, ShoppingBag, Hammer, User, Heart, Shield, Sparkles, BookOpen, Flame, Compass } from 'lucide-react';
import type { Npc, NpcRole } from '../../types/game';
import { sfx } from '../../audio/sfx';
import { motion } from 'framer-motion';

const ROLE_CONFIGS: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  Merchant:    { icon: ShoppingBag, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  Blacksmith:  { icon: Hammer,      color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  Innkeeper:   { icon: Flame,       color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  Herbalist:   { icon: Sparkles,    color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  Guard:       { icon: Shield,      color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  Scholar:     { icon: BookOpen,    color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  'Quest Giver': { icon: Sparkles,  color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  Villager:    { icon: User,        color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  Traveller:   { icon: Compass,     color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
};

interface Props {
  onTalk: (npc: Npc) => void;
  onTrade?: (npc: Npc) => void;
  onForge?: (npc: Npc) => void;
}

export function NpcList({ onTalk, onTrade, onForge }: Props) {
  const world = useGame((s) => s.world);
  const npcs  = useGame((s) => s.npcs);
  const [roleFilter, setRoleFilter] = useState<string>('All');

  if (!world) return null;

  const currentLoc = world.locations.find((l) => l.id === world.currentLocationId);
  const locationNpcs = npcs.filter((n) => n.locationId === world.currentLocationId);
  const filteredNpcs = locationNpcs.filter(
    (n) => roleFilter === 'All' || n.role === roleFilter
  );

  const handleTalk = (npc: Npc) => {
    sfx.play('ui-click');
    onTalk(npc);
  };

  const handleTrade = (npc: Npc) => {
    sfx.play('gold-pickup');
    if (onTrade) onTrade(npc);
  };

  const handleForge = (npc: Npc) => {
    sfx.play('sword-hit');
    if (onForge) onForge(npc);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <SectionTitle
          kicker={`Settlement Inhabitants · ${currentLoc?.name || 'Local Area'}`}
          title="People & Denizens"
          subtitle="Encounter merchants, master craftsmen, guardians, and local scholars residing in this territory."
          actions={
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Present In Town</div>
              <div className="h-serif text-xl font-bold text-gold">{locationNpcs.length} Souls</div>
            </div>
          }
        />

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', 'Merchant', 'Blacksmith', 'Herbalist', 'Guard', 'Scholar'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all border ${
                roleFilter === r
                  ? 'border-gold bg-gold/20 text-gold shadow-sm'
                  : 'border-gold/15 bg-black/40 text-muted hover:border-gold/40 hover:text-ink'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* NPC Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNpcs.map((npc) => {
            const roleCfg = ROLE_CONFIGS[npc.role] || ROLE_CONFIGS.Villager;
            const RoleIcon = roleCfg.icon;

            return (
              <motion.div
                key={npc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-sm border bg-panel border-gold/20 shadow-panel flex flex-col justify-between space-y-4 transition-all hover:border-gold/50"
              >
                <div className="flex gap-4">
                  {/* Avatar Frame with Role Emblem */}
                  <div
                    className="w-16 h-18 rounded-sm border flex flex-col items-center justify-center shrink-0 shadow-md"
                    style={{ background: roleCfg.bg, borderColor: `${roleCfg.color}50` }}
                  >
                    <RoleIcon size={26} style={{ color: roleCfg.color }} />
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: roleCfg.color }}>
                      {npc.role.slice(0, 5)}
                    </span>
                  </div>

                  {/* Character Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="h-serif text-lg font-bold text-ink truncate">{npc.name}</h3>
                      {npc.relationship > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded-sm border border-rose-500/30">
                          <Heart size={10} className="fill-current" /> +{npc.relationship}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold" style={{ color: roleCfg.color }}>
                        {npc.role}
                      </span>
                      <span className="text-muted text-xs">·</span>
                      <span className="text-[11px] text-muted italic">"{npc.personality}"</span>
                    </div>

                    <p className="text-xs text-ink2 italic mt-2 line-clamp-2 leading-relaxed">
                      "{npc.greeting}"
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-gold/10 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => handleTalk(npc)}
                    className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <MessageCircle size={13} />
                    <span>Converse</span>
                  </button>

                  {(npc.role === 'Merchant' || npc.role === 'Innkeeper' || npc.role === 'Herbalist') && onTrade && (
                    <button
                      onClick={() => handleTrade(npc)}
                      className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all"
                    >
                      <ShoppingBag size={13} />
                      <span>Browse Wares ({npc.shopInventory?.length || 0})</span>
                    </button>
                  )}

                  {npc.role === 'Blacksmith' && onForge && (
                    <button
                      onClick={() => handleForge(npc)}
                      className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-orange-950/40 hover:bg-orange-900/50 text-orange-300 border border-orange-500/40 flex items-center gap-1.5 transition-all"
                    >
                      <Hammer size={13} />
                      <span>Enter Forge</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredNpcs.length === 0 && (
          <div className="text-center py-16 text-muted italic bg-black/20 rounded-sm border border-white/5">
            The streets and corridors are silent in this part of town.
          </div>
        )}

      </div>
    </div>
  );
}
