'use client';

import { type Companion, getActiveForm } from '../lib/companions';
import { animated, useSpring } from '@react-spring/web';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type CompanionDetailProps = {
  companion: Companion;
};

const levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];
const xpNeededForLevel = (level: number) => levelThresholds[level] ?? Infinity;

export default function CompanionDetail({ companion }: CompanionDetailProps) {
  const activeForm = getActiveForm(companion);
  const neededForNextLevel = xpNeededForLevel(companion.level + 1);
  const xpProgress = neededForNextLevel === Infinity ? 100 : Math.round((companion.xp / neededForNextLevel) * 100);

  const bondAnimation = useSpring({ from: { width: '0%' }, to: { width: `${companion.bond}%` } });
  const xpAnimation = useSpring({ from: { width: '0%' }, to: { width: `${xpProgress}%` } });

  const chartData = [
    { name: 'Level', value: companion.level, fill: '#8884d8' },
    { name: 'Bond', value: companion.bond, fill: '#82ca9d' },
  ];

  return (
    <div className="themed-card p-6 flex flex-col gap-6 h-full">
      <header className="flex items-start gap-4">
        <div className="text-5xl">{activeForm?.icon ?? '❔'}</div>
        <div>
          <h2 className="text-3xl font-bold">{companion.name}</h2>
          <p className="text-lg text-amber-300">{activeForm?.name ?? 'Unknown Form'}</p>
        </div>
      </header>

      <p className="text-slate-400 italic">{companion.lore}</p>

      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="font-bold text-lg">Level {companion.level}</span>
          <span className="text-sm text-slate-400">{companion.xp} / {neededForNextLevel === Infinity ? 'MAX' : neededForNextLevel} XP</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600">
          <animated.div
            className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full"
            style={xpAnimation}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="font-bold text-lg">Bond</span>
          <span className="text-sm text-slate-400">{companion.bond} / 100</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden border border-slate-600">
          <animated.div
            className="bg-gradient-to-r from-pink-400 to-rose-500 h-full rounded-full"
            style={bondAnimation}
          />
        </div>
      </div>

      {activeForm?.buff && (
        <div>
          <h4 className="font-bold text-lg mb-2">Active Buff</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeForm.buff).map(([key, value]) => (
              <div key={key} className="tag-chip text-sm">
                {key}: +{((value ?? 1) * 100 - 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
