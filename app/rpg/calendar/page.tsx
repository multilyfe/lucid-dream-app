"use client";

import { useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { useEvents } from "../../hooks/useEvents";
import { useHydrated } from "../../hooks/useHydrated";
import CalendarView from "../../components/CalendarView";
import EventList from "../../components/EventList";
import EventDetail from "../../components/EventDetail";

import { EVENT_TYPE_AURAS, EVENT_TYPE_ICONS, EVENT_TYPE_LABELS, resolveEventType } from "../../lib/eventMeta";

const VIEW_MODES = ["month", "week", "timeline"] as const;
type ViewMode = typeof VIEW_MODES[number];

const CalendarPage = () => {
  const hydrated = useHydrated();
  const {
    events,
    markComplete,
    toggleAutoDaily,
    toggleAutoPanty,
    toggles,
  } = useEvents();
  const [mode, setMode] = useState<ViewMode>("month");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const today = new Date();
  const selectedEvent = useMemo(() => events.find((event) => event.id === selectedEventId) ?? null, [events, selectedEventId]);

  const upcoming = useMemo(() => events.filter((event) => new Date(event.date) >= startOfToday()), [events]);

  if (!hydrated) {
    return (
      <QuestLayout>
        <div className="p-6" />
      </QuestLayout>
    );
  }

  const monthEvents = events.filter((event) => {
    const date = new Date(event.date);
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  });

  const weekEvents = events.filter((event) => {
    const date = new Date(event.date);
    const diff = Math.abs(date.getTime() - today.getTime());
    return diff <= 6 * 24 * 60 * 60 * 1000;
  });

  const timelineEvents = events
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <QuestLayout>
      <div className="space-y-8 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=60')] bg-fixed bg-cover bg-center p-6">
        <header className="rounded-3xl border border-sky-500/30 bg-slate-950/80 p-6 shadow-[0_0_45px_rgba(56,189,248,0.25)] backdrop-blur">
          <h1 className="text-3xl font-semibold text-white">📅 Events & Calendar</h1>
          <p className="mt-2 text-sm text-slate-300">
            Schedule rituals, panty resets, and quest deadlines. Keep your lucid temple aligned with real-world cycles.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-200">
            <button
              type="button"
              onClick={toggleAutoDaily}
              className={`rounded-full border px-4 py-1 font-semibold transition ${toggles.autoDailyRitual ? 'border-purple-400/60 bg-purple-500/20 text-purple-100' : 'border-slate-600/60 bg-slate-800/60 text-slate-300'}`}
            >
              Daily Ritual Auto · {toggles.autoDailyRitual ? 'On' : 'Off'}
            </button>
            <button
              type="button"
              onClick={toggleAutoPanty}
              className={`rounded-full border px-4 py-1 font-semibold transition ${toggles.autoPantyReset ? 'border-rose-400/60 bg-rose-500/20 text-rose-100' : 'border-slate-600/60 bg-slate-800/60 text-slate-300'}`}
            >
              Panty Reset Auto · {toggles.autoPantyReset ? 'On' : 'Off'}
            </button>
            <div className="ml-auto flex gap-2">
              {VIEW_MODES.map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setMode(view)}
                  className={`rounded-full border px-4 py-1 font-semibold transition ${mode === view ? 'border-sky-400/60 bg-sky-500/20 text-sky-100' : 'border-slate-600/60 bg-slate-800/60 text-slate-300'}`}
                >
                  {view === 'month' ? 'Monthly Grid' : view === 'week' ? 'Weekly List' : 'Timeline'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {mode === 'month' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <CalendarView
              year={today.getFullYear()}
              month={today.getMonth()}
              events={monthEvents}
            />
            <EventDetail event={selectedEvent ?? monthEvents[0] ?? null} onComplete={markComplete} />
          </div>
        ) : mode === 'week' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <EventList
              heading="Next 7 Days"
              events={weekEvents}
              onSelect={(event) => setSelectedEventId(event.id)}
            />
            <EventDetail event={selectedEvent ?? weekEvents[0] ?? null} onComplete={markComplete} />
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_45px_rgba(148,163,184,0.3)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Timeline</h2>
              <span className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-400">Earliest · Latest</span>
            </div>
            <div className="relative py-2">
              <div className="animate-timeline-flow absolute left-6 top-0 h-full w-1 bg-gradient-to-b from-sky-400/60 via-purple-500/50 to-rose-400/60" />
              <div className="space-y-4 pl-16">
                {timelineEvents.map((event) => {
                  const typeKey = resolveEventType(event.type);
                  const icon = EVENT_TYPE_ICONS[typeKey];
                  const aura = EVENT_TYPE_AURAS[typeKey];
                  const label = EVENT_TYPE_LABELS[typeKey];
                  const selected = selectedEventId === event.id;
                  const baseClass = 'group relative flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(236,72,153,0.25)]';
                  const stateClass = selected
                    ? 'border-sky-400/70 bg-slate-900/80 text-white shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                    : 'border-slate-700/60 bg-slate-900/60 text-slate-200';
                  const classes = [baseClass, stateClass, aura].join(' ');
                  const status = event.completed ? 'Completed' : event.xp + ' XP';
                  const rewardTrail = event.obedience || event.tokens
                    ? (event.obedience || 0) + ' OB · ' + (event.tokens || 0) + ' DT'
                    : null;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEventId(event.id)}
                      className={classes}
                      aria-label={event.title + ' · ' + event.date}
                    >
                      <span className="absolute -left-12 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/90 text-lg shadow-[0_0_16px_rgba(255,255,255,0.35)] transition group-hover:scale-110">
                        {icon}
                      </span>
                      <div className="flex-1 space-y-1 text-left">
                        <div className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-300/80">{label}</div>
                        <div className="font-semibold text-white">{event.title}</div>
                        <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">{event.date}</div>
                        {event.notes ? (
                          <p className="text-[0.6rem] text-slate-400">{event.notes}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-end text-xs uppercase tracking-[0.3em] text-slate-200">
                        <span>{status}</span>
                        {rewardTrail ? (
                          <span className="mt-1 text-[0.55rem] text-slate-300">{rewardTrail}</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <EventDetail event={selectedEvent ?? timelineEvents[0] ?? null} onComplete={markComplete} />
          </div>
        )}

        <EventList events={upcoming} onSelect={(event) => setSelectedEventId(event.id)} heading="Upcoming Events" />
      </div>
    </QuestLayout>
  );
};

export default CalendarPage;

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
