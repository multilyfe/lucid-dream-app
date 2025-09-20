'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Landmark,
  LineChart,
  Swords,
  Backpack,
  Lock,
  Users,
  Map as MapIcon,
  Trophy,
  Cog,
  Sparkles,
  Skull,
  ShoppingBag,
  UserCircle2,
  CalendarDays,
  Wand2,
  Castle,
  Brain,
} from "lucide-react";
import { usePersistentState } from "../hooks/usePersistentState";

export type SidebarNavKey =
  | "dashboard"
  | "journal"
  | "temple"
  | "mindfuck"
  | "analytics"
  | "quests"
  | "dungeons"
  | "shop"
  | "profile"
  | "npcs"
  | "calendar"
  | "inventory"
  | "rituals"
  | "people"
  | "places"
  | "companions"
  | "achievements"
  | "shame"
  | "map"
  | "buffs"
  | "pantyrealm"
  | "settings";

export type SidebarProps = {
  activeKey: SidebarNavKey;
};

const NAV_ITEMS: Array<{
  key: SidebarNavKey;
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "dashboard", label: "Dashboard", href: "/rpg/dashboard", Icon: LayoutDashboard },
  { key: "journal", label: "Journal", href: "/rpg/journal", Icon: BookOpen },
  { key: "quests", label: "Quests", href: "/rpg/quests", Icon: Swords },
  { key: "map", label: "Map", href: "/rpg/map", Icon: MapIcon },
  { key: "companions", label: "Companions", href: "/rpg/companions", Icon: Sparkles },
  { key: "inventory", label: "Inventory", href: "/rpg/inventory", Icon: Backpack },
  { key: "dungeons", label: "Dungeons", href: "/rpg/dungeons", Icon: Castle },
  { key: "rituals", label: "Rituals", href: "/rpg/rituals", Icon: Lock },
  { key: "buffs", label: "Buffs & Curses", href: "/rpg/buffs", Icon: Wand2 },
  { key: "pantyrealm", label: "Panty Realm", href: "/rpg/pantyrealm", Icon: Skull },
  { key: "temple", label: "Temple", href: "/rpg/temple", Icon: Landmark },
  { key: "mindfuck", label: "Mindfuck Cathedral", href: "/rpg/mindfuck", Icon: Brain },
  { key: "shop", label: "Shop", href: "/rpg/shop", Icon: ShoppingBag },
  { key: "npcs", label: "NPCs", href: "/rpg/npcs", Icon: Users },
  { key: "profile", label: "Profile", href: "/rpg/profile", Icon: UserCircle2 },
  { key: "calendar", label: "Calendar", href: "/rpg/calendar", Icon: CalendarDays },
  { key: "analytics", label: "Analytics", href: "/rpg/analytics", Icon: LineChart },
  { key: "achievements", label: "Achievements", href: "/rpg/achievements", Icon: Trophy },
  { key: "shame", label: "Shame", href: "/rpg/shame", Icon: Skull },
  { key: "settings", label: "Settings", href: "/rpg/settings", Icon: Cog },
];

export function Sidebar({ activeKey }: SidebarProps) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [collapsed, setCollapsed] = usePersistentState<boolean>(
    "sidebarCollapsed",
    () => false
  );

  const tabKey = search?.get("tab")?.toLowerCase() ?? "";

  const pathSegment = useMemo(() => {
    if (!pathname || pathname === "/") return "";
    if (pathname.startsWith("/rpg/")) {
      const [, , sectionRaw] = pathname.split("/");
      return sectionRaw?.toLowerCase() ?? "";
    }
    if (pathname === "/rpg") return "";
    if (pathname.startsWith("/temple")) {
      return "temple";
    }
    return "";
  }, [pathname]);

  const resolvedActive = useMemo(() => {
    const byPath = pathSegment
      ? NAV_ITEMS.find((item) => item.href.endsWith(`/${pathSegment}`))
      : undefined;
    if (byPath) return byPath.key;

    if (pathname.startsWith("/rpg") && !pathSegment) {
      const matchedByQuery = NAV_ITEMS.find((item) =>
        item.href.toLowerCase().includes(`/rpg/${tabKey}`)
      );
      if (matchedByQuery) {
        return matchedByQuery.key;
      }
      if (tabKey === "dashboard" || pathname === "/rpg") {
        return "dashboard";
      }
    }

    if (pathname.startsWith("/temple")) {
      return "temple";
    }

    return activeKey;
  }, [activeKey, pathSegment, pathname, tabKey]);

  const widthClass = collapsed ? "w-20 md:w-24" : "w-[260px]";

  return (
    <aside
      className={`${widthClass} flex h-full flex-col border-r border-slate-800/60 bg-slate-950/80 px-3 py-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl drop-shadow-[0_0_12px_rgba(244,114,182,0.35)]" aria-hidden>
          🌙
        </span>
        {collapsed ? null : (
          <span className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200">
            Quest Hub
          </span>
        )}
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map(({ key, label, href, Icon }) => {
          const active = resolvedActive === key;
          const isMindfuck = key === "mindfuck";
          
          const base = collapsed
            ? "group relative flex items-center justify-center rounded-2xl px-3 py-3 transition"
            : "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition";
          
          // Special psychedelic styling for Mindfuck Cathedral
          const state = active
            ? isMindfuck
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-lg shadow-purple-500/50 animate-pulse"
              : "bg-gradient-to-r from-fuchsia-500 via-rose-400 to-sky-400 text-slate-950 shadow-lg shadow-fuchsia-500/40"
            : isMindfuck
              ? "text-purple-300 hover:bg-gradient-to-r hover:from-purple-900/30 hover:via-pink-900/30 hover:to-blue-900/30 hover:shadow-lg hover:shadow-purple-500/20"
              : "text-slate-300 hover:bg-slate-800/60";
              
          const iconBg = active
            ? isMindfuck
              ? "bg-slate-950/90 text-purple-200"
              : "bg-slate-950/90 text-slate-100"
            : isMindfuck
              ? "bg-gradient-to-br from-purple-900/60 to-pink-900/60 text-purple-200 group-hover:text-purple-100"
              : "bg-slate-900/60 text-slate-200 group-hover:text-white";

          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${base} ${state}`}
              aria-label={collapsed ? label : undefined}
              title={label}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-transparent text-base shadow-inner transition-all duration-300 ${
                  isMindfuck 
                    ? "group-hover:shadow-[0_0_18px_rgba(168,85,247,0.6)] border-purple-500/20" 
                    : "group-hover:shadow-[0_0_18px_rgba(244,114,182,0.35)]"
                } ${iconBg}`}
              >
                <Icon className={`h-5 w-5 ${
                  isMindfuck 
                    ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" 
                    : "drop-shadow-[0_0_6px_rgba(244,114,182,0.45)]"
                }`} />
              </span>
              {collapsed ? (
                <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 opacity-0 shadow-lg shadow-slate-950/40 transition-opacity duration-200 group-hover:opacity-100">
                  {label}
                </span>
              ) : (
                <span className={isMindfuck ? "animate-pulse" : ""}>{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-700/70 px-3 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:bg-slate-800/60"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span
          aria-hidden
          className={`text-lg transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        >
          ⇔
        </span>
        {collapsed ? null : <span className="text-[0.7rem]">Collapse</span>}
      </button>
    </aside>
  );
}
