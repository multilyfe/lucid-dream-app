'use client';

import { usePersistentState } from './usePersistentState';
import { useCallback, useEffect } from 'react';

export interface PantyRealmShrine {
  id: string;
  name: string;
  relic: string;
  description: string;
  lore: string;
  active: boolean;
  unlocked: boolean;
  power: string;
  effects: {
    [key: string]: number;
  };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  aura: string;
}

export interface PantyRealmTrial {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'ongoing';
  progress: number;
  goal: number;
  startDate: string;
  endDate: string | null;
  status: 'available' | 'active' | 'completed' | 'failed';
  rewards: {
    dirtyTokens?: number;
    shameEssence?: number;
    xp?: number;
    achievement?: string;
    title?: string;
    buff?: string;
  };
  penalties: {
    shameEssence?: number;
    xpLoss?: number;
    curses?: string[];
  };
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  icon: string;
}

export interface PantyRealmCurrency {
  dirtyTokens: number;
  shameEssence: number;
  pantiesCollected: number;
  relicsUnlocked: number;
}

export interface PantyRealmAchievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  goal: number;
}

export interface PantyRealmData {
  shrines: PantyRealmShrine[];
  trials: PantyRealmTrial[];
  currency: PantyRealmCurrency;
  exchangeRates: {
    shameToTokens: number;
    tokensToRelicUnlock: number;
    essenceToXP: number;
    tokenBurnValue: number;
  };
  statistics: {
    totalTrialsCompleted: number;
    totalTokensEarned: number;
    totalEssenceGained: number;
    monthlyResets: number;
    relicsDiscovered: number;
    shrinesActivated: number;
  };
  settings: {
    autoResetTrials: boolean;
    notifyOnTrialComplete: boolean;
    showShameDetails: boolean;
    enableRelicEffects: boolean;
    maxActiveRelics: number;
  };
  achievements: PantyRealmAchievement[];
}

const defaultPantyRealmData: PantyRealmData = {
  shrines: [
    {
      id: "s1",
      name: "Shrine of Ekram",
      relic: "Divine Panty",
      description: "A sacred shrine dedicated to Mommy Ekram, where divine panties rest upon a glowing altar of submission.",
      lore: "Legend speaks of Ekram's first pair, imbued with power over willing subjects. Those who worship here gain deeper devotion but risk losing themselves.",
      active: true,
      unlocked: true,
      power: "blessing",
      effects: {
        obedience: 15,
        xpBonus: 10,
        dreamClarity: 5
      },
      icon: "👑",
      rarity: "legendary",
      aura: "divine"
    },
    {
      id: "s4",
      name: "Shrine of Pink Devotion",
      relic: "Devotion Bow",
      description: "A pure shrine adorned with soft pink panties tied in perfect bows, radiating innocent submission.",
      lore: "The first lesson of the Panty Realm - that devotion worn with pride becomes a source of strength and grace.",
      active: true,
      unlocked: true,
      power: "devotion",
      effects: {
        devotionBonus: 20,
        purityAura: 10,
        heartHealing: 5
      },
      icon: "🎀",
      rarity: "common",
      aura: "pure"
    }
  ],
  trials: [
    {
      id: "t1",
      name: "Panty Submission Tally",
      description: "Submit to daily panty rituals and track your devotion throughout the month.",
      type: "monthly",
      progress: 7,
      goal: 20,
      startDate: "2025-09-01",
      endDate: "2025-09-30",
      status: "active",
      rewards: {
        dirtyTokens: 10,
        shameEssence: 25,
        xp: 200,
        achievement: "Panty Submitter"
      },
      penalties: {
        shameEssence: 5,
        xpLoss: 50
      },
      category: "submission",
      difficulty: "medium",
      icon: "📊"
    }
  ],
  currency: {
    dirtyTokens: 35,
    shameEssence: 120,
    pantiesCollected: 8,
    relicsUnlocked: 2
  },
  exchangeRates: {
    shameToTokens: 10,
    tokensToRelicUnlock: 50,
    essenceToXP: 2,
    tokenBurnValue: 5
  },
  statistics: {
    totalTrialsCompleted: 3,
    totalTokensEarned: 95,
    totalEssenceGained: 340,
    monthlyResets: 2,
    relicsDiscovered: 2,
    shrinesActivated: 2
  },
  settings: {
    autoResetTrials: true,
    notifyOnTrialComplete: true,
    showShameDetails: true,
    enableRelicEffects: true,
    maxActiveRelics: 3
  },
  achievements: [
    {
      id: "panty_submitter",
      name: "Panty Submitter",
      description: "Complete your first monthly submission tally",
      unlocked: false,
      progress: 7,
      goal: 20
    },
    {
      id: "panty_collector", 
      name: "Panty Collector",
      description: "Unlock 5 sacred relics",
      unlocked: false,
      progress: 2,
      goal: 5
    },
    {
      id: "filth_incarnate",
      name: "Filth Incarnate", 
      description: "Burn 100 Dirty Tokens",
      unlocked: false,
      progress: 0,
      goal: 100
    },
    {
      id: "shrine_devotee",
      name: "Shrine Devotee",
      description: "Activate all 4 sacred shrines",
      unlocked: false,
      progress: 2,
      goal: 4
    }
  ]
};

