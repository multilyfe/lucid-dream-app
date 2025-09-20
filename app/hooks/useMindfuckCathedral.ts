'use client';

import { usePersistentState } from './usePersistentState';
import { useCallback, useEffect } from 'react';
import { useInventory } from './useInventory';
import { useCompanions } from './useCompanions';

export interface TripLogEntity {
  name: string;
  description: string;
  message: string;
  encountered_at: string;
}

export interface TripLogInsight {
  id: string;
  timestamp: string;
  content: string;
  emotional_intensity: number;
  type: 'ontological' | 'existential' | 'therapeutic' | 'cosmic' | 'personal';
}

export interface EmotionalSpike {
  timestamp: string;
  type: 'terror' | 'bliss' | 'crying' | 'purging' | 'orgasmic' | 'rage' | 'euphoria';
  intensity: number;
  description: string;
  duration: number;
}

export interface PhaseBreakdown {
  onset: string;
  come_up: string;
  peak: string;
  plateau: string;
  come_down: string;
}

export interface TripLog {
  id: string;
  date: string;
  substance: string;
  dosage: string;
  duration: number;
  setting: string;
  intention: string;
  entities: TripLogEntity[];
  insights: TripLogInsight[];
  emotional_spikes: EmotionalSpike[];
  ego_death_level: number;
  integration_notes: string;
  tags: string[];
  phase_breakdown: PhaseBreakdown;
  vault_file?: string;
  xp_awarded: number;
  tokens_earned: number;
}

export interface MindfuckQuest {
  id: string;
  title: string;
  description: string;
  type: 'ego_trial' | 'entity_contact' | 'integration' | 'breakthrough' | 'healing';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
  requirements: {
    [key: string]: any;
  };
  rewards: {
    xp: number;
    tokens: number;
    title?: string;
    unlock?: string;
  };
  status: 'available' | 'in_progress' | 'completed' | 'locked';
  completed_date?: string;
  progress?: {
    [key: string]: any;
  };
  icon: string;
}

export interface EgoDeathCounter {
  total_experiences: number;
  by_substance: {
    [substance: string]: number;
  };
  intensity_breakdown: {
    [level: string]: number;
  };
  first_experience: string;
  most_recent: string;
  deepest_level: number;
  average_level: number;
}

export interface InsightScroll {
  id: string;
  content: string;
  date: string;
  trip_id?: string;
  category: 'ontological' | 'existential' | 'therapeutic' | 'cosmic' | 'personal';
  intensity: number;
  tags: string[];
  integration_status: 'new' | 'active' | 'integrated' | 'archived';
}

export interface TimelineEvent {
  date: string;
  type: 'breakthrough' | 'healing' | 'integration' | 'revelation';
  title: string;
  description: string;
  intensity: number;
  related_trip?: string;
}

export interface TimelineLoop {
  pattern: string;
  frequency: number;
  first_noticed: string;
  resolution?: string;
}

export interface TimelineFlashback {
  date: string;
  trigger: string;
  experience: string;
  intensity: number;
  duration: number;
}

export interface SpiralTimeline {
  id: string;
  year: number;
  breakthroughs: TimelineEvent[];
  loops: TimelineLoop[];
  flashbacks: TimelineFlashback[];
}

export interface DMTEntity {
  type: string;
  description: string;
  interaction: string;
  communication_method: string;
}

export interface DMTPortalLog {
  id: string;
  date: string;
  method: string;
  dosage: string;
  duration: number;
  breakthrough: boolean;
  entities_encountered: DMTEntity[];
  hyperspace_description: string;
  key_visuals: string[];
  integration_insights: string;
  return_experience: string;
  vault_file?: string;
}

export interface VaultFile {
  filename: string;
  size: number;
  modified: string;
  status: 'synced' | 'pending' | 'error';
}

