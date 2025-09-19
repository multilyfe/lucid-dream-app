'use client';

import { type MapNode } from '../lib/map';
import { useRouter } from 'next/navigation';
import { useMap } from '../hooks/useMap';

interface MapDetailProps {
  node: MapNode;
  onClose: () => void;
}

const typeStyles: Record<MapNode['type'], { color: string; icon: string }> = {
  realm: { color: 'gold', icon: '👑' },
  temple: { color: '#67e8f9', icon: '🏛️' },
  dungeon: { color: '#f87171', icon: '💀' },
  panty: { color: '#f472b6', icon: '👙' },
};

export default function MapDetail({ node, onClose }: MapDetailProps) {
  const router = useRouter();
  const { attemptUnlockNode, checkUnlockCondition } = useMap();
  const style = typeStyles[node.type];

  const handleTeleport = () => {
    if (node.unlocked) {
      // In a real app, you might have a more robust routing system
      const path = `/rpg/${node.type}s`; 
      router.push(path);
    }
  };

  const handleUnlock = () => {
    attemptUnlockNode(node.id);
  }

  const canUnlock = node.unlockCondition ? checkUnlockCondition(node.unlockCondition) : false;

  return (
    <div className="absolute top-1/2 right-8 -translate-y-1/2 w-96 bg-slate-900/80 backdrop-blur-md border rounded-lg shadow-lg p-6 text-white z-20" style={{ borderColor: style.color }}>
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-4">{style.icon}</span>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: style.color }}>{node.name}</h2>
          <p className="text-sm uppercase text-gray-400">{node.type}</p>
        </div>
      </div>
      <p className="text-gray-300 mb-6 text-base leading-relaxed">{node.lore}</p>
      
      {node.unlocked ? (
        <button 
          onClick={handleTeleport}
          className="w-full text-white font-bold py-3 px-4 rounded transition-all duration-300"
          style={{ backgroundColor: style.color, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Teleport
        </button>
      ) : (
        <div className="text-center p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
          <h3 className="font-bold text-red-300 text-lg">Locked</h3>
          {node.unlockCondition && (
            <p className="text-sm text-red-200/80 mt-1">
              Requires: {node.unlockCondition.type} {node.unlockCondition.id || `level ${node.unlockCondition.level}`}
            </p>
          )}
          <button 
            onClick={handleUnlock}
            disabled={!canUnlock}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded mt-4 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {canUnlock ? 'Attempt to Unlock' : 'Requirements Not Met'}
          </button>
        </div>
      )}
    </div>
  );
}
