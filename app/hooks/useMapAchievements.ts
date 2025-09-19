'use client';

import { useMap } from './useMap';
import { useAchievements } from './useAchievements';
import { useEffect } from 'react';

export function useMapAchievements() {
  const { mapData } = useMap();
  const { triggerAchievement } = useAchievements();

  useEffect(() => {
    const unlockedNodes = mapData.nodes.filter(n => n.unlocked);

    unlockedNodes.forEach(node => {
      triggerAchievement('MAP_NODE_UNLOCKED', node.id);
    });

    const allNodesUnlocked = mapData.nodes.every(n => n.unlocked);
    if (allNodesUnlocked && mapData.nodes.length > 0) {
      triggerAchievement('MAP_ALL_NODES_UNLOCKED');
    }
  }, [mapData.nodes, triggerAchievement]);
}
