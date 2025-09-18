'use client';

import { useCallback, useMemo } from 'react';
import { usePersistentState } from './usePersistentState';
import { useInventory } from './useInventory';
import { useCompanions } from './useCompanions';
import { 
  DreamJournalEntry, 
  JournalStreak, 
  JournalStats, 
  JournalFilter,
  XpRewardConfig,
  DEFAULT_XP_CONFIG 
} from '../types/journal';
import journalData from '../../data/journal.json';

const JOURNAL_KEY = 'dreamJournal';
const STREAK_KEY = 'journalStreak';
const XP_CONFIG_KEY = 'journalXpConfig';
const ACHIEVEMENTS_KEY = 'journalAchievements';

export function useDreamJournal() {
  const [entries, setEntries] = usePersistentState<DreamJournalEntry[]>(
    JOURNAL_KEY, 
    () => journalData as DreamJournalEntry[]
  );
  
  const [streak, setStreak] = usePersistentState<JournalStreak>(
    STREAK_KEY,
    () => ({ current: 0, longest: 0, lastEntryDate: null })
  );
  
  const [xpConfig, setXpConfig] = usePersistentState<XpRewardConfig>(
    XP_CONFIG_KEY,
    () => DEFAULT_XP_CONFIG
  );
  
  const [achievements, setAchievements] = usePersistentState<string[]>(
    ACHIEVEMENTS_KEY,
    () => []
  );

  const { awardXp } = useInventory();
  const { gainXpForCompanions } = useCompanions();

  const calculateEntryXp = useCallback((entry: DreamJournalEntry): number => {
    let xp = xpConfig.baseEntry;
    
    entry.tags.forEach(tag => {
      switch (tag.toLowerCase()) {
        case 'lucid':
          xp += xpConfig.lucidTag;
          break;
        case 'ritual':
          xp += xpConfig.ritualTag;
          break;
        case 'panty':
          xp += xpConfig.pantyTag;
          break;
        case 'temple':
          xp += xpConfig.templeTag;
          break;
        case 'quest':
          xp += xpConfig.questTag;
          break;
      }
    });
    
    return xp;
  }, [xpConfig]);

  const updateStreak = useCallback((entryDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setStreak(prev => {
      let newCurrent = prev.current;
      let newLongest = prev.longest;
      
      if (prev.lastEntryDate === yesterday || prev.lastEntryDate === null) {
        newCurrent = prev.current + 1;
      } else if (prev.lastEntryDate !== today) {
        newCurrent = 1;
      }
      
      if (newCurrent > newLongest) {
        newLongest = newCurrent;
      }
      
      return {
        current: newCurrent,
        longest: newLongest,
        lastEntryDate: entryDate
      };
    });
    
    // Award streak bonus XP
    if (streak.current > 0) {
      const streakBonus = xpConfig.streakBonus * Math.min(streak.current, 10); // Cap bonus at 10 days
      awardXp(streakBonus);
      gainXpForCompanions('dream', streakBonus);
    }
  }, [streak.current, xpConfig.streakBonus, awardXp, setStreak, gainXpForCompanions]);

  const checkAchievements = useCallback((newEntries: DreamJournalEntry[]) => {
    const newAchievements: string[] = [];
    
    // First Entry
    if (newEntries.length === 1 && !achievements.includes('First Entry')) {
      newAchievements.push('First Entry');
      awardXp(50);
    }
    
    // 10-Day Streak
    if (streak.current >= 10 && !achievements.includes('10-Day Streak')) {
      newAchievements.push('10-Day Streak');
    }
    
    // 100 Dreams Logged
    if (newEntries.length >= 100 && !achievements.includes('100 Dreams Logged')) {
      newAchievements.push('100 Dreams Logged');
    }
    
    // Panty Dream Lord
    const pantyEntries = newEntries.filter(e => e.tags.includes('panty'));
    if (pantyEntries.length >= 50 && !achievements.includes('Panty Dream Lord')) {
      newAchievements.push('Panty Dream Lord');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [achievements, streak.current, awardXp, setAchievements]);

  const addEntry = useCallback((entry: Omit<DreamJournalEntry, 'id' | 'xpEarned' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: DreamJournalEntry = {
      ...entry,
      id: `d${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      xpEarned: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    newEntry.xpEarned = calculateEntryXp(newEntry);
    
    const updatedEntries = [...entries, newEntry].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setEntries(updatedEntries);
    updateStreak(newEntry.date);
    awardXp(newEntry.xpEarned);
    gainXpForCompanions('dream', newEntry.xpEarned);
    checkAchievements(updatedEntries);
    
    return newEntry;
  }, [entries, calculateEntryXp, setEntries, updateStreak, awardXp, checkAchievements, gainXpForCompanions]);

  const updateEntry = useCallback((id: string, updates: Partial<DreamJournalEntry>) => {
    let xpDifference = 0;
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const originalXp = entry.xpEarned;
        const updated = { 
          ...entry, 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        updated.xpEarned = calculateEntryXp(updated);
        xpDifference = updated.xpEarned - originalXp;
        return updated;
      }
      return entry;
    }));

    if (xpDifference !== 0) {
      awardXp(xpDifference);
      gainXpForCompanions('dream', xpDifference);
    }
  }, [setEntries, calculateEntryXp, awardXp, gainXpForCompanions]);

  const deleteEntry = useCallback((id: string) => {
    const entryToDelete = entries.find(entry => entry.id === id);
    if (entryToDelete) {
      awardXp(-entryToDelete.xpEarned);
      gainXpForCompanions('dream', -entryToDelete.xpEarned);
    }
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, [setEntries, entries, awardXp, gainXpForCompanions]);

  const filterEntries = useCallback((filter: Partial<JournalFilter>) => {
    return entries.filter(entry => {
      if (filter.searchText) {
        const search = filter.searchText.toLowerCase();
        if (!entry.title.toLowerCase().includes(search) && 
            !entry.content.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      if (filter.tags?.length && !filter.tags.some(tag => entry.tags.includes(tag))) {
        return false;
      }
      
      if (filter.companions?.length && !filter.companions.some(comp => entry.companions.includes(comp))) {
        return false;
      }
      
      if (filter.places?.length && !filter.places.some(place => entry.places.includes(place))) {
        return false;
      }
      
      if (filter.dateFrom && entry.date < filter.dateFrom) {
        return false;
      }
      
      if (filter.dateTo && entry.date > filter.dateTo) {
        return false;
      }
      
      if (filter.minXp && entry.xpEarned < filter.minXp) {
        return false;
      }
      
      if (filter.maxXp && entry.xpEarned > filter.maxXp) {
        return false;
      }
      
      return true;
    });
  }, [entries]);

  const stats = useMemo((): JournalStats => {
    const totalEntries = entries.length;
    const totalXpEarned = entries.reduce((sum, entry) => sum + entry.xpEarned, 0);
    const averageXpPerEntry = totalEntries > 0 ? totalXpEarned / totalEntries : 0;
    
    const tagCounts = new Map<string, number>();
    const companionCounts = new Map<string, number>();
    const placeCounts = new Map<string, number>();
    
    entries.forEach(entry => {
      entry.tags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
      entry.companions.forEach(comp => companionCounts.set(comp, (companionCounts.get(comp) || 0) + 1));
      entry.places.forEach(place => placeCounts.set(place, (placeCounts.get(place) || 0) + 1));
    });
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const entriesThisMonth = entries.filter(entry => entry.date.startsWith(currentMonth)).length;
    const lucidDreamCount = entries.filter(entry => entry.tags.includes('lucid')).length;
    
    return {
      totalEntries,
      totalXpEarned,
      averageXpPerEntry,
      mostUsedTags: Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      favoriteCompanions: Array.from(companionCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      favoriteLocations: Array.from(placeCounts.entries())
        .map(([place, count]) => ({ place, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      entriesThisMonth,
      lucidDreamCount,
    };
  }, [entries]);

  const exportJournal = useCallback(() => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-journal-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [entries]);

  const importJournal = useCallback((jsonData: string): { success: boolean; imported: number; errors: string[] } => {
    try {
      const imported = JSON.parse(jsonData) as DreamJournalEntry[];
      const errors: string[] = [];
      let importedCount = 0;
      
      imported.forEach((entry, index) => {
        try {
          if (!entry.id || !entry.title || !entry.date || !entry.content) {
            errors.push(`Entry ${index + 1}: Missing required fields`);
            return;
          }
          
          const existingEntry = entries.find(e => e.id === entry.id);
          if (!existingEntry) {
            addEntry(entry);
            importedCount++;
          }
        } catch (err) {
          errors.push(`Entry ${index + 1}: ${err}`);
        }
      });
      
      return { success: true, imported: importedCount, errors };
    } catch (err) {
      return { success: false, imported: 0, errors: [`Invalid JSON: ${err}`] };
    }
  }, [entries, addEntry]);

  return {
    entries,
    streak,
    stats,
    achievements,
    xpConfig,
    addEntry,
    updateEntry,
    deleteEntry,
    filterEntries,
    exportJournal,
    importJournal,
    setXpConfig,
    calculateEntryXp,
  } as const;
}