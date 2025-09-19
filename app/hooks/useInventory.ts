'use client';

import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useBuffs } from "./useBuffs";
import {
  cloneDefaultInventory,
  getDefaultItemTemplate,
  getDefaultIcon,
  InventoryItem,
  InventoryData,
  Equipment,
  ItemSet,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_ORDER,
  ItemType,
  EquipmentSlot,
  isEquippable,
  canEquipInSlot,
  getActiveSetBonuses,
  getSetProgress,
} from "../lib/inventory";

const ITEM_ACQUIRE_XP = 25;
const EQUIP_OBEDIENCE_RELIC = 6;
const EQUIP_OBEDIENCE_PANTY = 8;

export type EquipResult = "equipped" | "unequipped" | "slot-occupied" | "invalid-slot" | "no-change";

export type InventoryGrouped = Record<ItemType, InventoryItem[]>;

function normaliseIcon(item: InventoryItem): InventoryItem {
  if (!item.icon || item.icon.trim().length === 0) {
    return { ...item, icon: getDefaultIcon(item.type) };
  }
  return item;
}

export function useInventory() {
  const [inventoryData, setInventoryData] = usePersistentState<InventoryData>(
    "inventoryData",
    cloneDefaultInventory
  );
  const [xp, setXp] = usePersistentState<number>("xpTotal", () => 3400);
  const [obedience, setObedience] = usePersistentState<number>("obediencePoints", () => 0);
  const [tokens, setTokens] = usePersistentState<number>("dirtyTokens", () => 0);
  const {
    applyEvent,
    addBuff,
  } = useBuffs();

  const inventory = inventoryData.items;
  const equipment = inventoryData.equipment;
  const sets = inventoryData.sets;

  // Get equipped items based on equipment slots
  const equippedItems = useMemo(() => {
    const equippedIds = Object.values(equipment).filter(Boolean) as string[];
    return inventory.filter(item => equippedIds.includes(item.id));
  }, [inventory, equipment]);

  // Calculate active set bonuses
  const activeSetBonuses = useMemo(() => {
    const equippedIds = Object.values(equipment).filter(Boolean) as string[];
    return getActiveSetBonuses(sets, equippedIds);
  }, [sets, equipment]);

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
      artifact: [],
      equipment: [],
      currency: [],
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
            rarity: template.rarity ?? "common",
            desc: template.desc ?? "A mysterious item discovered in the temple.",
            owned: template.owned ?? 0,
            icon: template.icon,
            equipped: template.equipped ?? false,
            slot: template.slot,
            effect: template.effect,
            source: template.source,
            lore: template.lore,
          } as InventoryItem)
        : getDefaultItemTemplate(id);

      if (!base) {
        return normaliseIcon({
          id,
          name: `Item ${id}`,
          type: "quest",
          rarity: "common",
          icon: "📜",
          desc: "A mysterious item discovered in the temple.",
          owned: 0,
        });
      }

      return normaliseIcon(base);
    },
    [inventory]
  );

  const setInventoryDataSafe = useCallback(
    (updater: (previous: InventoryData) => InventoryData) => {
      setInventoryData((previous) => {
        const next = updater(previous);
        return {
          ...next,
          items: next.items.map(normaliseIcon),
        };
      });
    },
    [setInventoryData]
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
      setInventoryDataSafe((previous) => {
        const ensured = ensureItem(id, template);
        const existingIndex = previous.items.findIndex((item) => item.id === id);
        
        if (existingIndex >= 0) {
          const updatedItems = [...previous.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            owned: Math.max(0, updatedItems[existingIndex].owned + amount)
          };
          return { ...previous, items: updatedItems };
        }
        
        return {
          ...previous,
          items: [...previous.items, { ...ensured, owned: Math.max(0, ensured.owned + amount) }]
        };
      });
      awardXp(Math.max(1, amount) * ITEM_ACQUIRE_XP);
    },
    [awardXp, ensureItem, setInventoryDataSafe]
  );

  const equipItem = useCallback(
    (itemId: string, slot: EquipmentSlot): EquipResult => {
      const item = inventory.find((entry) => entry.id === itemId);
      if (!item || !isEquippable(item)) {
        return "no-change";
      }

      if (!canEquipInSlot(item, slot)) {
        return "invalid-slot";
      }

      setInventoryDataSafe((previous) => {
        // Unequip any item currently in the slot
        const currentlyEquippedId = previous.equipment[slot];
        let updatedItems = [...previous.items];
        
        if (currentlyEquippedId) {
          updatedItems = updatedItems.map(item => 
            item.id === currentlyEquippedId 
              ? { ...item, equipped: false }
              : item
          );
        }

        // Equip the new item
        updatedItems = updatedItems.map(item => 
          item.id === itemId 
            ? { ...item, equipped: true }
            : item
        );

        return {
          ...previous,
          items: updatedItems,
          equipment: {
            ...previous.equipment,
            [slot]: itemId
          }
        };
      });

      // Award obedience for equipping
      awardObedience(item.type === "panty" ? EQUIP_OBEDIENCE_PANTY : EQUIP_OBEDIENCE_RELIC);

      return "equipped";
    },
    [inventory, setInventoryDataSafe, awardObedience]
  );

  const unequipItem = useCallback(
    (slot: EquipmentSlot): EquipResult => {
      const currentlyEquippedId = equipment[slot];
      if (!currentlyEquippedId) {
        return "no-change";
      }

      setInventoryDataSafe((previous) => ({
        ...previous,
        items: previous.items.map(item => 
          item.id === currentlyEquippedId 
            ? { ...item, equipped: false }
            : item
        ),
        equipment: {
          ...previous.equipment,
          [slot]: null
        }
      }));

      return "unequipped";
    },
    [equipment, setInventoryDataSafe]
  );

  const toggleEquip = useCallback(
    (id: string): EquipResult => {
      const item = inventory.find((entry) => entry.id === id);
      if (!item || !isEquippable(item)) {
        return "no-change";
      }

      if (item.equipped) {
        // Find which slot it's equipped in and unequip
        const equippedSlot = Object.entries(equipment).find(([_, itemId]) => itemId === id)?.[0] as EquipmentSlot;
        if (equippedSlot) {
          return unequipItem(equippedSlot);
        }
        return "no-change";
      } else {
        // Equip in appropriate slot
        if (item.slot) {
          return equipItem(id, item.slot);
        }
        return "invalid-slot";
      }
    },
    [inventory, equipment, equipItem, unequipItem]
  );

  const consumeItem = useCallback(
    (id: string) => {
      const item = inventory.find((entry) => entry.id === id);
      if (!item || item.owned <= 0) {
        return false;
      }
      
      setInventoryDataSafe((previous) => ({
        ...previous,
        items: previous.items.map(item => 
          item.id === id 
            ? { ...item, owned: Math.max(0, item.owned - 1) }
            : item
        )
      }));

      return true;
    },
    [inventory, setInventoryDataSafe]
  );

  const setOwned = useCallback(
    (id: string, owned: number) => {
      setInventoryDataSafe((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          item.id === id
            ? {
                ...item,
                owned: Math.max(0, Math.round(Number.isFinite(owned) ? owned : item.owned)),
              }
            : item
        )
      }));
    },
    [setInventoryDataSafe]
  );

  const adjustOwned = useCallback(
    (id: string, delta: number) => {
      if (!delta) return;
      setInventoryDataSafe((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          item.id === id
            ? { ...item, owned: Math.max(0, item.owned + delta) }
            : item
        )
      }));
    },
    [setInventoryDataSafe]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<InventoryItem>) => {
      setInventoryDataSafe((previous) => ({
        ...previous,
        items: previous.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
      }));
    },
    [setInventoryDataSafe]
  );

  const addOrReplaceItem = useCallback(
    (item: InventoryItem) => {
      const normalised = normaliseIcon(item);
      setInventoryDataSafe((previous) => {
        const existingIndex = previous.items.findIndex((entry) => entry.id === normalised.id);
        const updatedItems = existingIndex >= 0
          ? previous.items.map((entry) => (entry.id === normalised.id ? { ...entry, ...normalised } : entry))
          : [...previous.items, normalised];
          
        return { ...previous, items: updatedItems };
      });
    },
    [setInventoryDataSafe]
  );

  const removeItem = useCallback(
    (id: string) => {
      setInventoryDataSafe((previous) => ({
        ...previous,
        items: previous.items.filter((item) => item.id !== id)
      }));
    },
    [setInventoryDataSafe]
  );

  const unequipAllOfType = useCallback(
    (type: ItemType) => {
      setInventoryDataSafe((previous) => {
        const updatedItems = previous.items.map((item) =>
          item.type === type && item.equipped ? { ...item, equipped: false } : item
        );
        
        const updatedEquipment = { ...previous.equipment };
        Object.keys(updatedEquipment).forEach(slot => {
          const itemId = updatedEquipment[slot as EquipmentSlot];
          if (itemId) {
            const item = previous.items.find(i => i.id === itemId);
            if (item && item.type === type) {
              updatedEquipment[slot as EquipmentSlot] = null;
            }
          }
        });
        
        return {
          ...previous,
          items: updatedItems,
          equipment: updatedEquipment
        };
      });
    },
    [setInventoryDataSafe]
  );

  const replaceInventory = useCallback(
    (newInventoryData: InventoryData) => {
      setInventoryData({
        ...newInventoryData,
        items: newInventoryData.items.map((entry) => normaliseIcon({ ...entry }))
      });
    },
    [setInventoryData]
  );

  const clearInventory = useCallback(() => {
    setInventoryData(cloneDefaultInventory());
  }, [setInventoryData]);

  return {
    inventory,
    inventoryData,
    equipment,
    equippedItems,
    sets,
    activeSetBonuses,
    grouped,
    labels: ITEM_TYPE_LABELS,
    xp,
    obedience,
    tokens,
    gainItem,
    setOwned,
    adjustOwned,
    updateItem,
    addOrReplaceItem,
    removeItem,
    equipItem,
    unequipItem,
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
