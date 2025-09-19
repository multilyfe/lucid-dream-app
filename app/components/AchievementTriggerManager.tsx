'use client';

import { useShameAchievements } from "../hooks/useShameAchievements";
import { useDungeonAchievements } from "../hooks/useDungeonAchievements";
import { useCompanionAchievements } from "../hooks/useCompanionAchievements";
import { useRitualAchievements } from "../hooks/useRitualAchievements";
import { useMapAchievements } from "../hooks/useMapAchievements";

/**
 * This is a client-side component that exists only to instantiate the achievement trigger hooks.
 * These hooks listen to various state changes in the application and trigger achievements accordingly.
 * It renders no UI and has no direct effect on the component tree otherwise.
 */
export default function AchievementTriggerManager() {
  useShameAchievements();
  useDungeonAchievements();
  useCompanionAchievements();
  useRitualAchievements();
  useMapAchievements();

  return null;
}
