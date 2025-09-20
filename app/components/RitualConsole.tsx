'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSimulationRituals, type SimulationRitual, type FeelingBooster } from '../hooks/useSimulationRituals';

interface RitualConsoleProps {
  onSimulationCreate: (ritual: SimulationRitual) => void;
}

export default function RitualConsole({ onSimulationCreate }: RitualConsoleProps) {
  const { 
    currentDraft, 
    saveDraft, 
    createSimulation, 
    calculateXPReward,
    getFeelingBoosters 
  } = useSimulationRituals();

  const [title, setTitle] = useState(currentDraft.title || '');
  const [type, setType] = useState<SimulationRitual['type']>(currentDraft.type || 'lucid_initiation');
  const [content, setContent] = useState(currentDraft.content || '');
  const [realismScore, setRealismScore] = useState(currentDraft.realismScore || 50);
  const [emotionScore, setEmotionScore] = useState(currentDraft.emotionScore || 50);
  const [linkedCompanions, setLinkedCompanions] = useState<string[]>(currentDraft.linkedCompanions || []);
  const [duration, setDuration] = useState(currentDraft.duration || 15);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeelingBoosters, setShowFeelingBoosters] = useState(false);

  const feelingBoosters = getFeelingBoosters();

  // Auto-save draft every 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft({
        title,
        type,
        content,
        realismScore,
        emotionScore,
        linkedCompanions,
        duration
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, type, content, realismScore, emotionScore, linkedCompanions, duration, saveDraft]);

  // Calculate real-time XP
  const previewXP = calculateXPReward(realismScore, emotionScore, content, type);

  // Handle typing animation
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 500);
    return () => clearTimeout(timer);
  }, [content]);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !content.trim()) return;

    const ritual = createSimulation({
      title: title.trim(),
      type,
      content: content.trim(),
      realismScore,
      emotionScore,
      linkedCompanions,
      duration,
      tags: [],
      dreamToken: previewXP > 100
    });

    onSimulationCreate(ritual);
    
    // Reset form
    setTitle('');
    setContent('');
    setRealismScore(50);
    setEmotionScore(50);
    setLinkedCompanions([]);
    setDuration(15);
  }, [title, type, content, realismScore, emotionScore, linkedCompanions, duration, previewXP, createSimulation, onSimulationCreate]);

  const applyFeelingBooster = useCallback((booster: FeelingBooster) => {
    const insertion = ` I ${booster.description.toLowerCase()}.`;
    setContent(prev => prev + insertion);
    setEmotionScore(prev => Math.min(100, prev + booster.emotionBonus));
    setRealismScore(prev => Math.min(100, prev + booster.realismBonus));
    setShowFeelingBoosters(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">🌀 Ritual Console</h2>
        <p className="text-slate-300">
          Immerse yourself in lucid dream simulation. Feel it, embody it, become it.
        </p>
      </div>

      {/* Form */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Console */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title & Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Ritual Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name your lucid experience..."
                className="w-full px-4 py-3 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Simulation Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SimulationRitual['type'])}
                title="Select simulation type"
                className="w-full px-4 py-3 bg-slate-800/60 border border-purple-500/30 rounded-xl text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              >
                <option value="lucid_initiation">🌙 Lucid Initiation</option>
                <option value="flight">🕊️ Flight Mastery</option>
                <option value="companion_encounter">👥 Companion Encounter</option>
                <option value="self_transformation">🦋 Self Transformation</option>
                <option value="erotic_simulation">💋 Erotic Simulation</option>
                <option value="custom">✨ Custom Experience</option>
              </select>
            </div>
          </div>

          {/* Main Text Area */}
          <div className="relative">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Immersive Experience
            </label>
            <div className={`relative ${isTyping ? 'animate-pulse' : ''}`}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="I realize I'm dreaming. I feel the shift in consciousness as lucidity floods my awareness..."
                rows={12}
                className={`w-full px-4 py-4 bg-slate-800/60 border rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none transition-all duration-300 ${
                  isTyping 
                    ? 'border-purple-400 shadow-lg shadow-purple-500/20 bg-slate-800/80' 
                    : 'border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                }`}
              />
              {/* Cosmic glow effect when typing */}
              {isTyping && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 pointer-events-none animate-pulse" />
              )}
            </div>
            
            {/* Character count and tips */}
            <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
              <span>{content.length} characters</span>
              <span>💡 Be specific with sensations, emotions, and details</span>
            </div>
          </div>

          {/* Feeling Boosters */}
          <div>
            <button
              onClick={() => setShowFeelingBoosters(!showFeelingBoosters)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg text-pink-300 hover:bg-pink-500/30 transition-all"
            >
              ✨ Feeling Boosters {showFeelingBoosters ? '▼' : '▶'}
            </button>
            
            {showFeelingBoosters && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {feelingBoosters.map((booster) => (
                  <button
                    key={booster.id}
                    onClick={() => applyFeelingBooster(booster)}
                    title={booster.description}
                    className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-xs text-slate-300 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
                  >
                    {booster.icon} {booster.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Time Spent (minutes): {duration}
            </label>
            <input
              type="range"
              min="5"
              max="60"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              title="Set simulation duration"
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>5 min</span>
              <span>Quick</span>
              <span>Deep</span>
              <span>60 min</span>
            </div>
          </div>
        </div>

        {/* Scoring Panel */}
        <div className="space-y-6">
          {/* Real-time XP Preview */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{previewXP}</div>
              <div className="text-sm text-amber-300">XP Reward</div>
              {previewXP > 100 && (
                <div className="mt-2 px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded">
                  🎁 Dream Token Bonus!
                </div>
              )}
            </div>
          </div>

          {/* Realism Score */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/40">
            <label className="block text-sm font-medium text-blue-300 mb-3">
              Realism Score: {realismScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={realismScore}
              onChange={(e) => setRealismScore(parseInt(e.target.value))}
              title="Adjust realism score"
              className="w-full accent-blue-500"
            />
            <div className="text-xs text-slate-400 mt-2">
              How realistic did the experience feel?
            </div>
          </div>

          {/* Emotion Score */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/40">
            <label className="block text-sm font-medium text-pink-300 mb-3">
              Emotion Score: {emotionScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={emotionScore}
              onChange={(e) => setEmotionScore(parseInt(e.target.value))}
              title="Adjust emotion score"
              className="w-full accent-pink-500"
            />
            <div className="text-xs text-slate-400 mt-2">
              How emotionally intense was it?
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
          >
            🌙 Complete Ritual
          </button>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <h4 className="text-blue-300 font-medium mb-2">💡 Enhancement Tips</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Use first person present tense</li>
              <li>• Include physical sensations</li>
              <li>• Describe emotions vividly</li>
              <li>• Mention specific details</li>
              <li>• Feel it as if it's happening now</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}