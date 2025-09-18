'use client';

import { useState } from 'react';
import { useShame } from '../../hooks/useShame';

export default function ConfessionLog() {
  const { shame, addConfession } = useShame();
  const [newConfession, setNewConfession] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddConfession = () => {
    if (newConfession.trim()) {
      addConfession(newConfession.trim());
      setNewConfession('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-black/50 border border-pink-500/30 rounded-2xl p-6" style={{
      background: 'url(/parchment.jpg) no-repeat center center',
      backgroundSize: 'cover',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7)',
    }}>
      <h2 className="text-2xl font-bold text-pink-200 mb-4">Confession Log</h2>
      <div className="max-h-64 overflow-y-auto space-y-4 pr-4">
        {shame.confessions.map(c => (
          <div key={c.id} className="p-3 bg-white/10 rounded-lg border border-white/20">
            <p className="text-white font-serif italic">"{c.text}"</p>
            <p className="text-right text-xs text-pink-300 mt-1">{new Date(c.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 w-full bg-pink-600/50 text-white font-bold py-2 px-4 rounded-lg border border-pink-400 hover:bg-pink-600/80 transition-colors"
      >
        + Add Confession
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-pink-500/50 w-full max-w-md">
            <h3 className="text-2xl font-bold text-pink-300 mb-4">Confess Your Sins</h3>
            <textarea
              value={newConfession}
              onChange={(e) => setNewConfession(e.target.value)}
              className="w-full h-40 bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="I have been a naughty sub..."
            />
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleAddConfession} className="bg-pink-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink-700 transition-colors">Confess</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
