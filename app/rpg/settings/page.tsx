'use client';

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useRitualsEngine } from "../../hooks/useRitualsEngine";
import { useInventory } from "../../hooks/useInventory";
import { useBuffs } from "../../hooks/useBuffs";
import { useQuestlines } from "../../hooks/useQuestlines";
import { useCompanions, type DetailedCompanion } from "../../hooks/useCompanions";
import { useDungeons } from "../../hooks/useDungeons";
import { useShop } from "../../hooks/useShop";
import { useEvents } from "../../hooks/useEvents";
import { useNpcs } from "../../hooks/useNpcs";
import { useProfileSettings } from "../../hooks/useProfileSettings";
import { type DungeonRoom } from "../../lib/dungeons";
import { type ShopItem } from "../../lib/shop";
import { type CalendarEvent } from "../../lib/events";
import { DEFAULT_ORB_ACTIONS, type OrbActionConfig } from "../../lib/orbActions";
import { describeMultiplier, type Ritual } from "../../lib/rituals";
import {
  ITEM_TYPE_LABELS,
  ITEM_TYPE_ORDER,
  type ItemType,
  type InventoryItem,
  isEquippable,
} from "../../lib/inventory";
import { BUFF_TYPE_OPTIONS, type Buff, type BuffType } from "../../lib/buffEngine";
import { type Questline } from "../../lib/questlines";
import { JournalManager } from "../../components/JournalManager";
import { JournalSettingsUltra } from "../../components/JournalSettingsUltra";
import { type CompanionBuff } from "../../lib/companions";
import { type ProfileTheme } from "../../lib/profile";
import { SectionLabel } from "../../components/SectionLabel";
import { ShameManagerExtras } from "../../components/ShameManagerSettings";
import { type Npc } from "../../lib/npcs";
import MapManager from "../../components/MapManager";

const DEFAULT_CONTROL_NEXUS = {
  appearance: {
    theme: "night-sky",
    fontFamily: "Rune Sans",
    accentColor: "#f472b6",
    animatedBackground: true,
    layoutDensity: "comfortable",
    bloom: true,
    vignette: false,
    sparkles: true,
    orbAura: true,
    heartbeatTitle: true,
    uiScale: 1,
    mode: "lucid",
  },
  dataControl: {
    autoBackup: true,
    backupIntervalHours: 6,
    syncEnabled: false,
    exportAsVault: false,
    retainHistoryDays: 30,
    scheduledHour: "03:00",
    lastBackupAt: null,
    saveSlots: [
      { id: "slot-1", label: "Slot I", savedAt: null, payload: null },
      { id: "slot-2", label: "Slot II", savedAt: null, payload: null },
      { id: "slot-3", label: "Slot III", savedAt: null, payload: null },
    ],
  },
  xp: {
    level: 12,
    totalXP: 3400,
    xpPerQuest: 50,
    xpMultiplier: 1.0,
    xpBoostActive: false,
    prestigeCount: 0,
    unlockedTitles: [
      { id: "TITLE-1", label: "Lucid Initiate" },
      { id: "TITLE-2", label: "Temple Whisperer" },
    ],
  },
  dreamMechanics: {
    lucidityAssist: true,
    realityCheckFrequency: 3,
    dreamRecallStrength: 80,
    autoTagging: true,
    parallelDreamsUnlocked: false,
    orbAction: "random",
    ritualSchedule: "Dawn & Dusk",
    questlines: [
      { id: "main", label: "Main Story", active: true },
      { id: "obedience", label: "Obedience Trials", active: false },
      { id: "sandbox", label: "Sandbox Dreams", active: true },
    ],
    orbActions: DEFAULT_ORB_ACTIONS,
  },
  companionSettings: {
    enabled: true,
    bondLevel: 78,
    autoSummon: true,
    preferredRole: "Oracle",
    allowDualCompanions: false,
    evolutionMode: "ascension",
    buffsEnabled: true,
    roster: [
      {
        id: "C-001",
        name: "Candy Siren",
        role: "Sensual Anchor",
        buffs: "+10% lucidity onset",
      },
      {
        id: "C-002",
        name: "Bilal",
        role: "Mentor",
        buffs: "+5 obedience",
      },
    ],
  },
  advanced: {
    devMode: false,
    showDebugOverlay: false,
    allowUnsafeScripts: false,
    sandboxTimeout: 90,
    debugJSON: false,
    easterEggs: true,
  },
  people: {
    autoTagDreams: true,
    list: [
      { id: "P-001", name: "Candy Siren", role: "Companion", affinity: 87 },
      { id: "P-002", name: "Bilal", role: "Mentor", affinity: 74 },
    ],
  },
  places: {
    autoGenerateMaps: false,
    list: [
      {
        id: "L-001",
        name: "Lucid Citadel",
        type: "Sanctum",
        stability: 92,
        mapUrl: "https://example.com/citadel-map",
        lucidHotspot: true,
      },
      {
        id: "L-002",
        name: "Velvet Bazaar",
        type: "Dream Market",
        stability: 65,
        mapUrl: "",
        lucidHotspot: false,
      },
    ],
  },
  dreams: {
    autoLucidityChecks: true,
    archiveEnabled: false,
    bulkTags: [
      { id: "DT-001", label: "lucid" },
      { id: "DT-002", label: "nightmare" },
      { id: "DT-003", label: "ritual" },
    ],
    templates: [
      { id: "D-ARC", title: "Astral Rescue", primaryTag: "heroic" },
      { id: "D-GARDEN", title: "Moonlit Garden", primaryTag: "serene" },
    ],
  },
  rituals: {
    enforced: true,
    strictMode: true,
    cooldownMinutes: 120,
    xpRewardEnabled: true,
    streakMultiplierEnabled: true,
    schedule: "Moonrise",
    sequences: [
      {
        id: "R-SUN",
        title: "Sunrise Invocation",
        steps: ["Align crystals", "Chant mantra", "Seal sigil"],
      },
      {
        id: "R-LUNA",
        title: "Lunar Submission",
        steps: ["Kneel", "Offer tribute", "Receive blessing"],
      },
    ],
  },
  quests: {
    autoAssign: false,
    ritualAutomation: false,
    active: [
      { id: "Q-001", title: "Decode the Obedience Glyph", status: "in-progress" },
    ],
    backlog: [
      { id: "Q-002", title: "Map the Astral Corridors", status: "available" },
    ],
    questlines: [
      { id: "QL-1", title: "Temple Initiation", reward: "Sigil of Obedience" },
    ],
  },
  achievements: {
    unlocked: [
      { id: "ACH-001", title: "Lucid Initiate" },
      { id: "ACH-002", title: "Temple Whisperer" },
    ],
    tracking: {
      streakDays: 12,
      totalDreamsLogged: 212,
      highestLucidity: 9,
    },
    conditions: [
      { id: "COND-1", description: "Log 100 dreams" },
      { id: "COND-2", description: "Complete 10 obedience rituals" },
    ],
  },
  inventory: {
    relicSlots: 2,
   autoEquipLoot: false,
   allowSelling: false,
 },
  buffs: {
    autoCleanup: true,
  },
  companionBuilder: {
    cardTheme: "luminous",
    artUrl: "",
    preview: {
      name: "Seraph Nova",
      role: "Guardian",
      signatureMove: "Starlight Aegis",
    },
    buffs: [
      { id: "BUFF-1", label: "+5% XP" },
      { id: "BUFF-2", label: "+10 focus" },
    ],
  },
  astralMap: {
    showLeyLines: true,
    nodeDensity: 42,
    nodes: [
      { id: "A-001", label: "Evershade Cradle", danger: 35 },
      { id: "A-002", label: "Sunken Observatory", danger: 58 },
    ],
    paths: [{ id: "PATH-001", from: "A-001", to: "A-002" }],
    dragMode: false,
  },
  database: {
    backupHours: 4,
    retentionDays: 45,
    encryption: true,
    anomalyAlerts: false,
    tags: [
      { id: "TAG-1", label: "lucid" },
      { id: "TAG-2", label: "guild" },
    ],
    lorebook: [{ id: "LORE-001", title: "Velvet Doctrine" }],
    cleanupRules: [
      { id: "CLEAN-1", rule: "Merge duplicate companions" },
      { id: "CLEAN-2", rule: "Archive stale rituals" },
    ],
  },
  audio: {
    musicVolume: 60,
    sfxVolume: 45,
    alerts: true,
    voiceGuidance: false,
    ambienceTheme: "nebula-winds",
    mp3Library: [
      { id: "track-1", title: "Temple Bells", url: "" },
      { id: "track-2", title: "Aurora Drift", url: "" },
    ],
    ritualChime: "silver-bells",
  },
  visuals: {
    shader: "nebula",
    particleDensity: 70,
    bloom: true,
    motionBlur: false,
    chromaticShift: 0.3,
    background: "void",
    stickerLibrary: [
      { id: "STK-1", label: "Moon Sigil" },
      { id: "STK-2", label: "Arcane Rune" },
    ],
  },
  experiment: {
    labMode: false,
    mindfuck: false,
    xpSandbox: 0,
    prototypes: [
      { id: "X-01", title: "Emotion Weaver", status: "paused" },
      { id: "X-02", title: "Chrono Drift", status: "draft" },
    ],
  },
  integrations: {
    discordWebhook: "",
    notionSync: false,
    obsidianSync: true,
    webhooksEnabled: false,
    automationLevel: "basic",
    apiKeys: {
      openai: "",
      stableDiffusion: "",
    },
  },
  global: {
    autoSave: true,
    language: "en",
    timezone: "UTC",
    powerUser: false,
    onboardingComplete: false,
    nsfw: false,
    passwordLock: false,
    vaultSignature: "",
    lastVaultExport: null,
  },
} as const;

type ControlNexus = typeof DEFAULT_CONTROL_NEXUS;

type PanelRenderProps = {
  control: ControlNexus;
  setControl: Dispatch<SetStateAction<ControlNexus>>;
};

type ToggleConfig = { label: string; path: string };
type SelectConfig = { label: string; path: string; options: string[] };
type NumberConfig = { label: string; path: string; min?: number; max?: number; step?: number; suffix?: string };
type SliderConfig = { label: string; path: string; min: number; max: number; step?: number; accent?: string; format?: (value: number) => string };
type TextConfig = { label: string; path: string; placeholder?: string };
type ColorConfig = { label: string; path: string };
type ListField = {
  key: string;
  label: string;
  type: "text" | "number" | "slider" | "select" | "textarea";
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  suffix?: string;
  accent?: string;
  format?: (value: any) => string;
  parse?: (value: string) => any;
};
type ListConfig = {
  label: string;
  path: string;
  addLabel?: string;
  template: () => any;
  fields: ListField[];
};

