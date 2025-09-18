'use client';

import { useState } from 'react';
import { DreamJournalEntry } from '../types/journal';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DreamJournalEntry, 'id' | 'xpEarned' | 'createdAt' | 'updatedAt'>) => void;
  editEntry?: DreamJournalEntry;
}

export function JournalModal({ isOpen, onClose, onSave, editEntry }: JournalModalProps) {
  const [formData, setFormData] = useState({
    title: editEntry?.title || '',
    date: editEntry?.date || new Date().toISOString().split('T')[0],
    content: editEntry?.content || '',
    tags: editEntry?.tags?.join(', ') || '',
    companions: editEntry?.companions?.join(', ') || '',
    places: editEntry?.places?.join(', ') || '',
    mood: editEntry?.mood || 'neutral',
    lucidity: editEntry?.lucidity || 'none',
    vividness: editEntry?.vividness || 5,
    media: editEntry?.media || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = {
      title: formData.title,
      date: formData.date,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      companions: formData.companions.split(',').map(c => c.trim()).filter(Boolean),
      places: formData.places.split(',').map(p => p.trim()).filter(Boolean),
      mood: formData.mood as DreamJournalEntry['mood'],
      lucidity: formData.lucidity as DreamJournalEntry['lucidity'],
      vividness: formData.vividness,
      media: formData.media,
    };
    
    onSave(entry);
    onClose();
  };

  const handleTagInput = (value: string) => {
    // Auto-suggest common tags
    const commonTags = ['lucid', 'ritual', 'panty', 'temple', 'flying', 'nightmare', 'transformation', 'quest'];
    // Implementation would include autocomplete functionality
    setFormData(prev => ({ ...prev, tags: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="journal-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-600/40 rounded-xl shadow-2xl shadow-purple-500/20 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-600/40 pb-4">
            <h2 className="text-2xl font-bold text-slate-100">
              {editEntry ? '✏️ Edit Dream Entry' : '✨ New Dream Entry'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-700/60 p-2 text-slate-300 transition-colors hover:bg-slate-600/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Dream Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Enter your dream title..."
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">
                  Dream Date *
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                />
              </div>

              {/* Mood & Lucidity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mood" className="block text-sm font-medium text-slate-300 mb-2">
                    Mood
                  </label>
                  <select
                    id="mood"
                    value={formData.mood}
                    onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value as DreamJournalEntry['mood'] }))}
                    className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  >
                    <option value="amazing">🌟 Amazing</option>
                    <option value="good">😊 Good</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="challenging">😤 Challenging</option>
                    <option value="difficult">😰 Difficult</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lucidity" className="block text-sm font-medium text-slate-300 mb-2">
                    Lucidity Level
                  </label>
                  <select
                    id="lucidity"
                    value={formData.lucidity}
                    onChange={(e) => setFormData(prev => ({ ...prev, lucidity: e.target.value as DreamJournalEntry['lucidity'] }))}
                    className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  >
                    <option value="none">Not Lucid</option>
                    <option value="partial">Partially Lucid</option>
                    <option value="full">Fully Lucid</option>
                  </select>
                </div>
              </div>

              {/* Vividness */}
              <div>
                <label htmlFor="vividness" className="block text-sm font-medium text-slate-300 mb-2">
                  Vividness: {formData.vividness}/10
                </label>
                <input
                  id="vividness"
                  type="range"
                  min="1"
                  max="10"
                  value={formData.vividness}
                  onChange={(e) => setFormData(prev => ({ ...prev, vividness: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Blurry</span>
                  <span>Crystal Clear</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleTagInput(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="lucid, ritual, temple (comma-separated)"
                />
                <div className="mt-2 text-xs text-slate-400">
                  Common tags: lucid, ritual, panty, temple, flying, nightmare, transformation, quest
                </div>
              </div>

              {/* Companions */}
              <div>
                <label htmlFor="companions" className="block text-sm font-medium text-slate-300 mb-2">
                  Dream Companions
                </label>
                <input
                  id="companions"
                  type="text"
                  value={formData.companions}
                  onChange={(e) => setFormData(prev => ({ ...prev, companions: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Mommy Luma, Guide, etc. (comma-separated)"
                />
              </div>

              {/* Places */}
              <div>
                <label htmlFor="places" className="block text-sm font-medium text-slate-300 mb-2">
                  Dream Locations
                </label>
                <input
                  id="places"
                  type="text"
                  value={formData.places}
                  onChange={(e) => setFormData(prev => ({ ...prev, places: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  placeholder="Temple, Lucid World, etc. (comma-separated)"
                />
              </div>

              {/* Media Upload Placeholder */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Media Attachments
                </label>
                <div className="border-2 border-dashed border-slate-600/40 rounded-lg p-6 text-center text-slate-400">
                  <div className="text-2xl mb-2">📎</div>
                  <div className="text-sm">
                    Media upload functionality
                    <br />
                    (Coming soon)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
              Dream Description *
            </label>
            <textarea
              id="content"
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 resize-none"
              placeholder="Describe your dream in detail..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-600/40">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-slate-700/60 border border-slate-600/40 px-6 py-3 text-slate-200 transition-colors hover:bg-slate-600/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
            >
              {editEntry ? 'Update Dream' : 'Save Dream'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}