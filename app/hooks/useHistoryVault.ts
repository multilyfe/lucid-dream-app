'use client';

import React, { useState, useMemo } from 'react';
import { useSimulationEngine, type SimulationSession } from '../hooks/useSimulationEngine';
import { usePersistentState } from '../hooks/usePersistentState';

interface HistoryFilter {
  type?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  companionFilter?: string;
  minLucidScore?: number;
  searchTerm?: string;
  sortBy: 'date' | 'lucidScore' | 'xpGained' | 'duration';
  sortOrder: 'asc' | 'desc';
}

interface SessionStats {
  totalSessions: number;
  totalXP: number;
  averageLucidScore: number;
  totalDuration: number;
  favoriteCompanion: string;
  topDLCSaga: string;
  sessionsByType: Record<string, number>;
  scoreDistribution: number[];
  progressOverTime: Array<{ date: string; score: number; xp: number }>;
}

export function useHistoryVault() {
  const [sessionHistory, setSessionHistory] = usePersistentState<SimulationSession[]>('simulation_history', () => []);

  // Add session to history
  const addSession = (session: SimulationSession) => {
    const historyEntry = {
      ...session,
      id: session.id || Date.now().toString(),
      timestamp: session.timestamp || new Date().toISOString(),
      endTime: new Date().toISOString()
    };
    
    setSessionHistory(prev => [historyEntry, ...prev.slice(0, 999)]); // Keep last 1000 sessions
  };

  // Filter and search sessions
  const filterSessions = (sessions: SimulationSession[], filter: HistoryFilter): SimulationSession[] => {
    let filtered = [...sessions];

    // Type filter
    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(session => session.type === filter.type);
    }

    // Date range filter
    if (filter.dateRange) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.timestamp);
        return sessionDate >= filter.dateRange!.start && sessionDate <= filter.dateRange!.end;
      });
    }

    // Companion filter
    if (filter.companionFilter) {
      filtered = filtered.filter(session => 
        session.companionsDetected?.some(name => 
          name.toLowerCase().includes(filter.companionFilter!.toLowerCase())
        )
      );
    }

    // Minimum Lucid Score filter
    if (filter.minLucidScore !== undefined) {
      filtered = filtered.filter(session => 
        (session.lucidImprintScore || 0) >= filter.minLucidScore!
      );
    }

    // Search term filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(session => 
        session.textContent?.toLowerCase().includes(searchLower) ||
        session.voiceTranscript?.toLowerCase().includes(searchLower) ||
        session.notes?.toLowerCase().includes(searchLower) ||
        session.dlcSaga?.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filter.sortBy) {
        case 'date':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'lucidScore':
          aValue = a.lucidImprintScore || 0;
          bValue = b.lucidImprintScore || 0;
          break;
        case 'xpGained':
          aValue = a.xpGained || 0;
          bValue = b.xpGained || 0;
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        default:
          return 0;
      }

      if (filter.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  };

  // Calculate statistics
  const calculateStats = (sessions: SimulationSession[]): SessionStats => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalXP: 0,
        averageLucidScore: 0,
        totalDuration: 0,
        favoriteCompanion: '',
        topDLCSaga: '',
        sessionsByType: {},
        scoreDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        progressOverTime: []
      };
    }

    const totalSessions = sessions.length;
    const totalXP = sessions.reduce((sum, s) => sum + (s.xpGained || 0), 0);
    const totalLucidScore = sessions.reduce((sum, s) => sum + (s.lucidImprintScore || 0), 0);
    const averageLucidScore = totalLucidScore / totalSessions;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    // Favorite companion
    const companionCounts: Record<string, number> = {};
    sessions.forEach(session => {
      session.companionsDetected?.forEach(companion => {
        companionCounts[companion] = (companionCounts[companion] || 0) + 1;
      });
    });
    const favoriteCompanion = Object.entries(companionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Top DLC saga
    const sagaCounts: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.dlcSaga?.title) {
        sagaCounts[session.dlcSaga.title] = (sagaCounts[session.dlcSaga.title] || 0) + 1;
      }
    });
    const topDLCSaga = Object.entries(sagaCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Sessions by type
    const sessionsByType: Record<string, number> = {};
    sessions.forEach(session => {
      sessionsByType[session.type] = (sessionsByType[session.type] || 0) + 1;
    });

    // Score distribution (0-10, 10-20, 20-30, etc.)
    const scoreDistribution = Array(10).fill(0);
    sessions.forEach(session => {
      const score = session.lucidImprintScore || 0;
      const bucket = Math.min(9, Math.floor(score / 10));
      scoreDistribution[bucket]++;
    });

    // Progress over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter(s => new Date(s.timestamp) >= thirtyDaysAgo);
    const progressOverTime = recentSessions
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(session => ({
        date: new Date(session.timestamp).toISOString().split('T')[0],
        score: session.lucidImprintScore || 0,
        xp: session.xpGained || 0
      }));

    return {
      totalSessions,
      totalXP,
      averageLucidScore,
      totalDuration,
      favoriteCompanion,
      topDLCSaga,
      sessionsByType,
      scoreDistribution,
      progressOverTime
    };
  };

  // Export sessions
  const exportSessions = (sessions: SimulationSession[], format: 'json' | 'csv') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation_history_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = [
        'Date', 'Type', 'Lucid Score', 'XP Gained', 'Duration', 'Companions', 'DLC Saga'
      ];
      
      const csvData = sessions.map(session => [
        new Date(session.timestamp).toLocaleString(),
        session.type,
        session.lucidImprintScore || 0,
        session.xpGained || 0,
        session.duration || 0,
        session.companionsDetected?.join('; ') || '',
        session.dlcSaga?.title || ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation_history_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear history with confirmation
  const clearHistory = (beforeDate?: Date) => {
    if (beforeDate) {
      setSessionHistory(prev => prev.filter(session => 
        new Date(session.timestamp) >= beforeDate
      ));
    } else {
      setSessionHistory([]);
    }
  };

  return {
    sessionHistory,
    addSession,
    filterSessions,
    calculateStats,
    exportSessions,
    clearHistory
  };
}