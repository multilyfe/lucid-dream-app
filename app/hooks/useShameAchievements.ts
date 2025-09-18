'use client';

import { useEffect } from 'react';
import { useAchievements } from './useAchievements';
import { useShame } from './useShame';
import { usePunishments } from './usePunishments';

/**
 * A custom hook to manage shame-related achievements.
 * It listens to changes in shame state and unlocks achievements when their triggers are met.
 */
export function useShameAchievements() {
  const { achievements, unlockAchievement } = useAchievements();
  const { shame } = useShame();
  const { activePunishments } = usePunishments();

  useEffect(() => {
    // Don't run if achievements haven't loaded yet
    if (!achievements || achievements.length === 0) return;

    // Filter for only un-unlocked Shame achievements to check
    const shameAchievements = achievements.filter(
      a => !a.unlocked && a.category === 'Shame'
    );

    if (shameAchievements.length === 0) return;

    shameAchievements.forEach(achievement => {
      const { trigger } = achievement;
      let conditionMet = false;

      switch (trigger.type) {
        case 'SHAME_COUNTER':
          // Ensure the counter exists on the shame object before checking
          if (trigger.counter in shame && shame[trigger.counter] >= trigger.value) {
            conditionMet = true;
          }
          break;
        case 'CONFESSION_LOGGED':
          if (shame.confessions.length >= trigger.value) {
            conditionMet = true;
          }
          break;
        case 'PUNISHMENT_TIER_REACHED':
           // The tier is determined by the number of active punishments
          if (activePunishments.length >= trigger.value) {
            conditionMet = true;
          }
          break;
        default:
          // This achievement's trigger is not handled by this specific hook
          break;
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
    // This effect should re-run whenever the player's shame or punishment status changes.
  }, [shame, activePunishments, achievements, unlockAchievement]);
}
