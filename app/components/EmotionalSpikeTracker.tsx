import { useState, useMemo } from 'react';
import { type EmotionalSpike } from '../hooks/useMindfuckCathedral';

interface EmotionalSpikeTrackerProps {
  spikes: EmotionalSpike[];
  onAddSpike?: (spike: Omit<EmotionalSpike, 'timestamp'>) => void;
}

const EmotionColors = {
  'terror': { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-300', icon: '😱' },
  'bliss': { bg: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-300', icon: '😇' },
  'crying': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-300', icon: '😭' },
  'purging': { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-300', icon: '🤮' },
  'orgasmic': { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-300', icon: '💫' },
  'rage': { bg: 'bg-red-700', border: 'border-red-700', text: 'text-red-300', icon: '😡' },
  'euphoria': { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-300', icon: '🤩' }
};

interface SpikeVisualizationProps {
  spikes: EmotionalSpike[];
  timeWindow: number; // minutes
}

function SpikeVisualization({ spikes, timeWindow }: SpikeVisualizationProps) {
  const timeSlots = useMemo(() => {
    const slots = [];
    const slotDuration = 15; // 15-minute intervals
    const totalSlots = Math.ceil(timeWindow / slotDuration);

    for (let i = 0; i < totalSlots; i++) {
      const startTime = i * slotDuration;
      const endTime = (i + 1) * slotDuration;
      
      const spikesInSlot = spikes.filter(spike => {
        const spikeTime = new Date(spike.timestamp);
        const minutesFromStart = spikeTime.getMinutes() + (spikeTime.getHours() * 60);
        return minutesFromStart >= startTime && minutesFromStart < endTime;
      });

      slots.push({
        startTime,
        endTime,
        spikes: spikesInSlot,
        maxIntensity: Math.max(0, ...spikesInSlot.map(s => s.intensity))
      });
    }

    return slots;
  }, [spikes, timeWindow]);

  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-white">Emotional Journey Visualization</h4>
        <div className="text-sm text-slate-400">
          {timeWindow} minute window • {spikes.length} total spikes
        </div>
      </div>
      
      {/* Timeline */}
      <div className="space-y-4">
        {/* Time markers */}
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i}>+{Math.round((timeWindow / 4) * i)}m</span>
          ))}
        </div>
        
        {/* Spike visualization */}
        <div className="relative h-32 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
          {timeSlots.map((slot, index) => {
            const heightPercentage = (slot.maxIntensity / 10) * 100;
            const dominantEmotion = slot.spikes.reduce((prev, current) => 
              current.intensity > prev.intensity ? current : prev, 
              { type: 'none', intensity: 0 } as any
            );
            
            return (
              <div
                key={index}
                className="absolute bottom-0 transition-all duration-300 hover:scale-105"
                style={{
                  left: `${(index / timeSlots.length) * 100}%`,
                  width: `${100 / timeSlots.length}%`,
                  height: `${heightPercentage}%`
                } as React.CSSProperties}
              >
                {slot.maxIntensity > 0 && (
                  <div
                    className={`w-full h-full opacity-80 hover:opacity-100 transition-all cursor-pointer ${
                      EmotionColors[dominantEmotion.type as keyof typeof EmotionColors]?.bg || 'bg-slate-600'
                    }`}
                    title={`${slot.startTime}-${slot.endTime}min: ${dominantEmotion.type} (${dominantEmotion.intensity}/10)`}
                  />
                )}
              </div>
            );
          })}
          
          {/* Peak markers */}
          {spikes.filter(s => s.intensity >= 8).map((spike, index) => (
            <div
              key={index}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${100 - (spike.intensity / 10) * 100}%`
              } as React.CSSProperties}
            >
              <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
            </div>
          ))}
        </div>
        
        {/* Intensity scale */}
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Calm</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= 3 ? 'bg-green-500' :
                  level <= 6 ? 'bg-yellow-500' :
                  level <= 8 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
              />
            ))}
          </div>
          <span>Intense</span>
        </div>
      </div>
    </div>
  );
}

interface EmotionStatsProps {
  spikes: EmotionalSpike[];
}

function EmotionStats({ spikes }: EmotionStatsProps) {
  const stats = useMemo(() => {
    const byType = spikes.reduce((acc, spike) => {
      if (!acc[spike.type]) {
        acc[spike.type] = { count: 0, totalIntensity: 0, totalDuration: 0 };
      }
      acc[spike.type].count++;
      acc[spike.type].totalIntensity += spike.intensity;
      acc[spike.type].totalDuration += spike.duration;
      return acc;
    }, {} as Record<string, { count: number; totalIntensity: number; totalDuration: number }>);

    const avgIntensity = spikes.length > 0 
      ? spikes.reduce((sum, spike) => sum + spike.intensity, 0) / spikes.length 
      : 0;
    
    const peakSpike = spikes.reduce((peak, spike) => 
      spike.intensity > peak.intensity ? spike : peak, 
      { intensity: 0 } as EmotionalSpike
    );

    const totalDuration = spikes.reduce((sum, spike) => sum + spike.duration, 0);

    return {
      byType: Object.entries(byType).map(([type, data]) => ({
        type,
        ...data,
        avgIntensity: data.totalIntensity / data.count
      })).sort((a, b) => b.count - a.count),
      avgIntensity,
      peakSpike,
      totalDuration
    };
  }, [spikes]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Emotion breakdown */}
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50">
        <h4 className="text-lg font-bold text-white mb-4">Emotion Breakdown</h4>
        <div className="space-y-3">
          {stats.byType.map(({ type, count, avgIntensity, totalDuration }) => {
            const emotion = EmotionColors[type as keyof typeof EmotionColors];
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emotion?.icon || '😶'}</span>
                  <div>
                    <div className={`font-medium capitalize ${emotion?.text || 'text-slate-300'}`}>
                      {type}
                    </div>
                    <div className="text-xs text-slate-400">
                      {count} events • {Math.round(avgIntensity * 10) / 10}/10 avg
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{totalDuration}min</div>
                  <div className="text-xs text-slate-400">total</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall stats */}
      <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50">
        <h4 className="text-lg font-bold text-white mb-4">Session Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(stats.avgIntensity * 10) / 10}
            </div>
            <div className="text-xs text-purple-300">Avg Intensity</div>
          </div>
          
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">
              {stats.peakSpike.intensity || 0}
            </div>
            <div className="text-xs text-red-300">Peak Intensity</div>
          </div>
          
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">
              {spikes.length}
            </div>
            <div className="text-xs text-blue-300">Total Events</div>
          </div>
          
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(stats.totalDuration)}m
            </div>
            <div className="text-xs text-green-300">Total Duration</div>
          </div>
        </div>

        {stats.peakSpike.intensity > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="text-sm font-medium text-yellow-300 mb-1">Peak Experience</div>
            <div className="text-xs text-yellow-200">
              {stats.peakSpike.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmotionalSpikeTracker({ spikes, onAddSpike }: EmotionalSpikeTrackerProps) {
  const [viewMode, setViewMode] = useState<'visualization' | 'list' | 'stats'>('visualization');
  const [showAddForm, setShowAddForm] = useState(false);

  // Group spikes by session/date
  const spikesSorted = useMemo(() => {
    return [...spikes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [spikes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">📊 Emotional Spike Tracker</h2>
          <p className="text-slate-400">Monitor peak emotional moments during journeys</p>
        </div>
        
        <div className="flex gap-2">
          {onAddSpike && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 
                text-purple-300 text-sm font-medium transition-all hover:scale-105"
            >
              ➕ Log Spike
            </button>
          )}
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
        {[
          { id: 'visualization', label: 'Timeline', icon: '📈' },
          { id: 'stats', label: 'Statistics', icon: '📊' },
          { id: 'list', label: 'Event List', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as any)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              viewMode === tab.id
                ? 'bg-purple-500/30 text-purple-200 shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'visualization' && spikes.length > 0 && (
        <SpikeVisualization spikes={spikes} timeWindow={480} />
      )}

      {viewMode === 'stats' && spikes.length > 0 && (
        <EmotionStats spikes={spikes} />
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {spikesSorted.map((spike, index) => {
            const emotion = EmotionColors[spike.type as keyof typeof EmotionColors];
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  emotion ? `${emotion.border}/30 bg-${spike.type === 'terror' ? 'red' : spike.type === 'bliss' ? 'yellow' : spike.type === 'crying' ? 'blue' : spike.type === 'purging' ? 'green' : spike.type === 'orgasmic' ? 'pink' : spike.type === 'rage' ? 'red' : 'purple'}-500/5` : 'border-slate-600/30 bg-slate-800/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emotion?.icon || '😶'}</span>
                    <div>
                      <div className={`font-medium capitalize ${emotion?.text || 'text-slate-300'}`}>
                        {spike.type} • Intensity {spike.intensity}/10
                      </div>
                      <div className="text-sm text-slate-400">
                        {spike.duration} minutes • {new Date(spike.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Intensity bars */}
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded ${
                          i < spike.intensity 
                            ? emotion?.bg || 'bg-slate-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {spike.description && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                    <p className="text-slate-300 italic">"{spike.description}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {spikes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">No emotional spikes recorded</h3>
          <p className="text-slate-500">
            Start logging your emotional journey during trips to track patterns and intensity.
          </p>
        </div>
      )}
    </div>
  );
}