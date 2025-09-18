'use client';

import { useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import {
  useRitualsEngine,
  type CompleteRitualOutcome,
} from "../../hooks/useRitualsEngine";
import {
  describeMultiplier,
  type Ritual,
  type RitualFrequency,
  type RitualProgress,
} from "../../lib/rituals";

const SECTION_CONFIG: Array<{
  type: RitualFrequency;
  title: string;
  aura: string;
}> = [
  {
    type: "daily",
    title: "Daily Rituals",
    aura: "from-rose-500/30 via-fuchsia-500/20 to-purple-600/20",
  },
  {
    type: "weekly",
    title: "Weekly Rituals",
    aura: "from-sky-500/25 via-indigo-500/20 to-purple-600/15",
  },
  {
    type: "monthly",
    title: "Monthly Rituals",
    aura: "from-amber-500/20 via-rose-500/15 to-fuchsia-600/15",
  },
  {
    type: "yearly",
    title: "Yearly Rituals",
    aura: "from-emerald-500/20 via-teal-500/15 to-blue-600/15",
  },
];

type FeedbackState = {
  tone: "success" | "info" | "warning";
  message: string;
};

type RitualCardProps = {
  ritual: Ritual;
  progress?: RitualProgress;
  aura: string;
  onComplete: () => void;
  disabled: boolean;
};

function combineClasses(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function RitualCard({ ritual, progress, aura, onComplete, disabled }: RitualCardProps) {
  const streak = progress?.streak ?? 0;
  const completed = Boolean(progress?.completed);
  const multiplier = progress?.multiplier ?? 0;
  const multiplierInfo = describeMultiplier(ritual.type);

  const cardClasses = combineClasses([
    'relative overflow-hidden rounded-3xl border border-fuchsia-500/30 bg-slate-950/70 p-6 shadow-[0_0_25px_rgba(244,114,182,0.18)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(244,114,182,0.35)]',
    completed && 'opacity-60',
  ]);
  const auraClasses = 'pointer-events-none absolute inset-0 bg-gradient-to-br ' + aura + ' opacity-40';
  const statusLabel = completed ? 'Completed this cycle' : 'Awaiting submission';
  const buttonClasses = combineClasses([
    'rounded-2xl border border-fuchsia-400/40 px-4 py-2 text-[0.7rem] font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    (disabled || completed) && 'cursor-not-allowed bg-slate-900/70 text-slate-400',
    !(disabled || completed) && 'bg-gradient-to-r from-fuchsia-500 via-rose-400 to-sky-400 hover:shadow-[0_0_25px_rgba(244,114,182,0.35)]',
  ]);

  return (
    <div className={cardClasses}>
      <div className={auraClasses} />
      {completed ? (
        <span className="absolute right-4 top-4 text-3xl" aria-label="Completed">✅</span>
      ) : null}

      <div className="relative z-10 flex h-full flex-col gap-4 text-slate-100">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-wide text-white drop-shadow">{ritual.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.35em] text-slate-300/80">{ritual.type.toUpperCase()} RITUAL</p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.3em] text-fuchsia-200">
            Streak {streak}
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm shadow-inner shadow-slate-950/60">
          <p className="flex items-center justify-between text-slate-200">
            <span>XP Tribute</span>
            <span className="font-semibold text-amber-300">+{ritual.xp} XP</span>
          </p>
          <p className="mt-2 flex items-center justify-between text-slate-200">
            <span>Obedience Yield</span>
            <span className="font-semibold text-fuchsia-200">+{ritual.obedience}</span>
          </p>
          {multiplier > 0 ? (
            <p className="mt-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100">
              Streak bonus active · +{Math.round(multiplier * 100)}% XP
            </p>
          ) : multiplierInfo ? (
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-300">
              {'Bonus after ' + multiplierInfo.threshold + ' completions · +' + Math.round(multiplierInfo.bonus * 100) + '% XP'}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
          <span className="text-slate-300">{statusLabel}</span>
          <button type="button" onClick={onComplete} disabled={disabled || completed} className={buttonClasses}>
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RitualsPage() {
  const { rituals, logs, progressById, completeRitual, xp, obedience } = useRitualsEngine();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      SECTION_CONFIG.map((section) => ({
        ...section,
        rituals: rituals
          .filter((ritual) => ritual.type === section.type)
          .sort((a, b) => a.name.localeCompare(b.name)),
      })),
    [rituals]
  );

  const ritualLookup = useMemo(() => {
    const map = new Map<string, Ritual>();
    rituals.forEach((ritual) => map.set(ritual.id, ritual));
    return map;
  }, [rituals]);

  const handleComplete = (ritualId: string) => {
    setProcessingId(ritualId);
    const outcome: CompleteRitualOutcome = completeRitual(ritualId);
    if (outcome.status === 'completed') {
      setFeedback({
        tone: 'success',
        message: '+' + outcome.xpAwarded + ' XP · +' + outcome.obedienceAwarded + ' Obedience',
      });
    } else if (outcome.status === 'already-completed') {
      setFeedback({
        tone: 'info',
        message: outcome.ritual.name + ' is already sealed for this cycle.',
      });
    } else {
      setFeedback({
        tone: 'warning',
        message: 'Ritual not found. Refresh and try again.',
      });
    }
    setProcessingId(null);
  };

  const feedbackClasses = feedback
    ? combineClasses([
        'rounded-3xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em]',
        feedback.tone === 'success' && 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
        feedback.tone === 'info' && 'border-sky-400/40 bg-sky-500/10 text-sky-200',
        feedback.tone === 'warning' && 'border-amber-400/40 bg-amber-500/10 text-amber-200',
      ])
    : '';

  return (
    <QuestLayout xp={xp}>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 text-slate-100">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-[0.35em] text-white">🔒 Obedience Chamber</h1>
            <div className="rounded-3xl border border-purple-500/40 bg-purple-900/40 px-4 py-2 text-xs uppercase tracking-[0.35em] text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.35)]">
              {'Obedience ' + obedience.toLocaleString()}
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-300">
            Submit each ritual to feed the Temple. Daily offerings sustain your streaks, amplify XP, and tighten obedience bindings.
          </p>
          {feedback ? <div className={feedbackClasses}>{feedback.message}</div> : null}
        </header>

        <div className="flex flex-col gap-10">
          {grouped.map((section) => (
            <section key={section.type} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-slate-200">{section.title}</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{section.rituals.length + ' rituals'}</span>
              </div>
              {section.rituals.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {section.rituals.map((ritual) => (
                    <RitualCard
                      key={ritual.id}
                      ritual={ritual}
                      progress={progressById[ritual.id]}
                      aura={section.aura}
                      disabled={processingId === ritual.id}
                      onComplete={() => handleComplete(ritual.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-700/60 bg-slate-900/70 px-6 py-10 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                  No rituals configured yet.
                </div>
              )}
            </section>
          ))}
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-slate-200">Ritual History</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{logs.length + ' entries'}</span>
          </div>
          <div className="max-h-80 overflow-y-auto rounded-3xl border border-fuchsia-400/20 bg-slate-950/70 p-4 shadow-inner shadow-fuchsia-500/10">
            {logs.length === 0 ? (
              <p className="py-12 text-center text-xs uppercase tracking-[0.3em] text-slate-500">No rituals completed yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-white/5 text-sm">
                {logs.map((log) => {
                  const ritual = ritualLookup.get(log.ritualId);
                  const xpAwarded = log.xpAwarded ?? ritual?.xp ?? 0;
                  const obedienceAwarded = log.obedienceAwarded ?? ritual?.obedience ?? 0;
                  const streakBonus = log.multiplierApplied && log.multiplierApplied > 0
                    ? '+' + Math.round(log.multiplierApplied * 100) + '%'
                    : null;
                  return (
                    <li key={log.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="text-sm font-semibold text-slate-100">{ritual?.name ?? 'Ritual ' + log.ritualId}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em]">
                        <span className="text-amber-200">{'+' + xpAwarded + ' XP'}</span>
                        <span className="text-fuchsia-200">{'+' + obedienceAwarded}</span>
                        {streakBonus ? (
                          <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-100">{streakBonus}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </QuestLayout>
  );
}
