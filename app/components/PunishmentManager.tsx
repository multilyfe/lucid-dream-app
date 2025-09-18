'use client';

import { usePunishments } from '../hooks/usePunishments';
import { useShame } from '../hooks/useShame';

export default function PunishmentManager() {
  const { punishments, activePunishments, assignPunishment, completePunishment } = usePunishments();
  const { shame } = useShame();

  const filthLevel = Math.min(100, (shame.pantiesSniffed * 0.5) + (shame.ritualsFailed * 5) + (shame.dirtyTokensBurned * 1));

  const handleAssignRandom = () => {
    const availablePunishments = punishments.filter(p => !activePunishments.some(ap => ap.id === p.id));
    if (availablePunishments.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePunishments.length);
      assignPunishment(availablePunishments[randomIndex].id);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-[#1a0c2e] to-black border border-red-500/30 rounded-2xl p-6 space-y-6 shadow-2xl shadow-red-500/10">
      <header>
        <h2 className="text-3xl font-bold text-red-300 tracking-wider" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>Punishment System</h2>
        <p className="text-sm text-red-200/70 mt-1">Your filth requires cleansing. Punishments are assigned based on your actions.</p>
      </header>

      <div>
        <h3 className="text-xl font-semibold text-red-200 mb-3 border-b border-red-500/20 pb-2">Active Punishments</h3>
        {activePunishments.length === 0 ? (
          <p className="text-sm text-slate-400 italic">You are currently absolved of your sins. For now.</p>
        ) : (
          <ul className="space-y-3">
            {activePunishments.map(p => (
              <li key={p.id} className="flex justify-between items-center bg-red-900/40 p-4 rounded-lg border border-red-500/30 shadow-md">
                <div>
                  <p className="font-semibold text-red-100">{p.name}</p>
                  <p className="text-xs text-slate-300">{p.description}</p>
                </div>
                <button
                  onClick={() => completePunishment(p.id)}
                  className="bg-green-500/20 text-green-200 px-3 py-1 rounded-md text-xs hover:bg-green-500/40 transition-colors"
                >
                  Absolve
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-red-200 mb-3 border-b border-red-500/20 pb-2">Available Punishments</h3>
        <p className="text-sm text-slate-400 mb-4">Punishments are automatically assigned when your filth level is high enough.</p>
        <button
          onClick={handleAssignRandom}
          disabled={filthLevel < 50}
          className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-6 py-3 rounded-lg shadow-lg hover:from-red-700 hover:to-rose-800 transition-all disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {filthLevel < 50 ? `Requires 50 Filth (Currently ${filthLevel.toFixed(0)})` : 'Force Random Punishment'}
        </button>
      </div>
    </div>
  );
}
