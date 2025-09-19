'use client';

import QuestLayout from '../../layouts/QuestLayout';
import { useMap } from '../../hooks/useMap';
import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { type MapNode as MapNodeType } from '../../lib/map';

// Inline components to fix import issues
const MapNode = ({ node, onSelect }: { node: MapNodeType; onSelect: (node: MapNodeType) => void }) => {
  const typeStyles: Record<MapNodeType['type'], { color: string; icon: string }> = {
    realm: { color: 'gold', icon: '👑' },
    temple: { color: '#67e8f9', icon: '🏛️' },
    dungeon: { color: '#f87171', icon: '💀' },
    panty: { color: '#f472b6', icon: '👙' },
  };

  const style = typeStyles[node.type] || { color: 'gray', icon: '❓' };

  return (
    <g
      transform={`translate(${node.coords[0]}, ${node.coords[1]})`}
      onClick={() => onSelect(node)}
      className="cursor-pointer group transition-transform duration-300 ease-in-out hover:scale-110"
    >
      <circle
        r="20"
        fill={`url(#${node.type}-gradient)`}
        stroke={style.color}
        strokeWidth="2"
        filter={node.unlocked ? "url(#glow)" : "none"}
        opacity={node.unlocked ? 1 : 0.5}
      />
      <circle
        r="25"
        fill="transparent"
        stroke="transparent"
        className="transition-all duration-300 group-hover:stroke-white/30"
        strokeWidth="1"
      />
      <text
        x="0"
        y="8"
        textAnchor="middle"
        fill="white"
        fontSize="24"
        className="pointer-events-none"
        opacity={node.unlocked ? 1 : 0.6}
      >
        {style.icon}
      </text>
      <text
        y="45"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ textShadow: '0 0 8px black, 0 0 12px black' }}
      >
        {node.name}
      </text>
    </g>
  );
};

const MapLink = ({ from, to, locked }: { from: MapNodeType; to: MapNodeType; locked: boolean }) => {
  return (
    <line
      x1={from.coords[0]}
      y1={from.coords[1]}
      x2={to.coords[0]}
      y2={to.coords[1]}
      stroke={locked ? "#666" : "#fff"}
      strokeWidth="2"
      strokeDasharray={locked ? "5,5" : "none"}
      opacity={locked ? 0.3 : 0.7}
    />
  );
};

const MapDetail = ({ node, onClose }: { node: MapNodeType; onClose: () => void }) => {
  const typeStyles: Record<MapNodeType['type'], { color: string; icon: string }> = {
    realm: { color: 'gold', icon: '👑' },
    temple: { color: '#67e8f9', icon: '🏛️' },
    dungeon: { color: '#f87171', icon: '💀' },
    panty: { color: '#f472b6', icon: '👙' },
  };

  const style = typeStyles[node.type];

  return (
    <div className="absolute top-1/2 right-8 -translate-y-1/2 w-96 bg-slate-900/80 backdrop-blur-md border border-purple-500 rounded-lg shadow-lg p-6 text-white z-20">
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-4">{style.icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-purple-300">{node.name}</h2>
          <p className="text-sm uppercase text-gray-400">{node.type}</p>
        </div>
      </div>
      <p className="text-gray-300 mb-6 text-base leading-relaxed">{node.lore}</p>
      
      {node.unlocked ? (
        <button 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-all duration-300"
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
            className="w-full bg-gray-600 cursor-not-allowed text-white font-bold py-2 px-4 rounded mt-4"
            disabled
          >
            Requirements Not Met
          </button>
        </div>
      )}
    </div>
  );
};

export default function MapPage() {
  const { mapData, setMapData } = useMap();
  const [selectedNode, setSelectedNode] = useState<MapNodeType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render map until client-side to prevent hydration issues
  if (!isClient) {
    return (
      <QuestLayout>
        <div className="relative h-screen w-full overflow-hidden bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">🌌 Loading Multiverse Map...</h1>
            <p className="text-gray-300">Connecting to the dreamscape...</p>
          </div>
        </div>
      </QuestLayout>
    );
  }

  return (
    <QuestLayout>
      <div className="relative h-screen w-full overflow-hidden bg-gray-900">
        {/* Starfield background - simplified version */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundColor: 'black',
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <header className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10">
          <h1 className="text-5xl font-bold text-purple-300">
            🌌 Multiverse Map
          </h1>
          <p className="text-purple-200/80 mt-2 text-lg">Explore the interconnected realms of your dreamscape.</p>
        </header>

        {/* Map Canvas */}
        <TransformWrapper
          initialScale={0.6}
          initialPositionX={-100}
          initialPositionY={-50}
          minScale={0.3}
          maxScale={2}
          centerOnInit={true}
        >
          <TransformComponent wrapperClass="!absolute inset-0" contentClass="w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 1200 900">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Node Type Gradients */}
                <radialGradient id="realm-gradient">
                  <stop offset="0%" stopColor="rgba(253, 224, 71, 1)" />
                  <stop offset="100%" stopColor="rgba(252, 211, 77, 0)" />
                </radialGradient>
                <radialGradient id="temple-gradient">
                  <stop offset="0%" stopColor="rgba(96, 165, 250, 1)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                </radialGradient>
                <radialGradient id="dungeon-gradient">
                  <stop offset="0%" stopColor="rgba(248, 113, 113, 1)" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                </radialGradient>
                <radialGradient id="panty-gradient">
                  <stop offset="0%" stopColor="rgba(244, 114, 182, 1)" />
                  <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
                </radialGradient>
              </defs>
              
              {/* Render Links */}
              {mapData.links?.map((link, i) => {
                const fromNode = mapData.nodes.find(n => n.id === link.from);
                const toNode = mapData.nodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return null;
                return <MapLink key={i} from={fromNode} to={toNode} locked={link.locked} />;
              })}

              {/* Render Nodes */}
              {mapData.nodes?.map(node => (
                <MapNode key={node.id} node={node} onSelect={setSelectedNode} />
              ))}
            </svg>
          </TransformComponent>
        </TransformWrapper>

        {/* Detail Panel */}
        {selectedNode && (
          <MapDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </QuestLayout>
  );
}
