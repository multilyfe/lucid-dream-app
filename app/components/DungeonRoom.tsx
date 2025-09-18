'use client';

import { type DungeonRoom } from '../lib/dungeons';

type DungeonRoomStatus = 'idle' | 'rolling' | 'won' | 'lost' | 'fled';

type DungeonRoomProps = {
  room: DungeonRoom;
  status: DungeonRoomStatus;
  onAction: (action: 'fight' | 'continue' | 'flee') => void;
  lastRoll?: number | null;
};

const typeColors: Record<DungeonRoom['type'], string> = {
  encounter: 'from-purple-500/40 via-slate-500/30 to-slate-900/70',
  event: 'from-sky-500/40 via-indigo-500/30 to-slate-900/70',
  boss: 'from-rose-600/60 via-purple-600/50 to-black/70',
};

const statusText: Record<DungeonRoomStatus, string> = {
  idle: 'Awaiting decision',
  rolling: 'Rolling fate...',
  won: 'Victory!',
  lost: 'Defeat',
  fled: 'Retreated',
};

export function DungeonRoom({ room, status, onAction, lastRoll }: DungeonRoomProps) {
  const aura = typeColors[room.type];

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0a0113]/85 p-6 shadow-[0_0_50px_rgba(126,34,206,0.25)]`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${aura} opacity-40`}></div>
      <div className="relative z-10 space-y-5 text-slate-100">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-purple-200/80">
            {room.type === 'boss' ? 'Boss Encounter' : room.type === 'event' ? 'Dream Event' : 'Nightmare Encounter'}
          </p>
          <h2 className="text-xl font-semibold text-white drop-shadow-[0_0_14px_rgba(236,72,153,0.35)]">
            {room.desc}
          </h2>
        </header>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
          <p>{statusText[status]}</p>
          {lastRoll != null ? (
            <p className="mt-2 text-xs uppercase tracking-[0.35em] text-purple-200/70">Last roll · {lastRoll}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em]">
          {room.type === 'event' ? (
            <button
              type="button"
              onClick={() => onAction('continue')}
              className="rounded-full border border-sky-400/60 bg-sky-500/20 px-5 py-2 font-semibold text-sky-100 hover:bg-sky-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0113]"
            >
              Continue
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onAction('fight')}
                className="rounded-full border border-purple-400/70 bg-purple-500/20 px-5 py-2 font-semibold text-purple-100 hover:bg-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0113]"
              >
                {room.type === 'boss' ? 'Face Boss' : 'Fight'}
              </button>
              <button
                type="button"
                onClick={() => onAction('flee')}
                className="rounded-full border border-slate-500/60 bg-slate-800/60 px-5 py-2 font-semibold text-slate-200 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0113]"
              >
                Flee
              </button>
              <button
                type="button"
                onClick={() => onAction('continue')}
                className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-5 py-2 font-semibold text-emerald-100 hover:bg-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0113]"
              >
                Continue
              </button>
            </>
          )}
        </div>

        {room.loot?.length || room.xp ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.3em] text-slate-100">
            {room.xp ? <p>Reward · {room.xp} XP</p> : null}
            {room.loot && room.loot.length > 0 ? (
              <p>Loot · {room.loot.join(', ')}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DungeonRoom;
