import defaultCompanions from "../../data/companions.json";

export type CompanionBuff = {
  xpMultiplier?: number;
  obedienceGain?: number;
  tokenMultiplier?: number;
  clarityBoost?: number;
};

export type CompanionBuffKey = keyof CompanionBuff;

export const COMPANION_BUFF_KEYS: CompanionBuffKey[] = [
  "xpMultiplier",
  "obedienceGain",
  "tokenMultiplier",
  "clarityBoost",
];

export type CompanionForm = {
  id: string;
  name: string;
  unlockAt: number;
  buff?: CompanionBuff;
  icon?: string;
  description?: string;
};

export type Companion = {
  id: string;
  name: string;
  level: number;
  xp: number;
  lore?: string;
  forms: CompanionForm[];
  activeForm: string;
  autoEvolve?: boolean;
};

export type CompanionXpEvent = "dream" | "ritual" | "quest" | "panty";

const DEFAULT_COMPANIONS = (defaultCompanions as Companion[]).map((companion) => cloneCompanion(companion));

export function cloneCompanion(companion: Companion): Companion {
  const normalisedForms = [...companion.forms]
    .map((form, index) => normaliseForm(form, index))
    .sort((a, b) => (a.unlockAt ?? 0) - (b.unlockAt ?? 0));

  const activeForm = normalisedForms.find((form) => form.id === companion.activeForm)?.id
    ?? normalisedForms[0]?.id
    ?? companion.activeForm;

  const level = Math.max(1, Number(companion.level) || 1);
  const carryOverXp = Math.max(0, Number(companion.xp) || 0);
  const sanitisedXp = clampXp(carryOverXp, level);

  return {
    ...companion,
    level,
    xp: sanitisedXp,
    autoEvolve: Boolean(companion.autoEvolve),
    activeForm,
    forms: normalisedForms,
  };
}

export function cloneDefaultCompanions(): Companion[] {
  return DEFAULT_COMPANIONS.map((companion) => cloneCompanion(companion));
}

function normaliseForm(form: CompanionForm, index: number): CompanionForm {
  const unlockAt = typeof form.unlockAt === "number"
    ? Math.max(1, form.unlockAt)
    : index === 0
      ? 1
      : 1 + index * 2;

  return {
    ...form,
    unlockAt,
    buff: form.buff ? { ...form.buff } : undefined,
  };
}

function clampXp(xp: number, level: number): number {
  const capacity = xpNeededForLevel(level + 1);
  if (capacity <= 0) return 0;
  return Math.min(xp, capacity - 1);
}

export function getActiveForm(companion: Companion): CompanionForm | undefined {
  return companion.forms.find((form) => form.id === companion.activeForm);
}

export function getNextForm(companion: Companion): CompanionForm | undefined {
  const next = companion.forms
    .filter((form) => form.unlockAt > (getActiveForm(companion)?.unlockAt ?? 0))
    .sort((a, b) => a.unlockAt - b.unlockAt)[0];
  return next;
}

export function canEvolve(companion: Companion): boolean {
  const next = getNextForm(companion);
  if (!next) return false;
  return companion.level >= next.unlockAt;
}

export const XP_EVENT_VALUES: Record<CompanionXpEvent, number> = {
  dream: 10,
  ritual: 20,
  quest: 50,
  panty: 30,
};

export function getXpForEvent(event: CompanionXpEvent): number {
  return XP_EVENT_VALUES[event] ?? 0;
}

export function levelForXp(level: number, xp: number): number {
  let currentLevel = level;
  let remainingXp = xp;
  while (remainingXp >= xpNeededForLevel(currentLevel + 1)) {
    remainingXp -= xpNeededForLevel(currentLevel + 1);
    currentLevel += 1;
  }
  return currentLevel;
}

export function xpNeededForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  return Math.max(20, targetLevel * 20);
}

export function totalXpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let current = 2; current <= level; current += 1) {
    total += xpNeededForLevel(current);
  }
  return total;
}

export function getXpProgression(companion: Companion) {
  const nextLevel = companion.level + 1;
  const needed = xpNeededForLevel(nextLevel);
  return {
    level: companion.level,
    current: companion.xp,
    needed,
    ratio: needed <= 0 ? 0 : Math.max(0, Math.min(1, companion.xp / needed)),
  };
}
