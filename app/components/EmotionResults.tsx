'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionEngine, type EmotionAnalysis, type BuffReward } from '../hooks/useEmotionEngine';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import { useBuffs } from '../hooks/useBuffs';

interface BuffCardProps {
  buff: BuffReward;
  index: number;
  onReveal?: () => void;
}

const BuffCard: React.FC<BuffCardProps> = ({ buff, index, onReveal }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    onReveal?.();
  };

  const tierColors = {
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
    forbidden: 'from-red-500 to-pink-600'
  };

  const tierGlow = {
    uncommon: 'shadow-green-400/50',
    rare: 'shadow-blue-400/50',
    epic: 'shadow-purple-400/50',
    legendary: 'shadow-yellow-400/50',
    forbidden: 'shadow-red-500/50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -90 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        delay: index * 0.3,
        duration: 0.8,
        type: "spring",
        stiffness: 100
      }}
      className="relative perspective-1000"
    >
      <motion.div
        className={`relative w-64 h-96 rounded-xl cursor-pointer ${!isRevealed ? 'bg-gradient-to-br from-gray-800 to-gray-900' : `bg-gradient-to-br ${tierColors[buff.tier]}`} border-2 ${!isRevealed ? 'border-gray-600' : 'border-white/30'} shadow-xl ${isRevealed ? tierGlow[buff.tier] : ''} transition-all duration-500`}
        whileHover={{ scale: 1.05, rotateY: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={!isRevealed ? handleReveal : undefined}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Card Back */}
        <AnimatePresence>
          {!isRevealed && (
            <motion.div
              initial={{ rotateY: 0 }}
              exit={{ rotateY: 180 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-white"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-6xl mb-4">🎴</div>
              <div className="text-xl font-bold mb-2">Buff Reward</div>
              <div className="text-sm opacity-60">Click to reveal</div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Front */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ rotateY: -180 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 p-6 flex flex-col text-white"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Tier Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-black/30 ${buff.tier === 'forbidden' ? 'text-red-300' : 'text-white'}`}>
                {buff.tier.toUpperCase()}
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4 text-center">{buff.icon}</div>

              {/* Name */}
              <h3 className="text-xl font-bold mb-2 text-center">{buff.name}</h3>

              {/* Duration */}
              <div className="text-sm opacity-80 mb-4 text-center">
                Duration: {buff.duration}h
              </div>

              {/* Description */}
              <p className="text-sm opacity-90 mb-4 text-center flex-grow">
                {buff.description}
              </p>

              {/* Effects */}
              <div className="space-y-1">
                {Object.entries(buff.effects).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="opacity-80 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-bold">
                      {typeof value === 'number' && key.includes('Multiplier') 
                        ? `${value}x` 
                        : typeof value === 'number' && key.includes('Bonus')
                        ? `+${value}%`
                        : `${value}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sparkle Effects */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

interface EmotionResultsProps {
  analysis: EmotionAnalysis;
  onClose?: () => void;
  onAccept?: () => void;
}

export const EmotionResults: React.FC<EmotionResultsProps> = ({ 
  analysis, 
  onClose, 
  onAccept 
}) => {
  const { applyBuff } = useBuffs();
  const [allBuffsRevealed, setAllBuffsRevealed] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  const handleBuffReveal = () => {
    const newCount = revealedCount + 1;
    setRevealedCount(newCount);
    if (newCount >= analysis.buffsEarned.length) {
      setTimeout(() => setAllBuffsRevealed(true), 500);
    }
  };

  const handleAcceptRewards = () => {
    // Apply all buffs
    analysis.buffsEarned.forEach(buff => {
      applyBuff({
        id: buff.id,
        name: buff.name,
        description: buff.description,
        icon: buff.icon,
        duration: buff.duration * 3600 * 1000, // Convert hours to milliseconds
        effects: buff.effects,
        tier: buff.tier
      });
    });

    onAccept?.();
  };

  const getIntensityColor = (intensity: string) => {
    const colors = {
      gentle: 'text-green-400',
      moderate: 'text-blue-400',
      intense: 'text-purple-400',
      overwhelming: 'text-yellow-400',
      transcendent: 'text-pink-400'
    };
    return colors[intensity as keyof typeof colors] || 'text-gray-400';
  };

  const getClimaxTypeColor = (type: string) => {
    const colors = {
      gentle: 'text-green-400',
      intense: 'text-blue-400',
      overwhelming: 'text-purple-400',
      transcendent: 'text-yellow-400',
      forbidden: 'text-red-400'
    };
    return colors[type as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
          >
            🌟 Simulation Complete! 🌟
          </motion.h2>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300"
          >
            Your consciousness programming session has been analyzed
          </motion.p>
        </div>

        {/* Scores Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{analysis.realismScore}</div>
            <div className="text-sm text-gray-400">Realism</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{analysis.emotionScore}</div>
            <div className="text-sm text-gray-400">Emotion</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">{analysis.climaxScore}</div>
            <div className="text-sm text-gray-400">Climax</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{analysis.companionBondScore}</div>
            <div className="text-sm text-gray-400">Bond</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{analysis.lucidImprintScore}</div>
            <div className="text-sm text-gray-400">Lucid Imprint</div>
          </div>
        </motion.div>

        {/* Analysis Details */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 text-purple-300">🎭 Emotion Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Intensity:</span>
                <span className={`font-bold capitalize ${getIntensityColor(analysis.emotionIntensity)}`}>
                  {analysis.emotionIntensity}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Climax Type:</span>
                <span className={`font-bold capitalize ${getClimaxTypeColor(analysis.climaxType)}`}>
                  {analysis.climaxType}
                </span>
              </div>
              {analysis.dominantEmotions.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400">Dominant Emotions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.dominantEmotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 text-pink-300">💫 Rewards Earned</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Experience:</span>
                <span className="font-bold text-green-400">+{analysis.xpReward} XP</span>
              </div>
              <div className="flex justify-between">
                <span>Buffs:</span>
                <span className="font-bold text-purple-400">{analysis.buffsEarned.length}</span>
              </div>
              {analysis.dreamTokens > 0 && (
                <div className="flex justify-between">
                  <span>Dream Tokens:</span>
                  <span className="font-bold text-yellow-400">+{analysis.dreamTokens}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Buff Cards */}
        {analysis.buffsEarned.length > 0 && (
          <div className="mb-8">
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
            >
              ✨ Buff Rewards Earned ✨
            </motion.h3>
            <div className="flex flex-wrap justify-center gap-6">
              {analysis.buffsEarned.map((buff, index) => (
                <BuffCard
                  key={buff.id}
                  buff={buff}
                  index={index}
                  onReveal={handleBuffReveal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
          >
            View Details
          </button>
          <motion.button
            onClick={handleAcceptRewards}
            disabled={!allBuffsRevealed && analysis.buffsEarned.length > 0}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${
              allBuffsRevealed || analysis.buffsEarned.length === 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={allBuffsRevealed || analysis.buffsEarned.length === 0 ? { scale: 1.05 } : {}}
            whileTap={allBuffsRevealed || analysis.buffsEarned.length === 0 ? { scale: 0.95 } : {}}
          >
            Accept Rewards
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};