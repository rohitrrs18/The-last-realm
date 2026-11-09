// src/pages/GameScreen.tsx
import { useState } from 'react';
import { useGame } from '../state/gameStore';
import { TopBar } from '../components/game/TopBar';
import { LeftPanel } from '../components/layout/LeftPanel';
import { RightPanel } from '../components/layout/RightPanel';
import { BottomNav } from '../components/layout/BottomNav';
import { StoryView } from '../components/game/StoryView';
import { CharacterView } from '../components/game/CharacterView';
import { InventoryView } from '../components/inventory/InventoryView';
import { CraftingView } from '../components/inventory/CraftingView';
import { SkillTreeView } from '../components/skills/SkillTreeView';
import { WorldMap } from '../components/world/WorldMap';
import { JournalView } from '../components/journal/JournalView';
import { FactionView } from '../components/factions/FactionView';
import { CodexView } from '../components/codex/CodexView';
import { CombatView } from '../components/combat/CombatView';
import { NpcList } from '../components/npc/NpcList';
import { DialogueView } from '../components/npc/DialogueView';
import { MerchantShop } from '../components/npc/MerchantShop';
import { BlacksmithView } from '../components/npc/BlacksmithView';
import { AnimatePresence, motion } from 'framer-motion';
import type { Npc } from '../types/game';

export function GameScreen() {
  const combat = useGame((s) => s.combat);
  const view = useGame((s) => s.activeView);
  const setScreen = useGame((s) => s.setScreen);
  const applyDialogue = useGame((s) => s.applyDialogueOutcome);

  const [dialogueNpc, setDialogueNpc] = useState<Npc | null>(null);
  const [shopNpc, setShopNpc] = useState<Npc | null>(null);
  const [forgeNpc, setForgeNpc] = useState<Npc | null>(null);

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <main className="flex-1 flex flex-col min-w-0">
          <TopBar onMenu={() => setScreen('menu')} />
          <AnimatePresence mode="wait">
            {combat ? (
              <motion.div key="combat" className="flex-1 flex flex-col">
                <CombatView />
              </motion.div>
            ) : (
              <motion.div key={view} className="flex-1 flex overflow-hidden">
                {view === 'story' && <StoryView />}
                {view === 'inventory' && <InventoryView />}
                {view === 'crafting' && <CraftingView />}
                {view === 'skills' && <SkillTreeView />}
                {view === 'map' && <WorldMap />}
                {view === 'journal' && <JournalView />}
                {view === 'factions' && <FactionView />}
                {view === 'codex' && <CodexView />}
                {view === 'character' && <CharacterView />}
                {view === 'npcs' && (
                  <NpcList
                    onTalk={(npc) => setDialogueNpc(npc)}
                    onTrade={(npc) => setShopNpc(npc)}
                    onForge={(npc) => setForgeNpc(npc)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <RightPanel />
      </div>
      <BottomNav />

      {/* Overlays */}
      {dialogueNpc && (
        <DialogueView
          npc={dialogueNpc}
          onClose={(outcome) => {
            applyDialogue(dialogueNpc.id, outcome.effects);
            setDialogueNpc(null);
            if (outcome.openShop) setShopNpc(dialogueNpc);
            if (outcome.openForge) setForgeNpc(dialogueNpc);
          }}
        />
      )}
      {shopNpc && <MerchantShop npc={shopNpc} onClose={() => setShopNpc(null)} />}
      {forgeNpc && <BlacksmithView npc={forgeNpc} onClose={() => setForgeNpc(null)} />}
    </div>
  );
}
