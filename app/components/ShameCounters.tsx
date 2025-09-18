'use client';

import { useShame } from '../hooks/useShame';
import { useSpring, animated } from '@react-spring/web';

const ShameCounterCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <div className="bg-[#2c1b47]/60 border border-[#ff007f]/50 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(255,0,127,0.5)] transition-all hover:shadow-[0_0_30px_rgba(255,0,127,0.8)] hover:scale-105">
      <div className="text-5xl drop-shadow-[0_0_5px_rgba(255,0,127,0.7)]">{icon}</div>
      <animated.div className="text-4xl font-bold text-white mt-2">
        {number.to(n => n.toFixed(0))}
      </animated.div>
      <div className="text-pink-200 uppercase tracking-widest mt-1">{title}</div>
    </div>
  );
};

export default function ShameCounters() {
  const { shame } = useShame();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ShameCounterCard title="Panties Sniffed" value={shame.pantiesSniffed} icon="🩲" />
      <ShameCounterCard title="Rituals Failed" value={shame.ritualsFailed} icon="💀" />
      <ShameCounterCard title="Dirty Tokens Burned" value={shame.dirtyTokensBurned} icon="🔥" />
    </div>
  );
}
