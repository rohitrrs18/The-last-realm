// src/components/codex/CodexView.tsx
import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from '../ui/EmptyState';
import { formatRarityColor } from '../../utils/format';
import { LORE_ENTRIES } from '../../data/lore';
import { Skull, Swords, MapPin, BookOpen, Sparkles } from 'lucide-react';

const DEFAULT_BESTIARY = [
  {
    id: 'b_dire_wolf',
    name: 'Shadowfang Wolf',
    level: 1,
    type: 'Beast',
    weakness: 'Fire',
    description: 'Predatory hunters that stalk the dark edges of the woods. Their fangs carry frost chills.',
  },
  {
    id: 'b_crypt_ghoul',
    name: 'Crypt Crawler',
    level: 2,
    type: 'Undead',
    weakness: 'Holy',
    description: 'Shambling remnants of entombed soldiers who hunger for living warmth.',
  },
  {
    id: 'b_hellhound',
    name: 'Brimstone Hellhound',
    level: 3,
    type: 'Demon',
    weakness: 'Ice',
    description: 'Infernal beasts wreathed in smoldering coals. They spit jets of hellfire at prey.',
  },
];

export function CodexView() {
  const codex = useGame((s) => s.codex);
  const world = useGame((s) => s.world);
  const [tab, setTab] = useState<'monsters' | 'items' | 'locations' | 'lore'>('monsters');

  const recordedMonsters = Object.values(codex.monsters || {});
  const allMonsters = [...recordedMonsters, ...DEFAULT_BESTIARY.filter((d) => !recordedMonsters.some((m) => m.name === d.name))];
  const items = Object.values(codex.items || {});
  const locations = world?.locations || Object.values(codex.locations || {});

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-5xl mx-auto space-y-6">
        <SectionTitle
          kicker="Compendium of the Known World"
          title="The Grand Codex"
          subtitle="Everything you have encountered, slain, forged, or uncovered in ancient scrolls."
        />

        <Tabs
          items={[
            { id: 'monsters', label: 'Bestiary', count: allMonsters.length },
            { id: 'locations', label: 'Atlas & Cartography', count: locations.length },
            { id: 'lore', label: 'Ancient Lore', count: LORE_ENTRIES.length },
            { id: 'items', label: 'Arsenal Records', count: items.length },
          ]}
          value={tab}
          onChange={(t: string) => setTab(t as any)}
        />

        {/* Tab 1: Bestiary */}
        {tab === 'monsters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allMonsters.map((m: any) => (
              <div key={m.id} className="border border-gold/20 rounded-sm bg-panel p-4 shadow-panel space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="h-serif text-lg font-bold text-ink">{m.name}</h3>
                    <div className="text-[10px] uppercase tracking-wider text-gold font-bold">
                      {m.type} · Level {m.level}
                    </div>
                  </div>
                  {m.weakness && (
                    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-red-950/40 text-red-300 border border-red-500/30">
                      Weakness: {m.weakness}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink2 italic leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Locations */}
        {tab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((l: any) => (
              <div key={l.id} className="border border-gold/20 rounded-sm bg-panel p-4 shadow-panel space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="h-serif text-lg font-bold text-ink">{l.name}</h3>
                    <div className="text-[10px] text-muted">{l.region} · {l.type}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-sm bg-gold/15 text-gold border border-gold/30">
                    {l.dangerLevel} Threat
                  </span>
                </div>
                <p className="text-xs text-ink2 italic leading-relaxed">{l.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Lore Archive */}
        {tab === 'lore' && (
          <div className="space-y-4">
            {LORE_ENTRIES.map((l) => (
              <div key={l.id} className="border border-gold/20 rounded-sm bg-panel p-5 shadow-panel space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gold">{l.category}</span>
                    <h3 className="h-serif text-xl font-bold text-ink">{l.title}</h3>
                  </div>
                  <span className="text-xs text-muted italic">By {l.author}</span>
                </div>
                <p className="text-xs text-ink2 leading-relaxed italic border-l-2 border-gold/30 pl-4 py-1">
                  "{l.content}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Arsenal */}
        {tab === 'items' && (
          <div className="space-y-3">
            {items.map((i: any) => (
              <div key={i.id} className="border border-gold/15 rounded-sm bg-panel p-3.5 flex justify-between items-center">
                <div>
                  <div className={`h-serif text-base font-bold ${formatRarityColor(i.rarity)}`}>{i.name}</div>
                  <div className="text-[11px] text-muted">{i.rarity} · {i.category} · Lv.{i.level}</div>
                </div>
                {i.stats?.damage && <span className="text-xs text-amber-400 font-bold">+{i.stats.damage} Atk</span>}
                {i.stats?.defense && <span className="text-xs text-blue-400 font-bold">+{i.stats.defense} Def</span>}
              </div>
            ))}
            {items.length === 0 && (
              <EmptyState title="No items recorded yet" description="Forge and loot ancient items to catalog them here." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
