'use client';

import { type ReactNode } from "react";
import type { InventoryItem, ItemType } from "../lib/inventory";

const TYPE_STYLES: Record<ItemType, string> = {
  relic: "from-fuchsia-500/40 via-amber-400/20 to-sky-500/30",
  panty: "from-rose-500/50 via-purple-500/25 to-pink-500/20",
  shard: "from-cyan-400/40 via-sky-500/20 to-indigo-500/20",
  consumable: "from-emerald-400/35 via-teal-500/20 to-lime-500/15",
  quest: "from-orange-400/35 via-amber-500/20 to-red-500/15",
};

const TYPE_LABEL: Record<ItemType, string> = {
  relic: "Relic",
  panty: "Panty",
  shard: "Shard",
  consumable: "Consumable",
  quest: "Quest Item",
};

const EQUIPPED_FRAME = "shadow-[0_0_35px_rgba(244,114,182,0.45)] border-fuchsia-400/70";

export type ItemCardActionHandlers = {
  onToggleEquip?: () => void;
  onConsume?: () => void;
  onSell?: () => void;
};

export type ItemCardProps = ItemCardActionHandlers & {
  item: InventoryItem;
  equippedLabel?: ReactNode;
  disableEquip?: boolean;
  disableConsume?: boolean;
  disableSell?: boolean;
  actionNote?: ReactNode;
};

export function ItemCard({
  item,
  onToggleEquip,
  onConsume,
  onSell,
  equippedLabel,
  disableEquip,
  disableConsume,
  disableSell,
  actionNote,
}: ItemCardProps) {
  const aura = TYPE_STYLES[item.type];
  const baseIcon = item.icon ?? "✨";
  const isEquipped = Boolean(item.equipped);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-950/70 p-5 transition-transform duration-300 hover:-translate-y-1 ${
        isEquipped ? EQUIPPED_FRAME : "shadow-[0_0_25px_rgba(15,23,42,0.55)]"
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${aura} opacity-30`} />

      {isEquipped ? (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-fuchsia-100">
          <span aria-hidden>✦</span>
          Equipped
        </span>
      ) : null}

      <div className="relative z-10 flex flex-col gap-4 text-slate-100">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-[0_0_18px_rgba(244,114,182,0.35)]" aria-hidden>
              {baseIcon}
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-wide text-white drop-shadow">{item.name}</h3>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">{TYPE_LABEL[item.type]}</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.3em] text-slate-200">
            Owned ×{item.owned}
          </span>
        </header>

        <p className="text-sm leading-relaxed text-slate-300">{item.desc}</p>

        {equippedLabel ? <div className="text-xs text-fuchsia-200">{equippedLabel}</div> : null}

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

        {actionNote ? <div className="text-xs text-slate-300/80">{actionNote}</div> : null}
      </div>
    </div>
  );
}
