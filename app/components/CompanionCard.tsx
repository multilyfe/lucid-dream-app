'use client';

import { type Companion, getActiveForm, xpNeededForLevel } from '../lib/companions';
import { animated, useSpring } from '@react-spring/web';

type CompanionCardProps = {
  companion: Companion;
  onSelect?: (companion: Companion) => void;
  isSelected?: boolean;
};

export default function CompanionCard({ companion, onSelect, isSelected }: CompanionCardProps) {
  const activeForm = getActiveForm(companion);
  const neededForNextLevel = xpNeededForLevel(companion.level + 1);
  const xpProgress = neededForNextLevel === Infinity ? 1 : (companion.xp / neededForNextLevel);

  const springProps = useSpring({
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    config: { tension: 300, friction: 20 },
  });

  const cardSpring = useSpring({
    transform: isSelected ? 'translateY(-5px) scale(1.03)' : 'translateY(0px) scale(1)',
    boxShadow: isSelected ? '0 10px 30px rgba(236, 72, 153, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.2)',
  });

  return (
    <animated.div
      style={{ ...springProps, ...cardSpring }}
      onClick={() => onSelect?.(companion)}
      className={`relative p-5 rounded-2xl cursor-pointer border ${isSelected ? 'border-pink-400' : 'border-slate-700'} bg-slate-800/50 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-4">
        <div className="text-4xl">{activeForm?.icon ?? '❔'}</div>
        <div className="flex-grow">
          <div className="flex justify-between items-baseline">
            <h3 className="text-xl font-bold">{companion.name}</h3>
            <span className="font-bold text-lg text-amber-300">Lvl {companion.level}</span>
          </div>
          <p className="text-sm text-slate-400">{activeForm?.name}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
          <animated.div
            className="bg-gradient-to-r from-sky-400 to-blue-500 h-full"
            style={{ width: `${xpProgress * 100}%` }}
          />
        </div>
      </div>
    </animated.div>
  );
}
