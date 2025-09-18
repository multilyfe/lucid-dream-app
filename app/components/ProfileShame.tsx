'use client';

type ProfileShameProps = {
  pantyRituals: number;
  shameTokens: number;
  dungeonClears: number;
};

export function ProfileShame({ pantyRituals, shameTokens, dungeonClears }: ProfileShameProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-rose-500/30 bg-slate-950/70 p-5 shadow-[0_0_45px_rgba(244,63,94,0.2)]">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-rose-200/70">Shame Ledger</p>
        <h2 className="text-lg font-semibold text-white">Humiliation & indulgence stats</h2>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-rose-200/80">Panty rituals</div>
          <div className="mt-2 text-2xl font-semibold text-white">{pantyRituals}</div>
        </div>
        <div className="rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-3">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-fuchsia-200/80">Dirty Tokens</div>
          <div className="mt-2 text-2xl font-semibold text-white">{shameTokens}</div>
        </div>
        <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-3">
          <div className="text-[0.65rem] uppercase tracking-[0.3em] text-purple-200/80">Dungeon clears</div>
          <div className="mt-2 text-2xl font-semibold text-white">{dungeonClears}</div>
        </div>
      </div>
    </div>
  );
}

export default ProfileShame;
