'use client';

import { useState } from 'react';
import QuestLayout from '../../layouts/QuestLayout';
import SimulationModes from '../../components/SimulationModes';
import DLCLoader from '../../components/DLCLoader';
import { VoiceMode } from '../../components/VoiceMode';
import { HistoryVault } from '../../components/HistoryVault';
import { RitualFusion } from '../../components/RitualFusion';
import { CompanionScannerPanel } from '../../components/CompanionScannerPanel';
import { EmotionResults } from '../../components/EmotionResults';
import { useSimulationEngine, type SimulationSession } from '../../hooks/useSimulationEngine';
import { useCompanionScanner } from '../../hooks/useCompanionScanner';
import { useEmotionEngine } from '../../hooks/useEmotionEngine';
import { useHistoryVault } from '../../hooks/useHistoryVault';
import { useRewardsSystem } from '../../hooks/useRewardsSystem';

export default function SimulationsPage() {
  const { 
    activeSession,
    createSession,
    completeSession
  } = useSimulationEngine();
  
  const { scanContent } = useCompanionScanner();
  const { analyzeSession } = useEmotionEngine();
  const { addSession } = useHistoryVault();
  const { updateStatsAfterSession } = useRewardsSystem();

  const [activeTab, setActiveTab] = useState<'modes' | 'dlc' | 'voice' | 'history' | 'fusion' | 'results'>('modes');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [companionScanResults, setCompanionScanResults] = useState<any>(null);

  // Handle mode selection and start session
  const handleModeSelect = (modes: string[]) => {
    if (modes.length === 1) {
      setSelectedMode(modes[0]);
      // For now, just switch tabs based on mode
      if (modes[0] === 'voice') {
        setActiveTab('voice');
      } else {
        setActiveTab('modes');
      }
    } else if (modes.length > 1) {
      // Multi-mode selection goes to fusion
      setActiveTab('fusion');
    }
  };

  // Handle session completion
  const handleSessionComplete = (sessionData: any) => {
    // Placeholder for session completion logic
    console.log('Session completed:', sessionData);
    setSessionResults(sessionData);
    setActiveTab('results');
  };

  // Handle voice mode completion
  const handleVoiceComplete = (transcript: string, audioData?: Blob) => {
    handleSessionComplete({
      voiceTranscript: transcript,
      duration: 60,
      textContent: transcript
    });
  };

  // Get current stats for display
  const getStats = () => {
    return {
      totalXP: 0,
      streak: 0,
      sessionsCount: 0
    };
  };

  const stats = getStats();

  return (
    <QuestLayout>
      <div className="min-h-screen bg-gradient-to-b from-violet-950 via-purple-900 to-indigo-950">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/20" />
          <div className="relative z-10 p-8">
            <h1 className="text-5xl font-bold text-white text-center mb-4">
              🧠💻 Simulation Ritual Engine™
            </h1>
            <p className="text-xl text-purple-200 text-center mb-8">
              Advanced Multi-Modal Lucid Dreaming Simulation System
            </p>

            {/* Stats Bar */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-sm text-purple-300">Total XP</div>
                <div className="text-2xl font-bold text-amber-400">{stats.totalXP}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-300">Current Streak</div>
                <div className="text-2xl font-bold text-purple-400">{stats.streak}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-300">Sessions</div>
                <div className="text-2xl font-bold text-cyan-400">{stats.sessionsCount}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center space-x-2 mb-8">
              <button
                onClick={() => setActiveTab('modes')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'modes'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                🎯 Simulation Modes
              </button>
              <button
                onClick={() => setActiveTab('dlc')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'dlc'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                📦 DLC Sagas
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'voice'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                🎤 Voice Mode
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                📜 History
              </button>
              <button
                onClick={() => setActiveTab('fusion')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'fusion'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                ⚡ Ritual Fusion
              </button>
              {sessionResults && (
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'results'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/50'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  📊 Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Simulation Modes Tab */}
          {activeTab === 'modes' && (
            <div className="max-w-6xl mx-auto">
              <SimulationModes onModeSelect={handleModeSelect} />
            </div>
          )}

          {/* DLC Loader Tab */}
          {activeTab === 'dlc' && (
            <div className="max-w-6xl mx-auto">
              <DLCLoader onSagaSelect={(saga) => console.log('Saga selected:', saga)} />
            </div>
          )}

          {/* Voice Mode Tab */}
          {activeTab === 'voice' && (
            <div className="max-w-6xl mx-auto">
              <VoiceMode onComplete={handleVoiceComplete} />
            </div>
          )}

          {/* History Vault Tab */}
          {activeTab === 'history' && (
            <div className="max-w-6xl mx-auto">
              <HistoryVault />
            </div>
          )}

          {/* Ritual Fusion Tab */}
          {activeTab === 'fusion' && (
            <div className="max-w-6xl mx-auto">
              <RitualFusion onFusionComplete={(result) => console.log('Fusion complete:', result)} />
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && sessionResults && (
            <div className="max-w-6xl mx-auto space-y-6">
              <EmotionResults 
                sessionData={sessionResults}
                onClose={() => setActiveTab('history')}
              />
              
              {companionScanResults && (
                <CompanionScannerPanel results={companionScanResults} />
              )}
            </div>
          )}
        </div>
      </div>
    </QuestLayout>
  );
}