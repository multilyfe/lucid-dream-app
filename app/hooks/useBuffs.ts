'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistentState } from "./usePersistentState";

export interface BuffEffect {
  xpMultiplier?: number;
  bondMultiplier?: number;
  dreamClarity?: number;
  movementSpeed?: number;
  lucidXpMultiplier?: number;
  ritualSuccessRate?: number;
  obedienceGain?: number;
  tokenMultiplier?: number;
}

export interface Buff {
  id: string;
  name: string;
  type: 'buff' | 'curse';
  desc: string;
  duration: string;
  durationMs: number;
  createdAt: number;
  expiresAt: number;
  source: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effects: BuffEffect;
}

export interface ExpiredBuff extends Omit<Buff, 'durationMs' | 'createdAt' | 'expiresAt'> {
  expiredAt: number;
}

export interface BuffData {
  active: Buff[];
  history: ExpiredBuff[];
}

// Load initial data from JSON
import buffDataJson from "../../data/buffs.json";
const defaultBuffData: BuffData = buffDataJson as BuffData;

export function useBuffs() {
  const [buffData, setBuffData] = usePersistentState<BuffData>('buffData_v2', () => defaultBuffData);
  const [currentTime, setCurrentTime] = useState(Date.now());

  console.log('useBuffs Debug:', {
    buffData,
    defaultBuffData,
    activeCount: buffData?.active?.length || 0,
    historyCount: buffData?.history?.length || 0
  });

  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-expire buffs when they expire
  useEffect(() => {
    const now = Date.now();
    const expired = buffData.active.filter(buff => buff.expiresAt <= now);
    
    if (expired.length > 0) {
      const stillActive = buffData.active.filter(buff => buff.expiresAt > now);
      const expiredHistory: ExpiredBuff[] = expired.map(buff => ({
        id: buff.id,
        name: buff.name,
        type: buff.type,
        desc: buff.desc,
        duration: buff.duration,
        source: buff.source,
        icon: buff.icon,
        rarity: buff.rarity,
        effects: buff.effects,
        expiredAt: now
      }));

      setBuffData({
        active: stillActive,
        history: [...expiredHistory, ...buffData.history].slice(0, 50) // Keep last 50 history entries
      });
    }
  }, [currentTime, buffData.active, setBuffData, buffData.history]);

  // Calculate combined effects from all active buffs
  const calculateEffects = useCallback((): BuffEffect => {
    const effects: BuffEffect = {};
    
    buffData.active.forEach(buff => {
      Object.entries(buff.effects).forEach(([key, value]) => {
        const effectKey = key as keyof BuffEffect;
        
        if (typeof value === 'number') {
          if (effectKey.includes('Multiplier')) {
            // For multipliers, multiply them together
            effects[effectKey] = (effects[effectKey] || 1) * value;
          } else {
            // For additive effects, add them together
            effects[effectKey] = (effects[effectKey] || 0) + value;
          }
        }
      });
    });

    return effects;
  }, [buffData.active]);

  // Add a new buff
  const addBuff = useCallback((buffInput: Omit<Buff, 'id' | 'createdAt' | 'expiresAt'>) => {
    const now = Date.now();
    const newBuff: Buff = {
      ...buffInput,
      id: `${buffInput.type[0]}${now}`, // Generate unique ID
      createdAt: now,
      expiresAt: now + buffInput.durationMs
    };

    setBuffData(prev => ({
      ...prev,
      active: [...prev.active, newBuff]
    }));

    return newBuff.id;
  }, [setBuffData]);

  // Remove an active buff manually
  const removeBuff = useCallback((buffId: string) => {
    const buffToRemove = buffData.active.find(b => b.id === buffId);
    if (!buffToRemove) return false;

    const now = Date.now();
    const expiredBuff: ExpiredBuff = {
      id: buffToRemove.id,
      name: buffToRemove.name,
      type: buffToRemove.type,
      desc: buffToRemove.desc,
      duration: buffToRemove.duration,
      source: buffToRemove.source,
      icon: buffToRemove.icon,
      rarity: buffToRemove.rarity,
      effects: buffToRemove.effects,
      expiredAt: now
    };

    setBuffData(prev => ({
      active: prev.active.filter(b => b.id !== buffId),
      history: [expiredBuff, ...prev.history].slice(0, 50)
    }));

    return true;
  }, [buffData.active, setBuffData]);

  // Clear all expired buffs from history
  const clearHistory = useCallback(() => {
    setBuffData(prev => ({
      ...prev,
      history: []
    }));
  }, [setBuffData]);

  // Get time remaining for a buff
  const getTimeRemaining = useCallback((buff: Buff): number => {
    return Math.max(0, buff.expiresAt - currentTime);
  }, [currentTime]);

  // Get formatted time remaining
  const getFormattedTimeRemaining = useCallback((buff: Buff): string => {
    const remaining = getTimeRemaining(buff);
    
    if (remaining === 0) return 'Expired';
    
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, [getTimeRemaining]);

  // Get active buffs by type
  const getActiveBuffs = useCallback(() => {
    return buffData.active.filter(b => b.type === 'buff');
  }, [buffData.active]);

  const getActiveCurses = useCallback(() => {
    return buffData.active.filter(b => b.type === 'curse');
  }, [buffData.active]);

  // Get effect multiplier for specific effect type
  const getEffectMultiplier = useCallback((effectType: keyof BuffEffect): number => {
    const effects = calculateEffects();
    return effects[effectType] || (effectType.includes('Multiplier') ? 1 : 0);
  }, [calculateEffects]);

  // Legacy compatibility methods for existing code
  const applyEvent = useCallback((event: string, baseValue: number) => {
    const effects = calculateEffects();
    let multiplier = 1;
    
    switch (event) {
      case 'xp':
        multiplier = effects.xpMultiplier || 1;
        break;
      case 'obedience':
        multiplier = effects.obedienceGain || 1;
        break;
      case 'tokens':
        multiplier = effects.tokenMultiplier || 1;
        break;
      case 'clarity':
        multiplier = effects.dreamClarity || 1;
        break;
    }
    
    return Math.round(baseValue * multiplier);
  }, [calculateEffects]);

  return {
    // New API
    activeBuffs: getActiveBuffs(),
    activeCurses: getActiveCurses(),
    allActive: buffData.active,
    history: buffData.history,
    effects: calculateEffects(),
    getEffectMultiplier,
    addBuff,
    removeBuff,
    clearHistory,
    getTimeRemaining,
    getFormattedTimeRemaining,
    currentTime,
    totalActive: buffData.active.length,
    buffCount: getActiveBuffs().length,
    curseCount: getActiveCurses().length,
    historyCount: buffData.history.length,
    
    // Legacy compatibility for existing code
    buffs: buffData.active,
    applyEvent
  };
}
