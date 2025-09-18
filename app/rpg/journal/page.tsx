'use client';

import { useState, useMemo } from 'react';
import QuestLayout from "../../layouts/QuestLayout";
import { useDreamJournal } from '../../hooks/useDreamJournal';
import { JournalEntryCard } from '../../components/JournalEntryCard';
import { JournalFilterComponent } from '../../components/JournalFilter';
import { JournalModalEnhanced } from '../../components/JournalModalEnhanced';
import { DreamJournalEntry, JournalFilter } from '../../types/journal';

export default function JournalPage() {
  const { 
    entries, 
    streak, 
    stats, 
    achievements, 
    addEntry, 
    updateEntry, 
    deleteEntry, 
    filterEntries 
  } = useDreamJournal();

  const [filter, setFilter] = useState<Partial<JournalFilter>>({
    searchText: '',
    tags: [],
    companions: [],
    places: [],
    dateFrom: '',
    dateTo: '',
    minXp: 0,
    maxXp: 0,
    mood: [],
    lucidity: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DreamJournalEntry | undefined>();

  const filteredEntries = useMemo(() => {
    return filterEntries(filter);
  }, [filterEntries, filter]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach(entry => entry.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [entries]);

  const availableCompanions = useMemo(() => {
    const companionSet = new Set<string>();
    entries.forEach(entry => entry.companions.forEach(comp => companionSet.add(comp)));
    return Array.from(companionSet).sort();
  }, [entries]);

  const availablePlaces = useMemo(() => {
    const placeSet = new Set<string>();
    entries.forEach(entry => entry.places.forEach(place => placeSet.add(place)));
    return Array.from(placeSet).sort();
  }, [entries]);

  const handleNewEntry = () => {
    setEditingEntry(undefined);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: DreamJournalEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (entryData: Omit<DreamJournalEntry, 'id' | 'xpEarned' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, entryData);
    } else {
      addEntry(entryData);
    }
    setIsModalOpen(false);
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this dream entry?')) {
      deleteEntry(id);
    }
  };

  return (
    <QuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-100 mb-2">
                  📖 Dream Journal
                </h1>
                <p className="text-slate-400">
                  Document your journey through the realm of dreams
                </p>
              </div>
              
              <button
                onClick={handleNewEntry}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
              >
                ✨ New Entry
              </button>
            </div>

            {/* Streak Meter */}
            <div className="bg-slate-900/60 rounded-xl border border-slate-700/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Dream Streak</h3>
                  <p className="text-sm text-slate-400">Keep the momentum going!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-400">
                    🔥 {streak.current} day{streak.current !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-slate-400">
                    Best: {streak.longest} days
                  </div>
                </div>
              </div>
              
              {/* Streak Flame Bar */}
              <div className="relative h-4 bg-slate-800/60 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30"
                  style={{ width: `${Math.min((streak.current / 30) * 100, 100)}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>New Dreamer</span>
                <span>Dream Master (30 days)</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900/60 rounded-xl border border-slate-700/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400">{stats.totalEntries}</div>
              <div className="text-sm text-slate-400">Total Dreams</div>
            </div>
            
            <div className="bg-slate-900/60 rounded-xl border border-slate-700/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400">{stats.totalXpEarned.toLocaleString()}</div>
              <div className="text-sm text-slate-400">Total XP Earned</div>
            </div>
            
            <div className="bg-slate-900/60 rounded-xl border border-slate-700/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-yellow-400">{stats.lucidDreamCount}</div>
              <div className="text-sm text-slate-400">Lucid Dreams</div>
            </div>
            
            <div className="bg-slate-900/60 rounded-xl border border-slate-700/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-400">{stats.entriesThisMonth}</div>
              <div className="text-sm text-slate-400">This Month</div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-8">
            <JournalFilterComponent
              filter={filter}
              onFilterChange={setFilter}
              availableTags={availableTags}
              availableCompanions={availableCompanions}
              availablePlaces={availablePlaces}
            />
          </div>

          {/* Results Summary */}
          <div className="mb-6 text-slate-400">
            Showing {filteredEntries.length} of {entries.length} dream{filteredEntries.length !== 1 ? 's' : ''}
          </div>

          {/* Entries Grid */}
          {filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEntries.map(entry => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No dreams found</h3>
              <p className="text-slate-400 mb-6">
                {entries.length === 0 
                  ? "Start your dream journal by recording your first entry!"
                  : "Try adjusting your filters or search terms."
                }
              </p>
              {entries.length === 0 && (
                <button
                  onClick={handleNewEntry}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  ✨ Record Your First Dream
                </button>
              )}
            </div>
          )}

          {/* Achievements Panel */}
          {achievements.length > 0 && (
            <div className="mt-12 bg-slate-900/60 rounded-xl border border-slate-700/60 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">🏆 Dream Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 border border-yellow-400/40 px-4 py-2 text-sm font-medium text-yellow-200 shadow-md shadow-yellow-500/20"
                  >
                    🏆 {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <JournalModalEnhanced
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(undefined);
          }}
          onSave={handleSaveEntry}
          editEntry={editingEntry}
        />
      </div>
    </QuestLayout>
  );
}
