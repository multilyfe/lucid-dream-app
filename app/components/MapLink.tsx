'use client';

import { type MapNode } from '../lib/map';

interface MapLinkProps {
  from: MapNode;
  to: MapNode;
  locked: boolean;
}

export default function MapLink({ from, to, locked }: MapLinkProps) {
  const id = `link-${from.id}-${to.id}`;
  return (
    <>
      <defs>
        <linearGradient id={id} x1={from.coords[0]} y1={from.coords[1]} x2={to.coords[0]} y2={to.coords[1]} gradientUnits="userSpaceOnUse">
          <stop stopColor={locked ? "#4b5563" : "#a5b4fc"} />
          <stop offset="1" stopColor={locked ? "#1f2937" : "#6366f1"} />
        </linearGradient>
      </defs>
      <line
        x1={from.coords[0]}
        y1={from.coords[1]}
        x2={to.coords[0]}
        y2={to.coords[1]}
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeDasharray={locked ? "8, 8" : "none"}
        className="pointer-events-none"
        style={{
          animation: locked ? 'none' : 'pulse 4s infinite ease-in-out',
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(165, 180, 252, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 5px rgba(99, 102, 241, 1));
          }
        }
      `}</style>
    </>
  );
}
