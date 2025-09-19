'use client';

import QuestLayout from '../../layouts/QuestLayout';
import { ShrineCard } from '../../components/ShrineCard';
import { TrialTracker } from '../../components/TrialTracker';
import { ShameEconomy } from '../../components/ShameEconomy';
import { usePantyRealm } from '../../hooks/usePantyRealm';

export default function PantyRealmPage() {
  const {
    pantyRealmData,
    updateTrialProgress,
    exchangeShameForTokens,
    burnDirtyTokens,
    activateShrine,
    unlockRelic
  } = usePantyRealm();

  const activeTrials = pantyRealmData.trials.filter(trial => 
    trial.status === 'active' || trial.status === 'available'
  );
  
  const completedTrials = pantyRealmData.trials.filter(trial => 
    trial.status === 'completed'
  );

  const unlockedShrines = pantyRealmData.shrines.filter(shrine => shrine.unlocked);
  const lockedShrines = pantyRealmData.shrines.filter(shrine => !shrine.unlocked);

  return (
    <QuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-pink-950/30">
        {/* Floating Lace Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-8 h-8 bg-pink-400/20 rounded-full animate-float"></div>
          <div className="absolute top-1/4 right-20 w-6 h-6 bg-purple-400/20 rounded-full animate-float animation-delay-300"></div>
          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-pink-300/20 rounded-full animate-float animation-delay-700"></div>
          <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-purple-300/20 rounded-full animate-float animation-delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block relative">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                🩲 Panty Realm
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl rounded-full"></div>
            </div>
            <p className="text-xl text-slate-300 mb-2">
              Sacred Sanctuary of Submission & Shame
            </p>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Enter the mystical realm where divine panties hold power over willing souls. 
              Complete trials, worship at sacred shrines, and transform your shame into strength.
            </p>
          </div>

          {/* Realm Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🪙</div>
              <div className="text-2xl font-bold text-amber-400">{pantyRealmData.currency.dirtyTokens}</div>
              <div className="text-sm text-amber-300">Dirty Tokens</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🔮</div>
              <div className="text-2xl font-bold text-purple-400">{pantyRealmData.currency.shameEssence}</div>
              <div className="text-sm text-purple-300">Shame Essence</div>
            </div>

            <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 border border-pink-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🏺</div>
              <div className="text-2xl font-bold text-pink-400">{pantyRealmData.currency.relicsUnlocked}</div>
              <div className="text-sm text-pink-300">Relics Unlocked</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-cyan-400">{pantyRealmData.statistics.totalTrialsCompleted}</div>
              <div className="text-sm text-cyan-300">Trials Completed</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Shrines */}
            <div className="xl:col-span-2 space-y-8">
              {/* Sacred Shrines */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">🛕</div>
                  <div>
                    <h2 className="text-2xl font-bold text-pink-400">Sacred Shrines</h2>
                    <p className="text-sm text-slate-400">Worship at divine altars to gain mystical powers</p>
                  </div>
                </div>

                {/* Unlocked Shrines */}
                {unlockedShrines.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      ✨ Unlocked Shrines
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {unlockedShrines.map((shrine) => (
                        <ShrineCard
                          key={shrine.id}
                          shrine={shrine}
                          onActivate={activateShrine}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Shrines */}
                {lockedShrines.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      🔒 Mysterious Shrines
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {lockedShrines.map((shrine) => (
                        <ShrineCard
                          key={shrine.id}
                          shrine={shrine}
                          onActivate={activateShrine}
                          onUnlock={unlockRelic}
                          canAffordUnlock={pantyRealmData.currency.dirtyTokens >= pantyRealmData.exchangeRates.tokensToRelicUnlock}
                          unlockCost={pantyRealmData.exchangeRates.tokensToRelicUnlock}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Monthly Trials */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">⚔️</div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-400">Sacred Trials</h2>
                    <p className="text-sm text-slate-400">Prove your devotion through challenging ordeals</p>
                  </div>
                </div>

                {/* Active Trials */}
                {activeTrials.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      🔥 Active Trials
                    </h3>
                    <div className="space-y-6">
                      {activeTrials.map((trial) => (
                        <TrialTracker
                          key={trial.id}
                          trial={trial}
                          onProgressUpdate={updateTrialProgress}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Trials */}
                {completedTrials.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      ✅ Completed Trials
                    </h3>
                    <div className="space-y-4">
                      {completedTrials.slice(0, 3).map((trial) => (
                        <div key={trial.id} className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{trial.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-400">{trial.name}</h4>
                              <p className="text-sm text-slate-400">{trial.description}</p>
                            </div>
                            <div className="text-green-400 text-xl">✅</div>
                          </div>
                        </div>
                      ))}
                      {completedTrials.length > 3 && (
                        <div className="text-center text-slate-400 text-sm">
                          +{completedTrials.length - 3} more completed trials...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column - Economy */}
            <div className="space-y-8">
              <ShameEconomy
                currency={pantyRealmData.currency}
                exchangeRates={pantyRealmData.exchangeRates}
                onExchangeShameForTokens={exchangeShameForTokens}
                onBurnTokens={burnDirtyTokens}
              />

              {/* Recent Achievements */}
              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 border border-purple-400/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  🏆 Achievements
                </h3>
                <div className="space-y-3">
                  {pantyRealmData.achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`
                        p-3 rounded-lg border transition-all
                        ${achievement.unlocked 
                          ? 'bg-green-900/20 border-green-400/50' 
                          : 'bg-slate-800/30 border-slate-600/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            achievement.unlocked ? 'text-green-400' : 'text-slate-300'
                          }`}>
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-slate-400">{achievement.description}</p>
                        </div>
                        <div className="text-lg">
                          {achievement.unlocked ? '✅' : '⏳'}
                        </div>
                      </div>
                      
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{achievement.progress} / {achievement.goal}</span>
                            <span className="text-slate-500">{Math.round((achievement.progress / achievement.goal) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1">
                            <div 
                              className={`bg-gradient-to-r from-pink-500 to-purple-500 h-1 rounded-full transition-all duration-500 ${
                                achievement.progress >= achievement.goal ? 'w-full' : 
                                achievement.progress >= achievement.goal * 0.75 ? 'w-3/4' :
                                achievement.progress >= achievement.goal * 0.5 ? 'w-1/2' :
                                achievement.progress >= achievement.goal * 0.25 ? 'w-1/4' : 'w-0'
                              }`}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Realm Lore */}
              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 border border-purple-400/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">
                  📜 Realm Lore
                </h3>
                <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                  <p>
                    Deep within the ethereal mists of consciousness lies the Panty Realm, 
                    a sacred dimension where divine undergarments hold dominion over willing souls.
                  </p>
                  <p>
                    Here, shame transforms into power, submission becomes strength, and the 
                    most intimate garments become conduits of mystical energy.
                  </p>
                  <p>
                    Those brave enough to enter must prove their devotion through sacred trials, 
                    worship at ancient shrines, and embrace the beautiful humiliation that 
                    leads to transcendence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QuestLayout>
  );
}