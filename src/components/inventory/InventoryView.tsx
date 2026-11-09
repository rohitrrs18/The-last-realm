// src/components/inventory/InventoryView.tsx
// Masterclass Dark-Fantasy RPG Inventory & Equipment loadout.
// Interactive equipment sockets, item filtering, stat comparisons, and sound effects.

import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { Tabs } from '../ui/Tabs';
import { Swords, Shield, Gem, FlaskConical, Sparkles, Coins, Package, ArrowUpRight, Check, X } from 'lucide-react';
import { formatRarityColor } from '../../utils/format';
import { sfx } from '../../audio/sfx';
import type { Item, ItemCategory } from '../../types/game';
import { motion, AnimatePresence } from 'framer-motion';

const SLOT_ICONS: Record<string, React.ComponentType<any>> = {
  weapon: Swords,
  armor: Shield,
  shield: Shield,
  ring: Gem,
  amulet: Sparkles,
};

const RARITY_BORDERS: Record<string, string> = {
  Common:    'border-gray-500/30 hover:border-gray-400',
  Uncommon:  'border-emerald-500/40 hover:border-emerald-400',
  Rare:      'border-blue-500/50 hover:border-blue-400',
  Epic:      'border-purple-500/60 hover:border-purple-400',
  Legendary: 'border-amber-500/70 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  Mythic:    'border-red-500/80 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
};

