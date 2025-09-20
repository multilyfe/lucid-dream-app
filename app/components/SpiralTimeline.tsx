import { useState, useMemo, useRef, useEffect } from 'react';
import { type TripLog, type DMTPortalLog } from '../hooks/useMindfuckCathedral';

interface SpiralTimelineProps {
  trips: TripLog[];
  portals?: DMTPortalLog[];
  onTripSelect?: (trip: TripLog) => void;
}

interface TimelinePoint {
  id: string;
  timestamp: Date;
  type: 'trip' | 'portal' | 'breakthrough';
  title: string;
  intensity: number;
  substance?: string;
  angle: number;
  radius: number;
  color: string;
  data: TripLog | DMTPortalLog;
}

interface SpiralConfig {
  centerX: number;
  centerY: number;
  baseRadius: number;
  spiralTightness: number;
  rotationSpeed: number;
}

const SubstanceColors = {
  'LSD': { primary: '#ff6b9d', secondary: '#ffa8cc', glow: '#ff6b9d' },
  'Psilocybin': { primary: '#4ecdc4', secondary: '#81e6d9', glow: '#4ecdc4' },
  'DMT': { primary: '#9b59b6', secondary: '#bb86fc', glow: '#9b59b6' },
  'Ayahuasca': { primary: '#e67e22', secondary: '#f39c12', glow: '#e67e22' },
  'Mescaline': { primary: '#2ecc71', secondary: '#58d68d', glow: '#2ecc71' },
  'default': { primary: '#6c7ce0', secondary: '#a29bfe', glow: '#6c7ce0' }
};

