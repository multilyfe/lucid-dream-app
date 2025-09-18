'use client';

import { useMemo } from 'react';
import { DreamJournalEntry, TAG_COLORS } from '../types/journal';
import useHydrated from '../hooks/useHydrated';

interface JournalEntryCardProps {
  entry: DreamJournalEntry;
  onEdit?: (entry: DreamJournalEntry) => void;
  onDelete?: (id: string) => void;
}

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const hydrated = useHydrated();
  const isLucid = entry.tags.includes('lucid');
  const contentPreview = entry.content.length > 200 
    ? entry.content.slice(0, 200) + '...' 
    : entry.content;

  const getTagColor = (tag: string) => {
    return TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'amazing': return '🌟';
      case 'good': return '😊';
      case 'neutral': return '😐';
      case 'challenging': return '😤';
      case 'difficult': return '😰';
      default: return '💭';
    }
  };

  const getLucidityBadge = (lucidity?: string) => {
    switch (lucidity) {
      case 'full': return 'FULLY LUCID';
      case 'partial': return 'PARTIALLY LUCID';
      default: return null;
    }
  };

  return (
    <div className="journal-entry-card group relative overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Glowing parchment effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 opacity-60" />
      
      {/* Lucid dream glow */}
      {isLucid && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-200 transition-colors">
                {entry.title}
              </h3>
              {isLucid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-semibold text-yellow-200 shadow-md shadow-yellow-500/20">
                  ✨ {getLucidityBadge(entry.lucidity)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                📅 {hydrated ? new Date(entry.date).toLocaleDateString() : '...'}
              </span>
              <span className="flex items-center gap-1">
                {getMoodEmoji(entry.mood)} {entry.mood || 'No mood'}
              </span>
              {entry.vividness && (
                <span className="flex items-center gap-1">
                  🎨 {entry.vividness}/10
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-sm font-semibold text-purple-200 shadow-md shadow-purple-500/20">
              ⚡ {entry.xpEarned} XP
            </div>
            
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="rounded-lg bg-slate-700/60 p-2 text-slate-300 transition-colors hover:bg-slate-600/60 hover:text-white"
                title="Edit entry"
              >
                ✏️
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                className="rounded-lg bg-slate-700/60 p-2 text-slate-300 transition-colors hover:bg-red-600/60 hover:text-red-200"
                title="Delete entry"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Content preview */}
        <div className="mb-4">
          <p className="text-slate-300 leading-relaxed">
            {contentPreview}
          </p>
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-md transition-all duration-200 hover:scale-105 ${getTagColor(tag)}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Companions and Places */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          {entry.companions.length > 0 && (
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{entry.companions.join(', ')}</span>
            </div>
          )}
          
          {entry.places.length > 0 && (
            <div className="flex items-center gap-1">
              <span>🌍</span>
              <span>{entry.places.join(', ')}</span>
            </div>
          )}
          
          {entry.media.length > 0 && (
            <div className="flex items-center gap-1">
              <span>📎</span>
              <span>{entry.media.length} attachment{entry.media.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-4 pt-4 border-t border-slate-600/40 text-xs text-slate-500">
          Created: {hydrated ? new Date(entry.createdAt).toLocaleString() : '...'}
          {entry.updatedAt !== entry.createdAt && (
            <span className="ml-4">
              Updated: {hydrated ? new Date(entry.updatedAt).toLocaleString() : '...'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}