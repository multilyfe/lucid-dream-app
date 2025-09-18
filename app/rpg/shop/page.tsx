"use client";

import { useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import ShopItemCard from "../../components/ShopItemCard";
import { useShop } from "../../hooks/useShop";
import { useInventory } from "../../hooks/useInventory";
import { usePersistentState } from "../../hooks/usePersistentState";
import { type ShopItem } from "../../lib/shop";
import { useHydrated } from "../../hooks/useHydrated";
import { useShame } from "../../hooks/useShame";

type SellModalProps = {
  open: boolean;
  items: Array<{ id: string; name: string; type: string; owned: number; priceXP: number; priceTokens: number }>;
  onClose: () => void;
  onSell: (itemId: string) => void;
};

function SellModal({ open, items, onClose, onSell }: SellModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700/60 bg-slate-950/90 p-6 text-slate-100 shadow-[0_0_45px_rgba(148,163,184,0.3)]">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">Sell Items</p>
          <h2 className="text-xl font-semibold text-white">Convert loot into currency</h2>
        </header>
        <div className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-2 text-sm">
          {items.length === 0 ? (
            <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-400">No sellable items.</p>
          ) : (
            items.map((item) => {
              const refundXP = Math.floor(item.priceXP * 0.5);
              const refundTokens = Math.floor(item.priceTokens * 0.5);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSell(item.id)}
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-left transition hover:border-emerald-400/60 hover:bg-emerald-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                        Owned ×{item.owned}
                      </div>
                    </div>
                    <div className="text-[0.65rem] uppercase tracking-[0.3em] text-emerald-200">
                      +{refundXP} XP · +{refundTokens} Tokens
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600/60 bg-slate-800/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 hover:bg-slate-700/70"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const hydrated = useHydrated();
  const { shop, updateItem, appendLog } = useShop();
  const { incrementCounter } = useShame();
  const {
    inventory,
    gainItem,
    adjustOwned,
    xp,
    tokens,
    spendXp,
    spendTokens,
    awardXp,
    awardTokens,
  } = useInventory();
  const [achievements, setAchievements] = usePersistentState<string[]>("shopAchievements", () => []);
  const [sellModalOpen, setSellModalOpen] = useState(false);

  const shopItems = shop.inventory;

  const sellable = useMemo(() => {
    return inventory
      .filter((item) => item.owned > 0)
      .map((item) => {
        const entry = shopItems.find((shopItem) => shopItem.id === item.id);
        return {
          id: item.id,
          name: item.name,
          type: item.type,
          owned: item.owned,
          priceXP: entry?.priceXP ?? 100,
          priceTokens: entry?.priceTokens ?? 0,
        };
      });
  }, [inventory, shopItems]);

  const handleAchievement = (label: string) => {
    setAchievements((previous) => {
      if (previous.includes(label)) return previous;
      awardXp(50);
      return [...previous, label];
    });
  };

  const handlePurchase = (item: ShopItem) => {
    if (shop.limitedStock && item.stock != null && item.stock <= 0) return;
    if (item.priceXP > xp || item.priceTokens > tokens) return;
    
    const spentTokens = item.priceTokens;
    spendXp(item.priceXP);
    spendTokens(spentTokens);

    if (spentTokens > 0) {
      incrementCounter('dirtyTokensBurned', spentTokens);
    }

    gainItem(item.id, 1, { name: item.name, type: item.type });

    if (shop.limitedStock && item.stock != null) {
      updateItem(item.id, { stock: Math.max(0, item.stock - 1) });
    }

    appendLog({
      id: `${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      action: "buy",
      xp: item.priceXP,
      tokens: item.priceTokens,
      timestamp: new Date().toISOString(),
    });

    handleAchievement("First Purchase");
  };

  const handleSell = (itemId: string) => {
    const target = sellable.find((item) => item.id === itemId);
    if (!target) return;
    adjustOwned(itemId, -1);
    const refundXP = Math.floor(target.priceXP * 0.5);
    const refundTokens = Math.floor(target.priceTokens * 0.5);
    awardXp(refundXP);
    awardTokens(refundTokens);
    appendLog({
      id: `${itemId}-${Date.now()}`,
      itemId,
      itemName: target.name,
      action: "sell",
      xp: refundXP,
      tokens: refundTokens,
      timestamp: new Date().toISOString(),
    });
  };

  if (!hydrated) {
    return (
      <QuestLayout>
        <div className="p-6" />
      </QuestLayout>
    );
  }

  return (
    <QuestLayout>
      <div className="space-y-10 bg-[url('https://images.unsplash.com/photo-1517677129300-07b130802f46?auto=format&fit=crop&w=1600&q=60')] bg-cover bg-fixed bg-center/cover p-6">
        <header className="rounded-3xl border border-fuchsia-500/30 bg-slate-950/80 p-6 shadow-[0_0_45px_rgba(236,72,153,0.3)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200/70">Dream Shop</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">🛒 Dream Shop</h1>
          <p className="mt-3 text-sm text-slate-300">
            Trade dirty tokens and lucid XP for relics, panties, and shards. Stock refreshes with the tides of the Multiverse.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-200">
            <span className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1">
              XP · {xp}
            </span>
            <span className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1">
              Dirty Tokens · {tokens}
            </span>
            <button
              type="button"
              onClick={() => setSellModalOpen(true)}
              className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100 hover:bg-emerald-500/30"
            >
              Sell Items
            </button>
          </div>
        </header>

        <SellModal
          open={sellModalOpen}
          items={sellable}
          onClose={() => setSellModalOpen(false)}
          onSell={(itemId) => {
            handleSell(itemId);
            setSellModalOpen(false);
          }}
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shopItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              xpBalance={xp}
              tokenBalance={tokens}
              limitedStock={shop.limitedStock}
              onPurchase={handlePurchase}
            />
          ))}
        </section>
      </div>
    </QuestLayout>
  );
}
