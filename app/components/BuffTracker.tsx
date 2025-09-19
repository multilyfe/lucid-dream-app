'use client';

import { useState } from 'react';
import { useBuffs } from '../hooks/useBuffs';

export function BuffTracker() {
  const { 
    activeBuffs, 
    activeCurses, 
    history, 
    buffCount, 
    curseCount, 
    historyCount,
    clearHistory 
  } = useBuffs();
  
  const [activeTab, setActiveTab] = useState<'buffs' | 'curses' | 'history'>('buffs');
  const [showTracker, setShowTracker] = useState(true);

  if (!showTracker) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowTracker(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Show Buffs ({buffCount + curseCount})
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl w-80 max-h-96 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Effects Tracker</h3>
        <button
          onClick={() => setShowTracker(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('buffs')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'buffs'
              ? 'bg-green-600/20 text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Buffs ({buffCount})
        </button>
        <button
          onClick={() => setActiveTab('curses')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'curses'
              ? 'bg-red-600/20 text-red-400 border-b-2 border-red-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Curses ({curseCount})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-gray-600/20 text-gray-300 border-b-2 border-gray-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          History ({historyCount})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === 'buffs' && (
          <div className="space-y-2">
            {activeBuffs.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No active buffs
              </div>
            ) : (
              activeBuffs.map(buff => (
                <div
                  key={buff.id}
                  className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{buff.icon}</span>
                      <span className="text-green-400 font-medium">{buff.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      buff.rarity === 'legendary' ? 'bg-yellow-600/20 text-yellow-400' :
                      buff.rarity === 'epic' ? 'bg-purple-600/20 text-purple-400' :
                      buff.rarity === 'rare' ? 'bg-blue-600/20 text-blue-400' :
                      buff.rarity === 'uncommon' ? 'bg-green-600/20 text-green-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {buff.rarity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300">{buff.desc}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">from {buff.source}</span>
                    <span className="text-green-400">{buff.duration}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'curses' && (
          <div className="space-y-2">
            {activeCurses.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No active curses
              </div>
            ) : (
              activeCurses.map(curse => (
                <div
                  key={curse.id}
                  className="bg-red-600/10 border border-red-600/30 rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{curse.icon}</span>
                      <span className="text-red-400 font-medium">{curse.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      curse.rarity === 'legendary' ? 'bg-yellow-600/20 text-yellow-400' :
                      curse.rarity === 'epic' ? 'bg-purple-600/20 text-purple-400' :
                      curse.rarity === 'rare' ? 'bg-blue-600/20 text-blue-400' :
                      curse.rarity === 'uncommon' ? 'bg-green-600/20 text-green-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {curse.rarity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300">{curse.desc}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">from {curse.source}</span>
                    <span className="text-red-400">{curse.duration}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No effect history
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Recent Effects</span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                {history.map(effect => (
                  <div
                    key={effect.id}
                    className="bg-gray-600/10 border border-gray-600/30 rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg grayscale">{effect.icon}</span>
                        <span className="text-gray-300 font-medium">{effect.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        effect.type === 'buff' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {effect.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{effect.desc}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">from {effect.source}</span>
                      <span className="text-gray-500">expired</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}