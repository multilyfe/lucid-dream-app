'use client';

type ProfileAchievementsProps = {
  achievements: string[];
  total: number;
};

export function ProfileAchievements({ achievements, total }: ProfileAchievementsProps) {
  const percentage = total > 0 ? Math.round((achievements.length / total) * 100) : 0;

  return (
    <div className="space-y-4 rounded-3xl border border-amber-500/30 bg-slate-950/70 p-5 shadow-[0_0_45px_rgba(251,191,36,0.2)]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Achievements</p>
          <h2 className="text-lg font-semibold text-white">{achievements.length} / {total} unlocked</h2>
        </div>
        <div className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-100">
          {percentage}% complete
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {achievements.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-amber-400/40 bg-amber-500/10 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-amber-200">
            No achievements yet. Explore dreams to earn accolades.
          </p>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement}
              className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-transparent to-amber-500/15 px-4 py-3 text-sm text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
            >
              {achievement}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProfileAchievements;
