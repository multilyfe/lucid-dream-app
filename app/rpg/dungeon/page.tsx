"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import DungeonHUD from "../../components/DungeonHUD";
import DungeonRoom from "../../components/DungeonRoom";
import DungeonComplete from "../../components/DungeonComplete";
import { useDungeons } from "../../hooks/useDungeons";
import { useInventory } from "../../hooks/useInventory";
import { useBuffs } from "../../hooks/useBuffs";
import { usePersistentState } from "../../hooks/usePersistentState";
import { type Dungeon, type DungeonRoom as DungeonRoomType } from "../../lib/dungeons";

const MAX_HP = 100;
const ENCOUNTER_THRESHOLD = 10;
const BOSS_THRESHOLD = 15;
const ENCOUNTER_DAMAGE = 22;
const BOSS_DAMAGE = 32;

const ACHIEVEMENTS = {
  FIRST_CLEAR: "First Dungeon Cleared",
  BOSS_SLAYER: "Boss Slayer",
  MASTER: "Panty Dungeon Master",
};

type RunState = "idle" | "running" | "complete";

export default function DungeonPage() {
  const { dungeons, markCompleted } = useDungeons();
  const { gainItem } = useInventory();
  const { applyEvent, addBuff, triggerBuffBySource } = useBuffs();
  const [xpTotal, setXpTotal] = usePersistentState<number>("xpTotal", () => 3400);
  const [unlockedAchievements, setUnlockedAchievements] = usePersistentState<string[]>(
    "dungeonAchievements",
    () => []
  );

  const [selectedDungeonId, setSelectedDungeonId] = useState<string | null>(() => dungeons[0]?.id ?? null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [runSuccess, setRunSuccess] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [xpGained, setXpGained] = useState(0);
  const [lootCollected, setLootCollected] = useState<string[]>([]);
  const [roomStatus, setRoomStatus] = useState<'idle' | 'rolling' | 'won' | 'lost' | 'fled'>("idle");
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const selectedDungeon = useMemo<Dungeon | undefined>(
    () => dungeons.find((dungeon) => dungeon.id === selectedDungeonId) ?? dungeons[0],
    [dungeons, selectedDungeonId]
  );

  useEffect(() => {
    if (!selectedDungeon && dungeons.length > 0) {
      setSelectedDungeonId(dungeons[0].id);
    }
  }, [dungeons, selectedDungeon]);

  const resetRun = useCallback(() => {
    setRoomIndex(0);
    setHp(MAX_HP);
    setXpGained(0);
    setLootCollected([]);
    setRoomStatus("idle");
    setLastRoll(null);
    setNewAchievements([]);
    setRunSuccess(false);
  }, []);

  const startRun = useCallback(() => {
    if (!selectedDungeon) return;
    resetRun();
    setRunState("running");
  }, [resetRun, selectedDungeon]);

  const unlockAchievement = useCallback(
    (label: string) => {
      if (!label) return;
      setUnlockedAchievements((previous) => {
        if (previous.includes(label)) return previous;
        return [...previous, label];
      });
      setNewAchievements((previous) => (previous.includes(label) ? previous : [...previous, label]));
    },
    [setUnlockedAchievements]
  );

  const awardXp = useCallback(
    (amount?: number) => {
      if (!amount || amount <= 0) return 0;
      const total = applyEvent("xp", amount);
      if (total > 0) {
        setXpTotal((prev) => prev + total);
        setXpGained((prev) => prev + total);
      }
      return total;
    },
    [applyEvent, setXpTotal]
  );

  const awardLoot = useCallback(
    (loot?: string[]) => {
      if (!loot || loot.length === 0) return;
      loot.forEach((itemId) => gainItem(itemId, 1));
      setLootCollected((previous) => [...previous, ...loot]);
    },
    [gainItem]
  );

  const advanceRoom = useCallback(() => {
    if (!selectedDungeon) return;
    if (roomIndex + 1 >= selectedDungeon.rooms.length) {
      setRunSuccess(true);
      setRunState("complete");
      setRoomStatus("won");
      markCompleted(selectedDungeon.id);
      return;
    }
    setRoomIndex((prev) => prev + 1);
    setRoomStatus("idle");
    setLastRoll(null);
  }, [markCompleted, roomIndex, selectedDungeon]);

  const handleEventRoom = useCallback(
    (room: DungeonRoomType) => {
      awardXp(room.xp);
      awardLoot(room.loot);
      advanceRoom();
    },
    [advanceRoom, awardLoot, awardXp]
  );

  const handleVictory = useCallback(
    (room: DungeonRoomType) => {
      awardXp(room.xp);
      awardLoot(room.loot);
      if (room.type === "boss") {
        unlockAchievement(ACHIEVEMENTS.BOSS_SLAYER);
      }
      setRoomStatus("won");
      advanceRoom();
    },
    [advanceRoom, awardLoot, awardXp, unlockAchievement]
  );

  const endRun = useCallback(() => {
    setRunSuccess(false);
    setRunState("complete");
  }, []);

  const handleFailure = useCallback((roomType: DungeonRoomType["type"]) => {
    setRoomStatus("lost");
    const damage = roomType === "boss" ? BOSS_DAMAGE : ENCOUNTER_DAMAGE;
    setHp((prev) => Math.max(0, prev - damage));
  }, []);

  useEffect(() => {
    if (hp <= 0 && runState === "running") {
      setRoomStatus("lost");
      endRun();
    }
  }, [hp, runState, endRun]);

  useEffect(() => {
    if (runState !== "complete" || !selectedDungeon || !runSuccess) return;

    unlockAchievement(ACHIEVEMENTS.FIRST_CLEAR);

    const allCleared = dungeons.every((dungeon) => dungeon.completed || dungeon.id === selectedDungeon.id);
    if (allCleared) {
      unlockAchievement(ACHIEVEMENTS.MASTER);
    }

    addBuff({
      id: 'dungeon-slayer',
      name: 'Dungeon Slayer',
      source: 'Dungeon Slayer',
      type: 'xpMultiplier',
      value: 1.1,
      active: false,
      icon: '🕷️',
      duration: '1h',
    });
    triggerBuffBySource('Dungeon Slayer');
  }, [addBuff, dungeons, runState, runSuccess, selectedDungeon, triggerBuffBySource, unlockAchievement]);

  const handleRoomAction = useCallback(
    (action: 'fight' | 'continue' | 'flee') => {
      if (!selectedDungeon) return;
      const room = selectedDungeon.rooms[roomIndex];
      if (!room) return;

      if (action === 'flee') {
        setRoomStatus('fled');
        endRun();
        return;
      }

      if (room.type === 'event') {
        handleEventRoom(room);
        return;
      }

      if (action === 'continue') {
        if (roomStatus === 'won') {
          advanceRoom();
        }
        return;
      }

      setRoomStatus('rolling');
      const roll = Math.floor(Math.random() * 20) + 1;
      setLastRoll(roll);
      const threshold = room.type === 'boss' ? BOSS_THRESHOLD : ENCOUNTER_THRESHOLD;
      if (roll >= threshold) {
        handleVictory(room);
      } else {
        handleFailure(room.type);
      }
    },
    [advanceRoom, endRun, handleEventRoom, handleFailure, handleVictory, roomIndex, roomStatus, selectedDungeon]
  );

  const restart = useCallback(() => {
    resetRun();
    setRunState("idle");
  }, [resetRun]);

  const hud = runState !== "idle" && selectedDungeon ? (
    <DungeonHUD
      dungeonName={selectedDungeon.name}
      currentRoom={roomIndex}
      totalRooms={selectedDungeon.rooms.length}
      hp={hp}
      maxHp={MAX_HP}
      xpGained={xpGained}
      loot={lootCollected}
    />
  ) : null;

  const room = selectedDungeon?.rooms[roomIndex];

  return (
    <QuestLayout>
      <div className="space-y-8 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60')] bg-cover bg-fixed bg-center/cover bg-no-repeat p-6">
        <div className="rounded-3xl border border-purple-500/30 bg-slate-950/80 p-6 shadow-[0_0_45px_rgba(126,34,206,0.25)] backdrop-blur">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-purple-200/80">Nightmare Dungeon</p>
            <h1 className="text-3xl font-semibold text-white">🕷️ Nightmare Dungeon</h1>
            <p className="text-sm text-slate-300">
              Explore cursed caverns, duel spectral keepers, and steal relics from the Mistress of Chains. Survive the rooms to claim forbidden loot.
            </p>
          </header>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-200">
            <label className="flex items-center gap-2">
              <span>Dungeon</span>
              <select
                value={selectedDungeon?.id ?? ''}
                onChange={(event) => setSelectedDungeonId(event.target.value)}
                className="rounded-full border border-purple-500/40 bg-slate-900/80 px-3 py-1 text-xs text-white focus:border-purple-400 focus:outline-none"
              >
                {dungeons.map((dungeon) => (
                  <option key={dungeon.id} value={dungeon.id}>
                    {dungeon.name}
                  </option>
                ))}
              </select>
            </label>
            {selectedDungeon?.completed ? (
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[0.65rem] text-emerald-100">
                Cleared
              </span>
            ) : null}
          </div>

          {runState === "idle" ? (
            <button
              type="button"
              onClick={startRun}
              disabled={!selectedDungeon}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-purple-500/60 bg-purple-500/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-purple-100 transition hover:bg-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Begin Nightmare Run
            </button>
          ) : null}
        </div>

        {hud}

        {runState === "running" && selectedDungeon && room ? (
          <div>Room content placeholder</div>
        ) : null}

        {runState === "complete" && selectedDungeon ? (
          <DungeonComplete
            dungeonName={selectedDungeon.name}
            xpTotal={xpGained}
            loot={lootCollected}
            achievements={newAchievements}
            onRestart={startRun}
            onClose={restart}
          />
        ) : null}
      </div>
    </QuestLayout>
  );
}
