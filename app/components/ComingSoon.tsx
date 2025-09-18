type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: string;
};

const DEFAULT_ICON = "🔒";

export default function ComingSoon({ title, description, icon = DEFAULT_ICON }: ComingSoonProps) {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-52 w-52 rounded-full bg-fuchsia-500/15 blur-[120px]" />
        <div className="absolute bottom-10 right-1/5 h-64 w-64 rounded-full bg-sky-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),transparent_55%)]" />
      </div>

      <div className="relative w-full max-w-xl px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#1b1030] via-[#0f0a1f] to-[#06030f] p-[1px] shadow-[0_0_35px_rgba(236,72,153,0.25)]">
          <div className="rounded-3xl bg-slate-950/70 px-10 py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/30 via-pink-500/20 to-sky-500/30 text-5xl text-white shadow-[0_0_22px_rgba(236,72,153,0.35)] animate-pulse" aria-hidden>
              <span>{icon}</span>
            </div>
            <h1 className="mt-6 text-3xl font-semibold uppercase tracking-[0.5em] text-transparent">
              <span className="relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-200 via-fuchsia-200 to-sky-300 bg-clip-text">
                <span className="heartbeat-title text-white/90 drop-shadow">{title}</span>
                <span className="sparkle" style={{ top: "-12px", right: "-24px", animationDelay: "0.8s" }} />
                <span className="sparkle" style={{ bottom: "-14px", left: "-18px", animationDelay: "1.6s" }} />
              </span>
            </h1>
            <p className="mt-4 text-sm text-slate-300/80">
              {description ?? "Module coming soon — stay lucid ✦"}
            </p>

            <div className="mt-10 flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/60 via-pink-500/50 to-sky-500/60 text-3xl text-white opacity-70 shadow-inner shadow-fuchsia-500/30">
                <span className="absolute inset-0 rounded-full border border-fuchsia-500/20" />
                <span className="relative z-10 cursor-not-allowed select-none">🔮</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
