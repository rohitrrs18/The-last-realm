// src/components/layout/BottomNav.tsx — Glowing tabs with animated active state

import { useGame } from '../../state/gameStore';
import { User, Backpack, Sparkles, BookOpen, Map, Archive, Users, Hammer, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActiveView } from '../../types/game';
import { sfx } from '../../audio/sfx';

const CLASS_ACCENT: Record<string, string> = {
  Warrior: '#c97d3a',
  Mage:    '#6e8fd4',
  Rogue:   '#9f6fba',
  Ranger:  '#6ba876',
};

const NAV_ITEMS = [
  { id: 'story',     label: 'Story',     Icon: BookOpen   },
  { id: 'character', label: 'Hero',      Icon: User       },
  { id: 'inventory', label: 'Bag',       Icon: Backpack   },
  { id: 'crafting',  label: 'Craft',     Icon: Hammer     },
  { id: 'skills',    label: 'Skills',    Icon: Sparkles   },
  { id: 'journal',   label: 'Journal',   Icon: ScrollText },
  { id: 'npcs',      label: 'People',    Icon: Users      },
  { id: 'map',       label: 'Map',       Icon: Map        },
  { id: 'codex',     label: 'Codex',     Icon: Archive    },
] as const;

export function BottomNav() {
  const view      = useGame((s) => s.activeView);
  const setView   = useGame((s) => s.setActiveView);
  const combat    = useGame((s) => s.combat);
  const character = useGame((s) => s.character);
  const accent    = CLASS_ACCENT[character?.class ?? 'Warrior'] ?? '#b79a65';

  const handleNav = (id: ActiveView) => {
    sfx.play('ui-click');
    setView(id);
  };

  return (
    <nav
      className="relative border-t flex justify-around overflow-x-auto z-30"
      style={{
        background: 'rgba(6,5,3,0.96)',
        borderColor: 'rgba(183,154,101,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}50, transparent)` }}
      />

      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive   = view === id;
        const isDisabled = !!combat && id !== 'inventory';

        return (
          <button
            key={id}
            onClick={() => !isDisabled && handleNav(id as ActiveView)}
            disabled={isDisabled}
            className={`relative flex flex-col items-center px-3 py-2.5 min-w-[50px] transition-all duration-200 ${
              isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'
            }`}
          >
            {/* Active background */}
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0"
                style={{ background: `${accent}15` }}
                transition={{ type: 'spring', duration: 0.4 }}
              />
            )}

            {/* Top indicator bar */}
            {isActive && (
              <motion.div
                layoutId="nav-bar"
                className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                transition={{ type: 'spring', duration: 0.4 }}
              />
            )}

            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <div
                className="transition-all duration-200"
                style={{ color: isActive ? accent : 'rgba(180,170,150,0.6)' }}
              >
                <Icon size={17} />
              </div>
              <span
                className="text-[9px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap"
                style={{ color: isActive ? accent : 'rgba(180,170,150,0.5)' }}
              >
                {label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
