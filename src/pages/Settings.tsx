// src/pages/Settings.tsx
// Complete settings page. Audio controls, accessibility, save management.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Accessibility,
  Trash2,
  BookOpen,
  Save as SaveIcon,
} from 'lucide-react';
import { useGame } from '../state/gameStore';
import { SectionTitle, SubSectionTitle } from '../components/ui/SectionTitle';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { EmptyState } from '../components/ui/EmptyState';
import { Tooltip } from '../components/ui/Tooltip';
import { confirm } from '../components/ui/ConfirmDialog';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { audioManager } from '../audio/AudioManager';
import { sfx } from '../audio/sfx';
import { listSaves, deleteSave } from '../persistence/saveManager';
import { formatRelativeTime, formatAbsoluteTime } from '../utils/formatTime';
import { SETTINGS_LABELS, COMMON } from '../constants/ui';
import type { SaveSlot } from '../persistence/saveManager';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Settings() {
  const reduce = useReducedMotion();
  const setScreen = useGame((s) => s.setScreen);
  const settings = useGame((s) => s.settings);
  const toggleMute = useGame((s) => s.toggleMute);
  const setVolume = useGame((s) => s.setVolume);
  const setReducedMotion = useGame((s) => s.setReducedMotion);

  const [saves, setSaves] = useState<SaveSlot[]>(() => listSaves());
  const [deleting, setDeleting] = useState<string | null>(null);

  // Sync audio manager with settings.
  useEffect(() => {
    audioManager.setMuted(settings.muted);
    audioManager.setVolume(settings.volume);
  }, [settings.muted, settings.volume]);

  /* ---- Save deletion ---- */
  const handleDeleteSave = async (save: SaveSlot) => {
    const confirmed = await confirm({
      title: 'Delete this save?',
      message: `"${save.characterName}"'s journey will be permanently erased. This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;

    setDeleting(save.id);
    try {
      deleteSave(save.id);
      setSaves(listSaves());
      sfx.play('ui-close');
    } catch {
      sfx.play('error-buzz');
    } finally {
      setDeleting(null);
    }
  };

  /* ---- Reset all saves ---- */
  const handleResetAll = async () => {
    const confirmed = await confirm({
      title: 'Delete ALL saves?',
      message: SETTINGS_LABELS.RESET_CONFIRM,
      confirmLabel: 'Delete Everything',
      destructive: true,
    });
    if (!confirmed) return;
    for (const save of saves) {
      deleteSave(save.id);
    }
    setSaves([]);
    sfx.play('ui-close');
  };

  /* ---- Volume change ---- */
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audioManager.setVolume(v);
    // Hover tick so player hears the change.
    sfx.play('ui-hover');
  };

  return (
    <div className="relative h-full w-full overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a08] to-[#0a0806]" />
      <div className="absolute inset-0 bg-noise opacity-30" />

      <div className="relative max-w-2xl mx-auto p-6 sm:p-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <SectionTitle
            kicker={SETTINGS_LABELS.KICKER}
            title={SETTINGS_LABELS.TITLE}
            spacing="sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sfx.play('ui-close');
              setScreen('menu');
            }}
          >
            <ArrowLeft size={12} /> Back
          </Button>
        </div>

        {/* Audio */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
        >
          <SubSectionTitle>Audio</SubSectionTitle>
          <div className="border border-gold/15 rounded-sm bg-panel p-4 mb-4 space-y-4">
            {/* Mute */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.muted ? (
                  <VolumeX size={15} className="text-muted" />
                ) : (
                  <Volume2 size={15} className="text-gold" />
                )}
                <span className="text-[13px] text-ink2">
                  {SETTINGS_LABELS.MUTE}
                </span>
              </div>
              <button
                onClick={() => {
                  toggleMute();
                  sfx.play('ui-click');
                }}
                className={`px-3 py-1 rounded-sm border text-[11px] tracking-wider uppercase transition-colors ${
                  settings.muted
                    ? 'border-crimson/50 text-crimson hover:border-crimson'
                    : 'border-gold/40 text-gold hover:border-gold'
                }`}
              >
                {settings.muted ? SETTINGS_LABELS.MUTED : SETTINGS_LABELS.ON}
              </button>
            </div>

            {/* Volume */}
            <div>
              <div className="flex justify-between text-[11px] text-muted mb-1.5">
                <span>{SETTINGS_LABELS.VOLUME}</span>
                <span className="tabular-nums">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                disabled={settings.muted}
                className="w-full accent-gold disabled:opacity-40"
                aria-label="Master volume"
              />
            </div>
          </div>
        </motion.div>

        {/* Accessibility */}
        <SubSectionTitle>Accessibility</SubSectionTitle>
        <div className="border border-gold/15 rounded-sm bg-panel p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Accessibility size={15} className="text-gold mt-0.5" />
              <div>
                <div className="text-[13px] text-ink2">
                  {SETTINGS_LABELS.REDUCED_MOTION}
                </div>
                <div className="text-[10px] text-muted italic">
                  Disable animations and transitions throughout the game.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setReducedMotion(!settings.reducedMotion);
                sfx.play('ui-click');
              }}
              className={`shrink-0 px-3 py-1 rounded-sm border text-[11px] tracking-wider uppercase transition-colors ${
                settings.reducedMotion
                  ? 'border-gold/60 text-gold'
                  : 'border-gold/20 text-muted hover:border-gold/40'
              }`}
            >
              {settings.reducedMotion ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <Divider variant="ornament" spacing="md" />

        {/* Saved journeys */}
        <SubSectionTitle trailing={`${saves.length} save${saves.length === 1 ? '' : 's'}`}>
          {SETTINGS_LABELS.SAVED_JOURNEYS}
        </SubSectionTitle>
        <div className="border border-gold/15 rounded-sm bg-panel mb-4">
          {saves.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              title={SETTINGS_LABELS.NO_SAVES}
              description="Your journeys will appear here."
              size="sm"
            />
          ) : (
            <ul className="divide-y divide-gold/10">
              {saves
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((save) => (
                  <SaveRow
                    key={save.id}
                    save={save}
                    deleting={deleting === save.id}
                    onDelete={() => handleDeleteSave(save)}
                  />
                ))}
            </ul>
          )}
        </div>

        {/* Danger zone */}
        {saves.length > 0 && (
          <div className="mt-6 border border-crimson/30 rounded-sm bg-crimson/5 p-4">
            <SubSectionTitle>Danger zone</SubSectionTitle>
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#d68a85] italic">
                Permanently delete all saves.
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={handleResetAll}
              >
                <Trash2 size={11} /> Delete All
              </Button>
            </div>
          </div>
        )}

        {/* Back to menu */}
        <div className="mt-8 flex justify-center">
          <Button
            size="md"
            variant="ghost"
            onClick={() => {
              sfx.play('ui-close');
              setScreen('menu');
            }}
          >
            <ArrowLeft size={12} /> {SETTINGS_LABELS.BACK_TO_MENU}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Save row                                                           */
/* ------------------------------------------------------------------ */

function SaveRow({
  save,
  deleting,
  onDelete,
}: {
  save: SaveSlot;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <div className="h-serif text-sm text-ink truncate">
          {save.characterName}
        </div>
        <div className="text-[10px] text-muted">
          {save.className} · Lv.{save.level} ·{' '}
          <Tooltip content={formatAbsoluteTime(save.timestamp)}>
            <span className="cursor-help">{formatRelativeTime(save.timestamp)}</span>
          </Tooltip>
        </div>
      </div>
      <Tooltip content="Delete this save">
        <Button
          size="sm"
          variant="danger"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 size={11} />
          {deleting ? '…' : ''}
        </Button>
      </Tooltip>
    </li>
  );
}