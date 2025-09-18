'use client';

type ProfileHeaderProps = {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  xp: number;
  level: number;
  xpProgress: number;
  obedience: number;
  theme: string;
};

const THEME_AURAS: Record<string, string> = {
  default: 'from-indigo-500/40 via-purple-500/25 to-slate-900/80',
  dark: 'from-slate-800/60 via-slate-900/60 to-black/80',
  neon: 'from-fuchsia-500/50 via-emerald-500/40 to-cyan-500/50',
  'shame-pink': 'from-rose-500/60 via-pink-500/40 to-slate-900/70',
};

export function ProfileHeader({ name, title, avatar, bio, xp, level, xpProgress, obedience, theme }: ProfileHeaderProps) {
  const aura = THEME_AURAS[theme] ?? THEME_AURAS.default;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_45px_rgba(148,163,184,0.35)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${aura} opacity-40 blur-[4px]`} />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-slate-900/70 text-4xl text-white shadow-[0_0_25px_rgba(236,72,153,0.35)]">
            <span aria-hidden>{avatar}</span>
            <div className="absolute inset-0 animate-pulse rounded-full border border-white/10" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-white">{name}</h1>
              {title ? (
                <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-fuchsia-100">
                  {title}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-200/90">{bio}</p>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-amber-200/80">
              <span>Level {level}</span>
              <span>{xp} XP</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"
                style={{ width: `${Math.min(100, Math.max(0, xpProgress * 100))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-purple-200/80">
              <span>Obedience</span>
              <span>{obedience}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-purple-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"
                style={{ width: `${Math.min(100, Math.max(0, (obedience % 100) / 100 * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
