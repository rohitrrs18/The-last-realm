// src/hooks/useReducedMotion.ts
// Centralizes the "should I animate?" decision so every animated
// component (Framer Motion, CSS transitions, combat feedback) agrees.

import { useMemo } from 'react';
import { useGame } from '../state/gameStore';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * Returns true if animations should be reduced.
 * Precedence:
 *   1. If the user's in-app setting says reduce motion → true.
 *   2. Otherwise, respect the system `prefers-reduced-motion` preference.
 *   3. Otherwise, animate normally.
 *
 * @example
 *   const reduce = useReducedMotion();
 *   <motion.div animate={{ opacity: 1 }} transition={{ duration: reduce ? 0 : 0.4 }} />
 */
export function useReducedMotion(): boolean {
  const systemPrefers = usePrefersReducedMotion();
  const appSetting = useGame((s) => s.settings?.reducedMotion ?? false);
  return appSetting || systemPrefers;
}

/**
 * Convenience: returns animation config helpers ready to spread into
 * Framer Motion props. Never contains layout-affecting animations.
 *
 * @example
 *   const anim = useAnimationConfig();
 *   <motion.div {...anim.fade}>...</motion.div>
 */
export function useAnimationConfig() {
  const reduce = useReducedMotion();

  return useMemo(() => {
    const instant = { duration: 0 };
    return {
      reduce,
      /** Fade in/out. */
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: reduce ? instant : { duration: 0.35, ease: 'easeOut' },
      },
      /** Small upward entrance. */
      rise: {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: reduce ? instant : { duration: 0.3, ease: 'easeOut' },
      },
      /** Health bar fill. */
      bar: {
        transition: reduce ? instant : { duration: 0.5, ease: 'easeOut' as const },
      },
      /** Combat feedback pop. */
      pop: {
        initial: { scale: reduce ? 1 : 0.94, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: reduce ? 1 : 0.94, opacity: 0 },
        transition: reduce ? instant : { duration: 0.22, ease: 'easeOut' as const },
      },
      /** Screen-level transition between views. */
      screen: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: reduce ? instant : { duration: 0.4, ease: 'easeInOut' as const },
      },
      /** Damage number float. */
      float: {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 0, y: reduce ? 0 : -30 },
        transition: reduce ? instant : { duration: 0.9, ease: 'easeOut' as const },
      },
    };
  }, [reduce]);
}

/**
 * Duration helper for components that don't use Framer Motion but
 * still need to know how long to delay state updates for animation.
 *
 * @example
 *   const delay = animationDuration(700); // 0 if reduced motion
 */
export function useAnimationDuration(ms: number): number {
  const reduce = useReducedMotion();
  return reduce ? 0 : ms;
}