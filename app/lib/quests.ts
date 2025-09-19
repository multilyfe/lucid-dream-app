// Quest Types and Utilities

export type QuestType = 'dream' | 'irl';
export type QuestStatus = 'locked' | 'active' | 'completed' | 'failed';
export type QuestCategory = 'main' | 'side' | 'daily' | 'weekly' | 'epic' | 'ritual' | 'skill' | 'exploration' | 'habit';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary';
export type QuestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RecurringType = 'daily' | 'weekly' | 'monthly' | null;

export interface QuestStep {
  id: string;
  text: string;
  desc: string;
  done: boolean;
  required: boolean;
}

export interface QuestRewards {
  xp?: number;
  tokens?: number;
  achievement?: string;
  title?: string;
  items?: string[];
  buffs?: string[];
  curses?: string[];
  obedience?: number;
  shame?: number;
}

export interface QuestPenalties {
  shame?: number;
  curses?: string[];
  xpLoss?: number;
}

export interface Quest {
  id: string;
  title: string;
  desc: string;
  type: QuestType;
  status: QuestStatus;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  priority: QuestPriority;
  steps: QuestStep[];
  rewards: QuestRewards;
  penalties?: QuestPenalties;
  tags: string[];
  unlocks: string[];
  timeLimit: number | null; // milliseconds
  recurring?: RecurringType;
  questline?: string;
  questlineStep?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
}

export interface QuestData {
  quests: Quest[];
  activeQuestlines: string[];
  completedAchievements: string[];
  totalXpEarned: number;
  questsCompleted: number;
  questsFailed: number;
}

// Default quest data
export const defaultQuestData: QuestData = {
  quests: [],
  activeQuestlines: [],
  completedAchievements: [],
  totalXpEarned: 0,
  questsCompleted: 0,
  questsFailed: 0
};

// Utility functions
export const getDifficultyColor = (difficulty: QuestDifficulty): string => {
  const colors = {
    easy: 'text-green-400 border-green-400/30 bg-green-500/10',
    medium: 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10',
    hard: 'text-orange-400 border-orange-400/30 bg-orange-500/10',
    very_hard: 'text-red-400 border-red-400/30 bg-red-500/10',
    legendary: 'text-purple-400 border-purple-400/30 bg-purple-500/10'
  };
  return colors[difficulty];
};

export const getTypeColor = (type: QuestType): string => {
  const colors = {
    dream: 'text-cyan-400 border-cyan-400/30 bg-cyan-500/10',
    irl: 'text-pink-400 border-pink-400/30 bg-pink-500/10'
  };
  return colors[type];
};

export const getStatusColor = (status: QuestStatus): string => {
  const colors = {
    locked: 'text-gray-500 border-gray-500/30 bg-gray-500/10',
    active: 'text-blue-400 border-blue-400/30 bg-blue-500/10',
    completed: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10',
    failed: 'text-red-400 border-red-400/30 bg-red-500/10'
  };
  return colors[status];
};

export const getPriorityIcon = (priority: QuestPriority): string => {
  const icons = {
    low: '●',
    medium: '◆',
    high: '★',
    urgent: '⚡'
  };
  return icons[priority];
};

export const getTypeIcon = (type: QuestType): string => {
  const icons = {
    dream: '🌙',
    irl: '🌸'
  };
  return icons[type];
};

export const getCategoryIcon = (category: QuestCategory): string => {
  const icons = {
    main: '🗺️',
    side: '📋',
    daily: '📅',
    weekly: '🗓️',
    epic: '⚔️',
    ritual: '🕯️',
    skill: '✨',
    exploration: '🔍',
    habit: '📖'
  };
  return icons[category];
};

export const calculateQuestProgress = (quest: Quest): { completed: number; total: number; percentage: number } => {
  const completed = quest.steps.filter(step => step.done).length;
  const total = quest.steps.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
};

export const isQuestExpired = (quest: Quest): boolean => {
  if (!quest.timeLimit) return false;
  const now = Date.now();
  const createdAt = new Date(quest.createdAt).getTime();
  return now > (createdAt + quest.timeLimit);
};

