'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePersistentState } from './usePersistentState';
import { useBuffs } from './useBuffs';
import {
  Companion,
  CompanionBuffKey,
  CompanionForm,
  CompanionXpEvent,
  COMPANION_BUFF_KEYS,
  canEvolve,
  cloneCompanion,
  cloneDefaultCompanions,
  getActiveForm,
  getNextForm,
  getXpForEvent,
  getXpProgression,
  totalXpToReachLevel,
  xpNeededForLevel,
} from '../lib/companions';
import { type Buff } from '../lib/buffEngine';

const COMPANION_EVOLUTION_ACHIEVEMENT = 'Companion Ascendant';
const MAX_EVOLUTION_TITLE = 'Dreamlord Keeper';
const FIRST_EVOLUTION_ACHIEVEMENT = 'First Bond Forged';

const COMPANION_PREFIX = 'companion';

const BUFF_COLOR_BY_KEY: Record<CompanionBuffKey, string> = {
  xpMultiplier: '#5eead4',
  obedienceGain: '#f472b6',
  tokenMultiplier: '#38bdf8',
  clarityBoost: '#c084fc',
};

type CompanionMutation = (current: Companion) => Companion;

type EvolutionRecord = {
  companionId: string;
  fromFormId: string;
  toFormId: string;
  triggeredAt: number;
  auto?: boolean;
};

type XpRecord = {
  companionId: string;
  delta: number;
  source: CompanionXpEvent;
  appliedAt: number;
};

export type DetailedCompanion = Companion & {
  activeFormDefinition?: CompanionForm;
  nextForm?: CompanionForm;
  xpProgress: ReturnType<typeof getXpProgression>;
  totalXp: number;
  evolutionReady: boolean;
};

function buildBuffSource(companionId: string, formId: string) {
  return `${COMPANION_PREFIX}:${companionId}:${formId}`;
}

function buildBuffId(companionId: string, formId: string, key: CompanionBuffKey) {
  return `${COMPANION_PREFIX}:${companionId}:${formId}:${key}`;
}

function isCompanionBuff(buff: Buff) {
  return buff.id.startsWith(`${COMPANION_PREFIX}:`);
}

function createBuffPayload(
  companion: Companion,
  form: CompanionForm,
  key: CompanionBuffKey,
  value: number,
  isActive: boolean
): Buff {
  return {
    id: buildBuffId(companion.id, form.id, key),
    name: `${companion.name} • ${form.name}`,
    source: buildBuffSource(companion.id, form.id),
    type: key,
    value,
    active: isActive,
    icon: form.icon,
    color: BUFF_COLOR_BY_KEY[key],
  };
}

function extractBuffPayloads(companion: Companion, form: CompanionForm): Buff[] {
  if (!form.buff) return [];
  return COMPANION_BUFF_KEYS.flatMap((key) => {
    const value = form.buff?.[key];
    if (typeof value !== 'number' || value <= 0) return [];
    return [createBuffPayload(companion, form, key, value, companion.activeForm === form.id)];
  });
}

function needsBuffUpdate(current: Buff | undefined, next: Buff) {
  if (!current) return true;
  return (
    current.name !== next.name ||
    current.source !== next.source ||
    current.type !== next.type ||
    current.value !== next.value ||
    current.active !== next.active ||
    current.icon !== next.icon ||
    current.color !== next.color
  );
}

