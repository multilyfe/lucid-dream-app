'use client';

import { useCallback, useEffect } from 'react';
import { usePersistentState } from './usePersistentState';
import defaultAchievements from '../../data/achievements.json';
import { type Achievement } from '../lib/achievements';
import { useShame } from './useShame';
import { useDungeons } from './useDungeons';
import { useCompanions } from './useCompanions';
import { useDreamJournal } from './useDreamJournal';
import { useRitualsEngine } from './useRitualsEngine';
import { usePunishments } from './usePunishments';
import { useInventory } from './useInventory';

// This would be a real toast library
const showToast = (message: string) => {
  console.log(`TOAST: ${message}`);
  // In a real app, you'd integrate a library like react-hot-toast here
};

export function useAchievements() {
  const [achievements, setAchievements] = usePersistentState<Achievement[]>('achievements', () => defaultAchievements as Achievement[]);
  const { shame } = useShame();
  const { dungeons } = useDungeons();
  const { companions } = useCompanions();
  const { entries } = useDreamJournal();
  const { progressById: ritualProgressById } = useRitualsEngine();
  const { activePunishments } = usePunishments();
  const { awardXp, awardTokens } = useInventory();

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const achievement = prev.find(a => a.id === achievementId);
      if (achievement && !achievement.unlocked) {
        showToast(`🏆 Achievement Unlocked: ${achievement.title}!`);
        
        // Grant rewards
        if (achievement.reward.xp) {
          awardXp(achievement.reward.xp);
        }
        if (achievement.reward.tokens) {
          awardTokens(achievement.reward.tokens);
        }
        // TODO: Add title reward logic

        return prev.map(a =>
          a.id === achievementId
            ? { ...a, unlocked: true, date: new Date().toISOString() }
            : a
        );
      }
      return prev;
    });
  }, [setAchievements, awardXp, awardTokens]);

  const triggerAchievement = useCallback((type: string, value?: any) => {
    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      const { trigger } = achievement;
      let conditionMet = false;

      if (trigger.type === type) {
        switch (trigger.type) {
          case 'MAP_NODE_UNLOCKED':
            if (trigger.value === value) {
              conditionMet = true;
            }
            break;
          case 'MAP_ALL_NODES_UNLOCKED':
            conditionMet = true; // The check is now done in the calling hook
            break;
          // other cases can be added here if needed for direct triggering
        }
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
  }, [achievements, unlockAchievement]);

  const checkTriggers = useCallback(() => {
    if (!achievements) return;
    achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      const { trigger } = achievement;
      let conditionMet = false;

      switch (trigger.type) {
        case 'SHAME_COUNTER':
          if (shame[trigger.counter] >= trigger.value) {
            conditionMet = true;
          }
          break;
        case 'DUNGEON_CLEARED':
          const clearedDungeons = dungeons.filter(d => d.completed).length;
          if (clearedDungeons >= trigger.value) {
            conditionMet = true;
          }
          break;
        case 'COMPANION_EVOLVED':
            const evolvedCompanions = companions.filter(c => (c.evolutionTree || c.forms || []).length > 1).length; // Simplified
            if (evolvedCompanions >= trigger.value) {
                conditionMet = true;
            }
            break;
        case 'DREAM_TAG':
            const hasTag = entries.some(e => e.tags.includes(trigger.value));
            if (hasTag) {
                conditionMet = true;
            }
            break;
        case 'CONFESSION_LOGGED':
            if (shame.confessions.length >= trigger.value) {
                conditionMet = true;
            }
            break;
        case 'RITUAL_COMPLETED':
            const completedRituals = Object.values(ritualProgressById).filter(p => p.completed).length;
            if (completedRituals >= trigger.value) {
                conditionMet = true;
            }
            break;
        case 'PUNISHMENT_TIER_REACHED':
            // Assuming tier is the number of active punishments
            if (activePunishments.length >= trigger.value) {
                conditionMet = true;
            }
            break;
      }

      if (conditionMet) {
        unlockAchievement(achievement.id);
      }
    });
  }, [achievements, shame, dungeons, companions, entries, ritualProgressById, activePunishments, unlockAchievement]);

  useEffect(() => {
    // Debounce or throttle this in a real app if it becomes expensive
    checkTriggers();
  }, [checkTriggers]);

  const addAchievement = (newAchievement: Omit<Achievement, 'unlocked' | 'date'>) => {
    const achievementToAdd: Achievement = {
      ...newAchievement,
      unlocked: false,
      date: null,
    };
    setAchievements(prev => [...prev, achievementToAdd]);
  };

  const resetAchievements = () => {
    setAchievements(defaultAchievements as Achievement[]);
  };

  return { achievements, unlockAchievement, addAchievement, resetAchievements, checkTriggers, triggerAchievement };
}
