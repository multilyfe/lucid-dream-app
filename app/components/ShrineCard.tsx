'use client';

import { useState } from 'react';
import { PantyRealmShrine } from '../hooks/usePantyRealm';

interface ShrineCardProps {
  shrine: PantyRealmShrine;
  onActivate: (shrineId: string) => void;
  onUnlock?: (shrineId: string, cost: number) => void;
  canAffordUnlock?: boolean;
  unlockCost?: number;
}

export const ShrineCard = ({ 
  shrine, 
  onActivate, 
  onUnlock, 
  canAffordUnlock = false, 
  unlockCost = 50 
}: ShrineCardProps) => {
  const [showLore, setShowLore] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500/30 to-orange-500/30 border-yellow-400/50';
      case 'epic': return 'from-purple-500/30 to-pink-500/30 border-purple-400/50';
      case 'rare': return 'from-blue-500/30 to-cyan-500/30 border-blue-400/50';
      default: return 'from-gray-500/30 to-slate-500/30 border-gray-400/50';
    }
  };

  const getAuraEffect = (aura: string) => {
    switch (aura) {
      case 'divine': return 'shadow-lg shadow-yellow-500/25 animate-pulse';
      case 'hypnotic': return 'shadow-lg shadow-pink-500/25';
      case 'shadowy': return 'shadow-lg shadow-purple-900/50';
      case 'pure': return 'shadow-lg shadow-pink-300/25';
      default: return 'shadow-lg';
    }
  };

  const getEffectDescription = (effects: { [key: string]: number }) => {
    return Object.entries(effects)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value > 0 ? '+' : ''}${value}`)
      .join(', ');
  };

  return (
    <>
      <div 
        className={`
          relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 transition-all duration-300 hover:scale-105 cursor-pointer
          ${getRarityColor(shrine.rarity)} ${getAuraEffect(shrine.aura)}
          ${shrine.active ? 'ring-2 ring-pink-400/50' : ''}
          ${!shrine.unlocked ? 'opacity-60' : ''}
        `}
        onClick={() => setShowLore(true)}
      >
        {/* Rarity Indicator */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-black/40 border ${
          shrine.rarity === 'legendary' ? 'text-yellow-400 border-yellow-400/50' :
          shrine.rarity === 'epic' ? 'text-purple-400 border-purple-400/50' :
          shrine.rarity === 'rare' ? 'text-blue-400 border-blue-400/50' :
          'text-gray-400 border-gray-400/50'
        }`}>
          {shrine.rarity.toUpperCase()}
        </div>

        {/* Shrine Icon */}
        <div className="text-center mb-4">
          <div className={`text-6xl mb-2 ${shrine.active ? 'animate-bounce' : ''}`}>
            {shrine.icon}
          </div>
          <div className="text-4xl opacity-75">👙</div>
        </div>

        {/* Shrine Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">{shrine.name}</h3>
          <p className="text-sm text-slate-300 mb-3">{shrine.relic}</p>
          <p className="text-xs text-slate-400 mb-4 line-clamp-2">{shrine.description}</p>
          
          {/* Effects */}
          {shrine.unlocked && (
            <div className="bg-black/30 rounded-lg p-3 mb-4">
              <div className="text-xs font-semibold text-slate-300 mb-1">Effects:</div>
              <div className="text-xs text-slate-400">{getEffectDescription(shrine.effects)}</div>
            </div>
          )}
          
          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {!shrine.unlocked ? (
              <span className="text-xs text-red-400 flex items-center gap-1">
                🔒 Locked
              </span>
            ) : shrine.active ? (
              <span className="text-xs text-green-400 flex items-center gap-1">
                ✨ Active
              </span>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                💤 Inactive
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!shrine.unlocked && onUnlock ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnlock(shrine.id, unlockCost);
              }}
              disabled={!canAffordUnlock}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all
                ${canAffordUnlock 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Unlock ({unlockCost} 🪙)
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActivate(shrine.id);
              }}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all
                ${shrine.active 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              {shrine.active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLore(true);
            }}
            className="py-2 px-4 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all"
          >
            📜 Lore
          </button>
        </div>

        {/* Active Aura Effect */}
        {shrine.active && (
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute inset-0 rounded-2xl ${
              shrine.aura === 'divine' ? 'bg-gradient-to-r from-yellow-400/10 to-orange-400/10' :
              shrine.aura === 'hypnotic' ? 'bg-gradient-to-r from-pink-400/10 to-purple-400/10' :
              shrine.aura === 'shadowy' ? 'bg-gradient-to-r from-purple-900/20 to-black/20' :
              'bg-gradient-to-r from-pink-300/10 to-white/5'
            } animate-pulse`} />
          </div>
        )}
      </div>

      {/* Lore Modal */}
      {showLore && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={`
            max-w-md w-full bg-gradient-to-br ${getRarityColor(shrine.rarity)} rounded-2xl p-6 border-2
            ${getAuraEffect(shrine.aura)}
          `}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{shrine.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-1">{shrine.name}</h3>
              <div className="text-lg text-slate-300 mb-2">{shrine.relic}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-black/40 border ${
                shrine.rarity === 'legendary' ? 'text-yellow-400 border-yellow-400/50' :
                shrine.rarity === 'epic' ? 'text-purple-400 border-purple-400/50' :
                shrine.rarity === 'rare' ? 'text-blue-400 border-blue-400/50' :
                'text-gray-400 border-gray-400/50'
              }`}>
                {shrine.rarity.toUpperCase()} {shrine.aura.toUpperCase()}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">📜 Ancient Lore</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{shrine.lore}</p>
            </div>

            {shrine.unlocked && (
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">⚡ Relic Effects</h4>
                <div className="space-y-1">
                  {Object.entries(shrine.effects).map(([effect, value]) => (
                    <div key={effect} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">{effect.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`font-semibold ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLore(false)}
              className="w-full py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};