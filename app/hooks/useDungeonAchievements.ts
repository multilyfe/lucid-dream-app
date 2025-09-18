'use client';

import { useEffect } from 'react';
import { useAchievements } from './useAchievements';
import { useDungeons } from './useDungeons';

/**
 * A custom hook to manage dungeon-related achievements.
 * It listens to changes in dungeon state and unlocks achievements when their triggers are met.
 */
export function useDungeonAchievements() {
  const { achievements, unlockAchievement } = useAchievements();
  const { dungeons } = useDungeons();

  useEffect(() => {
    // Don't run if achievements or dungeons haven't loaded yet
    if (!achievements || achievements.length === 0 || !dungeons || dungeons.length === 0) return;

    // Filter for only un-unlocked Dungeon achievements to check
    const dungeonAchievements = achievements.filter(
      a => !a.unlocked && a.category === 'Dungeon'
    );

    if (dungeonAchievements.length === 0) return;

    const clearedDungeonsCount = dungeons.filter(d => d.completed).length;

    dungeonAchievements.forEach(achievement => {
      const { trigger } = achievement;
      let conditionMet = false;

      if (trigger.type === 'DUNGEON_CLEARED' && clearedDungeonsCount >= trigger.value) {
        conditionMet = true;
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
    // This effect should re-run whenever the player's dungeon progress changes.
  }, [dungeons, achievements, unlockAchievement]);
}
