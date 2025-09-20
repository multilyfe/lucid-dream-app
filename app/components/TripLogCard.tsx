import { useState } from 'react';
import { type TripLog, type EmotionalSpike, type TripLogInsight, type TripLogEntity } from '../hooks/useMindfuckCathedral';

interface TripLogCardProps {
  tripLog: TripLog;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SubstanceIcon = ({ substance }: { substance: string }) => {
  const icons: { [key: string]: string } = {
    'LSD': '🔬',
    'Psilocybin': '🍄',
    'DMT': '👁️',
    '5-MeO-DMT': '🌀',
    'Mescaline': '🌵',
    'MDMA': '💖',
    'Ketamine': '🌪️',
    'Ayahuasca': '🐍'
  };
  return <span className="text-xl">{icons[substance] || '✨'}</span>;
};

const EgoDeathMeter = ({ level }: { level: number }) => {
  const getColor = (level: number) => {
    if (level === 0) return 'bg-slate-600';
    if (level === 1) return 'bg-yellow-500';
    if (level === 2) return 'bg-orange-500';
    if (level === 3) return 'bg-red-500';
    if (level === 4) return 'bg-purple-500';
    if (level === 5) return 'bg-black border border-white';
    return 'bg-slate-600';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">Ego Death:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i <= level ? getColor(level) : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-white">{level}/5</span>
    </div>
  );
};

const EmotionalSpikeChart = ({ spikes }: { spikes: EmotionalSpike[] }) => {
  const getEmotionColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'terror': 'bg-red-500',
      'bliss': 'bg-yellow-400',
      'crying': 'bg-blue-500',
      'purging': 'bg-green-500',
      'orgasmic': 'bg-pink-500',
      'rage': 'bg-red-700',
      'euphoria': 'bg-purple-500'
    };
    return colors[type] || 'bg-slate-500';
  };

  const getEmotionIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'terror': '😱',
      'bliss': '😇',
      'crying': '😭',
      'purging': '🤮',
      'orgasmic': '💫',
      'rage': '😡',
      'euphoria': '🤩'
    };
    return icons[type] || '😶';
  };

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium text-slate-300">Emotional Journey</h5>
      <div className="flex flex-wrap gap-2">
        {spikes.map((spike, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full text-xs text-white ${getEmotionColor(spike.type)} 
              animate-pulse hover:scale-105 transition-all cursor-help`}
            title={`${spike.description} (${spike.duration}min, intensity ${spike.intensity}/10)`}
          >
            <span className="mr-1">{getEmotionIcon(spike.type)}</span>
            {spike.type} {spike.intensity}/10
          </div>
        ))}
      </div>
    </div>
  );
};

const InsightList = ({ insights }: { insights: TripLogInsight[] }) => {
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'ontological': 'border-purple-500 bg-purple-500/10',
      'existential': 'border-blue-500 bg-blue-500/10',
      'therapeutic': 'border-green-500 bg-green-500/10',
      'cosmic': 'border-yellow-500 bg-yellow-500/10',
      'personal': 'border-pink-500 bg-pink-500/10'
    };
    return colors[type] || 'border-slate-500 bg-slate-500/10';
  };

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-slate-300">Insights Received</h5>
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`p-4 rounded-xl border ${getTypeColor(insight.type)} 
            hover:scale-[1.02] transition-all cursor-pointer`}
        >
          <div className="flex items-start justify-between mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
              ${insight.type === 'ontological' ? 'bg-purple-500/20 text-purple-300' :
                insight.type === 'existential' ? 'bg-blue-500/20 text-blue-300' :
                insight.type === 'therapeutic' ? 'bg-green-500/20 text-green-300' :
                insight.type === 'cosmic' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-pink-500/20 text-pink-300'}`}>
              {insight.type}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < insight.emotional_intensity ? 'bg-white' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-white leading-relaxed italic">"{insight.content}"</p>
          <div className="mt-2 text-xs text-slate-400">
            {new Date(insight.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

const EntityEncounters = ({ entities }: { entities: TripLogEntity[] }) => {
  if (entities.length === 0) return null;

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-medium text-slate-300">Entity Encounters</h5>
      {entities.map((entity, index) => (
        <div
          key={index}
          className="p-4 rounded-xl border border-cyan-500/50 bg-cyan-500/5 
            hover:border-cyan-400 transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <h6 className="font-medium text-cyan-300">{entity.name}</h6>
            <span className="text-xs text-slate-400">{entity.encountered_at}</span>
          </div>
          <p className="text-slate-300 text-sm mb-2">{entity.description}</p>
          {entity.message && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-cyan-200 italic">"{entity.message}"</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export function TripLogCard({ tripLog, onEdit, onDelete }: TripLogCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'entities' | 'phases'>('overview');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="group relative">
      {/* Psychedelic background effects */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-cyan-500/10 
        opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
      
      <div className="relative backdrop-blur-md rounded-3xl border border-slate-700/50 bg-slate-900/40 
        hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <SubstanceIcon substance={tripLog.substance} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{tripLog.substance}</h3>
                  <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                    {tripLog.dosage}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{formatDate(tripLog.date)}</p>
                <p className="text-slate-300 text-sm">{formatDuration(tripLog.duration)} • {tripLog.setting}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-slate-400">XP Earned</div>
                <div className="text-lg font-bold text-yellow-400">+{tripLog.xp_awarded}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">🧠 Tokens</div>
                <div className="text-lg font-bold text-purple-400">+{tripLog.tokens_earned}</div>
              </div>
            </div>
          </div>

          {/* Intention */}
          <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-600/50">
            <div className="text-sm text-slate-400 mb-1">Intention</div>
            <p className="text-slate-200 italic">"{tripLog.intention}"</p>
          </div>

          {/* Quick stats */}
          <div className="mt-4 flex items-center justify-between">
            <EgoDeathMeter level={tripLog.ego_death_level} />
            <div className="flex gap-4 text-sm">
              <span className="text-slate-400">
                💡 {tripLog.insights.length} insights
              </span>
              <span className="text-slate-400">
                👁️ {tripLog.entities.length} entities
              </span>
              <span className="text-slate-400">
                📊 {tripLog.emotional_spikes.length} spikes
              </span>
            </div>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full py-2 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 
              text-purple-300 text-sm font-medium transition-all duration-200 
              hover:scale-[1.02] active:scale-[0.98]"
          >
            {expanded ? '🔼 Collapse Journey' : '🔽 Explore Journey'}
          </button>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="p-6 space-y-6">
            {/* Tab navigation */}
            <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'insights', label: 'Insights', icon: '💡' },
                { id: 'entities', label: 'Entities', icon: '👁️' },
                { id: 'phases', label: 'Phases', icon: '🌀' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-500/30 text-purple-200 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="min-h-[200px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <EmotionalSpikeChart spikes={tripLog.emotional_spikes} />
                  
                  {tripLog.tags.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-300 mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {tripLog.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs
                              hover:bg-slate-600/50 transition-all"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tripLog.integration_notes && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-300 mb-2">Integration Notes</h5>
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <p className="text-green-200">{tripLog.integration_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'insights' && <InsightList insights={tripLog.insights} />}
              
              {activeTab === 'entities' && <EntityEncounters entities={tripLog.entities} />}
              
              {activeTab === 'phases' && (
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-slate-300">Phase Breakdown</h5>
                  {Object.entries(tripLog.phase_breakdown).map(([phase, description]) => (
                    <div key={phase} className="p-4 rounded-xl bg-slate-800/50 border border-slate-600/50">
                      <h6 className="font-medium text-white capitalize mb-2">{phase.replace('_', ' ')}</h6>
                      <p className="text-slate-300">{description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-700/50">
              {tripLog.vault_file && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 
                  hover:bg-blue-500/30 text-blue-300 text-sm font-medium transition-all">
                  📝 Open in Obsidian
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(tripLog.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 
                    hover:bg-slate-600/50 text-slate-300 text-sm font-medium transition-all"
                >
                  ✏️ Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(tripLog.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 
                    hover:bg-red-500/30 text-red-300 text-sm font-medium transition-all"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}