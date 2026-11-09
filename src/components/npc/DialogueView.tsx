import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGame } from '../../state/gameStore';
import type { Npc } from '../../types/game';

export function DialogueView({ npc, onClose }: { npc: Npc, onClose: (outcome: any) => void }) {
  const [relationshipDelta, setRelationshipDelta] = useState(0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-panel border border-gold/20 rounded-sm max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-gold/10 flex justify-between">
          <div>
            <h2 className="h-serif text-xl text-ink">{npc.name}</h2>
            <div className="text-[10px] uppercase tracking-wider text-gold/80">{npc.role}</div>
          </div>
          <button onClick={() => onClose({ effects: { relationshipDelta, goldDelta: 0, reputation: {}, flags: [], questIds: [] }, openShop: false, openForge: false })}><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-ink2 italic text-lg h-serif mb-6">"{npc.greeting}"</p>
          <div className="space-y-2">
            <button onClick={() => setRelationshipDelta(5)} className="w-full text-left border border-gold/15 hover:border-gold/50 bg-black/20 p-3 rounded-sm text-sm text-ink2">I am glad to see you.</button>
            <button onClick={() => setRelationshipDelta(-5)} className="w-full text-left border border-gold/15 hover:border-gold/50 bg-black/20 p-3 rounded-sm text-sm text-ink2">Get out of my way.</button>
            <Button className="w-full mt-4" onClick={() => onClose({ effects: { relationshipDelta, goldDelta: 0, reputation: {}, flags: [], questIds: [] }, openShop: false, openForge: false })}>End Conversation</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}