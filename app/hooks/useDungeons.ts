'use client';

import { useCallback, useState } from 'react';
import { usePersistentState } from './usePersistentState';
import { 
  cloneDungeon, 
  cloneDefaultDungeons, 
  ensureDungeon, 
  ensureRoom, 
  generateDungeonRun,
  type Dungeon, 
  type DungeonRoom, 
  type ActiveDungeonRun,
  type DungeonLoot 
} from '../lib/dungeons';

export interface DungeonState {
  dungeons: Dungeon[];
  activeRun: ActiveDungeonRun | null;
  inventory: DungeonLoot[];
  achievements: string[];
  totalClearedDungeons: number;
  totalBossesDefeated: number;
}

const getDefaultState = (): DungeonState => ({
  dungeons: cloneDefaultDungeons(),
  activeRun: null,
  inventory: [],
  achievements: [],
  totalClearedDungeons: 0,
  totalBossesDefeated: 0
});

export function useDungeons() {
  const [state, setState] = usePersistentState<DungeonState>('dungeonData_v2', getDefaultState);

  const setSafe = useCallback(
    (updater: (previous: DungeonState) => DungeonState) => {
      setState((previous) => {
        const next = updater(previous);
        return {
          ...next,
          dungeons: next.dungeons.map(ensureDungeon)
        };
      });
    },
    [setState]
  );

  // Legacy compatibility methods
  const dungeons = state.dungeons;
  
  const addDungeon = useCallback(
    (dungeon: Dungeon) => {
      setSafe((previous) => {
        const updatedDungeons = previous.dungeons.some((entry) => entry.id === dungeon.id)
          ? previous.dungeons.map((entry) =>
              entry.id === dungeon.id ? ensureDungeon(dungeon) : entry
            )
          : [...previous.dungeons, ensureDungeon(dungeon)];
        
        return { ...previous, dungeons: updatedDungeons };
      });
    },
    [setSafe]
  );

  const updateDungeon = useCallback(
    (dungeonId: string, updater: (dungeon: Dungeon) => Dungeon) => {
      setSafe((previous) => ({
        ...previous,
        dungeons: previous.dungeons.map((entry) =>
          entry.id === dungeonId ? ensureDungeon(updater(cloneDungeon(entry))) : entry
        )
      }));
    },
    [setSafe]
  );

  const removeDungeon = useCallback(
    (dungeonId: string) => {
      setSafe((previous) => ({
        ...previous,
        dungeons: previous.dungeons.filter((entry) => entry.id !== dungeonId)
      }));
    },
    [setSafe]
  );

  const addRoom = useCallback(
    (dungeonId: string, room: DungeonRoom) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        rooms: [...(dungeon.rooms || []), ensureRoom(room)],
      }));
    },
    [updateDungeon]
  );

  const updateRoom = useCallback(
    (dungeonId: string, roomId: string, patch: Partial<DungeonRoom>) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        rooms: (dungeon.rooms || []).map((room) =>
          room.id === roomId ? ensureRoom({ ...room, ...patch }) : room
        ),
      }));
    },
    [updateDungeon]
  );

  const removeRoom = useCallback(
    (dungeonId: string, roomId: string) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        rooms: (dungeon.rooms || []).filter((room) => room.id !== roomId),
      }));
    },
    [updateDungeon]
  );

  const resetDungeon = useCallback(
    (dungeonId: string) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        completed: false,
        cleared: false,
      }));
    },
    [updateDungeon]
  );

  const markCompleted = useCallback(
    (dungeonId: string) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        completed: true,
        cleared: true,
      }));
    },
    [updateDungeon]
  );

  const replaceAll = useCallback(
    (next: Dungeon[]) => {
      setSafe((previous) => ({ ...previous, dungeons: next }));
    },
    [setSafe]
  );

  // NEW Phase 31 methods
  const startDungeonRun = useCallback(
    (dungeonId: string) => {
      const dungeon = state.dungeons.find(d => d.id === dungeonId);
      if (!dungeon || !dungeon.unlocked) return false;

      const rooms = generateDungeonRun(dungeon);
      const newRun: ActiveDungeonRun = {
        dungeonId,
        rooms,
        currentRoomIndex: 0,
        startTime: Date.now(),
        completedRooms: 0,
        totalRooms: rooms.length,
        lootCollected: []
      };

      setSafe(prev => ({ ...prev, activeRun: newRun }));
      return true;
    },
    [state.dungeons, setSafe]
  );

  const completeRoom = useCallback(
    (roomRewards?: any) => {
      if (!state.activeRun) return false;

      const currentRoom = state.activeRun.rooms[state.activeRun.currentRoomIndex];
      if (!currentRoom) return false;

      const updatedRun = { ...state.activeRun };
      updatedRun.rooms[updatedRun.currentRoomIndex].completed = true;
      updatedRun.completedRooms += 1;

      // Add loot if this was a loot room
      if (currentRoom.type === 'loot' && roomRewards) {
        updatedRun.lootCollected.push(...(roomRewards.items || []));
      }

      // Check if dungeon is complete
      if (updatedRun.currentRoomIndex >= updatedRun.rooms.length - 1) {
        // Dungeon completed!
        return completeDungeon(updatedRun);
      } else {
        // Advance to next room
        updatedRun.currentRoomIndex += 1;
        setSafe(prev => ({ ...prev, activeRun: updatedRun }));
      }

      return true;
    },
    [state.activeRun, setSafe]
  );

  const completeDungeon = useCallback(
    (run: ActiveDungeonRun) => {
      const dungeon = state.dungeons.find(d => d.id === run.dungeonId);
      if (!dungeon) return false;

      // Update dungeon completion status
      const updatedDungeons = state.dungeons.map(d => {
        if (d.id === run.dungeonId) {
          return {
            ...d,
            cleared: true,
            completed: true, // Legacy compatibility
            timesCleared: (d.timesCleared || 0) + 1
          };
        }
        return d;
      });

      // Add loot to inventory
      const newLoot: DungeonLoot[] = run.lootCollected.map(item => ({
        ...item,
        obtained: Date.now()
      }));

      // Check for achievements
      const newAchievements = [...state.achievements];
      
      if (!newAchievements.includes('first_dungeon') && state.totalClearedDungeons === 0) {
        newAchievements.push('first_dungeon');
      }
      
      if (run.rooms.some(r => r.type === 'boss' && r.completed) && !newAchievements.includes('boss_slayer')) {
        newAchievements.push('boss_slayer');
      }

      // Unlock next dungeon
      const nextDungeonIndex = updatedDungeons.findIndex(d => d.id === run.dungeonId) + 1;
      if (nextDungeonIndex < updatedDungeons.length) {
        updatedDungeons[nextDungeonIndex].unlocked = true;
      }

      setSafe(prev => ({
        ...prev,
        dungeons: updatedDungeons,
        activeRun: null,
        inventory: [...prev.inventory, ...newLoot],
        achievements: newAchievements,
        totalClearedDungeons: prev.totalClearedDungeons + 1,
        totalBossesDefeated: prev.totalBossesDefeated + (run.rooms.some(r => r.type === 'boss' && r.completed) ? 1 : 0)
      }));

      return true;
    },
    [state.dungeons, state.achievements, state.totalClearedDungeons, setSafe]
  );

  const abandonDungeon = useCallback(() => {
    setSafe(prev => ({ ...prev, activeRun: null }));
  }, [setSafe]);

  const getAvailableDungeons = useCallback(() => {
    return state.dungeons.filter(d => d.unlocked);
  }, [state.dungeons]);

  const getCurrentRoom = useCallback((): DungeonRoom | null => {
    if (!state.activeRun) return null;
    return state.activeRun.rooms[state.activeRun.currentRoomIndex] || null;
  }, [state.activeRun]);

  const completeTrial = useCallback(
    (trialType: string, input?: string) => {
      const currentRoom = getCurrentRoom();
      if (!currentRoom || currentRoom.type !== 'trial') return false;

      // Validate trial completion based on type
      let success = false;
      switch (trialType) {
        case 'shame':
          success = input && input.length > 10; // Requires meaningful confession
          break;
        case 'obedience':
          success = true; // Just requires submission act
          break;
        case 'combat':
          success = Math.random() > 0.3; // 70% success rate
          break;
        case 'ritual':
          success = true; // Requires ritual performance
          break;
        case 'psychic':
          success = Math.random() > 0.4; // 60% success rate
          break;
        case 'puzzle':
          success = Math.random() > 0.5; // 50% success rate
          break;
        default:
          success = false;
      }

      if (success) {
        return completeRoom(currentRoom.rewards);
      }
      
      return false;
    },
    [getCurrentRoom, completeRoom]
  );

  const fightBoss = useCallback(
    (strategy: string) => {
      const currentRoom = getCurrentRoom();
      if (!currentRoom || currentRoom.type !== 'boss') return false;

      const dungeon = state.dungeons.find(d => d.id === state.activeRun?.dungeonId);
      if (!dungeon || !dungeon.boss) return false;

      // Boss fight logic based on weakness
      let success = false;
      if (strategy === dungeon.boss.weakness) {
        success = Math.random() > 0.2; // 80% success with correct strategy
      } else {
        success = Math.random() > 0.7; // 30% success with wrong strategy
      }

      if (success) {
        return completeRoom(dungeon.boss.rewards);
      }

      return false;
    },
    [getCurrentRoom, completeRoom, state.dungeons, state.activeRun]
  );

  const collectLoot = useCallback(
    () => {
      const currentRoom = getCurrentRoom();
      if (!currentRoom || currentRoom.type !== 'loot') return false;

      const dungeon = state.dungeons.find(d => d.id === state.activeRun?.dungeonId);
      if (!dungeon) return false;

      // Random loot from dungeon's loot pool
      const lootPool = dungeon.lootPool || [];
      if (lootPool.length === 0) return completeRoom();

      const loot = lootPool[Math.floor(Math.random() * lootPool.length)];
      return completeRoom({ items: [loot] });
    },
    [getCurrentRoom, completeRoom, state.dungeons, state.activeRun]
  );

  return {
    // Legacy compatibility
    dungeons,
    addDungeon,
    updateDungeon,
    removeDungeon,
    addRoom,
    updateRoom,
    removeRoom,
    resetDungeon,
    markCompleted,
    replaceAll,
    
    // New Phase 31 state
    activeRun: state.activeRun,
    inventory: state.inventory,
    achievements: state.achievements,
    totalClearedDungeons: state.totalClearedDungeons,
    totalBossesDefeated: state.totalBossesDefeated,
    
    // New Phase 31 actions
    startDungeonRun,
    completeRoom,
    completeDungeon,
    abandonDungeon,
    completeTrial,
    fightBoss,
    collectLoot,
    getAvailableDungeons,
    getCurrentRoom,
  } as const;
}
