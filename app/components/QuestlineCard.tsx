'use client';

import { getQuestlineProgress, type Questline } from "../lib/questlines";

type QuestlineCardProps = {
  questline: Questline;
  onSelect?: (questline: Questline) => void;
  active?: boolean;
};

export function QuestlineCard({ questline, onSelect, active }: QuestlineCardProps) {
  const progress = getQuestlineProgress(questline);

  const stageLabel = `${progress.completed}/${progress.total} stages`;
  const rewardLabel = questline.reward?.item
    ? `Reward: ${questline.reward.item}`
    : questline.reward?.title
    ? `Title: ${questline.reward.title}`
    : questline.reward?.xp
    ? `XP: ${questline.reward.xp}`
    : "";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(questline)}
      className={`w-full rounded-3xl border px-5 py-6 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
        active
          ? "border-amber-400/60 bg-slate-950/80 shadow-[0_0_35px_rgba(251,191,36,0.35)]"
          : questline.completed
          ? "border-amber-400/40 bg-slate-950/70 shadow-[0_0_25px_rgba(251,191,36,0.25)]"
          : "border-slate-700/50 bg-slate-950/60 shadow-[0_0_20px_rgba(15,23,42,0.45)] hover:border-fuchsia-400/60 hover:shadow-[0_0_30px_rgba(244,114,182,0.35)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            <span>{questline.realm ?? "Realm Unknown"}</span>
            {questline.branching ? (
              <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-2 py-0.5 text-[0.6rem] text-fuchsia-200">
                Branching
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold tracking-wide text-white drop-shadow">
            {questline.name}
          </h3>
          {questline.description ? (
            <p className="text-sm text-slate-300/90">{questline.description}</p>
          ) : null}
        </div>
        <div className="text-right text-xs uppercase tracking-[0.35em] text-slate-300">
          {stageLabel}
        </div>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-slate-900/70">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-400 to-sky-400"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/80">
        <span>{progress.percent}% complete</span>
        <span>{rewardLabel}</span>
      </div>
    </button>
  );
}
