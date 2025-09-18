'use client';

import { useEffect, useState } from "react";
import { BuffBadge } from "./BuffBadge";
import { useBuffs } from "../hooks/useBuffs";

export function BuffBar() {
  const { activeBuffs, getRemainingForBuff } = useBuffs();
  const [timestamp, setTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = window.setInterval(() => setTimestamp(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (activeBuffs.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-slate-800/60 bg-slate-950/80 px-6 py-3 shadow-inner shadow-slate-900/60">
      <div className="flex flex-wrap gap-3">
        {activeBuffs.map((buff) => (
          <BuffBadge key={buff.id} buff={buff} remainingMs={getRemainingForBuff(buff, timestamp)} />
        ))}
      </div>
    </div>
  );
}
