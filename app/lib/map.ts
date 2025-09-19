import defaultMap from '../../data/map.json';

export type MapNodeType = "realm" | "panty" | "dungeon" | "temple";

export interface UnlockCondition {
  type: "ritual" | "shame" | "quest" | "item";
  id?: string;
  level?: number;
  amount?: number;
}

export interface MapNode {
  id: string;
  name: string;
  type: MapNodeType;
  unlocked: boolean;
  coords: [number, number];
  lore: string;
  unlockCondition?: UnlockCondition;
}

export interface MapLink {
  from: string;
  to: string;
  locked: boolean;
}

export interface MapData {
  nodes: MapNode[];
  links: MapLink[];
}

export function cloneDefaultMap(): MapData {
  // Add fallback data in case JSON import fails
  const fallbackData: MapData = {
    nodes: [
      { id: "r1", name: "Lucid World", type: "realm", unlocked: true, coords: [500, 300], lore: "The central hub of your dreamscape, where your journey begins." },
      { id: "t1", name: "Temple of Awakening", type: "temple", unlocked: true, coords: [200, 500], lore: "A serene temple dedicated to the art of lucid dreaming." },
      { id: "r2", name: "Panty Realm", type: "panty", unlocked: false, coords: [800, 200], lore: "A realm woven from desire and silk. Unlock by completing specific rituals.", unlockCondition: { type: "ritual", id: "panty_ritual_1" } },
      { id: "d1", name: "Caves of Shame", type: "dungeon", unlocked: false, coords: [750, 600], lore: "A deep dungeon where echoes of embarrassment and guilt reside.", unlockCondition: { type: "shame", level: 5 } }
    ],
    links: [
      { from: "r1", to: "t1", locked: false },
      { from: "r1", to: "r2", locked: true },
      { from: "r2", to: "d1", locked: true }
    ]
  };

  try {
    // Try to use the imported JSON, fallback to hardcoded data
    const mapToUse = defaultMap || fallbackData;
    return JSON.parse(JSON.stringify(mapToUse));
  } catch (error) {
    console.error('Error cloning map data:', error);
    return fallbackData;
  }
}
