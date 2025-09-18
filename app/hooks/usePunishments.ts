'use client';

import { usePersistentState } from './usePersistentState';
import defaultPunishments from '../../data/punishments.json';

export interface Punishment {
  id: string;
  name: string;
  description: string;
}

export interface ActivePunishment extends Punishment {
  assignedAt: string;
}

const PUNISHMENTS_STORAGE_KEY = 'punishments';
const ACTIVE_PUNISHMENTS_STORAGE_KEY = 'activePunishments';

export function usePunishments() {
  const [punishments, setPunishments] = usePersistentState<Punishment[]>(
    PUNISHMENTS_STORAGE_KEY,
    () => defaultPunishments
  );

  const [activePunishments, setActivePunishments] = usePersistentState<ActivePunishment[]>(
    ACTIVE_PUNISHMENTS_STORAGE_KEY,
    () => []
  );

  const assignPunishment = (punishmentId: string) => {
    const punishment = punishments.find(p => p.id === punishmentId);
    if (punishment && !activePunishments.some(p => p.id === punishmentId)) {
      const newActivePunishment: ActivePunishment = {
        ...punishment,
        assignedAt: new Date().toISOString(),
      };
      setActivePunishments(prev => [...prev, newActivePunishment]);
      return newActivePunishment;
    }
    return null;
  };

  const completePunishment = (punishmentId: string) => {
    setActivePunishments(prev => prev.filter(p => p.id !== punishmentId));
  };

  return {
    punishments,
    activePunishments,
    assignPunishment,
    completePunishment,
  };
}
