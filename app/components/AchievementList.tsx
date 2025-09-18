'use client';

import { useState } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import { type AchievementCategory } from '../lib/achievements';
import AchievementCard from './AchievementCard';

const CATEGORIES: AchievementCategory[] = ['All', 'Dream', 'Ritual', 'Shame', 'Dungeon', 'Companion'];

export default function AchievementList() {
  const { achievements } = useAchievements();
  const [filter, setFilter] = useState<AchievementCategory>('All');

  const filteredAchievements = achievements.filter(
    a => filter === 'All' || a.category === filter
  );

  return (
    <div>
      <div className="flex justify-center mb-8 space-x-2 bg-slate-900/50 p-2 rounded-full border border-slate-700">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
              filter === category
                ? 'bg-fuchsia-500 text-white shadow-[0_0_10px_rgba(244,114,182,0.5)]'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
