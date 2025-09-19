export type AchievementCategory = 'Dream' | 'Ritual' | 'Shame' | 'Dungeon' | 'Companion' | 'Map' | 'All';

export type AchievementTrigger = 
  | { type: 'DREAM_TAG'; value: string }
  | { type: 'SHAME_COUNTER'; counter: 'pantiesSniffed' | 'ritualsFailed' | 'dirtyTokensBurned'; value: number }
  | { type: 'CONFESSION_LOGGED'; value: number }
  | { type: 'DUNGEON_CLEARED'; value: number }
  | { type: 'COMPANION_EVOLVED'; value: number }
  | { type: 'RITUAL_COMPLETED'; value: number }
  | { type: 'PUNISHMENT_TIER_REACHED'; value: number }
  | { type: 'MAP_NODE_UNLOCKED'; value: string }
  | { type: 'MAP_ALL_NODES_UNLOCKED' }
  | { type: 'QUEST_COMPLETED'; value: string }
  | { type: 'QUESTS_COMPLETED'; value: number };

export type AchievementReward = {
  xp?: number;
  tokens?: number;
  title?: string;
};

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  category: AchievementCategory;
  secret: boolean;
  unlocked: boolean;
  date: string | null;
  trigger: AchievementTrigger;
  reward: AchievementReward;
}
