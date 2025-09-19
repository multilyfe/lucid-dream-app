import React, { useState } from 'react';
import { Quest, QuestStep, calculateQuestProgress, getTypeIcon, getCategoryIcon, getPriorityIcon, getTimeRemaining } from '../lib/quests';

interface QuestDetailProps {
  quest: Quest;
  onUpdateStep: (stepId: string, done: boolean) => void;
  onComplete: () => void;
  onAbandon: () => void;
  onClose: () => void;
  show: boolean;
}

export const QuestDetail: React.FC<QuestDetailProps> = ({
  quest,
  onUpdateStep,
  onComplete,
  onAbandon,
  onClose,
  show
}) => {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  
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

  const handleStepToggle = (stepId: string, done: boolean) => {
    onUpdateStep(stepId, done);
    if (!done) {
      setActiveStepId(stepId);
      setTimeout(() => setActiveStepId(null), 1000);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-2xl border ${
        quest.type === 'dream'
          ? 'border-cyan-400/30 bg-gradient-to-br from-cyan-900/95 to-blue-900/95'
          : 'border-pink-400/30 bg-gradient-to-br from-pink-900/95 to-purple-900/95'
      } shadow-2xl max-h-[90vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{categoryIcon}</span>
                <span className="text-2xl">{typeIcon}</span>
                <h2 className="text-2xl font-bold text-white">{quest.title}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-3 py-1 rounded-full border ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty.replace('_', ' ')}
                  </span>
                  <span className="text-xl">{priorityIcon}</span>
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{quest.desc}</p>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-gray-300">{progress.completed}/{progress.total} steps ({progress.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      quest.type === 'dream'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Time remaining */}
          {timeRemaining && (
            <div className={`mt-4 text-sm font-medium ${isExpired ? 'text-red-300' : 'text-yellow-300'}`}>
              {isExpired ? '⏰ Quest Expired' : `⏱️ Time remaining: ${timeRemaining}`}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          
          {/* Quest Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quest Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Quest Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className={quest.type === 'dream' ? 'text-cyan-300' : 'text-pink-300'}>
                    {quest.type === 'dream' ? '🌙 Dream Quest' : '🌸 IRL Quest'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">{quest.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Priority</span>
                  <span className="text-white">{priorityIcon} {quest.priority}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={
                    quest.status === 'active' ? 'text-blue-300' :
                    quest.status === 'completed' ? 'text-emerald-300' :
                    quest.status === 'failed' ? 'text-red-300' :
                    'text-gray-300'
                  }>
                    {quest.status}
                  </span>
                </div>
                
                {quest.questline && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Questline</span>
                    <span className="text-purple-300">{quest.questline} (Part {quest.questlineStep})</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {quest.tags.length > 0 && (
                <div>
                  <span className="block text-gray-400 mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {quest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded bg-gray-700/50 text-gray-300 border border-gray-600/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rewards */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Rewards</h3>
              
              <div className="space-y-3">
                {quest.rewards.xp && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Experience Points</span>
                    <span className="text-yellow-300 font-bold">+{quest.rewards.xp} XP</span>
                  </div>
                )}
                
                {quest.rewards.achievement && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Achievement</span>
                    <span className="text-purple-300 font-bold">🏆 {quest.rewards.achievement}</span>
                  </div>
                )}
                
                {quest.rewards.title && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Title</span>
                    <span className="text-blue-300 font-bold">👑 {quest.rewards.title}</span>
                  </div>
                )}
                
                {quest.rewards.items && quest.rewards.items.length > 0 && (
                  <div>
                    <span className="block text-gray-400 mb-2">Items</span>
                    <div className="space-y-1">
                      {quest.rewards.items.map((item, index) => (
                        <div key={index} className="text-green-300">
                          📦 {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {quest.rewards.obedience && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Obedience Points</span>
                    <span className="text-pink-300 font-bold">+{quest.rewards.obedience}</span>
                  </div>
                )}
                
                {quest.rewards.shame && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Shame Points</span>
                    <span className="text-red-300 font-bold">+{quest.rewards.shame}</span>
                  </div>
                )}
                
                {quest.rewards.buffs && quest.rewards.buffs.length > 0 && (
                  <div>
                    <span className="block text-gray-400 mb-2">Buffs</span>
                    <div className="space-y-1">
                      {quest.rewards.buffs.map((buff, index) => (
                        <div key={index} className="text-green-300">
                          ✨ {buff}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {quest.rewards.curses && quest.rewards.curses.length > 0 && (
                  <div>
                    <span className="block text-gray-400 mb-2">Curses</span>
                    <div className="space-y-1">
                      {quest.rewards.curses.map((curse, index) => (
                        <div key={index} className="text-red-300">
                          💀 {curse}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quest Steps */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Quest Steps</h3>
            
            <div className="space-y-4">
              {quest.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    step.done
                      ? 'border-emerald-400/30 bg-emerald-500/10'
                      : activeStepId === step.id
                      ? 'border-yellow-400/50 bg-yellow-500/10 scale-[1.02]'
                      : 'border-gray-600/50 bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleStepToggle(step.id, !step.done)}
                      disabled={quest.status !== 'active' || isExpired}
                      className={`flex-shrink-0 w-8 h-8 mt-1 rounded-full border-2 flex items-center justify-center transition-all ${
                        step.done
                          ? 'border-emerald-400 bg-emerald-500 text-white'
                          : 'border-gray-400 hover:border-gray-300'
                      } ${quest.status !== 'active' || isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                    >
                      {step.done && '✓'}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-semibold text-lg ${step.done ? 'text-emerald-200 line-through' : 'text-white'}`}>
                            {index + 1}. {step.text}
                          </h4>
                          <p className={`text-sm mt-1 ${step.done ? 'text-emerald-300/70' : 'text-gray-400'}`}>
                            {step.desc}
                          </p>
                        </div>
                        
                        {step.required && (
                          <span className="flex-shrink-0 text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-400/30">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quest Actions */}
          {quest.status === 'active' && !isExpired && (
            <div className="border-t border-gray-700/50 pt-6">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onAbandon}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-colors"
                >
                  Abandon Quest
                </button>
                
                {canComplete && (
                  <button
                    onClick={onComplete}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                      quest.type === 'dream'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400'
                    } text-white shadow-lg`}
                  >
                    Complete Quest
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-700/50 pt-4 text-sm text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Created:</span> {new Date(quest.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(quest.updatedAt).toLocaleString()}
              </div>
              {quest.completedAt && (
                <div>
                  <span className="font-medium">Completed:</span> {new Date(quest.completedAt).toLocaleString()}
                </div>
              )}
              {quest.failedAt && (
                <div>
                  <span className="font-medium">Failed:</span> {new Date(quest.failedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};