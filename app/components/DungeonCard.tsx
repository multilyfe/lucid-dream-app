'use client';

import { useState } from 'react';
import { Castle, Crown, Lock, Star, Trophy, Sword, Shield, Gem } from 'lucide-react';
import { type Dungeon } from '../lib/dungeons';

interface DungeonCardProps {
  dungeon: Dungeon;
  onStartRun: (dungeonId: string) => void;
  isRunning?: boolean;
}

export function DungeonCard({ dungeon, onStartRun, isRunning }: DungeonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: number = 1) => {
    if (difficulty === 1) return 'text-green-400';
    if (difficulty === 2) return 'text-yellow-400';
    if (difficulty === 3) return 'text-red-400';
    return 'text-purple-400';
  };

  const getDifficultyText = (difficulty: number = 1) => {
    if (difficulty === 1) return 'Easy';
    if (difficulty === 2) return 'Medium';
    if (difficulty === 3) return 'Hard';
    return 'Extreme';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getBackgroundClass = (background: string = 'cave') => {
    switch (background) {
      case 'cave': return 'from-stone-900 to-stone-800 border-stone-600';
      case 'temple': return 'from-purple-900 to-purple-800 border-purple-600';
      case 'dream': return 'from-indigo-900 to-indigo-800 border-indigo-600';
      default: return 'from-gray-900 to-gray-800 border-gray-600';
    }
  };

  if (!dungeon.unlocked) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-lg p-6 opacity-50">
        <div className="flex items-center gap-3 mb-3">
          <Lock className="w-6 h-6 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-500">Locked Dungeon</h3>
        </div>
        <p className="text-sm text-gray-600">Complete previous dungeons to unlock</p>
      </div>
    );
  }

  return (
    <div 
      className={`bg-gradient-to-br ${getBackgroundClass(dungeon.background)} border rounded-lg p-6 transition-all duration-300 cursor-pointer ${
        isHovered ? 'scale-105 shadow-2xl border-opacity-80' : 'border-opacity-50'
      } ${isRunning ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isRunning && onStartRun(dungeon.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Castle className="w-8 h-8 text-yellow-400" />
          <div>
            <h3 className="text-xl font-bold text-white">{dungeon.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${getDifficultyColor(dungeon.difficulty)}`}>
                {getDifficultyText(dungeon.difficulty)}
              </span>
              {dungeon.cleared && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Cleared {dungeon.timesCleared || 1}x</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isRunning && (
          <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            ACTIVE
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {dungeon.description}
      </p>

      {/* Boss Info */}
      {dungeon.boss && (
        <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-bold text-sm">Boss: {dungeon.boss.name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{dungeon.boss.health} HP</span>
            </div>
            <div className="flex items-center gap-1">
              <Sword className="w-3 h-3" />
              <span>{dungeon.boss.attacks.length} Attacks</span>
            </div>
          </div>
        </div>
      )}

      {/* Loot Preview */}
      {dungeon.lootPool && dungeon.lootPool.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Potential Loot</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {dungeon.lootPool.slice(0, 3).map((loot, index) => (
              <span 
                key={index}
                className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(loot.rarity)} bg-black bg-opacity-30`}
              >
                {loot.name}
              </span>
            ))}
            {dungeon.lootPool.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full border text-gray-400 bg-black bg-opacity-30">
                +{dungeon.lootPool.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Rewards */}
      {dungeon.boss && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Boss Rewards:</div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400">+{dungeon.boss.rewards.xp} XP</span>
            <span className="text-yellow-400">+{dungeon.boss.rewards.tokens} Tokens</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStartRun(dungeon.id);
        }}
        disabled={isRunning}
        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
          isRunning 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 active:scale-95'
        }`}
      >
        {isRunning ? 'Currently Running' : 'Enter Dungeon'}
      </button>

      {/* Progress Indicator */}
      {dungeon.cleared && (
        <div className="mt-3 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < (dungeon.timesCleared || 1) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}