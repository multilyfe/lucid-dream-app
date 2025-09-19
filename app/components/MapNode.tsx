'use client';

import { type MapNode as MapNodeType } from '../lib/map';

interface MapNodeProps {
  node: MapNodeType;
  onSelect: (node: MapNodeType) => void;
}

const typeStyles: Record<MapNodeType['type'], { color: string; icon: string }> = {
  realm: { color: 'gold', icon: '👑' },
  temple: { color: '#67e8f9', icon: '🏛️' },
  dungeon: { color: '#f87171', icon: '💀' },
  panty: { color: '#f472b6', icon: '👙' },
};

export default function MapNode({ node, onSelect }: MapNodeProps) {
  const style = typeStyles[node.type] || { color: 'gray', icon: '❓' };

  return (
    <g
      transform={`translate(${node.coords[0]}, ${node.coords[1]})`}
      onClick={() => onSelect(node)}
      className="cursor-pointer group transition-transform duration-300 ease-in-out hover:scale-110"
      style={{ transformOrigin: `${node.coords[0]}px ${node.coords[1]}px` }}
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
        fontSize="12"
        className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold"
        style={{ textShadow: '0 0 5px black, 0 0 10px black' }}
      >
        {node.name}
      </text>
    </g>
  );
}
