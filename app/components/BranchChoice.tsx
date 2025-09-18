'use client';

import type { QuestBranch } from "../lib/questlines";

type BranchChoiceProps = {
  branches: QuestBranch[];
  chosenId?: string | null;
  onChoose: (branchId: string) => void;
};

export function BranchChoice({ branches, chosenId, onChoose }: BranchChoiceProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-fuchsia-400/40 bg-fuchsia-500/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100">
        Choose your path
      </p>
      <div className="flex flex-col gap-2">
        {branches.map((branch) => {
          const active = branch.id === chosenId;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onChoose(branch.id)}
              className={`rounded-2xl border px-3 py-2 text-left text-xs uppercase tracking-[0.3em] transition ${
                active
                  ? 'border-amber-400/60 bg-amber-500/20 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                  : 'border-fuchsia-300/40 bg-slate-950/60 text-slate-200 hover:border-amber-400/50 hover:bg-amber-500/15'
              }`}
            >
              <span className="block text-sm normal-case tracking-normal text-white">
                {branch.title}
              </span>
              {branch.description ? (
                <span className="mt-1 block text-[0.65rem] font-normal uppercase tracking-[0.35em] text-slate-200/80">
                  {branch.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
