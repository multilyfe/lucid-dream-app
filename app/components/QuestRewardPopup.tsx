import React, { useState, useEffect } from 'react';
import { Quest, QuestRewards } from '../lib/quests';

interface QuestRewardPopupProps {
  quest: Quest;
  rewards: QuestRewards;
  onClose: () => void;
  show: boolean;
}

export const QuestRewardPopup: React.FC<QuestRewardPopupProps> = ({
  quest,
  rewards,
  onClose,
  show
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setTimeout(() => setAnimationPhase('visible'), 100);
    } else {
      setAnimationPhase('exiting');
      setTimeout(() => {
        setIsVisible(false);
        setAnimationPhase('entering');
      }, 300);
    }
  }, [show]);

  const handleClose = () => {
    setAnimationPhase('exiting');
    setTimeout(onClose, 300);
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'xp': return '⭐';
      case 'achievement': return '🏆';
      case 'title': return '👑';
      case 'items': return '📦';
      case 'obedience': return '💖';
      case 'shame': return '😳';
      case 'buffs': return '✨';
      case 'curses': return '💀';
      default: return '🎁';
    }
  };

  const getQuestTypeGradient = (type: string) => {
    return type === 'dream'
      ? 'from-cyan-900/95 via-blue-900/95 to-purple-900/95'
      : 'from-pink-900/95 via-purple-900/95 to-fuchsia-900/95';
  };

  const getQuestTypeBorder = (type: string) => {
    return type === 'dream'
      ? 'border-cyan-400/50'
      : 'border-pink-400/50';
  };

  const getQuestTypeShadow = (type: string) => {
    return type === 'dream'
      ? 'shadow-[0_0_60px_rgba(6,182,212,0.4)]'
      : 'shadow-[0_0_60px_rgba(244,114,182,0.4)]';
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        animationPhase === 'visible' ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-gradient-to-br ${getQuestTypeGradient(quest.type)} border ${getQuestTypeBorder(quest.type)} rounded-2xl p-8 max-w-lg w-full text-center ${getQuestTypeShadow(quest.type)} transition-all duration-300 transform ${
          animationPhase === 'visible' ? 'scale-100 rotate-0' : 'scale-75 rotate-3'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Animation */}
        <div className="relative mb-6">
          <div className={`text-8xl mb-4 transition-all duration-500 ${
            animationPhase === 'visible' ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
          }`}>
            🏆
          </div>
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute text-2xl transition-all duration-1000 ${
                  animationPhase === 'visible' ? 'opacity-100 -translate-y-5' : 'opacity-0 translate-y-0'
                }`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 2) * 30}%`,
                  transitionDelay: `${i * 100}ms`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        </div>

        {/* Quest Complete Header */}
        <div className="mb-6">
          <h3 className={`text-3xl font-bold mb-2 ${
            quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
          }`}>
            Quest Complete!
          </h3>
          <h4 className={`text-xl mb-2 ${
            quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
          }`}>
            {quest.title}
          </h4>
          <p className={`text-sm ${
            quest.type === 'dream' ? 'text-cyan-300' : 'text-pink-300'
          }`}>
            {quest.desc}
          </p>
        </div>

        {/* Rewards List */}
        <div className="space-y-4 mb-8">
          <h5 className={`text-lg font-semibold ${
            quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
          }`}>
            Rewards Earned
          </h5>
          
          <div className="space-y-3">
            {rewards.xp && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('xp')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Experience Points
                  </span>
                </div>
                <span className={`text-xl font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  +{rewards.xp} XP
                </span>
              </div>
            )}

            {rewards.achievement && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('achievement')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Achievement Unlocked
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  {rewards.achievement}
                </span>
              </div>
            )}

            {rewards.title && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('title')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Title Earned
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  {rewards.title}
                </span>
              </div>
            )}

            {rewards.items && rewards.items.length > 0 && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('items')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Items Received
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  {rewards.items.length} items
                </span>
              </div>
            )}

            {rewards.obedience && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('obedience')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Obedience Points
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  +{rewards.obedience}
                </span>
              </div>
            )}

            {rewards.shame && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('shame')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Shame Points
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  +{rewards.shame}
                </span>
              </div>
            )}

            {rewards.buffs && rewards.buffs.length > 0 && (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${
                quest.type === 'dream' 
                  ? 'border-cyan-400/30 bg-cyan-500/10' 
                  : 'border-pink-400/30 bg-pink-500/10'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getRewardIcon('buffs')}</span>
                  <span className={`font-medium ${
                    quest.type === 'dream' ? 'text-cyan-200' : 'text-pink-200'
                  }`}>
                    Buffs Applied
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  quest.type === 'dream' ? 'text-cyan-100' : 'text-pink-100'
                }`}>
                  {rewards.buffs.length} buffs
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleClose}
            className={`px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
              quest.type === 'dream'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white'
            } shadow-lg`}
          >
            Collect Rewards
          </button>
        </div>

        {/* Quest Type Indicator */}
        <div className={`mt-6 text-sm ${
          quest.type === 'dream' ? 'text-cyan-400' : 'text-pink-400'
        }`}>
          {quest.type === 'dream' ? '🌙 Dream Quest' : '🌸 IRL Quest'} • {quest.category}
        </div>
      </div>
    </div>
  );
};