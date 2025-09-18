'use client';

import { useCallback, useEffect, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import {
  applyBuffs,
  cloneDefaultBuffs,
  computeRemaining,
  isBuffActive,
  isBuffExpired,
  parseDuration,
  type Buff,
  type BuffEvent,
  type BuffType,
} from "../lib/buffEngine";

function normaliseBuff(buff: Buff): Buff {
  return {
    ...buff,
    expiresAt: typeof buff.expiresAt === "number" ? buff.expiresAt : null,
  };
}

export function useBuffs() {
  const [buffs, setBuffs] = usePersistentState<Buff[]>("buffs", cloneDefaultBuffs);

  const activeBuffs = useMemo(() => {
    const current = Date.now();
    return buffs.filter((buff) => isBuffActive(buff, current));
  }, [buffs]);

  const applyEvent = useCallback(
    (event: BuffEvent, baseValue: number) => {
      if (baseValue <= 0) return 0;
      const snapshot = buffs;
      const { value, expiredIds } = applyBuffs(snapshot, event, baseValue, Date.now());

      if (expiredIds.length > 0) {
        setBuffs((previous) =>
          previous.map((buff) =>
            expiredIds.includes(buff.id)
              ? { ...buff, active: false, expiresAt: null }
              : buff
          )
        );
      }

      const shouldRound = event !== "clarity";
      const rounded = shouldRound ? Math.round(value) : Number(value.toFixed(2));
      return rounded > 0 ? rounded : 0;
    },
    [buffs, setBuffs]
  );

  const setBuffActive = useCallback(
    (id: string, active: boolean) => {
      setBuffs((previous) =>
        previous.map((buff) =>
          buff.id === id
            ? {
                ...buff,
                active,
                expiresAt: active ? buff.expiresAt ?? null : null,
              }
            : buff
        )
      );
    },
    [setBuffs]
  );

  const activateBuffsBySource = useCallback(
    (source: string) => {
      setBuffs((previous) =>
        previous.map((buff) =>
          buff.source === source
            ? { ...buff, active: true }
            : buff
        )
      );
    },
    [setBuffs]
  );

  const deactivateBuffsBySource = useCallback(
    (source: string) => {
      setBuffs((previous) =>
        previous.map((buff) =>
          buff.source === source
            ? { ...buff, active: false, expiresAt: null }
            : buff
        )
      );
    },
    [setBuffs]
  );

  const triggerBuffBySource = useCallback(
    (source: string) => {
      const activatedAt = Date.now();
      setBuffs((previous) =>
        previous.map((buff) => {
          if (buff.source !== source) return buff;
          const durationMs = parseDuration(buff.duration);
          return {
            ...buff,
            active: true,
            expiresAt: durationMs ? activatedAt + durationMs : buff.expiresAt ?? null,
          };
        })
      );
    },
    [setBuffs]
  );

  const addBuff = useCallback(
    (buff: Buff) => {
      setBuffs((previous) => {
        if (previous.some((entry) => entry.id === buff.id)) {
          return previous.map((entry) => (entry.id === buff.id ? normaliseBuff(buff) : entry));
        }
        return [...previous, normaliseBuff(buff)];
      });
    },
    [setBuffs]
  );

  const updateBuff = useCallback(
    (id: string, patch: Partial<Buff>) => {
      setBuffs((previous) =>
        previous.map((buff) =>
          buff.id === id
            ? normaliseBuff({ ...buff, ...patch })
            : buff
        )
      );
    },
    [setBuffs]
  );

  const removeBuff = useCallback(
    (id: string) => {
      setBuffs((previous) => previous.filter((buff) => buff.id !== id));
    },
    [setBuffs]
  );

  const toggleBuff = useCallback(
    (id: string) => {
      setBuffs((previous) =>
        previous.map((buff) =>
          buff.id === id
            ? { ...buff, active: !buff.active, expiresAt: !buff.active ? buff.expiresAt : null }
            : buff
        )
      );
    },
    [setBuffs]
  );

  const clearExpired = useCallback(() => {
    const current = Date.now();
    setBuffs((previous) =>
      previous.map((buff) =>
        isBuffExpired(buff, current)
          ? { ...buff, active: false, expiresAt: null }
          : buff
      )
    );
  }, [setBuffs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = window.setInterval(clearExpired, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [clearExpired]);

  const getRemainingForBuff = useCallback(
    (buff: Buff, at?: number) => computeRemaining(buff, at ?? Date.now()),
    []
  );

  return {
    buffs,
    activeBuffs,
    applyEvent,
    setBuffActive,
    activateBuffsBySource,
    deactivateBuffsBySource,
    triggerBuffBySource,
    addBuff,
    updateBuff,
    removeBuff,
    toggleBuff,
    clearExpired,
    getRemainingForBuff,
  };
}
