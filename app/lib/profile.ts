import defaultProfile from "../../data/profile.json";

export type ProfileTheme = "default" | "dark" | "neon" | "shame-pink";

export type ProfileSettings = {
  avatar: string;
  bio: string;
  theme: ProfileTheme;
};

const DEFAULT_PROFILE = normaliseProfile(defaultProfile as ProfileSettings);

export function normaliseProfile(settings: ProfileSettings): ProfileSettings {
  return {
    avatar: settings.avatar?.trim() || "🌙",
    bio: settings.bio ?? "Dreamer of Lucidia",
    theme: (settings.theme ?? "default") as ProfileTheme,
  };
}

export function cloneDefaultProfile(): ProfileSettings {
  return normaliseProfile(DEFAULT_PROFILE);
}
