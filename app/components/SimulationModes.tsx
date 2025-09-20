'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSimulationEngine, type SimulationType, type SimulationSession } from '../hooks/useSimulationEngine';

interface SimulationModesProps {
  onModeSelect: (type: SimulationType) => void;
  activeSession?: SimulationSession | null;
}

export default function SimulationModes({ onModeSelect, activeSession }: SimulationModesProps) {
  const { engineData, calculateLucidImprintScore } = useSimulationEngine();
  const [selectedMode, setSelectedMode] = useState<SimulationType>('text');
  const [lucidImprintScore, setLucidImprintScore] = useState(0);

  // Real-time Lucid Imprint calculation during active session
  useEffect(() => {
    if (activeSession) {
      const score = calculateLucidImprintScore(activeSession);
      setLucidImprintScore(score);
    }
  }, [activeSession, calculateLucidImprintScore]);

  const handleModeSelect = useCallback((type: SimulationType) => {
    setSelectedMode(type);
    onModeSelect(type);
  }, [onModeSelect]);

  const getModeStats = useCallback((type: SimulationType) => {
    const sessions = engineData.sessions.filter(s => s.type === type);
    const totalSessions = sessions.length;
    const avgScore = totalSessions > 0 
      ? sessions.reduce((sum, s) => sum + s.lucidImprintScore, 0) / totalSessions 
      : 0;
    const totalXP = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
    
    return { totalSessions, avgScore, totalXP };
  }, [engineData.sessions]);

  const modes = [
    {
      type: 'text' as SimulationType,
      name: 'Write Simulation',
      icon: '✍️',
      description: 'Immersive text-based lucid dream experience',
      gradient: 'from-purple-500 to-pink-500',
      border: 'border-purple-500/50',
      features: ['Rich Text Editor', 'Feeling Boosters', 'Real-time Scoring', 'Template Library'],
      difficulty: 'Beginner',
      imprintPower: 85
    },
    {
      type: 'image' as SimulationType,
      name: 'Visual Simulation',
      icon: '🖼️',
      description: 'Image sequence guided dream visualization',
      gradient: 'from-blue-500 to-cyan-400',
      border: 'border-blue-500/50',
      features: ['Image Slideshow', 'Visual Triggers', 'Guided Flow', 'Custom Sequences'],
      difficulty: 'Intermediate',
      imprintPower: 75
    },
    {
      type: 'deck' as SimulationType,
      name: 'Card Deck Draw',
      icon: '🃏',
      description: 'Mystical card-based ritual experience',
      gradient: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/50',
      features: ['Sacred Cards', 'Random Draws', 'Symbolic Triggers', 'Destiny Paths'],
      difficulty: 'Advanced',
      imprintPower: 90
    },
    {
      type: 'voice' as SimulationType,
      name: 'Voice Mode',
      icon: '🎙️',
      description: 'Audio-guided immersive experience',
      gradient: 'from-green-500 to-emerald-400',
      border: 'border-green-500/50',
      features: ['TTS Narration', 'Voice Recording', 'Audio Triggers', 'XTTS Integration'],
      difficulty: 'Expert',
      imprintPower: 95
    },
    {
      type: 'passive' as SimulationType,
      name: 'Passive Sim',
      icon: '🧘',
      description: 'Watch-mode with reward choice after',
      gradient: 'from-indigo-500 to-purple-500',
      border: 'border-indigo-500/50',
      features: ['Guided Meditation', 'Passive Absorption', 'Choice Rewards', 'Relaxed Mode'],
      difficulty: 'Casual',
      imprintPower: 60
    }
  ];

  return (
    <div className="space-y-8">
      {/* Active Session Lucid Imprint Display */}
      {activeSession && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/50 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse" />
          
          <div className="relative text-center">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              {Math.round(lucidImprintScore)}
            </div>
            <div className="text-lg text-purple-300 font-medium mb-1">
              Lucid Imprint Score
            </div>
            <div className="text-sm text-slate-400">
              Real-time consciousness programming intensity
            </div>
            
            {/* Score visualization */}
            <div className="mt-4 w-full bg-slate-800 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out ${
                  lucidImprintScore >= 100 ? 'w-full' : ''
                }`}
                {...(lucidImprintScore < 100 && { style: { width: `${lucidImprintScore}%` } })}
              />
            </div>
            
            {/* Score tier indicator */}
            <div className="mt-2 text-xs">
              {lucidImprintScore >= 90 && <span className="text-amber-400 font-bold">🌟 FORBIDDEN TIER</span>}
              {lucidImprintScore >= 80 && lucidImprintScore < 90 && <span className="text-purple-400 font-bold">👑 LEGENDARY TIER</span>}
              {lucidImprintScore >= 70 && lucidImprintScore < 80 && <span className="text-blue-400 font-bold">🔮 EPIC TIER</span>}
              {lucidImprintScore >= 60 && lucidImprintScore < 70 && <span className="text-green-400 font-bold">💎 RARE TIER</span>}
              {lucidImprintScore < 60 && <span className="text-slate-400">✨ DEVELOPING</span>}
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          🌀 Simulation Modes
        </h2>
        <p className="text-slate-300 text-lg">
          Choose your path to lucid consciousness programming
        </p>
      </div>

      {/* Mode Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {modes.map((mode) => {
          const stats = getModeStats(mode.type);
          const isSelected = selectedMode === mode.type;
          
          return (
            <button
              key={mode.type}
              onClick={() => handleModeSelect(mode.type)}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 text-left hover:scale-105 ${
                isSelected 
                  ? `bg-gradient-to-br ${mode.gradient}/20 ${mode.border} shadow-lg shadow-purple-500/20` 
                  : 'bg-slate-800/40 border-slate-600/40 hover:border-slate-500/60'
              }`}
            >
              {/* Cosmic background effect for selected mode */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-2xl" />
              )}
              
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{mode.icon}</span>
                    <div>
                      <h3 className={`font-bold text-lg ${
                        isSelected 
                          ? `text-transparent bg-clip-text bg-gradient-to-r ${mode.gradient}` 
                          : 'text-white'
                      }`}>
                        {mode.name}
                      </h3>
                      <div className="text-xs text-slate-400">{mode.difficulty}</div>
                    </div>
                  </div>
                  
                  {/* Imprint Power */}
                  <div className="text-center">
                    <div className={`text-sm font-bold ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}>
                      {mode.imprintPower}%
                    </div>
                    <div className="text-xs text-slate-500">Power</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4">
                  {mode.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {mode.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? `bg-gradient-to-r ${mode.gradient}` : 'bg-slate-500'
                      }`} />
                      <span className="text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <div className="font-bold text-white">{stats.totalSessions}</div>
                    <div className="text-slate-400">Sessions</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <div className="font-bold text-amber-400">{Math.round(stats.avgScore)}</div>
                    <div className="text-slate-400">Avg Score</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <div className="font-bold text-purple-400">{stats.totalXP}</div>
                    <div className="text-slate-400">Total XP</div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${mode.gradient} animate-pulse`} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
          <div className="text-2xl font-bold text-purple-400">{engineData.totalSessions}</div>
          <div className="text-sm text-slate-300">Total Sessions</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
          <div className="text-2xl font-bold text-amber-400">{Math.round(engineData.averageLucidImprint)}</div>
          <div className="text-sm text-slate-300">Avg Imprint</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
          <div className="text-2xl font-bold text-green-400">{engineData.currentStreak}</div>
          <div className="text-sm text-slate-300">Current Streak</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">{Object.keys(engineData.dlcSagas).length}</div>
          <div className="text-sm text-slate-300">DLC Sagas</div>
        </div>
      </div>

      {/* Mode Description Detail */}
      {selectedMode && (
        <div className="p-6 bg-slate-800/40 border border-slate-600/40 rounded-xl">
          <h4 className="text-xl font-bold text-white mb-3">
            {modes.find(m => m.type === selectedMode)?.name} Details
          </h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-purple-300 mb-2">How It Works:</h5>
              <div className="text-sm text-slate-400 space-y-1">
                {selectedMode === 'text' && (
                  <>
                    <p>• Write immersive first-person experiences</p>
                    <p>• Use feeling boosters to enhance realism</p>
                    <p>• Real-time scoring and XP calculation</p>
                    <p>• Template library for inspiration</p>
                  </>
                )}
                {selectedMode === 'image' && (
                  <>
                    <p>• View curated image sequences</p>
                    <p>• Guided visual meditation flow</p>
                    <p>• Emotional trigger optimization</p>
                    <p>• Custom sequence creation</p>
                  </>
                )}
                {selectedMode === 'deck' && (
                  <>
                    <p>• Draw from mystical card decks</p>
                    <p>• Symbolic interpretation system</p>
                    <p>• Random or guided draws</p>
                    <p>• Destiny path unlocking</p>
                  </>
                )}
                {selectedMode === 'voice' && (
                  <>
                    <p>• AI-narrated immersive stories</p>
                    <p>• Voice recording and analysis</p>
                    <p>• Audio trigger optimization</p>
                    <p>• XTTS integration available</p>
                  </>
                )}
                {selectedMode === 'passive' && (
                  <>
                    <p>• Relaxed observation mode</p>
                    <p>• Guided meditation sequences</p>
                    <p>• Choice-based reward system</p>
                    <p>• Minimum effort, maximum absorption</p>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-pink-300 mb-2">Best For:</h5>
              <div className="text-sm text-slate-400 space-y-1">
                {selectedMode === 'text' && (
                  <>
                    <p>• Writers and creative minds</p>
                    <p>• Detailed fantasy exploration</p>
                    <p>• Building lucid dream scenarios</p>
                    <p>• First-time users</p>
                  </>
                )}
                {selectedMode === 'image' && (
                  <>
                    <p>• Visual learners</p>
                    <p>• Meditation practitioners</p>
                    <p>• Quick inspiration sessions</p>
                    <p>• Aesthetic experience seekers</p>
                  </>
                )}
                {selectedMode === 'deck' && (
                  <>
                    <p>• Mystical experience seekers</p>
                    <p>• Tarot and oracle card users</p>
                    <p>• Surprise and serendipity lovers</p>
                    <p>• Advanced practitioners</p>
                  </>
                )}
                {selectedMode === 'voice' && (
                  <>
                    <p>• Audio learners</p>
                    <p>• Hands-free experience</p>
                    <p>• Vocal expression practice</p>
                    <p>• Deep immersion seekers</p>
                  </>
                )}
                {selectedMode === 'passive' && (
                  <>
                    <p>• Busy schedules</p>
                    <p>• Relaxation focused</p>
                    <p>• Low energy sessions</p>
                    <p>• Meditation beginners</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}