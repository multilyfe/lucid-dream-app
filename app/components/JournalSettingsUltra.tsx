'use client';

import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { useHydrated } from '../hooks/useHydrated';

// Ultra-Advanced Dream Journal Settings Interface
interface JournalAISettings {
  // AI Analysis
  enableAIAnalysis: boolean;
  aiProvider: 'openai' | 'anthropic' | 'local' | 'comfyui';
  openaiApiKey: string;
  anthropicApiKey: string;
  localAIEndpoint: string;
  comfyUIEndpoint: string;
  analysisDepth: 'basic' | 'advanced' | 'ultra';
  autoAnalyzeOnSave: boolean;
  
  // ComfyUI Integration
  comfyUIWorkflows: {
    dreamVisualization: string;
    symbolAnalysis: string;
    moodMapping: string;
    lucidityTraining: string;
  };
  
  // Voice & Audio
  enableVoiceRecording: boolean;
  voiceToTextProvider: 'whisper' | 'google' | 'azure';
  ambientSoundsEnabled: boolean;
  defaultSoundscape: string;
  voiceAnalysisEnabled: boolean;
  emotionDetection: boolean;
  
  // Visual Features
  enableDreamSketching: boolean;
  autoGenerateImages: boolean;
  sketchToImageAI: boolean;
  colorPaletteExtraction: boolean;
  visualMoodMapping: boolean;
  
  // Smart Features
  autoTagging: boolean;
  symbolDetection: boolean;
  patternRecognition: boolean;
  lucidityTriggerDetection: boolean;
  realityCheckSuggestions: boolean;
  progressTracking: boolean;
  
  // Notifications & Reminders
  dreamRecallReminders: boolean;
  lucidityTrainingSchedule: boolean;
  realityCheckAlerts: boolean;
  journalReminders: boolean;
  achievementNotifications: boolean;
  
  // Privacy & Data
  cloudSync: boolean;
  encryptEntries: boolean;
  anonymizeData: boolean;
  dataRetention: number; // days
  exportFormat: 'json' | 'pdf' | 'markdown' | 'obsidian';
  
  // UI/UX
  particleEffects: boolean;
  glowAnimations: boolean;
  dreamTheme: 'mystical' | 'cyber' | 'nature' | 'space' | 'minimal';
  fontSize: 'small' | 'medium' | 'large';
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    dyslexiaFont: boolean;
  };
}

const DEFAULT_SETTINGS: JournalAISettings = {
  enableAIAnalysis: true,
  aiProvider: 'openai',
  openaiApiKey: '',
  anthropicApiKey: '',
  localAIEndpoint: 'http://localhost:11434',
  comfyUIEndpoint: 'http://localhost:8188',
  analysisDepth: 'advanced',
  autoAnalyzeOnSave: true,
  
  comfyUIWorkflows: {
    dreamVisualization: 'dream_vision_v2.json',
    symbolAnalysis: 'symbol_detect.json',
    moodMapping: 'mood_colors.json',
    lucidityTraining: 'lucid_prompt.json',
  },
  
  enableVoiceRecording: true,
  voiceToTextProvider: 'whisper',
  ambientSoundsEnabled: true,
  defaultSoundscape: 'cosmic',
  voiceAnalysisEnabled: true,
  emotionDetection: true,
  
  enableDreamSketching: true,
  autoGenerateImages: true,
  sketchToImageAI: true,
  colorPaletteExtraction: true,
  visualMoodMapping: true,
  
  autoTagging: true,
  symbolDetection: true,
  patternRecognition: true,
  lucidityTriggerDetection: true,
  realityCheckSuggestions: true,
  progressTracking: true,
  
  dreamRecallReminders: true,
  lucidityTrainingSchedule: true,
  realityCheckAlerts: true,
  journalReminders: true,
  achievementNotifications: true,
  
  cloudSync: false,
  encryptEntries: true,
  anonymizeData: false,
  dataRetention: 365,
  exportFormat: 'json',
  
  particleEffects: true,
  glowAnimations: true,
  dreamTheme: 'mystical',
  fontSize: 'medium',
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    dyslexiaFont: false,
  },
};