type PanelConfig = {
  id: string;
  icon: string;
  title: string;
  description: string;
  render?: () => React.ReactNode;
  toggles?: ToggleConfig[];
  selects?: SelectConfig[];
  numbers?: NumberConfig[];
  sliders?: SliderConfig[];
  texts?: TextConfig[];
  colors?: ColorConfig[];
  lists?: ListConfig[];
  extras?: ((props: PanelRenderProps) => React.ReactNode)[];
};

type PanelDefinition = {
  id: string;
  icon: string;
  title: string;
  description: string;
  render: (props: PanelRenderProps) => React.ReactNode;
};

const CLONE_SOURCE: ControlNexus = DEFAULT_CONTROL_NEXUS;

function cloneDefault(): ControlNexus {
  return JSON.parse(JSON.stringify(CLONE_SOURCE)) as ControlNexus;
}

function generateId(prefix: string): string {
  // Use deterministic IDs during SSR to prevent hydration errors
  if (typeof window === "undefined") {
    return `${prefix}-STATIC`;
  }
  const unique = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${unique}`;
}

function getValueAtPath<T = unknown>(source: unknown, path: string): T {
  return path.split('.').reduce<any>((acc, key) => (acc == null ? acc : acc[key]), source) as T;
}

function setValueAtPath<T>(source: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const clone = Array.isArray(source) ? ([...source] as any) : ({ ...source } as any);
  let cursor = clone;
  let reference = source as any;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    const nextReference = reference?.[key];
    const nextValue = Array.isArray(nextReference)
      ? [...nextReference]
      : { ...(nextReference ?? {}) };
    cursor[key] = nextValue;
    cursor = nextValue;
    reference = nextReference ?? {};
  });

  return clone as T;
}

function updateValue<T>(source: T, path: string, updater: (current: any) => any): T {
  const current = getValueAtPath(source, path);
  return setValueAtPath(source, path, updater(current));
}

function runeToggleClasses(active: boolean) {
  return `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] transition ${
    active
      ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
      : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
  }`;
}



type PanelShellProps = {
  icon: string;
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function PanelShell({ icon, title, description, expanded, onToggle, children }: PanelShellProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b0614]/80 shadow-[0_0_30px_rgba(15,23,42,0.55)] transition">
      <header
        className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 text-xl">
            <span aria-hidden>{icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-slate-300/80">{description}</p>
          </div>
        </div>
        <span className="text-sm text-slate-400">{expanded ? '−' : '+'}</span>
      </header>
      {expanded ? <div className="space-y-6 border-t border-slate-800/60 bg-slate-950/70 p-6">{children}</div> : null}
    </section>
  );
}

const orbButtonClass =
  "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-[0_0_25px_rgba(244,114,182,0.45)] transition hover:scale-[1.03]";

const ghostButtonClass =
  "inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200 transition hover:bg-fuchsia-500/10";

const formatTimestamp = (value: string | null) => {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    console.warn("[ControlNexus] failed to format timestamp", error);
    return value;
  }
};

const DataControlExtras = ({ control, setControl }: PanelRenderProps) => {
  const slots = control.dataControl.saveSlots ?? [];

  const handleExport = () => {
    try {
      const payload = JSON.stringify(control, null, 2);
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(payload).catch(() => {
          if (typeof window !== "undefined") {
            window.alert("Copied JSON to clipboard failed. Showing modal instead.");
          }
        });
      }
      if (typeof window !== "undefined") {
        window.open("data:text/json;charset=utf-8," + encodeURIComponent(payload), "_blank");
      }
    } catch (error) {
      console.error("[ControlNexus] export failed", error);
    }
  };

  const handleImport = () => {
    if (typeof window === "undefined") return;
    const raw = window.prompt("Paste Control Nexus JSON");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ControlNexus;
      setControl(parsed);
    } catch (error) {
      window.alert("Import failed: invalid JSON");
      console.error("[ControlNexus] import failed", error);
    }
  };

  const handleBackup = () => {
    const now = new Date().toISOString();
    setControl((prev) => ({
      ...prev,
      dataControl: { ...prev.dataControl, lastBackupAt: now },
    }) as unknown as ControlNexus);
  };

  const handleSaveSlot = (slotId: string) => {
    const now = new Date().toISOString();
    setControl((prev) => ({
      ...prev,
      dataControl: {
        ...prev.dataControl,
        saveSlots: prev.dataControl.saveSlots.map((slot) =>
          slot.id === slotId
            ? { ...slot, savedAt: now, payload: JSON.stringify(prev) }
            : slot
        ),
      },
    }) as unknown as ControlNexus);
  };

  const handleLoadSlot = (payload: string | null) => {
    if (!payload) return;
    try {
      const parsed = JSON.parse(payload) as ControlNexus;
      setControl(parsed);
    } catch (error) {
      if (typeof window !== "undefined") {
        window.alert("Failed to load slot — payload corrupted");
      }
      console.error("[ControlNexus] slot restore failed", error);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-fuchsia-500/20 bg-slate-950/60 p-4 shadow-inner shadow-fuchsia-500/20">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleExport} className={orbButtonClass}>
          ✨ Export JSON
        </button>
        <button type="button" onClick={handleImport} className={orbButtonClass}>
          ☄️ Import JSON
        </button>
        <button type="button" onClick={handleBackup} className={ghostButtonClass}>
          🜂 Manual Backup
        </button>
        <div className="flex items-center gap-2 rounded-full border border-fuchsia-400/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-fuchsia-200">
          <span>Scheduled</span>
          <input
            type="time"
            value={control.dataControl.scheduledHour}
            onChange={(event) =>
              setControl((prev) => ({
                ...prev,
                dataControl: { ...prev.dataControl, scheduledHour: event.target.value },
              }) as unknown as ControlNexus)
            }
            className="rounded-full border border-fuchsia-400/30 bg-transparent px-2 py-1 text-[0.65rem] text-fuchsia-100 focus:outline-none"
          />
        </div>
      </div>

      <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/80">
        Last Backup · {formatTimestamp(control.dataControl.lastBackupAt)}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="space-y-3 rounded-2xl border border-fuchsia-500/30 bg-slate-950/70 p-3 shadow-inner shadow-fuchsia-500/20"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-100">
              {slot.label}
            </div>
            <div className="text-xs text-slate-300">
              Saved · {formatTimestamp(slot.savedAt)}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSaveSlot(slot.id)}
                className={orbButtonClass}
              >
                💾 Save
              </button>
              <button
                type="button"
                disabled={!slot.payload}
                onClick={() => handleLoadSlot(slot.payload)}
                className={`${ghostButtonClass} ${slot.payload ? "" : "opacity-40"}`}
              >
                🕯 Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const XpExtras = ({ control, setControl }: PanelRenderProps) => {
  const modifyXp = (delta: number) => {
    setControl((prev) => {
      const totalXP = Math.max(0, prev.xp.totalXP + delta);
      return {
        ...prev,
        xp: { ...prev.xp, totalXP },
      } as unknown as ControlNexus;
    });
  };

  const prestige = () => {
    if (typeof window !== "undefined" && !window.confirm("Prestige? XP resets to zero.")) {
      return;
    }
    setControl((prev) => ({
      ...prev,
      xp: {
        ...prev.xp,
        prestigeCount: prev.xp.prestigeCount + 1,
        level: 1,
        totalXP: 0,
      },
    }) as unknown as ControlNexus);
  };

  const reset = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset level and XP?")) {
      return;
    }
    setControl((prev) => ({
      ...prev,
      xp: { ...prev.xp, level: 1, totalXP: 0 },
    }) as unknown as ControlNexus);
  };

  const unlockTitle = () => {
    if (typeof window === "undefined") return;
    const label = window.prompt("Name the new title");
    if (!label) return;
    setControl((prev) => ({
      ...prev,
      xp: {
        ...prev.xp,
        unlockedTitles: [
          ...prev.xp.unlockedTitles,
          { id: generateId("TITLE"), label },
        ],
      },
    }) as unknown as ControlNexus);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-slate-950/60 p-4 shadow-inner shadow-amber-400/20">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={orbButtonClass} onClick={() => modifyXp(100)}>
          +100 XP
        </button>
        <button type="button" className={orbButtonClass} onClick={() => modifyXp(-100)}>
          -100 XP
        </button>
        <button type="button" className={ghostButtonClass} onClick={reset}>
          ♻ Reset Progress
        </button>
        <button type="button" className={ghostButtonClass} onClick={prestige}>
          🔱 Prestige
        </button>
        <button type="button" className={orbButtonClass} onClick={unlockTitle}>
          🏵 Unlock Title
        </button>
      </div>
      <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
        <div>Prestige Count · {control.xp.prestigeCount}</div>
        <div>Unlocked Titles · {control.xp.unlockedTitles.length}</div>
      </div>
    </div>
  );
};

const DreamMechanicsExtras = ({ control, setControl }: PanelRenderProps) => {
  const questlines = control.dreamMechanics.questlines ?? [];
  const [orbActionsState, setOrbActionsState] = usePersistentState<OrbActionConfig[]>(
    "orbActions",
    () => DEFAULT_ORB_ACTIONS
  );
  const orbActions =
    control.dreamMechanics.orbActions ?? orbActionsState ?? DEFAULT_ORB_ACTIONS;
  const [newActionLabel, setNewActionLabel] = useState("");
  const [newActionIcon, setNewActionIcon] = useState("✨");
  const [newActionHref, setNewActionHref] = useState("/rpg/");

  const toggleQuestline = (id: string) => {
    setControl((prev) => updateValue(prev, "dreamMechanics.questlines", (current: any[] = []) =>
      current.map((line) => (line.id === id ? { ...line, active: !line.active } : line))
    ));
  };

  const updateOrbActions = (
    updater: (current: OrbActionConfig[]) => OrbActionConfig[]
  ) => {
    let nextList: OrbActionConfig[] = DEFAULT_ORB_ACTIONS;
    setControl((prev) =>
      updateValue(prev, "dreamMechanics.orbActions", (current: OrbActionConfig[] = DEFAULT_ORB_ACTIONS) => {
        const source = Array.isArray(current) ? [...current] : [...DEFAULT_ORB_ACTIONS];
        nextList = updater(source);
        return nextList;
      })
    );
    setOrbActionsState(nextList);
  };

  const toggleOrbAction = (id: string) => {
    updateOrbActions((list) =>
      list.map((action) =>
        action.id === id ? { ...action, enabled: !action.enabled } : action
      )
    );
  };

  const moveOrbAction = (id: string, direction: -1 | 1) => {
    updateOrbActions((list) => {
      const index = list.findIndex((action) => action.id === id);
      if (index === -1) return list;
      const targetIndex = Math.max(0, Math.min(list.length - 1, index + direction));
      if (targetIndex === index) return list;
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const removeOrbAction = (id: string) => {
    updateOrbActions((list) => list.filter((action) => action.id !== id));
  };

  const addOrbAction = () => {
    if (!newActionLabel.trim() || !newActionHref.trim()) return;
    const newAction: OrbActionConfig = {
      id: typeof window === "undefined" ? "custom-STATIC" : `custom-${Date.now()}`,
      label: newActionLabel.trim(),
      icon: newActionIcon.trim() || "✨",
      type: "link",
      href: newActionHref.trim(),
      enabled: true,
    };
    updateOrbActions((list) => [...list, newAction]);
    setNewActionLabel("");
    setNewActionIcon("✨");
    setNewActionHref("/rpg/");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-4 shadow-inner shadow-cyan-400/20">
      <div className="space-y-2">
        <SectionLabel>Questlines</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {questlines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => toggleQuestline(line.id)}
              className={runeToggleClasses(Boolean(line.active))}
            >
              <span>{line.label}</span>
              <span>{line.active ? "TRACKING" : "PAUSED"}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <SectionLabel>Ritual Scheduler</SectionLabel>
        <input
          type="text"
          value={control.dreamMechanics.ritualSchedule}
          placeholder="e.g. Dawn & Dusk"
          onChange={(event) =>
            setControl((prev) => ({
              ...prev,
              dreamMechanics: { ...prev.dreamMechanics, ritualSchedule: event.target.value },
            }) as unknown as ControlNexus)
          }
          className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <SectionLabel>Orb Quick Actions</SectionLabel>
        <div className="space-y-2">
          {orbActions.map((action, index) => {
            const isCustom = action.id.startsWith("custom-");
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => toggleOrbAction(action.id)}
                  className={runeToggleClasses(action.enabled)}
                >
                  <span className="mr-2 text-lg" aria-hidden>
                    {action.icon}
                  </span>
                  <span>{action.label}</span>
                  <span>{action.enabled ? "ON" : "OFF"}</span>
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveOrbAction(action.id, -1)}
                    disabled={index === 0}
                    className="rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
                    aria-label="Move action up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOrbAction(action.id, 1)}
                    disabled={index === orbActions.length - 1}
                    className="rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
                    aria-label="Move action down"
                  >
                    ↓
                  </button>
                  {isCustom ? (
                    <button
                      type="button"
                      onClick={() => removeOrbAction(action.id)}
                      className="rounded-full border border-rose-500/50 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20"
                      aria-label="Remove action"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3 sm:grid-cols-3">
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-slate-300">
            Label
            <input
              value={newActionLabel}
              onChange={(event) => setNewActionLabel(event.target.value)}
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-slate-300">
            Icon
            <input
              value={newActionIcon}
              onChange={(event) => setNewActionIcon(event.target.value)}
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
              maxLength={2}
            />
          </label>
          <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-slate-300 sm:col-span-1">
            Link
            <input
              value={newActionHref}
              onChange={(event) => setNewActionHref(event.target.value)}
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={addOrbAction}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200 transition hover:bg-fuchsia-500/10"
            >
              ➕ Add Custom Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RITUAL_TYPE_OPTIONS: Array<{ label: string; value: Ritual['type'] }> = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const RitualsManagerExtras = (_props: PanelRenderProps) => {
  const {
    rituals,
    progressById,
    addRitual,
    updateRitual,
    deleteRitual,
    resetRitualStreak,
  } = useRitualsEngine();

  const handleAdd = () => {
    const newRitual: Ritual = {
      id: generateId("RIT"),
      name: "New Ritual",
      type: "daily",
      xp: 25,
      obedience: 5,
      streak: 0,
    };
    addRitual(newRitual);
  };

  return (
    <div className="space-y-4 rounded-3xl border border-fuchsia-500/25 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Active Rituals</SectionLabel>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-2xl border border-fuchsia-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200 shadow-[0_0_15px_rgba(244,114,182,0.25)] transition hover:bg-fuchsia-500/10"
        >
          + Add Ritual
        </button>
      </div>

      <div className="space-y-3">
        {rituals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
            No rituals configured yet.
          </p>
        ) : (
          rituals.map((ritual) => {
            const progress = progressById[ritual.id];
            const multiplier = progress?.multiplier ?? 0;
            const descriptor = describeMultiplier(ritual.type);
            return (
              <div
                key={ritual.id}
                className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4 shadow-inner shadow-fuchsia-500/10"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <SectionLabel>Name</SectionLabel>
                    <input
                      type="text"
                      value={ritual.name}
                      onChange={(event) => updateRitual(ritual.id, { name: event.target.value })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Frequency</SectionLabel>
                    <select
                      value={ritual.type}
                      onChange={(event) =>
                        updateRitual(ritual.id, { type: event.target.value as Ritual['type'] })
                      }
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                    >
                      {RITUAL_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>XP Reward</SectionLabel>
                    <input
                      type="number"
                      min={0}
                      value={ritual.xp}
                      onChange={(event) =>
                        updateRitual(ritual.id, { xp: Math.max(0, Number(event.target.value) || 0) })
                      }
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Obedience</SectionLabel>
                    <input
                      type="number"
                      min={0}
                      value={ritual.obedience}
                      onChange={(event) =>
                        updateRitual(ritual.id, { obedience: Math.max(0, Number(event.target.value) || 0) })
                      }
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]">
                  <div className="text-slate-300">
                    Streak {progress?.streak ?? 0}
                    {progress?.completed ? ' • sealed this cycle' : ''}
                    {multiplier > 0 ? ' • +' + Math.round(multiplier * 100) + '% XP' : descriptor ? ' • +' + Math.round(descriptor.bonus * 100) + '% after ' + descriptor.threshold + ' completions' : ''}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => resetRitualStreak(ritual.id)}
                      className="rounded-2xl border border-amber-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 transition hover:bg-amber-400/10"
                    >
                      Reset Streak
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRitual(ritual.id)}
                      className="rounded-2xl border border-rose-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:bg-rose-400/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const InventoryManagerExtras = (_props: PanelRenderProps) => {
  const {
    inventory,
    addOrReplaceItem,
    updateItem,
    removeItem,
    setOwned,
    toggleEquip,
    replaceInventory,
    maxRelics,
    equippedRelicCount,
  } = useInventory();

  const handleAdd = () => {
    const id = generateId("INV");
    addOrReplaceItem({
      id,
      name: "New Item",
      type: "quest",
      desc: "Describe the dream artifact.",
      owned: 0,
      icon: "✨",
      equipped: false,
    });
  };

  const handleExport = () => {
    if (typeof window === "undefined") return;
    try {
      const payload = JSON.stringify(inventory, null, 2);
      window.prompt("Inventory JSON", payload);
    } catch (error) {
      console.error("[InventoryManager] export failed", error);
    }
  };

  const handleImport = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.prompt("Paste inventory JSON");
      if (!raw) return;
      const parsed = JSON.parse(raw) as InventoryItem[];
      if (!Array.isArray(parsed)) return;
      replaceInventory(parsed);
    } catch (error) {
      console.error("[InventoryManager] import failed", error);
    }
  };

  const handleTypeChange = (id: string, next: ItemType) => {
    updateItem(id, {
      type: next,
      ...(next === "relic" || next === "panty" ? {} : { equipped: false }),
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-cyan-400/25 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Inventory Items</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleImport}
            className="rounded-2xl border border-slate-600/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 hover:bg-slate-800/60"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-2xl border border-slate-600/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 hover:bg-slate-800/60"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-2xl border border-cyan-400/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200 hover:bg-cyan-500/20"
          >
            + Add Item
          </button>
        </div>
      </div>

      <p className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
        Relics equipped {equippedRelicCount}/{maxRelics}. Panty and relic slots feed obedience when equipped.
      </p>

      <div className="space-y-3">
        {inventory.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
            Inventory is empty. Add an item to seed the collection.
          </p>
        ) : (
          inventory.map((item) => (
            <div
              key={item.id}
              className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 shadow-inner shadow-cyan-400/10"
            >
              <div className="flex items-center justify-between">
                <SectionLabel>{item.name || item.id}</SectionLabel>
                <div className="flex items-center gap-2">
                  {isEquippable(item) ? (
                    <button
                      type="button"
                      onClick={() => toggleEquip(item.id)}
                      className="rounded-2xl border border-fuchsia-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200 hover:bg-fuchsia-500/20"
                    >
                      {item.equipped ? "Unequip" : "Equip"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && !window.confirm("Remove this item from inventory?")) {
                        return;
                      }
                      removeItem(item.id);
                    }}
                    className="rounded-2xl border border-rose-400/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <SectionLabel>Name</SectionLabel>
                  <input
                    value={item.name}
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <SectionLabel>Type</SectionLabel>
                  <select
                    value={item.type}
                    onChange={(event) => handleTypeChange(item.id, event.target.value as ItemType)}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    {ITEM_TYPE_ORDER.map((type) => (
                      <option key={type} value={type}>
                        {ITEM_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <SectionLabel>Icon</SectionLabel>
                  <input
                    value={item.icon ?? ""}
                    onChange={(event) => updateItem(item.id, { icon: event.target.value.slice(0, 2) })}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <SectionLabel>Owned</SectionLabel>
                  <input
                    type="number"
                    min={0}
                    value={item.owned}
                    onChange={(event) => setOwned(item.id, Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <SectionLabel>Description</SectionLabel>
                <textarea
                  value={item.desc}
                  onChange={(event) => updateItem(item.id, { desc: event.target.value })}
                  className="min-h-[80px] w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none"
                />
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const BuffManagerExtras = (_props: PanelRenderProps) => {
  const {
    buffs,
    addBuff,
    updateBuff,
    removeBuff,
    toggleBuff,
    triggerBuffBySource,
    getRemainingForBuff,
  } = useBuffs();

  const handleAdd = () => {
    addBuff({
      id: generateId("BUFF"),
      name: "New Buff",
      source: "Custom",
      type: "xpMultiplier",
      value: 1.0,
      active: false,
      icon: "✨",
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-amber-400/20 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Buffs & Effects</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-2xl border border-amber-400/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 hover:bg-amber-500/20"
          >
            + Add Buff
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {buffs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
            No buffs configured yet.
          </p>
        ) : (
          buffs.map((buff) => {
            const remaining = getRemainingForBuff(buff);
            return (
              <div
                key={buff.id}
                className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 shadow-inner shadow-amber-400/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SectionLabel>{buff.name || buff.id}</SectionLabel>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleBuff(buff.id)}
                      className={`rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                        buff.active
                          ? "border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/20"
                          : "border-slate-600/60 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      {buff.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerBuffBySource(buff.source)}
                      className="rounded-2xl border border-cyan-400/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200 hover:bg-cyan-500/20"
                    >
                      Trigger
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBuff(buff.id)}
                      className="rounded-2xl border border-rose-400/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <SectionLabel>Name</SectionLabel>
                    <input
                      value={buff.name}
                      onChange={(event) => updateBuff(buff.id, { name: event.target.value })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Source</SectionLabel>
                    <input
                      value={buff.source}
                      onChange={(event) => updateBuff(buff.id, { source: event.target.value })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Type</SectionLabel>
                    <select
                      value={buff.type}
                      onChange={(event) => updateBuff(buff.id, { type: event.target.value as BuffType })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    >
                      {BUFF_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Multiplier</SectionLabel>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={buff.value}
                      onChange={(event) => updateBuff(buff.id, { value: Number(event.target.value) || 0 })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Icon</SectionLabel>
                    <input
                      value={buff.icon ?? ""}
                      onChange={(event) => updateBuff(buff.id, { icon: event.target.value.slice(0, 2) })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <SectionLabel>Duration</SectionLabel>
                    <input
                      value={buff.duration ?? ""}
                      onChange={(event) => updateBuff(buff.id, { duration: event.target.value })}
                      className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/80">
                  <span>
                    Status: {buff.active ? "Active" : "Inactive"}
                    {buff.expiresAt ? ` • Expires ${new Date(buff.expiresAt).toLocaleString()}` : ""}
                    {buff.active && remaining != null ? ` • Remaining ${Math.ceil((remaining ?? 0) / 1000)}s` : ""}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const COMPANION_BUFF_FIELDS: Array<{ key: keyof CompanionBuff; label: string; placeholder: string }> = [
  { key: 'xpMultiplier', label: 'XP Multiplier', placeholder: '1.00' },
  { key: 'obedienceGain', label: 'Obedience Gain', placeholder: '1.25' },
  { key: 'tokenMultiplier', label: 'Token Multiplier', placeholder: '1.50' },
  { key: 'clarityBoost', label: 'Clarity Boost', placeholder: '2.00' },
];

const CompanionManagerExtras = (_props: PanelRenderProps) => {
  const {
    companions,
    addCompanion,
    updateCompanion,
    removeCompanion,
    setActiveForm,
    setAutoEvolve,
    resetEvolution,
  } = useCompanions();

  const [selectedId, setSelectedId] = useState<string | null>(companions[0]?.id ?? null);

  const selectedCompanion = useMemo(() => {
    if (!selectedId) return companions[0];
    return companions.find((entry) => entry.id === selectedId) ?? companions[0];
  }, [companions, selectedId]);

  const handleAddCompanion = () => {
    const id = generateId('COMP');
    const formId = generateId('FORM');
    addCompanion({
      id,
      name: 'New Companion',
      level: 1,
      xp: 0,
      lore: '',
      autoEvolve: false,
      forms: [
        {
          id: formId,
          name: 'Novice Form',
          unlockAt: 1,
          icon: '✨',
          buff: { xpMultiplier: 1 },
          description: 'Base resonance form.',
        },
      ],
      activeForm: formId,
    });
    setSelectedId(id);
  };

  const handleUpdateCompanion = <K extends keyof DetailedCompanion>(key: K, value: DetailedCompanion[K]) => {
    if (!selectedCompanion) return;
    updateCompanion(selectedCompanion.id, (companion) => ({
      ...companion,
      [key]: value,
    }));
  };

  const handleUpdateForm = (formId: string, updater: (form: DetailedCompanion['forms'][number]) => DetailedCompanion['forms'][number]) => {
    if (!selectedCompanion) return;
    updateCompanion(selectedCompanion.id, (companion) => ({
      ...companion,
      forms: companion.forms.map((form) => (form.id === formId ? updater(form) : form)),
    }));
  };

  const handleAddForm = () => {
    if (!selectedCompanion) return;
    const newFormId = generateId('FORM');
    updateCompanion(selectedCompanion.id, (companion) => ({
      ...companion,
      forms: [
        ...companion.forms,
        {
          id: newFormId,
          name: 'New Form',
          unlockAt: Math.max(companion.level, (companion.forms.at(-1)?.unlockAt ?? companion.level) + 2),
          icon: '🌙',
          buff: { xpMultiplier: 1.2 },
          description: '',
        },
      ],
    }));
  };

  const handleRemoveForm = (formId: string) => {
    if (!selectedCompanion) return;
    updateCompanion(selectedCompanion.id, (companion) => {
      const nextForms = companion.forms.filter((form) => form.id !== formId);
      if (nextForms.length === 0) {
        return companion;
      }
      const activeForm = companion.activeForm === formId ? nextForms[0].id : companion.activeForm;
      return {
        ...companion,
        activeForm,
        forms: nextForms,
      };
    });
  };

  if (!selectedCompanion) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700/60 bg-slate-900/60 p-6 text-center text-xs uppercase tracking-[0.35em] text-slate-400">
        No companions forged yet. Use the button below to summon one.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-purple-400/25 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Companion Registry</SectionLabel>
        <button
          type="button"
          onClick={handleAddCompanion}
          className="rounded-full border border-fuchsia-400/60 bg-fuchsia-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100 transition hover:bg-fuchsia-500/30"
        >
          + Add Companion
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {companions.map((companion) => (
            <button
              key={companion.id}
              type="button"
              onClick={() => setSelectedId(companion.id)}
              className={`w-full rounded-2xl border px-3 py-2 text-left text-xs uppercase tracking-[0.3em] transition ${
                companion.id === selectedCompanion.id
                  ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100'
                  : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span className="block text-sm normal-case tracking-normal text-white">{companion.name}</span>
              Lv {companion.level} · {companion.forms.length} forms
            </button>
          ))}
        </aside>

        <div className="space-y-5 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedCompanion.name}</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                Active Form · {
                  selectedCompanion.forms.find((form) => form.id === selectedCompanion.activeForm)?.name ??
                  'Unknown'
                }
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em]">
              <button
                type="button"
                onClick={() => setAutoEvolve(selectedCompanion.id, !selectedCompanion.autoEvolve)}
                className={`rounded-full border px-3 py-2 font-semibold transition ${
                  selectedCompanion.autoEvolve
                    ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
                    : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                Auto · {selectedCompanion.autoEvolve ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => resetEvolution(selectedCompanion.id)}
                className="rounded-full border border-amber-400/60 bg-amber-500/20 px-3 py-2 font-semibold text-amber-100 hover:bg-amber-500/30"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && !window.confirm('Delete companion permanently?')) {
                    return;
                  }
                  removeCompanion(selectedCompanion.id);
                }}
                className="rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-2 font-semibold text-rose-200 hover:bg-rose-500/30"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <SectionLabel>Name</SectionLabel>
              <input
                value={selectedCompanion.name}
                onChange={(event) => handleUpdateCompanion('name', event.target.value)}
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </label>
            <label className="space-y-2">
              <SectionLabel>Lore</SectionLabel>
              <textarea
                value={selectedCompanion.lore ?? ''}
                onChange={(event) => handleUpdateCompanion('lore', event.target.value)}
                className="h-24 w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
              />
            </label>
            <label className="space-y-2">
              <SectionLabel>Level</SectionLabel>
              <input
                type="number"
                min={1}
                value={selectedCompanion.level}
                onChange={(event) => handleUpdateCompanion('level', Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </label>
            <label className="space-y-2">
              <SectionLabel>XP Bucket</SectionLabel>
              <input
                type="number"
                min={0}
                value={selectedCompanion.xp}
                onChange={(event) => handleUpdateCompanion('xp', Math.max(0, Number(event.target.value) || 0))}
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Forms & Buffs</SectionLabel>
              <button
                type="button"
                onClick={handleAddForm}
                className="rounded-full border border-cyan-400/60 bg-cyan-500/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-100 hover:bg-cyan-500/30"
              >
                + Add Form
              </button>
            </div>

            <div className="space-y-3">
              {selectedCompanion.forms.map((form, index) => (
                <div
                  key={form.id}
                  className={`space-y-3 rounded-2xl border p-4 ${
                    form.id === selectedCompanion.activeForm
                      ? 'border-fuchsia-400/60 bg-fuchsia-500/10'
                      : 'border-slate-700/60 bg-slate-950/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveForm(selectedCompanion.id, form.id)}
                        className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] ${
                          form.id === selectedCompanion.activeForm
                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100'
                            : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        {form.id === selectedCompanion.activeForm ? 'Active' : 'Set Active'}
                      </button>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                        Unlock Lv {form.unlockAt}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveForm(form.id)}
                      disabled={selectedCompanion.forms.length === 1}
                      className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] ${
                        selectedCompanion.forms.length === 1
                          ? 'cursor-not-allowed border-slate-700/60 text-slate-500'
                          : 'border-rose-400/60 text-rose-200 hover:bg-rose-500/20'
                      }`}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <SectionLabel>Form Name</SectionLabel>
                      <input
                        value={form.name}
                        onChange={(event) => handleUpdateForm(form.id, (current) => ({ ...current, name: event.target.value }))}
                        className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1">
                      <SectionLabel>Icon</SectionLabel>
                      <input
                        value={form.icon ?? ''}
                        onChange={(event) => handleUpdateForm(form.id, (current) => ({ ...current, icon: event.target.value.slice(0, 2) }))}
                        className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1">
                      <SectionLabel>Unlock Level</SectionLabel>
                      <input
                        type="number"
                        min={1}
                        value={form.unlockAt}
                        onChange={(event) => handleUpdateForm(form.id, (current) => ({
                          ...current,
                          unlockAt: Math.max(1, Number(event.target.value) || 1),
                        }))}
                        className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <SectionLabel>Description</SectionLabel>
                      <textarea
                        value={form.description ?? ''}
                        onChange={(event) => handleUpdateForm(form.id, (current) => ({
                          ...current,
                          description: event.target.value,
                        }))}
                        className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {COMPANION_BUFF_FIELDS.map(({ key, label, placeholder }) => (
                      <label key={key} className="space-y-1">
                        <SectionLabel>{label}</SectionLabel>
                        <input
                          type="number"
                          step={0.1}
                          placeholder={placeholder}
                          value={form.buff?.[key] ?? ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            handleUpdateForm(form.id, (current) => ({
                              ...current,
                              buff: {
                                ...(current.buff ?? {}),
                                [key]: value === '' ? undefined : Number(value),
                              },
                            }));
                          }}
                          className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestlineManagerExtras = (_props: PanelRenderProps) => {
  const {
    questlines,
    addQuestline,
    updateQuestline,
    removeQuestline,
  } = useQuestlines();

  const handleAddQuestline = () => {
    const id = generateId('QL');
    addQuestline({
      id,
      name: 'New Questline',
      description: '',
      branching: false,
      stages: [],
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-amber-400/25 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Questline Overview</SectionLabel>
        <button
          type="button"
          onClick={handleAddQuestline}
          className="rounded-2xl border border-amber-400/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 hover:bg-amber-500/20"
        >
          + Add Questline
        </button>
      </div>

      <div className="space-y-3">
        {questlines.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
            No questlines recorded yet.
          </p>
        ) : (
          questlines.map((questline) => (
            <div
              key={questline.id}
              className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  value={questline.name}
                  onChange={(event) =>
                    updateQuestline(questline.id, (current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeQuestline(questline.id)}
                  className="rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-rose-200"
                >
                  Delete
                </button>
              </div>
              <textarea
                value={questline.description ?? ''}
                onChange={(event) =>
                  updateQuestline(questline.id, (current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
                placeholder="Describe milestones, rituals, or branching paths"
              />
              <div className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
                {questline.stages.length} stages tracked
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AdvancedExtras = (_props: PanelRenderProps) => (
  <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4 text-xs uppercase tracking-[0.3em] text-slate-300/70">
    Developer diagnostics will surface here once dev mode is enabled.
  </div>
);

const AstralMapExtras = (_props: PanelRenderProps) => (
  <div className="rounded-3xl border border-cyan-400/25 bg-slate-950/70 p-4 text-xs uppercase tracking-[0.3em] text-slate-300/70">
    Use the Astral Map editor to maintain ley lines and node density.
  </div>
);

const GlobalExtras = (_props: PanelRenderProps) => (
  <div className="rounded-3xl border border-emerald-400/25 bg-slate-950/70 p-4 text-xs uppercase tracking-[0.3em] text-slate-300/70">
    Language, timezone, and global safeties sync instantly across the sanctum.
  </div>
);

const ROOM_TYPE_OPTIONS: Array<{ label: string; value: DungeonRoom['type'] }> = [
  { label: 'Encounter', value: 'encounter' },
  { label: 'Event', value: 'event' },
  { label: 'Boss', value: 'boss' },
];

const ShopManagerExtras = (_props: PanelRenderProps) => {
  const {
    shop,
    addItem,
    updateItem,
    removeItem,
    replaceInventory,
    toggleLimitedStock,
    clearLogs,
  } = useShop();

  const handleAddItem = () => {
    const id = generateId('SHOP');
    addItem({ id, name: 'New Item', type: 'quest', priceXP: 100, priceTokens: 0 });
  };

  const handleImport = () => {
    if (typeof window === 'undefined') return;
    const raw = window.prompt('Paste shop JSON');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { inventory?: ShopItem[]; limitedStock?: boolean };
      if (!Array.isArray(parsed.inventory)) {
        throw new Error('Invalid schema');
      }
      replaceInventory(parsed.inventory);
      if (typeof parsed.limitedStock === 'boolean') {
        if (parsed.limitedStock !== shop.limitedStock) {
          toggleLimitedStock();
        }
      }
    } catch (error) {
      console.error('[ShopManager] import failed', error);
      if (typeof window !== 'undefined') {
        window.alert('Import failed: invalid JSON schema');
      }
    }
  };

  const handleExport = () => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify(shop, null, 2);
    window.prompt('Shop JSON', payload);
  };

  return (
    <div className="space-y-5 rounded-3xl border border-sky-500/30 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Dream Shop Inventory</SectionLabel>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em]">
          <button
            type="button"
            onClick={handleAddItem}
            className="rounded-full border border-sky-500/60 bg-sky-500/20 px-3 py-1 font-semibold text-sky-100 hover:bg-sky-500/30"
          >
            + Add Item
          </button>
          <button
            type="button"
            onClick={toggleLimitedStock}
            className="rounded-full border border-slate-600/60 bg-slate-800/60 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700/70"
          >
            Limited Stock · {shop.limitedStock ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-slate-600/60 bg-slate-800/60 px-3 py-1 font-semibold text-slate-200 hover:bg-slate-700/70"
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="rounded-full border border-purple-500/60 bg-purple-500/20 px-3 py-1 font-semibold text-purple-100 hover:bg-purple-500/30"
          >
            Import
          </button>
          <button
            type="button"
            onClick={() => clearLogs()}
            className="rounded-full border border-rose-500/60 bg-rose-500/20 px-3 py-1 font-semibold text-rose-200 hover:bg-rose-500/30"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {shop.inventory.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
            Shop inventory empty. Add items to restock the Dream Shop.
          </p>
        ) : (
          shop.inventory.map((item) => (
            <div key={item.id} className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <SectionLabel>{item.name || item.id}</SectionLabel>
                <div className="flex items-center gap-2">
                  {isEquippable(item) ? (
                    <button
                      type="button"
                      onClick={() => toggleEquip(item.id)}
                      className="rounded-2xl border border-fuchsia-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-200 hover:bg-fuchsia-500/20"
                    >
                      {item.equipped ? "Unequip" : "Equip"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && !window.confirm("Remove this item from inventory?")) {
                        return;
                      }
                      removeItem(item.id);
                    }}
                    className="rounded-2xl border border-rose-400/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <SectionLabel>Name</SectionLabel>
                  <input
                    value={item.name}
                    onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <SectionLabel>Type</SectionLabel>
                  <select
                    value={item.type}
                    onChange={(event) => updateItem(item.id, { type: event.target.value as ShopItem['type'] })}
                    className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                  >
                    <option value="relic">Relic</option>
                    <option value="panty">Panty</option>
                    <option value="shard">Shard</option>
                    <option value="consumable">Consumable</option>
                    <option value="quest">Quest</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <SectionLabel>XP Price</SectionLabel>
                  <input
                    type="number"
                    min={0}
                    value={item.priceXP}
                    onChange={(event) => updateItem(item.id, { priceXP: Math.max(0, Number(event.target.value) || 0) })}
                    className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <SectionLabel>Token Price</SectionLabel>
                  <input
                    type="number"
                    min={0}
                    value={item.priceTokens}
                    onChange={(event) => updateItem(item.id, { priceTokens: Math.max(0, Number(event.target.value) || 0) })}
                    className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <SectionLabel>Stock (blank = infinite)</SectionLabel>
                  <input
                    type="number"
                    min={0}
                    value={item.stock ?? ''}
                    onChange={(event) => {
                      const raw = event.target.value;
                      updateItem(item.id, { stock: raw === '' ? null : Math.max(0, Number(raw) || 0) });
                    }}
                    className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function renderPanelContent(config: PanelConfig, control: ControlNexus, setControl: Dispatch<SetStateAction<ControlNexus>>) {
  const toggles = config.toggles?.length
    ? (
        <div className="flex flex-wrap gap-2">
          {config.toggles.map((toggle) => {
            const value = Boolean(getValueAtPath(control, toggle.path));
            return (
              <button
                key={toggle.path}
                type="button"
                onClick={() => setControl((previous) => setValueAtPath(previous, toggle.path, !value))}
                className={runeToggleClasses(value)}
              >
                <span>{toggle.label}</span>
                <span>{value ? 'On' : 'Off'}</span>
              </button>
            );
          })}
        </div>
      )
    : null;

  const selects = config.selects?.length
    ? (
        <div className="grid gap-3 md:grid-cols-2">
          {config.selects.map((select) => {
            const value = getValueAtPath<string>(control, select.path) ?? '';
            return (
              <label key={select.path} className="space-y-2">
                <SectionLabel>{select.label}</SectionLabel>
                <select
                  value={value}
                  onChange={(event) =>
                    setControl((previous) => setValueAtPath(previous, select.path, event.target.value))
                  }
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                >
                  {select.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      )
    : null;

  const numbers = config.numbers?.length
    ? (
        <div className="grid gap-3 md:grid-cols-2">
          {config.numbers.map((numberField) => {
            const value = getValueAtPath<number>(control, numberField.path) ?? 0;
            return (
              <label key={numberField.path} className="space-y-2">
                <SectionLabel>{numberField.label}</SectionLabel>
                <input
                  type="number"
                  value={value}
                  min={numberField.min}
                  max={numberField.max}
                  step={numberField.step}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const parsed = raw === '' ? undefined : Number(raw);
                    setControl((previous) => setValueAtPath(previous, numberField.path, parsed));
                  }}
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                />
              </label>
            );
          })}
        </div>
      )
    : null;

  const sliders = config.sliders?.length
    ? (
        <div className="space-y-4">
          {config.sliders.map((slider) => {
            const value = Number(getValueAtPath(control, slider.path) ?? slider.min);
            return (
              <div key={slider.path} className="space-y-2">
                <SectionLabel>{slider.label}</SectionLabel>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step ?? 1}
                  value={value}
                  onChange={(event) =>
                    setControl((previous) => setValueAtPath(previous, slider.path, Number(event.target.value)))
                  }
                  className="w-full accent-fuchsia-400"
                />
                <div className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
                  {slider.format ? slider.format(value) : value}
                </div>
              </div>
            );
          })}
        </div>
      )
    : null;

  const texts = config.texts?.length
    ? (
        <div className="grid gap-3 md:grid-cols-2">
          {config.texts.map((textField) => {
            const value = getValueAtPath<string>(control, textField.path) ?? '';
            return (
              <label key={textField.path} className="space-y-2">
                <SectionLabel>{textField.label}</SectionLabel>
                <input
                  value={value}
                  placeholder={textField.placeholder}
                  onChange={(event) =>
                    setControl((previous) => setValueAtPath(previous, textField.path, event.target.value))
                  }
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                />
              </label>
            );
          })}
        </div>
      )
    : null;

  const colors = config.colors?.length
    ? (
        <div className="grid gap-3 md:grid-cols-2">
          {config.colors.map((colorField) => {
            const value = getValueAtPath<string>(control, colorField.path) ?? '#ffffff';
            return (
              <label key={colorField.path} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2">
                <SectionLabel>{colorField.label}</SectionLabel>
                <input
                  type="color"
                  value={value}
                  onChange={(event) =>
                    setControl((previous) => setValueAtPath(previous, colorField.path, event.target.value))
                  }
                  className="h-8 w-16 cursor-pointer rounded-xl border border-slate-600"
                />
              </label>
            );
          })}
        </div>
      )
    : null;

  const lists = config.lists?.length
    ? (
        <div className="space-y-6">
          {config.lists.map((listConfig) => {
            const items = (getValueAtPath(control, listConfig.path) as any[]) ?? [];
            const addLabel = listConfig.addLabel ?? '+ Add Item';
            return (
              <div key={listConfig.path} className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>{listConfig.label}</SectionLabel>
                  <button
                    type="button"
                    onClick={() =>
                      setControl((previous) =>
                        updateValue(previous, listConfig.path, (current: any[] = []) => [
                          ...current,
                          listConfig.template(),
                        ])
                      )
                    }
                    className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-300 hover:bg-slate-800/60"
                  >
                    {addLabel}
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-[0.65rem] uppercase tracking-[0.3em] text-slate-400">
                    Empty list
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={`${listConfig.path}-${index}`} className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setControl((previous) =>
                                updateValue(previous, listConfig.path, (current: any[] = []) =>
                                  current.filter((_, itemIndex) => itemIndex !== index)
                                )
                              )
                            }
                            className="rounded-full border border-rose-400/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-rose-200"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {listConfig.fields.map((field) => {
                            const rawValue = item?.[field.key];
                            const displayValue = field.format ? field.format(rawValue) : rawValue ?? '';
                            const handleChange = (value: any) => {
                              setControl((previous) =>
                                updateValue(previous, listConfig.path, (current: any[] = []) => {
                                  const next = [...current];
                                  const currentItem = { ...next[index], [field.key]: value };
                                  next[index] = currentItem;
                                  return next;
                                })
                              );
                            };

                            switch (field.type) {
                              case 'textarea':
                                return (
                                  <label key={field.key} className="space-y-1 md:col-span-2">
                                    <SectionLabel>{field.label}</SectionLabel>
                                    <textarea
                                      value={displayValue}
                                      onChange={(event) =>
                                        handleChange(field.parse ? field.parse(event.target.value) : event.target.value)
                                      }
                                      className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
                                    />
                                  </label>
                                );
                              case 'number':
                                return (
                                  <label key={field.key} className="space-y-1">
                                    <SectionLabel>{field.label}</SectionLabel>
                                    <input
                                      type="number"
                                      value={displayValue ?? ''}
                                      min={field.min}
                                      max={field.max}
                                      step={field.step}
                                      onChange={(event) => {
                                        const parsed = Number(event.target.value);
                                        handleChange(Number.isNaN(parsed) ? undefined : parsed);
                                      }}
                                      className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                                    />
                                  </label>
                                );
                              case 'select':
                                return (
                                  <label key={field.key} className="space-y-1">
                                    <SectionLabel>{field.label}</SectionLabel>
                                    <select
                                      value={displayValue ?? ''}
                                      onChange={(event) =>
                                        handleChange(field.parse ? field.parse(event.target.value) : event.target.value)
                                      }
                                      className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
                                    >
                                      {field.options?.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                );
                              case 'slider':
                                return (
                                  <div key={field.key} className="space-y-1">
                                    <SectionLabel>{field.label}</SectionLabel>
                                    <input
                                      type="range"
                                      min={field.min ?? 0}
                                      max={field.max ?? 100}
                                      step={field.step ?? 1}
                                      value={Number(displayValue ?? field.min ?? 0)}
                                      onChange={(event) => handleChange(Number(event.target.value))}
                                      className="w-full accent-fuchsia-400"
                                    />
                                    <div className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                                      {field.suffix ? `${displayValue}${field.suffix}` : displayValue}
                                    </div>
                                  </div>
                                );
                              case 'text':
                              default:
                                return (
                                  <label key={field.key} className="space-y-1">
                                    <SectionLabel>{field.label}</SectionLabel>
                                    <input
                                      value={displayValue ?? ''}
                                      onChange={(event) =>
                                        handleChange(field.parse ? field.parse(event.target.value) : event.target.value)
                                      }
                                      className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm focus:border-fuchsia-400 focus:outline-none"
                                    />
                                  </label>
                                );
                            }
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )
    : null;

  return (
    <div className="space-y-6">
      {toggles}
      {selects}
      {numbers}
      {sliders}
      {texts}
      {colors}
      {lists}
      {config.extras?.map((ExtraComponent, index) => (
        <ExtraComponent key={`${config.id}-extra-${index}`} control={control} setControl={setControl} />
      ))}
    </div>
  );
}

// Missing ManagerExtras Components
const ProfileManagerExtras = (_props: PanelRenderProps) => {
  const { settings, updateSettings } = useProfileSettings();
  
  return (
    <div className="space-y-5 rounded-3xl border border-purple-500/30 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Profile Settings</SectionLabel>
      </div>
      <div className="text-sm text-slate-400">
        Profile customization features coming soon...
      </div>
    </div>
  );
};

const NpcManagerExtras = (_props: PanelRenderProps) => {
  const { npcs } = useNpcs();
  
  return (
    <div className="space-y-5 rounded-3xl border border-blue-500/30 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>NPC Relationships</SectionLabel>
      </div>
      <div className="text-sm text-slate-400">
        Found {npcs.length} NPCs. Relationship management coming soon...
      </div>
    </div>
  );
};

const EventsManagerExtras = (_props: PanelRenderProps) => {
  const { events } = useEvents();
  
  return (
    <div className="space-y-5 rounded-3xl border border-green-500/30 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Event Management</SectionLabel>
      </div>
      <div className="text-sm text-slate-400">
        Total events: {events.length}. Advanced event management coming soon...
      </div>
    </div>
  );
};

const JournalManagerExtras = (_props: PanelRenderProps) => {
  return (
    <div className="space-y-5 rounded-3xl border border-pink-500/30 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Journal Settings</SectionLabel>
      </div>
      <div className="text-sm text-slate-400">
        Advanced journal configuration coming soon...
      </div>
    </div>
  );
};

const DungeonManagerExtras = (_props: PanelRenderProps) => {
  const { dungeons } = useDungeons();
  
  return (
    <div className="space-y-5 rounded-3xl border border-orange-500/30 bg-slate-950/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>Dungeon Management</SectionLabel>
      </div>
      <div className="text-sm text-slate-400">
        Available dungeons: {dungeons.length}. Advanced dungeon management coming soon...
      </div>
    </div>
  );
};

const PANEL_CONFIGS: PanelConfig[] = [
  {
    id: "appearance",
    icon: "🎨",
    title: "Appearance & Themes",
    description: "Tailor the sanctum's aura and ambient glow.",
    selects: [
      { label: "Primary Theme", path: "appearance.theme", options: ["night-sky", "temple-gold", "aurora", "cyberpunk", "emerald"] },
      { label: "Font", path: "appearance.fontFamily", options: ["Rune Sans", "Temple Serif", "Cyber Mono", "Candy Script"] },
      { label: "Mode", path: "appearance.mode", options: ["lucid", "waking"] },
      { label: "Layout Density", path: "appearance.layoutDensity", options: ["compact", "comfortable", "spacious"] },
    ],
    colors: [{ label: "Accent Color", path: "appearance.accentColor" }],
    sliders: [
      {
        label: "UI Scale",
        path: "appearance.uiScale",
        min: 0.8,
        max: 1.4,
        step: 0.05,
        accent: "accent-fuchsia-400",
        format: (value: number) => value.toFixed(2) + "x",
      },
    ],
    toggles: [
      { label: "Animated Backgrounds", path: "appearance.animatedBackground" },
      { label: "Sparkles", path: "appearance.sparkles" },
      { label: "Orb Aura", path: "appearance.orbAura" },
      { label: "Heartbeat Title", path: "appearance.heartbeatTitle" },
      { label: "Bloom Shader", path: "appearance.bloom" },
      { label: "Arcane Vignette", path: "appearance.vignette" },
    ],
  },
  {
    id: "profile-settings",
    icon: "👤",
    title: "Profile Manager",
    description: "Customise avatar, bio, and profile themes.",
    extras: [ProfileManagerExtras],
  },
  {
    id: "npc-manager",
    icon: "🫂",
    title: "NPC Manager",
    description: "Manage relationships, trust, and shame stats.",
    extras: [NpcManagerExtras],
  },
  {
    id: "shame-manager",
    icon: "😳",
    title: "Shame Manager",
    description: "Configure filth thresholds and punishment tiers.",
    extras: [ShameManagerExtras],
  },
  {
    id: "event-manager",
    icon: "📅",
    title: "Event Manager",
    description: "Schedule rituals, panty resets, and quest deadlines.",
    extras: [EventsManagerExtras],
  },
  {
    id: "journal-manager",
    icon: "📖",
    title: "Dream Journal Manager",
    description: "Manage dream entries, AI settings, multimedia features, and ultra customization.",
    extras: [JournalManagerExtras],
  },
  {
    id: "data-control",
    icon: "📦",
    title: "Data Control",
    description: "Safeguard every lucid log and archive.",
    numbers: [
      { label: "Backup Interval (hrs)", path: "dataControl.backupIntervalHours", min: 1, max: 72 },
      { label: "History Retention (days)", path: "dataControl.retainHistoryDays", min: 7, max: 365 },
    ],
    toggles: [
      { label: "Auto Backups", path: "dataControl.autoBackup" },
      { label: "Cloud Sync", path: "dataControl.syncEnabled" },
      { label: "Export Obsidian Vault", path: "dataControl.exportAsVault" },
    ],
    extras: [DataControlExtras],
  },
  {
    id: "xp-progression",
    icon: "🏆",
    title: "XP & Progression",
    description: "Balance advancement and obedience rewards.",
    numbers: [
      { label: "Current Level", path: "xp.level", min: 1 },
      { label: "Total XP", path: "xp.totalXP", min: 0 },
      { label: "XP per Quest", path: "xp.xpPerQuest", min: 5 },
    ],
    sliders: [
      {
        label: "XP Multiplier",
        path: "xp.xpMultiplier",
        min: 0.5,
        max: 3,
        step: 0.1,
        accent: "accent-amber-400",
        format: (value: number) => value.toFixed(1) + "x",
      },
    ],
    toggles: [{ label: "XP Boost Active", path: "xp.xpBoostActive" }],
    lists: [
      {
        label: "Unlocked Titles",
        path: "xp.unlockedTitles",
        addLabel: "+ Add Title",
        template: () => ({ id: generateId("TITLE"), label: "New Title" }),
        fields: [{ key: "label", label: "Title", type: "text" }],
      },
    ],
    extras: [XpExtras],
  },
  {
    id: "dream-mechanics",
    icon: "🌙",
    title: "Dream Mechanics",
    description: "Tune lucidity protocols and dream recall.",
    selects: [
      { label: "Orb Action", path: "dreamMechanics.orbAction", options: ["random", "latest", "summon-companion"] },
    ],
    sliders: [
      {
        label: "Reality Check Frequency (hrs)",
        path: "dreamMechanics.realityCheckFrequency",
        min: 1,
        max: 6,
        step: 1,
        accent: "accent-sky-400",
        format: (value: number) => "Every " + value + "h",
      },
      {
        label: "Dream Recall Strength",
        path: "dreamMechanics.dreamRecallStrength",
        min: 0,
        max: 100,
        step: 5,
        accent: "accent-fuchsia-400",
        format: (value: number) => value + "%",
      },
    ],
    toggles: [
      { label: "Lucidity Assist", path: "dreamMechanics.lucidityAssist" },
      { label: "Auto Tagging", path: "dreamMechanics.autoTagging" },
      { label: "Parallel Dream Chains", path: "dreamMechanics.parallelDreamsUnlocked" },
    ],
    extras: [DreamMechanicsExtras],
  },
  {
    id: "companion-settings",
    icon: "🎭",
    title: "Companion Settings",
    description: "Shape how companions obey and support.",
    sliders: [
      {
        label: "Bond Level",
        path: "companionSettings.bondLevel",
        min: 0,
        max: 100,
        accent: "accent-emerald-400",
        format: (value: number) => value + "% devotion",
      },
    ],
    selects: [
      { label: "Preferred Role", path: "companionSettings.preferredRole", options: ["Oracle", "Guardian", "Muse", "Provocateur", "Mentor"] },
      { label: "Evolution Mode", path: "companionSettings.evolutionMode", options: ["ascension", "rebirth", "contract"] },
    ],
    toggles: [
      { label: "Companions Enabled", path: "companionSettings.enabled" },
      { label: "Auto Summon", path: "companionSettings.autoSummon" },
      { label: "Dual Companions", path: "companionSettings.allowDualCompanions" },
      { label: "Buffs Enabled", path: "companionSettings.buffsEnabled" },
    ],
    lists: [
      {
        label: "Roster",
        path: "companionSettings.roster",
        addLabel: "+ Add Companion",
        template: () => ({ id: generateId("C"), name: "New Companion", role: "Guardian", buffs: "" }),
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "select", options: ["Sensual Anchor", "Guardian", "Oracle", "Mentor", "Muse"] },
          { key: "buffs", label: "Buffs", type: "text" },
        ],
      },
    ],
    extras: [CompanionManagerExtras],
  },
  {
    id: "dungeon-manager",
    icon: "🕷️",
    title: "Dungeon Manager",
    description: "Forge nightmare dungeons and perilous rooms.",
    extras: [DungeonManagerExtras],
  },
  {
    id: "shop-manager",
    icon: "🛒",
    title: "Dream Shop",
    description: "Curate shop stock, prices, and limited supply.",
    extras: [ShopManagerExtras],
  },
  {
    id: "advanced",
    icon: "⚡",
    title: "Advanced / Dev Mode",
    description: "Unlock developer sorcery and debug overlays.",
    numbers: [
      { label: "Sandbox Timeout (s)", path: "advanced.sandboxTimeout", min: 10, max: 300, step: 5 },
    ],
    toggles: [
      { label: "Dev Mode", path: "advanced.devMode" },
      { label: "Debug Overlay", path: "advanced.showDebugOverlay" },
      { label: "Allow Unsafe Scripts", path: "advanced.allowUnsafeScripts" },
      { label: "Raw JSON", path: "advanced.debugJSON" },
      { label: "Easter Eggs", path: "advanced.easterEggs" },
    ],
    extras: [AdvancedExtras],
  },
  {
    id: "people-manager",
    icon: "👥",
    title: "People Manager",
    description: "Curate personas that haunt the sanctum.",
    toggles: [{ label: "Auto Tag Dream Personas", path: "people.autoTagDreams" }],
    lists: [
      {
        label: "Personas",
        path: "people.list",
        addLabel: "+ Add Persona",
        template: () => ({ id: generateId("P"), name: "New Persona", role: "NPC", affinity: 50 }),
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "select", options: ["Family", "NPC", "Companion", "Waifu", "Mentor"] },
          { key: "affinity", label: "Affinity", type: "slider", min: 0, max: 100, suffix: "%", accent: "accent-fuchsia-400" },
        ],
      },
    ],
  },
  {
    id: "places-manager",
    icon: "🗺️",
    title: "Places Manager",
    description: "Define dreamscapes and astral zones.",
    toggles: [{ label: "Auto-generate Maps", path: "places.autoGenerateMaps" }],
    lists: [
      {
        label: "Realms",
        path: "places.list",
        addLabel: "+ Add Realm",
        template: () => ({ id: generateId("L"), name: "New Realm", type: "Sanctum", stability: 50, mapUrl: "", lucidHotspot: false }),
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "type", label: "Type", type: "select", options: ["Sanctum", "Dream Market", "Dungeon", "Wilderness"] },
          { key: "stability", label: "Stability", type: "slider", min: 0, max: 100, suffix: "%", accent: "accent-emerald-400" },
          { key: "mapUrl", label: "Map URL", type: "text" },
          {
            key: "lucidHotspot",
            label: "Lucid Hotspot",
            type: "select",
            options: ["true", "false"],
            format: (value: boolean) => String(value),
            parse: (value: string) => value === "true",
          },
        ],
      },
    ],
  },
  {
    id: "dream-manager",
    icon: "💭",
    title: "Dream Manager",
    description: "Craft dream templates and recall strategies.",
    toggles: [
      { label: "Auto Lucidity Checks", path: "dreams.autoLucidityChecks" },
      { label: "Archive Enabled", path: "dreams.archiveEnabled" },
    ],
    lists: [
      {
        label: "Tag Library",
        path: "dreams.bulkTags",
        addLabel: "+ Add Tag",
        template: () => ({ id: generateId("DT"), label: "New Tag" }),
        fields: [{ key: "label", label: "Label", type: "text" }],
      },
      {
        label: "Templates",
        path: "dreams.templates",
        addLabel: "+ New Template",
        template: () => ({ id: generateId("D"), title: "Untitled Reverie", primaryTag: "experimental" }),
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "primaryTag", label: "Primary Tag", type: "text" },
        ],
      },
    ],
  },
  {
    id: "inventory-manager",
    icon: "🎒",
    title: "Inventory Manager",
    description: "Curate relics, panties, shards, and consumables.",
    extras: [InventoryManagerExtras],
  },
  {
    id: "buff-manager",
    icon: "✨",
    title: "Buff Manager",
    description: "Control passive and temporary dream effects.",
    extras: [BuffManagerExtras],
  },
  {
    id: "rituals-control",
    icon: "🔒",
    title: "Rituals Control",
    description: "Script obedience and ceremonial steps.",
    numbers: [{ label: "Cooldown (minutes)", path: "rituals.cooldownMinutes", min: 10, max: 360 }],
    texts: [{ label: "Schedule", path: "rituals.schedule", placeholder: "Moonrise" }],
    toggles: [
      { label: "Enforce Ritual Schedule", path: "rituals.enforced" },
      { label: "Strict Obedience Mode", path: "rituals.strictMode" },
      { label: "Grant XP Rewards", path: "rituals.xpRewardEnabled" },
      { label: "Enable Streak Multipliers", path: "rituals.streakMultiplierEnabled" },
    ],
    lists: [
      {
        label: "Sequences",
        path: "rituals.sequences",
        addLabel: "+ Add Sequence",
        template: () => ({ id: generateId("R"), title: "New Rite", steps: ["Prepare", "Invoke", "Seal"] }),
        fields: [
          { key: "title", label: "Ritual Title", type: "text" },
          {
            key: "steps",
            label: "Steps",
            type: "textarea",
            format: (value: string[]) => (Array.isArray(value) ? value.join("\n") : ""),
            parse: (value: string) => value.split("\n").map((line) => line.trim()).filter((line) => line.length > 0),
          },
        ],
      },
    ],
    extras: [RitualsManagerExtras],
  },
  {
    id: "questline-manager",
    icon: "📜",
    title: "Questline Manager",
    description: "Author and prioritise dream-bound quests.",
    toggles: [
      { label: "Auto Assign Quests", path: "quests.autoAssign" },
      { label: "Allow Ritual Automation", path: "quests.ritualAutomation" },
    ],
    lists: [
      {
        label: "Active Quests",
        path: "quests.active",
        addLabel: "+ Activate Quest",
        template: () => ({ id: generateId("Q"), title: "Untitled Quest", status: "in-progress" }),
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "status", label: "Status", type: "select", options: ["available", "in-progress", "completed", "blocked"] },
        ],
      },
      {
        label: "Backlog",
        path: "quests.backlog",
        addLabel: "+ Queue Quest",
        template: () => ({ id: generateId("QB"), title: "Draft Quest", status: "available" }),
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "status", label: "Status", type: "select", options: ["available", "in-progress", "completed", "blocked"] },
        ],
      },
      {
        label: "Questlines",
        path: "quests.questlines",
        addLabel: "+ Add Questline",
        template: () => ({ id: generateId("QL"), title: "New Questline", reward: "" }),
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "reward", label: "Reward", type: "text" },
        ],
      },
    ],
  },
  {
    id: "achievements-manager",
    icon: "🏅",
    title: "Achievements Manager",
    description: "Track merits unlocked through obedience.",
    numbers: [
      { label: "Streak (days)", path: "achievements.tracking.streakDays", min: 0 },
      { label: "Dreams Logged", path: "achievements.tracking.totalDreamsLogged", min: 0 },
      { label: "Highest Lucidity", path: "achievements.tracking.highestLucidity", min: 0, max: 10 },
    ],
    lists: [
      {
        label: "Unlocked Titles",
        path: "achievements.unlocked",
        addLabel: "+ Add Achievement",
        template: () => ({ id: generateId("ACH"), title: "New Achievement" }),
        fields: [{ key: "title", label: "Title", type: "text" }],
      },
      {
        label: "Conditions",
        path: "achievements.conditions",
        addLabel: "+ Add Condition",
        template: () => ({ id: generateId("COND"), description: "Describe condition" }),
        fields: [{ key: "description", label: "Condition", type: "text" }],
      },
    ],
  },
  {
    id: "companion-card-builder",
    icon: "🎟️",
    title: "Companion Card Builder",
    description: "Design the perfect companion calling card.",
    selects: [{ label: "Card Theme", path: "companionBuilder.cardTheme", options: ["luminous", "nocturne", "crystalline", "ember"] }],
    texts: [
      { label: "Preview Name", path: "companionBuilder.preview.name" },
      { label: "Preview Role", path: "companionBuilder.preview.role" },
      { label: "Signature Move", path: "companionBuilder.preview.signatureMove" },
      { label: "Artwork URL", path: "companionBuilder.artUrl", placeholder: "https://" },
    ],
    lists: [
      {
        label: "Buffs & Sigils",
        path: "companionBuilder.buffs",
        addLabel: "+ Add Buff",
        template: () => ({ id: generateId("BUFF"), label: "New Buff" }),
        fields: [{ key: "label", label: "Buff", type: "text" }],
      },
    ],
  },
  {
    id: "map-manager",
    icon: "🌌",
    title: "Multiverse Map Manager",
    description: "Administer nodes, links, and unlock conditions for the multiverse map.",
    extras: [MapManager],
  },
  {
    id: "database-tools",
    icon: "🗂️",
    title: "Database Tools",
    description: "Manage backups, retention, and encryption.",
    numbers: [
      { label: "Backup Frequency (hrs)", path: "database.backupHours", min: 1, max: 48 },
      { label: "Retention (days)", path: "database.retentionDays", min: 7, max: 365 },
    ],
    toggles: [
      { label: "Encrypt Archives", path: "database.encryption" },
      { label: "Anomaly Alerts", path: "database.anomalyAlerts" },
    ],
    lists: [
      {
        label: "Tag Library",
        path: "database.tags",
        addLabel: "+ Add Tag",
        template: () => ({ id: generateId("TAG"), label: "New Tag" }),
        fields: [{ key: "label", label: "Tag", type: "text" }],
      },
      {
        label: "Lorebook Entries",
        path: "database.lorebook",
        addLabel: "+ Add Lore",
        template: () => ({ id: generateId("LORE"), title: "New Lore" }),
        fields: [{ key: "title", label: "Title", type: "text" }],
      },
      {
        label: "Cleanup Rules",
        path: "database.cleanupRules",
        addLabel: "+ Add Rule",
        template: () => ({ id: generateId("CLEAN"), rule: "" }),
        fields: [{ key: "rule", label: "Rule", type: "text" }],
      },
    ],
  },
  {
    id: "audio-alerts",
    icon: "🎶",
    title: "Audio & Alerts",
    description: "Modulate ambience, alerts, and voice guidance.",
    sliders: [
      {
        label: "Music Volume",
        path: "audio.musicVolume",
        min: 0,
        max: 100,
        step: 5,
        accent: "accent-violet-400",
        format: (value: number) => value + "%",
      },
      {
        label: "SFX Volume",
        path: "audio.sfxVolume",
        min: 0,
        max: 100,
        step: 5,
        accent: "accent-sky-400",
        format: (value: number) => value + "%",
      },
    ],
    toggles: [
      { label: "Alerts Enabled", path: "audio.alerts" },
      { label: "Voice Guidance", path: "audio.voiceGuidance" },
    ],
    selects: [
      { label: "Ambience Theme", path: "audio.ambienceTheme", options: ["nebula-winds", "velvet-hum", "deep-ocean", "temple-chimes"] },
      { label: "Ritual Chime", path: "audio.ritualChime", options: ["silver-bells", "crystal-hum", "gong", "piano"] },
    ],
    lists: [
      {
        label: "MP3 Library",
        path: "audio.mp3Library",
        addLabel: "+ Add Track",
        template: () => ({ id: generateId("track"), title: "New Track", url: "" }),
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "url", label: "URL", type: "text" },
        ],
      },
    ],
  },
  {
    id: "visual-assets",
    icon: "🎨",
    title: "Visual Assets",
    description: "Control shaders, particles, and chromatic shifts.",
    sliders: [
      {
        label: "Particle Density",
        path: "visuals.particleDensity",
        min: 0,
        max: 100,
        step: 5,
        accent: "accent-emerald-400",
        format: (value: number) => value + "%",
      },
      {
        label: "Chromatic Shift",
        path: "visuals.chromaticShift",
        min: 0,
        max: 1,
        step: 0.05,
        accent: "accent-fuchsia-400",
        format: (value: number) => value.toFixed(2),
      },
    ],
    toggles: [
      { label: "Bloom", path: "visuals.bloom" },
      { label: "Motion Blur", path: "visuals.motionBlur" },
    ],
    selects: [
      { label: "Shader", path: "visuals.shader", options: ["nebula", "aurora", "ember", "monochrome"] },
      { label: "Background", path: "visuals.background", options: ["void", "starfield", "moonlit", "pink-haze"] },
    ],
    lists: [
      {
        label: "Stickers",
        path: "visuals.stickerLibrary",
        addLabel: "+ Add Sticker",
        template: () => ({ id: generateId("STK"), label: "New Sticker" }),
        fields: [{ key: "label", label: "Sticker", type: "text" }],
      },
    ],
  },
  {
    id: "experiment-mode",
    icon: "🧪",
    title: "Experiment Mode",
    description: "Prototype cutting-edge dream mechanics.",
    toggles: [
      { label: "Laboratory Mode", path: "experiment.labMode" },
      { label: "Mindfuck Toggle", path: "experiment.mindfuck" },
    ],
    sliders: [
      {
        label: "XP Sandbox",
        path: "experiment.xpSandbox",
        min: -100,
        max: 100,
        step: 10,
        accent: "accent-purple-400",
        format: (value: number) => `${value} XP`,
      },
    ],
    lists: [
      {
        label: "Prototypes",
        path: "experiment.prototypes",
        addLabel: "+ Add Prototype",
        template: () => ({ id: generateId("X"), title: "New Prototype", status: "draft" }),
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "status", label: "Status", type: "select", options: ["draft", "active", "paused"] },
        ],
      },
    ],
  },
  {
    id: "integration-settings",
    icon: "🧩",
    title: "Integration Settings",
    description: "Link to mortal-world systems and webhooks.",
    toggles: [
      { label: "Notion Sync", path: "integrations.notionSync" },
      { label: "Obsidian Sync", path: "integrations.obsidianSync" },
      { label: "Enable Webhooks", path: "integrations.webhooksEnabled" },
    ],
    texts: [
      { label: "Discord Webhook", path: "integrations.discordWebhook", placeholder: "https://" },
      { label: "OpenAI Key", path: "integrations.apiKeys.openai", placeholder: "sk-..." },
      { label: "Stable Diffusion Key", path: "integrations.apiKeys.stableDiffusion", placeholder: "sd-..." },
    ],
    selects: [
      { label: "Automation Level", path: "integrations.automationLevel", options: ["basic", "advanced", "hands-off"] },
    ],
  },
  {
    id: "global-control",
    icon: "🌐",
    title: "Global Control",
    description: "Define language, timezone, and global safeties.",
    toggles: [
      { label: "Auto Save", path: "global.autoSave" },
      { label: "Power User Mode", path: "global.powerUser" },
      { label: "Onboarding Complete", path: "global.onboardingComplete" },
      { label: "NSFW", path: "global.nsfw" },
      { label: "Password Lock", path: "global.passwordLock" },
    ],
    selects: [
      { label: "Language", path: "global.language", options: ["en", "fr", "es", "de", "jp"] },
      { label: "Timezone", path: "global.timezone", options: ["UTC", "UTC+1", "UTC-5", "UTC+9"] },
    ],
    texts: [{ label: "Vault Signature", path: "global.vaultSignature", placeholder: "Arcane signature" }],
    extras: [GlobalExtras],
  },
];

function createPanels(
  control: ControlNexus,
  setControl: Dispatch<SetStateAction<ControlNexus>>
): PanelDefinition[] {
  return PANEL_CONFIGS.map((config) => ({
    id: config.id,
    icon: config.icon,
    title: config.title,
    description: config.description,
    render: config.render || ((props: PanelRenderProps) => renderPanelContent(config, props.control, props.setControl)),
  }));
}

function ControlNexusSettings() {
  const [control, setControl] = usePersistentState<ControlNexus>("controlNexus", cloneDefault);
  const [expanded, setExpanded] = useState<string | null>("events"); // Use static default instead of dynamic
  const [mounted, setMounted] = useState(false);

  // Add hydration safety
  useEffect(() => {
    setMounted(true);
    // Set the actual default after mount if needed
    if (!expanded && PANEL_CONFIGS.length > 0) {
      setExpanded(PANEL_CONFIGS[0].id);
    }
  }, [expanded]);

  const panels = useMemo(() => createPanels(control, setControl), [control, setControl]);
  const summaryCards = useMemo(
    () => [
      { label: "Active Quests", value: control.quests.active.length },
      { label: "Guildmates", value: control.people.list.length },
      { label: "Dream Templates", value: control.dreams.templates.length },
      { label: "Ritual Sequences", value: control.rituals.sequences.length },
    ],
    [control]
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="rounded-3xl border border-fuchsia-500/20 bg-[#150022]/80 p-6 shadow-[0_0_35px_rgba(236,72,153,0.25)] backdrop-blur">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-fuchsia-500/30 bg-slate-950/70 p-4 text-center shadow-inner shadow-fuchsia-500/20"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-slate-300">{card.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      {panels.map((panel) => (
        <PanelShell
          key={panel.id}
          icon={panel.icon}
          title={panel.title}
          description={panel.description}
          expanded={expanded === panel.id}
          onToggle={() => setExpanded((prev) => (prev === panel.id ? null : panel.id))}
        >
          {panel.render({ control, setControl })}
        </PanelShell>
      ))}
    </div>
  );
}

import EventManager from "../../components/EventManager";

export default function SettingsPage() {
  return (
    <QuestLayout>
      <ControlNexusSettings />
    </QuestLayout>
  );
}
