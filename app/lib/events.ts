'use client';

export type EventType = 'ritual' | 'quest' | 'pantyReset' | 'custom';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  xp?: number;
  obedience?: number;
  tokens?: number;
  completed: boolean;
  source?: string;
  notes?: string;
  questlineId?: string;
  questStageId?: string;
  completedAt?: string;
}

export function cloneDefaultEvents(): CalendarEvent[] {
  return [];
}

export function generateEventId(source = "manual"): string {
  return `e${Date.now()}-${source}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normaliseDate(date: string): string {
  return new Date(date).toISOString().split("T")[0];
}

export function normaliseEvent(event: CalendarEvent): CalendarEvent {
  return {
    ...event,
    id: event.id || generateEventId(),
    date: normaliseDate(event.date),
    type: event.type || "custom",
    source: event.source || "manual",
    completed: !!event.completed,
  };
}

export function isSameDay(date1: string, date2: string): boolean {
  return normaliseDate(date1) === normaliseDate(date2);
}

export function sortByDate(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}