export function InventoryView() {
  const char = useGame((s) => s.character);
  const equip = useGame((s) => s.equipItem);
  const consume = useGame((s) => s.consumeItem);
  const sell = useGame((s) => s.sellItem);
  const [filterTab, setFilterTab] = useState<'All' | 'Weapon' | 'Armor' | 'Potion' | 'Material'>('All');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!char) return null;

  const slots = ['weapon', 'armor', 'shield', 'ring', 'amulet'] as const;

  const filteredItems = char.inventory.filter(
    (i) => filterTab === 'All' || i.category === filterTab
  );

  const handleEquip = (id: string) => {
    sfx.play('sword-hit');
    equip(id);
  };

  const handleUse = (id: string) => {
    sfx.play('potion-drink');
    consume(id);
  };

  const handleSell = (id: string) => {
    sfx.play('gold-pickup');
    sell(id);
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <SectionTitle
          kicker="Armory & Satchel"
          title="Hero's Inventory"
          subtitle="Equip ancient artifacts, inspect plundered loot, and organize provisions for the trials ahead."
          actions={
            <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-sm border border-gold/25 shadow-md">
              <Coins size={18} className="text-gold" />
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Royal Treasury</div>
                <div className="h-serif text-xl font-bold text-gold">{char.gold.toLocaleString()}g</div>
              </div>
            </div>
          }
        />

        {/* TOP: Equipped Gear Loadout (5 Articulated Sockets) */}
        <div className="p-5 rounded-sm border bg-panel border-gold/20 shadow-panel">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold flex items-center gap-1.5">
              <Shield size={14} />
              <span>Equipped Battle Loadout</span>
            </span>
            <span className="text-xs text-muted">Click an equipped item to inspect</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {slots.map((s) => {
              const item = char.equipment[s];
              const Icon = SLOT_ICONS[s] || Shield;
              const isSelected = selectedItem?.id === item?.id;

              return (
                <div
                  key={s}
                  onClick={() => item && setSelectedItem(item)}
                  className={`p-3.5 rounded-sm border transition-all flex flex-col justify-between min-h-[105px] cursor-pointer ${
                    item
                      ? `${RARITY_BORDERS[item.rarity] || 'border-gold/20'} bg-black/40 ${
                          isSelected ? 'ring-2 ring-gold' : ''
                        }`
                      : 'border-dashed border-white/10 bg-black/20 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-muted">{s}</span>
                    <Icon size={14} className={item ? 'text-gold' : 'text-muted/40'} />
                  </div>

                  {item ? (
                    <div>
                      <div className={`text-sm font-bold ${formatRarityColor(item.rarity)} truncate`}>
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                        {item.stats?.damage && <span className="text-amber-400 font-bold">+{item.stats.damage} Atk</span>}
                        {item.stats?.defense && <span className="text-blue-400 font-bold">+{item.stats.defense} Def</span>}
                        {item.stats?.hp && <span className="text-emerald-400 font-bold">+{item.stats.hp} HP</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] italic text-muted/50 my-auto text-center">Empty Socket</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM: Satchel Items & Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          
          {/* LEFT: Satchel Grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <Tabs
                items={[
                  { id: 'All', label: 'All Items', count: char.inventory.length },
                  { id: 'Weapon', label: 'Weapons' },
                  { id: 'Armor', label: 'Armor' },
                  { id: 'Potion', label: 'Potions' },
                  { id: 'Material', label: 'Materials' },
                ]}
                value={filterTab}
                onChange={(t: string) => setFilterTab(t as any)}
              />
              <span className="text-xs text-muted font-semibold">
                Capacity: {char.inventory.length} / 40
              </span>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3.5 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
                      RARITY_BORDERS[item.rarity] || 'border-gold/15'
                    } ${isSelected ? 'bg-gold/15 ring-1 ring-gold' : 'bg-black/35 hover:bg-black/50'}`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className={`text-sm font-bold ${formatRarityColor(item.rarity)} truncate`}>
                        {item.name} {item.qty && item.qty > 1 && `(x${item.qty})`}
                      </div>
                      <div className="text-[10px] text-muted flex items-center gap-2 mt-0.5">
                        <span>{item.category}</span>
                        <span>·</span>
                        <span>Lv.{item.level}</span>
                        {item.stats?.damage && <span className="text-amber-400 font-bold">+{item.stats.damage} Atk</span>}
                        {item.stats?.defense && <span className="text-blue-400 font-bold">+{item.stats.defense} Def</span>}
                        {item.effect?.heal && <span className="text-emerald-400 font-bold">+{item.effect.heal} HP</span>}
                        {item.effect?.mana && <span className="text-blue-400 font-bold">+{item.effect.mana} MP</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.slot && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item.id);
                          }}
                          className="px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40"
                        >
                          Equip
                        </button>
                      )}
                      {item.category === 'Potion' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUse(item.id);
                          }}
                          className="px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-300 border border-emerald-500/40"
                        >
                          Use
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted italic bg-black/20 rounded-sm border border-white/5">
                  Your satchel has no items in this category.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detailed Item Inspection Card */}
          <div className="p-5 rounded-sm border bg-panel border-gold/25 shadow-panel flex flex-col justify-between space-y-4">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${formatRarityColor(selectedItem.rarity)}`}>
                    {selectedItem.rarity} {selectedItem.category}
                  </span>
                  <h3 className="h-serif text-2xl font-bold text-ink mt-0.5">{selectedItem.name}</h3>
                  <p className="text-xs text-ink2 italic mt-1 leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Stats Breakdown */}
                <div className="p-3.5 rounded-sm bg-black/50 border border-gold/15 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-muted">Item Properties</div>
                  {selectedItem.stats?.damage && (
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted">Attack Power:</span>
                      <span className="text-amber-400 font-bold">+{selectedItem.stats.damage}</span>
                    </div>
                  )}
                  {selectedItem.stats?.defense && (
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted">Physical Defense:</span>
                      <span className="text-blue-400 font-bold">+{selectedItem.stats.defense}</span>
                    </div>
                  )}
                  {selectedItem.stats?.hp && (
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted">Max Health:</span>
                      <span className="text-emerald-400 font-bold">+{selectedItem.stats.hp}</span>
                    </div>
                  )}
                  {selectedItem.effect?.heal && (
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted">Health Restored:</span>
                      <span className="text-emerald-400 font-bold">+{selectedItem.effect.heal} HP</span>
                    </div>
                  )}
                  {selectedItem.effect?.mana && (
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted">Mana Restored:</span>
                      <span className="text-blue-400 font-bold">+{selectedItem.effect.mana} MP</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-semibold pt-1 border-t border-white/5">
                    <span className="text-muted">Market Value:</span>
                    <span className="text-gold font-bold">{selectedItem.value} Gold</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selectedItem.slot && (
                    <button
                      onClick={() => handleEquip(selectedItem.id)}
                      className="w-full py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bg-gold hover:bg-gold/90 text-black shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Shield size={14} /> Equip to {selectedItem.slot}
                    </button>
                  )}
                  {selectedItem.category === 'Potion' && (
                    <button
                      onClick={() => handleUse(selectedItem.id)}
                      className="w-full py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5"
                    >
                      <FlaskConical size={14} /> Drink Potion
                    </button>
                  )}
                  <button
                    onClick={() => handleSell(selectedItem.id)}
                    className="w-full py-2 rounded-sm font-semibold text-xs border border-rose-500/40 text-rose-300 hover:bg-rose-950/40"
                  >
                    Sell to Merchant (+{Math.round(selectedItem.value * 0.4)}g)
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center my-auto py-16 text-muted">
                <Package size={36} className="mx-auto mb-2 text-gold/30" />
                <p className="text-xs italic">Select any item from the left to inspect its traits, stats, and effects.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
