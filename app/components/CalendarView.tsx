'use client';

import { useMemo, useState } from 'react';
import type { CalendarEvent } from '../lib/events';
import { EVENT_TYPE_AURAS, EVENT_TYPE_ICONS, resolveEventType } from '../lib/eventMeta';
import styles from '../styles/CalendarView.module.css';
import useHydrated from '../hooks/useHydrated';

type CalendarViewProps = {
  month: number; // 0-11
  year: number;
  events: CalendarEvent[];
  onSelectAction?: (event: CalendarEvent) => void;
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({ month, year, events, onSelectAction }: CalendarViewProps) {
  const hydrated = useHydrated();
  const weeks = useMemo(() => buildCalendar(year, month, events), [events, month, year]);

  const monthName = useMemo(() => {
    if (!hydrated) return '...';
    return new Date(year, month, 1).toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }, [month, year, hydrated]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-500/25 p-5 shadow-[0_0_45px_rgba(126,58,242,0.25)]">
      <div className={styles.calendar}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12)_0,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.12)_0,transparent_65%)]" />
        <div className="absolute inset-0 animate-rune-glow bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.08)_0,transparent_70%)]" />
      </div>
      <div className="relative space-y-4">
        <header className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300">
          <span>{monthName}</span>
          <span className="text-[0.6rem] text-slate-500">Rune-aligned grid</span>
        </header>
        <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeks.map((cell) => {
            const baseCellClass = 'relative min-h-[110px] rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3 text-xs text-slate-200 shadow-[inset_0_0_18px_rgba(15,23,42,0.35)] transition';
            const cellClass = cell.currentMonth ? baseCellClass + ' opacity-100' : baseCellClass + ' opacity-40';
            return (
              <div key={cell.key} className={cellClass}>
                <div className="flex items-baseline justify-between text-[0.65rem] text-slate-400">
                  <span className="font-semibold text-slate-100">{cell.day}</span>
                  <span className="text-[0.5rem] uppercase tracking-[0.35em] text-slate-500">
                    {cell.events.length > 0 ? cell.events.length + '×' : ''}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cell.events.map((event) => {
                    const typeKey = resolveEventType(event.type);
                    const aura = EVENT_TYPE_AURAS[typeKey];
                    const icon = EVENT_TYPE_ICONS[typeKey];
                    const buttonBase = 'group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-base transition duration-200 hover:-translate-y-0.5 hover:scale-105 ';
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelectAction?.(event)}
                        className={buttonBase + aura}
                        aria-label={event.title + ' on ' + event.date}
                      >
                        <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]">{icon}</span>
                        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 translate-y-1 rounded-2xl border border-slate-700/70 bg-slate-950/95 p-3 text-left text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-slate-200 opacity-0 shadow-[0_0_18px_rgba(56,189,248,0.35)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                          <span className="text-[0.55rem] text-slate-400">{event.date}</span>
                          <span className="mt-1 block text-xs tracking-normal text-white">{event.title}</span>
                          <span className="mt-2 flex items-center justify-between text-[0.55rem] uppercase tracking-[0.3em] text-slate-400">
                            <span>{event.xp} XP</span>
                            <span>{event.completed ? 'Completed' : 'Pending'}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type CalendarCell = {
  key: string;
  day: number;
  currentMonth: boolean;
  events: CalendarEvent[];
};

function buildCalendar(year: number, month: number, events: CalendarEvent[]): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const cells: CalendarCell[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = 42; // 6 weeks grid

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startDay + 1;
    let currentMonth = true;
    let day;
    let cellMonth = month;
    let cellYear = year;

    if (dayNumber < 1) {
      currentMonth = false;
      day = prevMonthDays + dayNumber;
      cellMonth = month - 1;
      if (cellMonth < 0) {
        cellMonth = 11;
        cellYear = year - 1;
      }
    } else if (dayNumber > daysInMonth) {
      currentMonth = false;
      day = dayNumber - daysInMonth;
      cellMonth = month + 1;
      if (cellMonth > 11) {
        cellMonth = 0;
        cellYear = year + 1;
      }
    } else {
      day = dayNumber;
    }

    const cellDate = new Date(cellYear, cellMonth, day).toISOString().slice(0, 10);
    const cellEvents = events.filter((event) => event.date === cellDate);
    const key = cellYear + '-' + cellMonth + '-' + day;

    cells.push({
      key,
      day,
      currentMonth,
      events: cellEvents,
    });
  }

  return cells;
}

export default CalendarView;
