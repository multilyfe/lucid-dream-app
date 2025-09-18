'use client';

import { type Achievement } from '../lib/achievements';
import { useSpring, animated } from '@react-spring/web';

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Shame':
      return {
        borderColor: '#ff007f',
        shadowColor: 'rgba(255, 0, 127, 0.6)',
        icon: '😳',
      };
    case 'Dungeon':
      return {
        borderColor: '#4b0082',
        shadowColor: 'rgba(75, 0, 130, 0.6)',
        icon: '🕷️',
      };
    case 'Companion':
      return {
        borderColor: '#00ffff',
        shadowColor: 'rgba(0, 255, 255, 0.6)',
        icon: '🎭',
      };
    case 'Ritual':
        return {
            borderColor: '#ff4500',
            shadowColor: 'rgba(255, 69, 0, 0.6)',
            icon: '🔒',
        };
    default:
      return {
        borderColor: '#a9a9a9',
        shadowColor: 'rgba(169, 169, 169, 0.5)',
        icon: '🏆',
      };
  }
};

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { unlocked, secret, title, desc, date, category } = achievement;
  const style = getCategoryStyle(category);

  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 220, friction: 20 },
  });

  if (secret && !unlocked) {
    return (
      <animated.div
        style={cardAnimation}
        className="relative flex flex-col items-center justify-center h-full p-4 text-center bg-black/70 border-2 border-dashed border-slate-600 rounded-2xl shadow-lg"
      >
        <div className="text-6xl animate-pulse">❓</div>
        <div className="mt-2 text-lg font-semibold text-slate-400">Secret Achievement</div>
        <div className="absolute top-2 right-2 text-2xl text-yellow-400 animate-pulse">🔒</div>
      </animated.div>
    );
  }

  return (
    <animated.div
      style={{
        ...cardAnimation,
        borderColor: style.borderColor,
        boxShadow: unlocked ? `0 0 20px ${style.shadowColor}` : 'none',
      }}
      className={`relative flex flex-col h-full p-4 bg-slate-900/70 border-2 rounded-2xl transition-all duration-300 ${unlocked ? '' : 'opacity-60'}`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="text-3xl">{style.icon}</div>
      </div>
      <p className="mt-2 text-sm text-slate-300 flex-grow">{desc}</p>
      {unlocked && date && (
        <div className="mt-4 text-xs text-slate-400 self-end">
          Unlocked: {new Date(date).toLocaleDateString()}
        </div>
      )}
      {!unlocked && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-4xl text-white/80">🔒</div>}
    </animated.div>
  );
}
