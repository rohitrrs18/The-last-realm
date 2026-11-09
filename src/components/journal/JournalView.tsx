// src/components/journal/JournalView.tsx
// Comprehensive Quest Journal with Active Quests, Story Chains, Completed Quests, and Lore Archive.

import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { SectionTitle } from '../ui/SectionTitle';
import { Tabs } from '../ui/Tabs';
import { EmptyState } from '../ui/EmptyState';
import { QuestChainView } from '../quests/QuestChainView';
import { BookOpen, CheckCircle, Compass, Award, Coins, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function JournalView() {
  const quests = useGame((s) => s.quests);
  const character = useGame((s) => s.character);
  const chainProgress = useGame((s) => s.chainProgress);
  const [tab, setTab] = useState<'active' | 'chains' | 'completed' | 'lore'>('active');

  const activeQuests = quests.filter((q) => q.status === 'active');
  const completedQuests = quests.filter((q) => q.status === 'completed');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none bg-gradient-to-b from-[#0e0a06] via-[#090704] to-[#040302]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Title */}
        <SectionTitle
          kicker="Chronicles & Objectives"
          title="Adventurer's Journal"
          subtitle="Track your royal contracts, faction quests, and ancient realm discoveries."
          actions={
            <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-sm border border-gold/15">
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Active Tasks</div>
                <div className="h-serif text-xl text-gold font-bold">{activeQuests.length}</div>
              </div>
              <div className="w-px h-8 bg-gold/15" />
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Completed</div>
                <div className="h-serif text-xl text-emerald-400 font-bold">{completedQuests.length}</div>
              </div>
            </div>
          }
        />

        {/* Navigation Tabs */}
        <Tabs
          items={[
            { id: 'active', label: 'Active Quests', count: activeQuests.length },
            { id: 'chains', label: 'Main Story Chains', count: chainProgress.length || 1 },
            { id: 'completed', label: 'Completed', count: completedQuests.length },
            { id: 'lore', label: 'Realm Lore' },
          ]}
          value={tab}
          onChange={(t: string) => setTab(t as any)}
        />

        {/* Tab 1: Active Quests */}
        {tab === 'active' && (
          <div className="space-y-4">
            {activeQuests.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-sm border bg-panel border-gold/20 shadow-panel transition-all hover:border-gold/50"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold bg-gold/15 text-gold border border-gold/30">
                        {q.category} Quest
                      </span>
                      <span className="text-xs text-muted">Level {character?.level || 1} Requirement</span>
                    </div>
                    <h3 className="h-serif text-xl font-bold text-ink">{q.title}</h3>
                    <p className="text-xs text-ink2 italic mt-1 leading-relaxed">{q.description}</p>
                  </div>

                  {/* Rewards Badge */}
                  <div className="shrink-0 p-3 rounded-sm bg-black/40 border border-gold/10 text-right space-y-1">
                    <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Rewards</div>
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-400">
                      <Coins size={12} />
                      <span>{q.reward.gold} Gold</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-purple-400">
                      <Sparkles size={12} />
                      <span>{q.reward.xp} XP</span>
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                <div className="mt-4 pt-3 border-t border-gold/10">
                  <div className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Objectives</div>
                  <div className="space-y-1.5">
                    {q.objectives.map((obj) => (
                      <div key={obj.id} className="flex items-center gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            obj.done ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-gold/30 text-transparent'
                          }`}
                        >
                          {obj.done ? <CheckCircle size={12} /> : '•'}
                        </div>
                        <span className={obj.done ? 'text-muted line-through' : 'text-ink font-medium'}>
                          {obj.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {activeQuests.length === 0 && (
              <EmptyState
                title="No Active Quests"
                description="Speak with town villagers, tavern innkeepers, or notice boards to take on new bounties."
              />
            )}
          </div>
        )}

        {/* Tab 2: Story Chains */}
        {tab === 'chains' && (
          <div className="space-y-4">
            <QuestChainView />
          </div>
        )}

        {/* Tab 3: Completed Quests */}
        {tab === 'completed' && (
          <div className="space-y-3">
            {completedQuests.map((q) => (
              <div key={q.id} className="p-4 rounded-sm border bg-black/40 border-emerald-500/20 opacity-80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <h4 className="h-serif text-base text-ink font-semibold">{q.title}</h4>
                  </div>
                  <p className="text-xs text-muted italic mt-0.5">{q.description}</p>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Completed</div>
              </div>
            ))}

            {completedQuests.length === 0 && (
              <EmptyState title="No Completed Quests" description="Your conquests will be commemorated here as you finish missions." />
            )}
          </div>
        )}

        {/* Tab 4: Realm Lore Notes */}
        {tab === 'lore' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-sm border bg-panel border-gold/15 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gold tracking-widest">History of the Realm</div>
              <h4 className="h-serif text-lg text-ink">The Shattered Crown</h4>
              <p className="text-xs text-ink2 leading-relaxed italic">
                A thousand winters ago, the high throne of Aethelgard collapsed under an eclipse of ash and sorcery.
                The ancient king was entombed beneath the basalt catacombs, yet the whispers say his guard still marches
                along the ruined ramparts.
              </p>
            </div>

            <div className="p-5 rounded-sm border bg-panel border-gold/15 space-y-2">
              <div className="text-[10px] uppercase font-bold text-gold tracking-widest">Primal Forces</div>
              <h4 className="h-serif text-lg text-ink">The Old Faith & Blood Runes</h4>
              <p className="text-xs text-ink2 leading-relaxed italic">
                Before iron swords and stone castles, the forest elders carved sigils into living redwood bark.
                Those who invoke the Old Faith can call upon stormwinds and earthbound fury, but the forest always extracts a tithe.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
