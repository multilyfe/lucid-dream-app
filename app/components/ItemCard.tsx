'use client';

import { type ReactNode } from "react";
import type { InventoryItem, ItemType, Rarity } from "../lib/inventory";
import { getRarityColor, getRarityGlow } from "../lib/inventory";

const TYPE_STYLES: Record<ItemType, string> = {
  relic: "from-fuchsia-500/40 via-amber-400/20 to-sky-500/30",
  panty: "from-rose-500/50 via-purple-500/25 to-pink-500/20",
  shard: "from-cyan-400/40 via-sky-500/20 to-indigo-500/20",
  consumable: "from-emerald-400/35 via-teal-500/20 to-lime-500/15",
  quest: "from-orange-400/35 via-amber-500/20 to-red-500/15",
  artifact: "from-purple-500/40 via-violet-400/20 to-indigo-500/30",
  equipment: "from-gray-500/40 via-slate-400/20 to-zinc-500/30",
  currency: "from-yellow-500/40 via-gold-400/20 to-amber-500/30",
};

const TYPE_LABEL: Record<ItemType, string> = {
  relic: "Relic",
  panty: "Panty",
  shard: "Shard",
  consumable: "Consumable",
  quest: "Quest Item",
  artifact: "Artifact",
  equipment: "Equipment",
  currency: "Currency",
};

const RARITY_STYLES: Record<Rarity, string> = {
  common: "border-gray-400/50 shadow-gray-400/20",
  uncommon: "border-green-400/50 shadow-green-400/30",
  rare: "border-blue-400/50 shadow-blue-400/40",
  epic: "border-purple-400/50 shadow-purple-400/50",
  legendary: "border-orange-400/50 shadow-orange-400/60",
  unique: "border-pink-400/50 shadow-pink-400/70",
};

const EQUIPPED_FRAME = "shadow-[0_0_35px_rgba(244,114,182,0.45)] border-fuchsia-400/70";

export type ItemCardActionHandlers = {
  onToggleEquip?: () => void;
  onConsume?: () => void;
  onSell?: () => void;
  onDragStart?: (e: React.DragEvent, item: InventoryItem) => void;
};

export type ItemCardProps = ItemCardActionHandlers & {
  item: InventoryItem;
  equippedLabel?: ReactNode;
  disableEquip?: boolean;
  disableConsume?: boolean;
  disableSell?: boolean;
  actionNote?: ReactNode;
  draggable?: boolean;
  showLore?: boolean;
  compact?: boolean;
};

export function ItemCard({
  item,
  onToggleEquip,
  onConsume,
  onSell,
  onDragStart,
  equippedLabel,
  disableEquip,
  disableConsume,
  disableSell,
  actionNote,
  draggable = false,
  showLore = false,
  compact = false,
}: ItemCardProps) {
  const aura = TYPE_STYLES[item.type];
  const baseIcon = item.icon ?? "✨";
  const isEquipped = Boolean(item.equipped);
  const rarityStyle = item.rarity ? RARITY_STYLES[item.rarity] : "";

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, item);
    }
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${
        isEquipped ? EQUIPPED_FRAME : rarityStyle || "border-slate-700/40"
      } bg-slate-950/70 p-5 transition-transform duration-300 hover:-translate-y-1 shadow-lg ${
        compact ? "p-3" : ""
      } ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      draggable={draggable}
      onDragStart={handleDragStart}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${aura} opacity-30`} />

      {/* Rarity Badge */}
      {item.rarity && !compact && (
        <span className={`absolute left-4 top-4 inline-flex items-center rounded-full border px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] ${getRarityColor(item.rarity)}`}>
          {item.rarity}
        </span>
      )}

      {isEquipped ? (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-fuchsia-100">
          <span aria-hidden>✦</span>
          Equipped
        </span>
      ) : null}

      <div className={`relative z-10 flex flex-col gap-4 text-slate-100 ${compact ? "gap-2" : ""}`}>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`${compact ? "text-2xl" : "text-3xl"} drop-shadow-[0_0_18px_rgba(244,114,182,0.35)]`} aria-hidden>
              {baseIcon}
            </span>
            <div>
              <h3 className={`${compact ? "text-sm" : "text-lg"} font-semibold tracking-wide text-white drop-shadow`}>{item.name}</h3>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">{TYPE_LABEL[item.type]}</p>
              {item.slot && !compact && (
                <p className="text-xs text-yellow-300/80 capitalize">{item.slot} slot</p>
              )}
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.3em] text-slate-200">
            Owned ×{item.owned}
          </span>
        </header>

        <p className={`${compact ? "text-xs" : "text-sm"} leading-relaxed text-slate-300`}>{item.desc}</p>

        {/* Item Effect */}
        {item.effect && !compact && (
          <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-2">
            <p className="text-blue-300 text-xs font-semibold">Effect:</p>
            <p className="text-blue-200 text-xs">{item.effect}</p>
          </div>
        )}

        {/* Item Source */}
        {item.source && !compact && (
          <p className="text-xs text-green-300/80">Source: {item.source}</p>
        )}

        {/* Item Lore */}
        {showLore && item.lore && !compact && (
          <div className="bg-purple-900/30 border border-purple-400/30 rounded-lg p-2">
            <p className="text-purple-300 text-xs font-semibold">Lore:</p>
            <p className="text-purple-200 text-xs italic">{item.lore}</p>
          </div>
        )}

        {equippedLabel ? <div className="text-xs text-fuchsia-200">{equippedLabel}</div> : null}

        {!compact && (
          <div className="mt-auto flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em]">
            {onToggleEquip ? (
              <button
                type="button"
                onClick={onToggleEquip}
                disabled={disableEquip}
                className={`rounded-2xl border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  disableEquip
                    ? "cursor-not-allowed border-slate-700/60 bg-slate-900/60 text-slate-400"
                    : isEquipped
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
                    : "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30"
                }`}
              >
                {isEquipped ? "Unequip" : "Equip"}
              </button>
            ) : null}

            {onConsume ? (
              <button
                type="button"
                onClick={onConsume}
                disabled={disableConsume || item.owned === 0}
                className={`rounded-2xl border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  disableConsume || item.owned === 0
                    ? "cursor-not-allowed border-slate-700/60 bg-slate-900/60 text-slate-400"
                    : "border-emerald-400/50 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                }`}
              >
                Consume
              </button>
            ) : null}

            {onSell ? (
              <button
                type="button"
                onClick={onSell}
                disabled={disableSell}
                className={`rounded-2xl border px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  disableSell
                    ? "cursor-not-allowed border-slate-700/60 bg-slate-900/60 text-slate-400"
                    : "border-sky-400/50 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30"
                }`}
              >
                Sell
              </button>
            ) : null}
          </div>
        )}

        {actionNote ? <div className="text-xs text-slate-300/80">{actionNote}</div> : null}
      </div>
    </div>
  );
}