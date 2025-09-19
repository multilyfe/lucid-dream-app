"use client";

import { useState } from "react";
import { InventoryItem, getRarityColor, getRarityGlow } from "../lib/inventory";

interface RelicGalleryProps {
  relics: InventoryItem[];
  onEquip?: (itemId: string) => void;
  onUnequip?: (itemId: string) => void;
  onViewLore?: (item: InventoryItem) => void;
  showPantiesOnly?: boolean;
}

export default function RelicGallery({
  relics,
  onEquip,
  onUnequip,
  onViewLore,
  showPantiesOnly = false
}: RelicGalleryProps) {
  const [selectedRelic, setSelectedRelic] = useState<InventoryItem | null>(null);
  const [showLoreModal, setShowLoreModal] = useState(false);

  // Filter relics based on props
  const displayedRelics = relics.filter(relic => {
    if (showPantiesOnly) {
      return relic.type === "panty" || (relic.type === "relic" && relic.slot === "panty");
    }
    return relic.type === "relic" || relic.type === "artifact";
  });

  const handleRelicClick = (relic: InventoryItem) => {
    setSelectedRelic(relic);
    if (onViewLore) {
      onViewLore(relic);
    }
  };

  const openLoreModal = (relic: InventoryItem) => {
    setSelectedRelic(relic);
    setShowLoreModal(true);
  };

  const getRarityGlowIntensity = (rarity: string) => {
    const intensities = {
      common: "shadow-[0_0_15px_rgba(156,163,175,0.3)]",
      uncommon: "shadow-[0_0_20px_rgba(34,197,94,0.4)]",
      rare: "shadow-[0_0_25px_rgba(59,130,246,0.5)]", 
      epic: "shadow-[0_0_30px_rgba(147,51,234,0.6)]",
      legendary: "shadow-[0_0_35px_rgba(251,146,60,0.7)]",
      unique: "shadow-[0_0_40px_rgba(236,72,153,0.8)]"
    };
    return intensities[rarity] || intensities.common;
  };

  const getRelicFrame = (rarity: string) => {
    const frames = {
      common: "border-gray-400/60",
      uncommon: "border-green-400/60",
      rare: "border-blue-400/60",
      epic: "border-purple-400/60", 
      legendary: "border-orange-400/60",
      unique: "border-pink-400/60"
    };
    return frames[rarity] || frames.common;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20 border border-purple-400/30 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">✨</span>
        {showPantiesOnly ? "Sacred Panty Relics" : "Relic Gallery"}
        <span className="text-sm text-purple-300 ml-auto">
          {displayedRelics.length} relics
        </span>
      </h3>

      {displayedRelics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl opacity-30 mb-4">👑</div>
          <p className="text-gray-400">No relics discovered yet</p>
          <p className="text-gray-500 text-sm mt-2">
            {showPantiesOnly ? "Complete dungeons to find sacred panty relics" : "Explore dungeons and complete achievements to collect relics"}
          </p>
        </div>
      ) : (
        <>
          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {displayedRelics.map((relic) => (
              <div
                key={relic.id}
                className={`
                  relative group cursor-pointer transition-all duration-300
                  hover:scale-105 hover:-translate-y-2
                  ${getRarityGlowIntensity(relic.rarity)}
                  ${relic.equipped ? "ring-2 ring-yellow-400" : ""}
                `}
                onClick={() => handleRelicClick(relic)}
              >
                {/* Glowing Pedestal */}
                <div className={`
                  w-full h-32 bg-gradient-to-t from-gray-900 via-gray-800 to-transparent
                  rounded-lg border-2 ${getRelicFrame(relic.rarity)}
                  relative overflow-hidden
                `}>
                  {/* Ambient Glow */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t opacity-20
                    ${relic.rarity === 'legendary' ? 'from-orange-500 to-yellow-500' :
                      relic.rarity === 'epic' ? 'from-purple-500 to-pink-500' :
                      relic.rarity === 'rare' ? 'from-blue-500 to-cyan-500' :
                      relic.rarity === 'uncommon' ? 'from-green-500 to-emerald-500' :
                      relic.rarity === 'unique' ? 'from-pink-500 to-rose-500' :
                      'from-gray-500 to-slate-500'}
                  `} />

                  {/* Relic Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl drop-shadow-lg group-hover:animate-pulse">
                      {relic.icon}
                    </span>
                  </div>

                  {/* Equipped Indicator */}
                  {relic.equipped && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}

                  {/* Rarity Badge */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 bg-black/70 text-center py-1
                    ${getRarityColor(relic.rarity)} text-xs font-semibold uppercase tracking-wide
                  `}>
                    {relic.rarity}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white font-semibold text-sm mb-1">{relic.name}</p>
                      <div className="flex gap-1 justify-center">
                        {onEquip && !relic.equipped && (
                          <button
                            className="bg-green-600 hover:bg-green-500 text-white text-xs px-2 py-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEquip(relic.id);
                            }}
                          >
                            Equip
                          </button>
                        )}
                        {onUnequip && relic.equipped && (
                          <button
                            className="bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnequip(relic.id);
                            }}
                          >
                            Unequip
                          </button>
                        )}
                        <button
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLoreModal(relic);
                          }}
                        >
                          Lore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relic Name */}
                <div className="text-center mt-2">
                  <p className="text-white font-semibold text-sm">{relic.name}</p>
                  {relic.slot && (
                    <p className="text-gray-400 text-xs capitalize">{relic.slot} slot</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Relic Details */}
          {selectedRelic && !showLoreModal && (
            <div className="bg-gray-900/70 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{selectedRelic.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">{selectedRelic.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getRarityColor(selectedRelic.rarity)}`}>
                      {selectedRelic.rarity}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-2">{selectedRelic.desc}</p>
                  {selectedRelic.effect && (
                    <div className="bg-blue-900/30 border border-blue-400/30 rounded p-2 mb-2">
                      <p className="text-blue-300 text-sm font-semibold">Effect:</p>
                      <p className="text-blue-200 text-sm">{selectedRelic.effect}</p>
                    </div>
                  )}
                  {selectedRelic.source && (
                    <p className="text-green-300 text-sm">Source: {selectedRelic.source}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Lore Modal */}
      {showLoreModal && selectedRelic && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowLoreModal(false)}>
          <div className="bg-gray-900 border-2 border-purple-400/50 rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <span className="text-5xl">{selectedRelic.icon}</span>
              <h3 className="text-xl font-bold text-white mt-2">{selectedRelic.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRarityColor(selectedRelic.rarity)}`}>
                {selectedRelic.rarity} {selectedRelic.type}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300">{selectedRelic.desc}</p>
              </div>

              {selectedRelic.effect && (
                <div className="bg-blue-900/30 border border-blue-400/30 rounded p-3">
                  <h4 className="text-blue-300 font-semibold mb-1">Mystical Effect</h4>
                  <p className="text-blue-200 text-sm">{selectedRelic.effect}</p>
                </div>
              )}

              {selectedRelic.lore && (
                <div className="bg-purple-900/30 border border-purple-400/30 rounded p-3">
                  <h4 className="text-purple-300 font-semibold mb-2">Ancient Lore</h4>
                  <p className="text-purple-200 text-sm italic leading-relaxed">{selectedRelic.lore}</p>
                </div>
              )}

              {selectedRelic.source && (
                <div className="bg-green-900/30 border border-green-400/30 rounded p-3">
                  <h4 className="text-green-300 font-semibold mb-1">Discovery</h4>
                  <p className="text-green-200 text-sm">{selectedRelic.source}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-6">
              {onEquip && !selectedRelic.equipped && (
                <button
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    onEquip(selectedRelic.id);
                    setShowLoreModal(false);
                  }}
                >
                  Equip Relic
                </button>
              )}
              {onUnequip && selectedRelic.equipped && (
                <button
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    onUnequip(selectedRelic.id);
                    setShowLoreModal(false);
                  }}
                >
                  Unequip
                </button>
              )}
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowLoreModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}