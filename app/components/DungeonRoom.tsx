'use client';

import { useState } from 'react';
import { 
  Scroll, 
  Sword, 
  Gem, 
  Crown, 
  ChevronRight, 
  Flame, 
  Shield, 
  Heart,
  Brain,
  Eye,
  Puzzle,
  Trophy,
  X
} from 'lucide-react';
import { type DungeonRoom, type Dungeon } from '../lib/dungeons';

interface DungeonRoomProps {
  room: DungeonRoom;
  dungeon: Dungeon;
  roomIndex: number;
  totalRooms: number;
  onComplete: (success: boolean, input?: string) => void;
  onAbandon: () => void;
}

export function DungeonRoom({ 
  room, 
  dungeon, 
  roomIndex, 
  totalRooms, 
  onComplete,
  onAbandon 
}: DungeonRoomProps) {
  const [userInput, setUserInput] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getTypeIcon = () => {
    switch (room.type) {
      case 'trial': return <Scroll className="w-6 h-6" />;
      case 'loot': return <Gem className="w-6 h-6" />;
      case 'boss': return <Crown className="w-6 h-6" />;
      default: return <Scroll className="w-6 h-6" />;
    }
  };

  const getSubtypeIcon = () => {
    switch (room.subtype) {
      case 'shame': return <Heart className="w-5 h-5 text-red-400" />;
      case 'obedience': return <Shield className="w-5 h-5 text-purple-400" />;
      case 'combat': return <Sword className="w-5 h-5 text-orange-400" />;
      case 'ritual': return <Flame className="w-5 h-5 text-blue-400" />;
      case 'psychic': return <Brain className="w-5 h-5 text-pink-400" />;
      case 'puzzle': return <Puzzle className="w-5 h-5 text-green-400" />;
      default: return null;
    }
  };

  const getTypeColor = () => {
    switch (room.type) {
      case 'trial': return 'from-purple-900 to-purple-800 border-purple-600';
      case 'loot': return 'from-yellow-900 to-yellow-800 border-yellow-600';
      case 'boss': return 'from-red-900 to-red-800 border-red-600';
      default: return 'from-gray-900 to-gray-800 border-gray-600';
    }
  };

  const handleTrialSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Validate input based on trial type
    let canProceed = false;
    switch (room.subtype) {
      case 'shame':
        canProceed = userInput.trim().length > 10;
        break;
      case 'obedience':
        canProceed = true; // Just requires acknowledgment
        break;
      case 'combat':
      case 'psychic':
      case 'puzzle':
      case 'ritual':
        canProceed = true; // Random success based on hook logic
        break;
      default:
        canProceed = false;
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onComplete(canProceed, userInput);
    setIsProcessing(false);
  };

  const handleBossFight = async (strategy: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Simulate boss fight processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onComplete(true, strategy);
    setIsProcessing(false);
  };

  const handleLootCollection = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Simulate loot collection
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onComplete(true);
    setIsProcessing(false);
  };

  const renderTrialContent = () => (
    <div className="space-y-6">
      {/* Trial Description */}
      <div className="bg-black bg-opacity-40 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          {getSubtypeIcon()}
          <h3 className="text-lg font-bold text-white capitalize">
            {room.subtype} Trial
          </h3>
        </div>
        <p className="text-gray-300 leading-relaxed">{room.desc}</p>
      </div>

      {/* Input Based on Trial Type */}
      {room.subtype === 'shame' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Your Confession (minimum 10 characters):
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Confess your shameful act to proceed..."
            className="w-full h-24 px-3 py-2 bg-black bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            disabled={isProcessing}
          />
          <div className="text-xs text-gray-500">
            {userInput.length}/10 characters minimum
          </div>
        </div>
      )}

      {room.subtype === 'obedience' && (
        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-600">
          <p className="text-purple-200 text-sm mb-3">
            You must submit to complete this trial. Click below to acknowledge your obedience.
          </p>
          <div className="text-center">
            <span className="text-purple-300 text-lg">🧎‍♀️</span>
          </div>
        </div>
      )}

      {['combat', 'psychic', 'puzzle', 'ritual'].includes(room.subtype || '') && (
        <div className="bg-orange-900 bg-opacity-30 rounded-lg p-4 border border-orange-600">
          <p className="text-orange-200 text-sm">
            This trial will test your skills. Success is not guaranteed - proceed with caution.
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleTrialSubmit}
        disabled={isProcessing || (room.subtype === 'shame' && userInput.length < 10)}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all duration-200"
      >
        {isProcessing ? 'Processing...' : 'Complete Trial'}
      </button>
    </div>
  );

  const renderBossContent = () => (
    <div className="space-y-6">
      {/* Boss Info */}
      <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-red-600">
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-red-400">{dungeon.boss?.name}</h3>
        </div>
        <p className="text-gray-300 mb-4">{room.desc}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Health:</span>
            <span className="text-red-400 ml-2 font-bold">{dungeon.boss?.health}</span>
          </div>
          <div>
            <span className="text-gray-400">Weakness:</span>
            <span className="text-yellow-400 ml-2 font-bold capitalize">{dungeon.boss?.weakness.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-gray-400 text-sm">Attacks:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {dungeon.boss?.attacks.map((attack, index) => (
              <span key={index} className="text-xs bg-red-900 bg-opacity-50 px-2 py-1 rounded-full text-red-300">
                {attack}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          Choose your strategy:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {['confession', 'ritual_offering', 'lucid_awareness', 'direct_combat'].map((strategy) => (
            <button
              key={strategy}
              onClick={() => setSelectedStrategy(strategy)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedStrategy === strategy
                  ? 'border-yellow-400 bg-yellow-900 bg-opacity-30 text-yellow-300'
                  : 'border-gray-600 bg-black bg-opacity-30 text-gray-300 hover:border-gray-500'
              }`}
              disabled={isProcessing}
            >
              <span className="font-medium capitalize">{strategy.replace('_', ' ')}</span>
              {strategy === dungeon.boss?.weakness && (
                <span className="ml-2 text-xs text-green-400">(Effective)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fight Button */}
      <button
        onClick={() => handleBossFight(selectedStrategy)}
        disabled={isProcessing || !selectedStrategy}
        className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-500 hover:to-orange-500 transition-all duration-200"
      >
        {isProcessing ? 'Fighting...' : 'Engage Boss'}
      </button>
    </div>
  );

  const renderLootContent = () => (
    <div className="space-y-6">
      {/* Loot Description */}
      <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-yellow-600">
        <div className="flex items-center gap-3 mb-3">
          <Gem className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-bold text-yellow-400">Treasure Chamber</h3>
        </div>
        <p className="text-gray-300">{room.desc}</p>
      </div>

      {/* Potential Loot Preview */}
      {dungeon.lootPool && dungeon.lootPool.length > 0 && (
        <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-600">
          <h4 className="text-yellow-300 font-medium mb-3">Possible Treasures:</h4>
          <div className="grid grid-cols-1 gap-2">
            {dungeon.lootPool.slice(0, 3).map((loot, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-black bg-opacity-30 rounded">
                <Gem className={`w-4 h-4 ${
                  loot.rarity === 'common' ? 'text-gray-400' :
                  loot.rarity === 'uncommon' ? 'text-green-400' :
                  loot.rarity === 'rare' ? 'text-blue-400' :
                  loot.rarity === 'epic' ? 'text-purple-400' :
                  'text-yellow-400'
                }`} />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">{loot.name}</span>
                  <div className="text-xs text-gray-400">{loot.effect}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  loot.rarity === 'common' ? 'bg-gray-700 text-gray-300' :
                  loot.rarity === 'uncommon' ? 'bg-green-700 text-green-300' :
                  loot.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
                  loot.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
                  'bg-yellow-700 text-yellow-300'
                }`}>
                  {loot.rarity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collect Button */}
      <button
        onClick={handleLootCollection}
        disabled={isProcessing}
        className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-500 hover:to-orange-500 transition-all duration-200"
      >
        {isProcessing ? 'Collecting...' : 'Collect Treasure'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTypeIcon()}
              <div>
                <h1 className="text-2xl font-bold text-white">{dungeon.name}</h1>
                <div className="text-sm text-gray-400">
                  Room {roomIndex + 1} of {totalRooms}
                </div>
              </div>
            </div>
            <button
              onClick={onAbandon}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
              title="Abandon Dungeon"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((roomIndex + 1) / totalRooms) * 100}%` }}
            />
          </div>
        </div>

        {/* Room Content */}
        <div className={`bg-gradient-to-br ${getTypeColor()} border rounded-lg p-6`}>
          {room.type === 'trial' && renderTrialContent()}
          {room.type === 'boss' && renderBossContent()}
          {room.type === 'loot' && renderLootContent()}
        </div>

        {/* Rewards Preview */}
        {room.rewards && (
          <div className="mt-6 bg-black bg-opacity-40 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium text-sm">Room Rewards</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {room.rewards.xp && <span className="text-green-400">+{room.rewards.xp} XP</span>}
              {room.rewards.tokens && <span className="text-yellow-400">+{room.rewards.tokens} Tokens</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DungeonRoom;
