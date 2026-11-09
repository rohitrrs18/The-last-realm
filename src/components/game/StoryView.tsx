// src/components/game/StoryView.tsx — Cinematic story panel with atmospheric art, typewriter text, glowing choices

import { useEffect, useState } from 'react';
import { useGame } from '../../state/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Compass, Swords, Gift, MessageSquare } from 'lucide-react';

const CLASS_ACCENT: Record<string, string> = {
  Warrior: '#c97d3a',
  Mage:    '#6e8fd4',
  Rogue:   '#9f6fba',
  Ranger:  '#6ba876',
};

const BIOME_GRADIENTS: Record<string, string> = {
  village:  'from-[#141008] to-[#0a0c08]',
  forest:   'from-[#081408] to-[#040a04]',
  ruins:    'from-[#141008] to-[#0a0804]',
  cave:     'from-[#080810] to-[#040408]',
  mountain: 'from-[#101014] to-[#080810]',
  dungeon:  'from-[#140808] to-[#0a0404]',
  castle:   'from-[#0c0c08] to-[#080806]',
  lake:     'from-[#080c14] to-[#040810]',
};

const BIOME_ART: Record<string, string> = {
  village:  '🏘️',
  forest:   '🌲',
  ruins:    '🏛️',
  cave:     '🕳️',
  mountain: '⛰️',
  dungeon:  '💀',
  castle:   '🏰',
  lake:     '🌊',
};

function ChoiceIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes('fight') || lower.includes('attack') || lower.includes('slay'))
    return <Swords size={12} className="text-crimson/80" />;
  if (lower.includes('explore') || lower.includes('travel') || lower.includes('venture'))
    return <Compass size={12} className="text-gold/80" />;
  if (lower.includes('talk') || lower.includes('speak') || lower.includes('greet'))
    return <MessageSquare size={12} className="text-blue-400/80" />;
  if (lower.includes('take') || lower.includes('loot') || lower.includes('claim'))
    return <Gift size={12} className="text-green-400/80" />;
  return <ChevronRight size={12} className="text-muted" />;
}

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

export function StoryView() {
  const event     = useGame(s => s.currentEvent);
  const world     = useGame(s => s.world);
  const character = useGame(s => s.character);
  const doChoice  = useGame(s => s.doChoice);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!event || !world) return null;

  const loc    = world.locations.find(l => l.id === world.currentLocationId);
  const accent = CLASS_ACCENT[character?.class ?? 'Warrior'] ?? '#b79a65';
  const gradient = BIOME_GRADIENTS[loc?.type ?? 'village'];
  const artEmoji = BIOME_ART[loc?.type ?? 'village'];

  const handleChoice = (id: string) => {
    setSelectedId(id);
    setTimeout(() => { doChoice(id); setSelectedId(null); }, 300);
  };

  return (
    <div className={`flex-1 overflow-y-auto relative bg-gradient-to-b ${gradient}`}>
      {/* Atmospheric overlay */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}08, transparent 60%)` }} />

      <div className="relative max-w-2xl mx-auto px-5 md:px-8 py-6">

        {/* Location header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={loc?.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="text-3xl">{artEmoji}</span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.4em] mb-0.5" style={{ color: accent + '80' }}>
                {loc?.region ?? 'Unknown Region'}
              </div>
              <h2 className="h-cinzel text-xl text-ink">{loc?.name ?? 'Somewhere'}</h2>
              {loc && (
                <div className="text-[10px] text-muted mt-0.5">
                  {loc.type} · {loc.dangerLevel} Danger
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative separator */}
        <div className="hair-gold mb-5" />

        {/* Event card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="rounded-sm overflow-hidden mb-5"
            style={{
              background: 'rgba(10,8,5,0.7)',
              border: `1px solid ${accent}20`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 4px 30px rgba(0,0,0,0.4), 0 0 40px ${accent}08`,
            }}
          >
            {/* Event header */}
            <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: `${accent}15` }}>
              <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: accent + '80' }}>
                Event
              </div>
              <h3 className="h-serif text-xl text-ink">{event.title}</h3>
            </div>

            {/* Narrative text with typewriter */}
            <NarrativeText text={event.narrative} eventId={event.id} />
          </motion.div>
        </AnimatePresence>

        {/* Choice buttons */}
        <AnimatePresence>
          <div className="space-y-2.5">
            {event.choices.map((choice, i) => (
              <motion.button
                key={choice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                onClick={() => handleChoice(choice.id)}
                className={`choice-btn w-full px-4 py-3.5 rounded-sm transition-all duration-300
                  ${selectedId === choice.id ? 'opacity-50 scale-98' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <ChoiceIcon label={choice.label} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-ink leading-snug">{choice.label}</div>
                    {choice.reward && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {choice.reward.xp && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm"
                            style={{ background: 'rgba(140,120,20,0.2)', color: '#c0a040' }}>
                            +{choice.reward.xp} XP
                          </span>
                        )}
                        {choice.reward.gold && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm"
                            style={{ background: 'rgba(140,100,20,0.2)', color: '#b07020' }}>
                            +{choice.reward.gold} Gold
                          </span>
                        )}
                        {choice.reward.item && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm"
                            style={{ background: 'rgba(60,80,160,0.2)', color: '#8080d0' }}>
                            Item
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function NarrativeText({ text, eventId }: { text: string; eventId: string }) {
  const { displayed, done } = useTypewriter(text, 16);
  return (
    <div className="px-5 py-4">
      <p className="text-sm text-ink2 leading-relaxed h-serif italic">
        {displayed}
        {!done && (
          <span className="inline-block w-0.5 h-4 ml-0.5 bg-gold/60 align-middle animate-pulse" />
        )}
      </p>
    </div>
  );
}
