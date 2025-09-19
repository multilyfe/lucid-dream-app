'use client';

import { useState } from 'react';
import { useBuffs } from '../hooks/useBuffs';
import { CompactBuffCard } from './BuffCard';
import { BuffTimerHandler } from './BuffTimerHandler';
import useHydrated from "../hooks/useHydrated";

interface BuffBarProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  compact?: boolean;
  showTimer?: boolean;
  maxVisible?: number;
  className?: string;
}

export function BuffBar({ 
  position = 'top', 
  compact = true, 
  showTimer = true, 
  maxVisible = 5,
  className = ''
}: BuffBarProps) {
  const hydrated = useHydrated();
  const { 
    activeBuffs, 
    activeCurses, 
    allActive, 
    buffCount, 
    curseCount,
    removeBuff 
  } = useBuffs();

  console.log('BuffBar Debug:', {
    hydrated,
    activeBuffs,
    activeCurses,
    allActive,
    buffCount,
    curseCount,
    totalActive: allActive?.length || 0
  });
  
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Handle buff expiration notifications
  const handleBuffExpired = (buffId: string, buffName: string) => {
    setNotifications(prev => [...prev, `${buffName} expired!`]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => !n.includes(buffName)));
    }, 3000);
  };

  const handleBuffExpiringSoon = (buffId: string, buffName: string, timeRemaining: number) => {
    const minutes = Math.floor(timeRemaining / 60000);
    if (minutes <= 1) {
      setNotifications(prev => [...prev, `${buffName} expires soon!`]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => !n.includes(buffName)));
      }, 2000);
    }
  };

  if (!hydrated) return <div className="text-red-500 text-xs">BuffBar: Not hydrated</div>;

  const visibleBuffs = showAll ? allActive : allActive.slice(0, maxVisible);
  const remainingCount = allActive.length - visibleBuffs.length;

  // Force show for debug - remove this later
  const forceShow = true;

  if (allActive.length === 0 && !forceShow) {
    return (
      <>
        <BuffTimerHandler 
          onBuffExpired={handleBuffExpired}
          onBuffExpiringSoon={handleBuffExpiringSoon}
        />
        {compact && (
          <div className={`text-xs text-gray-500 ${className}`}>
            No active effects
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <BuffTimerHandler 
        onBuffExpired={handleBuffExpired}
        onBuffExpiringSoon={handleBuffExpiringSoon}
      />
      
      {/* Notification Toast */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-yellow-600/90 text-yellow-100 px-4 py-2 rounded-lg shadow-lg animate-bounce"
            >
              ⚠️ {notification}
            </div>
          ))}
        </div>
      )}

      <div className="border-b border-slate-800/60 bg-slate-950/80 px-6 py-3 shadow-inner shadow-slate-900/60">
        <div className={`flex items-center space-x-2 ${className}`}>
          {/* Buff/Curse Count Summary */}
          {compact && (
            <div className="flex items-center space-x-1 text-xs">
              {buffCount > 0 && (
                <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
                  ↑{buffCount}
                </span>
              )}
              {curseCount > 0 && (
                <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">
                  ↓{curseCount}
                </span>
              )}
            </div>
          )}

          {/* Active Effects */}
          <div className="flex items-center space-x-1 flex-wrap">
            {visibleBuffs.map(effect => (
              <div key={effect.id} className="relative group">
                <CompactBuffCard buff={effect} isActive={true} />
                
                {/* Remove button on hover */}
                <button
                  onClick={() => removeBuff(effect.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Remove effect"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Show more button */}
            {remainingCount > 0 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs bg-gray-600/20 text-gray-400 px-2 py-1 rounded hover:bg-gray-600/30 transition-colors"
              >
                {showAll ? 'Show Less' : `+${remainingCount} more`}
              </button>
            )}
          </div>
        </div>
        
        {/* Debug Info - Remove later */}
        <div className="text-xs text-gray-500 ml-4">
          BuffBar Debug: {allActive?.length || 0} active, hydrated: {hydrated ? 'yes' : 'no'}
        </div>
      </div>
    </>
  );
}

// Full-width horizontal bar version
export function HorizontalBuffBar({ className = '' }: { className?: string }) {
  const hydrated = useHydrated();
  const { activeBuffs, activeCurses, buffCount, curseCount } = useBuffs();

  if (!hydrated) return null;

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border-y border-gray-700 p-2 ${className}`}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-gray-300">Active Effects:</div>
          
          {buffCount > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-green-400 text-sm">Buffs ({buffCount})</span>
              <div className="flex space-x-1">
                {activeBuffs.slice(0, 3).map(buff => (
                  <CompactBuffCard key={buff.id} buff={buff} />
                ))}
                {buffCount > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">+{buffCount - 3}</span>
                )}
              </div>
            </div>
          )}

          {curseCount > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-red-400 text-sm">Curses ({curseCount})</span>
              <div className="flex space-x-1">
                {activeCurses.slice(0, 3).map(curse => (
                  <CompactBuffCard key={curse.id} buff={curse} />
                ))}
                {curseCount > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">+{curseCount - 3}</span>
                )}
              </div>
            </div>
          )}

          {buffCount === 0 && curseCount === 0 && (
            <span className="text-gray-500 text-sm">No active effects</span>
          )}
        </div>

        <div className="text-xs text-gray-400">
          Total: {buffCount + curseCount} effects
        </div>
      </div>
    </div>
  );
}
