'use client';

import type { ReactNode } from "react";
import type { QuestStage } from "../lib/questlines";

type QuestStageProps = {
  stage: QuestStage;
  index: number;
  isActive: boolean;
  onComplete?: () => void;
  children?: ReactNode;
};

export function QuestStage({ stage, index, isActive, onComplete, children }: QuestStageProps) {
  const completeLabel = stage.completed ? 'Completed' : isActive ? 'Complete Stage' : 'Locked';

  return (
    <div
      className={`space-y-3 rounded-3xl border px-5 py-4 transition ${
        stage.completed
          ? 'border-emerald-400/60 bg-emerald-500/10'
          : isActive
          ? 'border-fuchsia-400/60 bg-slate-950/70'
          : 'border-slate-700/60 bg-slate-900/60 opacity-75'
      }`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-200">
        <span>Stage {index + 1}</span>
        <span>{stage.xp} XP</span>
      </div>
      <div>
        <h4 className="text-lg font-semibold tracking-wide text-white drop-shadow">{stage.title}</h4>
        {stage.description ? (
          <p className="mt-1 text-sm text-slate-200/90">{stage.description}</p>
        ) : null}
      </div>

      {children}

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
          {stage.completed ? 'Stage completed' : isActive ? 'Ready' : 'Awaiting previous stages'}
        </span>
        {onComplete ? (
          <button
            type="button"
            onClick={onComplete}
            disabled={!isActive || stage.completed}
            className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] transition ${
              stage.completed
                ? 'cursor-not-allowed border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                : isActive
                ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30'
                : 'cursor-not-allowed border-slate-700/60 bg-slate-900/60 text-slate-400'
            }`}
          >
            {completeLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
