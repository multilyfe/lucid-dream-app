'use client';

import { type Companion } from '../lib/companions';
import { animated, useSpring } from '@react-spring/web';

type EvolutionPathProps = {
  companion: Companion;
};

export default function EvolutionPath({ companion }: EvolutionPathProps) {
  const unlockedForms = companion.evolutionTree.filter(form => companion.level >= form.unlockLevel);
  const lockedForms = companion.evolutionTree.filter(form => companion.level < form.unlockLevel);

  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 60 },
  });

  return (
    <animated.div style={springProps} className="themed-card p-6">
      <h3 className="text-2xl font-bold mb-4 text-amber-300 text-shadow-amber">Evolution Path</h3>
      <div className="space-y-4">
        {unlockedForms.map((form, index) => (
          <div key={form.id} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${form.id === companion.currentForm ? 'bg-green-500/20 border border-green-400/50' : 'bg-slate-800/50'}`}>
            <span className="text-3xl">{form.icon ?? '❔'}</span>
            <div>
              <p className="font-semibold text-lg">{form.name}</p>
              <p className="text-sm text-slate-400">Unlocked at Level {form.unlockLevel}</p>
            </div>
            {form.id === companion.currentForm && (
              <span className="ml-auto text-xs font-bold text-green-300 bg-green-800/70 px-2 py-1 rounded-full">ACTIVE</span>
            )}
          </div>
        ))}
        {lockedForms.map((form, index) => (
          <div key={form.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/60 opacity-60">
            <span className="text-3xl filter grayscale">❓</span>
            <div>
              <p className="font-semibold text-lg text-slate-500">{form.name}</p>
              <p className="text-sm text-slate-600">Unlocks at Level {form.unlockLevel}</p>
            </div>
          </div>
        ))}
      </div>
    </animated.div>
  );
}
