const fs = require('fs');
const path = require('path');

const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log('Created:', filePath);
};

// --- UI PRIMITIVES ---
writeFile('src/components/ui/Button.tsx', `import React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' };
export function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans tracking-wide transition-all duration-200 border rounded-sm';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-base' }[size];
  const variants = { primary: 'bg-[#2b2a22] border-gold/40 text-goldSoft hover:border-gold hover:text-ink', ghost: 'bg-transparent border-gold/15 text-ink2 hover:border-gold/40 hover:text-ink', danger: 'bg-[#2a1515] border-crimson/50 text-[#d68a85] hover:border-crimson hover:text-ink' }[variant];
  return <button className={\`\${base} \${sizes} \${variants} \${className} disabled:opacity-40\`} {...rest}>{children}</button>;
}
`);

writeFile('src/components/ui/Panel.tsx', `import React from 'react';
export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={\`bg-panel border border-gold/10 rounded-sm shadow-panel relative \${className}\`}><div className="absolute inset-0 pointer-events-none bg-noise opacity-40" /><div className="relative">{children}</div></div>;
}
`);

writeFile('src/components/ui/Bar.tsx', `import { motion } from 'framer-motion';
export function Bar({ value, max, tone = 'gold', label }: { value: number; max: number; tone?: 'hp'|'mana'|'xp'|'gold'; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const colors = { hp: 'from-[#6E3A2E] to-[#B75A50]', mana: 'from-[#2D4569] to-[#6C8CC2]', xp: 'from-[#6B5A2E] to-[#E0C48F]', gold: 'from-[#6B5A2E] to-[#B79A65]' }[tone];
  return <div className="w-full">{label && <div className="flex justify-between text-[10px] text-muted mb-1"><span>{label}</span><span>{Math.round(value)}/{max}</span></div>}<div className="h-2 w-full bg-black/50 rounded-sm overflow-hidden border border-gold/10"><motion.div className={\`h-full bg-gradient-to-r \${colors}\`} initial={{ width: 0 }} animate={{ width: \`\${pct}%\` }} transition={{ duration: 0.5 }} /></div></div>;
}
`);

writeFile('src/components/ui/SectionTitle.tsx', `export function SectionTitle({ kicker, title, subtitle, actions, size = 'md' }: any) {
  const TITLE_SIZE = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-5xl' }[size];
  return <div className="mb-6"><div className="flex justify-between items-start"><div>{kicker && <div className="text-[10px] tracking-widest text-gold/70 mb-1">{kicker}</div>}<h1 className={\`h-serif \${TITLE_SIZE} text-ink\`}>{title}</h1>{subtitle && <p className="text-[12px] text-ink2 italic mt-2">{subtitle}</p>}</div>{actions && <div>{actions}</div>}</div><div className="mt-4 hair-gold" /></div>;
}
export function SubSectionTitle({ children }: any) { return <div className="text-[10px] uppercase tracking-widest text-muted mb-3">{children}</div>; }
`);

writeFile('src/components/ui/Toast.tsx', `import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, Trophy, Sparkles, X } from 'lucide-react';
export const useToastStore = create<any>((set, get) => ({ toasts: [], push: (t: any) => { const id = Date.now().toString(); set({ toasts: [...get().toasts, { ...t, id }] }); setTimeout(() => get().dismiss(id), 4000); }, dismiss: (id: any) => set({ toasts: get().toasts.filter((t: any) => t.id !== id) }) }));
export const toast = { success: (m: string, o?: any) => useToastStore.getState().push({ kind: 'success', title: o?.title || m, body: o?.body }), error: (m: string, o?: any) => useToastStore.getState().push({ kind: 'error', title: o?.title || m, body: o?.body }), info: (m: string, o?: any) => useToastStore.getState().push({ kind: 'info', title: o?.title || m, body: o?.body }), achievement: (m: string, o?: any) => useToastStore.getState().push({ kind: 'achievement', title: o?.title || m, body: o?.body }) };
export function ToastContainer() {
  const toasts = useToastStore((s: any) => s.toasts);
  return <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"><AnimatePresence>{toasts.map((t: any) => <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="bg-panel border border-gold/20 rounded-sm p-3 shadow-panel w-80 pointer-events-auto"><div className="flex justify-between"><span className="text-sm text-ink">{t.title}</span><button onClick={() => useToastStore.getState().dismiss(t.id)}><X size={14}/></button></div>{t.body && <div className="text-xs text-ink2 mt-1">{t.body}</div>}</motion.div>)}</AnimatePresence></div>;
}
`);

writeFile('src/components/ui/Tooltip.tsx', `import { useState } from 'react';
export function Tooltip({ children, content, side = 'top' }: any) {
  const [show, setShow] = useState(false);
  return <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>{children}{show && <div className="absolute z-50 bg-elevated border border-gold/20 p-2 rounded-sm text-xs text-ink2 whitespace-nowrap -top-8 left-1/2 -translate-x-1/2">{content}</div>}</div>;
}
`);

