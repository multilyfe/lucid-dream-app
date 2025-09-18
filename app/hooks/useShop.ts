'use client';

import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import {
  cloneDefaultShop,
  cloneDefaultShopLogs,
  normaliseItem,
  normaliseShop,
  type ShopItem,
  type ShopLog,
  type ShopSchema,
} from '../lib/shop';

const LOG_LIMIT = 200;

export function useShop() {
  const [shop, setShop] = usePersistentState<ShopSchema>('shop', cloneDefaultShop);
  const [logs, setLogs] = usePersistentState<ShopLog[]>('shopLogs', cloneDefaultShopLogs);

  const setSafe = useCallback(
    (updater: (previous: ShopSchema) => ShopSchema) => {
      setShop((previous) => normaliseShop(updater(previous)));
    },
    [setShop]
  );

  const setLogsSafe = useCallback(
    (updater: (previous: ShopLog[]) => ShopLog[]) => {
      setLogs((previous) => updater(previous).slice(-LOG_LIMIT));
    },
    [setLogs]
  );

  const addItem = useCallback(
    (item: ShopItem) => {
      setSafe((previous) => ({
        ...previous,
        inventory: previous.inventory.some((entry) => entry.id === item.id)
          ? previous.inventory.map((entry) => (entry.id === item.id ? normaliseItem(item) : entry))
          : [...previous.inventory, normaliseItem(item)],
      }));
    },
    [setSafe]
  );

  const updateItem = useCallback(
    (itemId: string, patch: Partial<ShopItem>) => {
      setSafe((previous) => ({
        ...previous,
        inventory: previous.inventory.map((item) =>
          item.id === itemId ? normaliseItem({ ...item, ...patch }) : item
        ),
      }));
    },
    [setSafe]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setSafe((previous) => ({
        ...previous,
        inventory: previous.inventory.filter((item) => item.id !== itemId),
      }));
    },
    [setSafe]
  );

  const replaceInventory = useCallback(
    (items: ShopItem[]) => {
      setSafe((previous) => ({
        ...previous,
        inventory: items.map((item) => normaliseItem(item)),
      }));
    },
    [setSafe]
  );

  const toggleLimitedStock = useCallback(() => {
    setSafe((previous) => ({
      ...previous,
      limitedStock: !previous.limitedStock,
    }));
  }, [setSafe]);

  const appendLog = useCallback(
    (log: ShopLog) => {
      setLogsSafe((previous) => [...previous, { ...log }]);
    },
    [setLogsSafe]
  );

  const clearLogs = useCallback(() => {
    setLogsSafe(() => []);
  }, [setLogsSafe]);

  return {
    shop,
    logs,
    addItem,
    updateItem,
    removeItem,
    replaceInventory,
    toggleLimitedStock,
    appendLog,
    clearLogs,
  } as const;
}
