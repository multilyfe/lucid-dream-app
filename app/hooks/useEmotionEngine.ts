'use client';

import { useCallback, useState } from 'react';
import { useSimulationEngine, type SimulationSession, type EmotionClimax, type BuffTier } from '../hooks/useSimulationEngine';

export interface EmotionAnalysis {
  realismScore: number;
  emotionScore: number;
  climaxScore: number;
  companionBondScore: number;
  lucidImprintScore: number;
  
  // Detailed analysis
  emotionIntensity: 'gentle' | 'moderate' | 'intense' | 'overwhelming' | 'transcendent';
  climaxType: 'gentle' | 'intense' | 'overwhelming' | 'transcendent' | 'forbidden';
  dominantEmotions: string[];
  triggerMoments: string[];
  companionInvolvement: Record<string, number>;
  
  // Rewards
  xpReward: number;
  buffsEarned: BuffReward[];
  dreamTokens: number;
  unlockables: string[];
}

export interface BuffReward {
  id: string;
  name: string;
  tier: BuffTier;
  duration: number; // hours
  description: string;
  icon: string;
  effects: Record<string, any>;
  rarity: BuffTier;
}

export function useEmotionEngine() {
  const { calculateLucidImprintScore, calculateXPReward, determineBuffRewards } = useSimulationEngine();

  // Analyze emotion patterns in text content
  const analyzeEmotionPattern = useCallback((content: string): {
    emotionScore: number;
    climaxScore: number;
    dominantEmotions: string[];
    triggerMoments: string[];
  } => {
    const emotionKeywords = {
      // Physical sensations
      physical: ['touch', 'feel', 'sensation', 'trembling', 'shiver', 'warm', 'hot', 'cold', 'tingle', 'electric'],
      // Emotional states
      euphoric: ['euphoria', 'bliss', 'ecstasy', 'overwhelming', 'transcendent', 'divine', 'heavenly'],
      intense: ['intense', 'powerful', 'strong', 'deep', 'profound', 'overwhelming', 'consuming'],
      arousal: ['aroused', 'excited', 'desire', 'want', 'need', 'crave', 'lust', 'passion'],
      love: ['love', 'adore', 'cherish', 'devotion', 'worship', 'reverence', 'sacred'],
      submission: ['submit', 'surrender', 'obey', 'serve', 'kneel', 'worship', 'please'],
      // Climax indicators
      climax: ['climax', 'peak', 'crescendo', 'explosion', 'release', 'burst', 'waves', 'wash over']
    };

    const lowerContent = content.toLowerCase();
    let emotionScore = 0;
    let climaxScore = 0;
    const foundEmotions: string[] = [];
    const triggerMoments: string[] = [];

    // Analyze each emotion category
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword));
      if (matches.length > 0) {
        foundEmotions.push(emotion);
        emotionScore += matches.length * 5;
        
        // Special handling for climax indicators
        if (emotion === 'climax') {
          climaxScore += matches.length * 15;
          triggerMoments.push(...matches);
        }
        
        // High-intensity emotions boost climax
        if (['euphoric', 'intense', 'arousal'].includes(emotion)) {
          climaxScore += matches.length * 8;
        }
      }
    });

    // Length and detail bonus
    const wordCount = content.split(' ').length;
    emotionScore += Math.min(30, Math.floor(wordCount / 20));
    
    // First person present tense bonus (more immersive)
    const firstPersonIndicators = ['i am', 'i feel', 'i see', 'i hear', 'i touch', 'my body', 'my heart'];
    const firstPersonCount = firstPersonIndicators.filter(phrase => lowerContent.includes(phrase)).length;
    emotionScore += firstPersonCount * 5;

    // Sensory detail bonus
    const sensoryWords = ['see', 'hear', 'smell', 'taste', 'touch', 'feel'];
    const sensoryCount = sensoryWords.filter(word => lowerContent.includes(word)).length;
    emotionScore += sensoryCount * 3;

    return {
      emotionScore: Math.min(100, emotionScore),
      climaxScore: Math.min(100, climaxScore),
      dominantEmotions: foundEmotions.slice(0, 5),
      triggerMoments: triggerMoments.slice(0, 3)
    };
  }, []);

  // Analyze realism based on detail and specificity
  const analyzeRealismScore = useCallback((content: string, type: string): number => {
    const lowerContent = content.toLowerCase();
    let realismScore = 0;

    // Detail indicators
    const detailKeywords = [
      'exactly', 'precisely', 'specifically', 'detailed', 'clear', 'vivid',
      'texture', 'temperature', 'pressure', 'rhythm', 'pattern', 'color',
      'sound', 'voice', 'whisper', 'breath', 'heartbeat', 'pulse'
    ];

    const detailCount = detailKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    realismScore += detailCount * 8;

    // Specific body part mentions (more realistic)
    const bodyParts = ['hands', 'fingers', 'lips', 'skin', 'hair', 'eyes', 'neck', 'shoulders'];
    const bodyCount = bodyParts.filter(part => lowerContent.includes(part)).length;
    realismScore += bodyCount * 5;

    // Environment descriptions
    const envKeywords = ['room', 'bed', 'floor', 'wall', 'window', 'light', 'shadow', 'space'];
    const envCount = envKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    realismScore += envCount * 4;

    // Time and sequence indicators
    const timeWords = ['then', 'next', 'after', 'before', 'while', 'during', 'suddenly', 'slowly'];
    const timeCount = timeWords.filter(word => lowerContent.includes(word)).length;
    realismScore += timeCount * 3;

    // Type-specific bonuses
    const typeMultipliers = {
      text: 1.0,
      image: 0.8,  // Less text detail possible
      deck: 0.9,
      voice: 1.1,  // Audio adds realism
      passive: 0.7
    };

    realismScore *= typeMultipliers[type as keyof typeof typeMultipliers] || 1.0;

    // Length bonus for detailed descriptions
    const wordCount = content.split(' ').length;
    if (wordCount > 200) realismScore += 10;
    if (wordCount > 500) realismScore += 10;

    return Math.min(100, realismScore);
  }, []);

  // Analyze companion involvement
  const analyzeCompanionBond = useCallback((content: string, companionsDetected: string[]): {
    companionBondScore: number;
    companionInvolvement: Record<string, number>;
  } => {
    const lowerContent = content.toLowerCase();
    let bondScore = 0;
    const involvement: Record<string, number> = {};

    companionsDetected.forEach(companion => {
      const companionName = companion.toLowerCase();
      
      // Count mentions
      const mentions = (lowerContent.match(new RegExp(companionName, 'g')) || []).length;
      let companionScore = mentions * 10;

      // Interaction indicators
      const interactions = ['with', 'together', 'embrace', 'kiss', 'touch', 'hold', 'love'];
      const interactionCount = interactions.filter(word => 
        lowerContent.includes(`${word} ${companionName}`) || 
        lowerContent.includes(`${companionName} ${word}`)
      ).length;
      
      companionScore += interactionCount * 15;

      // Emotional connection words
      const emotionalWords = ['love', 'adore', 'worship', 'desire', 'cherish', 'devoted'];
      const emotionalCount = emotionalWords.filter(word => 
        lowerContent.includes(word) && lowerContent.includes(companionName)
      ).length;
      
      companionScore += emotionalCount * 20;

      involvement[companion] = Math.min(100, companionScore);
      bondScore += companionScore;
    });

    // Average bond score across all companions
    const avgBondScore = companionsDetected.length > 0 
      ? bondScore / companionsDetected.length 
      : 0;

    return {
      companionBondScore: Math.min(100, avgBondScore),
      companionInvolvement: involvement
    };
  }, []);

  // Determine emotion intensity level
  const getEmotionIntensity = useCallback((emotionScore: number, climaxScore: number): EmotionAnalysis['emotionIntensity'] => {
    const totalIntensity = (emotionScore + climaxScore) / 2;
    
    if (totalIntensity >= 90) return 'transcendent';
    if (totalIntensity >= 75) return 'overwhelming';
    if (totalIntensity >= 60) return 'intense';
    if (totalIntensity >= 40) return 'moderate';
    return 'gentle';
  }, []);

  // Determine climax type
  const getClimaxType = useCallback((climaxScore: number, emotionScore: number): EmotionAnalysis['climaxType'] => {
    if (climaxScore >= 95 && emotionScore >= 90) return 'forbidden';
    if (climaxScore >= 85) return 'transcendent';
    if (climaxScore >= 70) return 'overwhelming';
    if (climaxScore >= 50) return 'intense';
    return 'gentle';
  }, []);

  // Create detailed buff rewards
  const createBuffRewards = useCallback((analysis: Partial<EmotionAnalysis>): BuffReward[] => {
    const buffs: BuffReward[] = [];
    const { lucidImprintScore = 0, climaxScore = 0, emotionScore = 0, companionBondScore = 0 } = analysis;

    // Tier-based main buffs
    if (lucidImprintScore >= 90) {
      buffs.push({
        id: 'forbidden_lucidity',
        name: 'Forbidden Lucidity',
        tier: 'forbidden',
        duration: 72,
        description: 'Absolute mastery over dream consciousness and reality manipulation.',
        icon: '🌑',
        rarity: 'forbidden',
        effects: { dreamClarity: 100, xpMultiplier: 3.0, companionXpBonus: 50, realityControl: 100 }
      });
    } else if (lucidImprintScore >= 80) {
      buffs.push({
        id: 'legendary_mastery',
        name: 'Legendary Dream Mastery',
        tier: 'legendary',
        duration: 48,
        description: 'Legendary control over dream states and consciousness.',
        icon: '👑',
        rarity: 'legendary',
        effects: { dreamClarity: 75, xpMultiplier: 2.5, companionXpBonus: 40, realityControl: 75 }
      });
    } else if (lucidImprintScore >= 70) {
      buffs.push({
        id: 'epic_control',
        name: 'Epic Lucid Control',
        tier: 'epic',
        duration: 24,
        description: 'Exceptional lucid dreaming abilities and consciousness control.',
        icon: '🔮',
        rarity: 'epic',
        effects: { dreamClarity: 50, xpMultiplier: 2.0, companionXpBonus: 30, realityControl: 50 }
      });
    } else if (lucidImprintScore >= 60) {
      buffs.push({
        id: 'rare_awareness',
        name: 'Rare Dream Awareness',
        tier: 'rare',
        duration: 12,
        description: 'Enhanced dream awareness and lucidity triggers.',
        icon: '👁️',
        rarity: 'rare',
        effects: { dreamClarity: 30, xpMultiplier: 1.5, companionXpBonus: 20, realityControl: 30 }
      });
    } else if (lucidImprintScore >= 40) {
      buffs.push({
        id: 'uncommon_spark',
        name: 'Uncommon Lucid Spark',
        tier: 'uncommon',
        duration: 6,
        description: 'Basic lucid dreaming enhancement and awareness boost.',
        icon: '✨',
        rarity: 'uncommon',
        effects: { dreamClarity: 15, xpMultiplier: 1.2, companionXpBonus: 10, realityControl: 15 }
      });
    }

    // Climax-specific buffs
    if (climaxScore >= 95) {
      buffs.push({
        id: 'transcendent_climax',
        name: 'Transcendent Climax',
        tier: 'legendary',
        duration: 24,
        description: 'Perfect emotional peak achievement with transcendent bliss.',
        icon: '🌟',
        rarity: 'legendary',
        effects: { emotionBonus: 50, climaxMastery: 100, blissMultiplier: 2.0 }
      });
    } else if (climaxScore >= 80) {
      buffs.push({
        id: 'euphoric_peak',
        name: 'Euphoric Peak',
        tier: 'epic',
        duration: 12,
        description: 'Intense emotional peak with euphoric enhancement.',
        icon: '💫',
        rarity: 'epic',
        effects: { emotionBonus: 30, climaxMastery: 50, blissMultiplier: 1.5 }
      });
    }

    // Companion bonding buffs
    if (companionBondScore >= 90) {
      buffs.push({
        id: 'soul_bond',
        name: 'Companion Soul Bond',
        tier: 'legendary',
        duration: 48,
        description: 'Deep spiritual connection with dream companions.',
        icon: '💫',
        rarity: 'legendary',
        effects: { companionXpBonus: 100, bondStrength: 100, loveMultiplier: 2.0 }
      });
    } else if (companionBondScore >= 70) {
      buffs.push({
        id: 'deep_connection',
        name: 'Deep Companion Connection',
        tier: 'epic',
        duration: 24,
        description: 'Strong emotional bond with dream companions.',
        icon: '💖',
        rarity: 'epic',
        effects: { companionXpBonus: 50, bondStrength: 50, loveMultiplier: 1.5 }
      });
    }

    // Emotion mastery buffs
    if (emotionScore >= 90) {
      buffs.push({
        id: 'emotion_master',
        name: 'Emotion Mastery',
        tier: 'epic',
        duration: 18,
        description: 'Perfect emotional control and intensity management.',
        icon: '🎭',
        rarity: 'epic',
        effects: { emotionBonus: 40, emotionalControl: 100, intensityBonus: 50 }
      });
    }

    return buffs;
  }, []);

  // Complete emotion analysis
  const analyzeSession = useCallback((session: Partial<SimulationSession>): EmotionAnalysis => {
    const content = session.textContent || session.voiceTranscript || '';
    const type = session.type || 'text';
    const companionsDetected = session.companionsDetected || [];

    // Core analysis
    const emotionData = analyzeEmotionPattern(content);
    const realismScore = session.realismScore || analyzeRealismScore(content, type);
    const companionData = analyzeCompanionBond(content, companionsDetected);
    
    // Calculate lucid imprint score
    const tempSession = {
      ...session,
      realismScore,
      emotionScore: emotionData.emotionScore,
      climaxScore: emotionData.climaxScore,
      companionBondScore: companionData.companionBondScore
    };
    
    const lucidImprintScore = calculateLucidImprintScore(tempSession);
    const xpReward = calculateXPReward(tempSession);

    // Create full analysis
    const analysis: EmotionAnalysis = {
      realismScore,
      emotionScore: emotionData.emotionScore,
      climaxScore: emotionData.climaxScore,
      companionBondScore: companionData.companionBondScore,
      lucidImprintScore,
      
      emotionIntensity: getEmotionIntensity(emotionData.emotionScore, emotionData.climaxScore),
      climaxType: getClimaxType(emotionData.climaxScore, emotionData.emotionScore),
      dominantEmotions: emotionData.dominantEmotions,
      triggerMoments: emotionData.triggerMoments,
      companionInvolvement: companionData.companionInvolvement,
      
      xpReward,
      buffsEarned: createBuffRewards({
        lucidImprintScore,
        climaxScore: emotionData.climaxScore,
        emotionScore: emotionData.emotionScore,
        companionBondScore: companionData.companionBondScore
      }),
      dreamTokens: lucidImprintScore >= 85 ? Math.floor(lucidImprintScore / 25) : 0,
      unlockables: []
    };

    return analysis;
  }, [analyzeEmotionPattern, analyzeRealismScore, analyzeCompanionBond, calculateLucidImprintScore, calculateXPReward, getEmotionIntensity, getClimaxType, createBuffRewards]);

  return {
    analyzeSession,
    analyzeEmotionPattern,
    analyzeRealismScore,
    analyzeCompanionBond,
    createBuffRewards,
    getEmotionIntensity,
    getClimaxType
  };
}