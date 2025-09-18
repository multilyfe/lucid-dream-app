'use client';

import { type DetailedCompanion } from '../hooks/useCompanions';

type ProfileCompanionsProps = {
  companions: DetailedCompanion[];
};

export function ProfileCompanions({ companions }: ProfileCompanionsProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-purple-500/30 bg-slate-950/70 p-5 shadow-[0_0_45px_rgba(168,85,247,0.2)]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-purple-200/70">Companion Roster</p>
          <h2 className="text-lg font-semibold text-white">{companions.length} bonded allies</h2>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {companions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-purple-500/40 bg-purple-500/10 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-purple-200">
            No companions yet. Complete rituals and quests to summon allies.
          </p>
        ) : (
          companions.map((companion) => (
            <div
              key={companion.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>
                  {companion.activeFormDefinition?.icon ?? '✨'}
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{companion.name}</div>
                  <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                    Lv {companion.level} · {companion.activeFormDefinition?.name ?? 'Unknown Form'}
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-purple-100">
                XP {companion.totalXp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProfileCompanions;
