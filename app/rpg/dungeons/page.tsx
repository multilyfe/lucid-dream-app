'use client';

import { useState } from 'react';
import { Castle, Crown, Gem, Trophy, Star, Package, ArrowLeft } from 'lucide-react';
import QuestLayout from '../../layouts/QuestLayout';
import { DungeonCard } from '../../components/DungeonCard';
import { DungeonRoom } from '../../components/DungeonRoom';
import { useDungeons } from '../../hooks/useDungeons';

export default function DungeonsPage() {
  const {
    dungeons,
    activeRun,
    inventory,
    achievements,
    totalClearedDungeons,
    totalBossesDefeated,
    startDungeonRun,
    getCurrentRoom,
    completeTrial,
    fightBoss,
    collectLoot,
    abandonDungeon,
    getAvailableDungeons
  } = useDungeons();

  const [selectedView, setSelectedView] = useState<'dungeons' | 'inventory' | 'achievements'>('dungeons');

  const currentRoom = getCurrentRoom();
  const availableDungeons = getAvailableDungeons();

  const handleRoomComplete = async (success: boolean, input?: string) => {
    if (!currentRoom || !activeRun) return;

    let result = false;

    switch (currentRoom.type) {
      case 'trial':
        if (currentRoom.subtype) {
          result = completeTrial(currentRoom.subtype, input);
        }
        break;
      case 'boss':
        result = fightBoss(input || 'direct_combat');
        break;
      case 'loot':
        result = collectLoot();
        break;
    }

    console.log('Room completion result:', result);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-600';
      case 'uncommon': return 'text-green-400 border-green-600';
      case 'rare': return 'text-blue-400 border-blue-600';
      case 'epic': return 'text-purple-400 border-purple-600';
      case 'legendary': return 'text-yellow-400 border-yellow-600';
      default: return 'text-gray-400 border-gray-600';
    }
  };

  // If there's an active run, show the room interface
  if (activeRun && currentRoom) {
    const dungeon = dungeons.find(d => d.id === activeRun.dungeonId);
    if (dungeon) {
      return (
        <DungeonRoom
          room={currentRoom}
          dungeon={dungeon}
          roomIndex={activeRun.currentRoomIndex}
          totalRooms={activeRun.totalRooms}
          onComplete={handleRoomComplete}
          onAbandon={abandonDungeon}
        />
      );
    }
  }

  const renderDungeonsList = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-600 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Castle className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{totalClearedDungeons}</div>
              <div className="text-sm text-purple-300">Dungeons Cleared</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900 to-red-800 border border-red-600 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">{totalBossesDefeated}</div>
              <div className="text-sm text-red-300">Bosses Defeated</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 border border-yellow-600 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Gem className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{inventory.length}</div>
              <div className="text-sm text-yellow-300">Treasures Collected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Run Status */}
      {activeRun && (
        <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border border-yellow-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-400">Active Dungeon Run</h3>
              <p className="text-yellow-200">
                {dungeons.find(d => d.id === activeRun.dungeonId)?.name} - Room {activeRun.currentRoomIndex + 1} of {activeRun.totalRooms}
              </p>
            </div>
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold animate-pulse">
              IN PROGRESS
            </div>
          </div>
        </div>
      )}

      {/* Available Dungeons */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Castle className="w-8 h-8 text-purple-400" />
          Available Dungeons
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dungeons.map((dungeon) => (
            <DungeonCard
              key={dungeon.id}
              dungeon={dungeon}
              onStartRun={startDungeonRun}
              isRunning={activeRun?.dungeonId === dungeon.id}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Package className="w-8 h-8 text-yellow-400" />
        Dungeon Inventory
      </h2>

      {inventory.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Gem className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No treasures collected yet</p>
          <p className="text-sm">Complete dungeons to find rare loot!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item, index) => (
            <div 
              key={index}
              className={`bg-black bg-opacity-40 rounded-lg p-4 border ${getRarityColor(item.rarity)}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Gem className={`w-6 h-6 ${getRarityColor(item.rarity).split(' ')[0]}`} />
                <div className="flex-1">
                  <h3 className="font-bold text-white">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.rarity === 'common' ? 'bg-gray-700 text-gray-300' :
                    item.rarity === 'uncommon' ? 'bg-green-700 text-green-300' :
                    item.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
                    item.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
                    'bg-yellow-700 text-yellow-300'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-2">{item.effect}</p>
              {item.obtained && (
                <p className="text-xs text-gray-500">
                  Obtained: {new Date(item.obtained).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-400" />
        Dungeon Achievements
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries({
          first_dungeon: { name: 'Dungeon Explorer', desc: 'Complete your first dungeon', reward: '200 XP + 25 Tokens' },
          boss_slayer: { name: 'Boss Slayer', desc: 'Defeat your first dungeon boss', reward: '300 XP + 40 Tokens' },
          shame_master: { name: 'Master of Shame', desc: 'Clear Caves of Shame 3 times', reward: '500 XP + 60 Tokens' },
          obedience_adept: { name: 'Obedience Adept', desc: 'Clear Temple of Obedience', reward: '750 XP + 80 Tokens' },
          dream_walker: { name: 'Dream Walker', desc: 'Clear Labyrinth of Dreams', reward: '1000 XP + 100 Tokens' },
          dungeon_master: { name: 'Dungeon Master', desc: 'Clear all dungeons at least once', reward: '2000 XP + 200 Tokens' }
        }).map(([id, achievement]) => {
          const isUnlocked = achievements.includes(id);
          return (
            <div 
              key={id}
              className={`bg-black bg-opacity-40 rounded-lg p-4 border ${
                isUnlocked ? 'border-yellow-600 bg-yellow-900 bg-opacity-20' : 'border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Trophy className={`w-6 h-6 ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`} />
                <h3 className={`font-bold ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {achievement.name}
                </h3>
                {isUnlocked && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
              </div>
              <p className={`text-sm mb-2 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {achievement.desc}
              </p>
              <p className={`text-xs ${isUnlocked ? 'text-yellow-300' : 'text-gray-600'}`}>
                Reward: {achievement.reward}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <QuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Castle className="w-12 h-12 text-yellow-400" />
              <div>
                <h1 className="text-4xl font-bold text-white">🏰 Dungeons & Trials</h1>
                <p className="text-gray-300">Explore dark caverns and face your deepest fears</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-700">
              {[
                { id: 'dungeons', label: 'Dungeons', icon: Castle },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'achievements', label: 'Achievements', icon: Trophy }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedView(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 ${
                    selectedView === id
                      ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900 bg-opacity-30'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800 hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {selectedView === 'dungeons' && renderDungeonsList()}
          {selectedView === 'inventory' && renderInventory()}
          {selectedView === 'achievements' && renderAchievements()}
        </div>
      </div>
    </QuestLayout>
  );
}