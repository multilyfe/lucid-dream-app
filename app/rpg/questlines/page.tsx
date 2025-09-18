'use client';

import { useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { QuestlineCard } from "../../components/QuestlineCard";
import { QuestStage } from "../../components/QuestStage";
import { BranchChoice } from "../../components/BranchChoice";
import { useQuestlines } from "../../hooks/useQuestlines";

export default function QuestlinesPage() {
  const {
    questlineSummaries,
    completeStage,
    chooseBranch,
    resetQuestline,
  } = useQuestlines();
  const [selectedId, setSelectedId] = useState<string | null>(
    () => questlineSummaries[0]?.questline.id ?? null
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const selected = useMemo(
    () => questlineSummaries.find((entry) => entry.questline.id === selectedId),
    [questlineSummaries, selectedId]
  );

  const handleComplete = (questlineId: string, stageId: string) => {
    const result = completeStage(questlineId, stageId);
    switch (result) {
      case "branch-required":
        setFeedback("Choose a branch before completing this stage.");
        break;
      case "already-completed":
        setFeedback("Stage already completed.");
        break;
      case "questline-completed":
        setFeedback("Questline completed! Rewards granted.");
        break;
      default:
        setFeedback("Stage complete.");
    }
  };

  const handleBranch = (questlineId: string, stageId: string, branchId: string) => {
    chooseBranch(questlineId, stageId, branchId);
    setFeedback("Branch chosen.");
  };

  return (
    <QuestLayout>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 text-slate-100">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-[0.35em] text-white">📖 Questlines</h1>
            {feedback ? (
              <div className="rounded-full border border-amber-400/50 bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
                {feedback}
              </div>
            ) : null}
          </div>
          <p className="max-w-3xl text-sm text-slate-300">
            Follow multi-stage story arcs tied to realms and companions. Complete stages to gain XP, loot, and buffs. Branching questlines offer choices that lock the path you walk.
          </p>
        </header>

        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-slate-300/80">Questlines</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {questlineSummaries.map(({ questline }) => (
              <QuestlineCard
                key={questline.id}
                questline={questline}
                onSelect={() => setSelectedId(questline.id)}
                active={questline.id === selectedId}
              />
            ))}
          </div>
        </section>

        {selected ? (
          <section className="space-y-4 rounded-3xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-[0_0_30px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-wide text-white drop-shadow">
                  {selected.questline.name}
                </h2>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
                  {selected.progress.completed}/{selected.progress.total} stages complete
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetQuestline(selected.questline.id)}
                className="rounded-full border border-slate-600/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 hover:bg-slate-800/60"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              {selected.questline.stages.map((stage, idx) => {
                const isActive = !stage.completed && selected.activeStage?.id === stage.id;
                return (
                  <QuestStage
                    key={stage.id}
                    stage={stage}
                    index={idx}
                    isActive={isActive}
                    onComplete={() => handleComplete(selected.questline.id, stage.id)}
                  >
                    {stage.branchChoices && stage.branchChoices.length > 0 ? (
                      <BranchChoice
                        branches={stage.branchChoices}
                        chosenId={stage.chosenBranchId ?? null}
                        onChoose={(branchId) => handleBranch(selected.questline.id, stage.id, branchId)}
                      />
                    ) : null}
                  </QuestStage>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </QuestLayout>
  );
}
