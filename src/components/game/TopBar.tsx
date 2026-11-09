// src/components/game/TopBar.tsx — Premium top bar with class accent, location display, save indicator

import { useGame } from '../../state/gameStore';
import { MapPin, Menu, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveGame } from '../../persistence/saveManager';
import { useState } from 'react';

const CLASS_ACCENT: Record<string, string> = {
  Warrior: '#c97d3a',
  Mage:    '#6e8fd4',
  Rogue:   '#9f6fba',
  Ranger:  '#6ba876',
};

const BIOME_ICONS: Record<string, string> = {
  village:  '🏘',
  forest:   '🌲',
  ruins:    '🏛',
  cave:     '🕳',
  mountain: '⛰',
  dungeon:  '💀',
  castle:   '🏰',
  lake:     '💧',
};

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const character = useGame(s => s.character);
  const world     = useGame(s => s.world);
  const combat    = useGame(s => s.combat);
  const [saving, setSaving] = useState(false);

  const loc    = world?.locations.find(l => l.id === world.currentLocationId);
  const accent = CLASS_ACCENT[character?.class ?? 'Warrior'] ?? '#b79a65';

  const handleSave = async () => {
    if (!character) return;
    setSaving(true);
    try {
      const state = useGame.getState();
      saveGame(undefined, state);
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  return (
    <div className="relative flex items-center justify-between px-4 py-2.5 border-b"
      style={{ background: 'rgba(8,7,5,0.9)', borderColor: 'rgba(183,154,101,0.08)', backdropFilter: 'blur(10px)' }}>
      
      {/* Class accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}60, ${accent}80, ${accent}60, transparent)` }} />

      {/* Left: Title / location */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-[11px] h-cinzel tracking-widest text-gold/60 hidden sm:block whitespace-nowrap">
          The Last Realm
        </div>
        
        {loc && (
          <>
            <div className="w-px h-3.5 bg-gold/15" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm">{BIOME_ICONS[loc.type] ?? '📍'}</span>
              <div className="min-w-0">
                <div className="text-xs text-ink truncate font-medium">{loc.name}</div>
                <div className="text-[9px] text-muted truncate">{loc.region} · {loc.dangerLevel}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center: combat indicator */}
      {combat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest"
          style={{ background: 'rgba(135,30,30,0.3)', border: '1px solid rgba(200,60,60,0.3)', color: '#ff8080' }}
        >
          <Shield size={10} />
          <span className="animate-pulse-soft">In Combat</span>
        </motion.div>
      )}

      {/* Right: Save + Menu */}
      <div className="flex items-center gap-2">
        {character && (
          <button
            onClick={handleSave}
            className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all duration-200"
            style={{
              background: saving ? `${accent}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${saving ? accent + '50' : 'rgba(183,154,101,0.1)'}`,
              color: saving ? accent : 'rgba(183,154,101,0.5)',
            }}
          >
            {saving ? '✓ Saved' : 'Save'}
          </button>
        )}
        <button
          onClick={onMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          style={{ border: '1px solid rgba(183,154,101,0.1)' }}
        >
          <Menu size={12} /> Menu
        </button>
      </div>
    </div>
  );
}