writeFile('src/components/ui/Modal.tsx', `import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
export function Modal({ open, onClose, title, children, footer, maxWidthClass = 'max-w-lg' }: any) {
  if (typeof document === 'undefined') return null;
  return createPortal(<AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}><motion.div onClick={(e) => e.stopPropagation()} className={\`bg-panel border border-gold/20 rounded-sm w-full \${maxWidthClass}\`}><div className="p-4 border-b border-gold/10 flex justify-between"><h2 className="text-xl h-serif text-ink">{title}</h2><button onClick={onClose}><X size={18}/></button></div><div className="p-4">{children}</div>{footer && <div className="p-4 border-t border-gold/10 flex justify-end">{footer}</div>}</motion.div></motion.div>}</AnimatePresence>, document.body);
}
`);

writeFile('src/components/ui/EmptyState.tsx', `export function EmptyState({ title, description, icon }: any) { return <div className="text-center py-10"><div className="text-muted mb-2">{icon}</div><div className="text-lg h-serif text-ink">{title}</div><div className="text-sm text-muted italic">{description}</div></div>; }
`);

writeFile('src/components/ui/Tabs.tsx', `export function Tabs({ items, value, onChange }: any) { return <div className="flex border-b border-gold/15 mb-4">{items.map((i: any) => <button key={i.id} onClick={() => onChange(i.id)} className={\`px-4 py-2 text-sm \${value === i.id ? 'text-gold border-b-2 border-gold' : 'text-muted'}\`}>{i.label}</button>)}</div>; }
`);

writeFile('src/components/ui/Divider.tsx', `export function Divider({ variant = 'hairline' }: any) { return <div className="w-full my-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />; }
`);

writeFile('src/components/ui/ConfirmDialog.tsx', `export function ConfirmDialogHost() { return null; }
export function confirm(o: any) { return Promise.resolve(window.confirm(o.message)); }
`);

writeFile('src/components/ui/StatRow.tsx', `export function StatRow({ label, value }: any) { return <div className="flex justify-between border-b border-gold/10 pb-1 text-sm"><span className="text-muted">{label}</span><span className="text-goldSoft">{value}</span></div>; }
`);

writeFile('src/components/ui/Spinner.tsx', `export function Spinner() { return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold" />; }
export function LoadingScreen({ message }: any) { return <div className="h-full flex items-center justify-center bg-bg text-ink h-serif">{message}</div>; }
export function LoadingOverlay() { return null; }
`);

// --- LAYOUT ---
writeFile('src/components/layout/LeftPanel.tsx', `import { useGame } from '../../state/gameStore';
import { Bar } from '../ui/Bar';
export function LeftPanel() {
  const char = useGame(s => s.character);
  const world = useGame(s => s.world);
  if (!char || !world) return null;
  const loc = world.locations.find(l => l.id === world.currentLocationId);
  return <aside className="hidden lg:flex flex-col w-72 border-r border-gold/10 bg-bg2/60 p-4">
    <div className="text-xl h-serif text-ink">{char.name}</div>
    <div className="text-xs text-muted mb-4">{char.class} Lv.{char.level}</div>
    <Bar label="HP" value={char.hp} max={char.maxHp} tone="hp" />
    <Bar label="MP" value={char.mana} max={char.maxMana} tone="mana" />
    <div className="mt-4 text-sm text-goldSoft">{loc?.name}</div>
  </aside>;
}
`);

writeFile('src/components/layout/RightPanel.tsx', `import { useGame } from '../../state/gameStore';
export function RightPanel() {
  const log = useGame(s => s.log);
  return <aside className="hidden xl:flex flex-col w-72 border-l border-gold/10 bg-bg2/60 p-4"><div className="text-xs uppercase text-muted mb-2">Chronicle</div>{log.slice(-10).map((l, i) => <div key={i} className="text-xs text-ink2 mb-1">{l}</div>)}</aside>;
}
`);

writeFile('src/components/layout/BottomNav.tsx', `import { useGame } from '../../state/gameStore';
import { User, Backpack, Sparkles, BookOpen, Map, Archive } from 'lucide-react';
export function BottomNav() {
  const view = useGame(s => s.activeView);
  const setView = useGame(s => s.setActiveView);
  const combat = useGame(s => s.combat);
  const items = [{ id: 'story', label: 'Story', Icon: BookOpen }, { id: 'character', label: 'Character', Icon: User }, { id: 'inventory', label: 'Inventory', Icon: Backpack }, { id: 'map', label: 'Map', Icon: Map }, { id: 'codex', label: 'Codex', Icon: Archive }] as const;
  return <nav className="border-t border-gold/15 bg-bg2 flex justify-around">{items.map(({id, label, Icon}) => <button key={id} onClick={() => setView(id as any)} disabled={!!combat && id !== 'inventory'} className={\`flex flex-col items-center p-2 text-[10px] \${view === id ? 'text-gold' : 'text-muted'}\`}><Icon size={18} /><span>{label}</span></button>)}</nav>;
}
`);

