import defaultBuffs from "../../data/buffs.json";

export type BuffEvent = "xp" | "obedience" | "tokens" | "clarity";

export type BuffType = "xpMultiplier" | "obedienceGain" | "tokenMultiplier" | "clarityBoost";

export type Buff = {
  id: string;
  name: string;
  source: string;
  type: BuffType;
  value: number;
  active: boolean;
  icon?: string;
  color?: string;
  duration?: string;
  expiresAt?: number | null;
};

const EVENT_TO_TYPES: Record<BuffEvent, BuffType[]> = {
  xp: ["xpMultiplier"],
  obedience: ["obedienceGain"],
  tokens: ["tokenMultiplier"],
  clarity: ["clarityBoost"],
};

const DEFAULT_BUFFS = (defaultBuffs as Buff[]).map((buff) => ({ ...buff }));

export const BUFF_TYPE_OPTIONS: BuffType[] = [
  "xpMultiplier",
  "obedienceGain",
  "tokenMultiplier",
  "clarityBoost",
];

export function cloneDefaultBuffs(): Buff[] {
  return DEFAULT_BUFFS.map((buff) => ({ ...buff }));
}

export function isBuffExpired(buff: Buff, now: number): boolean {
  if (!buff.expiresAt) return false;
  return buff.expiresAt <= now;
}

export function isBuffActive(buff: Buff, now: number): boolean {
  return buff.active && !isBuffExpired(buff, now);
}

export type BuffCalculationResult = {
  value: number;
  multiplier: number;
  applied: Buff[];
  expiredIds: string[];
};

export function applyBuffs(
  buffs: Buff[],
  event: BuffEvent,
  baseValue: number,
  now: number = Date.now()
): BuffCalculationResult {
  const applicableTypes = EVENT_TO_TYPES[event];
  if (!applicableTypes || applicableTypes.length === 0) {
    return { value: baseValue, multiplier: 1, applied: [], expiredIds: [] };
  }

  let multiplier = 1;
  const applied: Buff[] = [];
  const expiredIds: string[] = [];

  for (const buff of buffs) {
    if (isBuffExpired(buff, now)) {
      expiredIds.push(buff.id);
      continue;
    }
    if (!buff.active) continue;
    if (!applicableTypes.includes(buff.type)) continue;
    multiplier *= buff.value;
    applied.push(buff);
  }

  return {
    value: baseValue * multiplier,
    multiplier,
    applied,
    expiredIds,
  };
}

export function parseDuration(duration?: string | null): number | null {
  if (!duration) return null;
  const pattern = /([0-9]+)\s*(d|h|m|s)/gi;
  let match: RegExpExecArray | null;
  let total = 0;
  while ((match = pattern.exec(duration))) {
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (Number.isNaN(amount)) continue;
    switch (unit) {
      case "d":
        total += amount * 24 * 60 * 60 * 1000;
        break;
      case "h":
        total += amount * 60 * 60 * 1000;
        break;
      case "m":
        total += amount * 60 * 1000;
        break;
      case "s":
        total += amount * 1000;
        break;
      default:
        break;
    }
  }
  return total > 0 ? total : null;
}

export function computeRemaining(buff: Buff, now: number = Date.now()): number | null {
  if (!buff.expiresAt) return null;
  const remaining = buff.expiresAt - now;
  return remaining > 0 ? remaining : 0;
}
