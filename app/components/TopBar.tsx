'use client';

import { useEffect, useState, type ReactNode } from "react";

type TopBarProps = {
  level?: number;
  xp?: number;
  xpProgress?: number;
  xpSegmentCap?: number;
  obedience?: number;
  rightSlot?: ReactNode;
};

export function TopBar({
  level = 4,
  xp = 0,
  xpProgress = 0,
  xpSegmentCap = 1000,
  obedience,
  rightSlot,
}: TopBarProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure consistent progress calculation between server and client
  const progressPercent = isClient ? Math.max(0, Math.min(1, xpProgress)) : 0;
  const xpDisplay = isClient ? xp.toLocaleString() : "...";
  const capDisplay = isClient ? xpSegmentCap.toLocaleString() : "...";
  const obedienceDisplay = isClient && typeof obedience === "number" ? obedience.toLocaleString() : null;

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/70 px-6 py-4 shadow-lg shadow-slate-950/40 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.45em] text-slate-100">
          <span aria-hidden>🌙</span>
          <span>Quest Hub ✦✦</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-3 text-[0.7rem] uppercase tracking-[0.35em] text-slate-200">
            <span>Level {isClient ? level : "..."}</span>
            <span>XP {xpDisplay}</span>
            {obedienceDisplay !== null ? (
              <span className="flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.35)]">
                <span className="text-base" aria-hidden>
                  ☽
                </span>
                <span>Obedience {obedienceDisplay}</span>
              </span>
            ) : null}
            {rightSlot}
          </div>
          <div className="relative h-2 w-48 overflow-hidden rounded-full border border-white/10 bg-slate-900/80 shadow-inner shadow-slate-950/60">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-400 to-sky-400 transition-all duration-500"
              style={isClient ? { width: `${progressPercent * 100}%` } : { width: '0%' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}