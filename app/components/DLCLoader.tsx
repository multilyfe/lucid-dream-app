'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSimulationEngine, type DLCSaga, type DLCChapter } from '../hooks/useSimulationEngine';

interface DLCLoaderProps {
  onSagaSelect: (saga: DLCSaga, chapter?: DLCChapter) => void;
}

export default function DLCLoader({ onSagaSelect }: DLCLoaderProps) {
  const { engineData, loadDLCSaga, unlockDLCSaga, getDLCSagas } = useSimulationEngine();
  const [selectedSaga, setSelectedSaga] = useState<DLCSaga | null>(null);
  const [importMode, setImportMode] = useState(false);
  const [importData, setImportData] = useState('');

  // Load default DLCs on component mount
  useEffect(() => {
    loadDefaultDLCs();
  }, []);

  const loadDefaultDLCs = useCallback(async () => {
    try {
      // Load Kenna Saga
      const kennaResponse = await fetch('/simulation-dlc/kenna_saga.dlc.json');
      if (kennaResponse.ok) {
        const kennaSaga = await kennaResponse.json();
        loadDLCSaga(kennaSaga);
      }

      // Load Lucidia Trials
      const lucidiaResponse = await fetch('/simulation-dlc/lucidia_trials.dlc.json');
      if (lucidiaResponse.ok) {
        const lucidiaSaga = await lucidiaResponse.json();
        loadDLCSaga(lucidiaSaga);
      }

      // Load Foot Heaven
      const footResponse = await fetch('/simulation-dlc/foot_heaven.dlc.json');
      if (footResponse.ok) {
        const footSaga = await footResponse.json();
        loadDLCSaga(footSaga);
      }
    } catch (error) {
      console.error('Failed to load default DLCs:', error);
    }
  }, [loadDLCSaga]);

  const handleImportDLC = useCallback(() => {
    try {
      const sagaData = JSON.parse(importData);
      loadDLCSaga(sagaData);
      setImportData('');
      setImportMode(false);
    } catch (error) {
      console.error('Invalid DLC format:', error);
      alert('Invalid DLC format. Please check your JSON.');
    }
  }, [importData, loadDLCSaga]);

  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sagaData = JSON.parse(e.target?.result as string);
          loadDLCSaga(sagaData);
        } catch (error) {
          console.error('Failed to parse DLC file:', error);
          alert('Failed to parse DLC file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  }, [loadDLCSaga]);

  const getThemeGradient = useCallback((theme: string) => {
    const themeMap = {
      erotic: 'from-red-500 to-pink-500',
      spiritual: 'from-purple-500 to-indigo-500',
      fantasy: 'from-green-500 to-emerald-500',
      psychological: 'from-orange-500 to-amber-500',
      cosmic: 'from-blue-500 to-cyan-500',
      transformation: 'from-violet-500 to-purple-500'
    };
    return themeMap[theme as keyof typeof themeMap] || 'from-slate-500 to-slate-400';
  }, []);

  const getThemeBorder = useCallback((theme: string) => {
    const borderMap = {
      erotic: 'border-red-500/50',
      spiritual: 'border-purple-500/50',
      fantasy: 'border-green-500/50',
      psychological: 'border-orange-500/50',
      cosmic: 'border-blue-500/50',
      transformation: 'border-violet-500/50'
    };
    return borderMap[theme as keyof typeof borderMap] || 'border-slate-500/50';
  }, []);

  const getUnlockProgress = useCallback((saga: DLCSaga) => {
    const totalXP = engineData.totalXpEarned;
    const currentStreak = engineData.currentStreak;
    
    switch (saga.unlockCondition) {
      case 'streak':
        return Math.min((currentStreak / saga.unlockValue) * 100, 100);
      case 'xp_total':
        return Math.min((totalXP / saga.unlockValue) * 100, 100);
      case 'companion_bond':
        // TODO: Implement companion bond checking
        return 0;
      case 'buff_collection':
        // TODO: Implement buff collection checking
        return 0;
      default:
        return 100;
    }
  }, [engineData.totalXpEarned, engineData.currentStreak]);

  const canUnlockSaga = useCallback((saga: DLCSaga) => {
    return !saga.isUnlocked && getUnlockProgress(saga) >= 100;
  }, [getUnlockProgress]);

  const sagas = getDLCSagas();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          🧩 DLC Saga Library
        </h2>
        <p className="text-slate-300 text-lg">
          Immersive story experiences for advanced dream programming
        </p>
      </div>

      {/* Import Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setImportMode(!importMode)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
        >
          📥 Import DLC
        </button>
        
        <label className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all cursor-pointer">
          📁 Load File
          <input
            type="file"
            accept=".json,.dlc"
            onChange={handleFileImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Import Modal */}
      {importMode && (
        <div className="p-6 bg-slate-800/60 border border-slate-600/50 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">Import DLC JSON</h3>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Paste DLC JSON data here..."
            rows={8}
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setImportMode(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImportDLC}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Import
            </button>
          </div>
        </div>
      )}

      {/* Saga Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sagas.map((saga) => {
          const isSelected = selectedSaga?.id === saga.id;
          const unlockProgress = getUnlockProgress(saga);
          const canUnlock = canUnlockSaga(saga);
          const completionPercentage = (saga.completedChapters / saga.totalChapters) * 100;

          return (
            <div
              key={saga.id}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? `bg-gradient-to-br ${getThemeGradient(saga.theme)}/20 ${getThemeBorder(saga.theme)} shadow-lg` 
                  : 'bg-slate-800/40 border-slate-600/40 hover:border-slate-500/60'
              } ${saga.isUnlocked ? 'cursor-pointer hover:scale-105' : 'opacity-60'}`}
              onClick={() => saga.isUnlocked && setSelectedSaga(saga)}
            >
              {/* Cosmic background effect for selected saga */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-2xl" />
              )}

              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{saga.icon}</span>
                    <div>
                      <h3 className={`font-bold text-lg ${
                        isSelected 
                          ? `text-transparent bg-clip-text bg-gradient-to-r ${getThemeGradient(saga.theme)}` 
                          : 'text-white'
                      }`}>
                        {saga.name}
                      </h3>
                      <div className="text-xs text-slate-400 capitalize">{saga.theme}</div>
                    </div>
                  </div>

                  {/* Lock/Unlock Status */}
                  {!saga.isUnlocked && (
                    <div className="text-center">
                      {canUnlock ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unlockDLCSaga(saga.id);
                          }}
                          className="text-amber-400 hover:text-amber-300 transition-colors"
                          title="Click to unlock"
                        >
                          🔓
                        </button>
                      ) : (
                        <div className="text-slate-500" title="Locked">
                          🔒
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                  {saga.description}
                </p>

                {/* Progress Bars */}
                <div className="space-y-3 mb-4">
                  {/* Unlock Progress */}
                  {!saga.isUnlocked && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Unlock Progress</span>
                        <span className="text-slate-300">{Math.round(unlockProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getThemeGradient(saga.theme)} h-2 rounded-full transition-all duration-500 ${
                            unlockProgress >= 100 ? 'w-full' : ''
                          }`}
                          {...(unlockProgress < 100 && { style: { width: `${unlockProgress}%` } })}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {saga.unlockCondition === 'streak' && `Need ${saga.unlockValue} day streak`}
                        {saga.unlockCondition === 'xp_total' && `Need ${saga.unlockValue} total XP`}
                        {saga.unlockCondition === 'companion_bond' && `Need ${saga.unlockValue}% companion bond`}
                      </div>
                    </div>
                  )}

                  {/* Completion Progress */}
                  {saga.isUnlocked && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-slate-300">{Math.round(completionPercentage)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getThemeGradient(saga.theme)} h-2 rounded-full transition-all duration-500 ${
                            completionPercentage >= 100 ? 'w-full' : ''
                          }`}
                          {...(completionPercentage < 100 && { style: { width: `${completionPercentage}%` } })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <div className="font-bold text-white">{saga.totalChapters}</div>
                    <div className="text-slate-400">Chapters</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <div className="font-bold text-amber-400">×{saga.xpMultiplier}</div>
                    <div className="text-slate-400">XP Mult</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <div className="font-bold text-purple-400">×{saga.difficultyMultiplier}</div>
                    <div className="text-slate-400">Difficulty</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {saga.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {saga.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-slate-700/50 text-slate-400 rounded">
                      +{saga.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getThemeGradient(saga.theme)} animate-pulse`} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Saga Details */}
      {selectedSaga && (
        <div className="p-8 bg-slate-800/60 border border-slate-600/50 rounded-2xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Saga Info */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-3">
                <span className="text-4xl">{selectedSaga.icon}</span>
                <span>{selectedSaga.name}</span>
              </h3>
              
              <p className="text-slate-300 mb-6">
                {selectedSaga.description}
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-300 mb-2">Saga Details:</h4>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>• Theme: {selectedSaga.theme.charAt(0).toUpperCase() + selectedSaga.theme.slice(1)}</p>
                    <p>• Difficulty: {selectedSaga.difficultyMultiplier}x multiplier</p>
                    <p>• XP Reward: {selectedSaga.xpMultiplier}x multiplier</p>
                    <p>• Author: {selectedSaga.author}</p>
                    <p>• Version: {selectedSaga.version}</p>
                  </div>
                </div>

                {Object.keys(selectedSaga.companionAffinityBonus).length > 0 && (
                  <div>
                    <h4 className="font-medium text-pink-300 mb-2">Companion Bonuses:</h4>
                    <div className="text-sm text-slate-400 space-y-1">
                      {Object.entries(selectedSaga.companionAffinityBonus).map(([companion, bonus]) => (
                        <p key={companion}>• {companion}: +{bonus}% affinity</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chapter List */}
            <div>
              <h4 className="text-xl font-bold text-white mb-4">Chapters</h4>
              
              <div className="space-y-3">
                {selectedSaga.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => chapter.isUnlocked && onSagaSelect(selectedSaga, chapter)}
                    disabled={!chapter.isUnlocked}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      chapter.isUnlocked
                        ? `bg-gradient-to-r ${getThemeGradient(selectedSaga.theme)}/10 ${getThemeBorder(selectedSaga.theme)} hover:bg-opacity-20`
                        : 'bg-slate-700/30 border-slate-600/30 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">
                        {index + 1}. {chapter.name}
                      </h5>
                      <div className="flex items-center space-x-2">
                        {chapter.isCompleted && <span className="text-green-400">✓</span>}
                        {!chapter.isUnlocked && <span className="text-slate-500">🔒</span>}
                        <span className="text-xs text-slate-400 capitalize">{chapter.type}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-2">
                      {chapter.description}
                    </p>
                    
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Base XP: {chapter.baseXP}</span>
                      <span>Attempts: {chapter.attempts}</span>
                      {chapter.bestScore && <span>Best Score: {chapter.bestScore}</span>}
                    </div>
                  </button>
                ))}
              </div>
              
              {selectedSaga.isUnlocked && (
                <button
                  onClick={() => onSagaSelect(selectedSaga)}
                  className={`w-full mt-4 py-3 bg-gradient-to-r ${getThemeGradient(selectedSaga.theme)} text-white font-bold rounded-xl hover:opacity-90 transition-all transform hover:scale-105`}
                >
                  🚀 Start Saga Experience
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
          <div className="text-2xl font-bold text-purple-400">{sagas.length}</div>
          <div className="text-sm text-slate-300">Total Sagas</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
          <div className="text-2xl font-bold text-green-400">{sagas.filter(s => s.isUnlocked).length}</div>
          <div className="text-sm text-slate-300">Unlocked</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
          <div className="text-2xl font-bold text-amber-400">{sagas.reduce((sum, s) => sum + s.completedChapters, 0)}</div>
          <div className="text-sm text-slate-300">Completed Chapters</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">{Math.round(sagas.reduce((sum, s) => sum + (s.completedChapters / s.totalChapters * 100), 0) / sagas.length) || 0}%</div>
          <div className="text-sm text-slate-300">Avg Progress</div>
        </div>
      </div>
    </div>
  );
}