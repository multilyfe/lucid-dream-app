'use client';

import { useState, useMemo } from 'react';
import QuestLayout from '../../layouts/QuestLayout';
import { useQuests } from '../../hooks/useQuests';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { useInventory } from '../../hooks/useInventory';
import { QuestCard } from '../../components/QuestCard';
import { QuestRewardPopup } from '../../components/QuestRewardPopup';
import { Quest, QuestType, QuestStatus, getTypeIcon, getCategoryIcon, getPriorityIcon } from '../../lib/quests';

const TAB_OPTIONS = [
  { value: 'all', label: 'All Quests' },
  { value: 'dream', label: 'Dream Goals' },
  { value: 'irl', label: 'IRL Goals' },
  { value: 'completed', label: 'Completed' }
] as const;

type TabValue = typeof TAB_OPTIONS[number]['value'];

export default function QuestsPage() {
  const { settings: profile } = useProfileSettings();
  const { xp } = useInventory();
  const { 
    questData, 
    activeQuests, 
    completedQuests, 
    dreamQuests, 
    irlQuests,
    showRewardPopup,
    updateQuestStep,
    completeQuest,
    startQuest,
    abandonQuest,
    closeRewardPopup,
    calculateQuestProgress
  } = useQuests();

  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'difficulty' | 'created'>('priority');

  // Filter and sort quests based on current tab and filters
  const filteredQuests = useMemo(() => {
    let quests: Quest[] = [];

    // Filter by tab
    switch (activeTab) {
      case 'all':
        quests = [...activeQuests];
        break;
      case 'dream':
        quests = dreamQuests.filter(q => q.status === 'active');
        break;
      case 'irl':
        quests = irlQuests.filter(q => q.status === 'active');
        break;
      case 'completed':
        quests = [...completedQuests];
        break;
    }

    // Filter by search term
    if (searchTerm) {
      quests = quests.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      quests = quests.filter(quest => quest.difficulty === filterDifficulty);
    }

    // Sort quests
    quests.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          const aProgress = calculateQuestProgress(a).percentage;
          const bProgress = calculateQuestProgress(b).percentage;
          return bProgress - aProgress;
        case 'difficulty':
          const difficultyOrder = { legendary: 5, very_hard: 4, hard: 3, medium: 2, easy: 1 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return quests;
  }, [activeTab, activeQuests, dreamQuests, irlQuests, completedQuests, searchTerm, filterDifficulty, sortBy, calculateQuestProgress]);

  // Stats for header
  const stats = {
    active: activeQuests.length,
    completed: completedQuests.length,
    totalXp: questData.totalXpEarned,
    dreamActive: dreamQuests.filter(q => q.status === 'active').length,
    irlActive: irlQuests.filter(q => q.status === 'active').length
  };

  return (
    <QuestLayout xp={xp}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 text-slate-100">
        {/* Header with magical styling */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative">
              <h1 className="text-4xl font-bold tracking-[0.35em] bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
                ⚔️ Quest Journal ⚔️
              </h1>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-xl blur-lg animate-pulse -z-10"></div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.3em] text-slate-300">
              <span className="px-3 py-1 bg-green-600/30 border border-green-400/40 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                Active {stats.active}
              </span>
              <span className="text-gray-500">|</span>
              <span className="px-3 py-1 bg-amber-600/30 border border-amber-400/40 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                Completed {stats.completed}
              </span>
              <span className="text-gray-500">|</span>
              <span className="px-3 py-1 bg-blue-600/30 border border-blue-400/40 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                XP {stats.totalXp.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="max-w-4xl text-slate-300">
            Your journey through dreams and reality awaits. Complete quests to earn XP, unlock achievements, 
            and progress through your transformation. Dream goals connect with your lucid experiences, 
            while IRL goals track your real-world obedience and rituals.
          </p>
        </header>

        {/* Quest Statistics Cards with magical styling */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-400/50 rounded-xl p-4 text-center shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-cyan-300 drop-shadow-lg animate-pulse">{stats.dreamActive}</div>
            <div className="text-sm text-cyan-200 font-medium">🌙 Dream Goals</div>
          </div>
          <div className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-400/50 rounded-xl p-4 text-center shadow-[0_0_20px_rgba(244,114,182,0.2)] hover:shadow-[0_0_30px_rgba(244,114,182,0.3)] transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-pink-300 drop-shadow-lg animate-pulse">{stats.irlActive}</div>
            <div className="text-sm text-pink-200 font-medium">🌸 IRL Goals</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-400/50 rounded-xl p-4 text-center shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-emerald-300 drop-shadow-lg animate-pulse">{stats.completed}</div>
            <div className="text-sm text-emerald-200 font-medium">✅ Completed</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-400/50 rounded-xl p-4 text-center shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold text-purple-300 drop-shadow-lg animate-pulse">{stats.totalXp.toLocaleString()}</div>
            <div className="text-sm text-purple-200 font-medium">⭐ Total XP</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap gap-2">
          {TAB_OPTIONS.map((tab) => {
            const active = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full border px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition-all duration-300 transform hover:scale-105 ${
                  active
                    ? "border-fuchsia-400/70 bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-fuchsia-100 shadow-[0_0_25px_rgba(244,114,182,0.5)] animate-pulse"
                    : "border-slate-700/60 bg-slate-900/60 text-slate-300 hover:border-slate-500/60 hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(100,116,139,0.3)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Filters and Search */}
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Quests</label>
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-fuchsia-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-fuchsia-400/50 focus:outline-none"
                title="Filter by difficulty"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-fuchsia-400/50 focus:outline-none"
                title="Sort quests by criteria"
              >
                <option value="priority">Priority</option>
                <option value="progress">Progress</option>
                <option value="difficulty">Difficulty</option>
                <option value="created">Created Date</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDifficulty('all');
                  setSortBy('priority');
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded px-3 py-2 text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Quest List */}
        <section className="space-y-6">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl opacity-30 mb-4">📜</div>
              <p className="text-gray-400 text-xl mb-2">No quests found</p>
              <p className="text-gray-500">
                {activeTab === 'all' ? 'Try adjusting your filters or start a new quest' : 
                 activeTab === 'completed' ? 'Complete some quests to see them here' :
                 'No active quests in this category'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onUpdateStep={(stepId, done) => updateQuestStep(quest.id, stepId, done)}
                  onComplete={() => completeQuest(quest)}
                  onAbandon={() => abandonQuest(quest.id)}
                  showActions={quest.status === 'active'}
                />
              ))}
            </div>
          )}
        </section>

        {/* Reward Popup */}
        {showRewardPopup && (
          <QuestRewardPopup
            quest={showRewardPopup.quest}
            rewards={showRewardPopup.rewards}
            onClose={closeRewardPopup}
            show={!!showRewardPopup}
          />
        )}
      </div>
    </QuestLayout>
  );
}
