"use client";

import { useEffect, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { useCompanions } from "../../hooks/useCompanions";
import { useNpcs } from "../../hooks/useNpcs";
import { useShame } from "../../hooks/useShame";

export default function PantyRealmPage() {
  const { companions, gainXpForCompanions } = useCompanions();
  const { npcs, adjustShame: adjustNpcShame } = useNpcs();
  const { incrementCounter } = useShame();
  const [recent, setRecent] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string>(npcs[0]?.id ?? "");

  useEffect(() => {
    if (npcs.length === 0) {
      setSelectedNpcId("");
    } else if (!npcs.some((npc) => npc.id === selectedNpcId)) {
      setSelectedNpcId(npcs[0].id);
    }
  }, [npcs, selectedNpcId]);

  const handleShameRitual = () => {
    if (companions.length === 0) return;
    gainXpForCompanions(companions.map((companion) => companion.id), "panty");
    if (selectedNpcId) {
      adjustNpcShame(selectedNpcId, 15);
    }
    incrementCounter('pantiesSniffed', 1);
    setRecent(
      `Panty shame ritual sealed · ${new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date())}`
    );
  };

  return (
    <QuestLayout>
      <div className="space-y-6 rounded-3xl border border-rose-400/30 bg-[#1a031a]/80 p-6 shadow-[0_0_40px_rgba(236,72,153,0.35)]">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">Panty Realm 🔮</h1>
          <p className="text-sm text-rose-200/80">
            Channel ritual shame to empower companions. Each shame sealing grants +30 XP to the bonded roster.
          </p>
        </header>

        <div className="space-y-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 text-sm text-rose-100">
          <p>
            Summon the shame altar, kneel, and whisper the obedience vow. When you select the seal below, every
            companion absorbs the humiliation surge.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-rose-200/80">
            <span>Shame Offering Target</span>
            <label htmlFor="npc-shame-target" className="sr-only">Shame Offering Target</label>
            <select
              id="npc-shame-target"
              value={selectedNpcId}
              onChange={(event) => setSelectedNpcId(event.target.value)}
              className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-100 focus:border-rose-300 focus:outline-none"
            >
              <option value="">No NPC Selected</option>
              {npcs.map((npc) => (
                <option key={npc.id} value={npc.id}>
                  {npc.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleShameRitual}
            disabled={companions.length === 0}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a031a] ${
              companions.length === 0
                ? "cursor-not-allowed border border-rose-300/30 bg-rose-500/10 text-rose-200/50"
                : "border border-rose-400/60 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
            }`}
          >
            Seal Shame Ritual
          </button>
          <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">
            {companions.length === 0
              ? "No companions available — forge allies in the Companion Nexus."
              : recent ?? "Awaiting your next surrender."}
          </p>
        </div>
      </div>
    </QuestLayout>
  );
}
