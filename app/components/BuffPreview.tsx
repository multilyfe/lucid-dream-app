'use client';

import { useSimulationRituals } from '../hooks/useSimulationRituals';

interface BuffPreviewProps {
  realismScore: number;
  emotionScore: number;
  content: string;
  type: "lucid_initiation" | "companion_encounter" | "self_transformation" | "erotic_simulation" | "flight" | "custom";
}

export default function BuffPreview({ realismScore, emotionScore, content, type }: BuffPreviewProps) {
  const { determineBuff, calculateXPReward } = useSimulationRituals();

  const buffName = determineBuff({ realismScore, emotionScore, content, type });
  const xpReward = calculateXPReward(realismScore, emotionScore, content, type);

  if (!buffName) {
    return (
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/40">
        <div className="text-center text-slate-400">
          <div className="text-2xl mb-2">💭</div>
          <div className="text-sm">Keep writing to unlock buffs...</div>
        </div>
      </div>
    );
  }

  // Mock buff data based on name for preview
  const mockBuff = {
    name: buffName,
    icon: getBuffIcon(buffName),
    rarity: getBuffRarity(realismScore + emotionScore),
    duration: getBuffDuration(realismScore + emotionScore),
    description: getBuffDescription(buffName),
    effects: getBuffEffects(buffName)
  };

  const getBuffRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-amber-500 to-yellow-400';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-cyan-400';
      case 'uncommon': return 'from-green-500 to-emerald-400';
      default: return 'from-slate-500 to-slate-400';
    }
  };

  const getBuffRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-amber-500/50';
      case 'epic': return 'border-purple-500/50';
      case 'rare': return 'border-blue-500/50';
      case 'uncommon': return 'border-green-500/50';
      default: return 'border-slate-500/50';
    }
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${getBuffRarityColor(mockBuff.rarity)}/10 border ${getBuffRarityBorder(mockBuff.rarity)} relative overflow-hidden`}>
      {/* Cosmic background effect for high-tier buffs */}
      {(mockBuff.rarity === 'epic' || mockBuff.rarity === 'legendary') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{mockBuff.icon}</span>
            <span className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${getBuffRarityColor(mockBuff.rarity)} bg-clip-text text-transparent`}>
              {mockBuff.rarity}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {mockBuff.duration}h duration
          </div>
        </div>

        {/* Buff Name */}
        <h3 className={`font-bold text-lg mb-2 bg-gradient-to-r ${getBuffRarityColor(mockBuff.rarity)} bg-clip-text text-transparent`}>
          {mockBuff.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-3">
          {mockBuff.description}
        </p>

        {/* Stats */}
        <div className="space-y-2">
          {mockBuff.effects.experienceMultiplier > 1 && (
            <div className="flex justify-between text-xs">
              <span className="text-amber-300">XP Multiplier</span>
              <span className="text-amber-400 font-bold">×{mockBuff.effects.experienceMultiplier}</span>
            </div>
          )}
          
          {mockBuff.effects.lucidityBonus > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-purple-300">Lucidity Bonus</span>
              <span className="text-purple-400 font-bold">+{mockBuff.effects.lucidityBonus}%</span>
            </div>
          )}
          
          {mockBuff.effects.dreamRecallBonus > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-blue-300">Dream Recall</span>
              <span className="text-blue-400 font-bold">+{mockBuff.effects.dreamRecallBonus}%</span>
            </div>
          )}
        </div>

        {/* XP Preview */}
        <div className="mt-3 pt-3 border-t border-slate-600/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Total XP with buff</span>
            <span className="text-amber-400 font-bold">
              {Math.floor(xpReward * (mockBuff.effects.experienceMultiplier || 1))} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBuffIcon(buffName: string): string {
  const iconMap: Record<string, string> = {
    'Lucid Mastery': '🌙',
    'Wings of Dreams': '🕊️',
    'Companion Bond': '💫',
    'Shape Fluidity': '🦋',
    'Erotic Confidence': '💋',
    'Dream Architect': '🏗️',
    'Dream Awareness': '👁️',
    'Gravity Defiance': '🪐',
    'Social Magnetism': '🧲',
    'Body Confidence': '💪',
    'Sexual Energy': '🔥',
    'Creative Flow': '✨',
    'Dream Muscle': '💭'
  };
  return iconMap[buffName] || '🌟';
}

