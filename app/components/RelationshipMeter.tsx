'use client';

type RelationshipMeterProps = {
  trust: number;
  shame: number;
  compact?: boolean;
};

export function RelationshipMeter({ trust, shame, compact = false }: RelationshipMeterProps) {
  const sizeClasses = compact ? 'h-2' : 'h-3';

  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-emerald-200/80">
          <span>Trust</span>
          <span>{trust}</span>
        </div>
        <div className={`mt-1 overflow-hidden rounded-full bg-emerald-900/40 ${sizeClasses}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, trust))}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-rose-200/80">
          <span>Shame</span>
          <span>{shame}</span>
        </div>
        <div className={`mt-1 overflow-hidden rounded-full bg-rose-900/40 ${sizeClasses}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-300 via-rose-400 to-rose-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, shame))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default RelationshipMeter;
