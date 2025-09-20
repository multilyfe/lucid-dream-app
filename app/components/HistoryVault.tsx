'use client';

import React, { useState, useMemo } from 'react';
import { useHistoryVault, type HistoryFilter, type SessionStats } from '../hooks/useHistoryVault';
import { type SimulationSession } from '../hooks/useSimulationEngine';

interface SessionCardProps {
  session: SimulationSession;
  onSelect?: () => void;
  onReplay?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onSelect, onReplay }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      text: '📝',
      image: '🖼️',
      deck: '🃏',
      voice: '🎙️',
      passive: '🌊'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';
    if (score >= 80) return 'text-purple-400';
    if (score >= 70) return 'text-pink-400';
    if (score >= 60) return 'text-blue-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(session.type)}</span>
          <div>
            <div className="font-medium text-white capitalize">{session.type} Session</div>
            <div className="text-sm text-gray-400">{formatDate(session.timestamp)}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(session.lucidImprintScore || 0)}`}>
            {session.lucidImprintScore || 0}
          </div>
          <div className="text-xs text-gray-400">Lucid Score</div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
        <div className="text-center">
          <div className="font-medium text-green-400">+{session.xpGained || 0}</div>
          <div className="text-xs text-gray-400">XP</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-blue-400">{formatDuration(session.duration || 0)}</div>
          <div className="text-xs text-gray-400">Duration</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-purple-400">{session.companionsDetected?.length || 0}</div>
          <div className="text-xs text-gray-400">Companions</div>
        </div>
      </div>

      {/* Companions */}
      {session.companionsDetected && session.companionsDetected.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Companions:</div>
          <div className="flex flex-wrap gap-1">
            {session.companionsDetected.slice(0, 3).map((companion, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300 capitalize"
              >
                {companion}
              </span>
            ))}
            {session.companionsDetected.length > 3 && (
              <span className="px-2 py-1 bg-gray-600/20 rounded-full text-xs text-gray-400">
                +{session.companionsDetected.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* DLC Saga */}
      {session.dlcSaga && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">DLC Saga:</div>
          <div className="text-sm text-yellow-300 font-medium">{session.dlcSaga.title}</div>
        </div>
      )}

      {/* Content Preview */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">Preview:</div>
        <div className="text-sm text-gray-300 line-clamp-2">
          {session.textContent?.slice(0, 100) || 
           session.voiceTranscript?.slice(0, 100) || 
           session.notes?.slice(0, 100) || 
           'No content preview available'}
          {(session.textContent?.length || session.voiceTranscript?.length || session.notes?.length || 0) > 100 && '...'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-sm font-medium text-purple-300 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={onReplay}
          className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-sm font-medium text-green-300 transition-colors"
        >
          Replay Session
        </button>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? Math.round(value * 100) / 100 : value}
      </div>
    </div>
    <div className="text-sm font-medium text-white">{title}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </div>
);

interface ProgressChartProps {
  data: Array<{ date: string; score: number; xp: number }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  const maxScore = Math.max(...data.map(d => d.score), 100);
  const maxXP = Math.max(...data.map(d => d.xp), 100);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">📈 Progress Over Time</h3>
      
      <div className="relative h-40 bg-gray-900/50 rounded p-4">
        <div className="flex items-end justify-between h-full gap-1">
          {data.slice(-14).map((point, index) => { // Show last 14 days
            const scoreHeight = (point.score / maxScore) * 100;
            const xpHeight = (point.xp / maxXP) * 100;
            
            return (
              <div key={point.date} className="flex-1 flex flex-col items-center">
                <div className="flex items-end gap-1 mb-1 w-full">
                  <div
                    className="bg-purple-500 rounded-t min-h-1"
                    {...({ style: { height: `${scoreHeight}%`, width: '45%' } })}
                    title={`Lucid Score: ${point.score}`}
                  />
                  <div
                    className="bg-green-500 rounded-t min-h-1"
                    {...({ style: { height: `${xpHeight}%`, width: '45%' } })}
                    title={`XP: ${point.xp}`}
                  />
                </div>
                <div className="text-xs text-gray-400 transform rotate-45 origin-left">
                  {point.date.split('-')[2]}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-400">Lucid Score</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-400">XP Gained</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryVault: React.FC = () => {
  const { sessionHistory, filterSessions, calculateStats, exportSessions, clearHistory } = useHistoryVault();
  
  const [filter, setFilter] = useState<HistoryFilter>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const [selectedSession, setSelectedSession] = useState<SimulationSession | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 12;

  // Apply filters and pagination
  const filteredSessions = useMemo(() => {
    return filterSessions(sessionHistory, filter);
  }, [sessionHistory, filter, filterSessions]);

  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * sessionsPerPage;
    return filteredSessions.slice(startIndex, startIndex + sessionsPerPage);
  }, [filteredSessions, currentPage]);

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateStats(filteredSessions);
  }, [filteredSessions, calculateStats]);

  const handleFilterChange = (key: keyof HistoryFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleExport = (format: 'json' | 'csv') => {
    exportSessions(filteredSessions, format);
  };

  const handleReplaySession = (session: SimulationSession) => {
    // TODO: Implement session replay functionality
    alert(`Replay functionality coming soon for ${session.type} session from ${new Date(session.timestamp).toLocaleDateString()}`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          📚 Simulation History Vault
        </h1>
        <p className="text-gray-400">
          Browse, analyze, and replay your consciousness programming sessions
        </p>
      </div>

      {/* Stats Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-colors"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('json')}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors text-sm"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 transition-colors text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon="🎮"
              color="text-blue-400"
            />
            <StatCard
              title="Total XP"
              value={stats.totalXP.toLocaleString()}
              icon="⭐"
              color="text-green-400"
            />
            <StatCard
              title="Average Lucid Score"
              value={stats.averageLucidScore}
              icon="🧠"
              color="text-purple-400"
            />
            <StatCard
              title="Total Time"
              value={formatDuration(stats.totalDuration)}
              icon="⏱️"
              color="text-yellow-400"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <StatCard
              title="Favorite Companion"
              value={stats.favoriteCompanion || 'None'}
              icon="💖"
              color="text-pink-400"
            />
            <StatCard
              title="Top DLC Saga"
              value={stats.topDLCSaga || 'None'}
              icon="👑"
              color="text-yellow-400"
            />
          </div>

          {/* Progress Chart */}
          <ProgressChart data={stats.progressOverTime} />

          {/* Session Type Distribution */}
          {Object.keys(stats.sessionsByType).length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">🎯 Session Types</h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(stats.sessionsByType).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{count}</div>
                    <div className="text-sm text-gray-400 capitalize">{type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium mb-2">Type</label>
            <select
              id="type-filter"
              title="Filter by session type"
              value={filter.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="deck">Deck</option>
              <option value="voice">Voice</option>
              <option value="passive">Passive</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="search-input" className="block text-sm font-medium mb-2">Search</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search content..."
              value={filter.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white text-sm"
            />
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort-select" className="block text-sm font-medium mb-2">Sort By</label>
            <select
              id="sort-select"
              title="Sort sessions by different criteria"
              value={filter.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded text-white text-sm"
            >
              <option value="date">Date</option>
              <option value="lucidScore">Lucid Score</option>
              <option value="xpGained">XP Gained</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order-select" className="block text-sm font-medium mb-2">Order</label>
            <select
              id="order-select"
              title="Sort order"
              value={filter.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="w-full p-2 bg-gray-700 rounded text-white text-sm"
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center text-gray-400">
        Showing {paginatedSessions.length} of {filteredSessions.length} sessions
        {filteredSessions.length !== sessionHistory.length && ` (filtered from ${sessionHistory.length} total)`}
      </div>

      {/* Session Cards */}
      {paginatedSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-gray-400">
            {sessionHistory.length === 0 
              ? 'No simulation sessions yet. Complete your first session to see it here!' 
              : 'No sessions match your current filters.'}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onSelect={() => setSelectedSession(session)}
              onReplay={() => handleReplaySession(session)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 bg-purple-500/20 rounded text-purple-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Clear History Button */}
      {sessionHistory.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all session history? This cannot be undone.')) {
                clearHistory();
              }
            }}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
};