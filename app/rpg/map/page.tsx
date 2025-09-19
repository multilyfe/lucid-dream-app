'use client';

import QuestLayout from '../../layouts/QuestLayout';
import { useMap } from '../../hooks/useMap';
import MapNode from '../../components/MapNode';
import MapLink from '../../components/MapLink';
import MapDetail from '../../components/MapDetail';
import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { type MapNode as MapNodeType } from '../../lib/map';

export default function MapPage() {
  const { mapData } = useMap();
  const [selectedNode, setSelectedNode] = useState<MapNodeType | null>(null);

  return (
    <QuestLayout>
      <div className="relative h-screen w-full overflow-hidden bg-gray-900">
        {/* Starfield background (CSS-only, no external image) */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px] bg-black"></div>
        <header className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10">
          <h1 className="text-5xl font-bold text-purple-300 text-shadow-purple">
            🌌 Multiverse Map
          </h1>
          <p className="text-purple-200/80 mt-2 text-lg">Explore the interconnected realms of your dreamscape.</p>
        </header>

        {/* Map Canvas */}
        <TransformWrapper
          initialScale={1}
          initialPositionX={200}
          initialPositionY={100}
        >
          <TransformComponent wrapperClass="!absolute inset-0" contentClass="w-full h-full">
            <svg className="w-full h-full">
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
              {mapData.links.map((link, i) => {
                const fromNode = mapData.nodes.find(n => n.id === link.from);
                const toNode = mapData.nodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return null;
                return <MapLink key={i} from={fromNode} to={toNode} locked={link.locked} />;
              })}

              {/* Render Nodes */}
              {mapData.nodes.map(node => (
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
