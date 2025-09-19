'use client';

import { useState } from 'react';
import { PantyRealmCurrency } from '../hooks/usePantyRealm';

interface ShameEconomyProps {
  currency: PantyRealmCurrency;
  exchangeRates: {
    shameToTokens: number;
    tokensToRelicUnlock: number;
    essenceToXP: number;
    tokenBurnValue: number;
  };
  onExchangeShameForTokens: (essenceAmount: number) => void;
  onBurnTokens: (tokenAmount: number) => void;
}

export const ShameEconomy = ({ 
  currency, 
  exchangeRates, 
  onExchangeShameForTokens, 
  onBurnTokens 
}: ShameEconomyProps) => {
  const [exchangeAmount, setExchangeAmount] = useState(10);
  const [burnAmount, setBurnAmount] = useState(1);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);

  const calculateTokensFromEssence = (essence: number) => {
    return Math.floor(essence / exchangeRates.shameToTokens);
  };

  const calculateFilthReduction = (tokens: number) => {
    return tokens * exchangeRates.tokenBurnValue;
  };

  const handleExchange = () => {
    const essenceToSpend = calculateTokensFromEssence(exchangeAmount) * exchangeRates.shameToTokens;
    if (currency.shameEssence >= essenceToSpend) {
      onExchangeShameForTokens(essenceToSpend);
      setShowExchangeModal(false);
      setExchangeAmount(10);
    }
  };

  const handleBurn = () => {
    if (currency.dirtyTokens >= burnAmount) {
      onBurnTokens(burnAmount);
      setShowBurnModal(false);
      setBurnAmount(1);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 border border-purple-400/30 rounded-2xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-pink-400 mb-2">💰 Shame Economy</h3>
          <p className="text-sm text-slate-400">Transform your shame into power</p>
        </div>

        {/* Currency Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Dirty Tokens */}
          <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-400/30 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2 animate-bounce">🪙</div>
            <div className="text-2xl font-bold text-amber-400 mb-1">{currency.dirtyTokens}</div>
            <div className="text-sm text-amber-300">Dirty Tokens</div>
            <div className="text-xs text-slate-400 mt-1">Currency of Sin</div>
          </div>

          {/* Shame Essence */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2 animate-pulse">🔮</div>
            <div className="text-2xl font-bold text-purple-400 mb-1">{currency.shameEssence}</div>
            <div className="text-sm text-purple-300">Shame Essence</div>
            <div className="text-xs text-slate-400 mt-1">Raw Humiliation</div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-xl mb-1">👙</div>
            <div className="text-lg font-bold text-pink-400">{currency.pantiesCollected}</div>
            <div className="text-xs text-slate-400">Panties Collected</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-xl mb-1">🏺</div>
            <div className="text-lg font-bold text-cyan-400">{currency.relicsUnlocked}</div>
            <div className="text-xs text-slate-400">Relics Unlocked</div>
          </div>
        </div>

        {/* Exchange Rates */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">📊 Exchange Rates</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">{exchangeRates.shameToTokens} Shame Essence</span>
              <span className="text-amber-400">→ 1 Dirty Token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{exchangeRates.tokensToRelicUnlock} Dirty Tokens</span>
              <span className="text-cyan-400">→ Unlock Relic</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">1 Dirty Token Burn</span>
              <span className="text-red-400">→ -{exchangeRates.tokenBurnValue} Filth</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{exchangeRates.essenceToXP} Shame Essence</span>
              <span className="text-blue-400">→ 1 XP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setShowExchangeModal(true)}
            disabled={currency.shameEssence < exchangeRates.shameToTokens}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105
              ${currency.shameEssence >= exchangeRates.shameToTokens
                ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🔄 Exchange Shame for Tokens
          </button>

          <button
            onClick={() => setShowBurnModal(true)}
            disabled={currency.dirtyTokens < 1}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105
              ${currency.dirtyTokens >= 1
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🔥 Burn Tokens (Reduce Filth)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={true}
              className="py-2 px-4 rounded-lg bg-gray-600 text-gray-400 cursor-not-allowed font-semibold text-sm"
            >
              💎 Convert to XP (Soon)
            </button>
            
            <button
              disabled={true}
              className="py-2 px-4 rounded-lg bg-gray-600 text-gray-400 cursor-not-allowed font-semibold text-sm"
            >
              🎁 Trade Relics (Soon)
            </button>
          </div>
        </div>

        {/* Economic Stats */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 text-center">
            Total Worth: {currency.dirtyTokens + Math.floor(currency.shameEssence / exchangeRates.shameToTokens)} Tokens
          </div>
        </div>
      </div>

      {/* Exchange Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-slate-900/90 to-purple-900/40 border border-purple-400/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-purple-400 mb-4 text-center">🔄 Exchange Shame Essence</h3>
            
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-slate-400 mb-2">Available Shame Essence</div>
                <div className="text-2xl font-bold text-purple-400">{currency.shameEssence}</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Essence to Exchange</label>
                  <input
                    type="number"
                    min={exchangeRates.shameToTokens}
                    max={currency.shameEssence}
                    step={exchangeRates.shameToTokens}
                    value={exchangeAmount}
                    onChange={(e) => setExchangeAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div className="bg-amber-900/20 border border-amber-400/30 rounded-lg p-3 text-center">
                  <div className="text-sm text-slate-400">You will receive</div>
                  <div className="text-xl font-bold text-amber-400">
                    {calculateTokensFromEssence(exchangeAmount)} 🪙
                  </div>
                  <div className="text-xs text-slate-500">
                    (Cost: {calculateTokensFromEssence(exchangeAmount) * exchangeRates.shameToTokens} Essence)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExchangeModal(false)}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleExchange}
                disabled={exchangeAmount < exchangeRates.shameToTokens || currency.shameEssence < exchangeAmount}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-semibold transition-all
                  ${(exchangeAmount >= exchangeRates.shameToTokens && currency.shameEssence >= exchangeAmount)
                    ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Exchange
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Burn Modal */}
      {showBurnModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-slate-900/90 to-red-900/40 border border-red-400/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4 text-center">🔥 Burn Dirty Tokens</h3>
            
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-slate-400 mb-2">Available Dirty Tokens</div>
                <div className="text-2xl font-bold text-amber-400">{currency.dirtyTokens}</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Tokens to Burn</label>
                  <input
                    type="number"
                    min="1"
                    max={currency.dirtyTokens}
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3 text-center">
                  <div className="text-sm text-slate-400">Filth Reduction</div>
                  <div className="text-xl font-bold text-red-400">
                    -{calculateFilthReduction(burnAmount)} 🧼
                  </div>
                  <div className="text-xs text-slate-500">
                    Purifies your shameful existence
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-yellow-400 flex items-center gap-1">
                ⚠️ <span className="font-semibold">Warning:</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Burning tokens is permanent and cannot be undone. Consider your choices carefully.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBurnModal(false)}
                className="flex-1 py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBurn}
                disabled={burnAmount < 1 || currency.dirtyTokens < burnAmount}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-semibold transition-all
                  ${(burnAmount >= 1 && currency.dirtyTokens >= burnAmount)
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                🔥 Burn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};