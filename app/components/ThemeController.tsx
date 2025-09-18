"use client";
import { useEffect } from "react";

// Helper: detect bright themes by name or computed body background
export const isBrightTheme = (theme: string) =>
  ["Femboy Peach", "Lucid Pink", "Candy Vibe", "Bubblegirl"].includes(theme) ||
  (typeof window !== "undefined" && getComputedStyle(document.body).backgroundColor.includes("255"));

function ThemeController() {
  useEffect(() => {
    const apply = () => {
      if (typeof document === "undefined") return;
      const root = document.documentElement;
      const body = document.body;
      try {
  const theme = localStorage.getItem("lucid_theme") || localStorage.getItem("theme") || "peach";
        const brightness = (localStorage.getItem("lucid_brightness") || "bright").toLowerCase();
        const autoDim = (localStorage.getItem("autoDimBrightThemes") || "off").toLowerCase();

        root.setAttribute("data-theme", theme);
        body.setAttribute("data-theme", theme);
        body.setAttribute("data-brightness", brightness === "low" ? "low" : "bright");
        root.setAttribute("data-auto-dim", autoDim === "on" || autoDim === "true" ? "on" : "off");
        body.setAttribute("data-auto-dim", autoDim === "on" || autoDim === "true" ? "on" : "off");
      } catch {}
    };

    apply();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || ["lucid_theme", "theme", "lucid_brightness", "autoDimBrightThemes"].includes(e.key)) apply();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}

export default ThemeController;

