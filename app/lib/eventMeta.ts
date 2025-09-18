import type { EventType } from './events';

export type EventTypeKey = EventType | 'custom';

export const EVENT_TYPE_ICONS: Record<EventTypeKey, string> = {
  ritual: '🔒',
  quest: '📖',
  pantyReset: '🩲',
  custom: '✨',
};

export const EVENT_TYPE_AURAS: Record<EventTypeKey, string> = {
  ritual: 'shadow-[0_0_18px_rgba(168,85,247,0.6)] bg-purple-500/30 border-purple-400/50',
  quest: 'shadow-[0_0_18px_rgba(14,165,233,0.6)] bg-sky-500/30 border-sky-400/50',
  pantyReset: 'shadow-[0_0_18px_rgba(244,114,182,0.6)] bg-rose-500/30 border-rose-400/50',
  custom: 'shadow-[0_0_18px_rgba(16,185,129,0.45)] bg-emerald-500/25 border-emerald-400/40',
};

export const EVENT_TYPE_BADGES: Record<EventTypeKey, string> = {
  ritual: 'border-purple-400/40 bg-purple-500/20 text-purple-100',
  quest: 'border-sky-400/40 bg-sky-500/20 text-sky-100',
  pantyReset: 'border-rose-400/40 bg-rose-500/20 text-rose-100',
  custom: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-100',
};

export const EVENT_TYPE_LABELS: Record<EventTypeKey, string> = {
  ritual: 'Ritual',
  quest: 'Quest Deadline',
  pantyReset: 'Panty Reset',
  custom: 'Custom Event',
};

export const EVENT_SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual Entry',
  'ritual-auto': 'Daily Ritual Engine',
  'panty-reset-auto': 'Panty Reset Automation',
  quest: 'Quest Deadline',
  imported: 'Imported (iCal)',
  external: 'External Sync',
};

export function resolveEventSourceLabel(source?: string): string {
  return EVENT_SOURCE_LABELS[source ?? 'manual'] ?? 'Synced';
}

export function resolveEventType(type?: string): EventTypeKey {
  if (type === 'ritual' || type === 'quest' || type === 'pantyReset') {
    return type;
  }
  return 'custom';
}
