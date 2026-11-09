// src/components/combat/CombatView.tsx
// High-impact combat arena with real opponent attacks, lunging monster animations,
// full-screen hit flashes, floating damage numbers, turn indicators, and sound effects.

import { useRef, useState, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { Swords, Shield, Zap, FlaskConical, LogOut, Skull, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../../audio/sfx';

const CLASS_ACCENT: Record<string, string> = {
  Warrior: '#c97d3a',
  Mage:    '#6e8fd4',
  Rogue:   '#9f6fba',
  Ranger:  '#6ba876',
};

const ELEMENT_COLORS: Record<string, string> = {
  fire:     '#ff5533',
  ice:      '#55bbff',
  holy:     '#ffdd66',
  shadow:   '#bb55ff',
  physical: '#cca866',
};

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit?: boolean;
}

export function CombatView() {
  const combat  = useGame((s) => s.combat);
  const char    = useGame((s) => s.character);
  const attack  = useGame((s) => s.attack);
  const defend  = useGame((s) => s.defend);
  const cast    = useGame((s) => s.cast);
  const flee    = useGame((s) => s.flee);
  const consume = useGame((s) => s.consumeItem);

  // Visual combat state
  const [monsterShaking, setMonsterShaking] = useState(false);
  const [monsterLunging, setMonsterLunging] = useState(false);
  const [screenShaking, setScreenShaking]   = useState(false);
  const [playerHitFlash, setPlayerHitFlash] = useState(false);
  const [shieldActive, setShieldActive]     = useState(false);
  const [isEnemyTurn, setIsEnemyTurn]       = useState(false);
  const [slashEffect, setSlashEffect]       = useState<'player' | 'enemy' | null>(null);
  const [floatingTexts, setFloatingTexts]   = useState<FloatingText[]>([]);
  const floatId = useRef(0);

  if (!combat || !char) return null;

  const potion = char.inventory.find((i) => i.category === 'Potion' && i.effect?.heal);
  const accent = CLASS_ACCENT[char.class] ?? '#b79a65';
  const hpPercent = combat.monster.hp / Math.max(1, combat.monster.maxHp);
  const monsterHpColor = hpPercent > 0.5 ? '#e04444' : hpPercent > 0.25 ? '#ff8800' : '#ff2222';

  // React to last combat action
  useEffect(() => {
    if (!combat.lastAction) return;

    const action = combat.lastAction;
    if (action.who === 'player') {
      // Player attacked monster
      setMonsterShaking(true);
      setSlashEffect('player');
      setTimeout(() => setMonsterShaking(false), 450);
      setTimeout(() => setSlashEffect(null), 500);

      if (action.isCrit) {
        sfx.play('sword-crit');
      } else {
        sfx.play('sword-hit');
      }

      if (action.damage) {
        addFloatingText(
          action.isCrit ? `CRIT! -${action.damage}` : `-${action.damage}`,
          50,
          35,
          action.isCrit ? '#ffdd44' : '#ffffff',
          action.isCrit
        );
      } else if (action.heal) {
        addFloatingText(`+${action.heal} HP`, 50, 75, '#55ff77');
      }
    } else if (action.who === 'enemy') {
      // Opponent attacked player
      setMonsterLunging(true);
      setTimeout(() => {
        setMonsterLunging(false);
        setSlashEffect('enemy');
        setScreenShaking(true);
        setPlayerHitFlash(true);

        if (action.isBlocked) {
          sfx.play('sword-hit');
          addFloatingText(`BLOCKED! -${action.damage} HP`, 50, 78, '#66aaff');
        } else if (action.isCrit) {
          sfx.play('sword-crit');
          addFloatingText(`CRITICAL! -${action.damage} HP`, 50, 78, '#ff3333', true);
        } else {
          sfx.play('enemy-hit');
          addFloatingText(`-${action.damage} HP`, 50, 78, '#ff5555');
        }

        setTimeout(() => {
          setSlashEffect(null);
          setScreenShaking(false);
          setPlayerHitFlash(false);
          setIsEnemyTurn(false);
        }, 500);
      }, 350);
    }
  }, [combat.lastAction, combat.turn]);

  const addFloatingText = (text: string, x: number, y: number, color: string, isCrit = false) => {
    const id = floatId.current++;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, isCrit }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1100);
  };

  const handlePlayerAttack = () => {
    if (isEnemyTurn) return;
    attack();
    setIsEnemyTurn(true);
  };

  const handlePlayerCast = (id: string) => {
    if (isEnemyTurn) return;
    sfx.play('magic-cast');
    cast(id);
    setIsEnemyTurn(true);
  };

  const handlePlayerDefend = () => {
    if (isEnemyTurn) return;
    setShieldActive(true);
    setTimeout(() => setShieldActive(false), 900);
    sfx.play('ui-click');
    defend();
    setIsEnemyTurn(true);
  };

  const handleUsePotion = () => {
    if (!potion || isEnemyTurn) return;
    sfx.play('potion-drink');
    consume(potion.id);
  };

  const lastLog = combat.log.slice(-1)[0];

  return (
    <div className={`relative flex-1 flex flex-col overflow-hidden select-none ${screenShaking ? 'animate-shake' : ''}`}>
      {/* Background with dramatic atmospheric lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#140606] via-[#0d0404] to-[#050202]" />
      <div className="absolute inset-0 bg-noise opacity-25 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 25%, rgba(220,40,40,0.18), transparent 70%)' }}
      />

      {/* Screen Damage Blood Flash */}
      <AnimatePresence>
        {playerHitFlash && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 pointer-events-none border-[12px] border-red-600/70"
            style={{
              background: 'radial-gradient(circle, transparent 40%, rgba(200, 20, 20, 0.45) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Violent Claw / Slash Attack Overlay */}
      <AnimatePresence>
        {slashEffect === 'enemy' && (
          <motion.div
            initial={{ opacity: 1, scale: 0.7, rotate: -20 }}
            animate={{ opacity: 0, scale: 1.3, rotate: 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
          >
            <svg width="340" height="340" viewBox="0 0 100 100" className="drop-shadow-[0_0_25px_#ff0000]">
              <path d="M15,10 Q50,45 85,90" stroke="#ff2222" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M25,5 Q60,40 95,85" stroke="#ff8888" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M5,20 Q40,55 75,100" stroke="#ff0000" strokeWidth="5" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        )}
        {slashEffect === 'player' && (
          <motion.div
            initial={{ opacity: 1, scale: 0.8, x: -30 }}
            animate={{ opacity: 0, scale: 1.25, x: 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-0 top-1/4 z-40 pointer-events-none flex items-center justify-center"
          >
            <svg width="280" height="280" viewBox="0 0 100 100" className="drop-shadow-[0_0_20px_#ffe080]">
              <path d="M10,80 Q50,50 90,20" stroke="#ffd700" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M15,85 Q55,55 95,25" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Combat Damage Numbers */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {floatingTexts.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: f.isCrit ? 1.4 : 1 }}
            animate={{ opacity: [0, 1, 1, 0], y: -50, scale: f.isCrit ? [1.4, 1.7, 1.3] : [1, 1.2, 1] }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="absolute font-black tracking-wider text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              transform: 'translate(-50%, -50%)',
              color: f.color,
              fontSize: f.isCrit ? '26px' : '20px',
              fontFamily: 'Cinzel, Georgia, serif',
            }}
          >
            {f.text}
          </motion.div>
        ))}
      </div>

      {/* Main Arena View */}
      <div className="relative flex-1 flex flex-col justify-between p-4 md:p-6 z-10">
        
        {/* Top Header: Enemy Turn / Your Turn Phase Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ background: isEnemyTurn ? '#ff3333' : '#44ff66' }} />
            <span className="text-[11px] uppercase tracking-[0.25em] font-bold" style={{ color: isEnemyTurn ? '#ff6666' : '#77ff99' }}>
              {isEnemyTurn ? "⚠️ Opponent's Turn" : '⚔️ Your Turn'}
            </span>
          </div>

          {/* Enemy Intent Warning */}
          {combat.enemyIntent && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] uppercase tracking-wider bg-red-950/60 border border-red-800/40 text-red-300"
            >
              <AlertCircle size={12} className="text-red-400 animate-pulse" />
              <span>{combat.enemyIntent}</span>
            </motion.div>
          )}
        </div>

        {/* Center: Realistic Monster Arena */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto min-h-[220px]">
          {/* Monster Details */}
          <div className="text-center mb-3">
            <div className="text-[10px] uppercase tracking-[0.3em] text-red-400/80 mb-0.5">
              Level {combat.monster.level} · {combat.monster.type} Encounter
            </div>
            <h2 className="h-cinzel text-3xl md:text-5xl text-ink font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {combat.monster.name}
            </h2>
            {combat.monster.weakness && (
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-sm bg-gold/10 border border-gold/30 text-gold">
                Weak to: {combat.monster.weakness}
              </span>
            )}
          </div>

          {/* Monster HP Bar */}
          <div className="w-full max-w-md mx-auto mb-5 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted/80">Foe Health</span>
              <span style={{ color: monsterHpColor }}>
                {combat.monster.hp} / {combat.monster.maxHp}
              </span>
            </div>
            <div className="h-3 rounded-full bg-black/70 border border-white/10 overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #881111, ${monsterHpColor})` }}
                animate={{ width: `${Math.max(0, Math.min(100, hpPercent * 100))}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Monster Avatar with Dynamic Attack Lunges & Recoil */}
          <div className="relative">
            <motion.div
              animate={{
                y: monsterLunging ? 70 : [0, -8, 0],
                scale: monsterLunging ? 1.4 : monsterShaking ? 0.92 : 1,
                rotate: monsterShaking ? [0, -4, 4, -2, 0] : 0,
              }}
              transition={
                monsterLunging
                  ? { duration: 0.35, ease: 'easeIn' }
                  : { repeat: Infinity, duration: 3.2, ease: 'easeInOut' }
              }
              className="relative flex items-center justify-center"
            >
              <MonsterGraphics type={combat.monster.type} shaking={monsterShaking} />
            </motion.div>

            {/* Glowing Ground Shadow */}
            <div
              className="w-48 h-6 mx-auto rounded-full mt-2 filter blur-sm"
              style={{
                background: monsterLunging ? 'rgba(255,30,30,0.4)' : 'rgba(0,0,0,0.6)',
                transition: 'background 0.3s',
              }}
            />
          </div>
        </div>

        {/* Combat Chronicle Log Banner */}
        <div className="max-w-xl mx-auto w-full mb-3">
          <AnimatePresence mode="wait">
            {lastLog && (
              <motion.div
                key={lastLog.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-4 py-2.5 rounded-sm text-center text-xs md:text-sm font-medium border"
                style={{
                  background:
                    lastLog.kind === 'player'
                      ? 'rgba(20,40,20,0.85)'
                      : lastLog.kind === 'enemy'
                      ? 'rgba(60,15,15,0.9)'
                      : 'rgba(15,12,8,0.9)',
                  borderColor:
                    lastLog.kind === 'player'
                      ? 'rgba(80,180,80,0.4)'
                      : lastLog.kind === 'enemy'
                      ? 'rgba(220,60,60,0.5)'
                      : 'rgba(183,154,101,0.2)',
                  color:
                    lastLog.kind === 'player'
                      ? '#a0ffa0'
                      : lastLog.kind === 'enemy'
                      ? '#ffaaaa'
                      : '#e0d8c0',
                }}
              >
                {lastLog.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Vital Status & Guard Indicator */}
        <div
          className={`max-w-2xl mx-auto w-full p-3.5 rounded-sm border transition-all duration-300 ${
            shieldActive ? 'ring-2 ring-blue-400 bg-blue-950/30' : 'bg-black/60 border-gold/15'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink">{char.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ background: `${accent}25`, color: accent }}>
                Lv.{char.level} {char.class}
              </span>
            </div>
            {shieldActive && (
              <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1 animate-pulse">
                <Shield size={12} /> Shield Raised (-65% Dmg)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Player HP */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Health</span>
                <span className="text-red-400 font-bold">
                  {combat.playerHp} / {char.maxHp}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #aa1111, #ff3333)' }}
                  animate={{ width: `${Math.max(0, Math.min(100, (combat.playerHp / char.maxHp) * 100))}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Player Mana */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Mana</span>
                <span className="text-blue-400 font-bold">
                  {combat.playerMana} / {char.maxMana}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #1133aa, #4488ff)' }}
                  animate={{ width: `${Math.max(0, Math.min(100, (combat.playerMana / char.maxMana) * 100))}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="max-w-2xl mx-auto w-full mt-3 space-y-2">
          {/* Primary Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handlePlayerAttack}
              disabled={isEnemyTurn}
              className="py-3 px-2 rounded-sm flex flex-col items-center gap-1 font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(180deg, ${accent}33, ${accent}15)`,
                border: `1px solid ${accent}60`,
                boxShadow: `0 0 15px ${accent}20`,
                color: '#fff',
              }}
            >
              <Swords size={18} style={{ color: accent }} />
              <span className="text-[10px] uppercase tracking-wider">Attack</span>
            </button>

            <button
              onClick={handlePlayerDefend}
              disabled={isEnemyTurn}
              className="py-3 px-2 rounded-sm flex flex-col items-center gap-1 font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] bg-blue-900/25 border border-blue-500/40 text-blue-200"
            >
              <Shield size={18} className="text-blue-400" />
              <span className="text-[10px] uppercase tracking-wider">Defend</span>
            </button>

            <button
              onClick={handleUsePotion}
              disabled={!potion || isEnemyTurn}
              className="py-3 px-2 rounded-sm flex flex-col items-center gap-1 font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] bg-emerald-900/25 border border-emerald-500/40 text-emerald-200"
            >
              <FlaskConical size={18} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-wider">
                {potion ? `Potion (+${potion.effect?.heal})` : 'No Potion'}
              </span>
            </button>

            <button
              onClick={flee}
              disabled={isEnemyTurn}
              className="py-3 px-2 rounded-sm flex flex-col items-center gap-1 font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] bg-rose-950/25 border border-rose-800/40 text-rose-300"
            >
              <LogOut size={18} className="text-rose-400" />
              <span className="text-[10px] uppercase tracking-wider">Flee</span>
            </button>
          </div>

          {/* Class Abilities Section */}
          {char.abilities && char.abilities.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {char.abilities.map((a) => {
                const cd = char.cooldowns?.[a.id] ?? 0;
                const hasMana = combat.playerMana >= a.cost;
                const canUse = !isEnemyTurn && hasMana && cd === 0;
                const elemColor = a.element ? ELEMENT_COLORS[a.element] || accent : accent;

                return (
                  <button
                    key={a.id}
                    disabled={!canUse}
                    onClick={() => handlePlayerCast(a.id)}
                    className="p-2.5 rounded-sm text-left border transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed hover:border-gold/60"
                    style={{
                      background: 'rgba(15,12,8,0.7)',
                      borderColor: canUse ? `${elemColor}44` : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-ink truncate">{a.name}</span>
                      <span className="text-[9px] px-1 rounded-sm text-blue-300 bg-blue-950/60 font-semibold">
                        {a.cost}mp
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      <span style={{ color: elemColor }}>{a.kind}</span>
                      {cd > 0 && <span className="text-red-400 font-bold">CD: {cd}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Monster Visual Graphics with Glow Eyes & Beast Silhouette ---- */
function MonsterGraphics({ type, shaking }: { type: string; shaking: boolean }) {
  const configs: Record<string, { body: string; eyes: string; secondary: string; size: number }> = {
    Beast:    { body: '#5a3518', eyes: '#ff3300', secondary: '#8a4e22', size: 140 },
    Undead:   { body: '#2a3d2e', eyes: '#00ff77', secondary: '#486850', size: 135 },
    Demon:    { body: '#5c0f1e', eyes: '#ff0033', secondary: '#9c1c33', size: 145 },
    Humanoid: { body: '#333845', eyes: '#7799ff', secondary: '#556075', size: 130 },
    Ancient:  { body: '#26243b', eyes: '#ffea33', secondary: '#45426b', size: 150 },
    Boss:     { body: '#2b0c0c', eyes: '#ff3300', secondary: '#661616', size: 165 },
  };

  const cfg = configs[type] ?? configs.Beast;

  return (
    <svg
      width={cfg.size * 1.6}
      height={cfg.size * 1.6}
      viewBox="0 0 100 100"
      className={shaking ? 'animate-shake' : ''}
      style={{
        filter: `drop-shadow(0 0 25px ${cfg.eyes}80) drop-shadow(0 0 60px ${cfg.eyes}35)`,
      }}
    >
      {/* Monster Outer Glow Aura */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={cfg.eyes} strokeWidth="1" opacity="0.35" />

      {/* Beast Artwork */}
      {type === 'Beast' && (
        <g>
          {/* Fur Body */}
          <ellipse cx="50" cy="62" rx="32" ry="26" fill={cfg.body} />
          <ellipse cx="50" cy="42" rx="22" ry="20" fill={cfg.body} />
          {/* Ears */}
          <polygon points="34,26 26,6 42,24" fill={cfg.secondary} />
          <polygon points="66,26 74,6 58,24" fill={cfg.secondary} />
          {/* Glowing Predatory Eyes */}
          <ellipse cx="42" cy="40" rx="5.5" ry="6.5" fill={cfg.eyes} />
          <ellipse cx="58" cy="40" rx="5.5" ry="6.5" fill={cfg.eyes} />
          <ellipse cx="42" cy="41" rx="2.5" ry="4" fill="#000" />
          <ellipse cx="58" cy="41" rx="2.5" ry="4" fill="#000" />
          {/* Sharp Fangs */}
          <polygon points="40,54 44,64 48,54" fill="#fff" />
          <polygon points="52,54 56,64 60,54" fill="#fff" />
          {/* Razor Claws */}
          <path d="M22,70 L14,79 M25,74 L18,84 M28,77 L22,88" stroke={cfg.secondary} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M78,70 L86,79 M75,74 L82,84 M72,77 L78,88" stroke={cfg.secondary} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Undead Artwork */}
      {type === 'Undead' && (
        <g>
          <ellipse cx="50" cy="68" rx="26" ry="24" fill={cfg.body} />
          <ellipse cx="50" cy="44" rx="19" ry="20" fill={cfg.body} />
          {/* Skeletal eye sockets */}
          <circle cx="42" cy="42" r="6" fill="#050a05" />
          <circle cx="58" cy="42" r="6" fill="#050a05" />
          <circle cx="42" cy="42" r="3.5" fill={cfg.eyes} />
          <circle cx="58" cy="42" r="3.5" fill={cfg.eyes} />
          {/* Skull Teeth */}
          <rect x="42" y="56" width="3" height="6" fill="#ddd" />
          <rect x="47" y="56" width="3" height="6" fill="#ddd" />
          <rect x="52" y="56" width="3" height="6" fill="#ddd" />
          <rect x="57" y="56" width="3" height="6" fill="#ddd" />
          {/* Ribcage Glow */}
          <path d="M34,70 Q50,64 66,70 M34,77 Q50,71 66,77" stroke={cfg.eyes} strokeWidth="1.5" opacity="0.6" fill="none" />
        </g>
      )}

      {/* Demon Artwork */}
      {type === 'Demon' && (
        <g>
          {/* Large Demonic Horns */}
          <path d="M36,28 Q24,10 30,2 Q40,16 42,28" fill="#a00010" />
          <path d="M64,28 Q76,10 70,2 Q60,16 58,28" fill="#a00010" />
          {/* Torso & Wings */}
          <path d="M20,55 Q2,30 15,14 Q22,38 30,55" fill="#4a000b" opacity="0.9" />
          <path d="M80,55 Q98,30 85,14 Q78,38 70,55" fill="#4a000b" opacity="0.9" />
          <ellipse cx="50" cy="62" rx="30" ry="26" fill={cfg.body} />
          <ellipse cx="50" cy="42" rx="20" ry="20" fill={cfg.body} />
          {/* Sinister Eyes */}
          <polygon points="36,38 46,42 38,44" fill={cfg.eyes} />
          <polygon points="64,38 54,42 62,44" fill={cfg.eyes} />
          {/* Mouth */}
          <path d="M38,54 Q50,66 62,54" stroke="#ff3333" strokeWidth="2.5" fill="none" />
        </g>
      )}

      {/* Humanoid / Ancient / Boss Artwork */}
      {(type === 'Humanoid' || type === 'Ancient' || type === 'Boss') && (
        <g>
          <rect x="28" y="50" width="44" height="40" rx="6" fill={cfg.body} />
          <ellipse cx="50" cy="40" rx="20" ry="21" fill={cfg.body} />
          {/* Helm or Visor */}
          <ellipse cx="42" cy="38" rx="6" ry="6" fill={cfg.eyes} />
          <ellipse cx="58" cy="38" rx="6" ry="6" fill={cfg.eyes} />
          <ellipse cx="42" cy="39" rx="2.5" ry="3" fill="#000" />
          <ellipse cx="58" cy="39" rx="2.5" ry="3" fill="#000" />
          {/* Boss Crest & Weapon */}
          {type === 'Boss' && (
            <>
              <polygon points="50,14 42,26 58,26" fill="#ff4400" />
              <line x1="84" y1="20" x2="94" y2="76" stroke="#ff2200" strokeWidth="5" strokeLinecap="round" />
              <circle cx="94" cy="20" r="7" fill="#ff4400" />
            </>
          )}
          {type === 'Ancient' && (
            <>
              {/* Third eye */}
              <circle cx="50" cy="26" r="5" fill={cfg.eyes} />
              <circle cx="50" cy="26" r="2" fill="#000" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
