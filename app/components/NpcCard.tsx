'use client';

import RelationshipMeter from "./RelationshipMeter";

type NpcCardProps = {
  name: string;
  role: string;
  dreamCount: number;
  trust: number;
  shame: number;
  onSelect?: () => void;
};

export function NpcCard({ name, role, dreamCount, trust, shame, onSelect }: NpcCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-left text-slate-100 shadow-[0_0_35px_rgba(236,72,153,0.2)] transition hover:-translate-y-1 hover:border-fuchsia-500/40 hover:shadow-[0_0_45px_rgba(236,72,153,0.35)]"
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <span className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-fuchsia-100">
            {role}
          </span>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-300/80">Dreams logged · {dreamCount}</p>
      </div>
      <RelationshipMeter trust={trust} shame={shame} compact />
    </button>
  );
}

export default NpcCard;
