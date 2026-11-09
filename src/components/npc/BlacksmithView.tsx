// src/components/npc/BlacksmithView.tsx
// Complete Blacksmith Forge workshop with Equipment Enhancement (+1, +2),
// Weapon Forging, and Salvaging for raw materials.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hammer, Shield, Swords, Sparkles, Coins, Flame, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { useGame } from '../../state/gameStore';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { sfx } from '../../audio/sfx';
import type { Npc, Item } from '../../types/game';
import { RECIPES } from '../../data/recipes';

export function BlacksmithView({ npc, onClose }: { npc: Npc; onClose: () => void }) {
  const char = useGame((s) => s.character);
  const [tab, setTab] = useState<'enhance' | 'forge' | 'salvage'>('enhance');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isForging, setIsForging] = useState(false);

  if (!char) return null;

  // Upgradeable items: weapons, armor, shields
  const upgradeableItems: Item[] = [
    ...(char.equipment.weapon ? [char.equipment.weapon] : []),
    ...(char.equipment.armor ? [char.equipment.armor] : []),
    ...(char.equipment.shield ? [char.equipment.shield] : []),
    ...char.inventory.filter((i) => i.slot === 'weapon' || i.slot === 'armor' || i.slot === 'shield'),
  ];

  // Recipes requiring forge
  const forgeRecipes = RECIPES.filter((r) => r.requiresForge);

  const handleEnhance = () => {
    if (!selectedItem) return;
    const cost = (selectedItem.level || 1) * 25;
    if (char.gold < cost) {
      toast.error('Not enough gold for enhancement!');
      return;
    }

    setIsForging(true);
    sfx.play('sword-hit');

    setTimeout(() => {
      setIsForging(false);

      // Enhance item stats
      const updatedItem: Item = {
        ...selectedItem,
        name: selectedItem.name.includes('+')
          ? selectedItem.name.replace(/\+(\d+)/, (_, n) => `+${Number(n) + 1}`)
          : `${selectedItem.name} +1`,
        stats: {
          ...selectedItem.stats,
          damage: selectedItem.stats?.damage ? selectedItem.stats.damage + 4 : undefined,
          defense: selectedItem.stats?.defense ? selectedItem.stats.defense + 3 : undefined,
          hp: selectedItem.stats?.hp ? selectedItem.stats.hp + 15 : undefined,
        },
      };

      // Update in equipment or inventory
      const newEquipment = { ...char.equipment };
      let newInventory = [...char.inventory];

      let foundInEquip = false;
      for (const slot of ['weapon', 'armor', 'shield'] as const) {
        if (newEquipment[slot]?.id === selectedItem.id) {
          newEquipment[slot] = updatedItem;
          foundInEquip = true;
          break;
        }
      }

      if (!foundInEquip) {
        newInventory = newInventory.map((i) => (i.id === selectedItem.id ? updatedItem : i));
      }

      useGame.setState({
        character: {
          ...char,
          gold: char.gold - cost,
          equipment: newEquipment,
          inventory: newInventory,
        },
      });

      setSelectedItem(updatedItem);
      sfx.play('quest-complete');
      toast.success(`Successfully reinforced ${updatedItem.name}!`);
    }, 700);
  };

  const handleSalvage = (item: Item) => {
    sfx.play('sword-hit');
    const goldGained = Math.round((item.value || 20) * 0.4);
    const oreCount = Math.max(1, Math.round(item.level || 1));

    const newInventory = char.inventory.filter((i) => i.id !== item.id);
    newInventory.push({
      id: `mat_${Date.now()}`,
      name: 'Iron Ore',
      description: 'Refined iron recovered from salvaged steel.',
      category: 'Material',
      rarity: 'Common',
      level: 1,
      value: 10,
      qty: oreCount,
    });

    useGame.setState({
      character: {
        ...char,
        gold: char.gold + goldGained,
        inventory: newInventory,
      },
    });

    toast.success(`Salvaged ${item.name} for ${goldGained} gold and ${oreCount}x Iron Ore!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-panel border border-gold/30 rounded-sm max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-gold/15 bg-black/40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-orange-950/60 border border-orange-600/40 text-orange-400">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="h-cinzel text-xl font-bold text-ink">{npc.name}'s Forge</h2>
              <div className="text-[10px] uppercase tracking-wider text-gold">Master Blacksmith · Royal Anvil</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gold text-sm font-bold bg-black/50 px-3 py-1 rounded-sm border border-gold/20">
              <Coins size={14} /> {char.gold}g
            </div>
            <button onClick={onClose} className="text-muted hover:text-ink">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Forge Sub-navigation */}
        <div className="flex border-b border-gold/15 bg-black/30">
          <button
            onClick={() => {
              setTab('enhance');
              setSelectedItem(null);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'enhance' ? 'text-gold border-b-2 border-gold bg-gold/10' : 'text-muted hover:text-ink'
            }`}
          >
            <ArrowUpCircle size={14} /> Enhance Gear
          </button>
          <button
            onClick={() => setTab('forge')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'forge' ? 'text-gold border-b-2 border-gold bg-gold/10' : 'text-muted hover:text-ink'
            }`}
          >
            <Hammer size={14} /> Forge Weapons
          </button>
          <button
            onClick={() => setTab('salvage')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'salvage' ? 'text-gold border-b-2 border-gold bg-gold/10' : 'text-muted hover:text-ink'
            }`}
          >
            <RefreshCw size={14} /> Salvage Gear
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: ENHANCE GEAR */}
          {tab === 'enhance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-muted tracking-wider">Select Equipment to Upgrade</div>
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {upgradeableItems.map((it) => {
                    const isSelected = selectedItem?.id === it.id;
                    return (
                      <button
                        key={it.id}
                        onClick={() => setSelectedItem(it)}
                        className={`w-full p-3 rounded-sm border text-left transition-all flex items-center justify-between ${
                          isSelected ? 'border-gold bg-gold/15 text-ink ring-1 ring-gold' : 'border-gold/10 bg-black/30 hover:border-gold/30'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-ink">{it.name}</div>
                          <div className="text-[10px] text-muted">
                            {it.slot?.toUpperCase()} · Level {it.level}
                          </div>
                        </div>
                        {it.stats?.damage && <span className="text-xs text-amber-400 font-bold">+{it.stats.damage} Dmg</span>}
                        {it.stats?.defense && <span className="text-xs text-blue-400 font-bold">+{it.stats.defense} Def</span>}
                      </button>
                    );
                  })}
                  {upgradeableItems.length === 0 && (
                    <div className="text-xs text-muted italic p-4 text-center">No weapons or armor found to upgrade.</div>
                  )}
                </div>
              </div>

              {/* Upgrade Station Card */}
              <div className="p-5 rounded-sm border bg-black/50 border-gold/20 flex flex-col justify-between">
                {selectedItem ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-gold font-bold mb-1">Enhancement Bench</div>
                      <h3 className="h-serif text-xl font-bold text-ink">{selectedItem.name}</h3>
                      <p className="text-xs text-ink2 italic mt-0.5">{selectedItem.description}</p>
                    </div>

                    <div className="p-3 rounded-sm bg-black/60 border border-gold/10 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Projected Enhancement</div>
                      {selectedItem.stats?.damage && (
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Attack Power:</span>
                          <span className="text-emerald-400">
                            {selectedItem.stats.damage} → <span className="font-bold">{selectedItem.stats.damage + 4}</span>
                          </span>
                        </div>
                      )}
                      {selectedItem.stats?.defense && (
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted">Armor Defense:</span>
                          <span className="text-emerald-400">
                            {selectedItem.stats.defense} → <span className="font-bold">{selectedItem.stats.defense + 3}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted">Enhancement Cost:</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Coins size={12} /> {(selectedItem.level || 1) * 25} Gold
                      </span>
                    </div>

                    <button
                      onClick={handleEnhance}
                      disabled={isForging || char.gold < (selectedItem.level || 1) * 25}
                      className="w-full py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:from-orange-500 hover:to-amber-500 disabled:opacity-40"
                    >
                      <Hammer size={16} className={isForging ? 'animate-spin' : ''} />
                      <span>{isForging ? 'Hammering Steel...' : 'Reinforce on Anvil'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center my-auto py-12 text-muted">
                    <Hammer size={32} className="mx-auto mb-2 text-gold/40" />
                    <p className="text-xs italic">Select an item from the left to inspect and reinforce.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FORGE WEAPONS */}
          {tab === 'forge' && (
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold text-muted tracking-wider">Blacksmith Blueprints</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {forgeRecipes.map((r) => (
                  <div key={r.id} className="p-4 rounded-sm border bg-black/40 border-gold/15 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-serif text-base font-bold text-ink">{r.name}</div>
                        <div className="text-[11px] text-muted italic">{r.description}</div>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-gold/10 text-gold border border-gold/30">
                        {r.rarity}
                      </span>
                    </div>

                    <div className="text-[11px] text-ink2">
                      Requires: {r.ingredients.map((ing) => `${ing.count}x ${ing.materialName}`).join(', ')}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        const craft = useGame.getState().craftRecipe;
                        craft(r.id, true);
                      }}
                    >
                      <Hammer size={12} /> Forge Item
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SALVAGE */}
          {tab === 'salvage' && (
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                Salvage Gear for Raw Materials & Gold
              </div>
              <div className="space-y-2">
                {char.inventory
                  .filter((i) => i.slot)
                  .map((it) => (
                    <div
                      key={it.id}
                      className="p-3 rounded-sm border bg-black/40 border-gold/10 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs font-bold text-ink">{it.name}</div>
                        <div className="text-[10px] text-muted">
                          {it.rarity} · Lv.{it.level}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSalvage(it)}
                        className="px-3 py-1.5 rounded-sm text-xs font-semibold border border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50"
                      >
                        Salvage (+{Math.round(it.value * 0.4)}g + Ore)
                      </button>
                    </div>
                  ))}
                {char.inventory.filter((i) => i.slot).length === 0 && (
                  <div className="text-center py-8 text-xs text-muted italic">No spare gear in satchel to salvage.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
