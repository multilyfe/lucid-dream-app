'use client';

import { type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sidebar, type SidebarNavKey } from "../components/Sidebar";
import Orb from "../components/Orb";
import { TopBar } from "../components/TopBar";
import { BuffBar } from "../components/BuffBar";
import { usePersistentState } from "../hooks/usePersistentState";

const XP_SEGMENT_CAP = 1000;

const TAB_TO_KEY: Record<string, SidebarNavKey> = {
  dashboard: "dashboard",
  journal: "journal",
  analytics: "analytics",
  quests: "quests",
  dungeon: "dungeon",
  shop: "shop",
  profile: "profile",
  npcs: "npcs",
  calendar: "calendar",
  inventory: "inventory",
  rituals: "rituals",
  people: "people",
  places: "places",
  companions: "companions",
  "reality checks": "quests",
  achievements: "achievements",
  xp: "achievements",
  settings: "settings",
};

const PATH_TO_KEY: Record<string, SidebarNavKey> = {
  dashboard: "dashboard",
  journal: "journal",
  temple: "temple",
  analytics: "analytics",
  quests: "quests",
  dungeon: "dungeon",
  shop: "shop",
  profile: "profile",
  npcs: "npcs",
  calendar: "calendar",
  inventory: "inventory",
  rituals: "rituals",
  people: "people",
  places: "places",
  companions: "companions",
  achievements: "achievements",
  settings: "settings",
  "panty-realm": "quests",
  "astral-map": "places",
  "companion-gallery": "companions",
};

type QuestLayoutProps = {
  children: ReactNode;
  xp?: number;
  orbDisabled?: boolean;
};

export default function QuestLayout({ children, xp, orbDisabled = false }: QuestLayoutProps) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [storedXp] = usePersistentState<number>("xpTotal", () => 3400);
  const [obediencePoints] = usePersistentState<number>("obediencePoints", () => 0);

  const tabParam = (search?.get("tab") ?? "").toLowerCase();

  const sectionFromPath = pathname.startsWith("/rpg/")
    ? pathname.split("/")[2]?.toLowerCase()
    : "";

  let activeKey: SidebarNavKey = "dashboard";
  if (sectionFromPath && PATH_TO_KEY[sectionFromPath]) {
    activeKey = PATH_TO_KEY[sectionFromPath];
  } else if (pathname.startsWith("/rpg") && tabParam) {
    activeKey = TAB_TO_KEY[tabParam] ?? activeKey;
  } else if (pathname.startsWith("/temple")) {
    activeKey = "temple";
  } else if (pathname.startsWith("/dreams")) {
    activeKey = "journal";
  }

  const isMainMenu =
    (pathname === "/" || pathname === "/rpg") && tabParam.length === 0 && !sectionFromPath;

  const xpValue =
    typeof xp === "number" && !Number.isNaN(xp) ? xp : storedXp ?? 3400;
  const obedienceValue = typeof obediencePoints === "number" ? obediencePoints : 0;
  const level = Math.max(1, Math.floor(xpValue / XP_SEGMENT_CAP) + 1);
  const currentLevelFloor = Math.max(0, level - 1);
  const levelBase = currentLevelFloor * XP_SEGMENT_CAP;
  const xpProgress = Math.min(1, Math.max(0, (xpValue - levelBase) / XP_SEGMENT_CAP));

  if (isMainMenu) {
    return <>{children}</>;
  }

  return (
    <div className="gradient-bg relative min-h-screen overflow-hidden text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar activeKey={activeKey} />
        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          <TopBar
            level={level}
            xp={xpValue}
            xpProgress={xpProgress}
            xpSegmentCap={XP_SEGMENT_CAP}
            obedience={obedienceValue}
          />
          <BuffBar />
          <main className="flex-1 overflow-y-auto bg-slate-950/65 px-8 py-8">
            {children}
          </main>
        </div>
      </div>

      <Orb disabled={orbDisabled} />
    </div>
  );
}
