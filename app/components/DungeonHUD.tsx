'use client';

type DungeonHUDProps = {
  dungeonName: string;
  currentRoom: number;
  totalRooms: number;
  hp: number;
  maxHp: number;
  xpGained: number;
  loot: string[];
};

export function DungeonHUD({ dungeonName, currentRoom, totalRooms, hp, maxHp, xpGained, loot }: DungeonHUDProps) {
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));

  return (
    <div className="rounded-3xl border border-purple-500/40 bg-[#0f021d]/80 p-4 text-slate-100 shadow-[0_0_45px_rgba(168,85,247,0.25)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-purple-200/70">Nightmare Run</p>
          <h2 className="text-lg font-semibold text-white">{dungeonName}</h2>
        </div>
        <div className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
          Room {currentRoom + 1} / {totalRooms}
        </div>
      </header>

      <section className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-purple-200/80">
            <span>Vitality</span>
            <span>
              {hp} / {maxHp}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-purple-900/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-purple-400 to-sky-400 transition-all duration-500"
              style={{ width: `${hpRatio * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3">
            <div className="text-[0.65rem] uppercase tracking-[0.3em] text-purple-200/80">XP Gathered</div>
            <div className="mt-1 text-xl font-semibold text-white">{xpGained}</div>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3">
            <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">Loot Collected</div>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-purple-100">
              {loot.length === 0 ? <span>None yet</span> : loot.map((item, index) => (
                <span key={`${item}-${index}`} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DungeonHUD;
