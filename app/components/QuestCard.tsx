import React from 'react';
import { Quest, calculateQuestProgress, getTypeIcon, getCategoryIcon, getPriorityIcon, getTimeRemaining } from '../lib/quests';

interface QuestCardProps {
  quest: Quest;
  onUpdateStep?: (stepId: string, done: boolean) => void;
  onComplete?: () => void;
  onAbandon?: () => void;
  compact?: boolean;
  showActions?: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onUpdateStep,
  onComplete,
  onAbandon,
  compact = false,
  showActions = true
}) => {
  const progress = calculateQuestProgress(quest);
  const typeIcon = getTypeIcon(quest.type);
  const categoryIcon = getCategoryIcon(quest.category);
  const priorityIcon = getPriorityIcon(quest.priority);
  const timeRemaining = getTimeRemaining(quest);

  const isExpired = timeRemaining === 'Expired';
  const canComplete = progress.percentage === 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-300 border-green-400/30 bg-green-500/10';
      case 'medium': return 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10';
      case 'hard': return 'text-orange-300 border-orange-400/30 bg-orange-500/10';
      case 'very_hard': return 'text-red-300 border-red-400/30 bg-red-500/10';
      case 'legendary': return 'text-purple-300 border-purple-400/30 bg-purple-500/10';
      default: return 'text-gray-300 border-gray-400/30 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-blue-400/30 bg-blue-500/10';
      case 'completed': return 'border-emerald-400/30 bg-emerald-500/10';
      case 'failed': return 'border-red-400/30 bg-red-500/10';
      case 'locked': return 'border-gray-400/30 bg-gray-500/10';
      default: return 'border-gray-400/30 bg-gray-500/10';
    }
  };

  if (compact) {
    return (
      <div className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${getStatusColor(quest.status)} ${
        quest.type === 'dream' 
          ? 'shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
          : 'shadow-[0_0_15px_rgba(244,114,182,0.1)]'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">{categoryIcon}</span>
          <span className="text-lg">{typeIcon}</span>
          <h4 className="font-semibold text-white flex-1">{quest.title}</h4>
          <span className="text-sm">{priorityIcon}</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 bg-gray-700/50 rounded-full h-2 relative overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                quest.type === 'dream'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{progress.completed}/{progress.total}</span>
        </div>

        {timeRemaining && (
          <div className={`text-xs font-medium ${isExpired ? 'text-red-300' : 'text-yellow-300'}`}>
            {isExpired ? '⏰ Expired' : `⏱️ ${timeRemaining}`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 hover:scale-[1.02] transform ${
      quest.type === 'dream'
        ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]'
        : 'border-pink-400/40 bg-gradient-to-br from-pink-900/30 to-purple-900/30 shadow-[0_0_25px_rgba(244,114,182,0.2)] hover:shadow-[0_0_35px_rgba(244,114,182,0.3)]'
    } ${quest.status === 'completed' ? 'opacity-90 border-amber-400/50 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 shadow-[0_0_25px_rgba(251,191,36,0.2)]' : ''} ${isExpired ? 'opacity-60' : ''}`}>
      
      {/* Magical shimmer effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none"></div>
      
      {/* Glowing quest type indicator */}
      <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
        quest.type === 'dream' 
          ? 'bg-cyan-600/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse' 
          : 'bg-pink-600/80 border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.8)] animate-pulse'
      } ${quest.status === 'completed' ? 'bg-amber-600/80 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]' : ''}`}>
        {quest.status === 'completed' ? '✨' : typeIcon}
      </div>

      {/* Priority glow effect */}
      <div className={`absolute top-4 left-4 text-2xl ${
        quest.priority === 'high' ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse' :
        quest.priority === 'medium' ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' :
        'drop-shadow-[0_0_4px_rgba(156,163,175,0.4)]'
      }`}>
        {priorityIcon}
      </div>
      
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{categoryIcon}</span>
              <span className="text-xl">{typeIcon}</span>
              <h3 className="text-xl font-bold text-white">{quest.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                  {quest.difficulty.replace('_', ' ')}
                </span>
                <span className="text-lg">{priorityIcon}</span>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{quest.desc}</p>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-300">{progress.completed}/{progress.total} steps</span>
              </div>
              <div className="w-full bg-gray-900/60 rounded-full h-4 relative overflow-hidden border border-gray-600/50 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 relative ${
                    quest.type === 'dream'
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.5)]'
                      : 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-[inset_0_0_10px_rgba(244,114,182,0.5)]'
                  } ${quest.status === 'completed' ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 shadow-[inset_0_0_10px_rgba(251,191,36,0.5)]' : ''}`}
                  style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                >
                  {/* Animated progress sparkle */}
                  {progress.percentage > 0 && (
                    <div className="absolute right-0 top-0 h-full w-2 bg-white/30 rounded-r-full animate-pulse"></div>
                  )}
                </div>
                {/* Progress trail effect */}
                <div className={`absolute inset-0 rounded-full ${
                  quest.type === 'dream' 
                    ? 'bg-gradient-to-r from-transparent to-cyan-400/20' 
                    : 'bg-gradient-to-r from-transparent to-pink-400/20'
                } animate-pulse`}></div>
              </div>
            </div>

            {/* Time remaining */}
            {timeRemaining && (
              <div className={`mt-3 text-sm font-medium ${isExpired ? 'text-red-300' : 'text-yellow-300'}`}>
                {isExpired ? '⏰ Quest Expired' : `⏱️ Time remaining: ${timeRemaining}`}
              </div>
            )}
          </div>

          {/* Rewards Preview */}
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 min-w-[200px]">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Rewards</h4>
            <div className="space-y-1 text-sm">
              {quest.rewards.xp && (
                <div className="flex justify-between">
                  <span className="text-gray-400">XP</span>
                  <span className="text-yellow-300">+{quest.rewards.xp}</span>
                </div>
              )}
              {quest.rewards.achievement && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Achievement</span>
                  <span className="text-purple-300">🏆</span>
                </div>
              )}
              {quest.rewards.title && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Title</span>
                  <span className="text-blue-300">👑</span>
                </div>
              )}
              {quest.rewards.items && quest.rewards.items.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Items</span>
                  <span className="text-green-300">+{quest.rewards.items.length}</span>
                </div>
              )}
              {quest.rewards.obedience && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Obedience</span>
                  <span className="text-pink-300">+{quest.rewards.obedience}</span>
                </div>
              )}
              {quest.rewards.shame && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Shame</span>
                  <span className="text-red-300">+{quest.rewards.shame}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Steps */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Quest Steps</h4>
        <div className="space-y-3">
          {quest.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                step.done
                  ? 'border-emerald-400/30 bg-emerald-500/10'
                  : 'border-gray-600/50 bg-gray-800/30'
              }`}
            >
              <button
                onClick={() => onUpdateStep?.(step.id, !step.done)}
                disabled={quest.status !== 'active' || isExpired}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 text-sm font-bold ${
                  step.done
                    ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] scale-110'
                    : 'border-gray-400 hover:border-gray-300 hover:shadow-[0_0_8px_rgba(156,163,175,0.4)] hover:scale-105'
                } ${quest.status !== 'active' || isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-600/30'}`}
              >
                {step.done ? '✓' : index + 1}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${step.done ? 'text-emerald-200 line-through' : 'text-white'}`}>
                  {index + 1}. {step.text}
                </p>
                {step.desc && (
                  <p className={`text-sm ${step.done ? 'text-emerald-300/70' : 'text-gray-400'}`}>
                    {step.desc}
                  </p>
                )}
              </div>
              {step.required && (
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-400/30">
                  Required
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {showActions && quest.status === 'active' && !isExpired && (
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex gap-3">
            <button
              onClick={onAbandon}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white transition-colors"
            >
              Abandon Quest
            </button>
            {canComplete && (
              <button
                onClick={onComplete}
                className={`relative px-8 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-110 text-white overflow-hidden group ${
                  quest.type === 'dream'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)]'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 shadow-[0_0_20px_rgba(244,114,182,0.5)] hover:shadow-[0_0_30px_rgba(244,114,182,0.7)]'
                }`}
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button text */}
                <span className="relative z-10 flex items-center gap-2">
                  ⚡ Complete Quest ⚡
                </span>
                
                {/* Sparkle effect */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed/Failed Status */}
      {quest.status === 'completed' && (
        <div className="p-4 border-t border-emerald-400/30 bg-emerald-500/10">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="text-lg">✅</span>
            <span className="font-semibold">Quest Completed</span>
            {quest.completedAt && (
              <span className="text-sm text-emerald-400">
                on {new Date(quest.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {quest.status === 'failed' && (
        <div className="p-4 border-t border-red-400/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-300">
            <span className="text-lg">❌</span>
            <span className="font-semibold">Quest Failed</span>
            {quest.failedAt && (
              <span className="text-sm text-red-400">
                on {new Date(quest.failedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};