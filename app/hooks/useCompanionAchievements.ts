'use client';

import { useEffect, useMemo } from 'react';
import { useAchievements } from './useAchievements';
import { useCompanions } from './useCompanions';

/**
 * A custom hook to manage companion-related achievements.
 * It listens to changes in companion state and unlocks achievements when their triggers are met.
 */
export function useCompanionAchievements() {
  const { achievements, unlockAchievement } = useAchievements();
  const { companions } = useCompanions();

  const evolvedCompanionsCount = useMemo(() => {
    const list = companions ?? [];
    // A companion is considered "evolved" if it has more than one form in the evolution tree.
    return list.filter((c: any) => Array.isArray((c as any).evolutionTree) && (c as any).evolutionTree.length > 1).length;
  }, [companions]);

  useEffect(() => {
    if (!achievements || achievements.length === 0) return;

    const companionAchievements = achievements.filter(
      (a) => !a.unlocked && a.category === 'Companion'
    );

    if (companionAchievements.length === 0) return;

    companionAchievements.forEach((achievement) => {
      const { trigger } = achievement as any;
      let conditionMet = false;

      if (trigger?.type === 'COMPANION_EVOLVED' && evolvedCompanionsCount >= (trigger.value ?? 1)) {
        conditionMet = true;
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
  }, [evolvedCompanionsCount, achievements, unlockAchievement]);
}
