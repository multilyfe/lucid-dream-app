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
  // The defaultMap is already a JS object because of the import, but we need to deep clone it
  // to avoid mutations affecting the original object in the module cache.
  return JSON.parse(JSON.stringify(defaultMap));
}