writeFile('src/components/layout/MobilePanel.tsx', `export function MobilePanel({ open, children }: any) { if (!open) return null; return <div className="fixed inset-0 z-50 bg-black/80 flex">{children}</div>; }
export function MobileDrawerTrigger({ icon, label, onClick }: any) { return <button onClick={onClick} className="flex items-center gap-1 text-xs text-muted">{icon}{label}</button>; }
`);

// --- VIEWS ---
writeFile('src/components/game/StoryView.tsx', `import { useGame } from '../../state/gameStore';
export function StoryView() {
  const event = useGame(s => s.currentEvent);
  const world = useGame(s => s.world);
  const doChoice = useGame(s => s.doChoice);
  if (!event || !world) return null;
  const loc = world.locations.find(l => l.id === world.currentLocationId);
  return <div className="p-8 max-w-2xl mx-auto"><div className="text-sm text-gold">{loc?.region}</div><h1 className="text-3xl h-serif text-ink mb-4">{loc?.name}</h1><div className="bg-panel p-6 border border-gold/15 rounded-sm"><h2 className="text-xl text-goldSoft mb-2">{event.title}</h2><p className="text-ink2 mb-6">{event.narrative}</p><div className="space-y-2">{event.choices.map(c => <button key={c.id} onClick={() => doChoice(c.id)} className="w-full text-left bg-black/20 p-3 border border-gold/10 hover:border-gold/40 rounded-sm">{c.label}</button>)}</div></div></div>;
}
`);

writeFile('src/components/game/CharacterView.tsx', `import { useGame } from '../../state/gameStore';
export function CharacterView() {
  const char = useGame(s => s.character);
  if (!char) return null;
  return <div className="p-8"><h1 className="text-3xl h-serif text-ink">{char.name}</h1><p className="text-muted">{char.class} Lv.{char.level}</p></div>;
}
`);

writeFile('src/components/game/TopBar.tsx', `import { useGame } from '../../state/gameStore';
import { Button } from '../ui/Button';
export function TopBar({ onMenu }: { onMenu: () => void }) {
  const setScreen = useGame(s => s.setScreen);
  return <div className="flex justify-between p-2 border-b border-gold/10"><div className="text-xs text-muted">The Last Realm</div><Button size="sm" variant="ghost" onClick={onMenu}>Menu</Button></div>;
}
`);

writeFile('src/components/inventory/InventoryView.tsx', `import { useGame } from '../../state/gameStore';
export function InventoryView() {
  const char = useGame(s => s.character);
  if (!char) return null;
  return <div className="p-8"><h1 className="text-2xl h-serif text-ink">Inventory</h1><div className="text-gold mt-2">Gold: {char.gold}</div></div>;
}
`);

writeFile('src/components/world/WorldMap.tsx', `import { useGame } from '../../state/gameStore';
export function WorldMap() {
  const world = useGame(s => s.world);
  if (!world) return null;
  return <div className="p-8"><h1 className="text-2xl h-serif text-ink">World Map</h1><div className="grid grid-cols-3 gap-2 mt-4">{world.locations.map(l => <div key={l.id} className="bg-panel p-2 border border-gold/10">{l.name}</div>)}</div></div>;
}
`);

writeFile('src/components/journal/JournalView.tsx', `import { useGame } from '../../state/gameStore';
export function JournalView() {
  const quests = useGame(s => s.quests);
  return <div className="p-8"><h1 className="text-2xl h-serif text-ink">Journal</h1><div className="mt-4">{quests.map(q => <div key={q.id} className="mb-2">{q.title}</div>)}</div></div>;
}
`);

writeFile('src/components/codex/CodexView.tsx', `export function CodexView() { return <div className="p-8"><h1 className="text-2xl h-serif text-ink">Codex</h1></div>; }
`);

writeFile('src/components/combat/CombatView.tsx', `import { useGame } from '../../state/gameStore';
import { Button } from '../ui/Button';
export function CombatView() {
  const combat = useGame(s => s.combat);
  const char = useGame(s => s.character);
  const attack = useGame(s => s.attack);
  const flee = useGame(s => s.flee);
  if (!combat || !char) return null;
  return <div className="p-8 bg-[#1a1512] min-h-full"><h1 className="text-3xl h-serif text-ink mb-4">{combat.monster.name}</h1><div className="mb-8">HP: {combat.monster.hp}</div><div className="flex gap-2"><Button onClick={attack}>Attack</Button><Button onClick={flee}>Flee</Button></div></div>;
}
`);

// Stubs
const stubs = ['npc/NpcList','npc/DialogueView','npc/MerchantShop','npc/BlacksmithView','skills/SkillTreeView','progression/LevelUpModal','progression/AchievementToast','quests/QuestChainView','endings/EndingScreen','loot/LootDropModal','factions/FactionView','inventory/CraftingView','save/SaveSlotCard','inventory/ItemTooltip','inventory/ItemComparison','world/MapLegend','world/TravelConfirmation','codex/CodexSearch','combat/BossPhaseIndicator'];

stubs.forEach(p => {
  const name = path.basename(p);
  const content = "export function " + name + "(props: any) { return <div>" + name + "</div>; }\n";
  writeFile("src/components/" + p + ".tsx", content);
});

console.log('UI components generated successfully!');