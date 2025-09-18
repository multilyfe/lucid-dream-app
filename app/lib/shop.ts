import defaultShop from "../../data/shop.json";
import defaultLogs from "../../data/shopLogs.json";

export type ShopItemType = "relic" | "panty" | "shard" | "consumable" | "quest";

export type ShopItem = {
  id: string;
  name: string;
  type: ShopItemType;
  priceXP: number;
  priceTokens: number;
  stock?: number | null;
};

export type ShopSchema = {
  limitedStock?: boolean;
  inventory: ShopItem[];
};

export type ShopLog = {
  id: string;
  itemId: string;
  itemName: string;
  action: "buy" | "sell";
  xp: number;
  tokens: number;
  timestamp: string;
};

const DEFAULT_SHOP: ShopSchema = normaliseShop(defaultShop as ShopSchema);
const DEFAULT_LOGS: ShopLog[] = (defaultLogs as ShopLog[]).map((log) => ({ ...log }));

export function normaliseItem(item: ShopItem): ShopItem {
  return {
    ...item,
    name: item.name || `Item ${item.id}`,
    type: (item.type ?? 'quest') as ShopItemType,
    priceXP: Math.max(0, Number(item.priceXP ?? 0)),
    priceTokens: Math.max(0, Number(item.priceTokens ?? 0)),
    stock: typeof item.stock === 'number' ? Math.max(0, Math.floor(item.stock)) : item.stock ?? null,
  };
}

export function normaliseShop(shop: ShopSchema): ShopSchema {
  return {
    limitedStock: Boolean(shop.limitedStock),
    inventory: (shop.inventory ?? []).map((item) => normaliseItem(item)),
  };
}

export function cloneDefaultShop(): ShopSchema {
  return normaliseShop(DEFAULT_SHOP);
}

export function cloneDefaultShopLogs(): ShopLog[] {
  return DEFAULT_LOGS.map((log) => ({ ...log }));
}
