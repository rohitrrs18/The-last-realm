// src/components/inventory/CraftingView.tsx
// Comprehensive Crafting Workshop with Potions, Weapons, Armor, and Rings.

import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { Tabs } from '../ui/Tabs';
import { Hammer, Sparkles, FlaskConical, Swords, Shield, Gem, Check, X } from 'lucide-react';
import { RECIPES, countMaterials } from '../../data/recipes';
import { formatRarityColor } from '../../utils/format';
import { sfx } from '../../audio/sfx';

export function CraftingView() {
  const character = useGame((s) => s.character);
  const craft = useGame((s) => s.craftRecipe);
  const discovered = useGame((s) => s.discoveredRecipes);
  const [tab, setTab] = useState<'All' | 'Potion' | 'Weapon' | 'Armor' | 'Ring'>('All');
  const [craftingId, setCraftingId] = useState<string | null>(null);

  if (!character) return null;

  const materials = countMaterials(character);

  const filteredRecipes = RECIPES.filter(
    (r) =>
      (tab === 'All' || r.outputCategory === tab) &&
      (!r.requiresDiscovery || discovered.includes(r.id))
  );

  const handleCraft = (id: string, requiresForge: boolean) => {
    setCraftingId(id);
    sfx.play('sword-hit');
    setTimeout(() => {
      craft(id, true); // Allow crafting in workshop
      setCraftingId(null);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <SectionTitle
          kicker="Workshop & Alchemy Laboratory"
          title="Field Crafting & Alchemy"
          subtitle="Brew rejuvenating draughts, smelt reinforced gear, and weave enchanted rings from discovered materials."
        />

        {/* Material Stockpile Bar */}
        <div className="p-4 rounded-sm border bg-panel border-gold/20 shadow-panel">
          <div className="text-[10px] uppercase font-bold tracking-widest text-gold mb-2 flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Available Crafting Materials in Satchel</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(materials).map(([name, count]) => (
              <div
                key={name}
                className="px-3 py-1.5 rounded-sm bg-black/50 border border-gold/15 flex items-center gap-2 text-xs font-semibold"
              >
                <span className="text-muted">{name}:</span>
                <span className="text-gold font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          items={[
            { id: 'All', label: 'All Recipes' },
            { id: 'Potion', label: 'Alchemy & Potions' },
            { id: 'Weapon', label: 'Weapons' },
            { id: 'Armor', label: 'Armor' },
            { id: 'Ring', label: 'Rings & Trinkets' },
          ]}
          value={tab}
          onChange={(t: string) => setTab(t as any)}
        />

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecipes.map((recipe) => {
            const hasMaterials = recipe.ingredients.every(
              (ing) => (materials[ing.materialName] || 0) >= ing.count
            );
            const isWorking = craftingId === recipe.id;

            return (
              <div
                key={recipe.id}
                className={`p-5 rounded-sm border bg-panel transition-all flex flex-col justify-between ${
                  hasMaterials
                    ? 'border-gold/30 hover:border-gold shadow-md'
                    : 'border-white/10 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${formatRarityColor(recipe.rarity)}`}>
                        {recipe.rarity} {recipe.outputCategory}
                      </span>
                      <h3 className="h-serif text-lg font-bold text-ink mt-0.5">{recipe.name}</h3>
                    </div>

                    <div className="p-2 rounded-sm bg-black/40 border border-gold/15 text-gold">
                      {recipe.outputCategory === 'Potion' ? (
                        <FlaskConical size={18} />
                      ) : recipe.outputCategory === 'Weapon' ? (
                        <Swords size={18} />
                      ) : recipe.outputCategory === 'Armor' ? (
                        <Shield size={18} />
                      ) : (
                        <Gem size={18} />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-ink2 italic leading-relaxed">{recipe.description}</p>

                  {/* Projected stats or effects */}
                  {recipe.stats && (
                    <div className="flex gap-2 flex-wrap text-xs pt-1">
                      {recipe.stats.damage && <span className="text-amber-400 font-bold">+{recipe.stats.damage} Damage</span>}
                      {recipe.stats.defense && <span className="text-blue-400 font-bold">+{recipe.stats.defense} Defense</span>}
                      {recipe.stats.hp && <span className="text-emerald-400 font-bold">+{recipe.stats.hp} Health</span>}
                      {recipe.stats.mana && <span className="text-indigo-400 font-bold">+{recipe.stats.mana} Mana</span>}
                    </div>
                  )}
                  {recipe.effect && (
                    <div className="flex gap-2 text-xs pt-1">
                      {recipe.effect.heal && <span className="text-emerald-400 font-bold">Restores {recipe.effect.heal} HP</span>}
                      {recipe.effect.mana && <span className="text-blue-400 font-bold">Restores {recipe.effect.mana} Mana</span>}
                    </div>
                  )}

                  {/* Required Ingredients */}
                  <div className="p-2.5 rounded-sm bg-black/40 border border-white/5 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-muted">Required Ingredients:</div>
                    <div className="space-y-1">
                      {recipe.ingredients.map((ing) => {
                        const have = materials[ing.materialName] || 0;
                        const ok = have >= ing.count;

                        return (
                          <div key={ing.materialName} className="flex items-center justify-between text-xs">
                            <span className={ok ? 'text-ink' : 'text-muted'}>{ing.materialName}</span>
                            <span className={`font-bold flex items-center gap-1 ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
                              {ok ? <Check size={12} /> : <X size={12} />}
                              {have} / {ing.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Craft Action Button */}
                <div className="mt-4 pt-3 border-t border-gold/10">
                  <button
                    disabled={!hasMaterials || isWorking}
                    onClick={() => handleCraft(recipe.id, recipe.requiresForge)}
                    className="w-full py-2.5 px-4 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 shadow-sm"
                  >
                    <Hammer size={14} className={isWorking ? 'animate-spin' : ''} />
                    <span>{isWorking ? 'Brewing / Forging...' : 'Craft Item'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12 text-muted italic">No recipes available in this category.</div>
        )}

      </div>
    </div>
  );
}
