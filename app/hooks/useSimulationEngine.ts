'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePersistentState } from './usePersistentState';
import { useInventory } from './useInventory';
import { useCompanions } from './useCompanions';
import { useBuffs } from './useBuffs';

// =================== CORE INTERFACES ===================

export type SimulationType = "text" | "image" | "deck" | "voice" | "passive";
export type SimulationState = "init" | "running" | "climax" | "resolution" | "completed";
export type BuffTier = "uncommon" | "rare" | "epic" | "legendary" | "forbidden";
export type DLCUnlockCondition = "streak" | "xp_total" | "companion_bond" | "buff_collection" | "manual";

export interface SimulationSession {
  id: string;
  type: SimulationType;
  dlcId?: string;
  sagaChapter?: string;
  timestamp: Date;
  state: SimulationState;
  duration: number; // milliseconds
  
  // Core Scores
  realismScore: number; // 0-100
  emotionScore: number; // 0-100
  climaxScore: number; // 0-100 (peak emotional intensity)
  companionBondScore: number; // 0-100
  lucidImprintScore: number; // 0-100 (how well it programs lucidity)
  
  // Content Data
  textContent?: string;
  imageSequence?: string[];
  deckCards?: string[];
  voiceTranscript?: string;
  audioFiles?: string[];
  
  // Reward Data
  xpEarned: number;
  buffsAwarded: string[];
  companionsDetected: string[];
  unlockablesEarned: string[];
  dreamTokens: number;
  
  // Metadata
  tags: string[];
  fusedRituals?: string[];
  difficultyMultiplier: number;
  vaultFile?: string;
}

export interface DLCSaga {
  id: string;
  name: string;
  description: string;
  theme: "erotic" | "spiritual" | "fantasy" | "psychological" | "cosmic" | "transformation";
  icon: string;
  banner?: string;
  
  // Unlock Requirements
  unlockCondition: DLCUnlockCondition;
  unlockValue: number;
  isUnlocked: boolean;
  
  // Gameplay Modifiers
  difficultyMultiplier: number;
  xpMultiplier: number;
  companionAffinityBonus: Record<string, number>;
  
  // Content Structure
  chapters: DLCChapter[];
  totalChapters: number;
  completedChapters: number;
  
  // Metadata
  author?: string;
  version: string;
  tags: string[];
  prerequisites?: string[];
}

export interface DLCChapter {
  id: string;
  name: string;
  description: string;
  type: SimulationType;
  
  // Content
  textPrompt?: string;
  imageSequence?: string[];
  deckDefinition?: CardDeck;
  audioScript?: string;
  passiveNarrative?: string;
  
  // Scoring Targets
  targetRealism: number;
  targetEmotion: number;
  targetClimax: number;
  targetBond: number;
  
  // Rewards
  baseXP: number;
  chapterBuffs: string[];
  unlockables: string[];
  
  // State
  isUnlocked: boolean;
  isCompleted: boolean;
  bestScore?: number;
  attempts: number;
}

export interface CardDeck {
  id: string;
  name: string;
  theme: string;
  cards: SimulationCard[];
  drawMechanic: "sequential" | "random" | "weighted" | "guided";
}

export interface SimulationCard {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  emotionTriggers: string[];
  realismBonus: number;
  emotionBonus: number;
  companionHints?: string[];
  rarity: BuffTier;
}

export interface SimulationUnlockable {
  id: string;
  name: string;
  type: "dlc_chapter" | "companion_level" | "buff_collection" | "dream_skill" | "vault_achievement";
  description: string;
  icon: string;
  condition: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  value?: any;
}

export interface EmotionClimax {
  peakIntensity: number; // 0-100
  sustainedDuration: number; // seconds
  triggerMoments: string[];
  physiologicalMarkers: string[];
  companionInvolvement: Record<string, number>;
  climaxType: "gentle" | "intense" | "overwhelming" | "transcendent" | "forbidden";
}

export interface SimulationEngineData {
  sessions: SimulationSession[];
  dlcSagas: Record<string, DLCSaga>;
  unlockables: Record<string, SimulationUnlockable>;
  
  // Global Stats
  totalSessions: number;
  totalXpEarned: number;
  totalDuration: number; // milliseconds
  averageLucidImprint: number;
  
  // Streak Data
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  streakMultiplier: number;
  
  // Fusion Data
  fusionUnlocks: string[];
  masteryCombos: Record<string, number>;
  
  // DLC Progress
  dlcProgress: Record<string, number>; // percentage completed
  globalUnlockProgress: number;
}

