'use client';

import React, { useState, useEffect } from 'react';
import { useSimulationEngine, type SimulationSession } from '../hooks/useSimulationEngine';
import { useCompanionScanner } from '../hooks/useCompanionScanner';
import { useEmotionEngine } from '../hooks/useEmotionEngine';
import { VoiceMode } from './VoiceMode';
import SimulationModes from './SimulationModes';
import DLCLoader from './DLCLoader';

interface RitualStep {
  id: string;
  type: 'mode_selection' | 'dlc_selection' | 'content_input' | 'voice_recording' | 'companion_scan' | 'emotion_analysis' | 'fusion_complete';
  data?: any;
  completed: boolean;
  skippable: boolean;
}

interface FusionRitual {
  id: string;
  name: string;
  description: string;
  steps: RitualStep[];
  sessionIds: string[];
  totalXP: number;
  combinedLucidScore: number;
  fusionBonuses: FusionBonus[];
  completedAt?: string;
}

interface FusionBonus {
  type: 'multi_mode' | 'cross_session' | 'companion_synergy' | 'saga_continuity' | 'voice_emotion';
  name: string;
  description: string;
  multiplier: number;
  icon: string;
}

export const RitualFusion: React.FC = () => {
  const [currentRitual, setCurrentRitual] = useState<FusionRitual | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [fusionMode, setFusionMode] = useState<'create' | 'guided' | 'advanced'>('create');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [ritualName, setRitualName] = useState('');
  const [sessions, setSessions] = useState<Partial<SimulationSession>[]>([]);
  
  const { 
    startSession, 
    completeSession, 
    calculateLucidImprintScore 
  } = useSimulationEngine();
  
  const { scanContent } = useCompanionScanner();
  const { analyzeSession } = useEmotionEngine();

  // Pre-defined ritual templates
  const ritualTemplates = [
    {
      id: 'transcendent_journey',
      name: 'Transcendent Journey',
      description: 'A complete multi-modal experience combining text meditation, voice affirmations, and companion bonding',
      modes: ['text', 'voice', 'deck'],
      estimatedDuration: 45,
      difficulty: 'Advanced',
      bonuses: ['Multi-Mode Mastery', 'Voice-Text Synergy', 'Companion Amplification']
    },
    {
      id: 'companion_romance',
      name: 'Companion Romance Saga',
      description: 'Deep relationship building through multiple sessions with progressive intimacy',
      modes: ['text', 'image', 'voice'],
      estimatedDuration: 60,
      difficulty: 'Expert',
      bonuses: ['Romance Progression', 'Multi-Session Continuity', 'Emotional Crescendo']
    },
    {
      id: 'lucidity_amplifier',
      name: 'Lucidity Amplifier',
      description: 'Maximize consciousness programming through strategic mode combination',
      modes: ['passive', 'text', 'deck'],
      estimatedDuration: 30,
      difficulty: 'Intermediate',
      bonuses: ['Lucid Score Boost', 'Passive Enhancement', 'Reality Programming']
    },
    {
      id: 'voice_dominance',
      name: 'Voice Dominance Experience',
      description: 'Immersive audio-focused ritual with TTS integration and voice commands',
      modes: ['voice'],
      estimatedDuration: 35,
      difficulty: 'Advanced',
      bonuses: ['Voice Mastery', 'Audio Immersion', 'Submission Training']
    }
  ];

  // Calculate fusion bonuses based on session combination
  const calculateFusionBonuses = (sessions: Partial<SimulationSession>[]): FusionBonus[] => {
    const bonuses: FusionBonus[] = [];
    const modes = [...new Set(sessions.map(s => s.type).filter(Boolean))];
    const companions = [...new Set(sessions.flatMap(s => s.companionsDetected || []))];

    // Multi-mode bonus
    if (modes.length >= 2) {
      bonuses.push({
        type: 'multi_mode',
        name: 'Multi-Modal Synergy',
        description: `Combining ${modes.length} different simulation modes amplifies consciousness programming`,
        multiplier: 1 + (modes.length * 0.2),
        icon: '🔀'
      });
    }

    // Cross-session continuity
    if (sessions.length >= 2) {
      bonuses.push({
        type: 'cross_session',
        name: 'Ritual Continuity',
        description: 'Sustained focus across multiple sessions creates deeper imprints',
        multiplier: 1 + (sessions.length * 0.15),
        icon: '🔗'
      });
    }

    // Companion synergy
    if (companions.length >= 2) {
      bonuses.push({
        type: 'companion_synergy',
        name: 'Companion Harmony',
        description: `Bonding with ${companions.length} companions creates powerful relationship resonance`,
        multiplier: 1 + (companions.length * 0.25),
        icon: '💞'
      });
    }

    // Voice + emotion bonus
    if (modes.includes('voice') && sessions.some(s => (s.emotionScore || 0) > 70)) {
      bonuses.push({
        type: 'voice_emotion',
        name: 'Vocal Emotional Amplification',
        description: 'Voice recordings with high emotion create transcendent experiences',
        multiplier: 1.4,
        icon: '🎙️💫'
      });
    }

    // Saga continuity bonus
    const dlcSagas = [...new Set(sessions.map(s => s.dlcSaga?.id).filter(Boolean))];
    if (dlcSagas.length >= 1 && sessions.filter(s => s.dlcSaga).length >= 2) {
      bonuses.push({
        type: 'saga_continuity',
        name: 'Saga Progression',
        description: 'Following DLC storylines through multiple sessions unlocks narrative power',
        multiplier: 1.3,
        icon: '📖'
      });
    }

    return bonuses;
  };

  // Start a new fusion ritual
  const startNewRitual = (template?: typeof ritualTemplates[0]) => {
    const steps: RitualStep[] = [
      {
        id: 'mode_selection',
        type: 'mode_selection',
        completed: false,
        skippable: false
      },
      {
        id: 'dlc_selection',
        type: 'dlc_selection',
        completed: false,
        skippable: true
      }
    ];

    // Add steps for each mode
    const modes = template?.modes || ['text'];
    modes.forEach((mode, index) => {
      if (mode === 'voice') {
        steps.push({
          id: `voice_${index}`,
          type: 'voice_recording',
          data: { mode },
          completed: false,
          skippable: false
        });
      } else {
        steps.push({
          id: `content_${index}`,
          type: 'content_input',
          data: { mode },
          completed: false,
          skippable: false
        });
      }
    });

    steps.push(
      {
        id: 'companion_scan',
        type: 'companion_scan',
        completed: false,
        skippable: true
      },
      {
        id: 'emotion_analysis',
        type: 'emotion_analysis',
        completed: false,
        skippable: false
      },
      {
        id: 'fusion_complete',
        type: 'fusion_complete',
        completed: false,
        skippable: false
      }
    );

    const newRitual: FusionRitual = {
      id: Date.now().toString(),
      name: template?.name || ritualName || 'Custom Fusion Ritual',
      description: template?.description || 'A custom multi-modal consciousness programming ritual',
      steps,
      sessionIds: [],
      totalXP: 0,
      combinedLucidScore: 0,
      fusionBonuses: []
    };

    setCurrentRitual(newRitual);
    setCurrentStep(0);
    setSessions([]);
  };

  // Complete current step and advance
  const completeStep = (stepData?: any) => {
    if (!currentRitual) return;

    const updatedSteps = [...currentRitual.steps];
    updatedSteps[currentStep] = { ...updatedSteps[currentStep], completed: true, data: stepData };

    const updatedRitual = { ...currentRitual, steps: updatedSteps };
    setCurrentRitual(updatedRitual);

    // Process step data
    if (stepData) {
      switch (updatedSteps[currentStep].type) {
        case 'mode_selection':
          setSelectedModes(stepData.modes);
          break;
        case 'content_input':
        case 'voice_recording':
          const newSession: Partial<SimulationSession> = {
            id: Date.now().toString(),
            type: stepData.mode || stepData.type,
            textContent: stepData.content || stepData.transcript,
            voiceTranscript: stepData.transcript,
            timestamp: new Date().toISOString(),
            duration: stepData.duration || 0
          };
          setSessions(prev => [...prev, newSession]);
          break;
      }
    }

    // Advance to next step
    if (currentStep < currentRitual.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Skip current step if allowed
  const skipStep = () => {
    if (!currentRitual || !currentRitual.steps[currentStep].skippable) return;
    
    const updatedSteps = [...currentRitual.steps];
    updatedSteps[currentStep] = { ...updatedSteps[currentStep], completed: true };
    
    setCurrentRitual({ ...currentRitual, steps: updatedSteps });
    
    if (currentStep < currentRitual.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Complete the entire ritual
  const completeRitual = () => {
    if (!currentRitual) return;

    // Analyze all sessions
    const analyzedSessions = sessions.map(session => {
      const companionScan = scanContent(session.textContent || session.voiceTranscript || '', session.type || 'text');
      const emotionAnalysis = analyzeSession({
        ...session,
        companionsDetected: companionScan.companionsDetected.map(d => d.name)
      });

      return {
        ...session,
        companionsDetected: companionScan.companionsDetected.map(d => d.name),
        lucidImprintScore: emotionAnalysis.lucidImprintScore,
        emotionScore: emotionAnalysis.emotionScore,
        climaxScore: emotionAnalysis.climaxScore,
        xpGained: emotionAnalysis.xpReward
      };
    });

    // Calculate fusion bonuses
    const fusionBonuses = calculateFusionBonuses(analyzedSessions);
    
    // Apply bonuses
    let totalXP = analyzedSessions.reduce((sum, s) => sum + (s.xpGained || 0), 0);
    let avgLucidScore = analyzedSessions.reduce((sum, s) => sum + (s.lucidImprintScore || 0), 0) / analyzedSessions.length;

    fusionBonuses.forEach(bonus => {
      totalXP *= bonus.multiplier;
      if (bonus.type === 'multi_mode' || bonus.type === 'voice_emotion') {
        avgLucidScore *= bonus.multiplier;
      }
    });

    const completedRitual: FusionRitual = {
      ...currentRitual,
      sessionIds: analyzedSessions.map(s => s.id!),
      totalXP: Math.round(totalXP),
      combinedLucidScore: Math.round(avgLucidScore),
      fusionBonuses,
      completedAt: new Date().toISOString()
    };

    // Save and display results
    alert(`🌟 Ritual Complete! 🌟\n\nXP Gained: ${completedRitual.totalXP}\nCombined Lucid Score: ${completedRitual.combinedLucidScore}\nFusion Bonuses: ${fusionBonuses.length}`);
    
    // Reset for next ritual
    setCurrentRitual(null);
    setCurrentStep(0);
    setSessions([]);
  };

  // Render current step
  const renderCurrentStep = () => {
    if (!currentRitual) return null;

    const step = currentRitual.steps[currentStep];
    
    switch (step.type) {
      case 'mode_selection':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-300">Select Simulation Modes</h3>
            <SimulationModes
              onModeSelect={(mode) => completeStep({ modes: [mode] })}
            />
          </div>
        );

      case 'dlc_selection':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-300">Choose DLC Saga (Optional)</h3>
            <DLCLoader 
              onSagaSelect={(saga) => completeStep({ saga })}
            />
            <div className="text-center">
              <button
                onClick={skipStep}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white transition-colors"
              >
                Skip DLC Selection
              </button>
            </div>
          </div>
        );

      case 'content_input':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-300">
              {step.data?.mode?.charAt(0).toUpperCase() + step.data?.mode?.slice(1)} Session Input
            </h3>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <textarea
                placeholder={`Enter your ${step.data?.mode} content for the ritual...`}
                className="w-full h-40 p-4 bg-gray-700 rounded-lg text-white resize-none"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    completeStep({ 
                      mode: step.data?.mode,
                      content: e.target.value,
                      duration: Math.floor(e.target.value.length / 10) // Estimate duration
                    });
                  }
                }}
              />
            </div>
          </div>
        );

      case 'voice_recording':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-300">Voice Recording Session</h3>
            <VoiceMode
              onComplete={(transcript, audioData) => {
                completeStep({
                  mode: 'voice',
                  transcript,
                  audioData,
                  duration: 60 // Placeholder duration
                });
              }}
              onCancel={() => skipStep()}
            />
          </div>
        );

      case 'companion_scan':
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold text-purple-300">Companion Analysis</h3>
            <div className="text-gray-400">
              Analyzing companion interactions across all sessions...
            </div>
            <button
              onClick={() => {
                // Auto-complete with companion analysis
                const allContent = sessions.map(s => s.textContent || s.voiceTranscript || '').join(' ');
                const companionScan = scanContent(allContent, 'text');
                completeStep({ companionScan });
              }}
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-bold text-white transition-colors"
            >
              Analyze Companions
            </button>
          </div>
        );

      case 'emotion_analysis':
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold text-purple-300">Emotional Synthesis</h3>
            <div className="text-gray-400">
              Synthesizing emotional and lucidity data from all sessions...
            </div>
            <button
              onClick={() => {
                // Auto-complete with emotion analysis
                completeStep({ emotionAnalysis: 'complete' });
              }}
              className="px-8 py-4 bg-pink-500 hover:bg-pink-600 rounded-lg font-bold text-white transition-colors"
            >
              Complete Analysis
            </button>
          </div>
        );

      case 'fusion_complete':
        return (
          <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold text-yellow-300">Ritual Fusion Complete!</h3>
            <div className="text-gray-300">
              All sessions have been analyzed and bonuses calculated.
            </div>
            <button
              onClick={completeRitual}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-bold text-white transition-all"
            >
              Claim Fusion Rewards
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentRitual) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            🔥 Ritual Fusion Engine
          </h1>
          <p className="text-gray-400">
            Combine multiple simulation modes for transcendent experiences and massive bonuses
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-purple-300">Choose Your Approach</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setFusionMode('create')}
              className={`p-6 rounded-lg border-2 transition-all ${
                fusionMode === 'create' 
                  ? 'border-purple-500 bg-purple-500/20' 
                  : 'border-gray-600 hover:border-purple-500/50'
              }`}
            >
              <div className="text-4xl mb-2">🎨</div>
              <div className="font-bold">Create Custom</div>
              <div className="text-sm text-gray-400 mt-2">Design your own unique ritual</div>
            </button>
            
            <button
              onClick={() => setFusionMode('guided')}
              className={`p-6 rounded-lg border-2 transition-all ${
                fusionMode === 'guided' 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-gray-600 hover:border-blue-500/50'
              }`}
            >
              <div className="text-4xl mb-2">🧭</div>
              <div className="font-bold">Guided Templates</div>
              <div className="text-sm text-gray-400 mt-2">Use proven ritual patterns</div>
            </button>
            
            <button
              onClick={() => setFusionMode('advanced')}
              className={`p-6 rounded-lg border-2 transition-all ${
                fusionMode === 'advanced' 
                  ? 'border-red-500 bg-red-500/20' 
                  : 'border-gray-600 hover:border-red-500/50'
              }`}
            >
              <div className="text-4xl mb-2">⚡</div>
              <div className="font-bold">Advanced Fusion</div>
              <div className="text-sm text-gray-400 mt-2">Maximum customization</div>
            </button>
          </div>
        </div>

        {/* Template Selection */}
        {fusionMode === 'guided' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-blue-300">Ritual Templates</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {ritualTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Modes:</span>
                      <div className="flex gap-1">
                        {template.modes.map((mode, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 rounded text-blue-300 text-xs">
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration: {template.estimatedDuration}min</span>
                      <span className={`${
                        template.difficulty === 'Expert' ? 'text-red-400' :
                        template.difficulty === 'Advanced' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {template.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => startNewRitual(template)}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold text-white transition-colors"
                  >
                    Start Ritual
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Ritual Creation */}
        {fusionMode === 'create' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-purple-300">Create Custom Ritual</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="mb-4">
                <label htmlFor="ritual-name" className="block text-sm font-medium mb-2">Ritual Name</label>
                <input
                  id="ritual-name"
                  type="text"
                  value={ritualName}
                  onChange={(e) => setRitualName(e.target.value)}
                  placeholder="Enter a name for your custom ritual..."
                  className="w-full p-3 bg-gray-700 rounded-lg text-white"
                />
              </div>
              
              <button
                onClick={() => startNewRitual()}
                disabled={!ritualName.trim()}
                className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 rounded-lg font-bold text-white transition-colors"
              >
                Begin Custom Ritual
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ritual Progress */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">{currentRitual.name}</h1>
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {currentRitual.steps.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
            {...({ style: { width: `${((currentStep + 1) / currentRitual.steps.length) * 100}%` } })}
          />
        </div>
        
        <p className="text-gray-300">{currentRitual.description}</p>
      </div>

      {/* Current Step */}
      <div className="bg-gray-800/30 rounded-lg p-6">
        {renderCurrentStep()}
      </div>

      {/* Sessions Progress */}
      {sessions.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            Sessions Completed: {sessions.length}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {sessions.map((session, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                <div className="font-medium capitalize text-white">{session.type} Session</div>
                <div className="text-sm text-gray-400">
                  {session.textContent?.slice(0, 50) || session.voiceTranscript?.slice(0, 50)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};