function getBuffRarity(totalScore: number): string {
  if (totalScore >= 160) return 'legendary';
  if (totalScore >= 120) return 'epic';
  if (totalScore >= 80) return 'rare';
  return 'uncommon';
}

function getBuffDuration(totalScore: number): number {
  if (totalScore >= 160) return 24;
  if (totalScore >= 120) return 12;
  if (totalScore >= 80) return 6;
  return 3;
}

function getBuffDescription(buffName: string): string {
  const descMap: Record<string, string> = {
    'Lucid Mastery': 'Perfect control over dream consciousness and reality manipulation.',
    'Wings of Dreams': 'Effortless flight abilities with enhanced aerial dream control.',
    'Companion Bond': 'Deeper connections with dream companions and enhanced interactions.',
    'Shape Fluidity': 'Perfect transformation abilities and body morphing control.',
    'Erotic Confidence': 'Enhanced sensual experiences and sexual dream mastery.',
    'Dream Architect': 'Creative mastery of dream environments and reality construction.',
    'Dream Awareness': 'Improved lucidity triggers and consciousness recognition.',
    'Gravity Defiance': 'Enhanced flight abilities and weightless movement.',
    'Social Magnetism': 'Charismatic presence and improved social dream interactions.',
    'Body Confidence': 'Enhanced self-image and physical transformation abilities.',
    'Sexual Energy': 'Increased sensual awareness and erotic dream experiences.',
    'Creative Flow': 'Enhanced creativity and artistic inspiration in dreams.',
    'Dream Muscle': 'Basic lucid dreaming enhancement and awareness boost.'
  };
  return descMap[buffName] || 'Enhanced dream abilities and awareness.';
}

function getBuffEffects(buffName: string) {
  const effectsMap: Record<string, any> = {
    'Lucid Mastery': { experienceMultiplier: 2.0, lucidityBonus: 50, dreamRecallBonus: 40 },
    'Wings of Dreams': { experienceMultiplier: 1.8, lucidityBonus: 40, dreamRecallBonus: 30 },
    'Companion Bond': { experienceMultiplier: 1.7, lucidityBonus: 35, dreamRecallBonus: 25 },
    'Shape Fluidity': { experienceMultiplier: 1.7, lucidityBonus: 35, dreamRecallBonus: 25 },
    'Erotic Confidence': { experienceMultiplier: 1.8, lucidityBonus: 40, dreamRecallBonus: 30 },
    'Dream Architect': { experienceMultiplier: 1.9, lucidityBonus: 45, dreamRecallBonus: 35 },
    'Dream Awareness': { experienceMultiplier: 1.5, lucidityBonus: 25, dreamRecallBonus: 20 },
    'Gravity Defiance': { experienceMultiplier: 1.4, lucidityBonus: 20, dreamRecallBonus: 15 },
    'Social Magnetism': { experienceMultiplier: 1.4, lucidityBonus: 20, dreamRecallBonus: 15 },
    'Body Confidence': { experienceMultiplier: 1.4, lucidityBonus: 20, dreamRecallBonus: 15 },
    'Sexual Energy': { experienceMultiplier: 1.5, lucidityBonus: 25, dreamRecallBonus: 20 },
    'Creative Flow': { experienceMultiplier: 1.5, lucidityBonus: 25, dreamRecallBonus: 20 },
    'Dream Muscle': { experienceMultiplier: 1.2, lucidityBonus: 10, dreamRecallBonus: 10 }
  };
  return effectsMap[buffName] || { experienceMultiplier: 1.0, lucidityBonus: 0, dreamRecallBonus: 0 };
}