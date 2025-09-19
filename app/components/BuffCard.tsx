'use client';

import { useState } from 'react';
import { Buff, ExpiredBuff, useBuffs } from '../hooks/useBuffs';

interface BuffCardProps {
  buff: Buff | ExpiredBuff;
  isActive?: boolean;
  showTimer?: boolean;
  onRemove?: (id: string) => void;
}

export function BuffCard({ buff, isActive = true, showTimer = true, onRemove }: BuffCardProps) {
  const { getTimeRemaining, getFormattedTimeRemaining } = useBuffs();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isActiveBuff = 'expiresAt' in buff;
  const timeRemaining = isActiveBuff ? getTimeRemaining(buff as Buff) : 0;
  const formattedTime = isActiveBuff ? getFormattedTimeRemaining(buff as Buff) : 'Expired';
  
  const isExpiringSoon = timeRemaining > 0 && timeRemaining < 300000; // 5 minutes
  const isAboutToExpire = timeRemaining > 0 && timeRemaining < 60000; // 1 minute

  const rarityStyles = {
    common: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
    uncommon: 'bg-green-600/20 text-green-400 border-green-600/30',
    rare: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    epic: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
    legendary: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
  };

  const typeStyles = {
    buff: {
      bg: 'bg-green-600/10',
      border: 'border-green-600/30',
      text: 'text-green-400',
      icon: '↑'
    },
    curse: {
      bg: 'bg-red-600/10',
      border: 'border-red-600/30', 
      text: 'text-red-400',
      icon: '↓'
    }
  };

  const style = typeStyles[buff.type];

  return (
    <div 
      className={`relative ${style.bg} border ${style.border} rounded-lg p-3 transition-all duration-200 ${
        !isActive ? 'opacity-60 grayscale' : ''
      } ${isAboutToExpire ? 'animate-pulse' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Content */}
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{buff.icon}</span>
            <span className={`font-medium ${style.text}`}>{buff.name}</span>
            <span className="text-xs">{style.icon}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${rarityStyles[buff.rarity]}`}>
              {buff.rarity}
            </span>
            {onRemove && isActive && (
              <button
                onClick={() => onRemove(buff.id)}
                className="text-gray-400 hover:text-red-400 transition-colors text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="text-xs text-gray-300">{buff.desc}</div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">from {buff.source}</span>
          {showTimer && isActive && (
            <span className={`font-mono ${
              isAboutToExpire ? 'text-red-400' :
              isExpiringSoon ? 'text-yellow-400' :
              style.text
            }`}>
              {formattedTime}
            </span>
          )}
          {!isActive && (
            <span className="text-gray-500">expired</span>
          )}
        </div>

        {/* Progress Bar for Active Buffs */}
        {showTimer && isActive && isActiveBuff && (
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-1000 ${
                isAboutToExpire ? 'bg-red-400' :
                isExpiringSoon ? 'bg-yellow-400' :
                buff.type === 'buff' ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{
                width: `${Math.max(0, (timeRemaining / (buff as Buff).durationMs) * 100)}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-3 min-w-64 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-lg">{buff.icon}</span>
              <span className={`font-semibold ${style.text}`}>{buff.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${rarityStyles[buff.rarity]}`}>
                {buff.rarity}
              </span>
            </div>
            
            <div className="text-xs text-gray-300">{buff.desc}</div>
            
            <div className="space-y-1 text-xs">
              <div className="text-gray-400">Source: <span className="text-white">{buff.source}</span></div>
              <div className="text-gray-400">Duration: <span className="text-white">{buff.duration}</span></div>
              {isActiveBuff && (
                <div className="text-gray-400">
                  Remaining: <span className={`${style.text} font-mono`}>{formattedTime}</span>
                </div>
              )}
            </div>

            {/* Effects Details */}
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-400 mb-1">Effects:</div>
              <div className="space-y-1">
                {Object.entries(buff.effects).map(([key, value]) => (
                  <div key={key} className="text-xs flex justify-between">
                    <span className="text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <span className={`font-mono ${style.text}`}>
                      {typeof value === 'number' && key.includes('Multiplier') 
                        ? `${((value - 1) * 100).toFixed(0)}%`
                        : typeof value === 'number' && value > 0
                        ? `+${value}`
                        : value
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

// Compact version for smaller displays
export function CompactBuffCard({ buff, isActive = true }: { buff: Buff | ExpiredBuff; isActive?: boolean }) {
  const { getFormattedTimeRemaining } = useBuffs();
  const formattedTime = isActive && 'expiresAt' in buff ? getFormattedTimeRemaining(buff as Buff) : '';
  
  const typeStyles = {
    buff: 'bg-green-600/20 border-green-600/50 text-green-400',
    curse: 'bg-red-600/20 border-red-600/50 text-red-400'
  };

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded border text-xs ${typeStyles[buff.type]} ${
      !isActive ? 'opacity-60 grayscale' : ''
    }`}>
      <span>{buff.icon}</span>
      <span className="font-medium">{buff.name}</span>
      {isActive && formattedTime && (
        <span className="font-mono text-xs">({formattedTime})</span>
      )}
    </div>
  );
}