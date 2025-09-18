export interface DreamJournalEntry {
  id: string;
  title: string;
  date: string;
  content: string;
  tags: string[];
  companions: string[];
  places: string[];
  xpEarned: number;
  media: string[];
  createdAt: string;
  updatedAt: string;
  mood?: 'amazing' | 'good' | 'neutral' | 'challenging' | 'difficult' | 'euphoric';
  lucidity?: 'none' | 'partial' | 'full';
  vividness?: number; // 1-10 scale
  // Enhanced lucid dream metrics
  isLucid?: boolean;
  lucidityLevel?: number; // 0-10 scale for detailed lucidity assessment
  control?: number; // 0-10 scale for dream control level
  memory?: number; // 0-10 scale for dream recall quality
  emotionalDepth?: number; // 0-10 scale for emotional intensity
}

export interface JournalStreak {
  current: number;
  longest: number;
  lastEntryDate: string | null;
}

export interface JournalStats {
  totalEntries: number;
  totalXpEarned: number;
  averageXpPerEntry: number;
  mostUsedTags: { tag: string; count: number }[];
  favoriteCompanions: { name: string; count: number }[];
  favoriteLocations: { place: string; count: number }[];
  entriesThisMonth: number;
  lucidDreamCount: number;
}

export interface JournalFilter {
  searchText: string;
  tags: string[];
  companions: string[];
  places: string[];
  dateFrom: string;
  dateTo: string;
  minXp: number;
  maxXp: number;
  mood: string[];
  lucidity: string[];
}

export interface XpRewardConfig {
  baseEntry: number;
  lucidTag: number;
  ritualTag: number;
  pantyTag: number;
  templeTag: number;
  questTag: number;
  streakBonus: number;
}

export const DEFAULT_XP_CONFIG: XpRewardConfig = {
  baseEntry: 25,
  lucidTag: 50,
  ritualTag: 75,
  pantyTag: 100,
  templeTag: 30,
  questTag: 40,
  streakBonus: 15,
};

export const TAG_COLORS = {
  lucid: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
  ritual: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
  panty: 'bg-pink-500/20 text-pink-200 border-pink-400/40',
  temple: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
  quest: 'bg-green-500/20 text-green-200 border-green-400/40',
  nightmare: 'bg-red-500/20 text-red-200 border-red-400/40',
  flying: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
  transformation: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
  default: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
} as const;