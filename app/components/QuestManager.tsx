'use client';

import { useState } from 'react';
import { useQuests } from '../hooks/useQuests';
import { Quest, QuestType, QuestCategory, QuestDifficulty, QuestPriority } from '../lib/quests';

export const QuestManager = () => {
  const {
    questData,
    addQuest,
    updateQuest,
    deleteQuest,
    resetQuest,
    generateDailyQuests,
    generateWeeklyQuests
  } = useQuests();

  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuest, setNewQuest] = useState<Partial<Quest>>({
    title: '',
    desc: '',
    type: 'dream',
    category: 'main',
    difficulty: 'medium',
    priority: 'medium',
    steps: [],
    tags: [],
    rewards: {
      xp: 100
    }
  });

  const handleCreateQuest = () => {
    if (!newQuest.title || !newQuest.desc) return;

    const quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'> = {
      title: newQuest.title,
      desc: newQuest.desc,
      type: newQuest.type as QuestType,
      category: newQuest.category as QuestCategory,
      difficulty: newQuest.difficulty as QuestDifficulty,
      priority: newQuest.priority as QuestPriority,
      status: 'active', // Add the required status field
      steps: newQuest.steps || [
        {
          id: 's1',
          text: 'Complete the quest objective',
          desc: 'Add a description for this step',
          done: false,
          required: true
        }
      ],
      tags: newQuest.tags || [],
      rewards: newQuest.rewards || { xp: 100 },
      unlocks: [],
      timeLimit: newQuest.timeLimit || null,
      recurring: null,
      questline: undefined,
      questlineStep: undefined
    };

    addQuest(quest);
    setIsCreating(false);
    setNewQuest({
      title: '',
      desc: '',
      type: 'dream',
      category: 'main',
      difficulty: 'medium',
      priority: 'medium',
      steps: [],
      tags: [],
      rewards: { xp: 100 }
    });
  };

  const handleEditQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setNewQuest(quest);
    setIsCreating(true);
  };

  const handleUpdateQuest = () => {
    if (!selectedQuest || !newQuest.title || !newQuest.desc) return;

    const updatedQuest: Quest = {
      ...selectedQuest,
      title: newQuest.title,
      desc: newQuest.desc,
      type: newQuest.type as QuestType,
      category: newQuest.category as QuestCategory,
      difficulty: newQuest.difficulty as QuestDifficulty,
      priority: newQuest.priority as QuestPriority,
      steps: newQuest.steps || selectedQuest.steps,
      tags: newQuest.tags || [],
      rewards: {
        ...selectedQuest.rewards,
        ...newQuest.rewards
      },
      timeLimit: newQuest.timeLimit ?? selectedQuest.timeLimit,
      updatedAt: new Date().toISOString()
    };

    updateQuest(selectedQuest.id, updatedQuest);
    setIsCreating(false);
    setSelectedQuest(null);
    setNewQuest({
      title: '',
      desc: '',
      type: 'dream',
      category: 'main',
      difficulty: 'medium',
      priority: 'medium',
      steps: [],
      tags: [],
      rewards: { xp: 100 }
    });
  };

  const addStep = () => {
    const steps = newQuest.steps || [];
    const newStep = {
      id: `s${steps.length + 1}`,
      text: 'New step',
      desc: 'Step description',
      done: false,
      required: true
    };
    setNewQuest(prev => ({
      ...prev,
      steps: [...steps, newStep]
    }));
  };

  const updateStep = (stepIndex: number, field: string, value: any) => {
    const steps = [...(newQuest.steps || [])];
    steps[stepIndex] = { ...steps[stepIndex], [field]: value };
    setNewQuest(prev => ({ ...prev, steps }));
  };

  const removeStep = (stepIndex: number) => {
    const steps = [...(newQuest.steps || [])];
    steps.splice(stepIndex, 1);
    setNewQuest(prev => ({ ...prev, steps }));
  };

  return (
    <div className="space-y-6 rounded-3xl border border-purple-400/25 bg-slate-950/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-purple-400">Quest Manager</h3>
          <p className="text-sm text-slate-400">Create epic quests with RPG rewards and system integration</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
          >
            ⚔️ New Quest
          </button>
          <button
            onClick={generateDailyQuests}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 transition-colors"
          >
            📅 Generate Daily
          </button>
          <button
            onClick={generateWeeklyQuests}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors"
          >
            📆 Generate Weekly
          </button>
        </div>
      </div>

      {/* Quest Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-slate-900/50 p-4 border border-slate-700">
          <div className="text-2xl font-bold text-emerald-400">{questData.quests.filter(q => q.status === 'completed').length}</div>
          <div className="text-sm text-slate-400">Completed</div>
        </div>
        <div className="rounded-lg bg-slate-900/50 p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{questData.quests.filter(q => q.status === 'active').length}</div>
          <div className="text-sm text-slate-400">Active</div>
        </div>
        <div className="rounded-lg bg-slate-900/50 p-4 border border-slate-700">
          <div className="text-2xl font-bold text-amber-400">{questData.quests.reduce((sum, q) => sum + (q.rewards.xp || 0), 0)}</div>
          <div className="text-sm text-slate-400">Total XP</div>
        </div>
        <div className="rounded-lg bg-slate-900/50 p-4 border border-slate-700">
          <div className="text-2xl font-bold text-red-400">{questData.quests.filter(q => q.status === 'failed').length}</div>
          <div className="text-sm text-slate-400">Failed</div>
        </div>
      </div>

      {/* Enhanced Quest Creation/Editing Form */}
      {isCreating && (
        <div className="rounded-lg bg-gradient-to-br from-slate-900/80 to-purple-900/20 p-6 border border-purple-400/30 shadow-lg">
          <h4 className="text-xl font-semibold text-purple-400 mb-6 flex items-center gap-2">
            {selectedQuest ? '✏️ Edit Quest' : '⚔️ Create New Quest'}
          </h4>
          
          {/* Basic Quest Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quest Title</label>
              <input
                type="text"
                value={newQuest.title || ''}
                onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter an epic quest name..."
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quest Type</label>
              <select
                value={newQuest.type || 'dream'}
                onChange={(e) => setNewQuest(prev => ({ ...prev, type: e.target.value as QuestType }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              >
                <option value="dream">🌙 Dream Quest - Lucid dreaming & consciousness</option>
                <option value="irl">🌸 IRL Quest - Real world obedience & rituals</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Quest Description</label>
            <textarea
              value={newQuest.desc || ''}
              onChange={(e) => setNewQuest(prev => ({ ...prev, desc: e.target.value }))}
              placeholder="Describe your quest objective and what must be accomplished..."
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          {/* Quest Properties */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={newQuest.category || 'main'}
                onChange={(e) => setNewQuest(prev => ({ ...prev, category: e.target.value as QuestCategory }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              >
                <option value="main">🎯 Main Quest</option>
                <option value="side">📋 Side Quest</option>
                <option value="daily">📅 Daily Quest</option>
                <option value="weekly">📆 Weekly Quest</option>
                <option value="epic">👑 Epic Quest</option>
                <option value="ritual">🕯️ Ritual Quest</option>
                <option value="skill">📚 Skill Quest</option>
                <option value="exploration">🗺️ Exploration</option>
                <option value="habit">🔄 Habit Quest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
              <select
                value={newQuest.difficulty || 'medium'}
                onChange={(e) => setNewQuest(prev => ({ ...prev, difficulty: e.target.value as QuestDifficulty }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🟠 Hard</option>
                <option value="very_hard">🔴 Very Hard</option>
                <option value="legendary">🟣 Legendary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={newQuest.priority || 'medium'}
                onChange={(e) => setNewQuest(prev => ({ ...prev, priority: e.target.value as QuestPriority }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              >
                <option value="low">⚪ Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time Limit</label>
              <select
                value={newQuest.timeLimit || ''}
                onChange={(e) => setNewQuest(prev => ({ ...prev, timeLimit: e.target.value ? parseInt(e.target.value) : null }))}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              >
                <option value="">No Time Limit</option>
                <option value="3600000">1 Hour</option>
                <option value="86400000">1 Day</option>
                <option value="259200000">3 Days</option>
                <option value="604800000">1 Week</option>
                <option value="2592000000">1 Month</option>
              </select>
            </div>
          </div>

          {/* RPG Rewards System */}
          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-400/30 rounded-lg p-4 mb-6">
            <h5 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              💎 Quest Rewards (RPG System Integration)
            </h5>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-2">XP Reward</label>
                <input
                  type="number"
                  value={newQuest.rewards?.xp || 100}
                  onChange={(e) => setNewQuest(prev => ({
                    ...prev,
                    rewards: { ...prev.rewards, xp: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                  step="25"
                  className="w-full bg-slate-800/50 border border-amber-600/50 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-300 mb-2">Tokens</label>
                <input
                  type="number"
                  value={newQuest.rewards?.tokens || 0}
                  onChange={(e) => setNewQuest(prev => ({
                    ...prev,
                    rewards: { ...prev.rewards, tokens: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                  className="w-full bg-slate-800/50 border border-amber-600/50 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-300 mb-2">Obedience Points</label>
                <input
                  type="number"
                  value={newQuest.rewards?.obedience || 0}
                  onChange={(e) => setNewQuest(prev => ({
                    ...prev,
                    rewards: { ...prev.rewards, obedience: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                  className="w-full bg-slate-800/50 border border-amber-600/50 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-300 mb-2">Achievement Title</label>
                <input
                  type="text"
                  value={newQuest.rewards?.achievement || ''}
                  onChange={(e) => setNewQuest(prev => ({
                    ...prev,
                    rewards: { ...prev.rewards, achievement: e.target.value }
                  }))}
                  placeholder="Optional achievement name"
                  className="w-full bg-slate-800/50 border border-amber-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-300 mb-2">Title Reward</label>
                <input
                  type="text"
                  value={newQuest.rewards?.title || ''}
                  onChange={(e) => setNewQuest(prev => ({
                    ...prev,
                    rewards: { ...prev.rewards, title: e.target.value }
                  }))}
                  placeholder="Optional title to earn"
                  className="w-full bg-slate-800/50 border border-amber-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-300 mb-2">Shame Points</label>
                <input
                  type="number"
                  value={newQuest.rewards?.shame || 0}
                  onChange={(e) => setNewQuest(prev => ({
                    ...prev,
                    rewards: { ...prev.rewards, shame: parseInt(e.target.value) || 0 }
                  }))}
                  min="0"
                  className="w-full bg-slate-800/50 border border-amber-600/50 rounded-lg px-3 py-2 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quest Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-blue-400">Quest Steps</h5>
              <button
                onClick={addStep}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm transition-colors"
              >
                + Add Step
              </button>
            </div>
            
            <div className="space-y-3">
              {(newQuest.steps || []).map((step, index) => (
                <div key={step.id} className="bg-slate-800/30 border border-slate-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Step {index + 1} - Action</label>
                      <input
                        type="text"
                        value={step.text}
                        onChange={(e) => updateStep(index, 'text', e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={step.desc}
                        onChange={(e) => updateStep(index, 'desc', e.target.value)}
                        placeholder="Additional details..."
                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={step.required}
                        onChange={(e) => updateStep(index, 'required', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-700"
                      />
                      Required step
                    </label>
                    <button
                      onClick={() => removeStep(index)}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Quest Tags (comma-separated)</label>
            <input
              type="text"
              value={newQuest.tags?.join(', ') || ''}
              onChange={(e) => setNewQuest(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
              }))}
              placeholder="lucidity, obedience, ritual, daily, etc..."
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setIsCreating(false);
                setSelectedQuest(null);
                setNewQuest({
                  title: '',
                  desc: '',
                  type: 'dream',
                  category: 'main',
                  difficulty: 'medium',
                  priority: 'medium',
                  steps: [],
                  tags: [],
                  rewards: { xp: 100 }
                });
              }}
              className="bg-slate-600 hover:bg-slate-700 px-6 py-3 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={selectedQuest ? handleUpdateQuest : handleCreateQuest}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3 rounded-lg text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {selectedQuest ? '✅ Update Quest' : '⚔️ Create Quest'}
            </button>
          </div>
        </div>
      )}

      {/* Quest List */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-purple-400">All Quests</h4>
        {questData.quests.map((quest) => (
          <div key={quest.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-purple-400/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h5 className="font-semibold text-white">{quest.title}</h5>
                <p className="text-sm text-slate-400 mt-1">{quest.desc}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    quest.type === 'dream' 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'bg-pink-500/20 text-pink-400'
                  }`}>
                    {quest.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    quest.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                    quest.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {quest.status}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">
                    {quest.difficulty}
                  </span>
                  {quest.rewards.xp && (
                    <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                      +{quest.rewards.xp} XP
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditQuest(quest)}
                  className="text-blue-400 hover:text-blue-300 px-3 py-1 text-sm hover:bg-blue-400/10 rounded transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => resetQuest(quest.id)}
                  className="text-yellow-400 hover:text-yellow-300 px-3 py-1 text-sm hover:bg-yellow-400/10 rounded transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={() => deleteQuest(quest.id)}
                  className="text-red-400 hover:text-red-300 px-3 py-1 text-sm hover:bg-red-400/10 rounded transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};