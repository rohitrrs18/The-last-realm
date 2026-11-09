// src/App.tsx
// Master App component. Mounts global UI chrome (toasts, confirm dialog)
// and audio/autosave lifecycle. Routes between screens.

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* Screens */
import { MainMenu } from './pages/MainMenu';
import { CharacterCreation } from './pages/CharacterCreation';
import { GameScreen } from './pages/GameScreen';
import { Settings } from './pages/Settings';

/* Global UI */
import { ToastContainer } from './components/ui/Toast';
import { ConfirmDialogHost } from './components/ui/ConfirmDialog';
import { AchievementToastHost } from './components/progression/AchievementToast';

/* Hooks / lifecycle */
import { useGame } from './state/gameStore';
import { useAudio } from './audio/useAudio';
import { useReducedMotion } from './hooks/useReducedMotion';
import { startAutoSave, stopAutoSave } from './persistence/autoSave';
import { audioManager } from './audio/AudioManager';

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const screen = useGame((s) => s.screen);
  const settings = useGame((s) => s.settings);
  const reduce = useReducedMotion();

  /* ---- Audio lifecycle ---- */
  useAudio();

  /* ---- Autosave lifecycle ---- */
  useEffect(() => {
    startAutoSave();
    return () => stopAutoSave();
  }, []);

  /* ---- Sync audio settings on mount ---- */
  useEffect(() => {
    audioManager.setMuted(settings.muted);
    audioManager.setVolume(settings.volume);
  }, [settings.muted, settings.volume]);

  /* ---- Init audio context on first user gesture ---- */
  useEffect(() => {
    const unlock = () => {
      audioManager.init();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  /* ---- Prevent iOS bounce / pull-to-refresh ---- */
  useEffect(() => {
    const preventBounce = (e: TouchEvent) => {
      // Only prevent default on touchmove outside scrollable areas.
      if (document.body.scrollTop === 0 && e.touches.length > 0) {
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.overflow-y-auto')) return;
      }
    };
    document.addEventListener('touchmove', preventBounce, { passive: true });
    return () => document.removeEventListener('touchmove', preventBounce);
  }, []);

  /* ---- Render ---- */
  return (
    <div className="h-screen w-screen overflow-hidden bg-bg text-ink select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: 'easeInOut' }}
          className="h-full w-full"
        >
          {screen === 'menu' && <MainMenu />}
          {screen === 'create' && <CharacterCreation />}
          {screen === 'game' && <GameScreen />}
          {screen === 'settings' && <Settings />}
        </motion.div>
      </AnimatePresence>

      {/* Global UI chrome */}
      <ToastContainer />
      <ConfirmDialogHost />
      <AchievementToastHost />
    </div>
  );
}