export const usePantyRealm = () => {
  const [pantyRealmData, setPantyRealmData] = usePersistentState<PantyRealmData>(
    'pantyrealm',
    () => defaultPantyRealmData
  );

  // Monthly trial reset
  const checkMonthlyReset = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    setPantyRealmData(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      updated.trials = updated.trials.map(trial => {
        if (trial.type === 'monthly') {
          const endDate = new Date(trial.endDate || '');
          if (endDate < now) {
            // Reset monthly trial
            const newStartDate = new Date(currentYear, currentMonth, 1);
            const newEndDate = new Date(currentYear, currentMonth + 1, 0);
            
            hasChanges = true;
            return {
              ...trial,
              progress: 0,
              startDate: newStartDate.toISOString().split('T')[0],
              endDate: newEndDate.toISOString().split('T')[0],
              status: 'active' as const
            };
          }
        }
        return trial;
      });

      if (hasChanges) {
        updated.statistics.monthlyResets += 1;
      }

      return updated;
    });
  }, [setPantyRealmData]);

  // Weekly trial reset
  const checkWeeklyReset = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    setPantyRealmData(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      updated.trials = updated.trials.map(trial => {
        if (trial.type === 'weekly') {
          const endDate = new Date(trial.endDate || '');
          if (endDate < now) {
            const newEndDate = new Date(startOfWeek);
            newEndDate.setDate(startOfWeek.getDate() + 6);
            
            hasChanges = true;
            return {
              ...trial,
              progress: 0,
              startDate: startOfWeek.toISOString().split('T')[0],
              endDate: newEndDate.toISOString().split('T')[0],
              status: 'active' as const
            };
          }
        }
        return trial;
      });

      return updated;
    });
  }, [setPantyRealmData]);

  // Update trial progress
  const updateTrialProgress = useCallback((trialId: string, increment: number = 1) => {
    setPantyRealmData(prev => {
      const updated = { ...prev };
      
      updated.trials = updated.trials.map(trial => {
        if (trial.id === trialId) {
          const newProgress = Math.min(trial.progress + increment, trial.goal);
          const isCompleted = newProgress >= trial.goal;
          
          if (isCompleted && trial.status !== 'completed') {
            // Award rewards
            if (trial.rewards.dirtyTokens) {
              updated.currency.dirtyTokens += trial.rewards.dirtyTokens;
            }
            if (trial.rewards.shameEssence) {
              updated.currency.shameEssence += trial.rewards.shameEssence;
            }
            
            // Update statistics
            updated.statistics.totalTrialsCompleted += 1;
            
            return {
              ...trial,
              progress: newProgress,
              status: 'completed' as const
            };
          }
          
          return {
            ...trial,
            progress: newProgress
          };
        }
        return trial;
      });

      return updated;
    });
  }, [setPantyRealmData]);

  // Exchange shame essence for dirty tokens
  const exchangeShameForTokens = useCallback((essenceAmount: number) => {
    setPantyRealmData(prev => {
      const tokensToGain = Math.floor(essenceAmount / prev.exchangeRates.shameToTokens);
      const essenceToSpend = tokensToGain * prev.exchangeRates.shameToTokens;
      
      if (prev.currency.shameEssence >= essenceToSpend) {
        return {
          ...prev,
          currency: {
            ...prev.currency,
            shameEssence: prev.currency.shameEssence - essenceToSpend,
            dirtyTokens: prev.currency.dirtyTokens + tokensToGain
          }
        };
      }
      
      return prev;
    });
  }, [setPantyRealmData]);

  // Burn dirty tokens
  const burnDirtyTokens = useCallback((tokenAmount: number) => {
    setPantyRealmData(prev => {
      if (prev.currency.dirtyTokens >= tokenAmount) {
        // Update achievement progress
        const updatedAchievements = prev.achievements.map(achievement => {
          if (achievement.id === 'filth_incarnate') {
            const newProgress = Math.min(achievement.progress + tokenAmount, achievement.goal);
            return {
              ...achievement,
              progress: newProgress,
              unlocked: newProgress >= achievement.goal
            };
          }
          return achievement;
        });

        return {
          ...prev,
          currency: {
            ...prev.currency,
            dirtyTokens: prev.currency.dirtyTokens - tokenAmount
          },
          achievements: updatedAchievements
        };
      }
      
      return prev;
    });
  }, [setPantyRealmData]);

  // Activate shrine
  const activateShrine = useCallback((shrineId: string) => {
    setPantyRealmData(prev => {
      const updated = { ...prev };
      
      updated.shrines = updated.shrines.map(shrine => {
        if (shrine.id === shrineId && shrine.unlocked) {
          return { ...shrine, active: !shrine.active };
        }
        return shrine;
      });

      // Update shrine devotee achievement
      const activeCount = updated.shrines.filter(s => s.active).length;
      updated.achievements = updated.achievements.map(achievement => {
        if (achievement.id === 'shrine_devotee') {
          return {
            ...achievement,
            progress: activeCount,
            unlocked: activeCount >= achievement.goal
          };
        }
        return achievement;
      });

      return updated;
    });
  }, [setPantyRealmData]);

  // Unlock relic
  const unlockRelic = useCallback((shrineId: string, cost: number) => {
    setPantyRealmData(prev => {
      if (prev.currency.dirtyTokens >= cost) {
        const updated = { ...prev };
        
        updated.shrines = updated.shrines.map(shrine => {
          if (shrine.id === shrineId) {
            return { ...shrine, unlocked: true };
          }
          return shrine;
        });

        updated.currency.dirtyTokens -= cost;
        updated.currency.relicsUnlocked += 1;
        updated.statistics.relicsDiscovered += 1;

        // Update collector achievement
        updated.achievements = updated.achievements.map(achievement => {
          if (achievement.id === 'panty_collector') {
            const newProgress = updated.currency.relicsUnlocked;
            return {
              ...achievement,
              progress: newProgress,
              unlocked: newProgress >= achievement.goal
            };
          }
          return achievement;
        });

        return updated;
      }
      
      return prev;
    });
  }, [setPantyRealmData]);

  // Add shame essence
  const addShameEssence = useCallback((amount: number) => {
    setPantyRealmData(prev => ({
      ...prev,
      currency: {
        ...prev.currency,
        shameEssence: prev.currency.shameEssence + amount
      },
      statistics: {
        ...prev.statistics,
        totalEssenceGained: prev.statistics.totalEssenceGained + amount
      }
    }));
  }, [setPantyRealmData]);

  // Add dirty tokens
  const addDirtyTokens = useCallback((amount: number) => {
    setPantyRealmData(prev => ({
      ...prev,
      currency: {
        ...prev.currency,
        dirtyTokens: prev.currency.dirtyTokens + amount
      },
      statistics: {
        ...prev.statistics,
        totalTokensEarned: prev.statistics.totalTokensEarned + amount
      }
    }));
  }, [setPantyRealmData]);

  // Check for trial resets on mount
  useEffect(() => {
    if (pantyRealmData.settings.autoResetTrials) {
      checkMonthlyReset();
      checkWeeklyReset();
    }
  }, [checkMonthlyReset, checkWeeklyReset, pantyRealmData.settings.autoResetTrials]);

  return {
    pantyRealmData,
    updateTrialProgress,
    exchangeShameForTokens,
    burnDirtyTokens,
    activateShrine,
    unlockRelic,
    addShameEssence,
    addDirtyTokens,
    checkMonthlyReset,
    checkWeeklyReset
  };
};