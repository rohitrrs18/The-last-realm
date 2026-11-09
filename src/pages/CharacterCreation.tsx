// src/pages/CharacterCreation.tsx
// Upgraded Character Creation with 3D models visible on EVERY class selection card,
// live hero preview, sound effects, stats breakdown, and random name generator.

import { useState } from 'react';
import { useGame } from '../state/gameStore';
import { CLASSES, APPEARANCES } from '../data/classes';
import type { ClassName } from '../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Character3DViewer } from '../components/character/Character3DViewer';
import { Sword, Wand2, Eye, Crosshair, RefreshCw, ArrowLeft, Sparkles, Heart, Droplets, Dices } from 'lucide-react';
import { sfx } from '../audio/sfx';

const CLASS_ICONS: Record<ClassName, React.ComponentType<any>> = {
  Warrior: Sword,
  Mage:    Wand2,
  Rogue:   Eye,
  Ranger:  Crosshair,
};

const CLASS_ACCENT: Record<ClassName, string> = {
  Warrior: '#c97d3a',
  Mage:    '#6e8fd4',
  Rogue:   '#9f6fba',
  Ranger:  '#6ba876',
};

const FANTASY_NAMES: Record<ClassName, string[]> = {
  Warrior: ['Theron the Brave', 'Gareth Ironbreaker', 'Valeria Dawnshield', 'Kaelen Sunforged', 'Brant Stormguard'],
  Mage:    ['Lyra Starweaver', 'Archon Vael', 'Ignis Pyreborne', 'Morrigan Veilstrider', 'Eldrin Frostcaller'],
  Rogue:   ['Malakor Shade', 'Vesper Nightblade', 'Corvin Whisper', 'Sylas the Ghost', 'Zephyr Dusk'],
  Ranger:  ['Rowan Windstrider', 'Elira Verdant', 'Fintan Oakenshield', 'Kaelen Swiftbow', 'Astrid Pathseeker'],
};

