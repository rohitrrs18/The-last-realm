// src/components/quests/QuestChainView.tsx
// Interactive story chain explorer showing branching narrative paths and chapter progression.

import { useState } from 'react';
import { useGame } from '../../state/gameStore';
import { QUEST_CHAINS, QuestChain } from '../../data/questChains';
import { Shield, Sparkles, Coins, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function QuestChainView() {
  const [selectedChainId, setSelectedChainId] = useState<string>(QUEST_CHAINS[0]?.id || '');
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [decisionHistory, setDecisionHistory] = useState<Record<string, string>>({});
  const character = useGame((s) => s.character);

  const chain = QUEST_CHAINS.find((c) => c.id === selectedChainId) || QUEST_CHAINS[0];
  if (!chain) return null;

  const currentStage = chain.stages[selectedStageIdx] || chain.stages[0];

  const handleMakeChoice = (choiceId: string, nextStageId?: string) => {
    setDecisionHistory((prev) => ({ ...prev, [currentStage.id]: choiceId }));
    if (nextStageId) {
      const nextIdx = chain.stages.findIndex((s) => s.id === nextStageId);
      if (nextIdx !== -1) setSelectedStageIdx(nextIdx);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chain Selector Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {QUEST_CHAINS.map((c) => {
          const isSelected = c.id === selectedChainId;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedChainId(c.id);
                setSelectedStageIdx(0);
              }}
              className={`p-4 rounded-sm border text-left min-w-[260px] transition-all flex flex-col justify-between ${
                isSelected ? 'border-gold bg-panel/90 shadow-md ring-1 ring-gold/40' : 'border-gold/15 bg-black/40 hover:border-gold/30'
              }`}
            >
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-gold/80 block mb-1">
                  {c.faction} Storyline
                </span>
                <div className="h-serif text-base font-bold text-ink">{c.title}</div>
                <div className="text-[11px] text-muted italic mt-1 line-clamp-2">{c.tagline}</div>
              </div>
              <div className="text-[10px] text-goldSoft mt-3 flex items-center gap-1 font-semibold">
                <span>{c.stages.length} Chapters</span>
                <ChevronRight size={12} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Chain Stage View */}
      <div className="p-6 rounded-sm border bg-panel border-gold/25 shadow-panel space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gold/15 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark size={14} className="text-gold" />
              <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                {chain.faction} Campaign
              </span>
            </div>
            <h2 className="h-cinzel text-2xl font-bold text-ink">{chain.title}</h2>
            <p className="text-xs text-ink2 italic mt-1 max-w-2xl">{chain.description}</p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-sm bg-black/50 border border-gold/15">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-muted font-bold">Completion Reward</div>
              <div className="text-xs text-gold font-bold">{chain.reward.title}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Coins size={12} /> {chain.reward.gold}g
            </div>
          </div>
        </div>

        {/* Chapter Stepper */}
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {chain.stages.map((stg, i) => {
            const isCompleted = i < selectedStageIdx;
            const isCurrent = i === selectedStageIdx;

            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStageIdx(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'border-gold bg-gold/20 text-gold'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-white/10 bg-black/30 text-muted'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={12} /> : <span>{i + 1}</span>}
                <span>{stg.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Stage Story & Choices */}
        <div className="p-5 rounded-sm bg-black/40 border border-gold/15 space-y-4">
          <div className="text-xs uppercase tracking-widest text-gold font-bold">
            Chapter {selectedStageIdx + 1} of {chain.stages.length}
          </div>
          <h3 className="h-serif text-xl font-bold text-ink">{currentStage.title}</h3>
          <p className="text-sm text-ink2 leading-relaxed italic border-l-2 border-gold/30 pl-4 py-1">
            "{currentStage.narrative}"
          </p>

          {/* Player Choice Prompt */}
          <div className="pt-2 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-muted font-bold">Your Course of Action:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentStage.choices.map((ch) => {
                const wasChosen = decisionHistory[currentStage.id] === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleMakeChoice(ch.id, ch.nextStageId)}
                    className={`p-3.5 rounded-sm border text-left transition-all ${
                      wasChosen
                        ? 'border-gold bg-gold/20 text-ink ring-1 ring-gold'
                        : 'border-gold/20 bg-panel hover:border-gold/50 text-ink2 hover:text-ink'
                    }`}
                  >
                    <div className="text-xs font-bold text-ink flex items-center justify-between mb-1">
                      <span>{ch.label}</span>
                      {ch.reward?.gold && <span className="text-[10px] text-amber-400">+{ch.reward.gold}g</span>}
                    </div>
                    <div className="text-[11px] text-muted italic">{ch.outcomeText}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
