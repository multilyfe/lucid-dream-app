import { useState } from 'react';
import { type MindfuckQuest } from '../hooks/useMindfuckCathedral';

interface MindfuckQuestsProps {
  quests: MindfuckQuest[];
  onCompleteQuest?: (questId: string) => void;
  onStartQuest?: (questId: string) => void;
}

const QuestDifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colors = {
    easy: 'bg-green-500/20 text-green-300 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    hard: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    legendary: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[difficulty as keyof typeof colors]}`}>
      {difficulty.toUpperCase()}
    </span>
  );
};

const QuestTypeIcon = ({ type }: { type: string }) => {
  const icons = {
    ego_trial: '💀',
    entity_contact: '👁️',
    integration: '🔮',
    breakthrough: '🚀',
    healing: '💚'
  };
  return <span className="text-2xl">{icons[type as keyof typeof icons] || '✨'}</span>;
};

const QuestProgressBar = ({ progress, requirements }: { progress?: any; requirements: any }) => {
  if (!progress) return null;

  const progressEntries = Object.entries(progress);
  const requirementEntries = Object.entries(requirements);

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400 mb-2">Progress</div>
      {progressEntries.map(([key, value]) => {
        const requirement = requirementEntries.find(([reqKey]) => reqKey === key);
        if (!requirement) return null;
        
        const current = value as number;
        const target = requirement[1] as number;
        const percentage = Math.min((current / target) * 100, 100);

        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
              <span className="text-slate-400">{current}/{target}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ${
                  percentage >= 100 ? 'w-full' : 
                  percentage >= 75 ? 'w-3/4' :
                  percentage >= 50 ? 'w-1/2' :
                  percentage >= 25 ? 'w-1/4' : 'w-0'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const QuestRequirements = ({ requirements }: { requirements: any }) => {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400 mb-2">Requirements</div>
      <div className="space-y-1">
        {Object.entries(requirements).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
            <span className="text-slate-400">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuestRewards = ({ rewards }: { rewards: any }) => {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400 mb-2">Rewards</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {rewards.xp && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-slate-300">{rewards.xp} XP</span>
          </div>
        )}
        {rewards.tokens && (
          <div className="flex items-center gap-1">
            <span className="text-purple-400">🧠</span>
            <span className="text-slate-300">{rewards.tokens} Tokens</span>
          </div>
        )}
        {rewards.title && (
          <div className="flex items-center gap-1">
            <span className="text-cyan-400">🏆</span>
            <span className="text-slate-300">{rewards.title}</span>
          </div>
        )}
        {rewards.unlock && (
          <div className="flex items-center gap-1">
            <span className="text-green-400">🔓</span>
            <span className="text-slate-300">{rewards.unlock}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export function MindfuckQuests({ quests, onCompleteQuest, onStartQuest }: MindfuckQuestsProps) {
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'in_progress' | 'completed' | 'locked'>('all');

  const filteredQuests = quests.filter(quest => 
    activeFilter === 'all' || quest.status === activeFilter
  );

  const questsByStatus = {
    available: quests.filter(q => q.status === 'available'),
    in_progress: quests.filter(q => q.status === 'in_progress'),
    completed: quests.filter(q => q.status === 'completed'),
    locked: quests.filter(q => q.status === 'locked')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🌀 Mindfuck Quests</h2>
          <p className="text-slate-400">Ego trials and consciousness challenges</p>
        </div>
        
        {/* Quest stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="text-lg font-bold text-green-400">{questsByStatus.available.length}</div>
            <div className="text-xs text-green-300">Available</div>
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="text-lg font-bold text-yellow-400">{questsByStatus.in_progress.length}</div>
            <div className="text-xs text-yellow-300">In Progress</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="text-lg font-bold text-purple-400">{questsByStatus.completed.length}</div>
            <div className="text-xs text-purple-300">Completed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/30">
            <div className="text-lg font-bold text-slate-400">{questsByStatus.locked.length}</div>
            <div className="text-xs text-slate-300">Locked</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
        {[
          { id: 'all', label: 'All Quests', count: quests.length },
          { id: 'available', label: 'Available', count: questsByStatus.available.length },
          { id: 'in_progress', label: 'In Progress', count: questsByStatus.in_progress.length },
          { id: 'completed', label: 'Completed', count: questsByStatus.completed.length },
          { id: 'locked', label: 'Locked', count: questsByStatus.locked.length }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-purple-500/30 text-purple-200 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-slate-600 rounded-full text-xs">
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quests grid */}
      <div className="grid gap-6">
        {filteredQuests.map(quest => {
          const isExpanded = expandedQuest === quest.id;
          const isLocked = quest.status === 'locked';
          const isCompleted = quest.status === 'completed';
          
          return (
            <div key={quest.id} className="group relative">
              {/* Psychedelic glow effect */}
              <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                isCompleted 
                  ? 'bg-gradient-to-br from-green-500/20 via-purple-500/10 to-cyan-500/20 animate-pulse'
                  : isLocked
                  ? 'bg-gradient-to-br from-slate-500/10 via-slate-400/5 to-slate-500/10'
                  : 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100'
              }`} />
              
              <div className={`relative backdrop-blur-md rounded-3xl border transition-all duration-300 overflow-hidden ${
                isCompleted
                  ? 'border-green-500/50 bg-green-900/20'
                  : isLocked
                  ? 'border-slate-600/50 bg-slate-900/20 opacity-60'
                  : 'border-slate-700/50 bg-slate-900/40 hover:border-purple-500/50'
              }`}>
                
                <div className="p-6">
                  {/* Quest header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`${isLocked ? 'grayscale' : ''}`}>
                        <QuestTypeIcon type={quest.type} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-bold ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                            {quest.title}
                          </h3>
                          <QuestDifficultyBadge difficulty={quest.difficulty} />
                        </div>
                        <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-300'}`}>
                          {quest.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      quest.status === 'available' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      quest.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      quest.status === 'completed' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {quest.status.replace('_', ' ').toUpperCase()}
                      {quest.status === 'completed' && quest.completed_date && (
                        <span className="ml-1">✓</span>
                      )}
                    </div>
                  </div>

                  {/* Progress (if in progress) */}
                  {quest.status === 'in_progress' && quest.progress && (
                    <div className="mb-4">
                      <QuestProgressBar progress={quest.progress} requirements={quest.requirements} />
                    </div>
                  )}

                  {/* Quick rewards preview */}
                  <div className="flex items-center justify-between">
                    <QuestRewards rewards={quest.rewards} />
                    
                    <div className="flex gap-2">
                      {/* Expand button */}
                      <button
                        onClick={() => setExpandedQuest(isExpanded ? null : quest.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isLocked
                            ? 'bg-slate-600/20 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                        }`}
                        disabled={isLocked}
                      >
                        {isExpanded ? '🔼' : '🔽'} Details
                      </button>
                      
                      {/* Action button */}
                      {!isLocked && quest.status === 'available' && onStartQuest && (
                        <button
                          onClick={() => onStartQuest(quest.id)}
                          className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 
                            text-purple-300 text-sm font-medium transition-all hover:scale-105"
                        >
                          🚀 Begin Quest
                        </button>
                      )}
                      
                      {quest.status === 'in_progress' && onCompleteQuest && (
                        <button
                          onClick={() => onCompleteQuest(quest.id)}
                          className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 
                            text-green-300 text-sm font-medium transition-all hover:scale-105"
                        >
                          ✅ Complete
                        </button>
                      )}
                      
                      {quest.status === 'completed' && (
                        <div className="px-4 py-2 rounded-xl bg-green-500/20 text-green-300 
                          text-sm font-medium">
                          ✅ Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t border-slate-700/50">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <QuestRequirements requirements={quest.requirements} />
                      <div className="space-y-4">
                        <QuestRewards rewards={quest.rewards} />
                        
                        {quest.completed_date && (
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Completed On</div>
                            <div className="text-sm text-green-300">{quest.completed_date}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌀</div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">No quests found</h3>
          <p className="text-slate-500">
            {activeFilter === 'all' 
              ? 'The universe hasn\'t presented any challenges yet.'
              : `No ${activeFilter.replace('_', ' ')} quests available.`
            }
          </p>
        </div>
      )}
    </div>
  );
}