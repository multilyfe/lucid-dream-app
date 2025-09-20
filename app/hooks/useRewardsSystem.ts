'use client';

import { useCallback, useState } from 'react';
import { usePersistentState } from './usePersistentState';
import { useSimulationEngine } from './useSimulationEngine';
import { useBuffs } from './useBuffs';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'sessions' | 'lucidity' | 'companions' | 'dlc' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  condition: AchievementCondition;
  rewards: AchievementReward[];
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface AchievementCondition {
  type: 'session_count' | 'lucid_score' | 'total_xp' | 'companion_bond' | 'dlc_complete' | 'streak' | 'special';
  value: number;
  operator: 'gte' | 'eq' | 'lte';
  metadata?: Record<string, any>;
}

export interface AchievementReward {
  type: 'xp' | 'buff' | 'unlock' | 'badge' | 'title';
  value: any;
  duration?: number; // For buffs, in hours
}

export interface PlayerStats {
  totalSessions: number;
  totalXP: number;
  highestLucidScore: number;
  averageLucidScore: number;
  totalDuration: number;
  streakCurrent: number;
  streakLongest: number;
  companionBonds: Record<string, number>;
  dlcSagasCompleted: string[];
  firstSessionDate: string;
  lastSessionDate: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetValue: number;
  currentValue: number;
  category: string;
  rewards: AchievementReward[];
  isCompleted: boolean;
}