export const getTimeRemaining = (quest: Quest): string | null => {
  if (!quest.timeLimit) return null;
  
  const now = Date.now();
  const createdAt = new Date(quest.createdAt).getTime();
  const expiresAt = createdAt + quest.timeLimit;
  const remaining = expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const canCompleteQuest = (quest: Quest): boolean => {
  const requiredSteps = quest.steps.filter(step => step.required);
  return requiredSteps.every(step => step.done);
};

export const getQuestsByStatus = (quests: Quest[], status: QuestStatus): Quest[] => {
  return quests.filter(quest => quest.status === status);
};

export const getQuestsByType = (quests: Quest[], type: QuestType): Quest[] => {
  return quests.filter(quest => quest.type === type);
};

export const getQuestsByCategory = (quests: Quest[], category: QuestCategory): Quest[] => {
  return quests.filter(quest => quest.category === category);
};

export const sortQuestsByPriority = (quests: Quest[]): Quest[] => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  return [...quests].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

export const getQuestChain = (quests: Quest[], questlineId: string): Quest[] => {
  return quests
    .filter(quest => quest.questline === questlineId)
    .sort((a, b) => (a.questlineStep || 0) - (b.questlineStep || 0));
};

export const getUnlockedQuests = (quests: Quest[], completedQuestIds: string[]): Quest[] => {
  return quests.filter(quest => {
    if (quest.status !== 'locked') return false;
    return quest.unlocks.length === 0 || quest.unlocks.some(id => completedQuestIds.includes(id));
  });
};

export const checkAutoCompleteConditions = (quest: Quest, journalEntries: any[], shameData: any, ritualData: any): boolean => {
  // Dream quest auto-completion based on journal entries
  if (quest.type === 'dream') {
    // Check if specific dream activities were logged
    if (quest.tags.includes('flying')) {
      return journalEntries.some(entry => 
        entry.tags?.includes('fly') || 
        entry.content?.toLowerCase().includes('flying') ||
        entry.content?.toLowerCase().includes('flew')
      );
    }
    if (quest.tags.includes('lucid')) {
      return journalEntries.some(entry => entry.lucid === true);
    }
  }
  
  // IRL quest auto-completion based on shame/ritual tracking
  if (quest.type === 'irl') {
    if (quest.tags.includes('ritual') && quest.category === 'daily') {
      // Check if ritual was completed today
      const today = new Date().toDateString();
      return ritualData?.logs?.some((log: any) => 
        new Date(log.date).toDateString() === today
      );
    }
    if (quest.tags.includes('shame')) {
      // Check if shame tasks were completed
      return shameData?.dailyTasks?.filter((task: any) => task.completed).length >= 3;
    }
  }
  
  return false;
};

// Enhanced quest auto-completion helpers
export const checkDreamQuestCompletion = (quest: Quest, journalEntries: any[]): boolean => {
  if (quest.type !== 'dream') return false;

  // Check for recent journal entries matching quest criteria
  const questCreatedDate = new Date(quest.createdAt);
  const recentEntries = journalEntries.filter(entry => 
    new Date(entry.date) >= questCreatedDate
  );

  // Lucid dreaming quests
  if (quest.tags.includes('lucid')) {
    return recentEntries.some(entry => 
      entry.tags?.includes('lucid') || 
      entry.lucidity === 'full' ||
      entry.lucidity === 'partial'
    );
  }

  // Temple or spiritual quests
  if (quest.tags.includes('temple') || quest.tags.includes('spiritual')) {
    return recentEntries.some(entry =>
      entry.places?.includes('Temple of Dreams') ||
      entry.tags?.includes('temple') ||
      entry.tags?.includes('ritual') ||
      entry.tags?.includes('transformation')
    );
  }

  // Companion interaction quests
  if (quest.tags.includes('companion')) {
    return recentEntries.some(entry =>
      entry.companions && entry.companions.length > 0
    );
  }

  return false;
};

export const checkIrlQuestCompletion = (quest: Quest, shameData: any, ritualData: any): boolean => {
  if (quest.type !== 'irl') return false;

  // Obedience and shame tracking quests
  if (quest.tags.includes('obedience') || quest.tags.includes('shame')) {
    const hasShameActivity = shameData.pantiesSniffed > 0 ||
                            shameData.confessions.length > 0 ||
                            shameData.dirtyTokensBurned > 0;
    return hasShameActivity;
  }

  // Ritual completion quests
  if (quest.tags.includes('ritual')) {
    return ritualData.some((ritual: any) => 
      ritual.completedToday || ritual.completedThisWeek
    );
  }

  // Daily habit quests
  if (quest.category === 'daily') {
    const today = new Date().toISOString().split('T')[0];
    const questUpdatedToday = quest.updatedAt.split('T')[0] === today;
    return questUpdatedToday && quest.steps.some(step => step.done);
  }

  return false;
};

// Advanced Quest Features

// Quest Chain Management
export const getQuestlineChain = (questlineId: string, quests: Quest[]): Quest[] => {
  return quests
    .filter(quest => quest.questline === questlineId)
    .sort((a, b) => (a.questlineStep || 0) - (b.questlineStep || 0));
};

export const getNextQuestInChain = (questlineId: string, currentStep: number, quests: Quest[]): Quest | null => {
  const chain = getQuestlineChain(questlineId, quests);
  const nextQuest = chain.find(quest => quest.questlineStep === currentStep + 1);
  return nextQuest || null;
};

export const isQuestChainCompleted = (questlineId: string, quests: Quest[]): boolean => {
  const chain = getQuestlineChain(questlineId, quests);
  return chain.length > 0 && chain.every(quest => quest.status === 'completed');
};

// Daily/Weekly Quest Generation
export const generateDailyQuestTemplates = (): Partial<Quest>[] => [
  {
    title: "Morning Reflection",
    desc: "Start your day with mindful intention",
    type: 'irl' as QuestType,
    category: 'daily' as QuestCategory,
    difficulty: 'easy' as QuestDifficulty,
    priority: 'medium' as QuestPriority,
    steps: [
      { id: 'daily-reflect-1', text: "Spend 5 minutes in quiet reflection", desc: "Find a peaceful space", done: false, required: true }
    ],
    rewards: { xp: 50, obedience: 10 },
    tags: ['mindfulness', 'daily', 'morning'],
    unlocks: [],
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours
    recurring: 'daily' as RecurringType
  },
  {
    title: "Dream Journal Entry",
    desc: "Record your nocturnal adventures",
    type: 'dream' as QuestType,
    category: 'daily' as QuestCategory,
    difficulty: 'easy' as QuestDifficulty,
    priority: 'high' as QuestPriority,
    steps: [
      { id: 'daily-journal-1', text: "Write down at least one dream", desc: "Record any dream fragments", done: false, required: true }
    ],
    rewards: { xp: 75, tokens: 5 },
    tags: ['dreams', 'journal', 'daily'],
    unlocks: [],
    timeLimit: 24 * 60 * 60 * 1000,
    recurring: 'daily' as RecurringType
  },
  {
    title: "Lucidity Practice",
    desc: "Strengthen dream awareness",
    type: 'dream' as QuestType,
    category: 'daily' as QuestCategory,
    difficulty: 'medium' as QuestDifficulty,
    priority: 'high' as QuestPriority,
    steps: [
      { id: 'daily-rc-1', text: "Perform 5 reality checks", desc: "Question your reality throughout the day", done: false, required: true },
      { id: 'daily-intent-1', text: "Set lucid dream intention", desc: "Before sleep, affirm your awareness", done: false, required: true }
    ],
    rewards: { xp: 100, buffs: ['lucidity_boost'] },
    tags: ['lucidity', 'practice', 'daily'],
    unlocks: [],
    timeLimit: 24 * 60 * 60 * 1000,
    recurring: 'daily' as RecurringType
  }
];

export const generateWeeklyQuestTemplates = (): Partial<Quest>[] => [
  {
    title: "Weekly Transformation Review",
    desc: "Assess your journey and growth",
    type: 'irl' as QuestType,
    category: 'weekly' as QuestCategory,
    difficulty: 'medium' as QuestDifficulty,
    priority: 'medium' as QuestPriority,
    steps: [
      { id: 'weekly-review-1', text: "Complete transformation self-assessment", desc: "Reflect on weekly progress", done: false, required: true },
      { id: 'weekly-goals-1', text: "Set goals for the upcoming week", desc: "Plan your path forward", done: false, required: true }
    ],
    rewards: { xp: 200, tokens: 25, achievement: 'Self Reflective' },
    tags: ['reflection', 'weekly', 'growth'],
    unlocks: [],
    timeLimit: 7 * 24 * 60 * 60 * 1000, // 7 days
    recurring: 'weekly' as RecurringType
  },
  {
    title: "Dream Pattern Analysis",
    desc: "Study your dream themes and symbols",
    type: 'dream' as QuestType,
    category: 'weekly' as QuestCategory,
    difficulty: 'hard' as QuestDifficulty,
    priority: 'medium' as QuestPriority,
    steps: [
      { id: 'weekly-patterns-1', text: "Identify recurring dream themes", desc: "Look for patterns in your journal", done: false, required: true },
      { id: 'weekly-symbols-1', text: "Analyze dream symbols", desc: "Research and interpret meanings", done: false, required: true },
      { id: 'weekly-plan-1', text: "Create dream work plan", desc: "Plan specific techniques to explore themes", done: false, required: true }
    ],
    rewards: { xp: 300, tokens: 40, title: 'Dream Analyst' },
    tags: ['analysis', 'dreams', 'weekly'],
    unlocks: [],
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    recurring: 'weekly' as RecurringType
  }
];

// Quest Generation Functions
export const createDailyQuest = (template: Partial<Quest>, date: Date): Quest => {
  const dateStr = date.toISOString().split('T')[0];
  return {
    id: `daily-${template.title?.toLowerCase().replace(/\s+/g, '-')}-${dateStr}`,
    ...template,
    status: 'active' as QuestStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Quest;
};

export const createWeeklyQuest = (template: Partial<Quest>, weekStart: Date): Quest => {
  const weekStr = weekStart.toISOString().split('T')[0];
  return {
    id: `weekly-${template.title?.toLowerCase().replace(/\s+/g, '-')}-${weekStr}`,
    ...template,
    status: 'active' as QuestStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Quest;
};

// Quest Branching System
export interface QuestBranch {
  condition: string; // e.g., "step_completed:step1" or "choice:option_a"
  unlocks: string[]; // Quest IDs to unlock
  locks: string[]; // Quest IDs to lock/fail
}

export const handleQuestBranching = (quest: Quest, branches: QuestBranch[], completedSteps: string[], choices: Record<string, string>): string[] => {
  const unlockedQuests: string[] = [];
  
  for (const branch of branches) {
    let conditionMet = false;
    
    if (branch.condition.startsWith('step_completed:')) {
      const stepId = branch.condition.split(':')[1];
      conditionMet = completedSteps.includes(stepId);
    } else if (branch.condition.startsWith('choice:')) {
      const [, choiceKey, expectedValue] = branch.condition.split(':');
      conditionMet = choices[choiceKey] === expectedValue;
    }
    
    if (conditionMet) {
      unlockedQuests.push(...branch.unlocks);
    }
  }
  
  return unlockedQuests;
};

// Time-based Quest Management
export const shouldGenerateNewDailyQuests = (lastGenerated: string): boolean => {
  const lastDate = new Date(lastGenerated);
  const today = new Date();
  
  return lastDate.toDateString() !== today.toDateString();
};

export const shouldGenerateNewWeeklyQuests = (lastGenerated: string): boolean => {
  const lastDate = new Date(lastGenerated);
  const today = new Date();
  
  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  return getWeekStart(lastDate).getTime() !== getWeekStart(today).getTime();
};