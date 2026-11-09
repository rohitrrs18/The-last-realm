import { motion } from 'framer-motion';
import { X, Coins } from 'lucide-react';
import { Button } from '../ui/Button';
import { useGame } from '../../state/gameStore';
import type { Npc } from '../../types/game';

export function MerchantShop({ npc, onClose }: { npc: Npc, onClose: () => void }) {
  const char = useGame(s => s.character);
  const buy = useGame(s => s.buyFromMerchant);
  
  if (!char) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-panel border border-gold/20 rounded-sm max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gold/10 flex justify-between items-center">
          <div>
            <h2 className="h-serif text-xl text-ink">{npc.name}</h2>
            <div className="text-[10px] uppercase tracking-wider text-gold/80">Merchant</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gold text-sm font-bold"><Coins size={14}/> {char.gold}</div>
            <button onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto space-y-2">
          {npc.shopInventory.map(item => (
            <div key={item.id} className="flex justify-between items-center border border-gold/10 bg-black/20 p-3 rounded-sm">
              <div>
                <div className={`text-sm ${item.rarity === 'Common' ? 'text-ink2' : item.rarity === 'Legendary' ? 'text-gold' : 'text-[#a97ac4]'}`}>{item.name}</div>
                <div className="text-xs text-muted">{item.category} · Lv.{item.level}</div>
              </div>
              <Button size="sm" disabled={char.gold < item.value} onClick={() => buy(npc.id, item.id, item.value)}>Buy ({item.value}g)</Button>
            </div>
          ))}
          {npc.shopInventory.length === 0 && <div className="text-center italic text-muted">Out of stock.</div>}
        </div>
      </motion.div>
    </div>
  );
}