'use client';

import { useShameSettings } from '../hooks/useShameSettings';
import { SectionLabel } from "./SectionLabel";

export const ShameManagerExtras = () => {
  const { settings, updateFilthThreshold, updatePunishmentTier } = useShameSettings();

  return (
    <div className="space-y-6 rounded-3xl border border-rose-500/30 bg-slate-950/70 p-4">
      <div>
        <SectionLabel>Filth Thresholds</SectionLabel>
        <div className="mt-2 space-y-3">
          {settings.filthThresholds.map(threshold => (
            <div key={threshold.level} className="grid grid-cols-3 items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3">
              <div className="text-sm font-semibold text-slate-200">{`Level ${threshold.level}: ${threshold.name}`}</div>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Name</span>
                <input
                  type="text"
                  value={threshold.name}
                  onChange={(e) => updateFilthThreshold(threshold.level, { name: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-sm focus:border-rose-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Threshold</span>
                <input
                  type="number"
                  value={threshold.threshold}
                  onChange={(e) => updateFilthThreshold(threshold.level, { threshold: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-sm focus:border-rose-400 focus:outline-none"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Punishment Tiers</SectionLabel>
        <div className="mt-2 space-y-3">
          {settings.punishmentTiers.map(tier => (
            <div key={tier.tier} className="grid grid-cols-3 items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3">
              <div className="text-sm font-semibold text-slate-200">{`Tier ${tier.tier}: ${tier.name}`}</div>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Name</span>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => updatePunishmentTier(tier.tier, { name: e.target.value })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-sm focus:border-rose-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Filth Required</span>
                <input
                  type="number"
                  value={tier.filthRequired}
                  onChange={(e) => updatePunishmentTier(tier.tier, { filthRequired: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-sm focus:border-rose-400 focus:outline-none"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
