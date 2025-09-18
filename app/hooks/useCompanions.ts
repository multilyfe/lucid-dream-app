'use client';

import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { useBuffs } from './useBuffs';
import {
  cloneDefaultCompanions,
  xpNeededForLevel,
  canEvolve,
  getNextForm,
  type Companion,
  type CompanionXpEvent,
} from '../lib/companions';

export function useCompanions() {
  const [companions, setCompanions] = usePersistentState<Companion[]>(
    'companions',
    cloneDefaultCompanions
  );

  const gainXp = useCallback(
    (companionId: string, source: CompanionXpEvent, amount: number) => {
      setCompanions((prev) => {
        const companionIndex = prev.findIndex((c) => c.id === companionId);
        if (companionIndex === -1) return prev;

        const updatedCompanions = [...prev];
        const companion = { ...updatedCompanions[companionIndex] };

        let newXp = companion.xp + amount;
        let newLevel = companion.level;
        let neededXp = xpNeededForLevel(newLevel + 1);

        while (newXp >= neededXp) {
          newXp -= neededXp;
          newLevel++;
          neededXp = xpNeededForLevel(newLevel + 1);
        }

        companion.xp = newXp;
        companion.level = newLevel;

        // Check for auto-evolution
        if (companion.autoEvolve) {
          const nextForm = getNextForm(companion);
          if (nextForm && canEvolve(companion)) {
            companion.currentForm = nextForm.id;
          }
        }

        updatedCompanions[companionIndex] = companion;
        return updatedCompanions;
      });
    },
    [setCompanions]
  );

  const changeForm = useCallback(
    (companionId: string, formId: string) => {
      setCompanions((prev) =>
        prev.map((c) => {
          if (c.id === companionId) {
            const targetForm = c.evolutionTree.find((f) => f.id === formId);
            // Only allow changing to an unlocked form
            if (targetForm && c.level >= targetForm.unlockLevel) {
              return { ...c, currentForm: formId };
            }
          }
          return c;
        })
      );
    },
    [setCompanions]
  );

  const adjustBond = useCallback(
    (companionId: string, amount: number) => {
      setCompanions((prev) =>
        prev.map((c) => {
          if (c.id === companionId) {
            const newBond = Math.max(0, Math.min(100, c.bond + amount));
            return { ...c, bond: newBond };
          }
          return c;
        })
      );
    },
    [setCompanions]
  );

  const gainXpForCompanions = useCallback(
    (source: CompanionXpEvent, amount: number) => {
      companions.forEach((c) => gainXp(c.id, source, amount));
    },
    [companions, gainXp]
  );

  return {
    companions,
    gainXp,
    gainXpForCompanions,
    changeForm,
    adjustBond,
  };
}
