'use client';

import QuestLayout from '../../layouts/QuestLayout';
import AchievementList from '../../components/AchievementList';

export default function AchievementsPage() {
  return (
    <QuestLayout>
      <div className="p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-300 text-shadow-amber">
            🏆 Achievements
          </h1>
          <p className="text-amber-200/80 mt-2 text-lg">A testament to your journey through the dreamscape.</p>
        </header>
        
        <AchievementList />
      </div>
    </QuestLayout>
  );
}
