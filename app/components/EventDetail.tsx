'use client';

import type { CalendarEvent } from '../lib/events';
import {
  EVENT_TYPE_BADGES,
  EVENT_TYPE_ICONS,
  EVENT_TYPE_LABELS,
  resolveEventSourceLabel,
  resolveEventType,
} from '../lib/eventMeta';

type EventDetailProps = {
  event: CalendarEvent | null;
  onComplete: (eventId: string) => void;
};

export function EventDetail({ event, onComplete }: EventDetailProps) {
  if (!event) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700/60 bg-slate-950/70 px-4 py-8 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
        Select an event to view details
      </div>
    );
  }

  const typeKey = resolveEventType(event.type);
  const badge = EVENT_TYPE_BADGES[typeKey];
  const icon = EVENT_TYPE_ICONS[typeKey];
  const label = EVENT_TYPE_LABELS[typeKey];
  const sourceLabel = resolveEventSourceLabel(event.source);
  const badgeClass = 'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ' + badge;

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_45px_rgba(148,163,184,0.3)]">
      <header className="flex items-start gap-3">
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-2xl shadow-[0_0_15px_rgba(244,114,182,0.3)]">
          {icon}
        </span>
        <div className="space-y-2">
          <div className={badgeClass}>
            <span>{label}</span>
          </div>
          <h2 className="text-xl font-semibold text-white">{event.title}</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Scheduled · {event.date}</p>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-400">Source · {sourceLabel}</p>
        </div>
      </header>

      {event.notes ? (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 text-sm text-slate-200">
          {event.notes}
        </div>
      ) : null}

      {(event.questlineId || event.questStageId) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {event.questlineId ? (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-xs uppercase tracking-[0.3em] text-slate-200">
              <div className="text-slate-400">Questline</div>
              <div className="mt-1 text-sm text-white">{event.questlineId}</div>
            </div>
          ) : null}
          {event.questStageId ? (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-xs uppercase tracking-[0.3em] text-slate-200">
              <div className="text-slate-400">Stage</div>
              <div className="mt-1 text-sm text-white">{event.questStageId}</div>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-xs uppercase tracking-[0.3em] text-slate-200">
          <div className="text-slate-400">XP Reward</div>
          <div className="mt-1 text-lg text-white">{event.xp}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-xs uppercase tracking-[0.3em] text-slate-200">
          <div className="text-slate-400">Obedience</div>
          <div className="mt-1 text-lg text-white">{event.obedience ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 text-xs uppercase tracking-[0.3em] text-slate-200">
          <div className="text-slate-400">Dirty Tokens</div>
          <div className="mt-1 text-lg text-white">{event.tokens ?? 0}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-slate-300/80">
        <span>
          Status ·{' '}
          {event.completed
            ? 'Completed' + (event.completedAt ? ' ' + new Date(event.completedAt).toLocaleDateString() : '')
            : 'Pending'}
        </span>
        <button
          type="button"
          onClick={() => onComplete(event.id)}
          disabled={event.completed}
          className={
            event.completed
              ? 'rounded-full border border-slate-700/60 bg-slate-800/60 px-4 py-2 font-semibold text-slate-400'
              : 'rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 font-semibold text-emerald-100 transition hover:bg-emerald-500/30'
          }
        >
          {event.completed ? 'Already Completed' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}

export default EventDetail;