export function JournalSettingsUltra() {
  const [settings, setSettings] = usePersistentState<JournalAISettings>('journalAISettings', () => DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('ai-integration');
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const hydrated = useHydrated();

  const updateSetting = <K extends keyof JournalAISettings>(key: K, value: JournalAISettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = <T extends Record<string, any>>(
    parentKey: keyof JournalAISettings,
    childKey: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as unknown as T),
        [childKey]: value
      }
    }));
  };

  const testConnection = async (provider: string) => {
    setTestingConnection(provider);
    
    try {
      switch (provider) {
        case 'comfyui':
          const comfyResponse = await fetch(`${settings.comfyUIEndpoint}/system_stats`);
          if (comfyResponse.ok) {
            alert('✅ ComfyUI connection successful!');
          } else {
            throw new Error('ComfyUI not responding');
          }
          break;
          
        case 'local':
          const localResponse = await fetch(`${settings.localAIEndpoint}/api/tags`);
          if (localResponse.ok) {
            alert('✅ Local AI connection successful!');
          } else {
            throw new Error('Local AI not responding');
          }
          break;
          
        case 'openai':
          if (!settings.openaiApiKey) {
            throw new Error('OpenAI API key required');
          }
          alert('✅ OpenAI API key configured!');
          break;
          
        case 'anthropic':
          if (!settings.anthropicApiKey) {
            throw new Error('Anthropic API key required');
          }
          alert('✅ Anthropic API key configured!');
          break;
      }
    } catch (error) {
      alert(`❌ ${provider} connection failed: ${error}`);
    } finally {
      setTestingConnection(null);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dream-journal-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings({ ...DEFAULT_SETTINGS, ...imported });
        alert('✅ Settings imported successfully!');
      } catch (error) {
        alert('❌ Failed to import settings: Invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      alert('✅ Settings reset to defaults!');
    }
  };

  const tabs = [
    { id: 'ai-integration', label: '🤖 AI Integration', icon: '🧠' },
    { id: 'multimedia', label: '🎨 Multimedia', icon: '🎵' },
    { id: 'smart-features', label: '⚡ Smart Features', icon: '🔮' },
    { id: 'notifications', label: '🔔 Notifications', icon: '⏰' },
    { id: 'privacy', label: '🔒 Privacy & Data', icon: '🛡️' },
    { id: 'interface', label: '🎨 Interface', icon: '✨' },
  ];

  return (
    <div className="ultra-journal-settings min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {hydrated && [...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 4}s infinite linear`,
              animationDelay: `${Math.random() * 8}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Ultra Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🌟 ULTRA DREAM JOURNAL SETTINGS 🌟
          </h1>
          <p className="text-slate-300 text-lg">
            Configure the most advanced dream journaling experience ever created
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/60 backdrop-blur-sm p-8">
          
          {/* AI Integration Tab */}
          {activeTab === 'ai-integration' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">🤖 AI Integration & Analysis</h2>
              
              {/* AI Provider Selection */}
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Provider Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
                    <select
                      value={settings.aiProvider}
                      onChange={(e) => updateSetting('aiProvider', e.target.value as any)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="openai">OpenAI GPT-4</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="local">Local AI (Ollama)</option>
                      <option value="comfyui">ComfyUI Workflows</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Analysis Depth</label>
                    <select
                      value={settings.analysisDepth}
                      onChange={(e) => updateSetting('analysisDepth', e.target.value as any)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="basic">Basic Analysis</option>
                      <option value="advanced">Advanced Analysis</option>
                      <option value="ultra">Ultra Deep Analysis</option>
                    </select>
                  </div>
                </div>

                {/* API Keys */}
                {settings.aiProvider === 'openai' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">OpenAI API Key</label>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        value={settings.openaiApiKey}
                        onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:border-purple-400/60 focus:outline-none"
                      />
                      <button
                        onClick={() => testConnection('openai')}
                        disabled={testingConnection === 'openai'}
                        className="px-4 py-3 bg-green-600/20 border border-green-400/40 text-green-200 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
                      >
                        {testingConnection === 'openai' ? '⏳' : '🧪'} Test
                      </button>
                    </div>
                  </div>
                )}

                {settings.aiProvider === 'anthropic' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Anthropic API Key</label>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        value={settings.anthropicApiKey}
                        onChange={(e) => updateSetting('anthropicApiKey', e.target.value)}
                        placeholder="sk-ant-..."
                        className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:border-purple-400/60 focus:outline-none"
                      />
                      <button
                        onClick={() => testConnection('anthropic')}
                        disabled={testingConnection === 'anthropic'}
                        className="px-4 py-3 bg-green-600/20 border border-green-400/40 text-green-200 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
                      >
                        {testingConnection === 'anthropic' ? '⏳' : '🧪'} Test
                      </button>
                    </div>
                  </div>
                )}

                {settings.aiProvider === 'local' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Local AI Endpoint</label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={settings.localAIEndpoint}
                        onChange={(e) => updateSetting('localAIEndpoint', e.target.value)}
                        placeholder="http://localhost:11434"
                        className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:border-purple-400/60 focus:outline-none"
                      />
                      <button
                        onClick={() => testConnection('local')}
                        disabled={testingConnection === 'local'}
                        className="px-4 py-3 bg-green-600/20 border border-green-400/40 text-green-200 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
                      >
                        {testingConnection === 'local' ? '⏳' : '🧪'} Test
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Requires Ollama running locally with llama2, codellama, or similar models
                    </p>
                  </div>
                )}

                {settings.aiProvider === 'comfyui' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">ComfyUI Endpoint</label>
                      <div className="flex gap-3">
                        <input
                          type="url"
                          value={settings.comfyUIEndpoint}
                          onChange={(e) => updateSetting('comfyUIEndpoint', e.target.value)}
                          placeholder="http://localhost:8188"
                          className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:border-purple-400/60 focus:outline-none"
                        />
                        <button
                          onClick={() => testConnection('comfyui')}
                          disabled={testingConnection === 'comfyui'}
                          className="px-4 py-3 bg-green-600/20 border border-green-400/40 text-green-200 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50"
                        >
                          {testingConnection === 'comfyui' ? '⏳' : '🧪'} Test
                        </button>
                      </div>
                    </div>

                    {/* ComfyUI Workflows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(settings.comfyUIWorkflows).map(([key, workflow]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')} Workflow
                          </label>
                          <input
                            type="text"
                            value={workflow}
                            onChange={(e) => updateNestedSetting('comfyUIWorkflows', key, e.target.value)}
                            placeholder="workflow.json"
                            className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-purple-400/60 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Features */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.autoAnalyzeOnSave}
                      onChange={(e) => updateSetting('autoAnalyzeOnSave', e.target.checked)}
                      className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                    />
                    <div>
                      <div className="text-slate-200 font-medium">Auto-Analyze on Save</div>
                      <div className="text-slate-400 text-sm">Automatically analyze dreams when saved</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.enableAIAnalysis}
                      onChange={(e) => updateSetting('enableAIAnalysis', e.target.checked)}
                      className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                    />
                    <div>
                      <div className="text-slate-200 font-medium">Enable AI Analysis</div>
                      <div className="text-slate-400 text-sm">AI-powered dream interpretation</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Multimedia Tab */}
          {activeTab === 'multimedia' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">🎨 Multimedia & Creative Tools</h2>
              
              {/* Voice & Audio */}
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🎵 Voice & Audio Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Voice-to-Text Provider</label>
                    <select
                      value={settings.voiceToTextProvider}
                      onChange={(e) => updateSetting('voiceToTextProvider', e.target.value as any)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="whisper">OpenAI Whisper</option>
                      <option value="google">Google Speech-to-Text</option>
                      <option value="azure">Azure Speech Services</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Default Soundscape</label>
                    <select
                      value={settings.defaultSoundscape}
                      onChange={(e) => updateSetting('defaultSoundscape', e.target.value)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="cosmic">Cosmic Ambience</option>
                      <option value="forest">Forest Sounds</option>
                      <option value="ocean">Ocean Waves</option>
                      <option value="rain">Gentle Rain</option>
                      <option value="tibetan">Tibetan Bowls</option>
                      <option value="binaural">Binaural Beats</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'enableVoiceRecording', label: 'Voice Recording', desc: 'Record voice notes with dreams' },
                    { key: 'ambientSoundsEnabled', label: 'Ambient Sounds', desc: 'Background soundscapes while journaling' },
                    { key: 'voiceAnalysisEnabled', label: 'Voice Analysis', desc: 'Analyze voice patterns and emotions' },
                    { key: 'emotionDetection', label: 'Emotion Detection', desc: 'Detect emotions from voice tone' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof JournalAISettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof JournalAISettings, e.target.checked as any)}
                        className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                      />
                      <div>
                        <div className="text-slate-200 font-medium">{label}</div>
                        <div className="text-slate-400 text-sm">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Visual Features */}
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🎨 Visual & Creative Tools</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'enableDreamSketching', label: 'Dream Sketching Canvas', desc: 'Draw your dreams visually' },
                    { key: 'autoGenerateImages', label: 'AI Image Generation', desc: 'Generate images from dream descriptions' },
                    { key: 'sketchToImageAI', label: 'Sketch to Image AI', desc: 'Convert sketches to realistic images' },
                    { key: 'colorPaletteExtraction', label: 'Color Palette Extraction', desc: 'Extract mood colors from descriptions' },
                    { key: 'visualMoodMapping', label: 'Visual Mood Mapping', desc: 'Map emotions to visual patterns' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof JournalAISettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof JournalAISettings, e.target.checked as any)}
                        className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                      />
                      <div>
                        <div className="text-slate-200 font-medium">{label}</div>
                        <div className="text-slate-400 text-sm">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Smart Features Tab */}
          {activeTab === 'smart-features' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">⚡ Smart Features & AI Insights</h2>
              
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🔮 Intelligent Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'autoTagging', label: 'Auto-Tagging', desc: 'Automatically detect and add relevant tags' },
                    { key: 'symbolDetection', label: 'Symbol Detection', desc: 'Identify dream symbols and their meanings' },
                    { key: 'patternRecognition', label: 'Pattern Recognition', desc: 'Find recurring themes and patterns' },
                    { key: 'lucidityTriggerDetection', label: 'Lucidity Trigger Detection', desc: 'Identify potential lucidity triggers' },
                    { key: 'realityCheckSuggestions', label: 'Reality Check Suggestions', desc: 'Suggest personalized reality checks' },
                    { key: 'progressTracking', label: 'Progress Tracking', desc: 'Track lucid dreaming progress over time' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof JournalAISettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof JournalAISettings, e.target.checked as any)}
                        className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                      />
                      <div>
                        <div className="text-slate-200 font-medium">{label}</div>
                        <div className="text-slate-400 text-sm">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">🔔 Notifications & Reminders</h2>
              
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">⏰ Smart Notifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'dreamRecallReminders', label: 'Dream Recall Reminders', desc: 'Morning reminders to record dreams' },
                    { key: 'lucidityTrainingSchedule', label: 'Lucidity Training Schedule', desc: 'Scheduled lucidity training sessions' },
                    { key: 'realityCheckAlerts', label: 'Reality Check Alerts', desc: 'Random reality check reminders' },
                    { key: 'journalReminders', label: 'Journal Reminders', desc: 'Reminders to update your journal' },
                    { key: 'achievementNotifications', label: 'Achievement Notifications', desc: 'Celebrate milestones and progress' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof JournalAISettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof JournalAISettings, e.target.checked as any)}
                        className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                      />
                      <div>
                        <div className="text-slate-200 font-medium">{label}</div>
                        <div className="text-slate-400 text-sm">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Data Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">🔒 Privacy & Data Management</h2>
              
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🛡️ Data Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
                    <select
                      value={settings.exportFormat}
                      onChange={(e) => updateSetting('exportFormat', e.target.value as any)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="json">JSON (Machine Readable)</option>
                      <option value="pdf">PDF (Human Readable)</option>
                      <option value="markdown">Markdown (Universal)</option>
                      <option value="obsidian">Obsidian Vault</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Data Retention (Days)</label>
                    <input
                      type="number"
                      min="30"
                      max="3650"
                      value={settings.dataRetention}
                      onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value) || 365)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'cloudSync', label: 'Cloud Sync', desc: 'Sync data across devices' },
                    { key: 'encryptEntries', label: 'Encrypt Entries', desc: 'Encrypt all journal entries locally' },
                    { key: 'anonymizeData', label: 'Anonymize Data', desc: 'Remove personal identifiers' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof JournalAISettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof JournalAISettings, e.target.checked as any)}
                        className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                      />
                      <div>
                        <div className="text-slate-200 font-medium">{label}</div>
                        <div className="text-slate-400 text-sm">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interface Tab */}
          {activeTab === 'interface' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 mb-6">🎨 Interface & Accessibility</h2>
              
              <div className="bg-slate-800/60 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">✨ Visual Experience</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Dream Theme</label>
                    <select
                      value={settings.dreamTheme}
                      onChange={(e) => updateSetting('dreamTheme', e.target.value as any)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="mystical">Mystical Dreams</option>
                      <option value="cyber">Cyberpunk Vision</option>
                      <option value="nature">Nature's Embrace</option>
                      <option value="space">Cosmic Journey</option>
                      <option value="minimal">Minimal Focus</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Font Size</label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                      className="w-full bg-slate-700/60 border border-slate-600/40 rounded-lg px-4 py-3 text-slate-200 focus:border-purple-400/60 focus:outline-none"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'particleEffects', label: 'Particle Effects', desc: 'Floating dream particles' },
                    { key: 'glowAnimations', label: 'Glow Animations', desc: 'Magical glow effects' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof JournalAISettings] as boolean}
                        onChange={(e) => updateSetting(key as keyof JournalAISettings, e.target.checked as any)}
                        className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                      />
                      <div>
                        <div className="text-slate-200 font-medium">{label}</div>
                        <div className="text-slate-400 text-sm">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Accessibility Options */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-white mb-4">♿ Accessibility Options</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'highContrast', label: 'High Contrast', desc: 'Improved visibility for low vision' },
                      { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Minimize animations for sensitivity' },
                      { key: 'screenReader', label: 'Screen Reader Support', desc: 'Enhanced ARIA labels' },
                      { key: 'dyslexiaFont', label: 'Dyslexia-Friendly Font', desc: 'Font optimized for dyslexia' },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.accessibility[key as keyof typeof settings.accessibility]}
                          onChange={(e) => updateNestedSetting('accessibility', key, e.target.checked)}
                          className="w-5 h-5 text-purple-500 bg-slate-600 border-slate-500 rounded focus:ring-purple-400"
                        />
                        <div>
                          <div className="text-slate-200 font-medium">{label}</div>
                          <div className="text-slate-400 text-sm">{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={exportSettings}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/25"
          >
            📥 Export Settings
          </button>
          
          <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-green-500/25 cursor-pointer">
            📤 Import Settings
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          
          <button
            onClick={resetToDefaults}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg shadow-orange-500/25"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}