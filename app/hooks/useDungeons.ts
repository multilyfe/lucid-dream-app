'use client';

import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { cloneDungeon, cloneDefaultDungeons, ensureDungeon, ensureRoom, type Dungeon, type DungeonRoom } from '../lib/dungeons';

export function useDungeons() {
  const [dungeons, setDungeons] = usePersistentState<Dungeon[]>(
    'dungeons',
    cloneDefaultDungeons
  );

  const setSafe = useCallback(
    (updater: (previous: Dungeon[]) => Dungeon[]) => {
      setDungeons((previous) => updater(previous).map(ensureDungeon));
    },
    [setDungeons]
  );

  const addDungeon = useCallback(
    (dungeon: Dungeon) => {
      setSafe((previous) => {
        if (previous.some((entry) => entry.id === dungeon.id)) {
          return previous.map((entry) =>
            entry.id === dungeon.id ? ensureDungeon(dungeon) : entry
          );
        }
        return [...previous, ensureDungeon(dungeon)];
      });
    },
    [setSafe]
  );

  const updateDungeon = useCallback(
    (dungeonId: string, updater: (dungeon: Dungeon) => Dungeon) => {
      setSafe((previous) =>
        previous.map((entry) =>
          entry.id === dungeonId ? ensureDungeon(updater(cloneDungeon(entry))) : entry
        )
      );
    },
    [setSafe]
  );

  const removeDungeon = useCallback(
    (dungeonId: string) => {
      setSafe((previous) => previous.filter((entry) => entry.id !== dungeonId));
    },
    [setSafe]
  );

  const addRoom = useCallback(
    (dungeonId: string, room: DungeonRoom) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        rooms: [...dungeon.rooms, ensureRoom(room)],
      }));
    },
    [updateDungeon]
  );

  const updateRoom = useCallback(
    (dungeonId: string, roomId: string, patch: Partial<DungeonRoom>) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        rooms: dungeon.rooms.map((room) =>
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
        rooms: dungeon.rooms.filter((room) => room.id !== roomId),
      }));
    },
    [updateDungeon]
  );

  const resetDungeon = useCallback(
    (dungeonId: string) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        completed: false,
      }));
    },
    [updateDungeon]
  );

  const markCompleted = useCallback(
    (dungeonId: string) => {
      updateDungeon(dungeonId, (dungeon) => ({
        ...dungeon,
        completed: true,
      }));
    },
    [updateDungeon]
  );

  const replaceAll = useCallback(
    (next: Dungeon[]) => {
      setSafe(() => next);
    },
    [setSafe]
  );

  return {
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
  } as const;
}
