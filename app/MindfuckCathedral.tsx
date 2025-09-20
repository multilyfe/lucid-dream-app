'use client';

import { useState } from 'react';
import { useMindfuckCathedral } from './hooks/useMindfuckCathedral';
import { useBuffs } from './hooks/useBuffs';
import VaultIntegration from './components/VaultIntegration';

export default function MindfuckCathedral() {
  const { cathedralData, addTripLog } = useMindfuckCathedral();
  const { addBuff } = useBuffs();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRecordForm, setShowRecordForm] = useState(false);

  const totalTrips = cathedralData.tripLogs.length;
  const totalBreakthroughs = cathedralData.tripLogs.filter(t => t.ego_death_level >= 8).length;
  const totalTokens = cathedralData.currency.mindfuck_tokens;
  const avgEgoDeathLevel = totalTrips > 0 
    ? Math.round((cathedralData.tripLogs.reduce((sum, t) => sum + t.ego_death_level, 0) / totalTrips) * 10) / 10
    : 0;

  const handleRecordJourney = () => {
    // Create a test trip log
    const testTrip = {
      date: new Date().toISOString().split('T')[0],
      substance: 'LSD',
      dosage: '100μg',
      duration: 480, // 8 hours
      setting: 'Home - safe space',
      intention: 'Self-exploration and healing',
      entities: [],
      insights: [{
        id: `insight-${Date.now()}`,
        timestamp: new Date().toISOString(),
        content: 'First recorded insight from my consciousness journey',
        emotional_intensity: 7,
        type: 'personal' as const
      }],
      emotional_spikes: [{
        timestamp: new Date().toISOString(),
        type: 'bliss' as const,
        intensity: 8,
        description: 'Overwhelming sense of connection and love',
        duration: 45
      }],
      ego_death_level: 6,
      integration_notes: 'Need to process these insights over the coming days',
      tags: ['first-trip', 'healing', 'introspection'],
      phase_breakdown: {
        onset: '30 minutes - first effects noticed',
        come_up: '1 hour - intensity building',
        peak: '2-4 hours - profound experiences',
        plateau: '4-6 hours - stable elevated state',
        come_down: '6-8 hours - gradual return'
      }
    };

    const newTrip = addTripLog(testTrip);
    console.log('New trip logged:', newTrip);
    
    // Apply psychedelic buffs based on experience intensity
    if (newTrip.ego_death_level >= 8) {
      // High ego death - apply Ego Dissolution buff
      addBuff({
        name: 'Ego Dissolution Afterglow',
        type: 'buff',
        desc: '+100% Mindfuck Token gain from ego death experience',
        duration: '8 hours',
        durationMs: 8 * 60 * 60 * 1000,
        source: 'High Ego Death Experience',
        icon: '🌀',
        rarity: 'legendary',
        effects: {
          tokenMultiplier: 2.0
        }
      });
    } else if (newTrip.ego_death_level >= 5) {
      // Medium ego death - apply Consciousness Expansion buff
      addBuff({
        name: 'Consciousness Expansion',
        type: 'buff',
        desc: '+50% XP gain from consciousness exploration',
        duration: '24 hours',
        durationMs: 24 * 60 * 60 * 1000,
        source: 'Successful Trip Integration',
        icon: '🧠',
        rarity: 'epic',
        effects: {
          xpMultiplier: 1.5
        }
      });
    }

    if (newTrip.entities.length > 0) {
      // Entity contact - apply Entity Contact buff
      addBuff({
        name: 'Entity Contact Resonance',
        type: 'buff',
        desc: '+25% XP gain and enhanced companion communication',
        duration: '12 hours',
        durationMs: 12 * 60 * 60 * 1000,
        source: 'Entity Encounter',
        icon: '👁️',
        rarity: 'rare',
        effects: {
          xpMultiplier: 1.25,
          bondMultiplier: 1.3
        }
      });
    }
    
    setShowRecordForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-indigo-900/30 relative overflow-hidden">
      {/* Cosmic background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
            🧠 MINDFUCK CATHEDRAL
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Sacred space for documenting journeys through altered states of consciousness.
            <br />
            <span className="text-purple-400 italic">
              Where the veil between dimensions grows thin...
            </span>
          </p>
        </div>

        {/* Statistics dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-purple-400 mb-2">{totalTrips}</div>
            <div className="text-sm text-purple-300">Sacred Journeys</div>
            <div className="text-xs text-slate-400 mt-1">Total expeditions</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{totalBreakthroughs}</div>
            <div className="text-sm text-yellow-300">Breakthroughs</div>
            <div className="text-xs text-slate-400 mt-1">Ego dissolution events</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-green-400 mb-2">{totalTokens}</div>
            <div className="text-sm text-green-300">Mindfuck Tokens</div>
            <div className="text-xs text-slate-400 mt-1">Consciousness currency</div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-red-400 mb-2">{avgEgoDeathLevel}</div>
            <div className="text-sm text-red-300">Avg Ego Death</div>
            <div className="text-xs text-slate-400 mt-1">Dissolution depth</div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
            { id: 'dashboard', label: 'Sacred Overview', icon: '🏛️' },
            { id: 'trips', label: 'Trip Chronicles', icon: '📜' },
            { id: 'quests', label: 'Ego Trials', icon: '⚔️' },
            { id: 'timeline', label: 'Spiral Timeline', icon: '🌀' },
            { id: 'insights', label: 'Sacred Scrolls', icon: '✨' },
            { id: 'spikes', label: 'Emotional Storms', icon: '⚡' },
            { id: 'vault', label: 'Vault Sync', icon: '🗂️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 text-purple-200 shadow-lg scale-105'
                  : 'bg-slate-800/30 border border-slate-600/30 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 hover:border-slate-500/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="text-center py-12">
                <div className="text-8xl mb-6">👁️‍🗨️</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Welcome to the Cathedral
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                  Your consciousness exploration hub is ready. Begin logging journeys, tracking insights, 
                  and mapping the topology of your mind.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50">
                    <div className="text-4xl mb-3">📜</div>
                    <h3 className="text-lg font-bold text-white mb-2">Trip Chronicles</h3>
                    <p className="text-sm text-slate-400">
                      Document your journeys through altered states of consciousness
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50">
                    <div className="text-4xl mb-3">⚔️</div>
                    <h3 className="text-lg font-bold text-white mb-2">Ego Trials</h3>
                    <p className="text-sm text-slate-400">
                      Complete challenges to expand consciousness and earn rewards
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50">
                    <div className="text-4xl mb-3">🌀</div>
                    <h3 className="text-lg font-bold text-white mb-2">Spiral Timeline</h3>
                    <p className="text-sm text-slate-400">
                      Visualize your breakthrough experiences through spacetime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                {totalTrips > 0 ? `${totalTrips} Chronicles Recorded` : 'No chronicles recorded'}
              </h3>
              <p className="text-slate-500 mb-6">
                {totalTrips > 0 
                  ? 'Your consciousness journey continues...' 
                  : 'Begin documenting your consciousness journeys.'
                }
              </p>
              <button 
                onClick={() => setShowRecordForm(true)}
                className="px-6 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium transition-all hover:scale-105"
              >
                ➕ Record New Journey
              </button>
              
              {/* Simple recording confirmation */}
              {showRecordForm && (
                <div className="mt-8 p-6 rounded-2xl bg-slate-800/50 border border-purple-500/30 max-w-md mx-auto">
                  <h4 className="text-lg font-bold text-white mb-4">Record Test Journey</h4>
                  <p className="text-sm text-slate-300 mb-4">
                    This will create a sample LSD journey entry to demonstrate the system.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRecordJourney}
                      className="px-4 py-2 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 font-medium transition-all"
                    >
                      Create Test Entry
                    </button>
                    <button
                      onClick={() => setShowRecordForm(false)}
                      className="px-4 py-2 rounded-lg bg-slate-600/30 hover:bg-slate-600/40 text-slate-300 font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Show recent trips if any */}
              {totalTrips > 0 && (
                <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {cathedralData.tripLogs.slice(-3).map(trip => (
                    <div key={trip.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/50 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {trip.substance === 'LSD' ? '🔬' : 
                           trip.substance === 'Psilocybin' ? '🍄' : 
                           trip.substance === 'DMT' ? '👁️' : '💫'}
                        </span>
                        <span className="font-medium text-white">{trip.substance}</span>
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{trip.date}</div>
                      <div className="text-sm text-slate-300">
                        Ego Death: {trip.ego_death_level}/10
                      </div>
                      <div className="text-sm text-slate-300">
                        Duration: {Math.round(trip.duration / 60)}h
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Ego trials await</h3>
              <p className="text-slate-500">Complete your first journey to unlock challenges.</p>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌀</div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">The spiral awaits</h3>
              <p className="text-slate-500">Begin documenting journeys to see them mapped through spacetime.</p>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                {cathedralData.insightScrolls.length > 0 
                  ? `${cathedralData.insightScrolls.length} Sacred Insights` 
                  : 'No insights recorded'
                }
              </h3>
              <p className="text-slate-500">Sacred wisdom awaits your discovery.</p>
            </div>
          )}

          {activeTab === 'spikes' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">No emotional spikes tracked</h3>
              <p className="text-slate-500">Begin logging emotional peaks during journeys.</p>
            </div>
          )}

          {activeTab === 'vault' && (
            <VaultIntegration />
          )}
        </div>
      </div>
    </div>
  );
}