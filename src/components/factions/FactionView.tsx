// src/components/factions/FactionView.tsx
// Comprehensive Faction Diplomacy and Reputation interface.
// Shows faction standings, perks, crests, and inter-faction affinities.

import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { FACTIONS, FactionId, StandingTier } from '../../data/factions';
import { getStandingTier } from '../../engine/reputationSystem';
import { Crown, Flame, Building2, Skull, Compass, Swords, Shield, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const FACTION_ICONS: Record<string, React.ComponentType<any>> = {
  crown: Crown,
  flame: Flame,
  tower: Building2,
  skull: Skull,
  compass: Compass,
  sword: Swords,
};

const TIER_COLORS: Record<StandingTier, { text: string; bg: string; border: string }> = {
  Hostile:    { text: '#ff4444', bg: 'rgba(200,30,30,0.15)', border: 'rgba(200,30,30,0.4)' },
  Unfriendly: { text: '#ffaa44', bg: 'rgba(200,120,30,0.15)', border: 'rgba(200,120,30,0.4)' },
  Neutral:    { text: '#aaaaaa', bg: 'rgba(150,150,150,0.15)', border: 'rgba(150,150,150,0.3)' },
  Friendly:   { text: '#55cc77', bg: 'rgba(40,180,80,0.15)', border: 'rgba(40,180,80,0.4)' },
  Allied:     { text: '#44bbff', bg: 'rgba(40,120,220,0.2)', border: 'rgba(40,120,220,0.5)' },
};

const FACTION_PERKS: Record<FactionId, string[]> = {
  Crown: [
    'Access to Royal Blacksmith recipes',
    'Free safe passage through citadel tollgates',
    'Royal guards assist you in border ambushes',
  ],
  'Old Faith': [
    'Wild beasts in ancient groves will not attack on sight',
    'Herbal gathering yields double ingredients',
    'Unlocks sacred Grove restoration blessings',
  ],
  'Free Cities': [
    '15% discount on all merchant goods and travel fees',
    'Access to the High Bank exchange',
    'Unlocked trade routes between settlement hubs',
  ],
  'Hollow Cult': [
    'Forbidden dark sorcery grimoires available',
    'Shadow damage resistance increased by 20%',
    'Speak with entombed crypt spirits',
  ],
  Wanderers: [
    'Fast travel stamina cost reduced by 50%',
    'Full regional map revealed upon entering new zones',
    'Unlocks secret campsite resting spots',
  ],
  'Mercenary Guild': [
    'Hire elite mercenary companions for dungeon raids',
    'Receive high-tier monster bounty contracts',
    'Weapon durability degradation reduced by 30%',
  ],
  None: [],
};

export function FactionView() {
  const factionRep = useGame((s) => s.factionReputation);
  const [selectedFaction, setSelectedFaction] = useState<FactionId>('Crown');

  const factionList = (Object.keys(FACTIONS) as FactionId[]).filter((id) => !FACTIONS[id].inert);
  const currentFaction = FACTIONS[selectedFaction] || FACTIONS.Crown;
  const currentRep = factionRep[selectedFaction] || 0;
  const currentTier = getStandingTier(currentRep) as StandingTier;
  const tierStyle = TIER_COLORS[currentTier] || TIER_COLORS.Neutral;
  const Emblem = FACTION_ICONS[currentFaction.emblemHint] || Shield;

  // Normalize reputation between -100 and +100 for percentage bar
  const repPct = Math.max(0, Math.min(100, ((currentRep + 100) / 200) * 100));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <SectionTitle
          kicker="Diplomacy & Alliances"
          title="Factions of the Realm"
          subtitle="Your actions, allegiances, and completed quests shape your standing with the powers that rule the world."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          
          {/* LEFT: Factions List */}
          <div className="space-y-2.5">
            {factionList.map((id) => {
              const fac = FACTIONS[id];
              const rep = factionRep[id] || 0;
              const tier = getStandingTier(rep) as StandingTier;
              const tStyle = TIER_COLORS[tier];
              const isSelected = selectedFaction === id;
              const Icon = FACTION_ICONS[fac.emblemHint] || Shield;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedFaction(id)}
                  className={`w-full p-3.5 rounded-sm border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-gold bg-panel/90 shadow-md ring-1 ring-gold/40'
                      : 'border-gold/15 bg-black/40 hover:border-gold/35'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2 rounded-sm shrink-0"
                      style={{ background: `${fac.accentColor}25`, color: fac.accentColor }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="h-serif text-sm font-bold text-ink truncate">{fac.name}</div>
                      <div className="text-[10px] text-muted truncate">{fac.tagline}</div>
                    </div>
                  </div>

                  <span
                    className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm shrink-0 border"
                    style={{ color: tStyle.text, background: tStyle.bg, borderColor: tStyle.border }}
                  >
                    {tier}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Detailed Faction Dossier */}
          <div className="p-6 rounded-sm border bg-panel border-gold/25 shadow-panel space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gold/15 pb-5">
              <div className="flex items-center gap-4">
                <div
                  className="p-4 rounded-sm border"
                  style={{
                    background: `${currentFaction.accentColor}20`,
                    borderColor: `${currentFaction.accentColor}60`,
                    color: currentFaction.accentColor,
                  }}
                >
                  <Emblem size={32} />
                </div>
                <div>
                  <h2 className="h-cinzel text-3xl font-bold text-ink">{currentFaction.name}</h2>
                  <p className="text-xs text-goldSoft italic">{currentFaction.tagline}</p>
                </div>
              </div>

              {/* Standing Badge */}
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-muted font-bold mb-1">Current Standing</div>
                <span
                  className="text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-sm border inline-block"
                  style={{ color: tierStyle.text, background: tierStyle.bg, borderColor: tierStyle.border }}
                >
                  {currentTier} ({currentRep > 0 ? `+${currentRep}` : currentRep})
                </span>
              </div>
            </div>

            {/* Reputation Progress Bar */}
            <div className="space-y-1.5 p-4 rounded-sm bg-black/40 border border-gold/10">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted">Hostile (-100)</span>
                <span className="text-gold font-bold">Standing: {currentRep}</span>
                <span className="text-muted">Allied (+100)</span>
              </div>
              <div className="h-3 rounded-full bg-black/60 overflow-hidden border border-white/10 p-0.5">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, #ff4444 0%, #ffbb44 40%, #55cc77 75%, #44bbff 100%)`,
                  }}
                  animate={{ width: `${repPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Faction Dossier</div>
              <p className="text-sm text-ink2 leading-relaxed italic border-l-2 border-gold/30 pl-4">
                "{currentFaction.description}"
              </p>
            </div>

            {/* Faction Perks */}
            <div className="space-y-3 pt-2">
              <div className="text-[10px] uppercase tracking-widest font-bold text-gold flex items-center gap-1.5">
                <Award size={14} />
                <span>Faction Perks & Standing Rewards</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FACTION_PERKS[selectedFaction]?.map((perk, i) => (
                  <div key={i} className="p-3 rounded-sm bg-black/50 border border-gold/15 text-xs text-ink2 flex gap-2">
                    <Star size={14} className="text-gold shrink-0 mt-0.5" />
                    <span className="leading-snug">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cross Faction Relations */}
            {currentFaction.relations && currentFaction.relations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Diplomatic Relations</div>
                <div className="flex flex-wrap gap-2">
                  {currentFaction.relations.map((rel) => {
                    const isAllied = rel.affinity > 0;
                    return (
                      <span
                        key={rel.faction}
                        className={`text-xs px-2.5 py-1 rounded-sm border ${
                          isAllied
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {rel.faction}: {isAllied ? 'Friendly Ally' : 'Rival / Enemy'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
