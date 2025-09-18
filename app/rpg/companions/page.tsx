"use client";

import { useEffect, useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import CompanionGallery, { type CompanionGalleryFilter } from "../../components/CompanionGallery";
import { type DetailedCompanion, useCompanions } from "../../hooks/useCompanions";

function CompanionDetail({
  companion,
  onEvolve,
  onToggleAuto,
  onReset,
}: {
  companion: DetailedCompanion;
  onEvolve: () => void;
  onToggleAuto: () => void;
  onReset: () => void;
}) {
  const { activeFormDefinition, nextForm } = companion;

  return (
    <div className="space-y-6 rounded-3xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-[0_0_35px_rgba(15,23,42,0.55)]">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 via-sky-500/10 to-rose-500/10 text-4xl drop-shadow-[0_0_22px_rgba(244,114,182,0.45)]">
            <span aria-hidden>{activeFormDefinition?.icon ?? "🐉"}</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white">
              {companion.name}
            </h1>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
              Level {companion.level} · {activeFormDefinition?.name ?? "Dormant"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em]">
          <button
            type="button"
            onClick={onEvolve}
            disabled={!companion.evolutionReady}
            className={`rounded-full border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              companion.evolutionReady
                ? "border-amber-400/60 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 focus-visible:ring-amber-300"
                : "cursor-not-allowed border-slate-700/60 bg-slate-900/60 text-slate-400"
            }`}
          >
            Evolve Now
          </button>
          <button
            type="button"
            onClick={onToggleAuto}
            className={`rounded-full border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              companion.autoEvolve
                ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 focus-visible:ring-emerald-300"
                : "border-slate-600/60 bg-slate-900/60 text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            {companion.autoEvolve ? "Auto-Evolve Active" : "Enable Auto-Evolve"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-rose-400/60 bg-rose-500/10 px-4 py-2 font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Reset Evolution
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-5">
        <article className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 lg:col-span-3">
          <h2 className="text-xs uppercase tracking-[0.35em] text-slate-300/70">Lore</h2>
          <p className="text-sm leading-relaxed text-slate-200/90">
            {companion.lore ?? 'This companion hides their story beyond the veil. Chronicle adventures to unveil deeper truths.'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <h3 className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-300/70">Total XP</h3>
              <p className="text-xl font-semibold text-white">
                {companion.totalXp}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
              <h3 className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-300/70">Next Form</h3>
              <p className="text-sm text-slate-200">
                {nextForm ? `${nextForm.name} · Unlocks at Lv ${nextForm.unlockAt}` : 'Fully evolved'}
              </p>
            </div>
          </div>
        </article>

        <article className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 lg:col-span-2">
          <h2 className="text-xs uppercase tracking-[0.35em] text-slate-300/70">Current Buffs</h2>
          <div className="flex flex-wrap gap-2">
            {activeFormDefinition?.buff
              ? Object.entries(activeFormDefinition.buff).map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-100"
                  >
                    {key} ×{Number(value).toFixed(2)}
                  </span>
                ))
              : (
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
                    No buffs currently active.
                  </span>
                )}
          </div>
          <div>
            <h3 className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">XP Progress</h3>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-400 to-sky-400"
                style={{ width: `${companion.xpProgress.ratio * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-300/80">
              {companion.xpProgress.needed > 0
                ? `${companion.xpProgress.current} / ${companion.xpProgress.needed} XP to next level`
                : 'Maximum level reached'}
            </p>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.35em] text-slate-300/70">Evolution Path</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {companion.forms.map((form) => {
            const achieved = companion.level >= form.unlockAt;
            const isActive = companion.activeForm === form.id;
            return (
              <div
                key={form.id}
                className={`rounded-2xl border bg-slate-900/60 p-4 transition ${
                  isActive
                    ? 'border-fuchsia-400/60 shadow-[0_0_25px_rgba(236,72,153,0.4)]'
                    : achieved
                    ? 'border-emerald-400/40'
                    : 'border-slate-700/60 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{form.icon ?? '✨'}</span>
                    <div>
                      <h3 className="font-semibold text-white">{form.name}</h3>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                        Unlock · Lv {form.unlockAt}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[0.6rem] uppercase tracking-[0.3em] ${
                    isActive
                      ? 'text-fuchsia-200'
                      : achieved
                      ? 'text-emerald-200'
                      : 'text-slate-500'
                  }`}>
                    {isActive ? 'Active' : achieved ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                {form.description ? (
                  <p className="mt-3 text-xs text-slate-300/90">{form.description}</p>
                ) : null}
                {form.buff ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(form.buff).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-100"
                      >
                        {key} ×{Number(value).toFixed(2)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function CompanionsPage() {
  const {
    detailedCompanions,
    evolveCompanion,
    setAutoEvolve,
    resetEvolution,
    recentEvolutions,
    acknowledgeRecentEvolutions,
  } = useCompanions();

  const [filter, setFilter] = useState<CompanionGalleryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; subtitle?: string; accent: string }>>([]);

  const selectedCompanion = useMemo(() => {
    if (detailedCompanions.length === 0) return null;
    const fallback = detailedCompanions[0];
    return detailedCompanions.find((entry) => entry.id === (selectedId ?? fallback.id)) ?? fallback;
  }, [detailedCompanions, selectedId]);

  useEffect(() => {
    if (recentEvolutions.length === 0) return;
    const timers: number[] = [];
    const entries = recentEvolutions
      .map((record) => {
        const companion = detailedCompanions.find((entry) => entry.id === record.companionId);
        if (!companion) return null;
        const form = companion.forms.find((item) => item.id === record.toFormId);
        if (!form) return null;
        return {
          id: `${record.companionId}-${record.toFormId}-${record.triggeredAt}`,
          title: `${companion.name} ${record.auto ? 'auto-' : ''}evolved`,
          subtitle: `${form.name} unlocked · Lv ${form.unlockAt}`,
          accent: record.auto ? 'from-emerald-400 via-emerald-500 to-teal-500' : 'from-fuchsia-400 via-rose-500 to-sky-500',
        };
      })
      .filter(Boolean) as Array<{ id: string; title: string; subtitle: string; accent: string }>;

    if (entries.length === 0) {
      acknowledgeRecentEvolutions();
      return;
    }

    setToasts((previous) => [...previous, ...entries]);

    entries.forEach((entry) => {
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== entry.id));
      }, 5200);
      timers.push(timer);
    });

    acknowledgeRecentEvolutions();

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [recentEvolutions, acknowledgeRecentEvolutions, detailedCompanions]);

  if (detailedCompanions.length === 0) {
    return (
      <QuestLayout>
        <div className="space-y-8 p-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">🐉 Companions</h1>
            <p className="text-sm text-slate-300">
              No companions forged yet. Summon a companion via the Control Nexus to begin the evolution journey.
            </p>
          </header>
        </div>
      </QuestLayout>
    );
  }

  return (
    <QuestLayout>
      {toasts.length > 0 ? (
        <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-72 flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`overflow-hidden rounded-3xl border border-white/20 bg-slate-950/90 shadow-[0_0_25px_rgba(236,72,153,0.45)]`}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${toast.accent}`} />
              <div className="space-y-1 px-4 py-3 text-left">
                <div className="text-sm font-semibold text-white">{toast.title}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-300/80">{toast.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="space-y-10 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">🐉 Companions</h1>
          <p className="text-sm text-slate-300">
            Cultivate dream-bound allies, unlock legendary forms, and weave buffs across your rituals, quests, and shame trials.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_minmax(0,0.8fr)]">
          <CompanionGallery
            companions={detailedCompanions}
            filter={filter}
            onFilterChange={setFilter}
            onSelect={(companion) => setSelectedId(companion.id)}
            onEvolve={(companion) => evolveCompanion(companion.id)}
            selectedId={selectedCompanion?.id ?? null}
          />

          {selectedCompanion ? (
            <CompanionDetail
              companion={selectedCompanion}
              onEvolve={() => evolveCompanion(selectedCompanion.id)}
              onToggleAuto={() => setAutoEvolve(selectedCompanion.id, !selectedCompanion.autoEvolve)}
              onReset={() => resetEvolution(selectedCompanion.id)}
            />
          ) : null}
        </div>
      </div>
    </QuestLayout>
  );
}
