'use client';

import { useMemo } from 'react';
import CompanionCard from './CompanionCard';
import { type DetailedCompanion } from '../hooks/useCompanions';

export type CompanionGalleryFilter = 'all' | 'active' | 'inactive' | 'ready';

type CompanionGalleryProps = {
  companions: DetailedCompanion[];
  filter: CompanionGalleryFilter;
  onFilterChange?: (next: CompanionGalleryFilter) => void;
  onSelect?: (companion: DetailedCompanion) => void;
  onEvolve?: (companion: DetailedCompanion) => void;
  selectedId?: string | null;
  emptyState?: React.ReactNode;
};

const FILTER_LABELS: Record<CompanionGalleryFilter, string> = {
  all: 'All',
  active: 'Auto-Evolve',
  inactive: 'Manual',
  ready: 'Evolution Ready',
};

export function CompanionGallery({
  companions,
  filter,
  onFilterChange,
  onSelect,
  onEvolve,
  selectedId,
  emptyState,
}: CompanionGalleryProps) {
  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return companions.filter((companion) => companion.autoEvolve);
      case 'inactive':
        return companions.filter((companion) => !companion.autoEvolve);
      case 'ready':
        return companions.filter((companion) => companion.evolutionReady);
      case 'all':
      default:
        return companions;
    }
  }, [companions, filter]);

  const rendered = filtered.length === 0
    ? emptyState ?? (
        <div className="rounded-3xl border border-dashed border-slate-700/60 bg-slate-950/60 p-10 text-center text-sm uppercase tracking-[0.35em] text-slate-400">
          No companions match this filter.
        </div>
      )
    : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              onSelect={onSelect}
              onEvolve={onEvolve}
              isSelected={selectedId === companion.id}
            />
          ))}
        </div>
      );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {(Object.keys(FILTER_LABELS) as CompanionGalleryFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange?.(key)}
              className={`rounded-full border px-4 py-2 font-semibold uppercase tracking-[0.3em] transition ${
                filter === key
                  ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100 shadow-[0_0_12px_rgba(244,114,182,0.4)]'
                  : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {filtered.length} / {companions.length} companions
        </span>
      </div>

      {rendered}
    </section>
  );
}

export default CompanionGallery;