// =================== ENGINE HOOKS ===================

export function useSimulationEngine() {
  const [engineData, setEngineData] = usePersistentState<SimulationEngineData>(
    'simulationEngine',
    () => ({
      sessions: [],
      dlcSagas: {},
      unlockables: {},
      totalSessions: 0,
      totalXpEarned: 0,
      totalDuration: 0,
      averageLucidImprint: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      streakMultiplier: 1.0,
      fusionUnlocks: [],
      masteryCombos: {},
      dlcProgress: {},
      globalUnlockProgress: 0
    })
  );

  const [activeSession, setActiveSession] = useState<SimulationSession | null>(null);
  const [currentDraft, setCurrentDraft] = usePersistentState<Partial<SimulationSession>>(
    'simulationDraft',
    () => ({})
  );

  const { awardXp } = useInventory();
  const { gainXpForCompanions } = useCompanions();
  const { addBuff } = useBuffs();

  // =================== SESSION MANAGEMENT ===================

  const createSession = useCallback((
    type: SimulationType,
    dlcId?: string,
    sagaChapter?: string
  ): SimulationSession => {
    const session: SimulationSession = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      dlcId,
      sagaChapter,
      timestamp: new Date(),
      state: "init",
      duration: 0,
      realismScore: 0,
      emotionScore: 0,
      climaxScore: 0,
      companionBondScore: 0,
      lucidImprintScore: 0,
      xpEarned: 0,
      buffsAwarded: [],
      companionsDetected: [],
      unlockablesEarned: [],
      dreamTokens: 0,
      tags: [],
      difficultyMultiplier: dlcId ? engineData.dlcSagas[dlcId]?.difficultyMultiplier || 1.0 : 1.0
    };

    setActiveSession(session);
    return session;
  }, [engineData.dlcSagas]);

  const updateSessionState = useCallback((sessionId: string, updates: Partial<SimulationSession>) => {
    setActiveSession(prev => prev?.id === sessionId ? { ...prev, ...updates } : prev);
  }, []);

  const completeSession = useCallback((session: SimulationSession) => {
    const completedSession = { ...session, state: "completed" as SimulationState };
    
    setEngineData(prev => {
      const updated = { ...prev };
      
      // Add session to history
      updated.sessions = [completedSession, ...prev.sessions];
      
      // Update global stats
      updated.totalSessions += 1;
      updated.totalXpEarned += session.xpEarned;
      updated.totalDuration += session.duration;
      updated.averageLucidImprint = updated.sessions.reduce((sum, s) => sum + s.lucidImprintScore, 0) / updated.sessions.length;
      
      // Update streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (!prev.lastSessionDate || prev.lastSessionDate === yesterday) {
        updated.currentStreak = prev.lastSessionDate === yesterday ? prev.currentStreak + 1 : 1;
      } else if (prev.lastSessionDate !== today) {
        updated.currentStreak = 1;
      }
      
      updated.lastSessionDate = today;
      updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);
      updated.streakMultiplier = 1.0 + (updated.currentStreak * 0.1);
      
      // Update DLC progress
      if (session.dlcId && updated.dlcSagas[session.dlcId]) {
        const saga = updated.dlcSagas[session.dlcId];
        const completedChapters = saga.chapters.filter(ch => ch.isCompleted).length;
        updated.dlcProgress[session.dlcId] = (completedChapters / saga.totalChapters) * 100;
      }
      
      return updated;
    });

    // Award XP and buffs
    if (session.xpEarned > 0) {
      awardXp(session.xpEarned);
    }

    // Award companion XP
    session.companionsDetected.forEach(companionId => {
      gainXpForCompanions([companionId], Math.floor(session.xpEarned * 0.3));
    });

    // Grant buffs
    session.buffsAwarded.forEach(buffId => {
      addBuff({
        id: `sim-${buffId}-${Date.now()}`,
        name: buffId,
        description: `Simulation-earned buff from ${session.type} session`,
        icon: getBuffIcon(buffId),
        durationMs: getBuffDuration(buffId) * 60 * 60 * 1000,
        source: 'Simulation Engine',
        rarity: getBuffTier(buffId),
        effects: getBuffEffects(buffId)
      });
    });

    setActiveSession(null);
    setCurrentDraft({});
    
    return completedSession;
  }, [setEngineData, awardXp, gainXpForCompanions, addBuff]);

  // =================== DLC MANAGEMENT ===================

  const loadDLCSaga = useCallback((sagaData: DLCSaga) => {
    setEngineData(prev => ({
      ...prev,
      dlcSagas: {
        ...prev.dlcSagas,
        [sagaData.id]: sagaData
      }
    }));
  }, [setEngineData]);

  const unlockDLCSaga = useCallback((sagaId: string) => {
    setEngineData(prev => ({
      ...prev,
      dlcSagas: {
        ...prev.dlcSagas,
        [sagaId]: {
          ...prev.dlcSagas[sagaId],
          isUnlocked: true
        }
      }
    }));
  }, [setEngineData]);

  const completeChapter = useCallback((sagaId: string, chapterId: string, score: number) => {
    setEngineData(prev => {
      const updated = { ...prev };
      const saga = updated.dlcSagas[sagaId];
      
      if (saga) {
        const chapterIndex = saga.chapters.findIndex(ch => ch.id === chapterId);
        if (chapterIndex !== -1) {
          saga.chapters[chapterIndex] = {
            ...saga.chapters[chapterIndex],
            isCompleted: true,
            bestScore: Math.max(saga.chapters[chapterIndex].bestScore || 0, score),
            attempts: saga.chapters[chapterIndex].attempts + 1
          };
          
          saga.completedChapters = saga.chapters.filter(ch => ch.isCompleted).length;
          
          // Unlock next chapter
          if (chapterIndex + 1 < saga.chapters.length) {
            saga.chapters[chapterIndex + 1].isUnlocked = true;
          }
        }
      }
      
      return updated;
    });
  }, [setEngineData]);

  // =================== SCORING ALGORITHMS ===================

  const calculateLucidImprintScore = useCallback((session: Partial<SimulationSession>): number => {
    const { type, realismScore = 0, emotionScore = 0, climaxScore = 0, companionBondScore = 0 } = session;
    
    // Base calculation
    let score = (realismScore * 0.3) + (emotionScore * 0.3) + (climaxScore * 0.2) + (companionBondScore * 0.2);
    
    // Type multipliers
    const typeMultipliers = {
      text: 1.0,
      image: 0.9,
      deck: 0.8,
      voice: 1.1,
      passive: 0.7
    };
    
    score *= typeMultipliers[type as SimulationType] || 1.0;
    
    // Content quality bonuses
    if (session.textContent && session.textContent.length > 500) score += 5;
    if (session.companionsDetected && session.companionsDetected.length > 0) score += 10;
    if (session.fusedRituals && session.fusedRituals.length > 1) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }, []);

  const calculateXPReward = useCallback((session: Partial<SimulationSession>): number => {
    const lucidImprint = calculateLucidImprintScore(session);
    const baseXP = Math.floor(lucidImprint * 2);
    
    // Type bonuses
    const typeBonuses = {
      text: 20,
      image: 15,
      deck: 25,
      voice: 30,
      passive: 10
    };
    
    let totalXP = baseXP + (typeBonuses[session.type as SimulationType] || 0);
    
    // DLC multiplier
    if (session.dlcId && engineData.dlcSagas[session.dlcId]) {
      totalXP *= engineData.dlcSagas[session.dlcId].xpMultiplier;
    }
    
    // Streak multiplier
    totalXP *= engineData.streakMultiplier;
    
    // Duration bonus
    if (session.duration && session.duration > 600000) { // 10+ minutes
      totalXP *= 1.2;
    }
    
    return Math.floor(totalXP);
  }, [calculateLucidImprintScore, engineData.dlcSagas, engineData.streakMultiplier]);

  const determineBuffRewards = useCallback((session: Partial<SimulationSession>): string[] => {
    const buffs: string[] = [];
    const lucidImprint = calculateLucidImprintScore(session);
    
    // Tier-based buff awards
    if (lucidImprint >= 90) {
      buffs.push("Forbidden Lucidity");
    } else if (lucidImprint >= 80) {
      buffs.push("Legendary Dream Mastery");
    } else if (lucidImprint >= 70) {
      buffs.push("Epic Lucid Control");
    } else if (lucidImprint >= 60) {
      buffs.push("Rare Dream Awareness");
    } else if (lucidImprint >= 40) {
      buffs.push("Uncommon Lucid Spark");
    }
    
    // Special condition buffs
    if (session.companionsDetected && session.companionsDetected.length >= 3) {
      buffs.push("Companion Harmony");
    }
    
    if (session.fusedRituals && session.fusedRituals.length >= 2) {
      buffs.push("Ritual Synergy");
    }
    
    if (session.climaxScore && session.climaxScore >= 95) {
      buffs.push("Transcendent Climax");
    }
    
    return buffs;
  }, [calculateLucidImprintScore]);

  // =================== UTILITY FUNCTIONS ===================

  const getDLCSagas = useCallback(() => Object.values(engineData.dlcSagas), [engineData.dlcSagas]);
  
  const getUnlockedSagas = useCallback(() => 
    Object.values(engineData.dlcSagas).filter(saga => saga.isUnlocked),
    [engineData.dlcSagas]
  );

  const getSessionHistory = useCallback((filters?: {
    type?: SimulationType;
    dlcId?: string;
    dateRange?: [Date, Date];
    minScore?: number;
  }) => {
    let sessions = engineData.sessions;
    
    if (filters) {
      if (filters.type) sessions = sessions.filter(s => s.type === filters.type);
      if (filters.dlcId) sessions = sessions.filter(s => s.dlcId === filters.dlcId);
      if (filters.minScore) sessions = sessions.filter(s => s.lucidImprintScore >= filters.minScore);
      if (filters.dateRange) {
        sessions = sessions.filter(s => 
          s.timestamp >= filters.dateRange![0] && s.timestamp <= filters.dateRange![1]
        );
      }
    }
    
    return sessions;
  }, [engineData.sessions]);

  const saveDraft = useCallback((updates: Partial<SimulationSession>) => {
    setCurrentDraft(prev => ({ ...prev, ...updates }));
  }, [setCurrentDraft]);

  return {
    // Core State
    engineData,
    activeSession,
    currentDraft,
    
    // Session Management
    createSession,
    updateSessionState,
    completeSession,
    saveDraft,
    
    // DLC Management
    loadDLCSaga,
    unlockDLCSaga,
    completeChapter,
    getDLCSagas,
    getUnlockedSagas,
    
    // Scoring & Rewards
    calculateLucidImprintScore,
    calculateXPReward,
    determineBuffRewards,
    
    // History & Analytics
    getSessionHistory,
    
    // Utility
    setEngineData
  };
}

