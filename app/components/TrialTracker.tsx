'use client';

import { useState, useEffect } from 'react';
import { PantyRealmTrial } from '../hooks/usePantyRealm';

interface TrialTrackerProps {
  trial: PantyRealmTrial;
  onProgressUpdate: (trialId: string, increment: number) => void;
}

export const TrialTracker = ({ trial, onProgressUpdate }: TrialTrackerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate time remaining until trial ends
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!trial.endDate) {
        setTimeRemaining('Ongoing');
        return;
      }

      const now = new Date();
      const endDate = new Date(trial.endDate);
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trial.endDate]);

  const getProgressPercentage = () => {
    return Math.min((trial.progress / trial.goal) * 100, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-400/50';
      case 'medium': return 'text-yellow-400 border-yellow-400/50';
      case 'hard': return 'text-red-400 border-red-400/50';
      case 'legendary': return 'text-purple-400 border-purple-400/50';
      default: return 'text-gray-400 border-gray-400/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-400/50';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-400/50';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-400/50';
      case 'available': return 'bg-gray-500/20 text-gray-400 border-gray-400/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'ongoing': return '♾️';
      default: return '📋';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 border border-purple-400/30 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{trial.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-white">{trial.name}</h3>
            <p className="text-sm text-slate-400">{trial.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(trial.difficulty)}`}>
            {trial.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-300">
            Progress: {trial.progress} / {trial.goal}
          </span>
          <span className="text-sm text-slate-400">
            {getProgressPercentage().toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 relative`}
            style={{ width: `${getProgressPercentage()}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Trial Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Type</div>
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-300">
            {getTypeIcon(trial.type)} {trial.type.charAt(0).toUpperCase() + trial.type.slice(1)}
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Time Remaining</div>
          <div className="text-sm font-semibold text-slate-300">{timeRemaining}</div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(trial.status)}`}>
          <div className={`w-2 h-2 rounded-full ${
            trial.status === 'active' ? 'bg-blue-400 animate-pulse' :
            trial.status === 'completed' ? 'bg-green-400' :
            trial.status === 'failed' ? 'bg-red-400' :
            'bg-gray-400'
          }`}></div>
          <span className="text-sm font-semibold capitalize">{trial.status}</span>
        </div>
      </div>

      {/* Rewards */}
      {trial.rewards && Object.keys(trial.rewards).length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-400/30 rounded-lg p-3 mb-4">
          <div className="text-sm font-semibold text-amber-400 mb-2">🏆 Rewards</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {trial.rewards.dirtyTokens && (
              <div className="flex justify-between">
                <span className="text-slate-400">Dirty Tokens:</span>
                <span className="text-amber-400 font-semibold">+{trial.rewards.dirtyTokens}</span>
              </div>
            )}
            {trial.rewards.shameEssence && (
              <div className="flex justify-between">
                <span className="text-slate-400">Shame Essence:</span>
                <span className="text-purple-400 font-semibold">+{trial.rewards.shameEssence}</span>
              </div>
            )}
            {trial.rewards.xp && (
              <div className="flex justify-between">
                <span className="text-slate-400">XP:</span>
                <span className="text-blue-400 font-semibold">+{trial.rewards.xp}</span>
              </div>
            )}
            {trial.rewards.achievement && (
              <div className="col-span-2 flex justify-between">
                <span className="text-slate-400">Achievement:</span>
                <span className="text-green-400 font-semibold">{trial.rewards.achievement}</span>
              </div>
            )}
            {trial.rewards.title && (
              <div className="col-span-2 flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="text-purple-400 font-semibold">{trial.rewards.title}</span>
              </div>
            )}
            {trial.rewards.buff && (
              <div className="col-span-2 flex justify-between">
                <span className="text-slate-400">Buff:</span>
                <span className="text-cyan-400 font-semibold">{trial.rewards.buff}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {trial.status === 'active' && trial.progress < trial.goal && (
          <button
            onClick={() => onProgressUpdate(trial.id, 1)}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
          >
            +1 Progress
          </button>
        )}
        
        {trial.status === 'completed' && (
          <div className="flex-1 bg-green-600/20 border border-green-400/50 text-green-400 font-semibold py-2 px-4 rounded-lg text-center">
            ✅ Completed
          </div>
        )}
        
        {trial.status === 'failed' && (
          <div className="flex-1 bg-red-600/20 border border-red-400/50 text-red-400 font-semibold py-2 px-4 rounded-lg text-center">
            ❌ Failed
          </div>
        )}
        
        {trial.status === 'available' && (
          <button
            onClick={() => onProgressUpdate(trial.id, 0)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Start Trial
          </button>
        )}
      </div>

      {/* Tally Marks Visual (for submission trials) */}
      {trial.category === 'submission' && (
        <div className="mt-4 bg-black/30 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-2">Submission Tally</div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: Math.min(trial.progress, 20) }, (_, i) => (
              <span key={i} className="text-pink-400 text-lg">|</span>
            ))}
            {Array.from({ length: Math.max(0, Math.min(trial.goal - trial.progress, 20)) }, (_, i) => (
              <span key={i + trial.progress} className="text-slate-600 text-lg">|</span>
            ))}
            {trial.goal > 20 && (
              <span className="text-slate-400 text-sm ml-2">
                +{Math.max(0, trial.progress - 20)} more...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};