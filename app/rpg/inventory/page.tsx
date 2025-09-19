"use client";

import { useState, useMemo } from "react";
import { useInventory } from "../../hooks/useInventory";
import { ItemCard } from "../../components/ItemCard";
import EquipmentGrid from "../../components/EquipmentGrid";
import RelicGallery from "../../components/RelicGallery";
import QuestLayout from "../../layouts/QuestLayout";
import { InventoryItem, ItemType, Rarity } from "../../lib/inventory";

type TabType = "equipment" | "items" | "relics" | "sets";
type SortType = "name" | "rarity" | "type" | "owned";

export default function InventoryPage() {
  const {
    inventory,
    equipment,
    equippedItems,
    sets,
    activeSetBonuses,
    grouped,
    toggleEquip,
    equipItem,
    unequipItem,
    consumeItem,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<TabType>("equipment");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ItemType | "all">("all");
  const [filterRarity, setFilterRarity] = useState<Rarity | "all">("all");
  const [sortBy, setSortBy] = useState<SortType>("name");
  const [sortDesc, setSortDesc] = useState(false);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesRarity = filterRarity === "all" || item.rarity === filterRarity;
      
      return matchesSearch && matchesType && matchesRarity;
    });

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rarity":
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, unique: 6 };
          comparison = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "owned":
          comparison = a.owned - b.owned;
          break;
      }
      
      return sortDesc ? -comparison : comparison;
    });

    return filtered;
  }, [inventory, searchTerm, filterType, filterRarity, sortBy, sortDesc]);

  // Get relics for relic gallery
  const relics = useMemo(() => {
    return inventory.filter(item => 
      item.type === "relic" || 
      item.type === "artifact" || 
      (item.type === "panty" && item.slot === "panty")
    );
  }, [inventory]);

  const handleItemDragStart = (e: React.DragEvent, item: InventoryItem) => {
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.setData("source", "inventory");
  };

  const tabs = [
    { id: "equipment" as TabType, label: "Equipment", icon: "⚔️" },
    { id: "items" as TabType, label: "Items", icon: "🎒" },
    { id: "relics" as TabType, label: "Relics", icon: "✨" },
    { id: "sets" as TabType, label: "Sets", icon: "👑" },
  ];

  return (
    <QuestLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span>🎒</span>
            Inventory
          </h1>
          <p className="text-gray-400">
            Manage your equipment, items, and relics. Total items: {inventory.length}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-900/50 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all
                ${activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Equipment Tab */}
        {activeTab === "equipment" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <EquipmentGrid
                equipment={equipment}
                equippedItems={equippedItems}
                onEquip={equipItem}
                onUnequip={unequipItem}
                activeBonuses={activeSetBonuses}
              />
            </div>
            
            <div className="space-y-6">
              {/* Equipment Stats */}
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">Equipment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-900/30 border border-blue-400/30 rounded p-3">
                    <h4 className="text-blue-300 font-semibold">Equipped</h4>
                    <p className="text-blue-200 text-xl font-bold">{equippedItems.length}/5</p>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-400/30 rounded p-3">
                    <h4 className="text-purple-300 font-semibold">Set Bonuses</h4>
                    <p className="text-purple-200 text-xl font-bold">{activeSetBonuses.length}</p>
                  </div>
                </div>
              </div>

              {/* Equipped Items List */}
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">Equipped Items</h3>
                {equippedItems.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No items equipped</p>
                ) : (
                  <div className="space-y-2">
                    {equippedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-800/50 rounded p-2">
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{item.name}</p>
                          <p className="text-gray-400 text-sm capitalize">{item.slot} • {item.rarity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === "items" && (
          <div>
            {/* Search and Filters */}
            <div className="mb-6 bg-gray-900/50 border border-gray-600 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as ItemType | "all")}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    title="Filter by item type"
                  >
                    <option value="all">All Types</option>
                    <option value="relic">Relics</option>
                    <option value="artifact">Artifacts</option>
                    <option value="equipment">Equipment</option>
                    <option value="panty">Panties</option>
                    <option value="consumable">Consumables</option>
                    <option value="currency">Currency</option>
                    <option value="quest">Quest Items</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value as Rarity | "all")}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    title="Filter by item rarity"
                  >
                    <option value="all">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="unique">Unique</option>
                  </select>
                </div>
                <div>
                  <select
                    value={`${sortBy}-${sortDesc}`}
                    onChange={(e) => {
                      const [sort, desc] = e.target.value.split("-");
                      setSortBy(sort as SortType);
                      setSortDesc(desc === "true");
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    title="Sort items by criteria"
                  >
                    <option value="name-false">Name (A-Z)</option>
                    <option value="name-true">Name (Z-A)</option>
                    <option value="rarity-false">Rarity (Low-High)</option>
                    <option value="rarity-true">Rarity (High-Low)</option>
                    <option value="type-false">Type (A-Z)</option>
                    <option value="owned-true">Owned (Most)</option>
                    <option value="owned-false">Owned (Least)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl opacity-30 mb-4">📦</div>
                <p className="text-gray-400">No items found matching your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleEquip={() => toggleEquip(item.id)}
                    onConsume={item.consumable ? () => consumeItem(item.id) : undefined}
                    draggable={true}
                    showLore={true}
                    onDragStart={handleItemDragStart}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Relics Tab */}
        {activeTab === "relics" && (
          <RelicGallery
            relics={relics}
            onEquip={(itemId) => toggleEquip(itemId)}
            onUnequip={(itemId) => toggleEquip(itemId)}
            showPantiesOnly={false}
          />
        )}

        {/* Sets Tab */}
        {activeTab === "sets" && (
          <div className="space-y-6">
            {sets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl opacity-30 mb-4">👑</div>
                <p className="text-gray-400">No item sets available yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Collect matching items to unlock powerful set bonuses
                </p>
              </div>
            ) : (
              sets.map((set) => {
                const setItems = inventory.filter(item => set.items.includes(item.id));
                const equippedSetItems = setItems.filter(item => item.equipped);
                const progress = equippedSetItems.length;
                const isCompleted = progress >= set.items.length;

                return (
                  <div key={set.id} className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{set.name}</h3>
                        <p className="text-gray-300 mb-2">{set.description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            isCompleted ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
                          }`}>
                            {progress}/{set.items.length} equipped
                          </span>
                          {isCompleted && (
                            <span className="bg-gold-600 text-white px-2 py-1 rounded text-sm font-semibold">
                              Complete!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Set Items */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {setItems.map((item) => (
                        <div key={item.id} className="text-center">
                          <ItemCard
                            item={item}
                            compact={true}
                            onToggleEquip={() => toggleEquip(item.id)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Set Bonuses */}
                    <div className="bg-purple-900/30 border border-purple-400/30 rounded-lg p-4">
                      <h4 className="text-purple-300 font-semibold mb-2">Set Bonuses</h4>
                      <div className="space-y-2">
                        {Object.entries(set.bonus).map(([pieces, bonus]) => {
                          const requiredPieces = parseInt(pieces.split("_")[0]);
                          const isActive = progress >= requiredPieces;
                          
                          return (
                            <div key={pieces} className={`flex items-center gap-2 ${
                              isActive ? "text-purple-200" : "text-gray-500"
                            }`}>
                              <span className={`w-4 h-4 rounded-full border-2 ${
                                isActive ? "bg-purple-500 border-purple-400" : "border-gray-500"
                              }`} />
                              <span className="text-sm">
                                ({requiredPieces}) {bonus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </QuestLayout>
  );
}