export function CharacterCreation() {
  const setScreen       = useGame((s) => s.setScreen);
  const createCharacter = useGame((s) => s.createCharacter);
  const [name, setName] = useState('');
  const [cls, setCls]   = useState<ClassName>('Warrior');
  const [app, setApp]   = useState(0);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));

  const c = CLASSES[cls];
  const accent = CLASS_ACCENT[cls];
  const ClassIcon = CLASS_ICONS[cls];

  const handleSelectClass = (k: ClassName) => {
    setCls(k);
    if (k === 'Warrior') sfx.play('sword-hit');
    else if (k === 'Mage') sfx.play('magic-cast');
    else if (k === 'Rogue') sfx.play('ui-click');
    else sfx.play('arrow-shot');
  };

  const handleRandomName = () => {
    const list = FANTASY_NAMES[cls];
    const picked = list[Math.floor(Math.random() * list.length)];
    setName(picked);
    sfx.play('ui-click');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    sfx.play('quest-complete');
    createCharacter({ name: name.trim(), className: cls, appearance: app, seed });
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-gradient-to-b from-[#140c06] via-[#0d0804] to-[#050302] transition-colors duration-700">
      {/* Ambient background particles */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 70% 30%, ${accent}15, transparent 65%)`,
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gold/15 bg-black/40 backdrop-blur-md">
        <button
          onClick={() => {
            sfx.play('ui-click');
            setScreen('menu');
          }}
          className="flex items-center gap-2 text-muted hover:text-ink transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>
        <div className="text-xs uppercase tracking-[0.4em] font-bold h-cinzel" style={{ color: accent }}>
          The Last Realm · Character Forge
        </div>
        <div className="w-16" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8">
          
          {/* LEFT: Class Selection with LIVE 3D Characters on cards */}
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: accent }}>
                Step 1 · Choose Your Champion
              </div>
              <h1 className="h-cinzel text-3xl md:text-4xl text-ink font-bold">Select Your Hero Class</h1>
            </div>

            {/* Class Cards Grid with REAL 3D Character models directly on the cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(CLASSES) as ClassName[]).map((k) => {
                const isSelected = cls === k;
                const a = CLASS_ACCENT[k];
                const Icon = CLASS_ICONS[k];

                return (
                  <motion.div
                    key={k}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectClass(k)}
                    className={`relative rounded-sm overflow-hidden cursor-pointer transition-all duration-300 border flex flex-col ${
                      isSelected ? 'ring-2' : 'hover:border-gold/40'
                    }`}
                    style={{
                      background: isSelected ? 'rgba(25,18,12,0.9)' : 'rgba(12,9,6,0.7)',
                      borderColor: isSelected ? a : 'rgba(183,154,101,0.15)',
                      boxShadow: isSelected ? `0 0 25px ${a}35, inset 0 0 15px ${a}15` : 'none',
                    }}
                  >
                    {/* Live Miniature 3D Character Preview on the selection card */}
                    <div className="h-44 w-full relative overflow-hidden bg-black/60 pointer-events-none">
                      <Character3DViewer className={k} mini={true} showOrbit={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      
                      {/* Class icon badge */}
                      <div
                        className="absolute top-2 left-2 p-1.5 rounded-sm backdrop-blur-sm"
                        style={{ background: `${a}35`, color: a, border: `1px solid ${a}60` }}
                      >
                        <Icon size={14} />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3">
                      <div className="h-cinzel text-base font-bold text-ink">{CLASSES[k].label}</div>
                      <div className="text-[10px] text-muted italic mt-0.5 line-clamp-2">{CLASSES[k].blurb}</div>
                      
                      {/* Stat chips */}
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {Object.entries(CLASSES[k].stats).slice(0, 3).map(([stat, val]) => (
                          <span
                            key={stat}
                            className="text-[9px] px-1.5 py-0.5 rounded-sm font-semibold"
                            style={{ background: `${a}20`, color: a }}
                          >
                            {stat.slice(0, 3).toUpperCase()} {val as number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Name Input with Randomize Button */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-bold mb-2" style={{ color: accent }}>
                Step 2 · Name Your Legend
              </label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter champion name..."
                  className="flex-1 bg-black/50 border rounded-sm px-4 py-3 h-serif text-xl text-ink outline-none transition-all placeholder:text-muted/40"
                  style={{
                    borderColor: name ? accent : 'rgba(183,154,101,0.2)',
                    boxShadow: name ? `0 0 15px ${accent}20` : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleRandomName}
                  className="px-4 py-3 rounded-sm border flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors bg-black/40 hover:bg-black/60"
                  style={{ borderColor: 'rgba(183,154,101,0.25)' }}
                >
                  <Dices size={16} className="text-gold" />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {/* Appearance selection */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-bold mb-2" style={{ color: accent }}>
                Step 3 · Appearance & Heritage
              </label>
              <div className="grid grid-cols-2 gap-2">
                {APPEARANCES.map((ap) => (
                  <button
                    key={ap.id}
                    onClick={() => {
                      setApp(ap.id);
                      sfx.play('ui-click');
                    }}
                    className="text-left rounded-sm p-3 transition-all border"
                    style={{
                      background: app === ap.id ? `${accent}18` : 'rgba(10,8,5,0.6)',
                      borderColor: app === ap.id ? accent : 'rgba(183,154,101,0.12)',
                    }}
                  >
                    <div className="text-sm font-semibold h-serif text-ink">{ap.label}</div>
                    <div className="text-[10px] text-muted italic mt-0.5">{ap.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Base Attributes Summary */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] font-bold mb-2" style={{ color: accent }}>
                Class Base Attributes
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(c.stats).map(([k, v]) => (
                  <div key={k} className="rounded-sm bg-black/40 p-2 text-center border border-white/5">
                    <div className="text-[9px] uppercase tracking-wider text-muted font-bold">{k.slice(0, 3)}</div>
                    <div className="h-serif text-xl font-bold mt-1" style={{ color: accent }}>
                      {v as number}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Begin Button */}
            <div className="pt-2">
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full py-4 rounded-sm text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-2xl"
                style={{
                  background: name.trim()
                    ? `linear-gradient(180deg, ${accent}dd, ${accent}88)`
                    : 'rgba(50,40,30,0.5)',
                  border: `1px solid ${accent}`,
                  color: '#fff',
                  boxShadow: name.trim() ? `0 0 30px ${accent}40` : 'none',
                }}
              >
                <Sparkles size={18} />
                <span>Begin Your Journey</span>
              </button>
            </div>
          </div>

          {/* RIGHT: High-Definition Live 3D Interactive Hero Preview */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-muted font-bold">Interactive 3D Champion</div>
              <div className="h-cinzel text-xl text-ink font-bold">{c.label} Model</div>
            </div>

            {/* Large 3D Viewer */}
            <div className="w-full">
              <Character3DViewer className={cls} size="md" showOrbit={true} />
            </div>

            {/* Class Details Card */}
            <div className="p-4 rounded-sm border bg-black/60 space-y-3" style={{ borderColor: `${accent}30` }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm" style={{ background: `${accent}25`, color: accent }}>
                  <ClassIcon size={18} />
                </div>
                <div>
                  <div className="h-cinzel text-base font-bold text-ink">{c.label}</div>
                  <div className="text-xs text-muted">{name || 'The Nameless'}</div>
                </div>
              </div>

              <p className="text-xs text-ink2 italic leading-relaxed">{c.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-1.5 p-2 rounded-sm bg-black/40 border border-white/5">
                  <Heart size={12} className="text-red-500" />
                  <span className="text-muted">Health:</span>
                  <span className="ml-auto font-bold text-ink">{c.maxHp}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-sm bg-black/40 border border-white/5">
                  <Droplets size={12} className="text-blue-400" />
                  <span className="text-muted">Mana:</span>
                  <span className="ml-auto font-bold text-ink">{c.maxMana}</span>
                </div>
              </div>

              {/* Starting Abilities */}
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted mb-1.5">Starting Abilities</div>
                <div className="space-y-1.5">
                  {c.abilities.map((a: any) => (
                    <div key={a.id} className="text-xs flex items-center justify-between p-2 rounded-sm bg-black/30 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Sparkles size={11} style={{ color: accent }} />
                        <span className="font-semibold text-ink">{a.name}</span>
                      </div>
                      <span className="text-[10px] text-blue-300 font-bold">{a.cost}mp</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passive trait */}
              <div
                className="text-[11px] p-2.5 rounded-sm italic border-l-2"
                style={{ background: `${accent}15`, borderColor: accent, color: '#e8dcbe' }}
              >
                <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5" style={{ color: accent }}>
                  Passive Trait
                </span>
                {c.passive}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
