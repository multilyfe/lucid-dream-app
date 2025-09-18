export type OrbActionType =
  | "link"
  | "randomDream"
  | "latestDream"
  | "randomModule"
  | "summonCompanion";

export type OrbActionConfig = {
  id: string;
  label: string;
  icon: string;
  type: OrbActionType;
  href?: string;
  enabled: boolean;
};

export const DEFAULT_ORB_ACTIONS: OrbActionConfig[] = [
  {
    id: "journal",
    label: "Open Journal",
    icon: "📖",
    type: "link",
    href: "/rpg/journal",
    enabled: true,
  },
  {
    id: "profile",
    label: "Profile",
    icon: "👤",
    type: "link",
    href: "/rpg/profile",
    enabled: true,
  },
  {
    id: "npcs",
    label: "NPCs",
    icon: "🫂",
    type: "link",
    href: "/rpg/npcs",
    enabled: true,
  },
  {
    id: "random-dream",
    label: "Random Dream",
    icon: "🔀",
    type: "randomDream",
    enabled: true,
  },
  {
    id: "latest-dream",
    label: "Latest Dream",
    icon: "🌙",
    type: "latestDream",
    enabled: true,
  },
  {
    id: "summon-companion",
    label: "Summon Companion",
    icon: "🃏",
    type: "summonCompanion",
    enabled: true,
  },
  {
    id: "random-module",
    label: "Random Module",
    icon: "🎲",
    type: "randomModule",
    enabled: true,
  },
];