export function useRewardsSystem() {
  const [unlockedAchievements, setUnlockedAchievements] = usePersistentState<Achievement[]>('unlocked_achievements', () => []);
  const [playerStats, setPlayerStats] = usePersistentState<PlayerStats>('player_stats', () => ({
    totalSessions: 0,
    totalXP: 0,
    highestLucidScore: 0,
    averageLucidScore: 0,
    totalDuration: 0,
    streakCurrent: 0,
    streakLongest: 0,
    companionBonds: {},
    dlcSagasCompleted: [],
    firstSessionDate: '',
    lastSessionDate: ''
  }));
  const [milestones, setMilestones] = usePersistentState<Milestone[]>('milestones', () => []);
  
  const { applyBuff } = useBuffs();

  // Achievement definitions
  const achievementDefinitions: Achievement[] = [
    // Session Count Achievements
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Complete your first simulation session',
      icon: '🌟',
      category: 'sessions',
      tier: 'bronze',
      condition: { type: 'session_count', value: 1, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 100 },
        { type: 'badge', value: 'Beginner Explorer' }
      ]
    },
    {
      id: 'dedicated_dreamer',
      name: 'Dedicated Dreamer',
      description: 'Complete 10 simulation sessions',
      icon: '🎯',
      category: 'sessions',
      tier: 'silver',
      condition: { type: 'session_count', value: 10, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 500 },
        { type: 'buff', value: { name: 'Dedication Boost', icon: '🔥', effects: { xpMultiplier: 1.25 } }, duration: 24 }
      ]
    },
    {
      id: 'master_practitioner',
      name: 'Master Practitioner',
      description: 'Complete 50 simulation sessions',
      icon: '👑',
      category: 'sessions',
      tier: 'gold',
      condition: { type: 'session_count', value: 50, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 2000 },
        { type: 'title', value: 'Master Practitioner' },
        { type: 'buff', value: { name: 'Master\'s Focus', icon: '🧠', effects: { lucidBonus: 20, xpMultiplier: 1.5 } }, duration: 48 }
      ]
    },
    {
      id: 'legendary_voyager',
      name: 'Legendary Voyager',
      description: 'Complete 100 simulation sessions',
      icon: '🌌',
      category: 'sessions',
      tier: 'legendary',
      condition: { type: 'session_count', value: 100, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 5000 },
        { type: 'title', value: 'Legendary Voyager' },
        { type: 'unlock', value: 'special_mode_cosmic' }
      ]
    },

    // Lucidity Achievements
    {
      id: 'lucid_awakening',
      name: 'Lucid Awakening',
      description: 'Achieve a Lucid Imprint score of 70+',
      icon: '💫',
      category: 'lucidity',
      tier: 'bronze',
      condition: { type: 'lucid_score', value: 70, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 300 },
        { type: 'badge', value: 'Lucid Dreamer' }
      ]
    },
    {
      id: 'consciousness_master',
      name: 'Consciousness Master',
      description: 'Achieve a Lucid Imprint score of 90+',
      icon: '🧠',
      category: 'lucidity',
      tier: 'gold',
      condition: { type: 'lucid_score', value: 90, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 1000 },
        { type: 'buff', value: { name: 'Consciousness Mastery', icon: '🔮', effects: { lucidBonus: 25, realityControl: 50 } }, duration: 72 }
      ]
    },
    {
      id: 'transcendent_being',
      name: 'Transcendent Being',
      description: 'Achieve a perfect Lucid Imprint score of 100',
      icon: '✨',
      category: 'lucidity',
      tier: 'legendary',
      condition: { type: 'lucid_score', value: 100, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 3000 },
        { type: 'title', value: 'Transcendent Being' },
        { type: 'unlock', value: 'forbidden_techniques' }
      ]
    },

    // Companion Achievements
    {
      id: 'first_bond',
      name: 'First Bond',
      description: 'Form a bond with any companion',
      icon: '💖',
      category: 'companions',
      tier: 'bronze',
      condition: { type: 'companion_bond', value: 50, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 200 },
        { type: 'badge', value: 'Heart Connector' }
      ]
    },
    {
      id: 'soul_connection',
      name: 'Soul Connection',
      description: 'Reach 90+ bond strength with any companion',
      icon: '💫',
      category: 'companions',
      tier: 'gold',
      condition: { type: 'companion_bond', value: 90, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 1500 },
        { type: 'buff', value: { name: 'Soul Resonance', icon: '💞', effects: { companionXpBonus: 100, bondStrength: 25 } }, duration: 48 }
      ]
    },
    {
      id: 'harem_master',
      name: 'Harem Master',
      description: 'Form strong bonds (70+) with 3 different companions',
      icon: '👑',
      category: 'companions',
      tier: 'diamond',
      condition: { type: 'special', value: 3, operator: 'gte', metadata: { type: 'multiple_companion_bonds', threshold: 70 } },
      rewards: [
        { type: 'xp', value: 2500 },
        { type: 'title', value: 'Harem Master' },
        { type: 'unlock', value: 'multi_companion_scenes' }
      ]
    },

    // DLC Achievements
    {
      id: 'saga_explorer',
      name: 'Saga Explorer',
      description: 'Complete your first DLC saga',
      icon: '📚',
      category: 'dlc',
      tier: 'silver',
      condition: { type: 'dlc_complete', value: 1, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 750 },
        { type: 'unlock', value: 'saga_rewards_bonus' }
      ]
    },
    {
      id: 'saga_collector',
      name: 'Saga Collector',
      description: 'Complete 3 different DLC sagas',
      icon: '🗂️',
      category: 'dlc',
      tier: 'gold',
      condition: { type: 'dlc_complete', value: 3, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 2000 },
        { type: 'title', value: 'Saga Collector' }
      ]
    },

    // Streak Achievements
    {
      id: 'consistent_practice',
      name: 'Consistent Practice',
      description: 'Complete sessions on 7 consecutive days',
      icon: '🔥',
      category: 'special',
      tier: 'silver',
      condition: { type: 'streak', value: 7, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 600 },
        { type: 'buff', value: { name: 'Consistency Boost', icon: '📈', effects: { xpMultiplier: 1.3, streakBonus: 10 } }, duration: 168 }
      ]
    },
    {
      id: 'unwavering_devotion',
      name: 'Unwavering Devotion',
      description: 'Complete sessions on 30 consecutive days',
      icon: '💎',
      category: 'special',
      tier: 'diamond',
      condition: { type: 'streak', value: 30, operator: 'gte' },
      rewards: [
        { type: 'xp', value: 5000 },
        { type: 'title', value: 'Devoted Practitioner' },
        { type: 'unlock', value: 'special_devotion_rewards' }
      ]
    },

    // Special Achievements
    {
      id: 'midnight_dreamer',
      name: 'Midnight Dreamer',
      description: 'Complete a session between 12:00 AM and 3:00 AM',
      icon: '🌙',
      category: 'special',
      tier: 'bronze',
      condition: { type: 'special', value: 1, operator: 'gte', metadata: { type: 'time_range', start: 0, end: 3 } },
      rewards: [
        { type: 'xp', value: 250 },
        { type: 'badge', value: 'Night Owl' }
      ]
    },
    {
      id: 'voice_virtuoso',
      name: 'Voice Virtuoso',
      description: 'Complete 10 voice-mode sessions',
      icon: '🎙️',
      category: 'special',
      tier: 'silver',
      condition: { type: 'special', value: 10, operator: 'gte', metadata: { type: 'session_type', sessionType: 'voice' } },
      rewards: [
        { type: 'xp', value: 800 },
        { type: 'buff', value: { name: 'Voice Mastery', icon: '🔊', effects: { voiceBonus: 30, emotionMultiplier: 1.4 } }, duration: 36 }
      ]
    }
  ];

  // Check achievements based on current stats
  const checkAchievements = useCallback((newStats: Partial<PlayerStats>) => {
    const updatedStats = { ...playerStats, ...newStats };
    const newlyUnlocked: Achievement[] = [];

    achievementDefinitions.forEach(achievement => {
      // Skip if already unlocked
      if (unlockedAchievements.some(a => a.id === achievement.id)) return;

      let isUnlocked = false;

      switch (achievement.condition.type) {
        case 'session_count':
          isUnlocked = updatedStats.totalSessions >= achievement.condition.value;
          break;
        case 'lucid_score':
          isUnlocked = updatedStats.highestLucidScore >= achievement.condition.value;
          break;
        case 'total_xp':
          isUnlocked = updatedStats.totalXP >= achievement.condition.value;
          break;
        case 'companion_bond':
          isUnlocked = Object.values(updatedStats.companionBonds).some(bond => bond >= achievement.condition.value);
          break;
        case 'dlc_complete':
          isUnlocked = updatedStats.dlcSagasCompleted.length >= achievement.condition.value;
          break;
        case 'streak':
          isUnlocked = updatedStats.streakCurrent >= achievement.condition.value;
          break;
        case 'special':
          // Handle special conditions
          if (achievement.condition.metadata?.type === 'multiple_companion_bonds') {
            const strongBonds = Object.values(updatedStats.companionBonds)
              .filter(bond => bond >= achievement.condition.metadata!.threshold).length;
            isUnlocked = strongBonds >= achievement.condition.value;
          }
          break;
      }

      if (isUnlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date().toISOString()
        };
        newlyUnlocked.push(unlockedAchievement);
        
        // Apply rewards
        achievement.rewards.forEach(reward => {
          switch (reward.type) {
            case 'xp':
              updatedStats.totalXP += reward.value;
              break;
            case 'buff':
              applyBuff({
                id: `achievement_${achievement.id}`,
                name: reward.value.name,
                description: `Achievement reward: ${achievement.name}`,
                icon: reward.value.icon,
                duration: (reward.duration || 24) * 3600 * 1000,
                effects: reward.value.effects,
                tier: 'epic'
              });
              break;
            // Other reward types would be handled here
          }
        });
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
      setPlayerStats(updatedStats);
      return newlyUnlocked;
    }

    setPlayerStats(updatedStats);
    return [];
  }, [playerStats, unlockedAchievements, applyBuff, setUnlockedAchievements, setPlayerStats]);

  // Update stats after a session
  const updateStatsAfterSession = useCallback((sessionData: {
    lucidScore: number;
    xpGained: number;
    duration: number;
    companionBonds?: Record<string, number>;
    dlcSaga?: string;
    sessionType?: string;
  }) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastSession = playerStats.lastSessionDate ? new Date(playerStats.lastSessionDate) : null;
    const lastSessionDate = lastSession?.toISOString().split('T')[0];

    // Calculate streak
    let newStreak = playerStats.streakCurrent;
    if (lastSessionDate) {
      const daysDiff = Math.floor((now.getTime() - lastSession!.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Broke streak
        newStreak = 1;
      }
      // If same day, keep current streak
    } else {
      // First session
      newStreak = 1;
    }

    const newStats: Partial<PlayerStats> = {
      totalSessions: playerStats.totalSessions + 1,
      totalXP: playerStats.totalXP + sessionData.xpGained,
      highestLucidScore: Math.max(playerStats.highestLucidScore, sessionData.lucidScore),
      averageLucidScore: ((playerStats.averageLucidScore * playerStats.totalSessions) + sessionData.lucidScore) / (playerStats.totalSessions + 1),
      totalDuration: playerStats.totalDuration + sessionData.duration,
      streakCurrent: newStreak,
      streakLongest: Math.max(playerStats.streakLongest, newStreak),
      lastSessionDate: now.toISOString(),
      firstSessionDate: playerStats.firstSessionDate || now.toISOString()
    };

    // Update companion bonds
    if (sessionData.companionBonds) {
      const updatedBonds = { ...playerStats.companionBonds };
      Object.entries(sessionData.companionBonds).forEach(([companion, bond]) => {
        updatedBonds[companion] = Math.max(updatedBonds[companion] || 0, bond);
      });
      newStats.companionBonds = updatedBonds;
    }

    // Update completed DLC sagas
    if (sessionData.dlcSaga && !playerStats.dlcSagasCompleted.includes(sessionData.dlcSaga)) {
      newStats.dlcSagasCompleted = [...playerStats.dlcSagasCompleted, sessionData.dlcSaga];
    }

    return checkAchievements(newStats);
  }, [playerStats, checkAchievements]);

  // Get achievement progress
  const getAchievementProgress = useCallback((achievement: Achievement): { current: number; max: number; percentage: number } => {
    let current = 0;
    let max = achievement.condition.value;

    switch (achievement.condition.type) {
      case 'session_count':
        current = playerStats.totalSessions;
        break;
      case 'lucid_score':
        current = playerStats.highestLucidScore;
        break;
      case 'total_xp':
        current = playerStats.totalXP;
        break;
      case 'companion_bond':
        current = Math.max(...Object.values(playerStats.companionBonds), 0);
        break;
      case 'dlc_complete':
        current = playerStats.dlcSagasCompleted.length;
        break;
      case 'streak':
        current = playerStats.streakCurrent;
        break;
    }

    return {
      current: Math.min(current, max),
      max,
      percentage: Math.min((current / max) * 100, 100)
    };
  }, [playerStats]);

  // Get leaderboard data (placeholder - would need backend for real leaderboards)
  const getLeaderboardData = useCallback(() => {
    return {
      totalXP: { rank: 1, total: 1, percentile: 100 },
      highestLucidScore: { rank: 1, total: 1, percentile: 100 },
      longestStreak: { rank: 1, total: 1, percentile: 100 },
      achievements: { rank: 1, total: 1, percentile: 100 }
    };
  }, []);

  return {
    achievementDefinitions,
    unlockedAchievements,
    playerStats,
    milestones,
    updateStatsAfterSession,
    checkAchievements,
    getAchievementProgress,
    getLeaderboardData
  };
}