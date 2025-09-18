"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import ProfileHeader from "../../components/ProfileHeader";
import ProfileStats from "../../components/ProfileStats";
import ProfileAchievements from "../../components/ProfileAchievements";
import ProfileCompanions from "../../components/ProfileCompanions";
import ProfileShame from "../../components/ProfileShame";
import { useProfileSettings } from "../../hooks/useProfileSettings";
import { usePersistentState } from "../../hooks/usePersistentState";
import { useInventory } from "../../hooks/useInventory";
import { useCompanions } from "../../hooks/useCompanions";
import { useQuestlines } from "../../hooks/useQuestlines";
import { useDungeons } from "../../hooks/useDungeons";
import { useHydrated } from "../../hooks/useHydrated";

const XP_SEGMENT_CAP = 1000;

function computeLevel(xp: number) {
  const level = Math.max(1, Math.floor(xp / XP_SEGMENT_CAP) + 1);
  const base = (level - 1) * XP_SEGMENT_CAP;
  const progress = Math.min(1, Math.max(0, (xp - base) / XP_SEGMENT_CAP));
  return { level, progress };
}

export default function ProfilePage() {
  const hydrated = useHydrated();
  const { settings, updateSettings } = useProfileSettings();
  const {
    xp,
    obedience,
    tokens,
    awardXp,
  } = useInventory();
  const { detailedCompanions } = useCompanions();
  const { questlines } = useQuestlines();
  const { dungeons } = useDungeons();

  const [titles] = usePersistentState<string[]>("titlesUnlocked", () => []);
  const [dungeonAchievements] = usePersistentState<string[]>("dungeonAchievements", () => []);
  const [shopAchievements] = usePersistentState<string[]>("shopAchievements", () => []);
  const [npcAchievements] = usePersistentState<string[]>("npcAchievements", () => []);
  const [profileAchievements, setProfileAchievements] = usePersistentState<string[]>(
    "profileAchievements",
    () => []
  );

  const visitBonusApplied = useRef(false);

  useEffect(() => {
    if (visitBonusApplied.current) return;
    visitBonusApplied.current = true;
    awardXp(5);
    setProfileAchievements((previous) =>
      previous.includes("Reflected Dreamer")
        ? previous
        : [...previous, "Reflected Dreamer"]
    );
  }, [awardXp, setProfileAchievements]);

  const [avatarInput, setAvatarInput] = useState(settings.avatar);
  const [bioInput, setBioInput] = useState(settings.bio);
  const [themeInput, setThemeInput] = useState(settings.theme);

  useEffect(() => {
    setAvatarInput(settings.avatar);
    setBioInput(settings.bio);
    setThemeInput(settings.theme);
  }, [settings]);

  const handleProfileSave = () => {
    const hasChanges =
      avatarInput.trim() !== settings.avatar ||
      bioInput.trim() !== settings.bio ||
      themeInput !== settings.theme;

    if (!hasChanges) return;

    updateSettings({
      avatar: avatarInput.trim() || "🌙",
      bio: bioInput,
      theme: themeInput,
    });
    awardXp(10);
  };

  const { level, progress } = useMemo(() => computeLevel(xp), [xp]);

  const realmsVisited = useMemo(() => {
    const realms = questlines
      .map((questline) => questline.realm)
      .filter((realm): realm is string => Boolean(realm));
    return Array.from(new Set(realms));
  }, [questlines]);

  const statCards = useMemo(
    () => [
      {
        label: "Total XP",
        value: xp.toLocaleString(),
        glow: "from-amber-400/40 via-amber-500/20 to-transparent",
      },
      {
        label: "Obedience Points",
        value: obedience.toLocaleString(),
        glow: "from-purple-400/40 via-purple-500/20 to-transparent",
      },
      {
        label: "Dirty Tokens",
        value: tokens.toLocaleString(),
        glow: "from-rose-500/40 via-rose-500/20 to-transparent",
      },
      {
        label: "Realms Visited",
        value: realmsVisited.length,
        glow: "from-cyan-400/40 via-sky-500/20 to-transparent",
        description: realmsVisited.length > 0 ? realmsVisited.join(", ") : "No realms explored yet",
      },
    ],
    [xp, obedience, tokens, realmsVisited]
  );

  const combinedAchievements = useMemo(() => {
    const merged = new Set<string>([
      ...dungeonAchievements,
      ...shopAchievements,
      ...npcAchievements,
      ...profileAchievements,
    ]);
    return Array.from(merged);
  }, [dungeonAchievements, npcAchievements, profileAchievements, shopAchievements]);

  const totalAchievementTarget = Math.max(combinedAchievements.length, 10);

  const shameStats = useMemo(() => {
    const pantyRitualCount = questlines.reduce((total, questline) => {
      const pantyStages = questline.stages?.filter((stage) => stage.title?.toLowerCase().includes("panty")) ?? [];
      return total + pantyStages.length;
    }, 0);
    const dungeonClears = dungeons.filter((dungeon) => dungeon.completed).length;
    return {
      pantyRituals: pantyRitualCount,
      shameTokens: tokens,
      dungeonClears,
    };
  }, [dungeons, questlines, tokens]);

  const activeTitle = titles[titles.length - 1] ?? "Initiate";

  if (!hydrated) {
    return (
      <QuestLayout>
        <div className="p-6" />
      </QuestLayout>
    );
  }

  return (
    <QuestLayout>
      <div className="space-y-8 bg-[url('https://images.unsplash.com/photo-1526481280695-3c46980b1b9b?auto=format&fit=crop&w=1600&q=60')] bg-fixed bg-cover bg-center p-6">
        <header className="space-y-4">
          <ProfileHeader
            name="Lucid Dreamer"
            title={activeTitle}
            avatar={settings.avatar}
            bio={settings.bio}
            xp={xp}
            level={level}
            xpProgress={progress}
            obedience={obedience}
            theme={settings.theme}
          />
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_0_35px_rgba(148,163,184,0.3)]">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Avatar</span>
                <input
                  value={avatarInput}
                  onChange={(event) => setAvatarInput(event.target.value.slice(0, 4))}
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Bio</span>
                <textarea
                  value={bioInput}
                  onChange={(event) => setBioInput(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Theme</span>
                <select
                  value={themeInput}
                  onChange={(event) => setThemeInput(event.target.value as typeof themeInput)}
                  className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="neon">Neon</option>
                  <option value="shame-pink">Shame Pink</option>
                </select>
              </label>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={handleProfileSave}
                  className="rounded-full border border-fuchsia-400/60 bg-fuchsia-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100 hover:bg-fuchsia-500/30"
                >
                  Save Customizations (+10 XP)
                </button>
              </div>
            </div>
          </div>
        </header>

        <ProfileStats stats={statCards} />

        <ProfileAchievements
          achievements={combinedAchievements}
          total={totalAchievementTarget}
        />

        <ProfileCompanions companions={detailedCompanions} />

        <ProfileShame
          pantyRituals={shameStats.pantyRituals}
          shameTokens={shameStats.shameTokens}
          dungeonClears={shameStats.dungeonClears}
        />
      </div>
    </QuestLayout>
  );
}
