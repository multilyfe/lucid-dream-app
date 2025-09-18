'use client';

import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useBuffs } from "./useBuffs";
import {
  cloneDefaultInventory,
  getDefaultItemTemplate,
  getDefaultIcon,
  InventoryItem,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_ORDER,
  ItemType,
  isEquippable,
} from "../lib/inventory";

const MAX_EQUIPPED_RELICS = 2;
const ITEM_ACQUIRE_XP = 25;
const EQUIP_OBEDIENCE_RELIC = 6;
const EQUIP_OBEDIENCE_PANTY = 8;

export type EquipResult = "equipped" | "unequipped" | "limit-reached" | "no-change";

export type InventoryGrouped = Record<ItemType, InventoryItem[]>;

function normaliseIcon(item: InventoryItem): InventoryItem {
  if (!item.icon || item.icon.trim().length === 0) {
    return { ...item, icon: getDefaultIcon(item.type) };
  }
  return item;
}

export function useInventory() {
  const [inventory, setInventory] = usePersistentState<InventoryItem[]>(
    "inventory",
    cloneDefaultInventory
  );
  const [xp, setXp] = usePersistentState<number>("xpTotal", () => 3400);
  const [obedience, setObedience] = usePersistentState<number>("obediencePoints", () => 0);
  const [tokens, setTokens] = usePersistentState<number>("dirtyTokens", () => 0);
  const {
    applyEvent,
    activateBuffsBySource,
    deactivateBuffsBySource,
    triggerBuffBySource,
  } = useBuffs();

  const equippedRelicCount = useMemo(
    () => inventory.filter((item) => item.type === "relic" && item.equipped).length,
    [inventory]
  );

  const grouped = useMemo<InventoryGrouped>(() => {
    return ITEM_TYPE_ORDER.reduce<InventoryGrouped>((acc, type) => {
      acc[type] = inventory
        .filter((item) => item.type === type)
        .sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {
      relic: [],
      panty: [],
      shard: [],
      consumable: [],
      quest: [],
    });
  }, [inventory]);

  const ensureItem = useCallback(
    (id: string, template?: Partial<InventoryItem>) => {
      const existing = inventory.find((item) => item.id === id);
      if (existing) return normaliseIcon(existing);

      const base = template
        ? ({
            id,
            name: template.name ?? `Item ${id}`,
            type: template.type ?? "quest",
            desc: template.desc ?? "A mysterious item discovered in the temple.",
            owned: template.owned ?? 0,
            icon: template.icon,
            equipped: template.equipped ?? false,
          } as InventoryItem)
        : getDefaultItemTemplate(id);

      if (!base) {
        return normaliseIcon({
          id,
          name: `Item ${id}`,
          type: "quest",
          desc: "A mysterious item discovered in the temple.",
          owned: 0,
        });
      }

      return normaliseIcon(base);
    },
    [inventory]
  );

  const setInventorySafe = useCallback(
    (updater: (previous: InventoryItem[]) => InventoryItem[]) => {
      setInventory((previous) => {
        const next = updater(previous);
        return next.map(normaliseIcon);
      });
    },
    [setInventory]
  );

  const awardXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return 0;
      const total = applyEvent("xp", amount);
      setXp((prev) => prev + total);
      return total;
    },
    [applyEvent, setXp]
  );

  const spendXp = useCallback(
    (amount: number) => {
      if (amount <= 0) return 0;
      let deducted = 0;
      setXp((previous) => {
        const next = Math.max(0, previous - amount);
        deducted = previous - next;
        return next;
      });
      return deducted;
    },
    [setXp]
  );

  const awardObedience = useCallback(
    (amount: number) => {
      if (amount <= 0) return 0;
      const total = applyEvent("obedience", amount);
      setObedience((prev) => prev + total);
      return total;
    },
    [applyEvent, setObedience]
  );

  const awardTokens = useCallback(
    (amount: number) => {
      if (amount <= 0) return 0;
      const value = Math.max(0, Math.round(amount));
      setTokens((previous) => previous + value);
      return value;
    },
    [setTokens]
  );

  const spendTokens = useCallback(
    (amount: number) => {
      if (amount <= 0) return 0;
      let deducted = 0;
      setTokens((previous) => {
        const next = Math.max(0, previous - amount);
        deducted = previous - next;
        return next;
      });
      return deducted;
    },
    [setTokens]
  );

  const gainItem = useCallback(
    (id: string, amount = 1, template?: Partial<InventoryItem>) => {
      if (!id || amount === 0) return;
      setInventorySafe((previous) => {
        const ensured = ensureItem(id, template);
        const existing = previous.find((item) => item.id === id);
        if (existing) {
          return previous.map((item) =>
            item.id === id ? { ...item, owned: Math.max(0, item.owned + amount) } : item
          );
        }
        return [...previous, { ...ensured, owned: Math.max(0, ensured.owned + amount) }];
      });
      awardXp(Math.max(1, amount) * ITEM_ACQUIRE_XP);
    },
    [awardXp, ensureItem, setInventorySafe]
  );

  const setOwned = useCallback(
    (id: string, owned: number) => {
      setInventorySafe((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                owned: Math.max(0, Math.round(Number.isFinite(owned) ? owned : item.owned)),
              }
            : item
        )
      );
    },
    [setInventorySafe]
  );

  const adjustOwned = useCallback(
    (id: string, delta: number) => {
      if (!delta) return;
      setInventorySafe((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, owned: Math.max(0, item.owned + delta) }
            : item
        )
      );
    },
    [setInventorySafe]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<InventoryItem>) => {
      setInventorySafe((previous) =>
        previous.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    [setInventorySafe]
  );

  const addOrReplaceItem = useCallback(
    (item: InventoryItem) => {
      const normalised = normaliseIcon(item);
      setInventorySafe((previous) => {
        const exists = previous.some((entry) => entry.id === normalised.id);
        return exists
          ? previous.map((entry) => (entry.id === normalised.id ? { ...entry, ...normalised } : entry))
          : [...previous, normalised];
      });
      if (isEquippable(normalised)) {
        if (normalised.equipped) {
          activateBuffsBySource(normalised.name);
        } else {
          deactivateBuffsBySource(normalised.name);
        }
      }
    },
    [activateBuffsBySource, deactivateBuffsBySource, setInventorySafe]
  );

  const removeItem = useCallback(
    (id: string) => {
      const item = inventory.find((entry) => entry.id === id);
      if (item && isEquippable(item)) {
        deactivateBuffsBySource(item.name);
      }
      setInventorySafe((previous) => previous.filter((item) => item.id !== id));
    },
    [deactivateBuffsBySource, inventory, setInventorySafe]
  );

  const toggleEquip = useCallback(
    (id: string): EquipResult => {
      const item = inventory.find((entry) => entry.id === id);
      if (!item || !isEquippable(item)) {
        return "no-change";
      }

      if (item.type === "relic") {
        if (!item.equipped && equippedRelicCount >= MAX_EQUIPPED_RELICS) {
          return "limit-reached";
        }
      }

      const nextEquipped = !item.equipped;
      setInventorySafe((previous) =>
        previous.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                equipped: nextEquipped,
              }
            : entry
        )
      );

      if (nextEquipped) {
        awardObedience(item.type === "panty" ? EQUIP_OBEDIENCE_PANTY : EQUIP_OBEDIENCE_RELIC);
        activateBuffsBySource(item.name);
      } else {
        deactivateBuffsBySource(item.name);
      }

      return nextEquipped ? "equipped" : "unequipped";
    },
    [activateBuffsBySource, awardObedience, deactivateBuffsBySource, equippedRelicCount, inventory, setInventorySafe]
  );

  const unequipAllOfType = useCallback(
    (type: ItemType) => {
      const affectedNames = inventory
        .filter((item) => item.type === type && item.equipped)
        .map((item) => item.name);
      setInventorySafe((previous) =>
        previous.map((item) =>
          item.type === type && item.equipped ? { ...item, equipped: false } : item
        )
      );
      if (type === "relic" || type === "panty") {
        affectedNames.forEach((name) => deactivateBuffsBySource(name));
      }
    },
    [deactivateBuffsBySource, inventory, setInventorySafe]
  );

  const consumeItem = useCallback(
    (id: string) => {
      const item = inventory.find((entry) => entry.id === id);
      if (!item || item.owned <= 0) {
        return false;
      }
      adjustOwned(id, -1);
      if (item.type === "consumable") {
        triggerBuffBySource(item.name);
      }
      return true;
    },
    [adjustOwned, inventory, triggerBuffBySource]
  );

  const replaceInventory = useCallback(
    (items: InventoryItem[]) => {
      setInventory(items.map((entry) => normaliseIcon({ ...entry })));
      items.forEach((item) => {
        if (!isEquippable(item)) return;
        if (item.equipped) {
          activateBuffsBySource(item.name);
        } else {
          deactivateBuffsBySource(item.name);
        }
      });
    },
    [activateBuffsBySource, deactivateBuffsBySource, setInventory]
  );

  const clearInventory = useCallback(() => {
    const equippedNames = inventory
      .filter((item) => isEquippable(item) && item.equipped)
      .map((item) => item.name);
    setInventory(cloneDefaultInventory());
    equippedNames.forEach((name) => deactivateBuffsBySource(name));
  }, [deactivateBuffsBySource, inventory, setInventory]);

  return {
    inventory,
    grouped,
    labels: ITEM_TYPE_LABELS,
    xp,
    obedience,
    tokens,
    equippedRelicCount,
    maxRelics: MAX_EQUIPPED_RELICS,
    gainItem,
    setOwned,
    adjustOwned,
    updateItem,
    addOrReplaceItem,
    removeItem,
    toggleEquip,
    unequipAllOfType,
    consumeItem,
    replaceInventory,
    clearInventory,
    awardXp,
    spendXp,
    awardTokens,
    spendTokens,
    awardObedience,
  };
}
