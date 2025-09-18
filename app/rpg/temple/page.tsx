import Link from "next/link";
import QuestLayout from "../../layouts/QuestLayout";

export default function MommyLucyTemple() {
  return (
    <QuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#1f0030] to-[#2a003e] text-pink-100 font-mono p-6">
        <div className="border-4 border-pink-400 rounded-xl p-4 max-w-6xl mx-auto space-y-4 shadow-2xl backdrop-blur-sm bg-base-200 border border-base-300">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">🌙 Mommy Lucy's Dream Temple</h1>
          <p>(XP: 3,400)</p>
          <p className="text-pink-300">🎀 Dreamwalker of Lucidia 🎀</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {/* Left: Navigation */}
          <div className="space-y-2">
            {/* Primary Nav */}
            <div className="border border-pink-300 p-2 rounded-lg">
              <Link href="/rpg/journal" className="block w-full text-left hover:underline">🧿 Quests</Link>
              <Link href="/rpg/companions" className="block w-full text-left hover:underline">💕 Companions</Link>
              <Link href="/rpg/journal?q=Shame" className="block w-full text-left hover:underline">💦 Shame Log</Link>
              <Link href="/rpg/places" className="block w-full text-left hover:underline">📍 Dream Places</Link>
            </div>
            {/* All Tabs */}
            <div className="border border-pink-300 p-2 rounded-lg">
              <Link href="/rpg/dashboard" className="block w-full text-left hover:underline">📊 Dashboard</Link>
              <Link href="/rpg/journal" className="block w-full text-left hover:underline">📝 Journal</Link>
              <Link href="/rpg/analytics" className="block w-full text-left hover:underline">📈 Analytics</Link>
              <Link href="/rpg/quests" className="block w-full text-left hover:underline">⏰ Reality Checks</Link>
              <Link href="/rpg/people" className="block w-full text-left hover:underline">🧑 People</Link>
              <Link href="/rpg/places" className="block w-full text-left hover:underline">🗺️ Places</Link>
              <Link href="/rpg/companions" className="block w-full text-left hover:underline">🤝 Companions</Link>
              <Link href="/rpg/achievements" className="block w-full text-left hover:underline">🏆 XP</Link>
              <Link href="/rpg/settings" className="block w-full text-left hover:underline">⚙️ Settings</Link>
            </div>
          </div>

          {/* Center: Action Panel */}
          <div className="space-y-2">
            <div className="border border-pink-300 p-2 rounded-lg">
              <Link href="/rpg/journal" className="block w-full text-left hover:underline">🌌 Dream Log Entry</Link>
              <Link href="/rpg/journal?q=Panty" className="block w-full text-left hover:underline">🩲 Shame Ritual: Panty Count</Link>
              <Link href="/rpg/achievements" className="block w-full text-left hover:underline">⚡ XP Update: +100</Link>
              <span className="block w-full opacity-50 cursor-not-allowed">💫 Summon Mommy Ritual (Locked)</span>
            </div>
          </div>

          {/* Right: Status */}
          <div className="space-y-2">
            <div className="border border-purple-300 p-2 rounded-lg">
              <p>💖 Companion: Candy</p>
              <p>Buffs: Lucidity + Obey</p>
            </div>
            <div className="border border-purple-300 p-2 rounded-lg">
              <p>🌙 Night Ritual: Ready</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </QuestLayout>
  );
}
