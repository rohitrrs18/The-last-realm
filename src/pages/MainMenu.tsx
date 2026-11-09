// src/pages/MainMenu.tsx — Cinematic main menu with 3D particle canvas, animated title, staggered buttons

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Settings as SettingsIcon, Plus, Skull, ChevronRight } from 'lucide-react';
import { useGame } from '../state/gameStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { listSaves, deleteSave } from '../persistence/saveManager';
import { APP } from '../constants/ui';
import { Scene3DBackground } from '../components/shared/Scene3DBackground';

export function MainMenu() {
  const setScreen   = useGame((s) => s.setScreen);
  const loadFromSave = useGame((s) => s.loadFromSave);
  const [saves, setSaves] = useState(() => listSaves());
  const [showLoad, setShowLoad] = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);

  useEffect(() => { setSaves(listSaves()); }, []);

  const latestSave = saves.sort((a, b) => b.timestamp - a.timestamp)[0];

  const handleLoad = (id: string) => {
    const save = saves.find((s) => s.id === id);
    if (save) { loadFromSave(save); setShowLoad(false); }
  };
  const handleDelete = (id: string) => { deleteSave(id); setSaves(listSaves()); };

  const menuItems = [
    { id: 'new',      label: 'Begin New Journey', icon: Plus,         action: () => setScreen('create'), primary: true },
    { id: 'continue', label: 'Continue Journey',  icon: Play,         action: () => latestSave && handleLoad(latestSave.id), disabled: saves.length === 0 },
    { id: 'load',     label: 'Load Saved Game',   icon: Save,         action: () => setShowLoad(true), disabled: saves.length === 0 },
    { id: 'settings', label: 'Settings',           icon: SettingsIcon, action: () => setScreen('settings') },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 3D animated background */}
      <Scene3DBackground preset="menu" />

      {/* Layered atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/40 z-[1]" />
      <div className="absolute inset-0 bg-noise opacity-30 z-[1]" />

      {/* Top decorative line */}
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute top-0 left-0 right-0 h-px z-[2]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(183,154,101,0.6) 30%, rgba(183,154,101,0.9) 50%, rgba(183,154,101,0.6) 70%, transparent)' }}
      />

      {/* Main content */}
      <div className="relative z-[2] h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Logo / Title area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="max-w-2xl"
        >
          {/* Kicker */}
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '0.6em' }}
            transition={{ duration: 1.4, delay: 0.5 }}
            className="text-[11px] h-cinzel uppercase text-gold/70 mb-5 flex items-center gap-3"
          >
            <div className="h-px flex-1 max-w-[40px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(183,154,101,0.5))' }} />
            {APP.TAGLINE}
            <div className="h-px flex-1 max-w-[40px]" style={{ background: 'linear-gradient(90deg, rgba(183,154,101,0.5), transparent)' }} />
          </motion.div>

          {/* Giant title */}
          <h1 className="h-cinzel-deco leading-none mb-2 select-none">
            <span className="block text-5xl md:text-7xl lg:text-8xl text-ink/90">The Last</span>
            <span className="block text-5xl md:text-7xl lg:text-8xl shimmer-text">Realm</span>
          </h1>

          {/* Decorative separator */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.9 }}
            className="my-6 max-w-xs"
          >
            <div className="hair-gold" />
            <div className="flex justify-center mt-1 gap-2">
              <div className="w-1 h-1 rounded-full bg-gold/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/80" />
              <div className="w-1 h-1 rounded-full bg-gold/50" />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 1.0 }}
            className="h-serif italic text-ink2 text-lg md:text-xl leading-relaxed max-w-md"
          >
            "{APP.SUBTITLE}"
          </motion.p>
        </motion.div>

        {/* Menu Buttons */}
        <div className="mt-10 flex flex-col gap-2.5 max-w-sm">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                onClick={item.action}
                disabled={item.disabled}
                className={`btn-epic w-full flex items-center justify-between px-5 py-3.5 rounded-sm
                  ${item.primary ? 'border-gold/60' : 'border-gold/20'}
                  ${item.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  ${hovered === item.id && !item.disabled ? 'translate-x-1' : ''}
                  transition-transform duration-200`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className={item.primary ? 'text-gold' : 'text-ink2/70'} />
                  <span className={`text-sm ${item.primary ? 'text-goldSoft' : 'text-ink2'}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={14} className={`transition-opacity duration-200 ${hovered === item.id ? 'opacity-100 text-gold' : 'opacity-0'}`} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-10 text-[10px] text-muted/50 tracking-widest uppercase flex items-center gap-2"
        >
          <Skull size={10} />
          <span>v1.0 · A World Beyond Ruin</span>
        </motion.div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
        className="absolute bottom-0 left-0 right-0 h-px z-[2]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(183,154,101,0.4) 30%, rgba(183,154,101,0.6) 50%, rgba(183,154,101,0.4) 70%, transparent)' }}
      />

      {/* Load saves modal */}
      <Modal open={showLoad} onClose={() => setShowLoad(false)} title="Saved Journeys">
        <div className="space-y-2">
          {saves.length === 0 && <div className="text-muted italic text-sm">No saves found.</div>}
          {saves.map(s => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center border border-gold/15 p-3 rounded-sm bg-black/30 hover:bg-black/50 hover:border-gold/30 transition-all"
            >
              <div>
                <div className="text-ink h-serif text-base">{s.characterName}</div>
                <div className="text-xs text-muted">{s.className} · Level {s.level}</div>
                <div className="text-[10px] text-muted/60 mt-0.5">
                  {new Date(s.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleLoad(s.id)}>Load</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Delete</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Modal>
    </div>
  );
}