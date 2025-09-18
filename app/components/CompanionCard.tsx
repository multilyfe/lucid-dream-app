'use client';

import { type DetailedCompanion } from '../hooks/useCompanions';

type CompanionCardProps = {
  companion: DetailedCompanion;
  onSelect?: (companion: DetailedCompanion) => void;
  onEvolve?: (companion: DetailedCompanion) => void;
  isSelected?: boolean;
  disabled?: boolean;
};

const FORM_AURA_MAP = [
  {
    matcher: /divine|ascend|celestial|holy/i,
    gradient: 'from-amber-400/60 via-orange-400/40 to-rose-500/40',
  },
  {
    matcher: /ritual|guardian|panty|oracle/i,
    gradient: 'from-fuchsia-500/50 via-purple-500/40 to-sky-500/40',
  },
  {
    matcher: /shadow|void|night/i,
    gradient: 'from-slate-500/45 via-indigo-500/35 to-purple-500/40',
  },
  {
    matcher: /novice|base|seed|initiate|watcher/i,
    gradient: 'from-teal-400/50 via-cyan-400/40 to-blue-500/35',
  },
];

const DEFAULT_AURA = 'from-sky-500/40 via-fuchsia-500/25 to-indigo-500/30';

function getAuraGradient(formName?: string) {
  if (!formName) return DEFAULT_AURA;
  return FORM_AURA_MAP.find((entry) => entry.matcher.test(formName))?.gradient ?? DEFAULT_AURA;
}

function formatBuffLabel(key: string, value: number) {
  const multiplier = value >= 1 ? `${Math.round((value - 1) * 100)}%` : `${Math.round((1 - value) * 100)}%`; // fallback for <1
  switch (key) {
    case 'xpMultiplier':
      return `XP +${Math.round(value * 100 - 100)}%`;
    case 'obedienceGain':
      return `Obedience +${Math.round(value * 100 - 100)}%`;
    case 'tokenMultiplier':
      return `Tokens ×${value.toFixed(1)}`;
    case 'clarityBoost':
      return `Clarity +${Math.round(value * 100 - 100)}%`;
    default:
      return `${key} ${multiplier}`;
  }
}

export function CompanionCard({ companion, onSelect, onEvolve, isSelected, disabled }: CompanionCardProps) {
  const { activeFormDefinition, nextForm, xpProgress } = companion;
  const aura = getAuraGradient(activeFormDefinition?.name);
  const icon = activeFormDefinition?.icon ?? '🐉';
  const canEvolve = companion.evolutionReady && Boolean(onEvolve);

  const handleSelect = () => {
    if (disabled) return;
    onSelect?.(companion);
  };

  const handleEvolve = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled || !canEvolve) return;
    onEvolve?.(companion);
  };

  const progressRatio = Math.max(0, Math.min(1, xpProgress.ratio));
  const progressLabel = xpProgress.needed > 0
    ? `${xpProgress.current} / ${xpProgress.needed}`
    : 'Maxed';

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : -1}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (!onSelect) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={`relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-950/70 p-5 transition-all duration-500 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1'
      } ${
        isSelected
          ? 'shadow-[0_0_45px_rgba(236,72,153,0.45)] border-fuchsia-400/60'
          : 'shadow-[0_0_30px_rgba(15,23,42,0.6)]'
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${aura} opacity-30 blur-[2px] transition-all duration-700 ${isSelected ? 'opacity-60 scale-105' : ''}`} />

      <div className="relative z-10 flex flex-col gap-4 text-slate-100">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-4xl drop-shadow-[0_0_18px_rgba(244,114,182,0.4)]" aria-hidden>
              {icon}
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-wide text-white">
                {companion.name}
              </h3>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                Level {companion.level}
              </p>
            </div>
          </div>
          {companion.autoEvolve ? (
            <span className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-emerald-100">
              Auto
            </span>
          ) : null}
        </header>

        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/90">
            <span>Active Form · {activeFormDefinition?.name ?? 'Unknown'}</span>
            {nextForm ? <span>Next · {nextForm.name}</span> : <span>Final Form</span>}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-400 to-sky-400 transition-all duration-700"
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs uppercase tracking-[0.3em] text-slate-300/80">
            <span>XP Progress</span>
            <span>{progressLabel}</span>
          </div>
        </section>

        <section className="space-y-2">
          <h4 className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Buffs</h4>
          <div className="flex flex-wrap gap-2">
            {activeFormDefinition?.buff
              ? Object.entries(activeFormDefinition.buff).map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-100"
                  >
                    {formatBuffLabel(key, Number(value))}
                  </span>
                ))
              : (
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
                    No buffs unlocked
                  </span>
                )}
          </div>
        </section>

        <footer className="mt-auto flex flex-wrap items-center gap-3">
          {canEvolve ? (
            <button
              type="button"
              onClick={handleEvolve}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100 transition hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Evolve
            </button>
          ) : null}

          {onSelect ? (
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
              {isSelected ? 'Viewing details' : 'Tap for details'}
            </span>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

export default CompanionCard;
