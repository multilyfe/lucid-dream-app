import rawRituals from "../../data/rituals.json";
import rawRitualLogs from "../../data/ritualLogs.json";

export type RitualFrequency = "daily" | "weekly" | "monthly" | "yearly";

export type Ritual = {
  id: string;
  name: string;
  type: RitualFrequency;
  xp: number;
  obedience: number;
  completedToday?: boolean;
  completedThisWeek?: boolean;
  completedThisMonth?: boolean;
  completedThisYear?: boolean;
  streak?: number;
};

export type RitualLog = {
  id: string;
  ritualId: string;
  timestamp: string;
  xpAwarded?: number;
  obedienceAwarded?: number;
  multiplierApplied?: number;
};

export type RitualProgress = {
  streak: number;
  completed: boolean;
  multiplier: number;
  lastCompletedAt?: string;
};

const DAY_MS = 86_400_000;
const WEEK_MS = DAY_MS * 7;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getPeriodIndexFromDate(date: Date, type: RitualFrequency): number {
  const dayStart = startOfDay(date);
  switch (type) {
    case "daily":
      return Math.floor(dayStart.getTime() / DAY_MS);
    case "weekly":
      return Math.floor(dayStart.getTime() / WEEK_MS);
    case "monthly":
      return dayStart.getFullYear() * 12 + dayStart.getMonth();
    case "yearly":
      return dayStart.getFullYear();
  }
}

function stepBackPeriod(index: number, type: RitualFrequency): number {
  switch (type) {
    case "daily":
    case "weekly":
    case "monthly":
    case "yearly":
      return index - 1;
  }
}

const MULTIPLIERS: Record<RitualFrequency, { threshold: number; bonus: number }> = {
  daily: { threshold: 3, bonus: 0.1 },
  weekly: { threshold: 4, bonus: 0.2 },
  monthly: { threshold: 3, bonus: 0.5 },
  yearly: { threshold: Infinity, bonus: 0 },
};

export function cloneDefaultRituals(): Ritual[] {
  return (rawRituals as Ritual[]).map((ritual) => ({ ...ritual }));
}

export function cloneDefaultRitualLogs(): RitualLog[] {
  return (rawRitualLogs as RitualLog[]).map((log) => ({ ...log }));
}

export function computeRitualProgress(
  ritual: Ritual,
  logs: RitualLog[],
  referenceDate: Date = new Date()
): RitualProgress {
  const relevantLogs = logs
    .filter((log) => log.ritualId === ritual.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const uniquePeriods: number[] = [];
  const seen = new Set<number>();
  for (const log of relevantLogs) {
    const index = getPeriodIndexFromDate(new Date(log.timestamp), ritual.type);
    if (!seen.has(index)) {
      uniquePeriods.push(index);
      seen.add(index);
    }
  }

  if (uniquePeriods.length === 0) {
    return { streak: 0, completed: false, multiplier: 0 };
  }

  const currentIndex = getPeriodIndexFromDate(referenceDate, ritual.type);
  const completed = uniquePeriods[0] === currentIndex;
  const { threshold, bonus } = MULTIPLIERS[ritual.type];

  let streak = 0;
  let expected = completed ? currentIndex : stepBackPeriod(currentIndex, ritual.type);

  for (const periodIndex of uniquePeriods) {
    if (periodIndex === expected) {
      streak += 1;
      expected = stepBackPeriod(expected, ritual.type);
    } else if (periodIndex < expected) {
      break;
    }
  }

  const multiplier = streak >= threshold ? bonus : 0;

  return {
    streak,
    completed,
    multiplier,
    lastCompletedAt: relevantLogs[0]?.timestamp,
  };
}

export function formatRitualType(type: RitualFrequency) {
  switch (type) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    default:
      return type;
  }
}

export function describeMultiplier(type: RitualFrequency) {
  const { threshold, bonus } = MULTIPLIERS[type];
  if (!Number.isFinite(threshold) || bonus <= 0) return null;
  return {
    threshold,
    bonus,
  };
}
