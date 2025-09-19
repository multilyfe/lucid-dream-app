"use client";

import { useState } from "react";
import { InventoryItem, Equipment, canEquipInSlot } from "../lib/inventory";
import type { EquipmentSlot } from "../lib/inventory";
import { ItemCard } from "./ItemCard";

interface EquipmentSlotProps {
  slot: EquipmentSlot;
  item: InventoryItem | null;
  onEquip: (itemId: string, slot: EquipmentSlot) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onDrop: (e: React.DragEvent, slot: EquipmentSlot) => void;
}

function EquipmentSlot({ slot, item, onEquip, onUnequip, onDrop }: EquipmentSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, slot);
  };

  const getSlotIcon = (slot: EquipmentSlot): string => {
    const icons = {
      head: "👑",
      body: "🥻", 
      legs: "👢",
      panty: "🩲",
      trinket: "💍"
    };
    return icons[slot];
  };

  const getSlotLabel = (slot: EquipmentSlot): string => {
    const labels = {
      head: "Head",
      body: "Body",
      legs: "Legs", 
      panty: "Panty",
      trinket: "Trinket"
    };
    return labels[slot];
  };

  return (
    <div
      className={`
        relative w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isDragOver ? "border-fuchsia-400 bg-fuchsia-400/20" : "border-gray-600 bg-gray-800/50"}
        ${item ? "border-solid border-yellow-400 bg-yellow-900/20" : ""}
        hover:border-gray-400 hover:bg-gray-700/50
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {item ? (
        <div className="absolute inset-0 p-1">
          <ItemCard
            item={item}
            compact={true}
            draggable={true}
            onToggleEquip={() => onUnequip(slot)}
            onDragStart={(e, draggedItem) => {
              e.dataTransfer.setData("text/plain", draggedItem.id);
              e.dataTransfer.setData("application/json", JSON.stringify(draggedItem));
              e.dataTransfer.setData("source", "equipped");
            }}
          />
        </div>
      ) : (
        <>
          <div className="text-2xl opacity-50">{getSlotIcon(slot)}</div>
          <div className="text-xs text-gray-400 mt-1">{getSlotLabel(slot)}</div>
        </>
      )}
    </div>
  );
}

interface EquipmentGridProps {
  equipment: Equipment;
  equippedItems: InventoryItem[];
  onEquip: (itemId: string, slot: EquipmentSlot) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  activeBonuses?: string[];
}

export default function EquipmentGrid({
  equipment,
  equippedItems,
  onEquip,
  onUnequip,
  activeBonuses = []
}: EquipmentGridProps) {
  const handleDrop = (e: React.DragEvent, targetSlot: EquipmentSlot) => {
    try {
      const itemData = e.dataTransfer.getData("application/json");
      const sourceType = e.dataTransfer.getData("source");
      
      if (itemData) {
        const item = JSON.parse(itemData) as InventoryItem;
        
        // Check if item can be equipped in this slot
        if (!canEquipInSlot(item, targetSlot)) {
          console.warn(`Cannot equip ${item.name} in ${targetSlot} slot`);
          return;
        }

        // If dragging from equipped slot, handle slot swapping
        if (sourceType === "equipped" && item.slot !== targetSlot) {
          // First unequip from current slot
          const currentSlot = Object.entries(equipment).find(([_, itemId]) => itemId === item.id)?.[0] as EquipmentSlot;
          if (currentSlot) {
            onUnequip(currentSlot);
          }
        }

        // Equip in new slot
        onEquip(item.id, targetSlot);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const getEquippedItem = (slot: EquipmentSlot): InventoryItem | null => {
    const itemId = equipment[slot];
    return itemId ? equippedItems.find(item => item.id === itemId) || null : null;
  };

  const slots: EquipmentSlot[] = ["head", "body", "legs", "panty", "trinket"];

  return (
    <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⚔️</span>
        Equipment
      </h3>

      {/* Equipment Slots Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Top Row - Head */}
        <div></div>
        <EquipmentSlot
          slot="head"
          item={getEquippedItem("head")}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onDrop={handleDrop}
        />
        <div></div>

        {/* Middle Row - Body */}
        <div></div>
        <EquipmentSlot
          slot="body"
          item={getEquippedItem("body")}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onDrop={handleDrop}
        />
        <EquipmentSlot
          slot="trinket"
          item={getEquippedItem("trinket")}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onDrop={handleDrop}
        />

        {/* Bottom Row - Legs & Panty */}
        <EquipmentSlot
          slot="legs"
          item={getEquippedItem("legs")}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onDrop={handleDrop}
        />
        <EquipmentSlot
          slot="panty"
          item={getEquippedItem("panty")}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onDrop={handleDrop}
        />
        <div></div>
      </div>

      {/* Set Bonuses */}
      {activeBonuses.length > 0 && (
        <div className="bg-purple-900/30 border border-purple-400/30 rounded-lg p-3">
          <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
            <span>✨</span>
            Active Set Bonuses
          </h4>
          <div className="space-y-1">
            {activeBonuses.map((bonus, index) => (
              <p key={index} className="text-purple-200 text-sm">{bonus}</p>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Stats Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-900/30 border border-blue-400/30 rounded p-2">
          <h4 className="text-blue-300 font-semibold">Equipped Items</h4>
          <p className="text-blue-200">{equippedItems.length} / 5 slots</p>
        </div>
        <div className="bg-green-900/30 border border-green-400/30 rounded p-2">
          <h4 className="text-green-300 font-semibold">Set Bonuses</h4>
          <p className="text-green-200">{activeBonuses.length} active</p>
        </div>
      </div>

      {/* Drag & Drop Instructions */}
      <div className="mt-4 bg-gray-800/50 border border-gray-600/50 rounded p-2">
        <p className="text-gray-400 text-xs text-center">
          💡 Drag items from your inventory to equipment slots to equip them
        </p>
      </div>
    </div>
  );
}