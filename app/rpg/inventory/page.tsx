'use client';

import { useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { ItemCard } from "../../components/ItemCard";
import { ITEM_TYPE_LABELS, ITEM_TYPE_ORDER, type ItemType } from "../../lib/inventory";
import { useInventory, type EquipResult } from "../../hooks/useInventory";

type FeedbackTone = "success" | "info" | "warning";

const TAB_LABELS = ITEM_TYPE_ORDER.map((type) => ({ value: type, label: ITEM_TYPE_LABELS[type] }));

export default function InventoryPage() {
  const {
    inventory,
    grouped,
    xp,
    obedience,
    equippedRelicCount,
    maxRelics,
    toggleEquip,
    consumeItem,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<ItemType>("relic");
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);

  const itemsForTab = grouped[activeTab];

  const relicLimitReached = useMemo(
    () => equippedRelicCount >= maxRelics,
    [equippedRelicCount, maxRelics]
  );

  const handleEquip = (id: string) => {
    const result: EquipResult = toggleEquip(id);
    if (result === "limit-reached") {
      setFeedback({
        tone: "warning",
        message: `Only ${maxRelics} relic${maxRelics > 1 ? "s" : ""} can be equipped at once. Unequip one to free a slot.`,
      });
      return;
    }
    if (result === "equipped") {
      setFeedback({ tone: "success", message: "Item equipped. Obedience surges through you." });
    } else if (result === "unequipped") {
      setFeedback({ tone: "info", message: "Item returned to your pack." });
    }
  };

  const handleConsume = (id: string, name: string) => {
    const ok = consumeItem(id);
    if (!ok) {
      setFeedback({ tone: "warning", message: `No ${name} remaining to consume.` });
      return;
    }
    setFeedback({ tone: "success", message: `${name} consumed. Effects ripple through the dream.` });
  };

  const emptySlots = itemsForTab.length === 0;

  return (
    <QuestLayout xp={xp}>
      <div className="mx-auto flex max-w-6xl flex-col gap-10 text-slate-100">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-[0.35em] text-white">🎒 Inventory</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-300">
              <span>Obedience {obedience.toLocaleString()}</span>
              <span>|</span>
              <span>Relics Equipped {equippedRelicCount}/{maxRelics}</span>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-300">
            Manage relics, panties, shards, and other dream curios. Equipping relics empowers your buffs, panty items feed obedience, and consumables keep you ready for the next ritual.
          </p>
          {feedback ? (
            <div
              className={`rounded-3xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] ${
                feedback.tone === "success"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : feedback.tone === "info"
                  ? "border-sky-400/40 bg-sky-500/10 text-sky-200"
                  : "border-amber-400/40 bg-amber-500/10 text-amber-200"
              }`}
            >
              {feedback.message}
            </div>
          ) : null}
        </header>

        <nav className="flex flex-wrap gap-2">
          {TAB_LABELS.map((tab) => {
            const active = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                  active
                    ? "border-fuchsia-400/70 bg-fuchsia-500/20 text-fuchsia-100 shadow-[0_0_18px_rgba(244,114,182,0.35)]"
                    : "border-slate-700/60 bg-slate-900/60 text-slate-300 hover:border-slate-500/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section className="space-y-4">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {itemsForTab.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                disableEquip={
                  item.type === "relic" && !item.equipped && relicLimitReached
                }
                actionNote={
                  item.type === "relic" && !item.equipped && relicLimitReached
                    ? "Relic slots are full. Unequip one to free a slot."
                    : undefined
                }
                onToggleEquip={
                  item.type === "relic" || item.type === "panty"
                    ? () => handleEquip(item.id)
                    : undefined
                }
                onConsume={
                  item.type === "consumable"
                    ? () => handleConsume(item.id, item.name)
                    : undefined
                }
              />
            ))}
            {emptySlots ? (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-700/50 bg-slate-950/50 p-6 text-center text-xs uppercase tracking-[0.35em] text-slate-500">
                Empty slot — no items here yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </QuestLayout>
  );
}
