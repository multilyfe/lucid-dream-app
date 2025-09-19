'use client';

import { useState } from 'react';
import { useBuffs, Buff } from '../../hooks/useBuffs';
import { BuffCard } from '../../components/BuffCard';
import { BuffTimerHandler } from '../../components/BuffTimerHandler';
import QuestLayout from '../../layouts/QuestLayout';

export default function BuffsPage() {
  const { 
    activeBuffs, 
    activeCurses, 
    history, 
    addBuff, 
    removeBuff, 
    clearHistory,
    effects,
    buffCount,
    curseCount,
    historyCount,
    allActive
  } = useBuffs();

  console.log('BuffsPage Debug:', {
    activeBuffs,
    activeCurses,
    allActive,
    buffCount,
    curseCount,
    historyCount
  });

  const [activeTab, setActiveTab] = useState<'active' | 'add' | 'history' | 'effects'>('active');
  const [newBuff, setNewBuff] = useState({
    name: '',
    type: 'buff' as 'buff' | 'curse',
    desc: '',
    duration: '',
    durationMs: 0,
    source: '',
    icon: '',
    rarity: 'common' as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
    effects: {}
  });

  const handleAddBuff = () => {
    if (!newBuff.name || !newBuff.desc || !newBuff.durationMs) return;
    
    addBuff(newBuff);
    setNewBuff({
      name: '',
      type: 'buff',
      desc: '',
      duration: '',
      durationMs: 0,
      source: '',
      icon: '',
      rarity: 'common',
      effects: {}
    });
    setActiveTab('active');
  };

  const parseDuration = (duration: string): number => {
    const regex = /(\d+)\s*(s|m|h|d)/g;
    let totalMs = 0;
    let match;
    
    while ((match = regex.exec(duration)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 's': totalMs += value * 1000; break;
        case 'm': totalMs += value * 60 * 1000; break;
        case 'h': totalMs += value * 60 * 60 * 1000; break;
        case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
      }
    }
    
    return totalMs;
  };

  const handleDurationChange = (duration: string) => {
    setNewBuff({
      ...newBuff,
      duration,
      durationMs: parseDuration(duration)
    });
  };

  return (
    <QuestLayout>
      <BuffTimerHandler />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
            Buff & Curse Management
          </h1>
          <p className="text-gray-400">
            Manage your active effects, add new buffs/curses, and view your effect history
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{buffCount}</div>
            <div className="text-xs text-gray-400">Active Buffs</div>
          </div>
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{curseCount}</div>
            <div className="text-xs text-gray-400">Active Curses</div>
          </div>
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{buffCount + curseCount}</div>
            <div className="text-xs text-gray-400">Total Active</div>
          </div>
          <div className="bg-gray-600/10 border border-gray-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{historyCount}</div>
            <div className="text-xs text-gray-400">History</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'active', label: 'Active Effects', count: buffCount + curseCount },
            { id: 'add', label: 'Add Effect', count: null },
            { id: 'effects', label: 'Effect Summary', count: null },
            { id: 'history', label: 'History', count: historyCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && ` (${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-6">
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* Active Buffs */}
              {activeBuffs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Active Buffs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBuffs.map(buff => (
                      <BuffCard 
                        key={buff.id} 
                        buff={buff} 
                        onRemove={removeBuff}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Active Curses */}
              {activeCurses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Active Curses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCurses.map(curse => (
                      <BuffCard 
                        key={curse.id} 
                        buff={curse} 
                        onRemove={removeBuff}
                      />
                    ))}
                  </div>
                </div>
              )}

              {buffCount === 0 && curseCount === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">✨</div>
                  <div className="text-xl mb-2">No active effects</div>
                  <div className="text-sm">Add some buffs or curses to get started!</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-purple-400">Add New Effect</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={newBuff.name}
                      onChange={(e) => setNewBuff({...newBuff, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Effect name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newBuff.type}
                      onChange={(e) => setNewBuff({...newBuff, type: e.target.value as 'buff' | 'curse'})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="buff">Buff (Positive Effect)</option>
                      <option value="curse">Curse (Negative Effect)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newBuff.desc}
                      onChange={(e) => setNewBuff({...newBuff, desc: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      rows={3}
                      placeholder="What does this effect do?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                    <input
                      type="text"
                      value={newBuff.duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., 1h 30m, 2d, 45s"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Use format: 1d 2h 30m 45s (days, hours, minutes, seconds)
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                    <input
                      type="text"
                      value={newBuff.source}
                      onChange={(e) => setNewBuff({...newBuff, source: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Where did this effect come from?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                    <input
                      type="text"
                      value={newBuff.icon}
                      onChange={(e) => setNewBuff({...newBuff, icon: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Emoji icon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                    <select
                      value={newBuff.rarity}
                      onChange={(e) => setNewBuff({...newBuff, rarity: e.target.value as any})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleAddBuff}
                      disabled={!newBuff.name || !newBuff.desc || !newBuff.durationMs}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      Add Effect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-blue-400">Combined Effect Summary</h3>
              
              {Object.keys(effects).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(effects).map(([key, value]) => (
                    <div key={key} className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                      <div className="text-blue-400 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {typeof value === 'number' && key.includes('Multiplier') 
                          ? `${((value - 1) * 100).toFixed(0)}%`
                          : typeof value === 'number' && value > 0
                          ? `+${value}`
                          : value
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No active effects to combine
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-400">Effect History</h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map(effect => (
                    <BuffCard 
                      key={effect.id} 
                      buff={effect} 
                      isActive={false}
                      showTimer={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No effect history yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </QuestLayout>
  );
}