export interface VaultSyncLog {
  id: string;
  timestamp: string;
  files_detected: number;
  files_imported: number;
  files_updated: number;
  status: 'success' | 'partial' | 'error';
  last_sync: string;
  vault_path: string;
  files: VaultFile[];
}

export interface MindfuckCurrency {
  mindfuck_tokens: number;
  total_earned: number;
  total_spent: number;
  exchange_rate: {
    xp_per_token: number;
    tokens_per_trip: number;
  };
}

export interface MindfuckAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  date_unlocked?: string;
  progress?: number;
  required?: number;
  icon: string;
}

export interface MindfuckTitle {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface MindfuckSettings {
  show_disclaimer: boolean;
  vault_sync_enabled: boolean;
  auto_generate_insights: boolean;
  emotional_spike_detection: boolean;
  entity_encounter_tracking: boolean;
  integration_reminders: boolean;
  trip_planning_mode: 'basic' | 'advanced' | 'expert';
}

export interface MindfuckStatistics {
  total_trips: number;
  total_hours_traveled: number;
  total_insights: number;
  total_entity_encounters: number;
  integration_success_rate: number;
  consciousness_expansion_level: number;
}

export interface MindfuckCathedralData {
  tripLogs: TripLog[];
  mindfuckQuests: MindfuckQuest[];
  egoDeathCounter: EgoDeathCounter;
  insightScrolls: InsightScroll[];
  spiralTimelines: SpiralTimeline[];
  dmtPortalLogs: DMTPortalLog[];
  vaultSyncLogs: VaultSyncLog[];
  currency: MindfuckCurrency;
  achievements: MindfuckAchievement[];
  titles: MindfuckTitle[];
  settings: MindfuckSettings;
  statistics: MindfuckStatistics;
}

const defaultMindfuckData: MindfuckCathedralData = {
  tripLogs: [],
  mindfuckQuests: [
    {
      id: 'quest-first-journey',
      title: 'First Contact',
      description: 'Complete your first documented psychedelic journey',
      type: 'breakthrough',
      difficulty: 'easy',
      requirements: {
        trips_logged: 1
      },
      rewards: {
        xp: 100,
        tokens: 10,
        title: 'Consciousness Explorer'
      },
      status: 'available',
      icon: '🚀'
    },
    {
      id: 'quest-ego-death',
      title: 'The Great Dissolution',
      description: 'Experience complete ego death and return to tell the tale',
      type: 'ego_trial',
      difficulty: 'legendary',
      requirements: {
        ego_death_level: 4,
        consecutive_sessions: 3
      },
      rewards: {
        xp: 1000,
        tokens: 100,
        title: 'Void Diver'
      },
      status: 'locked',
      icon: '💀'
    }
  ],
  egoDeathCounter: {
    total_experiences: 0,
    by_substance: {},
    intensity_breakdown: {
      level_1: 0,
      level_2: 0,
      level_3: 0,
      level_4: 0,
      level_5: 0
    },
    first_experience: '',
    most_recent: '',
    deepest_level: 0,
    average_level: 0
  },
  insightScrolls: [],
  spiralTimelines: [],
  dmtPortalLogs: [],
  vaultSyncLogs: [],
  currency: {
    mindfuck_tokens: 0,
    total_earned: 0,
    total_spent: 0,
    exchange_rate: {
      xp_per_token: 10,
      tokens_per_trip: 25
    }
  },
  achievements: [
    {
      id: 'first_breakthrough',
      title: 'First Contact',
      description: 'Complete your first breakthrough experience',
      unlocked: false,
      icon: '🚀'
    },
    {
      id: 'ego_death_master',
      title: 'Void Diver',
      description: 'Experience complete ego death 5+ times',
      unlocked: false,
      required: 5,
      progress: 0,
      icon: '💀'
    }
  ],
  titles: [
    {
      id: 'consciousness_explorer',
      name: 'Consciousness Explorer',
      description: 'First steps into the infinite',
      unlocked: false,
      rarity: 'common'
    },
    {
      id: 'void_diver',
      name: 'Void Diver',
      description: 'One who has returned from the absolute',
      unlocked: false,
      rarity: 'legendary'
    },
    {
      id: 'lucid_shaman',
      name: 'Lucid Shaman',
      description: 'Bridge between worlds',
      unlocked: false,
      rarity: 'epic'
    },
    {
      id: 'ego_blender',
      name: 'Ego Blender',
      description: 'Master of identity dissolution',
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: 'memory_hacker',
      name: 'Memory Hacker',
      description: 'Architect of consciousness',
      unlocked: false,
      rarity: 'uncommon'
    }
  ],
  settings: {
    show_disclaimer: true,
    vault_sync_enabled: true,
    auto_generate_insights: true,
    emotional_spike_detection: true,
    entity_encounter_tracking: true,
    integration_reminders: true,
    trip_planning_mode: 'basic'
  },
  statistics: {
    total_trips: 0,
    total_hours_traveled: 0,
    total_insights: 0,
    total_entity_encounters: 0,
    integration_success_rate: 0,
    consciousness_expansion_level: 0
  }
};

export const useMindfuckCathedral = () => {
  const [cathedralData, setCathedralData] = usePersistentState<MindfuckCathedralData>(
    'mindfuck-cathedral',
    () => defaultMindfuckData
  );

  // Import XP system for integration
  const { awardXp } = useInventory();
  const { gainXpForCompanions } = useCompanions();

  // Add new trip log
  const addTripLog = useCallback((tripLog: Omit<TripLog, 'id' | 'xp_awarded' | 'tokens_earned'>) => {
    const newTrip: TripLog = {
      ...tripLog,
      id: `trip-${Date.now()}`,
      xp_awarded: Math.max(100, tripLog.ego_death_level * 100 + tripLog.insights.length * 50),
      tokens_earned: cathedralData.currency.exchange_rate.tokens_per_trip
    };

    setCathedralData(prev => {
      const updated = { ...prev };
      updated.tripLogs = [...prev.tripLogs, newTrip];
      updated.currency.mindfuck_tokens += newTrip.tokens_earned;
      updated.currency.total_earned += newTrip.tokens_earned;
      updated.statistics.total_trips += 1;
      updated.statistics.total_hours_traveled += tripLog.duration / 60;
      updated.statistics.total_insights += tripLog.insights.length;
      updated.statistics.total_entity_encounters += tripLog.entities.length;

      // Update ego death counter
      if (tripLog.ego_death_level > 0) {
        updated.egoDeathCounter.total_experiences += 1;
        updated.egoDeathCounter.by_substance[tripLog.substance] = 
          (updated.egoDeathCounter.by_substance[tripLog.substance] || 0) + 1;
        updated.egoDeathCounter.intensity_breakdown[`level_${tripLog.ego_death_level}`] += 1;
        updated.egoDeathCounter.most_recent = tripLog.date;
        if (!updated.egoDeathCounter.first_experience) {
          updated.egoDeathCounter.first_experience = tripLog.date;
        }
        if (tripLog.ego_death_level > updated.egoDeathCounter.deepest_level) {
          updated.egoDeathCounter.deepest_level = tripLog.ego_death_level;
        }
      }

      return updated;
    });

    // Award global XP to player profile
    awardXp(newTrip.xp_awarded);
    
    // Award companion XP for consciousness expansion 
    gainXpForCompanions('ritual', 50);

    return newTrip;
  }, [setCathedralData, cathedralData.currency.exchange_rate.tokens_per_trip, awardXp, gainXpForCompanions]);

  // Add insight scroll
  const addInsight = useCallback((insight: Omit<InsightScroll, 'id'>) => {
    const newInsight: InsightScroll = {
      ...insight,
      id: `insight-${Date.now()}`
    };

    setCathedralData(prev => ({
      ...prev,
      insightScrolls: [...prev.insightScrolls, newInsight],
      statistics: {
        ...prev.statistics,
        total_insights: prev.statistics.total_insights + 1
      }
    }));

    return newInsight;
  }, [setCathedralData]);

  // Complete quest
  const completeQuest = useCallback((questId: string) => {
    setCathedralData(prev => {
      const updated = { ...prev };
      const questIndex = updated.mindfuckQuests.findIndex(q => q.id === questId);
      
      if (questIndex !== -1) {
        const quest = updated.mindfuckQuests[questIndex];
        quest.status = 'completed';
        quest.completed_date = new Date().toISOString().split('T')[0];
        
        // Award rewards
        updated.currency.mindfuck_tokens += quest.rewards.tokens;
        updated.currency.total_earned += quest.rewards.tokens;
        
        // Award global XP
        awardXp(quest.rewards.xp);
        
        // Award companion XP for quest completion
        gainXpForCompanions('quest', 25);
        
        // Unlock title if specified
        if (quest.rewards.title) {
          const titleIndex = updated.titles.findIndex(t => t.name === quest.rewards.title);
          if (titleIndex !== -1) {
            updated.titles[titleIndex].unlocked = true;
          }
        }
      }
      
      return updated;
    });
  }, [setCathedralData, awardXp, gainXpForCompanions]);

  // Add DMT portal log
  const addDMTPortalLog = useCallback((portalLog: Omit<DMTPortalLog, 'id'>) => {
    const newLog: DMTPortalLog = {
      ...portalLog,
      id: `portal-${Date.now()}`
    };

    setCathedralData(prev => ({
      ...prev,
      dmtPortalLogs: [...prev.dmtPortalLogs, newLog],
      statistics: {
        ...prev.statistics,
        total_entity_encounters: prev.statistics.total_entity_encounters + portalLog.entities_encountered.length
      }
    }));

    return newLog;
  }, [setCathedralData]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<MindfuckSettings>) => {
    setCathedralData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, [setCathedralData]);

  // Spend tokens
  const spendTokens = useCallback((amount: number) => {
    setCathedralData(prev => {
      if (prev.currency.mindfuck_tokens >= amount) {
        return {
          ...prev,
          currency: {
            ...prev.currency,
            mindfuck_tokens: prev.currency.mindfuck_tokens - amount,
            total_spent: prev.currency.total_spent + amount
          }
        };
      }
      return prev;
    });
  }, [setCathedralData]);

  // Check for achievement unlocks
  useEffect(() => {
    setCathedralData(prev => {
      const updated = { ...prev };
      let hasChanges = false;

      // Check ego death achievement
      const egoDeathAchievement = updated.achievements.find(a => a.id === 'ego_death_master');
      if (egoDeathAchievement && !egoDeathAchievement.unlocked) {
        egoDeathAchievement.progress = updated.egoDeathCounter.total_experiences;
        if (updated.egoDeathCounter.total_experiences >= 5) {
          egoDeathAchievement.unlocked = true;
          egoDeathAchievement.date_unlocked = new Date().toISOString().split('T')[0];
          hasChanges = true;
        }
      }

      // Check first breakthrough achievement
      const firstBreakthrough = updated.achievements.find(a => a.id === 'first_breakthrough');
      if (firstBreakthrough && !firstBreakthrough.unlocked && updated.tripLogs.length > 0) {
        firstBreakthrough.unlocked = true;
        firstBreakthrough.date_unlocked = new Date().toISOString().split('T')[0];
        hasChanges = true;
      }

      return hasChanges ? updated : prev;
    });
  }, [setCathedralData, cathedralData.tripLogs.length, cathedralData.egoDeathCounter.total_experiences]);

  return {
    cathedralData,
    addTripLog,
    addInsight,
    completeQuest,
    addDMTPortalLog,
    updateSettings,
    spendTokens
  };
};