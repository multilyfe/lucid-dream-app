'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { usePersistentState } from './usePersistentState';
import { useInventory } from './useInventory';
import {
  type CalendarEvent,
  type EventType,
  cloneDefaultEvents,
  generateEventId,
  isSameDay,
  normaliseDate,
  normaliseEvent,
  sortByDate,
} from '../lib/events';

type EventStreakState = {
  streak: number;
  lastDate: string | null;
  totalCompletions: number;
};

type IcsImportResult = {
  imported: number;
  skipped: number;
};

type CalendarToggles = {
  autoDailyRitual: boolean;
  autoPantyReset: boolean;
};

const CALENDAR_TOGGLES_KEY = 'eventsToggles';
const CALENDAR_STREAK_KEY = 'eventsStreak';
const CALENDAR_ACHIEVEMENTS_KEY = 'eventAchievements';

const DEFAULT_TOGGLES: CalendarToggles = {
  autoDailyRitual: true,
  autoPantyReset: false,
};

export function useEvents() {
  const [events, setEvents] = usePersistentState<CalendarEvent[]>('events', cloneDefaultEvents);
  const [toggles, setToggles] = usePersistentState<CalendarToggles>(CALENDAR_TOGGLES_KEY, () => DEFAULT_TOGGLES);
  const [streakState, setStreakState] = usePersistentState<EventStreakState>(CALENDAR_STREAK_KEY, () => ({
    streak: 0,
    lastDate: null,
    totalCompletions: 0,
  }));
  const [achievements, setAchievements] = usePersistentState<string[]>(CALENDAR_ACHIEVEMENTS_KEY, () => []);

  const { awardXp, awardObedience, awardTokens } = useInventory();

  const setSafe = useCallback(
    (updater: (previous: CalendarEvent[]) => CalendarEvent[]) => {
      setEvents((previous) => sortByDate(updater(previous).map((event) => normaliseEvent(event))));
    },
    [setEvents]
  );

  const addEvent = useCallback(
    (event: CalendarEvent) => {
      setSafe((previous) => [...previous, event]);
    },
    [setSafe]
  );

  const updateEvent = useCallback(
    (eventId: string, updater: (event: CalendarEvent) => CalendarEvent) => {
      setSafe((previous) =>
        previous.map((entry) => (entry.id === eventId ? updater({ ...entry }) : entry))
      );
    },
    [setSafe]
  );

  const removeEvent = useCallback(
    (eventId: string) => {
      setSafe((previous) => previous.filter((event) => event.id !== eventId));
    },
    [setSafe]
  );

  const deleteAllEvents = useCallback(() => {
    setSafe(() => []);
  }, [setSafe]);

  const importFromIcs = useCallback(
    (payload: string): IcsImportResult => {
      if (!payload || payload.trim().length === 0) {
        return { imported: 0, skipped: 0 };
      }

      // TODO: Implement ICS parsing
      const parsed: CalendarEvent[] = [];
      // const parsed = icsToEvents(payload);
      if (parsed.length === 0) {
        return { imported: 0, skipped: 0 };
      }

      let imported = 0;
      let skipped = 0;

      setSafe((previous) => {
        const knownIds = new Set(previous.map((event) => event.id));
        const knownKeys = new Set(
          previous.map((event) => event.date + '|' + event.title).join(', ').toLowerCase()
        );
        const next = [...previous];

        parsed.forEach((raw) => {
          const normalized = normaliseEvent({
            ...raw,
            source: raw.source ?? 'imported',
          });

          const key = (normalized.date + '|' + normalized.title).toLowerCase();
          if (knownKeys.has(key)) {
            skipped += 1;
            return;
          }

          let identifier = normalized.id;
          if (knownIds.has(identifier)) {
            identifier = generateEventId('import');
            skipped += 1;
          }

          knownIds.add(identifier);
          knownKeys.add(key);
          next.push({ ...normalized, id: identifier });
          imported += 1;
        });

        return next;
      });

      return { imported, skipped };
    },
    [setSafe]
  );

  const exportToIcs = useCallback(
    (ids?: string[]): string => {
      const selection = Array.isArray(ids) && ids.length > 0
        ? events.filter((event) => ids.includes(event.id))
        : events;
      // TODO: Implement ICS export
      return ""; // Placeholder
      // return eventsToICS(selection);
    },
    [events]
  );

  const toggleAutoDaily = useCallback(() => {
    setToggles((prev) => ({ ...prev, autoDailyRitual: !prev.autoDailyRitual }));
  }, [setToggles]);

  const toggleAutoPanty = useCallback(() => {
    setToggles((prev) => ({ ...prev, autoPantyReset: !prev.autoPantyReset }));
  }, [setToggles]);

  // Ensure recurring events are generated
  const ensureRecurringEvents = useCallback(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = normaliseDate(today.toISOString());
    const tomorrowStr = normaliseDate(tomorrow.toISOString());
    
    if (toggles.autoDailyRitual) {
      const hasToday = events.some(e => e.type === 'ritual' && e.title === 'Daily Lucid Pulse' && isSameDay(e.date, todayStr));
      const hasTomorrow = events.some(e => e.type === 'ritual' && e.title === 'Daily Lucid Pulse' && isSameDay(e.date, tomorrowStr));
      
      const updatedEvents = [...events];
      
      if (!hasToday) {
        const newEvent: CalendarEvent = {
          id: generateEventId(),
          title: 'Daily Lucid Pulse',
          type: 'ritual',
          date: todayStr,
          xp: 25,
          completed: false,
          source: 'ritual-auto',
          notes: 'Auto-generated daily ritual check.'
        };
        updatedEvents.push(newEvent);
      }
      
      if (!hasTomorrow) {
        const newEvent: CalendarEvent = {
          id: generateEventId(),
          title: 'Daily Lucid Pulse',
          type: 'ritual',
          date: tomorrowStr,
          xp: 25,
          completed: false,
          source: 'ritual-auto',
          notes: 'Auto-generated daily ritual check.'
        };
        updatedEvents.push(newEvent);
      }

      if (updatedEvents.length > events.length) {
        setSafe(() => updatedEvents);
      }
    }

    // Generate monthly panty reset if enabled
    if (toggles.autoPantyReset) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthStr = normaliseDate(nextMonth.toISOString());
      const hasNextReset = events.some(e => 
        e.type === 'pantyReset' && 
        e.title === 'Panty Submission Reset' && 
        new Date(e.date).getMonth() === nextMonth.getMonth()
      );
      
      if (!hasNextReset) {
        const newEvent: CalendarEvent = {
          id: generateEventId(),
          title: 'Panty Submission Reset',
          type: 'pantyReset',
          date: nextMonthStr,
          xp: 100,
          tokens: 20,
          completed: false,
          source: 'panty-reset-auto',
          notes: 'Monthly obedience reset generated by the control nexus.'
        };
        setSafe(prev => [...prev, newEvent]);
      }
    }
  }, [events, setSafe, toggles.autoDailyRitual, toggles.autoPantyReset]);

  // Run ensureRecurringEvents when dependencies change
  useEffect(() => {
    ensureRecurringEvents();
  }, [ensureRecurringEvents]);

  const markComplete = useCallback(
    (eventId: string) => {
      const target = events.find((event) => event.id === eventId);
      if (!target || target.completed) return;

      const today = normaliseDate(new Date().toISOString());

      updateEvent(eventId, (event) => ({
        ...event,
        completed: true,
        completedAt: new Date().toISOString(),
      }));

      // Award rewards
      if (target.xp) {
        awardXp(target.xp);
      }
      if (target.obedience) {
        awardObedience(target.obedience);
      }
      if (target.tokens) {
        awardTokens(target.tokens);
      }

      // Update streak state
      setStreakState((previous) => {
        const nextTotal = previous.totalCompletions + 1;
        
        // Check for Calendar Keeper achievement
        if (nextTotal >= 30 && !achievements.includes('Calendar Keeper')) {
          setAchievements((ach) => [...ach, 'Calendar Keeper']);
        }

        const date = target.date;
        const eventsToday = events.filter((event) => isSameDay(event.date, date));
        const newlyCompleted = eventsToday.every((event) => event.id === eventId || event.completed);

        if (!newlyCompleted || !isSameDay(date, today)) {
          return {
            streak: previous.streak,
            lastDate: previous.lastDate,
            totalCompletions: nextTotal,
          };
        }

        const streak = previous.lastDate === today ? previous.streak + 1 : previous.streak + 1;
        if (streak > previous.streak) {
          awardXp(15); // Streak bonus XP
        }

        return {
          streak,
          lastDate: today,
          totalCompletions: nextTotal,
        };
      });
    },
    [achievements, awardXp, awardObedience, awardTokens, events, setAchievements, setStreakState, updateEvent]
  );

  const upcomingEvents = useMemo(() => sortByDate(events), [events]);

  return {
    events: upcomingEvents,
    toggles,
    streakState,
    achievements,
    addEvent,
    updateEvent,
    removeEvent,
    deleteAllEvents,
    importFromIcs,
    exportToIcs,
    markComplete,
    toggleAutoDaily,
    toggleAutoPanty,
  } as const;
}