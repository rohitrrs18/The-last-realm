// src/components/layout/RightPanel.tsx — Chronicle panel with styled, colored log entries

import { useGame } from '../../state/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText } from 'lucide-react';

function getEntryStyle(entry: string): { color: string; icon: string; bg: string } {
  if (entry.includes('Defeated') || entry.includes('killed') || entry.includes('fall'))
    return { color: '#e06060', icon: '⚔', bg: 'rgba(135,30,30,0.15)' };
  if (entry.includes('Equipped') || entry.includes('item') || entry.includes('found'))
    return { color: '#a0c0ff', icon: '📦', bg: 'rgba(60,80,160,0.12)' };
  if (entry.includes('XP') || entry.includes('level') || entry.includes('Level'))
    return { color: '#d4c060', icon: '✦', bg: 'rgba(140,120,20,0.15)' };
  if (entry.includes('gold') || entry.includes('Gold'))
    return { color: '#b79a65', icon: '◈', bg: 'rgba(140,100,30,0.15)' };
  if (entry.includes('journey') || entry.includes('begin'))
    return { color: '#a0d0a0', icon: '◎', bg: 'rgba(60,120,60,0.12)' };
  if (entry.includes('→') || entry.includes('chose'))
    return { color: '#c0a0d0', icon: '→', bg: 'rgba(100,60,140,0.12)' };
  return { color: '#aaa496', icon: '·', bg: 'rgba(255,255,255,0.03)' };
}

export function RightPanel() {
  const log = useGame(s => s.log);
  const recentLog = log.slice(-15).reverse();

  return (
    <aside className="hidden xl:flex flex-col w-72 border-l shrink-0 overflow-hidden"
      style={{ background: 'rgba(8,7,5,0.92)', borderColor: 'rgba(183,154,101,0.08)', backdropFilter: 'blur(12px)' }}>
      
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b"
        style={{ borderColor: 'rgba(183,154,101,0.08)' }}>
        <ScrollText size={12} className="text-gold/50" />
        <span className="text-[10px] uppercase tracking-[0.4em] text-muted/80">Chronicle</span>
        <div className="ml-auto text-[9px] text-muted/40">{log.length} entries</div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        <AnimatePresence>
          {recentLog.map((entry, i) => {
            const style = getEntryStyle(entry);
            return (
              <motion.div
                key={log.length - i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-sm px-2.5 py-2 text-[11px] leading-relaxed"
                style={{ background: style.bg, borderLeft: `2px solid ${style.color}30` }}
              >
                <span className="mr-1.5 opacity-70" style={{ color: style.color }}>{style.icon}</span>
                <span style={{ color: style.color + 'dd' }}>{entry}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {log.length === 0 && (
          <div className="text-center py-8 text-muted/40 text-xs italic">
            Your story has not yet begun...
          </div>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(183,154,101,0.06)' }}>
        <div className="hair-gold" />
      </div>
    </aside>
  );
}
