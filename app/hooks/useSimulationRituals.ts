'use client';

import { useCallback, useEffect } from 'react';
import { usePersistentState } from './usePersistentState';
import { useInventory } from './useInventory';
import { useCompanions } from './useCompanions';
import { useBuffs } from './useBuffs';

export interface SimulationRitual {
  id: string;
  title: string;
  timestamp: Date;
  type: "lucid_initiation" | "companion_encounter" | "self_transformation" | "erotic_simulation" | "flight" | "custom";
  realismScore: number; // 0-100%
  emotionScore: number; // 0-100%
  rewardXP: number;
  dreamToken?: boolean;
  buffGranted?: string;
  linkedCompanions?: string[];
  content: string; // immersive experience typed by the user
  tags: string[];
  vaultFile?: string;
  streakDay?: number;
  duration: number; // minutes spent on simulation
}

export interface SimulationTemplate {
  id: string;
  name: string;
  type: SimulationRitual['type'];
  icon: string;
  description: string;
  template: string;
  suggestedCompanions?: string[];
  baseRealism: number;
  baseEmotion: number;
}

export interface SimulationStreak {
  current: number;
  longest: number;
  lastSimulationDate: string | null;
  totalSimulations: number;
  streakStartDate: string | null;
}

export interface SimulationStats {
  totalSimulations: number;
  totalXpEarned: number;
  averageRealismScore: number;
  averageEmotionScore: number;
  favoriteType: SimulationRitual['type'] | null;
  totalDreamTokens: number;
  buffsGranted: number;
  companionEncounters: number;
}

export interface FeelingBooster {
  id: string;
  name: string;
  description: string;
  emotionBonus: number;
  realismBonus: number;
  category: 'physical' | 'emotional' | 'sensual' | 'transformation' | 'environment';
  icon: string;
}

const DEFAULT_TEMPLATES: SimulationTemplate[] = [
  {
    id: 'flight',
    name: 'Flight Mastery',
    type: 'flight',
    icon: '🕊️',
    description: 'Soar through the dreamscape with perfect control',
    template: "I realize I'm dreaming. I feel the shift in consciousness as lucidity floods my awareness. I leap into the air and begin to fly. The wind rushes past my face as I...",
    baseRealism: 70,
    baseEmotion: 80
  },
  {
    id: 'companion_summon',
    name: 'Companion Encounter',
    type: 'companion_encounter',
    icon: '👥',
    description: 'Manifest and interact with your dream companions',
    template: "I'm lucid now. I focus my intention and call out for my companion. The dream space shimmers and responds. [COMPANION_NAME] appears before me, looking exactly as I've imagined. They...",
    suggestedCompanions: ['all'],
    baseRealism: 60,
    baseEmotion: 85
  },
  {
    id: 'transformation',
    name: 'Self Transformation',
    type: 'self_transformation',
    icon: '🦋',
    description: 'Experience radical transformation of body and mind',
    template: "I become aware that I'm dreaming. I look at my hands and will them to change. I feel my body beginning to transform. The sensation is overwhelming as I become...",
    baseRealism: 65,
    baseEmotion: 90
  },
  {
    id: 'erotic_exploration',
    name: 'Erotic Simulation',
    type: 'erotic_simulation',
    icon: '💋',
    description: 'Explore intimate fantasies in the dream realm',
    template: "I'm lucid and the dream world responds to my desires. I feel incredibly aroused and confident. My body feels perfect, responsive. I encounter...",
    baseRealism: 75,
    baseEmotion: 95
  },
  {
    id: 'lucid_awakening',
    name: 'Lucid Initiation',
    type: 'lucid_initiation',
    icon: '🌙',
    description: 'Practice the moment of becoming lucid',
    template: "Something feels off. I pause and really look around. Wait... this is a dream! The realization hits me like a wave of electricity. I'm lucid! I feel the shift in consciousness as...",
    baseRealism: 80,
    baseEmotion: 70
  }
];

