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
      const { applyEvent } = useBuffs();
      
      // Apply buff effects to XP gain
      const buffedAmount = applyEvent('xp', amount);
      
      setCompanions((prev) => {
        const companionIndex = prev.findIndex((c) => c.id === companionId);
        if (companionIndex === -1) return prev;

        const updatedCompanions = [...prev];
        const companion = { ...updatedCompanions[companionIndex] };

        let newXp = companion.xp + buffedAmount;
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
      const { getEffectMultiplier } = useBuffs();
      
      // Apply bond multiplier from buffs
      const bondMultiplier = getEffectMultiplier('bondMultiplier');
      const buffedAmount = amount * bondMultiplier;
      
      setCompanions((prev) =>
        prev.map((c) => {
          if (c.id === companionId) {
            const newBond = Math.max(0, Math.min(100, c.bond + buffedAmount));
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

  // Get companion by name - for companion scanner
  const getCompanionByName = useCallback(
    (name: string) => {
      return companions.find(c => 
        c.name.toLowerCase() === name.toLowerCase() ||
        c.id.toLowerCase() === name.toLowerCase()
      );
    },
    [companions]
  );

  // Update companion bond - for companion scanner
  const updateCompanionBond = useCallback(
    (companionName: string, bondStrength: number) => {
      const companion = getCompanionByName(companionName);
      if (companion) {
        adjustBond(companion.id, bondStrength - companion.bond);
      }
    },
    [getCompanionByName, adjustBond]
  );

  return {
    companions: companions ?? [],
    gainXp,
    gainXpForCompanions,
    changeForm,
    adjustBond,
    getCompanionByName,
    updateCompanionBond,
  };
}