export function useCompanions() {
  const [companions, setCompanions] = usePersistentState<Companion[]>('companions', cloneDefaultCompanions);
  const [titles, setTitles] = usePersistentState<string[]>('titlesUnlocked', () => []);
  const { buffs, addBuff, updateBuff, removeBuff } = useBuffs();

  const [recentEvolutions, setRecentEvolutions] = useState<EvolutionRecord[]>([]);
  const [recentXpGains, setRecentXpGains] = useState<XpRecord[]>([]);

  const awardTitle = useCallback(
    (title: string) => {
      if (!title) return;
      setTitles((previous) => (previous.includes(title) ? previous : [...previous, title]));
    },
    [setTitles]
  );

  const registerEvolution = useCallback(
    (companion: Companion, fromFormId: string, toFormId: string, auto?: boolean) => {
      setRecentEvolutions((previous) => [
        ...previous,
        {
          companionId: companion.id,
          fromFormId,
          toFormId,
          triggeredAt: Date.now(),
          auto,
        },
      ].slice(-10));

      awardTitle(FIRST_EVOLUTION_ACHIEVEMENT);
      awardTitle(COMPANION_EVOLUTION_ACHIEVEMENT);

      if (!getNextForm(companion)) {
        awardTitle(MAX_EVOLUTION_TITLE);
      }
    },
    [awardTitle]
  );

  const syncBuffRegistry = useCallback(
    (snapshot: Companion[]) => {
      const requiredBuffs = new Map<string, Buff>();
      snapshot.forEach((companion) => {
        const normalised = cloneCompanion(companion);
        normalised.forms.forEach((form) => {
          extractBuffPayloads(normalised, form).forEach((payload) => {
            requiredBuffs.set(payload.id, payload);
          });
        });
      });

      const existing = new Map(
        buffs.filter(isCompanionBuff).map((buff) => [buff.id, buff] as const)
      );

      requiredBuffs.forEach((payload, id) => {
        const current = existing.get(id);
        if (needsBuffUpdate(current, payload)) {
          if (!current) {
            addBuff(payload);
          } else {
            updateBuff(id, payload);
          }
        }
        existing.delete(id);
      });

      existing.forEach((_unused, id) => {
        removeBuff(id);
      });
    },
    [addBuff, buffs, removeBuff, updateBuff]
  );

  useEffect(() => {
    syncBuffRegistry(companions);
  }, [companions, syncBuffRegistry]);

  const updateCompanion = useCallback(
    (companionId: string, mutation: CompanionMutation) => {
      let result: Companion | null = null;
      setCompanions((previous) =>
        previous.map((entry) => {
          if (entry.id !== companionId) return entry;
          const mutated = cloneCompanion(mutation(cloneCompanion(entry)));
          result = mutated;
          return mutated;
        })
      );
      return result;
    },
    [setCompanions]
  );

  const addCompanion = useCallback(
    (companion: Companion) => {
      setCompanions((previous) => {
        const existing = previous.find((entry) => entry.id === companion.id);
        if (existing) {
          return previous.map((entry) => (entry.id === companion.id ? cloneCompanion(companion) : entry));
        }
        return [...previous, cloneCompanion(companion)];
      });
    },
    [setCompanions]
  );

  const removeCompanion = useCallback(
    (companionId: string) => {
      setCompanions((previous) => previous.filter((entry) => entry.id !== companionId));
    },
    [setCompanions]
  );

  const setActiveForm = useCallback(
    (companionId: string, formId: string) => {
      updateCompanion(companionId, (companion) => {
        if (!companion.forms.some((form) => form.id === formId)) return companion;
        return { ...companion, activeForm: formId };
      });
    },
    [updateCompanion]
  );

  const setAutoEvolve = useCallback(
    (companionId: string, value: boolean) => {
      updateCompanion(companionId, (companion) => ({ ...companion, autoEvolve: value }));
    },
    [updateCompanion]
  );

  const evolveCompanion = useCallback(
    (companionId: string) => {
      let fromFormId: string | null = null;
      let toFormId: string | null = null;

      const evolved = updateCompanion(companionId, (companion) => {
        const nextForm = getNextForm(companion);
        if (!nextForm || companion.activeForm === nextForm.id) return companion;
        fromFormId = companion.activeForm;
        toFormId = nextForm.id;
        return { ...companion, activeForm: nextForm.id };
      });

      if (evolved && fromFormId && toFormId) {
        registerEvolution(evolved, fromFormId, toFormId, false);
      }
    },
    [registerEvolution, updateCompanion]
  );

  const resetEvolution = useCallback(
    (companionId: string) => {
      updateCompanion(companionId, (companion) => {
        const firstForm = companion.forms[0];
        return {
          ...companion,
          level: 1,
          xp: 0,
          activeForm: firstForm ? firstForm.id : companion.activeForm,
        };
      });
    },
    [updateCompanion]
  );

  const gainXp = useCallback(
    (companionId: string, event: CompanionXpEvent, multiplier: number = 1) => {
      const baseGain = Math.round(getXpForEvent(event) * Math.max(multiplier, 0));
      if (baseGain <= 0) return;

      const evolutions: Array<{ from: string; to: string; snapshot: Companion }> = [];

      updateCompanion(companionId, (companion) => {
        setRecentXpGains((previous) => [
          ...previous,
          {
            companionId: companion.id,
            delta: baseGain,
            source: event,
            appliedAt: Date.now(),
          },
        ].slice(-20));

        let xpPool = companion.xp + baseGain;
        let level = companion.level;
        while (xpPool >= xpNeededForLevel(level + 1)) {
          xpPool -= xpNeededForLevel(level + 1);
          level += 1;
        }

        let nextState: Companion = {
          ...companion,
          level,
          xp: xpPool,
        };

        while (nextState.autoEvolve && canEvolve(nextState)) {
          const nextForm = getNextForm(nextState);
          if (!nextForm) break;
          const updatedState: Companion = {
            ...nextState,
            activeForm: nextForm.id,
          };
          evolutions.push({
            from: nextState.activeForm,
            to: nextForm.id,
            snapshot: updatedState,
          });
          nextState = updatedState;
        }

        return nextState;
      });

      if (evolutions.length > 0) {
        evolutions.forEach(({ from, to, snapshot }) => {
          registerEvolution(snapshot, from, to, true);
        });
      }
    },
    [registerEvolution, updateCompanion]
  );

  const gainXpForCompanions = useCallback(
    (companionIds: string[], event: CompanionXpEvent, multiplier: number = 1) => {
      companionIds.forEach((id) => gainXp(id, event, multiplier));
    },
    [gainXp]
  );

  const detailedCompanions = useMemo<DetailedCompanion[]>(() =>
    companions.map((companion) => {
      const activeForm = getActiveForm(companion);
      const nextForm = getNextForm(companion);
      const progression = getXpProgression(companion);
      return {
        ...companion,
        activeFormDefinition: activeForm,
        nextForm,
        xpProgress: progression,
        totalXp: totalXpToReachLevel(companion.level) + companion.xp,
        evolutionReady: Boolean(nextForm && companion.level >= nextForm.unlockAt),
      } as DetailedCompanion;
    }),
    [companions]
  );

  const acknowledgeRecentEvolutions = useCallback(() => setRecentEvolutions([]), []);
  const acknowledgeRecentXp = useCallback(() => setRecentXpGains([]), []);

  return {
    companions,
    detailedCompanions,
    addCompanion,
    removeCompanion,
    updateCompanion,
    setActiveForm,
    setAutoEvolve,
    resetEvolution,
    gainXp,
    gainXpForCompanions,
    evolveCompanion,
    recentEvolutions,
    recentXpGains,
    acknowledgeRecentEvolutions,
    acknowledgeRecentXp,
    titles,
    awardTitle,
  } as const;
}
