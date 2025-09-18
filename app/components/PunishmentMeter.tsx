'use client';

import { useShame } from '../hooks/useShame';
import { useSpring, animated } from '@react-spring/web';

export default function PunishmentMeter() {
  const { shame } = useShame();

  // Simple filth calculation
  const filthLevel = Math.min(100, 
    (shame.pantiesSniffed * 0.5) + 
    (shame.ritualsFailed * 5) + 
    (shame.dirtyTokensBurned * 1)
  );

  const { width } = useSpring({
    from: { width: '0%' },
    to: { width: `${filthLevel}%` },
    config: { duration: 1000 },
  });

  const getBarColor = () => {
    if (filthLevel > 80) return 'bg-red-500';
    if (filthLevel > 50) return 'bg-orange-500';
    return 'bg-pink-500';
  };

  return (
    <div className="bg-gradient-to-b from-[#1a0c2e] to-[#0e0517] border border-pink-500/30 rounded-2xl p-6 shadow-lg shadow-black/50">
      <h2 className="text-2xl font-bold text-pink-200 mb-4 text-center tracking-widest uppercase">Punishment Meter</h2>
      <div className="w-full bg-slate-900/50 rounded-full h-8 border-2 border-slate-700 shadow-inner">
        <animated.div
          className={`h-full rounded-full ${getBarColor()} transition-colors duration-500`}
          style={{
            width,
            boxShadow: `0 0 15px ${getBarColor().replace('bg-', 'rgba(').replace('-500', ', 0.7)')}`
          }}
        />
      </div>
      <div className="text-center mt-3 text-white font-bold text-2xl drop-shadow-[0_0_8px_#fff]">
        {filthLevel.toFixed(0)}% Filth
      </div>
    </div>
  );
}