const FEELING_BOOSTERS: FeelingBooster[] = [
  // Physical sensations
  { id: 'wind', name: 'Wind on Skin', description: 'Cool breeze against your face', emotionBonus: 5, realismBonus: 10, category: 'physical', icon: '💨' },
  { id: 'warmth', name: 'Warm Body', description: 'Comfortable warmth spreading through you', emotionBonus: 8, realismBonus: 8, category: 'physical', icon: '🔥' },
  { id: 'weightless', name: 'Weightlessness', description: 'Floating sensation, gravity released', emotionBonus: 12, realismBonus: 15, category: 'physical', icon: '🪐' },
  { id: 'tingling', name: 'Electric Tingles', description: 'Energy coursing through your body', emotionBonus: 10, realismBonus: 8, category: 'physical', icon: '⚡' },
  
  // Emotional states
  { id: 'euphoria', name: 'Pure Euphoria', description: 'Overwhelming joy and bliss', emotionBonus: 20, realismBonus: 5, category: 'emotional', icon: '✨' },
  { id: 'confidence', name: 'Limitless Confidence', description: 'Feeling powerful and unstoppable', emotionBonus: 15, realismBonus: 10, category: 'emotional', icon: '💪' },
  { id: 'love', name: 'Unconditional Love', description: 'Heart overflowing with love', emotionBonus: 18, realismBonus: 7, category: 'emotional', icon: '💖' },
  { id: 'peace', name: 'Deep Peace', description: 'Profound tranquility and calm', emotionBonus: 12, realismBonus: 8, category: 'emotional', icon: '☮️' },
  
  // Sensual experiences
  { id: 'arousal', name: 'Intense Arousal', description: 'Waves of sexual energy', emotionBonus: 25, realismBonus: 15, category: 'sensual', icon: '🔥' },
  { id: 'pleasure', name: 'Orgasmic Waves', description: 'Pure physical pleasure', emotionBonus: 30, realismBonus: 20, category: 'sensual', icon: '🌊' },
  { id: 'submission', name: 'Sweet Submission', description: 'Surrendering control completely', emotionBonus: 20, realismBonus: 12, category: 'sensual', icon: '🎭' },
  { id: 'dominance', name: 'Total Control', description: 'Commanding the dream space', emotionBonus: 18, realismBonus: 15, category: 'sensual', icon: '👑' },
  
  // Transformation
  { id: 'gender_shift', name: 'Gender Fluidity', description: 'Body transforming into desired form', emotionBonus: 22, realismBonus: 18, category: 'transformation', icon: '🦋' },
  { id: 'power_surge', name: 'Superhuman Power', description: 'Incredible strength and abilities', emotionBonus: 16, realismBonus: 12, category: 'transformation', icon: '💥' },
  { id: 'shapeshifting', name: 'Perfect Shapeshifting', description: 'Body becoming exactly as desired', emotionBonus: 20, realismBonus: 20, category: 'transformation', icon: '🌀' },
  
  // Environment
  { id: 'cosmic', name: 'Cosmic Connection', description: 'One with the universe', emotionBonus: 18, realismBonus: 10, category: 'environment', icon: '🌌' },
  { id: 'nature', name: 'Nature Unity', description: 'Connected to all living things', emotionBonus: 15, realismBonus: 12, category: 'environment', icon: '🌿' },
  { id: 'sanctuary', name: 'Perfect Sanctuary', description: 'Safe, beautiful sacred space', emotionBonus: 12, realismBonus: 15, category: 'environment', icon: '🏛️' }
];

const DEFAULT_SIMULATION_DATA = {
  rituals: [] as SimulationRitual[],
  streak: {
    current: 0,
    longest: 0,
    lastSimulationDate: null,
    totalSimulations: 0,
    streakStartDate: null
  } as SimulationStreak,
  stats: {
    totalSimulations: 0,
    totalXpEarned: 0,
    averageRealismScore: 0,
    averageEmotionScore: 0,
    favoriteType: null,
    totalDreamTokens: 0,
    buffsGranted: 0,
    companionEncounters: 0
  } as SimulationStats
};

