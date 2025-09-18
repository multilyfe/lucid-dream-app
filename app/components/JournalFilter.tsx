'use client';

import { useState } from 'react';
import { JournalFilter } from '../types/journal';

interface JournalFilterProps {
  filter: Partial<JournalFilter>;
  onFilterChange: (filter: Partial<JournalFilter>) => void;
  availableTags: string[];
  availableCompanions: string[];
  availablePlaces: string[];
}

export function JournalFilterComponent({ 
  filter, 
  onFilterChange, 
  availableTags, 
  availableCompanions, 
  availablePlaces 
}: JournalFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTagToggle = (tag: string) => {
    const currentTags = filter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFilterChange({ ...filter, tags: newTags });
  };

  const handleCompanionToggle = (companion: string) => {
    const currentCompanions = filter.companions || [];
    const newCompanions = currentCompanions.includes(companion)
      ? currentCompanions.filter(c => c !== companion)
      : [...currentCompanions, companion];
    onFilterChange({ ...filter, companions: newCompanions });
  };

  const handlePlaceToggle = (place: string) => {
    const currentPlaces = filter.places || [];
    const newPlaces = currentPlaces.includes(place)
      ? currentPlaces.filter(p => p !== place)
      : [...currentPlaces, place];
    onFilterChange({ ...filter, places: newPlaces });
  };

  const clearFilters = () => {
    onFilterChange({
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
  };

  const activeFilterCount = [
    filter.searchText,
    filter.tags?.length,
    filter.companions?.length,
    filter.places?.length,
    filter.dateFrom,
    filter.dateTo,
    filter.minXp,
    filter.maxXp,
    filter.mood?.length,
    filter.lucidity?.length,
  ].filter(Boolean).length;

  return (
    <div className="journal-filter bg-slate-900/60 rounded-xl border border-slate-700/60 p-4 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search dreams..."
            value={filter.searchText || ''}
            onChange={(e) => onFilterChange({ ...filter, searchText: e.target.value })}
            className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 pr-12 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-600/40 text-slate-200 transition-colors hover:bg-slate-700/60"
        >
          🎛️ Filters
          {activeFilterCount > 0 && (
            <span className="bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-400/40 text-red-200 transition-colors hover:bg-red-600/30"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={filter.dateFrom || ''}
                onChange={(e) => onFilterChange({ ...filter, dateFrom: e.target.value })}
                className="rounded-lg bg-slate-800/60 border border-slate-600/40 px-3 py-2 text-slate-200 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
              />
              <input
                type="date"
                value={filter.dateTo || ''}
                onChange={(e) => onFilterChange({ ...filter, dateTo: e.target.value })}
                className="rounded-lg bg-slate-800/60 border border-slate-600/40 px-3 py-2 text-slate-200 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
              />
            </div>
          </div>

          {/* XP Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">XP Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min XP"
                value={filter.minXp || ''}
                onChange={(e) => onFilterChange({ ...filter, minXp: parseInt(e.target.value) || 0 })}
                className="rounded-lg bg-slate-800/60 border border-slate-600/40 px-3 py-2 text-slate-200 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
              />
              <input
                type="number"
                placeholder="Max XP"
                value={filter.maxXp || ''}
                onChange={(e) => onFilterChange({ ...filter, maxXp: parseInt(e.target.value) || 0 })}
                className="rounded-lg bg-slate-800/60 border border-slate-600/40 px-3 py-2 text-slate-200 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
              />
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      filter.tags?.includes(tag)
                        ? 'bg-purple-500/40 border-purple-400/60 text-purple-200'
                        : 'bg-slate-700/40 border-slate-600/40 text-slate-300 hover:bg-slate-600/40'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companions */}
          {availableCompanions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Companions</label>
              <div className="flex flex-wrap gap-2">
                {availableCompanions.map(companion => (
                  <button
                    key={companion}
                    onClick={() => handleCompanionToggle(companion)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      filter.companions?.includes(companion)
                        ? 'bg-blue-500/40 border-blue-400/60 text-blue-200'
                        : 'bg-slate-700/40 border-slate-600/40 text-slate-300 hover:bg-slate-600/40'
                    }`}
                  >
                    👥 {companion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Places */}
          {availablePlaces.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Places</label>
              <div className="flex flex-wrap gap-2">
                {availablePlaces.map(place => (
                  <button
                    key={place}
                    onClick={() => handlePlaceToggle(place)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      filter.places?.includes(place)
                        ? 'bg-green-500/40 border-green-400/60 text-green-200'
                        : 'bg-slate-700/40 border-slate-600/40 text-slate-300 hover:bg-slate-600/40'
                    }`}
                  >
                    🌍 {place}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}