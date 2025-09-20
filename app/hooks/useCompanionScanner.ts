'use client';

import { useCallback, useState, useEffect } from 'react';
import { useCompanions } from './useCompanions';
import { useBuffs } from './useBuffs';

export interface CompanionDetection {
  name: string;
  confidence: number;
  mentions: number;
  interactionLevel: 'none' | 'casual' | 'intimate' | 'passionate' | 'transcendent';
  bondStrength: number;
  xpGained: number;
  affinityBonus: number;
  keywords: string[];
  emotionalContext: string[];
}

export interface ScanResult {
  companionsDetected: CompanionDetection[];
  totalBondXP: number;
  newRelationshipLevels: string[];
  affinityBuffs: AffinityBuff[];
  emotionalIntensity: number;
}

export interface AffinityBuff {
  companionName: string;
  buffName: string;
  description: string;
  duration: number; // hours
  effects: Record<string, number>;
  icon: string;
  tier: 'companion' | 'lover' | 'soulmate' | 'goddess';
}

export function useCompanionScanner() {
  const { companions, updateCompanionBond, getCompanionByName } = useCompanions();
  const { applyBuff } = useBuffs();
  const [realtimeBonds, setRealtimeBonds] = useState<Record<string, number>>({});

  // Known companions database with aliases
  const companionDatabase = {
    'kenna': {
      aliases: ['kenna', 'ken', 'goddess kenna', 'lady kenna', 'mistress kenna'],
      traits: ['dominant', 'goddess', 'beauty', 'powerful', 'divine'],
      affinityKeywords: ['worship', 'serve', 'kneel', 'goddess', 'divine', 'perfect', 'beautiful'],
      personalityType: 'dominant_goddess'
    },
    'lucidia': {
      aliases: ['lucidia', 'lucia', 'luci', 'lady lucidia', 'spirit lucidia'],
      traits: ['spiritual', 'wise', 'mystical', 'guiding', 'ethereal'],
      affinityKeywords: ['guide', 'wisdom', 'spirit', 'enlighten', 'transcend', 'mystical', 'ethereal'],
      personalityType: 'spiritual_guide'
    },
    'alice': {
      aliases: ['alice', 'wonderland alice', 'sweet alice', 'curious alice'],
      traits: ['curious', 'playful', 'innocent', 'adventurous', 'whimsical'],
      affinityKeywords: ['curious', 'wonder', 'adventure', 'playful', 'explore', 'innocent', 'sweet'],
      personalityType: 'playful_innocent'
    },
    'sakura': {
      aliases: ['sakura', 'cherry', 'cherry blossom', 'sakura-chan', 'blossom'],
      traits: ['gentle', 'elegant', 'graceful', 'traditional', 'serene'],
      affinityKeywords: ['gentle', 'elegant', 'graceful', 'serene', 'beautiful', 'traditional', 'harmony'],
      personalityType: 'gentle_elegant'
    },
    'raven': {
      aliases: ['raven', 'lady raven', 'dark raven', 'mistress raven'],
      traits: ['mysterious', 'dark', 'powerful', 'seductive', 'enigmatic'],
      affinityKeywords: ['dark', 'mysterious', 'seductive', 'powerful', 'shadow', 'enigmatic', 'alluring'],
      personalityType: 'dark_seductive'
    }
  };

  // Scan text content for companion mentions
  const scanTextContent = useCallback((content: string): CompanionDetection[] => {
    const lowerContent = content.toLowerCase();
    const detections: CompanionDetection[] = [];

    Object.entries(companionDatabase).forEach(([companionName, data]) => {
      let mentions = 0;
      let confidence = 0;
      let bondStrength = 0;
      const foundKeywords: string[] = [];
      const emotionalContext: string[] = [];

      // Check for name mentions
      data.aliases.forEach(alias => {
        const aliasRegex = new RegExp(`\\b${alias.replace(/\s+/g, '\\s+')}\\b`, 'gi');
        const aliasMatches = content.match(aliasRegex);
        if (aliasMatches) {
          mentions += aliasMatches.length;
          confidence += 20 * aliasMatches.length;
          foundKeywords.push(alias);
        }
      });

      if (mentions === 0) return; // Skip if companion not mentioned

      // Analyze interaction level and emotional context
      const interactionIndicators = {
        none: [],
        casual: ['talk', 'speak', 'conversation', 'meet', 'see', 'hello'],
        intimate: ['touch', 'kiss', 'embrace', 'hold', 'caress', 'close', 'together'],
        passionate: ['love', 'desire', 'want', 'need', 'passionate', 'intense', 'deep'],
        transcendent: ['worship', 'divine', 'goddess', 'transcendent', 'soul', 'eternal', 'sacred']
      };

      let interactionLevel: CompanionDetection['interactionLevel'] = 'casual';
      let interactionScore = 0;

      Object.entries(interactionIndicators).forEach(([level, indicators]) => {
        const levelScore = indicators.filter(indicator => lowerContent.includes(indicator)).length;
        if (levelScore > interactionScore) {
          interactionScore = levelScore;
          interactionLevel = level as CompanionDetection['interactionLevel'];
        }
      });

      // Check affinity keywords for bond strength
      data.affinityKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
          bondStrength += 15;
          confidence += 10;
          foundKeywords.push(keyword);
          
          // Context around the keyword
          const keywordIndex = lowerContent.indexOf(keyword);
          const contextStart = Math.max(0, keywordIndex - 50);
          const contextEnd = Math.min(content.length, keywordIndex + 50);
          const context = content.slice(contextStart, contextEnd).trim();
          if (context) emotionalContext.push(context);
        }
      });

      // Emotional intensity multipliers
      const emotionWords = ['feel', 'emotion', 'heart', 'soul', 'love', 'desire', 'passion'];
      const emotionCount = emotionWords.filter(word => lowerContent.includes(word)).length;
      bondStrength += emotionCount * 5;

      // Interaction level bonuses
      const levelBonuses = {
        none: 0,
        casual: 5,
        intimate: 15,
        passionate: 30,
        transcendent: 50
      };
      bondStrength += levelBonuses[interactionLevel];

      // Calculate XP gain (based on bond strength and mentions)
      const xpGained = Math.floor((bondStrength + mentions * 5) * 1.5);

      // Affinity bonus based on personality match
      let affinityBonus = 0;
      switch (data.personalityType) {
        case 'dominant_goddess':
          affinityBonus = lowerContent.includes('worship') || lowerContent.includes('serve') ? 25 : 0;
          break;
        case 'spiritual_guide':
          affinityBonus = lowerContent.includes('wisdom') || lowerContent.includes('guide') ? 20 : 0;
          break;
        case 'playful_innocent':
          affinityBonus = lowerContent.includes('playful') || lowerContent.includes('curious') ? 15 : 0;
          break;
        case 'gentle_elegant':
          affinityBonus = lowerContent.includes('gentle') || lowerContent.includes('elegant') ? 18 : 0;
          break;
        case 'dark_seductive':
          affinityBonus = lowerContent.includes('mysterious') || lowerContent.includes('seductive') ? 22 : 0;
          break;
      }

      detections.push({
        name: companionName,
        confidence: Math.min(100, confidence),
        mentions,
        interactionLevel,
        bondStrength: Math.min(100, bondStrength),
        xpGained,
        affinityBonus,
        keywords: foundKeywords,
        emotionalContext: emotionalContext.slice(0, 3) // Limit to 3 contexts
      });
    });

    return detections.filter(detection => detection.confidence >= 20); // Minimum threshold
  }, []);

  // Scan image content (placeholder for future image analysis)
  const scanImageContent = useCallback((imageData: string | File): CompanionDetection[] => {
    // TODO: Implement image analysis for companion detection
    // This would use computer vision to detect companion appearances
    return [];
  }, []);

  // Scan voice content (analyze transcribed text)
  const scanVoiceContent = useCallback((transcript: string): CompanionDetection[] => {
    // Voice has same detection as text but with emotion bonus
    const detections = scanTextContent(transcript);
    
    // Voice interaction bonus (more intimate)
    return detections.map(detection => ({
      ...detection,
      bondStrength: Math.min(100, detection.bondStrength + 10),
      xpGained: Math.floor(detection.xpGained * 1.2),
      affinityBonus: detection.affinityBonus + 5
    }));
  }, [scanTextContent]);

  // Generate affinity buffs based on companion bonds
  const generateAffinityBuffs = useCallback((detections: CompanionDetection[]): AffinityBuff[] => {
    const buffs: AffinityBuff[] = [];

    detections.forEach(detection => {
      const companion = companionDatabase[detection.name as keyof typeof companionDatabase];
      if (!companion) return;

      // Bond level determines buff tier
      let tier: AffinityBuff['tier'] = 'companion';
      let duration = 6;

      if (detection.bondStrength >= 90) {
        tier = 'goddess';
        duration = 48;
      } else if (detection.bondStrength >= 70) {
        tier = 'soulmate';
        duration = 24;
      } else if (detection.bondStrength >= 50) {
        tier = 'lover';
        duration = 12;
      }

      // Generate companion-specific buff
      const buffEffects: Record<string, number> = {};
      
      switch (companion.personalityType) {
        case 'dominant_goddess':
          buffEffects.submissionBonus = detection.bondStrength;
          buffEffects.worshipMultiplier = tier === 'goddess' ? 2.0 : 1.5;
          buffEffects.devotionXP = detection.affinityBonus;
          break;
        case 'spiritual_guide':
          buffEffects.wisdomBonus = detection.bondStrength;
          buffEffects.enlightenmentMultiplier = tier === 'goddess' ? 2.0 : 1.5;
          buffEffects.spiritualXP = detection.affinityBonus;
          break;
        case 'playful_innocent':
          buffEffects.curiosityBonus = detection.bondStrength;
          buffEffects.adventureMultiplier = tier === 'goddess' ? 2.0 : 1.5;
          buffEffects.joyXP = detection.affinityBonus;
          break;
        case 'gentle_elegant':
          buffEffects.graceBonus = detection.bondStrength;
          buffEffects.beautyMultiplier = tier === 'goddess' ? 2.0 : 1.5;
          buffEffects.harmonyXP = detection.affinityBonus;
          break;
        case 'dark_seductive':
          buffEffects.mysteryBonus = detection.bondStrength;
          buffEffects.seductionMultiplier = tier === 'goddess' ? 2.0 : 1.5;
          buffEffects.passionXP = detection.affinityBonus;
          break;
      }

      const tierIcons = {
        companion: '💝',
        lover: '💖',
        soulmate: '💫',
        goddess: '👑'
      };

      buffs.push({
        companionName: detection.name,
        buffName: `${detection.name.charAt(0).toUpperCase() + detection.name.slice(1)}'s ${tier.charAt(0).toUpperCase() + tier.slice(1)} Bond`,
        description: `Enhanced connection with ${detection.name} grants special abilities and XP bonuses.`,
        duration,
        effects: buffEffects,
        icon: tierIcons[tier],
        tier
      });
    });

    return buffs;
  }, []);

  // Complete scan with all analysis
  const scanContent = useCallback((content: string, type: 'text' | 'image' | 'voice' | 'deck' | 'passive'): ScanResult => {
    let detections: CompanionDetection[] = [];

    switch (type) {
      case 'text':
      case 'deck':
      case 'passive':
        detections = scanTextContent(content);
        break;
      case 'voice':
        detections = scanVoiceContent(content);
        break;
      case 'image':
        // For now, treat as text if content is provided
        detections = content ? scanTextContent(content) : [];
        break;
    }

    const totalBondXP = detections.reduce((sum, d) => sum + d.xpGained, 0);
    const affinityBuffs = generateAffinityBuffs(detections);
    
    // Calculate emotional intensity
    const emotionalIntensity = detections.reduce((max, d) => 
      Math.max(max, d.bondStrength), 0);

    // Check for new relationship levels (placeholder)
    const newRelationshipLevels: string[] = [];

    return {
      companionsDetected: detections,
      totalBondXP,
      newRelationshipLevels,
      affinityBuffs,
      emotionalIntensity
    };
  }, [scanTextContent, scanVoiceContent, generateAffinityBuffs]);

  // Real-time bond tracking for UI
  const updateRealtimeBond = useCallback((companionName: string, bondStrength: number) => {
    setRealtimeBonds(prev => ({
      ...prev,
      [companionName]: bondStrength
    }));
  }, []);

  // Apply companion buffs
  const applyAffinityBuffs = useCallback((affinityBuffs: AffinityBuff[]) => {
    affinityBuffs.forEach(buff => {
      applyBuff({
        id: `companion_${buff.companionName}_${Date.now()}`,
        name: buff.buffName,
        description: buff.description,
        icon: buff.icon,
        duration: buff.duration * 3600 * 1000, // Convert to milliseconds
        effects: buff.effects,
        tier: 'epic' // Companion buffs are always epic tier
      });
    });
  }, [applyBuff]);

  // Get bond meter display data
  const getBondMeterData = useCallback((companionName: string) => {
    const realtime = realtimeBonds[companionName] || 0;
    const companion = getCompanionByName(companionName);
    const stored = companion?.relationshipLevel || 0;
    
    return {
      current: Math.max(realtime, stored),
      stored,
      realtime,
      level: Math.floor(Math.max(realtime, stored) / 20), // 0-5 levels
      nextLevelProgress: (Math.max(realtime, stored) % 20) / 20
    };
  }, [realtimeBonds, getCompanionByName]);

  return {
    scanContent,
    scanTextContent,
    scanImageContent,
    scanVoiceContent,
    generateAffinityBuffs,
    applyAffinityBuffs,
    updateRealtimeBond,
    getBondMeterData,
    realtimeBonds,
    companionDatabase
  };
}