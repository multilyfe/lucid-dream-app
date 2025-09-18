'use client';

import { type ShopItem } from '../lib/shop';

const TYPE_AURAS: Record<ShopItem['type'], string> = {
  relic: 'from-amber-400/50 via-amber-500/30 to-slate-900/70',
  panty: 'from-rose-500/60 via-pink-500/40 to-slate-900/70',
  shard: 'from-cyan-400/60 via-sky-500/40 to-slate-900/70',
  consumable: 'from-emerald-400/50 via-teal-500/30 to-slate-900/70',
  quest: 'from-purple-400/50 via-indigo-500/30 to-slate-900/70',
};

type ShopItemCardProps = {
  item: ShopItem;
  xpBalance: number;
  tokenBalance: number;
  limitedStock: boolean;
  onPurchase: (item: ShopItem) => void;
};

export function ShopItemCard({ item, xpBalance, tokenBalance, limitedStock, onPurchase }: ShopItemCardProps) {
  const aura = TYPE_AURAS[item.type] ?? TYPE_AURAS.quest;
  const affordXP = item.priceXP <= xpBalance;
  const affordTokens = item.priceTokens <= tokenBalance;
  const affordable = (item.priceXP === 0 || affordXP) && (item.priceTokens === 0 || affordTokens);
  const outOfStock = limitedStock && item.stock != null && item.stock <= 0;
  const disabled = !affordable || outOfStock;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_0_40px_rgba(17,24,39,0.45)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${aura} opacity-40 blur-[2px] transition-all duration-500 ${affordable ? 'animate-pulse' : ''}`} />
      <div className="relative z-10 space-y-4 text-slate-100">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">{item.type}</p>
          <h3 className="text-lg font-semibold text-white drop-shadow-[0_0_12px_rgba(244,114,182,0.35)]">{item.name}</h3>
        </header>

        <div className="grid gap-2 text-xs uppercase tracking-[0.3em] text-slate-200">
          <div className="flex items-center justify-between">
            <span>XP Cost</span>
            <span className={affordXP || item.priceXP === 0 ? 'text-emerald-200' : 'text-rose-300'}>{item.priceXP}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Dirty Tokens</span>
            <span className={affordTokens || item.priceTokens === 0 ? 'text-emerald-200' : 'text-rose-300'}>{item.priceTokens}</span>
          </div>
          {limitedStock && item.stock != null ? (
            <div className="flex items-center justify-between">
              <span>Stock</span>
              <span>{item.stock}</span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onPurchase(item)}
          className={`w-full rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            disabled
              ? 'cursor-not-allowed border-slate-700/60 bg-slate-800/60 text-slate-400'
              : 'border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-50 hover:bg-fuchsia-500/30 focus-visible:ring-fuchsia-300'
          } ${affordable && !disabled ? 'animate-pulse' : ''}`}
        >
          {disabled ? (outOfStock ? 'Sold Out' : 'Insufficient Funds') : 'Buy'}
        </button>
      </div>
    </div>
  );
}

export default ShopItemCard;
