'use client';

import { useEffect, useMemo } from 'react';
import { useAchievements } from './useAchievements';
import { useRitualsEngine } from './useRitualsEngine';

/**
 * A custom hook to manage ritual-related achievements.
 * It listens to changes in ritual progress and unlocks achievements when their triggers are met.
 */
export function useRitualAchievements() {
  const { achievements, unlockAchievement } = useAchievements();
  const { progressById } = useRitualsEngine();

  const completedRitualsCount = useMemo(() => {
    if (!progressById) return 0;
    // Count how many rituals have their 'completed' flag set to true.
    return Object.values(progressById).filter(p => p.completed).length;
  }, [progressById]);

  useEffect(() => {
    // Don't run if achievements or ritual progress haven't loaded yet
    if (!achievements || achievements.length === 0 || !progressById) return;

    // Filter for only un-unlocked Ritual achievements to check
    const ritualAchievements = achievements.filter(
      a => !a.unlocked && a.category === 'Ritual'
    );

    if (ritualAchievements.length === 0) return;

    ritualAchievements.forEach(achievement => {
      const { trigger } = achievement;
      let conditionMet = false;

      if (trigger.type === 'RITUAL_COMPLETED' && completedRitualsCount >= trigger.value) {
        conditionMet = true;
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
    // This effect should re-run whenever the player's ritual progress changes.
  }, [completedRitualsCount, achievements, unlockAchievement]);
}
