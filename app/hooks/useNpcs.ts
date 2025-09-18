'use client';

import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { cloneDefaultNpcs, clampMeter, normaliseDialogue, normaliseNpc, type DialogueEntry, type Npc } from '../lib/npcs';
import { useInventory } from './useInventory';

const NPC_ACHIEVEMENTS_KEY = 'npcAchievements';

export function useNpcs() {
  const [npcs, setNpcs] = usePersistentState<Npc[]>('npcs', cloneDefaultNpcs);
  const [achievements, setAchievements] = usePersistentState<string[]>(NPC_ACHIEVEMENTS_KEY, () => []);
  const [titles, setTitles] = usePersistentState<string[]>('titlesUnlocked', () => []);
  const { awardXp } = useInventory();

  const setSafe = useCallback(
    (updater: (previous: Npc[]) => Npc[]) => {
      setNpcs((previous) => updater(previous).map((npc) => normaliseNpc(npc)));
    },
    [setNpcs]
  );

  const addNpc = useCallback(
    (npc: Npc) => {
      setSafe((previous) => {
        const exists = previous.some((entry) => entry.id === npc.id);
        return exists
          ? previous.map((entry) => (entry.id === npc.id ? normaliseNpc({ ...entry, ...npc }) : entry))
          : [...previous, normaliseNpc(npc)];
      });
      awardXp(10);
    },
    [awardXp, setSafe]
  );

  const updateNpc = useCallback(
    (npcId: string, updater: (npc: Npc) => Npc) => {
      setSafe((previous) =>
        previous.map((entry) => (entry.id === npcId ? normaliseNpc(updater({ ...entry })) : entry))
      );
    },
    [setSafe]
  );

  const removeNpc = useCallback(
    (npcId: string) => {
      setSafe((previous) => previous.filter((npc) => npc.id !== npcId));
    },
    [setSafe]
  );

  const ensureNpcByName = useCallback(
    (name: string, role: string = 'Friend') => {
      const existing = npcs.find((npc) => npc.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing;
      const id = `npc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newNpc: Npc = {
        id,
        name,
        role,
        dreamCount: 0,
        trust: 30,
        shame: 10,
        bio: '',
        dialogues: [],
      };
      const normalised = normaliseNpc(newNpc);
      setSafe((previous) => [...previous, normalised]);
      return normalised;
    },
    [npcs, setSafe]
  );

  const incrementDreamCount = useCallback(
    (npcId: string, amount: number = 1) => {
      if (amount === 0) return;
      updateNpc(npcId, (npc) => ({
        ...npc,
        dreamCount: Math.max(0, npc.dreamCount + amount),
      }));
    },
    [updateNpc]
  );

  const adjustTrust = useCallback(
    (npcId: string, delta: number) => {
      if (delta === 0) return;
      updateNpc(npcId, (npc) => {
        const trust = clampMeter(npc.trust + delta);
        if (trust >= 100 && !achievements.includes('Bonded Dreamer')) {
          setAchievements((previous) => (previous.includes('Bonded Dreamer') ? previous : [...previous, 'Bonded Dreamer']));
          awardXp(25);
        }
        return { ...npc, trust };
      });
    },
    [achievements, awardXp, setAchievements, updateNpc]
  );

  const adjustShame = useCallback(
    (npcId: string, delta: number) => {
      if (delta === 0) return;
      updateNpc(npcId, (npc) => {
        const shame = clampMeter(npc.shame + delta);
        if (shame >= 100 && !titles.includes('Worthless Toy')) {
          setTitles((previous) => (previous.includes('Worthless Toy') ? previous : [...previous, 'Worthless Toy']));
        }
        return { ...npc, shame };
      });
    },
    [setTitles, titles, updateNpc]
  );

  const addDialogue = useCallback(
    (npcId: string, text: string, date: string = new Date().toISOString()) => {
      if (!text.trim()) return;
      const dialogue: DialogueEntry = normaliseDialogue({
        id: `dlg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        text: text.trim(),
        date,
      });
      let shouldAwardBonus = false;
      updateNpc(npcId, (npc) => {
        shouldAwardBonus = npc.dialogues.length === 0;
        return {
          ...npc,
          dialogues: [...npc.dialogues, dialogue],
        };
      });
      if (shouldAwardBonus) {
        awardXp(20);
      }
    },
    [awardXp, updateNpc]
  );

  const resetNpcs = useCallback(() => {
    setNpcs(cloneDefaultNpcs());
    setAchievements([]);
  }, [setAchievements, setNpcs]);

  return {
    npcs,
    achievements,
    addNpc,
    updateNpc,
    removeNpc,
    ensureNpcByName,
    incrementDreamCount,
    adjustTrust,
    adjustShame,
    addDialogue,
    resetNpcs,
  } as const;
}

export default useNpcs;
