import inventoryData from "../../data/inventory.json";

export type ItemType = "relic" | "panty" | "shard" | "consumable" | "quest" | "artifact" | "equipment" | "currency";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "unique";
export type EquipmentSlot = "head" | "body" | "legs" | "panty" | "trinket";

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  icon: string;
  desc: string;
  effect?: string;
  owned: number;
  equipped?: boolean;
  slot?: EquipmentSlot;
  source?: string;
  lore?: string;
  consumable?: boolean;
  tradeable?: boolean;
}

export interface Equipment {
  head: string | null;
  body: string | null;
  legs: string | null;
  panty: string | null;
  trinket: string | null;
}

export interface SetBonus {
  "2_piece"?: string;
  "3_piece"?: string;
  "4_piece"?: string;
  "5_piece"?: string;
}

export interface ItemSet {
  id: string;
  name: string;
  description: string;
  items: string[];
  bonus: SetBonus;
  completed: boolean;
}

export interface InventoryStats {
  totalItems: number;
  itemsEquipped: number;
  setsCompleted: number;
  rarityCount: Record<Rarity, number>;
}

export interface InventoryData {
  items: InventoryItem[];
  equipment: Equipment;
  sets: ItemSet[];
  stats: InventoryStats;
}

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  relic: "Relics",
  panty: "Panties",
  shard: "Dream Shards",
  consumable: "Consumables",
  quest: "Quest Items",
  artifact: "Artifacts",
  equipment: "Equipment",
  currency: "Currency",
};

export const ITEM_TYPE_ORDER: ItemType[] = [
  "relic",
  "artifact",
  "equipment",
  "panty",
  "consumable",
  "currency",
  "quest",
];

const DEFAULT_INVENTORY_DATA = inventoryData as InventoryData;

export function cloneDefaultInventory(): InventoryData {
  return {
    items: DEFAULT_INVENTORY_DATA.items.map(item => ({ ...item })),
    equipment: { ...DEFAULT_INVENTORY_DATA.equipment },
    sets: DEFAULT_INVENTORY_DATA.sets.map(set => ({ ...set })),
    stats: { ...DEFAULT_INVENTORY_DATA.stats }
  };
}

export function getDefaultItemTemplate(id: string): InventoryItem | undefined {
  const template = DEFAULT_INVENTORY_DATA.items.find((item) => item.id === id);
  return template ? { ...template } : undefined;
}

export function isEquippable(item: InventoryItem): boolean {
  return item.type === "relic" || item.type === "panty" || item.type === "artifact" || item.type === "equipment";
}

export function getRarityColor(rarity: Rarity): string {
  const colors = {
    common: "text-gray-400 border-gray-400",
    uncommon: "text-green-400 border-green-400",
    rare: "text-blue-400 border-blue-400",
    epic: "text-purple-400 border-purple-400",
    legendary: "text-orange-400 border-orange-400",
    unique: "text-pink-400 border-pink-400"
  };
  return colors[rarity] || colors.common;
}

export function getRarityGlow(rarity: Rarity): string {
  const glows = {
    common: "shadow-gray-400/20",
    uncommon: "shadow-green-400/30",
    rare: "shadow-blue-400/40",
    epic: "shadow-purple-400/50",
    legendary: "shadow-orange-400/60",
    unique: "shadow-pink-400/70"
  };
  return glows[rarity] || glows.common;
}

export function canEquipInSlot(item: InventoryItem, slot: EquipmentSlot): boolean {
  if (!isEquippable(item)) return false;
  if (!item.slot) return false;
  return item.slot === slot;
}

export function getSetProgress(set: ItemSet, equippedItems: string[]): number {
  const equippedSetItems = set.items.filter(itemId => equippedItems.includes(itemId));
  return equippedSetItems.length;
}

export function getActiveSetBonuses(sets: ItemSet[], equippedItems: string[]): string[] {
  const activeBonuses: string[] = [];
  
  sets.forEach(set => {
    const progress = getSetProgress(set, equippedItems);
    
    if (progress >= 2 && set.bonus["2_piece"]) {
      activeBonuses.push(`${set.name} (2/2): ${set.bonus["2_piece"]}`);
    }
    if (progress >= 3 && set.bonus["3_piece"]) {
      activeBonuses.push(`${set.name} (3/3): ${set.bonus["3_piece"]}`);
    }
    if (progress >= 4 && set.bonus["4_piece"]) {
      activeBonuses.push(`${set.name} (4/4): ${set.bonus["4_piece"]}`);
    }
    if (progress >= 5 && set.bonus["5_piece"]) {
      activeBonuses.push(`${set.name} (5/5): ${set.bonus["5_piece"]}`);
    }
  });
  
  return activeBonuses;
}

export function getDefaultIcon(type: ItemType): string {
  switch (type) {
    case "relic":
      return "🪬";
    case "panty":
      return "🩲";
    case "shard":
    case "currency":
      return "💎";
    case "consumable":
      return "🧪";
    case "quest":
      return "📜";
    case "artifact":
      return "⭐";
    case "equipment":
      return "⚔️";
    default:
      return "✨";
  }
}
