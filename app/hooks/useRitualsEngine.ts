'use client';

import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useBuffs } from "./useBuffs";
import { useCompanions } from "./useCompanions";
import { useNpcs } from "./useNpcs";
import {
  cloneDefaultRitualLogs,
  cloneDefaultRituals,
  computeRitualProgress,
  type Ritual,
  type RitualLog,
  type RitualProgress,
} from "../lib/rituals";

export type CompleteRitualOutcome =
  | {
      status: "completed";
      ritual: Ritual;
      xpAwarded: number;
      obedienceAwarded: number;
      progress: RitualProgress;
      log: RitualLog;
    }
  | {
      status: "already-completed";
      ritual: Ritual;
      progress: RitualProgress;
    }
  | {
      status: "not-found";
    };

const FALLBACK_ID = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : 'ritual-' + Date.now().toString(36);

export function useRitualsEngine() {
  const [rituals, setRituals] = usePersistentState<Ritual[]>("rituals", cloneDefaultRituals);
  const [logs, setLogs] = usePersistentState<RitualLog[]>("ritualLogs", cloneDefaultRitualLogs);
  const [xp, setXp] = usePersistentState<number>("xpTotal", () => 3400);
  const [obedience, setObedience] = usePersistentState<number>("obediencePoints", () => 0);
  const { applyEvent, triggerBuffBySource } = useBuffs();
  const { companions, gainXpForCompanions } = useCompanions();
  const { npcs, adjustShame: adjustNpcShame } = useNpcs();

  const progressById = useMemo(() => {
    const now = new Date();
    return rituals.reduce<Record<string, RitualProgress>>((acc, ritual) => {
      acc[ritual.id] = computeRitualProgress(ritual, logs, now);
      return acc;
    }, {});
  }, [logs, rituals]);

  const readStreakMultiplierEnabled = useCallback(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw = window.localStorage.getItem("controlNexus");
      if (!raw) return true;
      const parsed = JSON.parse(raw) as { rituals?: { streakMultiplierEnabled?: boolean } };
      return parsed?.rituals?.streakMultiplierEnabled !== false;
    } catch {
      return true;
    }
  }, []);

  const completeRitual = useCallback(
    (ritualId: string): CompleteRitualOutcome => {
      const ritual = rituals.find((item) => item.id === ritualId);
      if (!ritual) {
        return { status: "not-found" };
      }

      const now = new Date();
      let outcome: CompleteRitualOutcome = {
        status: "already-completed",
        ritual,
        progress: computeRitualProgress(ritual, logs, now),
      };

      setLogs((previousLogs) => {
        const progressBefore = computeRitualProgress(ritual, previousLogs, now);
        if (progressBefore.completed) {
          outcome = { status: "already-completed", ritual, progress: progressBefore };
          return previousLogs;
        }

        const baseLog: RitualLog = {
          id: FALLBACK_ID(),
          ritualId,
          timestamp: now.toISOString(),
        };

        const tentativeLogs = [...previousLogs, baseLog];
        const progressAfter = computeRitualProgress(ritual, tentativeLogs, now);
        const multiplierEnabled = readStreakMultiplierEnabled();
        const appliedMultiplier = multiplierEnabled ? progressAfter.multiplier : 0;
        const xpWithBonus = Math.round(ritual.xp * (1 + appliedMultiplier));
        const obedienceAwarded = ritual.obedience;
        const finalXp = applyEvent("xp", xpWithBonus);
        const finalObedience = applyEvent("obedience", obedienceAwarded);
        const completedLog: RitualLog = {
          ...baseLog,
          xpAwarded: finalXp,
          obedienceAwarded: finalObedience,
          multiplierApplied: appliedMultiplier,
        };

        const updatedLogs = [...previousLogs, completedLog];

        setXp((prev) => prev + finalXp);
        setObedience((prev) => prev + finalObedience);
        setRituals((prev) =>
          prev.map((item) =>
            item.id === ritualId
              ? {
                  ...item,
                  streak: progressAfter.streak,
                }
              : item
          )
        );

        triggerBuffBySource(ritual.name);

        const ritualText = ritual.name.toLowerCase();
        npcs.forEach((npc) => {
          if (ritualText.includes(npc.name.toLowerCase())) {
            adjustNpcShame(npc.id, 5);
          }
        });

        outcome = {
          status: "completed",
          ritual,
          xpAwarded: finalXp,
          obedienceAwarded: finalObedience,
          progress: progressAfter,
          log: completedLog,
        };

        return updatedLogs;
      });

      if (outcome.status === "already-completed" && companions.length > 0) {
        gainXpForCompanions(
          companions.map((companion) => companion.id),
          "ritual"
        );
      }

      return outcome;
    },
    [adjustNpcShame, companions, gainXpForCompanions, logs, npcs, readStreakMultiplierEnabled, rituals, setLogs, setObedience, setRituals, setXp]
  );

  const resetRitualStreak = useCallback(
    (ritualId: string) => {
      setRituals((prev) =>
        prev.map((item) =>
          item.id === ritualId
            ? {
                ...item,
                streak: 0,
              }
            : item
        )
      );
      setLogs((prev) => prev.filter((log) => log.ritualId !== ritualId));
    },
    [setLogs, setRituals]
  );

  const addRitual = useCallback(
    (ritual: Ritual) => {
      setRituals((prev) => [...prev, ritual]);
    },
    [setRituals]
  );

  const updateRitual = useCallback(
    (ritualId: string, patch: Partial<Ritual>) => {
      setRituals((prev) =>
        prev.map((item) =>
          item.id === ritualId
            ? {
                ...item,
                ...patch,
              }
            : item
        )
      );
    },
    [setRituals]
  );

  const deleteRitual = useCallback(
    (ritualId: string) => {
      setRituals((prev) => prev.filter((item) => item.id !== ritualId));
      setLogs((prev) => prev.filter((log) => log.ritualId !== ritualId));
    },
    [setLogs, setRituals]
  );

  const ritualLogsDescending = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  return {
    rituals,
    logs: ritualLogsDescending,
    progressById,
    completeRitual,
    addRitual,
    updateRitual,
    deleteRitual,
    resetRitualStreak,
    xp,
    obedience,
    setXp,
    setObedience,
  };
}
