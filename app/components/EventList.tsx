'use client';

import type { CalendarEvent } from '../lib/events';
import {
  EVENT_TYPE_AURAS,
  EVENT_TYPE_ICONS,
  EVENT_TYPE_LABELS,
  resolveEventType,
} from '../lib/eventMeta';

type EventListProps = {
  events: CalendarEvent[];
  onSelect?: (event: CalendarEvent) => void;
  heading?: string;
};

export function EventList({ events, onSelect, heading = 'Upcoming' }: EventListProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_35px_rgba(148,163,184,0.25)]">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">{heading}</h2>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{events.length} events</span>
      </header>
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
            No events scheduled.
          </p>
        ) : (
          events.map((event) => {
            const typeKey = resolveEventType(event.type);
            const color = EVENT_TYPE_AURAS[typeKey];
            const icon = EVENT_TYPE_ICONS[typeKey];
            const label = EVENT_TYPE_LABELS[typeKey];
            const baseClass = 'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(244,114,182,0.35)] ';
            const status = event.completed ? 'Completed' : event.xp + ' XP';
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect?.(event)}
                className={baseClass + color}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-lg shadow-[0_0_12px_rgba(255,255,255,0.35)]">
                    {icon}
                  </span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-300">{label}</div>
                    <div className="font-semibold text-white">{event.title}</div>
                    <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-200/80">{event.date}</div>
                    {event.notes ? (
                      <p className="mt-1 text-[0.6rem] text-slate-300/80">{event.notes}</p>
                    ) : null}
                  </div>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.3em] text-slate-200">
                  <div>{status}</div>
                  {event.obedience || event.tokens ? (
                    <div className="mt-1 text-[0.55rem] text-slate-400">
                      {event.obedience ? event.obedience + ' OB · ' : ''}
                      {event.tokens ? event.tokens + ' Tokens' : ''}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EventList;
