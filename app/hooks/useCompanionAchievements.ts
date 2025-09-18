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
    if (!companions) return 0;
    // A companion is considered "evolved" if it has more than one form.
    return companions.filter(c => c.forms.length > 1).length;
  }, [companions]);

  useEffect(() => {
    // Don't run if achievements or companions haven't loaded yet
    if (!achievements || achievements.length === 0 || !companions) return;

    // Filter for only un-unlocked Companion achievements to check
    const companionAchievements = achievements.filter(
      a => !a.unlocked && a.category === 'Companion'
    );

    if (companionAchievements.length === 0) return;

    companionAchievements.forEach(achievement => {
      const { trigger } = achievement;
      let conditionMet = false;

      if (trigger.type === 'COMPANION_EVOLVED' && evolvedCompanionsCount >= trigger.value) {
        conditionMet = true;
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
    // This effect should re-run whenever the player's companions or achievements change.
  }, [evolvedCompanionsCount, achievements, unlockAchievement]);
}
