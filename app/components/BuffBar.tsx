'use client';

import { BuffBadge } from "./BuffBadge";
import { useBuffs } from "../hooks/useBuffs";
import useHydrated from "../hooks/useHydrated";

export function BuffBar() {
  const hydrated = useHydrated();
  const { activeBuffs } = useBuffs();

  if (!hydrated || activeBuffs.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-slate-800/60 bg-slate-950/80 px-6 py-3 shadow-inner shadow-slate-900/60">
      <div className="flex flex-wrap gap-3">
        {activeBuffs.map((buff) => (
          <BuffBadge key={buff.id} buff={buff} />
        ))}
      </div>
    </div>
  );
}
