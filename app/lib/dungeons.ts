import defaultDungeons from "../../data/dungeons.json";

export type DungeonRoomType = "encounter" | "event" | "boss";

export type DungeonRoom = {
  id: string;
  type: DungeonRoomType;
  desc: string;
  loot?: string[];
  xp?: number;
};

export type Dungeon = {
  id: string;
  name: string;
  rooms: DungeonRoom[];
  completed?: boolean;
};

const DEFAULT_DUNGEONS: Dungeon[] = (defaultDungeons as Dungeon[]).map((dungeon) =>
  cloneDungeon(dungeon)
);

export function cloneDungeon(dungeon: Dungeon): Dungeon {
  return {
    ...dungeon,
    rooms: dungeon.rooms.map((room) => ({
      ...room,
      loot: room.loot ? [...room.loot] : undefined,
    })),
    completed: Boolean(dungeon.completed),
  };
}

export function cloneDefaultDungeons(): Dungeon[] {
  return DEFAULT_DUNGEONS.map((dungeon) => cloneDungeon(dungeon));
}

export function ensureRoom(room: DungeonRoom): DungeonRoom {
  return {
    ...room,
    loot: room.loot ? [...room.loot] : undefined,
    xp: Math.max(0, Number(room.xp ?? 0)),
  };
}

export function ensureDungeon(dungeon: Dungeon): Dungeon {
  return {
    ...dungeon,
    name: dungeon.name || "Untitled Dungeon",
    rooms: dungeon.rooms.map(ensureRoom),
    completed: Boolean(dungeon.completed),
  };
}
