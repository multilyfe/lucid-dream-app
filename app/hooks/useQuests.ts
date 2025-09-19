import { useState, useEffect, useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { useDreamJournal } from './useDreamJournal';
import { useShame } from './useShame';
import { useRitualsEngine } from './useRitualsEngine';
import { useInventory } from './useInventory';
import { useAchievements } from './useAchievements';
import { useBuffs } from './useBuffs';
import {
  Quest,
  QuestData,
  QuestStatus,
  QuestType,
  defaultQuestData,
  calculateQuestProgress,
  canCompleteQuest,
  isQuestExpired,
  checkAutoCompleteConditions,
  checkDreamQuestCompletion,
  checkIrlQuestCompletion
} from '../lib/quests';

// Import default quests from JSON
import defaultQuests from '../../data/quests.json';

export const useQuests = () => {
  const [questData, setQuestData] = usePersistentState<QuestData>('quests', () => ({
    ...defaultQuestData,
    quests: defaultQuests as Quest[]
  }));

  const [showRewardPopup, setShowRewardPopup] = useState<{
    quest: Quest;
    rewards: Quest['rewards'];
  } | null>(null);

  // Get external system hooks for auto-complete and integrations
  const { entries: journalEntries } = useDreamJournal();
  const { shame } = useShame();
  const { rituals, progressById: ritualProgress } = useRitualsEngine();
  const { awardXp, awardTokens } = useInventory();
  const { unlockAchievement } = useAchievements();
  const { addBuff } = useBuffs();

  // Get quests by status
  const activeQuests = questData.quests.filter(q => q.status === 'active');
  const completedQuests = questData.quests.filter(q => q.status === 'completed');
  const failedQuests = questData.quests.filter(q => q.status === 'failed');
  const lockedQuests = questData.quests.filter(q => q.status === 'locked');

  // Get quests by type
  const dreamQuests = questData.quests.filter(q => q.type === 'dream');
  const irlQuests = questData.quests.filter(q => q.type === 'irl');

  // Update quest step
  const updateQuestStep = useCallback((questId: string, stepId: string, done: boolean) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.id === questId) {
          const updatedSteps = quest.steps.map(step =>
            step.id === stepId ? { ...step, done } : step
          );
          
          const updatedQuest = {
            ...quest,
            steps: updatedSteps,
            updatedAt: new Date().toISOString()
          };

          // Check if quest can be completed
          if (canCompleteQuest(updatedQuest) && quest.status === 'active') {
            return completeQuest(updatedQuest);
          }

          return updatedQuest;
        }
        return quest;
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Complete a quest
  const completeQuest = useCallback((quest: Quest): Quest => {
    const completedQuest = {
      ...quest,
      status: 'completed' as QuestStatus,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Award XP and tokens
    if (quest.rewards.xp) {
      awardXp(quest.rewards.xp);
    }
    if (quest.rewards.tokens) {
      awardTokens(quest.rewards.tokens);
    }

    // Grant buffs and curses
    if (quest.rewards.buffs) {
      quest.rewards.buffs.forEach(buffId => {
        // Apply buff based on quest type
        if (quest.type === 'dream') {
          addBuff({
            name: 'Dream Quest Blessing',
            type: 'buff',
            desc: '+10% dream clarity from quest completion',
            duration: '24 hours',
            durationMs: 86400000,
            source: `Quest: ${quest.title}`,
            icon: '🌙',
            rarity: 'uncommon',
            effects: {
              dreamClarity: 0.1
            }
          });
        } else if (quest.type === 'irl') {
          addBuff({
            name: 'Obedience Reward',
            type: 'buff',
            desc: '+15% XP gain from submission',
            duration: '12 hours',
            durationMs: 43200000,
            source: `Quest: ${quest.title}`,
            icon: '🌸',
            rarity: 'rare',
            effects: {
              xpMultiplier: 0.15
            }
          });
        }
      });
    }

    // Unlock achievement
    if (quest.rewards.achievement) {
      unlockAchievement(quest.rewards.achievement);
    }

    // Check for quest-specific achievements
    // This triggers achievements that are unlocked by completing specific quests
    setTimeout(() => {
      checkQuestAchievements(quest.id);
    }, 200);

    // Show reward popup
    setShowRewardPopup({
      quest: completedQuest,
      rewards: quest.rewards
    });

    // Update quest data statistics
    setQuestData(prev => ({
      ...prev,
      questsCompleted: prev.questsCompleted + 1,
      totalXpEarned: prev.totalXpEarned + (quest.rewards.xp || 0),
      completedAchievements: quest.rewards.achievement 
        ? [...prev.completedAchievements, quest.rewards.achievement]
        : prev.completedAchievements
    }));

    // Unlock dependent quests
    setTimeout(() => {
      unlockDependentQuests(quest.id);
    }, 100);

    return completedQuest;
  }, [setQuestData, awardXp, awardTokens, addBuff, unlockAchievement]);

  // Check quest achievements
  const checkQuestAchievements = useCallback((questId: string) => {
    // This will be handled by the achievements system
    // The useAchievements hook should listen for quest completion events
    console.log(`Quest ${questId} completed - checking for related achievements`);
  }, []);

  // Fail a quest
  const failQuest = useCallback((questId: string, reason?: string) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.id === questId) {
          return {
            ...quest,
            status: 'failed' as QuestStatus,
            failedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return quest;
      });

      return {
        ...prev,
        quests: newQuests,
        questsFailed: prev.questsFailed + 1
      };
    });
  }, [setQuestData]);

  // Unlock dependent quests
  const unlockDependentQuests = useCallback((completedQuestId: string) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.status === 'locked' && quest.unlocks.includes(completedQuestId)) {
          return {
            ...quest,
            status: 'active' as QuestStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return quest;
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Start a quest
  const startQuest = useCallback((questId: string) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.id === questId && quest.status === 'locked') {
          return {
            ...quest,
            status: 'active' as QuestStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return quest;
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Abandon a quest
  const abandonQuest = useCallback((questId: string) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.id === questId && quest.status === 'active') {
          return {
            ...quest,
            status: 'locked' as QuestStatus,
            steps: quest.steps.map(step => ({ ...step, done: false })),
            updatedAt: new Date().toISOString()
          };
        }
        return quest;
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Reset a quest (for testing or admin purposes)
  const resetQuest = useCallback((questId: string) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.id === questId) {
          return {
            ...quest,
            status: 'active' as QuestStatus,
            steps: quest.steps.map(step => ({ ...step, done: false })),
            updatedAt: new Date().toISOString(),
            completedAt: undefined,
            failedAt: undefined
          };
        }
        return quest;
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Add a new quest
  const addQuest = useCallback((newQuest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const quest: Quest = {
      ...newQuest,
      id: `q${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setQuestData(prev => ({
      ...prev,
      quests: [...prev.quests, quest]
    }));

    return quest;
  }, [setQuestData]);

  // Delete a quest
  const deleteQuest = useCallback((questId: string) => {
    setQuestData(prev => ({
      ...prev,
      quests: prev.quests.filter(quest => quest.id !== questId)
    }));
  }, [setQuestData]);

  // Update a quest
  const updateQuest = useCallback((questId: string, updatedQuest: Quest) => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest =>
        quest.id === questId ? updatedQuest : quest
      );
      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Get quest by ID
  const getQuest = useCallback((questId: string): Quest | undefined => {
    return questData.quests.find(quest => quest.id === questId);
  }, [questData.quests]);

  // Check for expired quests
  const checkExpiredQuests = useCallback(() => {
    const now = Date.now();
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.status === 'active' && isQuestExpired(quest)) {
          return {
            ...quest,
            status: 'failed' as QuestStatus,
            failedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return quest;
      });

      const failedCount = newQuests.filter(q => 
        q.status === 'failed' && 
        !prev.quests.find(pq => pq.id === q.id && pq.status === 'failed')
      ).length;

      return {
        ...prev,
        quests: newQuests,
        questsFailed: prev.questsFailed + failedCount
      };
    });
  }, [setQuestData]);

  // Auto-complete quests based on other system data
  const checkAutoComplete = useCallback(() => {
    setQuestData(prev => {
      const newQuests = prev.quests.map(quest => {
        if (quest.status !== 'active') return quest;

        let hasAutoCompleted = false;
        let updatedSteps = [...quest.steps];

        // Use enhanced auto-completion logic
        if (quest.type === 'dream' && checkDreamQuestCompletion(quest, journalEntries)) {
          updatedSteps = updatedSteps.map(step => {
            if (!step.done) {
              hasAutoCompleted = true;
              return { ...step, done: true };
            }
            return step;
          });
        }

        if (quest.type === 'irl' && checkIrlQuestCompletion(quest, shame, rituals)) {
          updatedSteps = updatedSteps.map(step => {
            if (!step.done) {
              hasAutoCompleted = true;
              return { ...step, done: true };
            }
            return step;
          });
        }

        const updatedQuest = { ...quest, steps: updatedSteps };
        
        // If any steps were auto-completed and the quest can be completed, complete it
        if (hasAutoCompleted && canCompleteQuest(updatedQuest)) {
          return {
            ...updatedQuest,
            status: 'completed' as QuestStatus,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        
        return updatedQuest;
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData, journalEntries, shame, rituals]);

  // Generate recurring quests
  const generateRecurringQuests = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    const thisWeek = getWeekNumber(now);

    setQuestData(prev => {
      const newQuests = [...prev.quests];
      
      // Check for daily quests
      const dailyQuests = prev.quests.filter(q => q.recurring === 'daily');
      dailyQuests.forEach(quest => {
        const lastCompleted = quest.completedAt ? new Date(quest.completedAt).toDateString() : null;
        if (lastCompleted !== today && quest.status === 'completed') {
          // Reset daily quest
          newQuests.push({
            ...quest,
            id: `${quest.id}_${Date.now()}`,
            status: 'active' as QuestStatus,
            steps: quest.steps.map(step => ({ ...step, done: false })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: undefined
          });
        }
      });

      // Check for weekly quests
      const weeklyQuests = prev.quests.filter(q => q.recurring === 'weekly');
      weeklyQuests.forEach(quest => {
        const lastCompletedWeek = quest.completedAt ? getWeekNumber(new Date(quest.completedAt)) : null;
        if (lastCompletedWeek !== thisWeek && quest.status === 'completed') {
          // Reset weekly quest
          newQuests.push({
            ...quest,
            id: `${quest.id}_${Date.now()}`,
            status: 'active' as QuestStatus,
            steps: quest.steps.map(step => ({ ...step, done: false })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: undefined
          });
        }
      });

      return { ...prev, quests: newQuests };
    });
  }, [setQuestData]);

  // Utility function to get week number
  const getWeekNumber = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  // Close reward popup
  const closeRewardPopup = useCallback(() => {
    setShowRewardPopup(null);
  }, []);

  // Check for expired quests and auto-complete on mount and periodically
  useEffect(() => {
    checkExpiredQuests();
    generateRecurringQuests();
    checkAutoComplete();
    
    const interval = setInterval(() => {
      checkExpiredQuests();
      generateRecurringQuests();
      checkAutoComplete();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkExpiredQuests, generateRecurringQuests, checkAutoComplete]);

  // Advanced Quest Features
  
  // Daily/Weekly Quest Generation
  const generateDailyQuests = useCallback(() => {
    const { generateDailyQuestTemplates, createDailyQuest, shouldGenerateNewDailyQuests } = require('../lib/quests');
    
    // Check if we need to generate new daily quests
    const lastGenerated = localStorage.getItem('lastDailyQuestGeneration') || '2000-01-01';
    if (!shouldGenerateNewDailyQuests(lastGenerated)) return;
    
    const today = new Date();
    const templates = generateDailyQuestTemplates();
    
    // Remove old daily quests
    setQuestData(prev => ({
      ...prev,
      quests: prev.quests.filter(q => !(q.category === 'daily' && q.recurring === 'daily'))
    }));
    
    // Generate new daily quests
    const newQuests = templates.map(template => createDailyQuest(template, today));
    
    setQuestData(prev => ({
      ...prev,
      quests: [...prev.quests, ...newQuests]
    }));
    
    localStorage.setItem('lastDailyQuestGeneration', today.toISOString());
  }, [setQuestData]);

  const generateWeeklyQuests = useCallback(() => {
    const { generateWeeklyQuestTemplates, createWeeklyQuest, shouldGenerateNewWeeklyQuests } = require('../lib/quests');
    
    // Check if we need to generate new weekly quests
    const lastGenerated = localStorage.getItem('lastWeeklyQuestGeneration') || '2000-01-01';
    if (!shouldGenerateNewWeeklyQuests(lastGenerated)) return;
    
    const today = new Date();
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
    weekStart.setDate(diff);
    
    const templates = generateWeeklyQuestTemplates();
    
    // Remove old weekly quests
    setQuestData(prev => ({
      ...prev,
      quests: prev.quests.filter(q => !(q.category === 'weekly' && q.recurring === 'weekly'))
    }));
    
    // Generate new weekly quests
    const newQuests = templates.map(template => createWeeklyQuest(template, weekStart));
    
    setQuestData(prev => ({
      ...prev,
      quests: [...prev.quests, ...newQuests]
    }));
    
    localStorage.setItem('lastWeeklyQuestGeneration', today.toISOString());
  }, [setQuestData]);

  // Quest Chain Management
  const getQuestChain = useCallback((questlineId: string) => {
    const { getQuestlineChain } = require('../lib/quests');
    return getQuestlineChain(questlineId, questData.quests);
  }, [questData.quests]);

  const unlockNextQuestInChain = useCallback((questlineId: string, currentStep: number) => {
    const { getNextQuestInChain } = require('../lib/quests');
    const nextQuest = getNextQuestInChain(questlineId, currentStep, questData.quests);
    
    if (nextQuest && nextQuest.status === 'locked') {
      setQuestData(prev => ({
        ...prev,
        quests: prev.quests.map(q => 
          q.id === nextQuest.id 
            ? { ...q, status: 'active' as QuestStatus }
            : q
        )
      }));
    }
  }, [questData.quests, setQuestData]);

  const isChainCompleted = useCallback((questlineId: string) => {
    const { isQuestChainCompleted } = require('../lib/quests');
    return isQuestChainCompleted(questlineId, questData.quests);
  }, [questData.quests]);

  return {
    // Data
    questData,
    activeQuests,
    completedQuests,
    failedQuests,
    lockedQuests,
    dreamQuests,
    irlQuests,
    showRewardPopup,
    
    // Actions
    updateQuestStep,
    completeQuest,
    failQuest,
    startQuest,
    abandonQuest,
    resetQuest,
    addQuest,
    updateQuest,
    deleteQuest,
    getQuest,
    checkAutoComplete,
    closeRewardPopup,
    
    // Advanced Features
    generateDailyQuests,
    generateWeeklyQuests,
    getQuestChain,
    unlockNextQuestInChain,
    isChainCompleted,
    
    // Utils
    calculateQuestProgress,
    canCompleteQuest,
    isQuestExpired
  };
};