'use client';

import { useState } from 'react';
import { useVaultIntegration } from '../hooks/useVaultIntegration';

export default function VaultIntegration() {
  const {
    vaultConfig,
    vaultFiles,
    syncStatus,
    syncLog,
    updateVaultConfig,
    syncVault
  } = useVaultIntegration();
  
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleEnabled = () => {
    updateVaultConfig({ enabled: !vaultConfig.enabled });
  };

  const handleToggleAutoSync = () => {
    updateVaultConfig({ autoSync: !vaultConfig.autoSync });
  };

  const handleSyncIntervalChange = (interval: number) => {
    updateVaultConfig({ syncInterval: interval });
  };

  const handleVaultPathChange = (path: string) => {
    updateVaultConfig({ vaultPath: path });
  };

  const syncedFiles = vaultFiles.filter(f => f.status === 'synced').length;
  const pendingFiles = vaultFiles.filter(f => f.status === 'pending').length;
  const errorFiles = vaultFiles.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🗂️ Vault Integration</h2>
        <p className="text-slate-300">
          Sync trip reports from your Obsidian vault or markdown files
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/30">
          <div className="text-2xl font-bold text-blue-400 mb-1">{syncedFiles}</div>
          <div className="text-sm text-blue-300">Synced Files</div>
        </div>
        
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/30">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{pendingFiles}</div>
          <div className="text-sm text-yellow-300">Pending</div>
        </div>
        
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/30">
          <div className="text-2xl font-bold text-red-400 mb-1">{errorFiles}</div>
          <div className="text-sm text-red-300">Errors</div>
        </div>
        
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-600/30">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {vaultConfig.lastSyncTime ? new Date(vaultConfig.lastSyncTime).toLocaleDateString() : 'Never'}
          </div>
          <div className="text-sm text-purple-300">Last Sync</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleToggleEnabled}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            vaultConfig.enabled
              ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
              : 'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-600/30'
          }`}
        >
          {vaultConfig.enabled ? '🟢 Enabled' : '⚫ Disabled'}
        </button>
        
        <button
          onClick={syncVault}
          disabled={!vaultConfig.enabled || syncStatus === 'syncing'}
          className="px-6 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
        >
          {syncStatus === 'syncing' ? '🔄 Syncing...' : '🔄 Sync Now'}
        </button>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-6 py-3 rounded-xl bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-600/30 font-medium transition-all"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/40">
          <h3 className="text-xl font-bold text-white mb-4">Vault Settings</h3>
          
          <div className="space-y-4">
            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-300 font-medium">Auto Sync</label>
                <p className="text-sm text-slate-400">Automatically check for new files</p>
              </div>
              <button
                onClick={handleToggleAutoSync}
                title={`${vaultConfig.autoSync ? 'Disable' : 'Enable'} auto sync`}
                className={`w-12 h-6 rounded-full transition-all ${
                  vaultConfig.autoSync ? 'bg-purple-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-all ${
                    vaultConfig.autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Sync Interval */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Sync Interval (minutes)
              </label>
              <select
                value={vaultConfig.syncInterval}
                onChange={(e) => handleSyncIntervalChange(parseInt(e.target.value))}
                title="Select sync interval"
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600/40 rounded-lg text-white"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
            
            {/* Vault Path */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Vault Path (future feature)
              </label>
              <input
                type="text"
                value={vaultConfig.vaultPath}
                onChange={(e) => handleVaultPathChange(e.target.value)}
                placeholder="/path/to/your/obsidian/vault"
                className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600/40 rounded-lg text-white placeholder-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">
                Currently simulated - real file system access coming soon
              </p>
            </div>
            
            {/* Watched Folders */}
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Watched Folders
              </label>
              <div className="space-y-2">
                {vaultConfig.watchedFolders.map((folder, index) => (
                  <div key={index} className="px-3 py-2 bg-slate-700/40 rounded-lg text-slate-300">
                    📁 {folder}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Log */}
      {syncLog.length > 0 && (
        <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/40">
          <h3 className="text-xl font-bold text-white mb-4">📝 Sync Log</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {syncLog.map((entry, index) => (
              <div key={index} className="text-sm text-slate-300 font-mono">
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      {vaultFiles.length > 0 && (
        <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-600/40">
          <h3 className="text-xl font-bold text-white mb-4">📁 Vault Files</h3>
          <div className="space-y-3">
            {vaultFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex-1">
                  <div className="text-white font-medium">{file.filename}</div>
                  <div className="text-sm text-slate-400">
                    {new Date(file.lastModified).toLocaleString()} • {Math.round(file.size / 1024)}KB
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.tripId && (
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                      Imported
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      file.status === 'synced'
                        ? 'bg-green-500/20 text-green-300'
                        : file.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Guide */}
      {vaultFiles.length === 0 && vaultConfig.enabled && (
        <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h3 className="text-xl font-bold text-blue-300 mb-4">📚 How to Use Vault Integration</h3>
          <div className="space-y-3 text-slate-300">
            <p>
              <strong>1. Create trip reports</strong> in your Obsidian vault or as markdown files
            </p>
            <p>
              <strong>2. Use structured format</strong> with headers like "Date:", "Substance:", "Dosage:", etc.
            </p>
            <p>
              <strong>3. Include sections</strong> for "Insights", "Entities Encountered", "Integration Notes"
            </p>
            <p>
              <strong>4. Click "Sync Now"</strong> to import your files into the Mindfuck Cathedral
            </p>
            <p className="text-sm text-slate-400">
              Currently in demo mode - real file system integration coming in future updates
            </p>
          </div>
        </div>
      )}
    </div>
  );
}