import { usePantyRealm, type PantyRealmData, type PantyRealmShrine, type PantyRealmTrial } from "../hooks/usePantyRealm";
import { SectionLabel } from "./SectionLabel";
import { useState } from "react";

type PantyRealmManagerProps = {
  control: any;
  setControl: any;
};

export function PantyRealmManager({ control, setControl }: PantyRealmManagerProps) {
  const {
    pantyRealmData,
    updateTrialProgress,
    exchangeShameForTokens,
    burnDirtyTokens,
    activateShrine,
    unlockRelic,
    addShameEssence,
    addDirtyTokens,
    checkMonthlyReset,
    checkWeeklyReset
  } = usePantyRealm();

  const [adminMode, setAdminMode] = useState(false);

  const handleResetTrials = () => {
    if (window.confirm("Reset all trial progress? This cannot be undone.")) {
      checkMonthlyReset();
    }
  };

  const handleResetShrines = () => {
    if (window.confirm("Reset all shrine states? This will deactivate all shrines.")) {
      // Manual shrine reset - would need to add this to the hook
      window.alert("Shrine reset not implemented yet. Use individual shrine toggles.");
    }
  };

  const handleResetCurrency = () => {
    if (window.confirm("Reset all currency? This will clear Dirty Tokens and Shame Essence.")) {
      // Manual currency reset - would need to add this to the hook
      window.alert("Currency reset not implemented yet. Use manual adjustment below.");
    }
  };

  const handleSetTrialProgress = (trialId: string, progress: number) => {
    const currentTrial = pantyRealmData.trials.find(t => t.id === trialId);
    if (currentTrial) {
      const difference = progress - currentTrial.progress;
      updateTrialProgress(trialId, difference);
    }
  };

  const handleAddTokens = (amount: number) => {
    addDirtyTokens(amount);
  };

  const handleAddEssence = (amount: number) => {
    addShameEssence(amount);
  };

  return (
    <div className="space-y-6">
      <SectionLabel>Panty Realm Control Nexus</SectionLabel>
      
      {/* Admin Mode Toggle */}
      <div className="rounded-2xl border border-pink-500/30 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Admin Mode</h3>
            <p className="text-sm text-slate-400">Enable administrative controls for the Panty Realm</p>
          </div>
          <button
            onClick={() => setAdminMode(!adminMode)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              adminMode
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {adminMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Current Status Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-pink-500/30 bg-slate-950/70 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Dirty Tokens</div>
          <div className="mt-2 text-2xl font-semibold text-pink-400">{pantyRealmData.currency.dirtyTokens}</div>
        </div>
        <div className="rounded-2xl border border-purple-500/30 bg-slate-950/70 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Shame Essence</div>
          <div className="mt-2 text-2xl font-semibold text-purple-400">{pantyRealmData.currency.shameEssence}</div>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-slate-950/70 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Active Shrines</div>
          <div className="mt-2 text-2xl font-semibold text-blue-400">
            {pantyRealmData.shrines.filter((shrine: PantyRealmShrine) => shrine.active).length}/{pantyRealmData.shrines.length}
          </div>
        </div>
        <div className="rounded-2xl border border-green-500/30 bg-slate-950/70 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Trials Progress</div>
          <div className="mt-2 text-2xl font-semibold text-green-400">
            {pantyRealmData.trials.filter((trial: PantyRealmTrial) => trial.progress >= trial.goal).length}/{pantyRealmData.trials.length}
          </div>
        </div>
      </div>

      {adminMode && (
        <>
          {/* Trial Management */}
          <div className="rounded-2xl border border-slate-600/50 bg-slate-900/50 p-6">
            <SectionLabel>Trial Management</SectionLabel>
            <div className="space-y-4">
              {pantyRealmData.trials.map((trial: PantyRealmTrial) => (
                <div key={trial.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{trial.name}</h4>
                      <p className="text-sm text-slate-400">
                        {trial.progress}/{trial.goal} ({((trial.progress/trial.goal)*100).toFixed(1)}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={trial.progress}
                        onChange={(e) => handleSetTrialProgress(trial.id, parseInt(e.target.value) || 0)}
                        className="w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                        min="0"
                        max={trial.goal}
                        aria-label={`Progress for ${trial.name}`}
                      />
                      <span className="text-slate-400">/ {trial.goal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shrine Management */}
          <div className="rounded-2xl border border-slate-600/50 bg-slate-900/50 p-6">
            <SectionLabel>Shrine Management</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              {pantyRealmData.shrines.map((shrine: PantyRealmShrine) => (
                <div key={shrine.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{shrine.name}</h4>
                      <p className="text-sm text-slate-400">
                        Status: {shrine.active ? 'Active' : 'Dormant'}
                      </p>
                    </div>
                    <button
                      onClick={() => activateShrine(shrine.id)}
                      className={`rounded px-3 py-1 text-sm font-medium transition-all ${
                        shrine.active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      {shrine.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Management */}
          <div className="rounded-2xl border border-slate-600/50 bg-slate-900/50 p-6">
            <SectionLabel>Currency Management</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <h4 className="font-medium text-white">Dirty Tokens</h4>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={pantyRealmData.currency.dirtyTokens}
                    className="flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                    min="0"
                    aria-label="Dirty Tokens amount"
                    onBlur={(e) => {
                      const newAmount = parseInt(e.target.value) || 0;
                      const currentAmount = pantyRealmData.currency.dirtyTokens;
                      const difference = newAmount - currentAmount;
                      if (difference !== 0) {
                        handleAddTokens(difference);
                      }
                    }}
                  />
                  <button 
                    className="rounded bg-pink-500 px-3 py-1 text-sm text-white hover:bg-pink-600"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input) {
                        const newAmount = parseInt(input.value) || 0;
                        const currentAmount = pantyRealmData.currency.dirtyTokens;
                        const difference = newAmount - currentAmount;
                        if (difference !== 0) {
                          handleAddTokens(difference);
                        }
                      }
                    }}
                  >
                    Set
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <h4 className="font-medium text-white">Shame Essence</h4>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={pantyRealmData.currency.shameEssence}
                    className="flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-white"
                    min="0"
                    aria-label="Shame Essence amount"
                    onBlur={(e) => {
                      const newAmount = parseInt(e.target.value) || 0;
                      const currentAmount = pantyRealmData.currency.shameEssence;
                      const difference = newAmount - currentAmount;
                      if (difference !== 0) {
                        handleAddEssence(difference);
                      }
                    }}
                  />
                  <button 
                    className="rounded bg-purple-500 px-3 py-1 text-sm text-white hover:bg-purple-600"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input) {
                        const newAmount = parseInt(input.value) || 0;
                        const currentAmount = pantyRealmData.currency.shameEssence;
                        const difference = newAmount - currentAmount;
                        if (difference !== 0) {
                          handleAddEssence(difference);
                        }
                      }
                    }}
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Actions */}
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6">
            <SectionLabel>Danger Zone</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-3">
              <button
                onClick={handleResetTrials}
                className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <div className="text-sm font-medium">Reset Trials</div>
                <div className="text-xs text-red-300">Clear all trial progress</div>
              </button>
              <button
                onClick={handleResetShrines}
                className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <div className="text-sm font-medium">Reset Shrines</div>
                <div className="text-xs text-red-300">Deactivate all shrines</div>
              </button>
              <button
                onClick={handleResetCurrency}
                className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <div className="text-sm font-medium">Reset Currency</div>
                <div className="text-xs text-red-300">Clear all tokens & essence</div>
              </button>
            </div>
          </div>
        </>
      )}

      {!adminMode && (
        <div className="rounded-2xl border border-slate-600/50 bg-slate-900/50 p-6 text-center">
          <p className="text-slate-400">Enable Admin Mode to access Panty Realm management controls.</p>
        </div>
      )}
    </div>
  );
}