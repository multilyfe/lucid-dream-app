'use client';

import { usePersistentState } from './usePersistentState';
import defaultShame from '../../data/shame.json';
import { useCallback } from 'react';

export interface Confession {
  id: string;
  text: string;
  date: string;
}

export interface ShameState {
  pantiesSniffed: number;
  ritualsFailed: number;
  dirtyTokensBurned: number;
  confessions: Confession[];
}

export function useShame() {
  const [shame, setShame] = usePersistentState<ShameState>('shame', () => defaultShame);

  const addConfession = useCallback((text: string) => {
    const newConfession: Confession = {
      id: `c${Date.now()}`,
      text,
      date: new Date().toISOString().split('T')[0],
    };
    setShame(prev => ({
      ...prev,
      confessions: [...prev.confessions, newConfession],
    }));
  }, [setShame]);

  const incrementCounter = useCallback((counter: keyof ShameState, amount = 1) => {
    setShame(prev => {
      if (typeof prev[counter] === 'number') {
        return {
          ...prev,
          [counter]: (prev[counter] as number) + amount,
        };
      }
      return prev;
    });
  }, [setShame]);

  const resetShame = useCallback(() => {
    setShame(defaultShame);
  }, [setShame]);

  return {
    shame,
    addConfession,
    incrementCounter,
    resetShame,
  };
}
