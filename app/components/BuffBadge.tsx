'use client';

import type { Buff } from "../lib/buffEngine";

const TYPE_COLORS: Record<Buff["type"], string> = {
  xpMultiplier: "from-amber-400/70 via-amber-300/40 to-yellow-300/30",
  obedienceGain: "from-fuchsia-500/70 via-purple-500/40 to-rose-400/30",
  tokenMultiplier: "from-pink-500/70 via-rose-400/40 to-amber-400/30",
  clarityBoost: "from-cyan-400/70 via-sky-400/40 to-emerald-400/30",
};

const TYPE_LABEL: Record<Buff["type"], string> = {
  xpMultiplier: "XP",
  obedienceGain: "Obedience",
  tokenMultiplier: "Tokens",
  clarityBoost: "Clarity",
};

type BuffBadgeProps = {
  buff: Buff;
  remainingMs?: number | null;
};

function formatRemaining(ms?: number | null): string | null {
  if (ms == null) return null;
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

export function BuffBadge({ buff, remainingMs }: BuffBadgeProps) {
  const gradient = TYPE_COLORS[buff.type];
  const label = TYPE_LABEL[buff.type];
  const remaining = formatRemaining(remainingMs);

  return (
    <div className="relative inline-flex overflow-hidden rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.55)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${gradient} opacity-60`} />
      <div className="relative z-10 flex items-center gap-2">
        <span aria-hidden className="text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">
          {buff.icon ?? "✨"}
        </span>
        <div className="flex flex-col gap-1 text-left">
          <span>{buff.name}</span>
          <span className="text-[0.6rem] font-normal uppercase tracking-[0.4em] text-slate-100/80">
            {label}
            {remaining ? ` • ${remaining}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
