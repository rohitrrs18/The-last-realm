import { motion } from 'framer-motion';
export function Bar({ value, max, tone = 'gold', label }: { value: number; max: number; tone?: 'hp'|'mana'|'xp'|'gold'; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const colors = { hp: 'from-[#6E3A2E] to-[#B75A50]', mana: 'from-[#2D4569] to-[#6C8CC2]', xp: 'from-[#6B5A2E] to-[#E0C48F]', gold: 'from-[#6B5A2E] to-[#B79A65]' }[tone];
  return <div className="w-full">{label && <div className="flex justify-between text-[10px] text-muted mb-1"><span>{label}</span><span>{Math.round(value)}/{max}</span></div>}<div className="h-2 w-full bg-black/50 rounded-sm overflow-hidden border border-gold/10"><motion.div className={`h-full bg-gradient-to-r ${colors}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} /></div></div>;
}
