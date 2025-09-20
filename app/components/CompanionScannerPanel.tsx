'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanionScanner, type CompanionDetection, type ScanResult } from '../hooks/useCompanionScanner';

interface BondMeterProps {
  companionName: string;
  detection?: CompanionDetection;
  realtime?: boolean;
}

const BondMeter: React.FC<BondMeterProps> = ({ companionName, detection, realtime = false }) => {
  const { getBondMeterData } = useCompanionScanner();
  const bondData = getBondMeterData(companionName);
  
  const currentBond = detection?.bondStrength || bondData.current;
  const level = Math.floor(currentBond / 20);
  const progress = (currentBond % 20) / 20;

  const levelNames = ['Stranger', 'Acquaintance', 'Friend', 'Close', 'Intimate', 'Soulmate'];
  const levelColors = [
    'from-gray-400 to-gray-600',
    'from-green-400 to-green-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600'
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium capitalize">{companionName}</span>
        <span className="text-xs text-gray-400">
          {levelNames[level]} ({currentBond}/100)
        </span>
      </div>
      
      <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${levelColors[level]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${currentBond}%` }}
          transition={{ duration: realtime ? 0.5 : 1, ease: "easeOut" }}
        />
        
        {/* Level markers */}
        {[20, 40, 60, 80].map((marker, index) => (
          <div
            key={marker}
            className="absolute top-0 w-0.5 h-full bg-gray-600"
            {...({ style: { left: `${marker}%` } })}
          />
        ))}
      </div>
      
      {detection && detection.xpGained > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-green-400 mt-1"
        >
          +{detection.xpGained} XP • {detection.mentions} mentions
        </motion.div>
      )}
    </div>
  );
};

interface CompanionCardProps {
  detection: CompanionDetection;
  index: number;
}

const CompanionCard: React.FC<CompanionCardProps> = ({ detection, index }) => {
  const interactionColors = {
    casual: 'from-blue-400/20 to-blue-600/20',
    intimate: 'from-purple-400/20 to-purple-600/20',
    passionate: 'from-pink-400/20 to-pink-600/20',
    transcendent: 'from-yellow-400/20 to-yellow-600/20',
    none: 'from-gray-400/20 to-gray-600/20'
  };

  const interactionIcons = {
    casual: '💬',
    intimate: '💝',
    passionate: '❤️‍🔥',
    transcendent: '✨',
    none: '👋'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-r ${interactionColors[detection.interactionLevel]} border border-white/10 rounded-lg p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{interactionIcons[detection.interactionLevel]}</span>
          <h3 className="font-bold capitalize text-lg">{detection.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Confidence</div>
          <div className="text-lg font-bold">{detection.confidence}%</div>
        </div>
      </div>

      <BondMeter companionName={detection.name} detection={detection} realtime />

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <span className="text-gray-400">Interaction:</span>
          <div className="font-medium capitalize">{detection.interactionLevel}</div>
        </div>
        <div>
          <span className="text-gray-400">Affinity Bonus:</span>
          <div className="font-medium text-green-400">+{detection.affinityBonus}%</div>
        </div>
      </div>

      {detection.keywords.length > 0 && (
        <div className="mt-3">
          <span className="text-xs text-gray-400">Keywords:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {detection.keywords.slice(0, 5).map((keyword, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-white/10 rounded-full text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {detection.emotionalContext.length > 0 && (
        <div className="mt-3">
          <span className="text-xs text-gray-400">Emotional Context:</span>
          <div className="text-xs mt-1 italic text-gray-300">
            "{detection.emotionalContext[0]}"
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface CompanionScannerPanelProps {
  scanResult?: ScanResult;
  isScanning?: boolean;
  onScanComplete?: (result: ScanResult) => void;
}

export const CompanionScannerPanel: React.FC<CompanionScannerPanelProps> = ({
  scanResult,
  isScanning = false,
  onScanComplete
}) => {
  const { companionDatabase } = useCompanionScanner();
  const [showDetails, setShowDetails] = useState(false);

  if (!scanResult && !isScanning) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <div className="text-gray-400">
          No companion scan results yet. Start a simulation to detect companion interactions.
        </div>
      </div>
    );
  }

  if (isScanning) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-6 text-center">
        <motion.div
          className="text-4xl mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🔍
        </motion.div>
        <div className="text-purple-400 font-medium">
          Scanning for companion interactions...
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Analyzing emotional bonds and relationship dynamics
        </div>
      </div>
    );
  }

  const { companionsDetected, totalBondXP, affinityBuffs, emotionalIntensity } = scanResult!;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-purple-300">💫 Companion Scan Results</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">{companionsDetected.length}</div>
            <div className="text-sm text-gray-400">Companions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{totalBondXP}</div>
            <div className="text-sm text-gray-400">Bond XP</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-400">{emotionalIntensity}</div>
            <div className="text-sm text-gray-400">Intensity</div>
          </div>
        </div>
      </motion.div>

      {/* Companion Cards */}
      {companionsDetected.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Detected Companions</h3>
          {companionsDetected.map((detection, index) => (
            <CompanionCard
              key={detection.name}
              detection={detection}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Affinity Buffs */}
      {affinityBuffs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-bold text-yellow-300">👑 Affinity Buffs Earned</h3>
          {affinityBuffs.map((buff, index) => (
            <motion.div
              key={buff.companionName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{buff.icon}</span>
                  <span className="font-medium">{buff.buffName}</span>
                </div>
                <span className="text-sm text-gray-400">{buff.duration}h</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{buff.description}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Detailed Analysis */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/30 rounded-lg p-4 space-y-4"
          >
            <h3 className="text-lg font-bold text-blue-300">🔬 Detailed Analysis</h3>
            
            {/* All Known Companions */}
            <div>
              <h4 className="font-medium mb-2">All Companions Status</h4>
              <div className="space-y-3">
                {Object.keys(companionDatabase).map(companionName => (
                  <BondMeter key={companionName} companionName={companionName} />
                ))}
              </div>
            </div>

            {/* Emotional Context */}
            {companionsDetected.some(d => d.emotionalContext.length > 0) && (
              <div>
                <h4 className="font-medium mb-2">Emotional Contexts</h4>
                <div className="space-y-2">
                  {companionsDetected
                    .filter(d => d.emotionalContext.length > 0)
                    .map(detection => 
                      detection.emotionalContext.map((context, i) => (
                        <div key={`${detection.name}-${i}`} className="text-sm bg-gray-700/30 rounded p-2">
                          <span className="font-medium capitalize">{detection.name}:</span> "{context}"
                        </div>
                      ))
                    )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Companions Detected */}
      {companionsDetected.length === 0 && (
        <div className="bg-gray-800/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">👥</div>
          <div className="text-gray-400">
            No companions detected in this session. Try mentioning their names or interacting with them more directly.
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Known companions: {Object.keys(companionDatabase).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};