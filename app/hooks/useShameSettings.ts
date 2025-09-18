'use client';

import { usePersistentState } from './usePersistentState';
import defaultSettings from '../../data/shameSettings.json';
import { type ShameSettings, type FilthThreshold, type PunishmentTier } from '../lib/shame';

export function useShameSettings() {
  const [settings, setSettings] = usePersistentState<ShameSettings>('shameSettings', () => defaultSettings);

  const updateFilthThreshold = (level: number, newThreshold: Partial<FilthThreshold>) => {
    setSettings(prev => ({
      ...prev,
      filthThresholds: prev.filthThresholds.map(t =>
        t.level === level ? { ...t, ...newThreshold } : t
      ),
    }));
  };

  const updatePunishmentTier = (tier: number, newTier: Partial<PunishmentTier>) => {
    setSettings(prev => ({
      ...prev,
      punishmentTiers: prev.punishmentTiers.map(t =>
        t.tier === tier ? { ...t, ...newTier } : t
      ),
    }));
  };

  return {
    settings,
    updateFilthThreshold,
    updatePunishmentTier,
  };
}