function generateSpiralPoints(
  trips: TripLog[], 
  portals: DMTPortalLog[] = [], 
  config: SpiralConfig
): TimelinePoint[] {
  const allEvents = [
    ...trips.map(trip => ({ ...trip, eventType: 'trip' as const })),
    ...portals.map(portal => ({ ...portal, eventType: 'portal' as const }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return allEvents.map((event, index) => {
    const progress = index / Math.max(1, allEvents.length - 1);
    const angle = progress * Math.PI * 4 + (Date.now() * 0.0001); // 2 full spirals + slow rotation
    const radius = config.baseRadius + (progress * 150);
    
    const substance = 'substance' in event ? event.substance : 'DMT';
    const colors = SubstanceColors[substance as keyof typeof SubstanceColors] || SubstanceColors.default;
    
    const intensity = 'ego_death_level' in event ? event.ego_death_level :
                     'breakthrough' in event ? (event.breakthrough ? 8 : 5) : 5;

    return {
      id: event.id,
      timestamp: new Date(event.date),
      type: event.eventType === 'portal' ? 'portal' : 
            intensity >= 8 ? 'breakthrough' : 'trip',
      title: 'substance' in event ? `${event.substance} Journey` :
             `DMT Portal - ${event.method}`,
      intensity,
      substance,
      angle,
      radius,
      color: colors.primary,
      data: event as TripLog | DMTPortalLog
    };
  });
}

interface PointVisualizationProps {
  point: TimelinePoint;
  config: SpiralConfig;
  isHovered: boolean;
  onHover: (point: TimelinePoint | null) => void;
  onClick: (point: TimelinePoint) => void;
}

function PointVisualization({ 
  point, 
  config, 
  isHovered, 
  onHover, 
  onClick 
}: PointVisualizationProps) {
  const x = config.centerX + Math.cos(point.angle) * point.radius;
  const y = config.centerY + Math.sin(point.angle) * point.radius;
  
  const pulseScale = isHovered ? 1.5 : 1;
  const glowIntensity = (point.intensity / 10) * 0.8 + 0.2;

  return (
    <g
      className="cursor-pointer transition-all duration-300"
      onMouseEnter={() => onHover(point)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(point)}
    >
      {/* Glow effect */}
      <circle
        cx={x}
        cy={y}
        r={8 * pulseScale}
        fill={point.color}
        opacity={glowIntensity * 0.3}
        className="animate-pulse"
      />
      
      {/* Main point */}
      <circle
        cx={x}
        cy={y}
        r={4 + (point.intensity / 10) * 3}
        fill={point.color}
        stroke="#ffffff"
        strokeWidth={isHovered ? 2 : 1}
        className="transition-all duration-200"
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity * 10}px ${point.color})`,
          transform: `scale(${pulseScale})`
        } as React.CSSProperties}
      />
      
      {/* Breakthrough marker */}
      {point.type === 'breakthrough' && (
        <g>
          <circle
            cx={x}
            cy={y}
            r={12}
            fill="none"
            stroke="#ffff00"
            strokeWidth={2}
            opacity={0.8}
            className="animate-spin"
            style={{ animationDuration: '3s' } as React.CSSProperties}
          />
          <text
            x={x}
            y={y - 20}
            textAnchor="middle"
            fontSize="12"
            fill="#ffff00"
            className="font-bold animate-pulse"
          >
            ⚡
          </text>
        </g>
      )}
      
      {/* Portal marker */}
      {point.type === 'portal' && (
        <g>
          <circle
            cx={x}
            cy={y}
            r={10}
            fill="none"
            stroke="#9b59b6"
            strokeWidth={1}
            opacity={0.6}
            className="animate-ping"
          />
          <text
            x={x}
            y={y - 18}
            textAnchor="middle"
            fontSize="10"
            fill="#bb86fc"
            className="font-medium"
          >
            🌀
          </text>
        </g>
      )}
    </g>
  );
}

interface TooltipProps {
  point: TimelinePoint | null;
  mousePosition: { x: number; y: number };
}

function Tooltip({ point, mousePosition }: TooltipProps) {
  if (!point) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-2xl"
      style={{
        left: mousePosition.x + 15,
        top: mousePosition.y - 50,
        maxWidth: '300px'
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: point.color } as React.CSSProperties}
        />
        <h4 className="font-bold text-white text-sm">{point.title}</h4>
      </div>
      
      <div className="text-xs text-slate-300 space-y-1">
        <div>Intensity: {point.intensity}/10</div>
        <div>{point.timestamp.toLocaleDateString()}</div>
        
        {'ego_death_level' in point.data && (
          <div>Ego Death: {(point.data as TripLog).ego_death_level}/10</div>
        )}
        
        {'method' in point.data && (
          <div>Portal: {(point.data as DMTPortalLog).method}</div>
        )}
        
        {point.type === 'breakthrough' && (
          <div className="text-yellow-400 font-medium">⚡ Breakthrough Experience</div>
        )}
      </div>
    </div>
  );
}

export function SpiralTimeline({ trips, portals = [], onTripSelect }: SpiralTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedPoint, setSelectedPoint] = useState<TimelinePoint | null>(null);

  const config: SpiralConfig = {
    centerX: dimensions.width / 2,
    centerY: dimensions.height / 2,
    baseRadius: 50,
    spiralTightness: 0.5,
    rotationSpeed: 0.1
  };

  const timelinePoints = useMemo(() => {
    return generateSpiralPoints(trips, portals, config);
  }, [trips, portals, config]);

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handlePointClick = (point: TimelinePoint) => {
    setSelectedPoint(point);
    if (onTripSelect && 'substance' in point.data) {
      onTripSelect(point.data as TripLog);
    }
  };

  // Generate spiral path
  const spiralPath = useMemo(() => {
    const points: string[] = [];
    const steps = 200;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * Math.PI * 4;
      const radius = config.baseRadius + (progress * 150);
      const x = config.centerX + Math.cos(angle) * radius;
      const y = config.centerY + Math.sin(angle) * radius;
      
      points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    
    return points.join(' ');
  }, [config]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🌀 Spiral Timeline</h2>
          <p className="text-slate-400">Consciousness journey through spacetime</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-slate-300">Breakthrough</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-slate-300">Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-slate-300">Journey</span>
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="relative bg-slate-900/30 rounded-2xl border border-slate-600/50 overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-[600px]"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          {/* Background cosmic effect */}
          <defs>
            <radialGradient id="cosmicBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#312e81" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#cosmicBg)" />
          
          {/* Spiral path */}
          <path
            d={spiralPath}
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            className="animate-pulse"
            strokeDasharray="5,5"
          />
          
          {/* Timeline points */}
          {timelinePoints.map(point => (
            <PointVisualization
              key={point.id}
              point={point}
              config={config}
              isHovered={hoveredPoint?.id === point.id}
              onHover={setHoveredPoint}
              onClick={handlePointClick}
            />
          ))}
          
          {/* Center cosmic eye */}
          <g>
            <circle
              cx={config.centerX}
              cy={config.centerY}
              r="20"
              fill="#4c1d95"
              stroke="#8b5cf6"
              strokeWidth="2"
              opacity="0.8"
              className="animate-pulse"
            />
            <text
              x={config.centerX}
              y={config.centerY + 5}
              textAnchor="middle"
              fontSize="16"
              fill="#a855f7"
              className="font-bold"
            >
              👁️
            </text>
          </g>
        </svg>
        
        {/* Tooltip */}
        <Tooltip point={hoveredPoint} mousePosition={mousePosition} />
      </div>

      {/* Statistics */}
      {timelinePoints.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">
              {timelinePoints.filter(p => p.type === 'breakthrough').length}
            </div>
            <div className="text-sm text-purple-300">Breakthrough Experiences</div>
          </div>
          
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">
              {timelinePoints.filter(p => p.type === 'portal').length}
            </div>
            <div className="text-sm text-blue-300">Portal Encounters</div>
          </div>
          
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(timelinePoints.reduce((sum, p) => sum + p.intensity, 0) / timelinePoints.length * 10) / 10}
            </div>
            <div className="text-sm text-green-300">Avg Intensity</div>
          </div>
        </div>
      )}

      {timelinePoints.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌀</div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">The spiral awaits your first journey</h3>
          <p className="text-slate-500">
            Begin documenting your consciousness explorations to see them mapped through spacetime.
          </p>
        </div>
      )}
    </div>
  );
}