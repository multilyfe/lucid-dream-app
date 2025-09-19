import defaultDungeons from "../../data/dungeons.json";

export type DungeonRoomType = "trial" | "loot" | "boss";
export type TrialSubtype = "shame" | "obedience" | "combat" | "ritual" | "psychic" | "puzzle";

export type DungeonRoom = {
  id: string;
  type: DungeonRoomType;
  subtype?: TrialSubtype;
  desc: string;
  completed?: boolean;
  rewards?: {
    xp?: number;
    tokens?: number;
    items?: string[];
  };
};

export type DungeonLoot = {
  id: string;
  name: string;
  type: 'artifact' | 'buff' | 'curse' | 'consumable';
  effect: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  obtained?: number;
};

export type DungeonBoss = {
  name: string;
  health: number;
  attacks: string[];
  weakness: string;
  rewards: {
    xp: number;
    tokens: number;
    items: string[];
  };
};

export type Dungeon = {
  id: string;
  name: string;
  description?: string;
  difficulty?: number;
  cleared?: boolean;
  timesCleared?: number;
  unlocked?: boolean;
  background?: string;
  roomPool?: any[];
  lootPool?: DungeonLoot[];
  boss?: DungeonBoss;
  rooms?: DungeonRoom[]; // For legacy compatibility
  completed?: boolean; // For legacy compatibility
};

export type ActiveDungeonRun = {
  dungeonId: string;
  rooms: DungeonRoom[];
  currentRoomIndex: number;
  startTime: number;
  completedRooms: number;
  totalRooms: number;
  lootCollected: DungeonLoot[];
};

const DEFAULT_DUNGEONS: Dungeon[] = (defaultDungeons.dungeons as Dungeon[]).map((dungeon) =>
  cloneDungeon(dungeon)
);

export function cloneDungeon(dungeon: Dungeon): Dungeon {
  return {
    ...dungeon,
    rooms: dungeon.rooms?.map((room) => ({ ...room })) || [],
    roomPool: dungeon.roomPool ? [...dungeon.roomPool] : [],
    lootPool: dungeon.lootPool?.map(loot => ({ ...loot })) || [],
    cleared: Boolean(dungeon.cleared),
    completed: Boolean(dungeon.completed), // Legacy compatibility
    unlocked: Boolean(dungeon.unlocked),
    timesCleared: Math.max(0, Number(dungeon.timesCleared ?? 0)),
    difficulty: Math.max(1, Number(dungeon.difficulty ?? 1)),
  };
}

export function cloneDefaultDungeons(): Dungeon[] {
  return DEFAULT_DUNGEONS.map((dungeon) => cloneDungeon(dungeon));
}

export function ensureRoom(room: DungeonRoom): DungeonRoom {
  return {
    ...room,
    completed: Boolean(room.completed),
    rewards: room.rewards ? { ...room.rewards } : undefined,
  };
}

export function ensureDungeon(dungeon: Dungeon): Dungeon {
  return {
    ...dungeon,
    name: dungeon.name || "Untitled Dungeon",
    description: dungeon.description || "",
    rooms: (dungeon.rooms || []).map(ensureRoom),
    cleared: Boolean(dungeon.cleared),
    completed: Boolean(dungeon.completed), // Legacy compatibility
    unlocked: Boolean(dungeon.unlocked),
    timesCleared: Math.max(0, Number(dungeon.timesCleared ?? 0)),
    difficulty: Math.max(1, Number(dungeon.difficulty ?? 1)),
  };
}

// Procedural generation helper
export function generateDungeonRun(dungeon: Dungeon): DungeonRoom[] {
  const rooms: DungeonRoom[] = [];
  const roomPool = dungeon.roomPool || [];
  
  // Always include at least 1 boss room at the end
  const bossRoom = roomPool.find(r => r.type === 'boss');
  
  // Generate 3-5 rooms before boss
  const numRooms = Math.floor(Math.random() * 3) + 3; // 3-5 rooms
  
  for (let i = 0; i < numRooms; i++) {
    // Filter out boss rooms for regular generation
    const availableRooms = roomPool.filter(r => r.type !== 'boss');
    const weightedPool: any[] = [];
    
    // Create weighted pool
    availableRooms.forEach(room => {
      for (let w = 0; w < room.weight; w++) {
        weightedPool.push(room);
      }
    });
    
    if (weightedPool.length > 0) {
      const selectedRoom = weightedPool[Math.floor(Math.random() * weightedPool.length)];
      rooms.push({
        id: `room_${i + 1}`,
        type: selectedRoom.type,
        subtype: selectedRoom.subtype,
        desc: selectedRoom.desc,
        completed: false,
        rewards: {
          xp: 50 + (i * 10),
          tokens: 5 + (i * 2)
        }
      });
    }
  }
  
  // Add boss room at the end
  if (bossRoom) {
    rooms.push({
      id: 'boss_room',
      type: 'boss',
      desc: bossRoom.desc,
      completed: false,
      rewards: dungeon.boss?.rewards
    });
  }
  
  return rooms;
}
