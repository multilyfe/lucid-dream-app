"use client";
import React from "react";

type ThemeKey = "default" | "femboy" | "vaporwave" | "candy";

function cn(...args: any[]): string {
  const flat = (arr: any[]): any[] => arr.reduce((a: any[], v) => a.concat(Array.isArray(v) ? flat(v) : v), []);
  return flat(args).filter(Boolean).join(" ");
}

export default function DreamCard({
  theme = "default",
  className = "",
  children,
  kawaiiMode,
}: {
  theme?: ThemeKey;
  className?: string;
  children: React.ReactNode;
  kawaiiMode?: boolean;
}) {
  const base = "themed-card rounded-3xl p-6 backdrop-blur-md shadow-md transition bg-base-200 border border-base-300";

  // If not provided, fallback to global body attribute (client-only)
  const globalKawaii = typeof document !== "undefined" && document?.body?.getAttribute("data-kawaii") === "on";
  const isKawaii = typeof kawaiiMode === "boolean" ? kawaiiMode : !!globalKawaii;

  // Surface classes are now unified to base tokens; kawaii still affects vibes elsewhere
  const surface = "";

  // Theme text colors
  const themeText: Record<ThemeKey, string> = {
    default: "text-pink-100",
    femboy: "text-rose-100",
    vaporwave: "text-purple-100",
    candy: "text-red-100",
  };

  return <div className={cn(base, surface, themeText[theme], className)}>{children}</div>;
}
