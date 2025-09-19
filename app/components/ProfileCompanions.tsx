'use client';

import { type Companion, getActiveForm } from '../lib/companions';

type ProfileCompanionsProps = {
  companions: Companion[] | undefined | null;
};

export function ProfileCompanions({ companions }: ProfileCompanionsProps) {
  const list = companions ?? [];
  return (
    <div className="space-y-4 rounded-3xl border border-purple-500/30 bg-slate-950/70 p-5 shadow-[0_0_45px_rgba(168,85,247,0.2)]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-purple-200/70">Companion Roster</p>
          <h2 className="text-lg font-semibold text-white">{list.length} bonded allies</h2>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-purple-500/40 bg-purple-500/10 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-purple-200">
            No companions yet. Complete rituals and quests to summon allies.
          </p>
        ) : (
          list.map((companion) => {
            const active = getActiveForm(companion);
            return (
              <div
                key={companion.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {active?.icon ?? '✨'}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">{companion.name}</div>
                    <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                      Lv {companion.level} · {active?.name ?? 'Unknown Form'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-purple-100">
                  XP {companion.xp}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ProfileCompanions;