export function useSimulationRituals() {
  const [simulationData, setSimulationData] = usePersistentState(
    'simulationRituals',
    () => DEFAULT_SIMULATION_DATA
  );
  
  const [currentDraft, setCurrentDraft] = usePersistentState<Partial<SimulationRitual>>(
    'simulationDraft',
    () => ({})
  );

  // Import integration hooks
  const { awardXp } = useInventory();
  const { gainXpForCompanions, companions } = useCompanions();
  const { addBuff } = useBuffs();

  // Calculate XP reward based on scores and content
  const calculateXPReward = useCallback((realism: number, emotion: number, content: string, type: SimulationRitual['type']): number => {
    let baseXP = Math.floor((realism + emotion) / 2);
    
    // Type bonuses
    const typeBonus = {
      'lucid_initiation': 20,
      'flight': 15,
      'companion_encounter': 25,
      'self_transformation': 30,
      'erotic_simulation': 35,
      'custom': 10
    }[type];
    
    // Content length bonus (more detailed = more XP)
    const lengthBonus = Math.min(50, Math.floor(content.length / 50));
    
    // Companion mention bonus
    const companionBonus = companions.some(comp => 
      content.toLowerCase().includes(comp.name.toLowerCase())
    ) ? 20 : 0;
    
    // Emotion keywords bonus
    const emotionKeywords = ['feel', 'sensation', 'overwhelming', 'intense', 'pleasure', 'euphoria', 'energy'];
    const emotionBonus = emotionKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length * 5;
    
    return baseXP + typeBonus + lengthBonus + companionBonus + emotionBonus;
  }, [companions]);

  // Determine buff to grant based on simulation
  const determineBuff = useCallback((ritual: { type: SimulationRitual['type'], realismScore: number, emotionScore: number, content: string }): string | undefined => {
    const { type, realismScore, emotionScore, content } = ritual;
    
    // High performance simulations get better buffs
    const totalScore = realismScore + emotionScore;
    
    if (totalScore >= 160) {
      // Legendary buffs for exceptional simulations
      return {
        'lucid_initiation': 'Lucid Mastery',
        'flight': 'Wings of Dreams', 
        'companion_encounter': 'Companion Bond',
        'self_transformation': 'Shape Fluidity',
        'erotic_simulation': 'Erotic Confidence',
        'custom': 'Dream Architect'
      }[type];
    } else if (totalScore >= 120) {
      // Epic buffs for good simulations
      return {
        'lucid_initiation': 'Dream Awareness',
        'flight': 'Gravity Defiance',
        'companion_encounter': 'Social Magnetism', 
        'self_transformation': 'Body Confidence',
        'erotic_simulation': 'Sexual Energy',
        'custom': 'Creative Flow'
      }[type];
    } else if (totalScore >= 80) {
      // Basic buffs for decent simulations
      return 'Dream Muscle';
    }
    
    return undefined;
  }, []);

  // Create new simulation ritual
  const createSimulation = useCallback((ritual: Omit<SimulationRitual, 'id' | 'timestamp' | 'rewardXP' | 'buffGranted'>) => {
    const now = new Date();
    const rewardXP = calculateXPReward(ritual.realismScore, ritual.emotionScore, ritual.content, ritual.type);
    const buffGranted = determineBuff(ritual);
    
    const newRitual: SimulationRitual = {
      ...ritual,
      id: `simulation-${Date.now()}`,
      timestamp: now,
      rewardXP,
      buffGranted
    };

    setSimulationData(prev => {
      const updated = { ...prev };
      
      // Add ritual
      updated.rituals = [newRitual, ...prev.rituals];
      
      // Update streak
      const lastDate = prev.streak.lastSimulationDate;
      const today = now.toDateString();
      const yesterday = new Date(now.getTime() - 86400000).toDateString();
      
      if (!lastDate || lastDate === yesterday) {
        // Continue or start streak
        updated.streak.current = lastDate === yesterday ? prev.streak.current + 1 : 1;
        updated.streak.streakStartDate = prev.streak.streakStartDate || today;
      } else if (lastDate !== today) {
        // Streak broken
        updated.streak.current = 1;
        updated.streak.streakStartDate = today;
      }
      
      updated.streak.lastSimulationDate = today;
      updated.streak.longest = Math.max(updated.streak.longest, updated.streak.current);
      updated.streak.totalSimulations = prev.streak.totalSimulations + 1;
      
      // Update stats
      const allRituals = updated.rituals;
      updated.stats.totalSimulations = allRituals.length;
      updated.stats.totalXpEarned = allRituals.reduce((sum, r) => sum + r.rewardXP, 0);
      updated.stats.averageRealismScore = allRituals.reduce((sum, r) => sum + r.realismScore, 0) / allRituals.length;
      updated.stats.averageEmotionScore = allRituals.reduce((sum, r) => sum + r.emotionScore, 0) / allRituals.length;
      updated.stats.totalDreamTokens = allRituals.filter(r => r.dreamToken).length;
      updated.stats.buffsGranted = allRituals.filter(r => r.buffGranted).length;
      updated.stats.companionEncounters = allRituals.filter(r => r.type === 'companion_encounter').length;
      
      // Calculate favorite type
      const typeCounts = allRituals.reduce((counts, r) => {
        counts[r.type] = (counts[r.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      updated.stats.favoriteType = Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as SimulationRitual['type'] || null;
      
      return updated;
    });

    // Award global XP
    awardXp(rewardXP);
    
    // Award companion XP if companions were involved
    if (ritual.linkedCompanions && ritual.linkedCompanions.length > 0) {
      gainXpForCompanions('dream', 30);
    }
    
    // Grant buff if earned
    if (buffGranted) {
      addBuff({
        name: buffGranted,
        type: 'buff',
        desc: `+25% dream clarity from simulation mastery`,
        duration: '24 hours',
        durationMs: 24 * 60 * 60 * 1000,
        source: 'Simulation Ritual',
        icon: '🌙',
        rarity: 'rare',
        effects: {
          dreamClarity: 25,
          xpMultiplier: 1.1
        }
      });
    }
    
    // Special streak rewards
    const currentStreak = simulationData.streak.current + 1;
    if (currentStreak === 7) {
      // 7-day streak: Dream Possession buff
      addBuff({
        name: 'Dream Possession',
        type: 'buff', 
        desc: '+50% all dream-related gains, enhanced lucidity',
        duration: '7 days',
        durationMs: 7 * 24 * 60 * 60 * 1000,
        source: '7-Day Simulation Streak',
        icon: '👁️',
        rarity: 'legendary',
        effects: {
          dreamClarity: 50,
          xpMultiplier: 1.5,
          lucidXpMultiplier: 1.5
        }
      });
    }
    
    // Clear draft
    setCurrentDraft({});
    
    return newRitual;
  }, [simulationData.streak.current, calculateXPReward, determineBuff, setSimulationData, awardXp, gainXpForCompanions, addBuff, setCurrentDraft]);

  // Auto-save draft
  const saveDraft = useCallback((updates: Partial<SimulationRitual>) => {
    setCurrentDraft(prev => ({ ...prev, ...updates }));
  }, [setCurrentDraft]);

  // Get available templates
  const getTemplates = useCallback(() => DEFAULT_TEMPLATES, []);
  
  // Get feeling boosters
  const getFeelingBoosters = useCallback(() => FEELING_BOOSTERS, []);

  // Apply feeling booster to content
  const applyFeelingBooster = useCallback((content: string, booster: FeelingBooster): string => {
    const insertion = ` I ${booster.description.toLowerCase()}.`;
    return content + insertion;
  }, []);

  return {
    simulationData,
    currentDraft,
    createSimulation,
    saveDraft,
    getTemplates,
    getFeelingBoosters,
    applyFeelingBooster,
    calculateXPReward,
    determineBuff
  };
}