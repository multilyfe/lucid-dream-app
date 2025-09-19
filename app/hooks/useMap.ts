'use client';

import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { cloneDefaultMap, type MapData, type MapNode, type UnlockCondition } from '../lib/map';
import { useInventory } from './useInventory';
import { useShame } from './useShame';
import { useRitualsEngine } from './useRitualsEngine';
import { useQuestlines } from './useQuestlines';

export function useMap() {
  const [mapData, setMapData] = usePersistentState<MapData>('map', cloneDefaultMap);
  const { awardXp } = useInventory();
  const { shame } = useShame();
  const { logs: ritualLogs } = useRitualsEngine();
  const { questlines } = useQuestlines();

  const checkUnlockCondition = useCallback((condition: UnlockCondition): boolean => {
    switch (condition.type) {
      case 'shame':
        // This is a placeholder for shame level logic.
        // Let's assume total shame points / 100 is the level.
        const shameLevel = (shame.pantiesSniffed + shame.ritualsFailed + shame.dirtyTokensBurned) / 100;
        return shameLevel >= (condition.level ?? 999);
      case 'ritual':
        return ritualLogs.some(log => log.ritualId === condition.id);
      case 'quest':
        const quest = questlines.find(q => q.id === condition.id);
        return quest?.completed ?? false;
      case 'item':
        // Placeholder for inventory check
        return false;
      default:
        return false;
    }
  }, [shame, ritualLogs, questlines]);

  const unlockNode = useCallback(
    (nodeId: string) => {
      let nodeWasUnlocked = false;

      setMapData((prev) => {
        const node = prev.nodes.find((n) => n.id === nodeId);
        if (!node || node.unlocked) {
          return prev;
        }

        nodeWasUnlocked = true;

        const newNodes = prev.nodes.map((n) =>
          n.id === nodeId ? { ...n, unlocked: true } : n
        );

        const newLinks = prev.links.map((l) => {
          if (l.from === nodeId) {
            // Check if the 'to' node is unlocked
            const toNode = newNodes.find(n => n.id === l.to);
            if (toNode?.unlocked) {
              return { ...l, locked: false };
            }
          }
          if (l.to === nodeId) {
            // Check if the 'from' node is unlocked
            const fromNode = newNodes.find(n => n.id === l.from);
            if (fromNode?.unlocked) {
              return { ...l, locked: false };
            }
          }
          return l;
        });

        return { nodes: newNodes, links: newLinks };
      });

      if (nodeWasUnlocked) {
        // Grant XP for unlocking a new node
        awardXp(100);
      }
    },
    [setMapData, awardXp]
  );

  const attemptUnlockNode = useCallback((nodeId: string): boolean => {
    const node = mapData.nodes.find(n => n.id === nodeId);
    if (!node || node.unlocked || !node.unlockCondition) {
      return false;
    }

    if (checkUnlockCondition(node.unlockCondition)) {
      unlockNode(nodeId);
      return true;
    }

    return false;
  }, [mapData.nodes, checkUnlockCondition, unlockNode]);

  const updateNodePosition = useCallback((nodeId: string, coords: [number, number]) => {
    setMapData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, coords } : n)
    }));
  }, [setMapData]);

  return {
    mapData,
    unlockNode,
    attemptUnlockNode,
    checkUnlockCondition,
    updateNodePosition,
    setMapData, // For Control Nexus
  };
}
