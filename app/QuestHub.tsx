import Link from "next/link";

const navItems = [
  {
    icon: "📊",
    label: "Dashboard",
    href: "/rpg/dashboard",
    classes:
      "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 shadow-emerald-400/40",
  },
  {
    icon: "📖",
    label: "Journal",
    href: "/rpg/journal",
    classes:
      "bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 shadow-blue-400/40",
  },
  {
    icon: "🛕",
    label: "Temple",
    href: "/rpg/temple",
    classes:
      "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 shadow-pink-500/40",
  },
  {
    icon: "📈",
    label: "Analytics",
    href: "/rpg/analytics",
    classes:
      "bg-gradient-to-r from-sky-500 via-blue-400 to-indigo-500 shadow-sky-500/35",
  },
  {
    icon: "🎒",
    label: "Inventory",
    href: "/rpg/inventory",
    classes:
      "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 shadow-fuchsia-400/35",
  },
  {
    icon: "⚙️",
    label: "Settings",
    href: "/rpg/settings",
    classes:
      "bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 shadow-slate-500/35",
  },
];

const cards = [
  {
    icon: "🏰",
    title: "Guild Hall",
    description: "People, Places, Companions",
    accent:
      "hover:border-emerald-300/80 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]",
    overlay: "from-emerald-400/20 via-teal-400/10 to-emerald-500/5",
    href: "/rpg/people",
  },
  {
    icon: "📜",
    title: "Temple Archives",
    description: "Dream Data, Patterns, Analytics",
    accent:
      "hover:border-sky-300/80 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]",
    overlay: "from-sky-400/20 via-indigo-500/10 to-blue-500/5",
    href: "/rpg/analytics",
  },
  {
    icon: "🔒",
    title: "Obedience Chamber",
    description: "Rituals, Logs, Submissions",
    accent:
      "hover:border-rose-300/80 hover:shadow-[0_0_35px_rgba(244,114,182,0.25)]",
    overlay: "from-rose-400/20 via-purple-500/10 to-amber-500/5",
    href: "/rpg/rituals",
  },
  {
    icon: "📖",
    title: "Dream Codex",
    description: "Journals, Database, Lore",
    accent:
      "hover:border-amber-300/80 hover:shadow-[0_0_35px_rgba(251,191,36,0.25)]",
    overlay: "from-amber-300/20 via-fuchsia-400/10 to-violet-500/5",
    href: "/rpg/journal",
  },
];

const navButtonBase =
  "group relative overflow-hidden rounded-xl p-[1px] text-lg font-semibold text-white shadow-xl shadow-slate-900/50 transition duration-300 hover:scale-105 hover:animate-pulse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

const cardBaseClasses =
  "group relative overflow-hidden rounded-3xl border border-slate-700/30 bg-slate-950/60 p-6 text-left shadow-xl shadow-slate-950/40 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]";

export default function QuestHub() {
  return (
    <div className="flex flex-col items-center gap-14 text-center">
      <header className="flex flex-col items-center gap-10">
        <div className="relative inline-flex items-center gap-3 text-4xl font-extrabold tracking-[0.4em] text-transparent md:text-5xl">
          <span className="heartbeat-moon text-5xl md:text-6xl">🌙</span>
          <span className="title-wrapper bg-gradient-to-r from-amber-200 via-fuchsia-200 to-sky-300 bg-clip-text">
            <span className="heartbeat-title">Quest Hub ✦✦</span>
          </span>
          <span className="sparkle" style={{ left: "-18px", top: "-12px", animationDelay: "0s" }} />
          <span className="sparkle" style={{ right: "-22px", top: "10px", animationDelay: "1.2s" }} />
          <span className="sparkle" style={{ left: "45%", bottom: "-18px", animationDelay: "2.4s" }} />
        </div>
        <p className="max-w-2xl text-sm text-slate-300 md:text-base">
          Navigate your lucid sanctum. Track guildmates, decode dream patterns, uphold rituals, and weave the codex of every night journey.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={[navButtonBase, item.classes].join(" ")}
            >
              <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-80">
                <span className="absolute inset-0 bg-white/25 blur-2xl" />
              </span>
              <span className="relative flex items-center gap-3 rounded-[0.85rem] bg-slate-950/70 px-8 py-3 tracking-wide">
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </header>

      <div className="grid w-full gap-6 text-left sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className={[cardBaseClasses, card.accent].join(" ")}>
            <div
              className={["absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-80", card.overlay].join(" ")}
            />
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{card.icon}</span>
                <span className="h-10 w-10 rounded-full bg-white/10 blur-lg transition-opacity duration-500 group-hover:opacity-0" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white drop-shadow">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{card.description}</p>
              </div>
              <span className="pointer-events-none h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