// =================== HELPER FUNCTIONS ===================

function getBuffIcon(buffName: string): string {
  const iconMap: Record<string, string> = {
    "Forbidden Lucidity": "🌑",
    "Legendary Dream Mastery": "👑",
    "Epic Lucid Control": "🔮",
    "Rare Dream Awareness": "👁️",
    "Uncommon Lucid Spark": "✨",
    "Companion Harmony": "💫",
    "Ritual Synergy": "🌀",
    "Transcendent Climax": "🌟"
  };
  return iconMap[buffName] || "🎭";
}

function getBuffDuration(buffName: string): number {
  const durationMap: Record<string, number> = {
    "Forbidden Lucidity": 72,
    "Legendary Dream Mastery": 48,
    "Epic Lucid Control": 24,
    "Rare Dream Awareness": 12,
    "Uncommon Lucid Spark": 6,
    "Companion Harmony": 8,
    "Ritual Synergy": 16,
    "Transcendent Climax": 24
  };
  return durationMap[buffName] || 3;
}

function getBuffTier(buffName: string): BuffTier {
  if (buffName.includes("Forbidden")) return "forbidden";
  if (buffName.includes("Legendary")) return "legendary";
  if (buffName.includes("Epic")) return "epic";
  if (buffName.includes("Rare")) return "rare";
  return "uncommon";
}

function getBuffEffects(buffName: string) {
  const effectsMap: Record<string, any> = {
    "Forbidden Lucidity": { dreamClarity: 100, xpMultiplier: 3.0, companionXpBonus: 50 },
    "Legendary Dream Mastery": { dreamClarity: 75, xpMultiplier: 2.5, companionXpBonus: 40 },
    "Epic Lucid Control": { dreamClarity: 50, xpMultiplier: 2.0, companionXpBonus: 30 },
    "Rare Dream Awareness": { dreamClarity: 30, xpMultiplier: 1.5, companionXpBonus: 20 },
    "Uncommon Lucid Spark": { dreamClarity: 15, xpMultiplier: 1.2, companionXpBonus: 10 },
    "Companion Harmony": { companionXpBonus: 100, socialBonus: 25 },
    "Ritual Synergy": { xpMultiplier: 1.8, fusionBonus: 50 },
    "Transcendent Climax": { dreamClarity: 60, emotionBonus: 50, xpMultiplier: 2.2 }
  };
  return effectsMap[buffName] || { dreamClarity: 10, xpMultiplier: 1.1 };
}