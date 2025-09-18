import defaultItems from "../../data/items.json";

export type ItemType = "relic" | "panty" | "shard" | "consumable" | "quest";

export type InventoryItem = {
  id: string;
  name: string;
  type: ItemType;
  desc: string;
  owned: number;
  icon?: string;
  equipped?: boolean;
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  relic: "Relics",
  panty: "Panties",
  shard: "Dream Shards",
  consumable: "Consumables",
  quest: "Quest Items",
};

export const ITEM_TYPE_ORDER: ItemType[] = [
  "relic",
  "panty",
  "shard",
  "consumable",
  "quest",
];

const DEFAULT_ITEMS = (defaultItems as InventoryItem[]).map((item) => ({ ...item }));

export function cloneDefaultInventory(): InventoryItem[] {
  return DEFAULT_ITEMS.map((item) => ({ ...item }));
}

export function getDefaultItemTemplate(id: string): InventoryItem | undefined {
  const template = DEFAULT_ITEMS.find((item) => item.id === id);
  return template ? { ...template } : undefined;
}

export function isEquippable(item: InventoryItem): boolean {
  return item.type === "relic" || item.type === "panty";
}

export function getDefaultIcon(type: ItemType): string {
  switch (type) {
    case "relic":
      return "🪬";
    case "panty":
      return "🩲";
    case "shard":
      return "💎";
    case "consumable":
      return "🧪";
    case "quest":
      return "📜";
    default:
      return "✨";
  }
}
