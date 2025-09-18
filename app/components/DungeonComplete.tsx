'use client';

type DungeonCompleteProps = {
  dungeonName: string;
  xpTotal: number;
  loot: string[];
  achievements: string[];
  onRestart: () => void;
  onClose: () => void;
};

export function DungeonComplete({ dungeonName, xpTotal, loot, achievements, onRestart, onClose }: DungeonCompleteProps) {
  return (
    <div className="rounded-3xl border border-emerald-400/40 bg-[#041511]/85 p-6 text-slate-100 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500/30 via-transparent to-transparent">
        <span className="text-4xl drop-shadow-[0_0_14px_rgba(16,185,129,0.6)]" aria-hidden>
          🗝️
        </span>
        <div className="absolute inset-0 animate-pulse rounded-full border border-emerald-400/30"></div>
      </div>

      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Dungeon Cleared</p>
        <h2 className="text-2xl font-semibold text-white">{dungeonName}</h2>
      </header>

      <section className="mt-6 space-y-4">
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-emerald-200/80">Total XP Earned</p>
          <p className="mt-1 text-3xl font-semibold text-white">{xpTotal}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">Loot Secured</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-emerald-100">
            {loot.length === 0 ? <span>No treasure recovered</span> : loot.map((item, index) => (
              <span key={`${item}-${index}`} className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">Achievements</p>
          <div className="mt-2 space-y-1 text-sm text-slate-200">
            {achievements.length === 0 ? <p>No new achievements.</p> : achievements.map((achievement) => (
              <p key={achievement}>• {achievement}</p>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-6 flex flex-wrap justify-center gap-3 text-xs uppercase tracking-[0.3em]">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-5 py-2 font-semibold text-emerald-100 hover:bg-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#041511]"
        >
          Run Again
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-500/60 bg-slate-800/60 px-5 py-2 font-semibold text-slate-200 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#041511]"
        >
          Return to Sanctum
        </button>
      </footer>
    </div>
  );
}

export default DungeonComplete;
