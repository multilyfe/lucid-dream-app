'use client';

type StatCard = {
  label: string;
  value: string | number;
  glow: string;
  description?: string;
};

type ProfileStatsProps = {
  stats: StatCard[];
};

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_0_35px_rgba(148,163,184,0.25)]`}
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.glow} opacity-35`} />
          <div className="relative z-10 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">{stat.label}</p>
            <h3 className="text-2xl font-semibold text-white">{stat.value}</h3>
            {stat.description ? (
              <p className="text-xs text-slate-300/80">{stat.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProfileStats;
