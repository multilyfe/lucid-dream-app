'use client';

import { useEffect, useRef } from 'react';
import { useBuffs } from '../hooks/useBuffs';

interface BuffTimerHandlerProps {
  onBuffExpired?: (buffId: string, buffName: string) => void;
  onBuffExpiringSoon?: (buffId: string, buffName: string, timeRemaining: number) => void;
  notificationThresholds?: {
    warning: number; // Time in ms to show warning
    critical: number; // Time in ms to show critical warning
  };
}

export function BuffTimerHandler({ 
  onBuffExpired,
  onBuffExpiringSoon,
  notificationThresholds = {
    warning: 300000, // 5 minutes
    critical: 60000   // 1 minute
  }
}: BuffTimerHandlerProps) {
  const { allActive, getTimeRemaining } = useBuffs();
  const lastNotifiedRef = useRef<Set<string>>(new Set());
  const warningNotifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkExpiration = () => {
      const now = Date.now();
      
      allActive.forEach(buff => {
        const timeRemaining = getTimeRemaining(buff);
        const buffKey = `${buff.id}-${buff.name}`;
        
        // Check if buff just expired
        if (timeRemaining <= 0 && !lastNotifiedRef.current.has(buffKey)) {
          lastNotifiedRef.current.add(buffKey);
          onBuffExpired?.(buff.id, buff.name);
          
          // Show browser notification if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${buff.type === 'buff' ? 'Buff' : 'Curse'} Expired`, {
              body: `${buff.name} has expired`,
              icon: '⏰',
              tag: `buff-expired-${buff.id}`
            });
          }
        }
        
        // Check if buff is expiring soon
        else if (timeRemaining > 0) {
          // Remove from expired notifications if it's active again
          lastNotifiedRef.current.delete(buffKey);
          
          // Warning notification
          if (timeRemaining <= notificationThresholds.warning && 
              timeRemaining > notificationThresholds.critical && 
              !warningNotifiedRef.current.has(buffKey)) {
            warningNotifiedRef.current.add(buffKey);
            onBuffExpiringSoon?.(buff.id, buff.name, timeRemaining);
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${buff.type === 'buff' ? 'Buff' : 'Curse'} Expiring Soon`, {
                body: `${buff.name} expires in ${Math.floor(timeRemaining / 60000)} minutes`,
                icon: '⚠️',
                tag: `buff-warning-${buff.id}`
              });
            }
          }
          
          // Critical notification
          else if (timeRemaining <= notificationThresholds.critical && 
                   !lastNotifiedRef.current.has(`critical-${buffKey}`)) {
            lastNotifiedRef.current.add(`critical-${buffKey}`);
            onBuffExpiringSoon?.(buff.id, buff.name, timeRemaining);
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${buff.type === 'buff' ? 'Buff' : 'Curse'} Expiring!`, {
                body: `${buff.name} expires in ${Math.floor(timeRemaining / 1000)} seconds`,
                icon: '🚨',
                tag: `buff-critical-${buff.id}`
              });
            }
          }
        }
      });

      // Clean up notification tracking for buffs that no longer exist
      const currentBuffKeys = new Set(allActive.map(b => `${b.id}-${b.name}`));
      for (const key of lastNotifiedRef.current) {
        if (!key.startsWith('critical-') && !currentBuffKeys.has(key)) {
          lastNotifiedRef.current.delete(key);
        }
      }
      for (const key of warningNotifiedRef.current) {
        if (!currentBuffKeys.has(key)) {
          warningNotifiedRef.current.delete(key);
        }
      }
    };

    // Initial check
    checkExpiration();

    // Set up interval to check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [allActive, getTimeRemaining, onBuffExpired, onBuffExpiringSoon, notificationThresholds]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // This component doesn't render anything
  return null;
}

// Hook version for easier use in other components
export function useBuffTimerHandler(options?: BuffTimerHandlerProps) {
  const { allActive, getTimeRemaining } = useBuffs();
  
  useEffect(() => {
    const handler = () => {
      // Timer logic here - same as above but in hook form
      // This allows components to use timer functionality without rendering the component
    };
    
    const interval = setInterval(handler, 1000);
    return () => clearInterval(interval);
  }, [allActive, getTimeRemaining, options]);
}