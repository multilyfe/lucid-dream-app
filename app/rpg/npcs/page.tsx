"use client";

import { useMemo, useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { useNpcs } from "../../hooks/useNpcs";
import { useHydrated } from "../../hooks/useHydrated";
import NpcCard from "../../components/NpcCard";
import NpcDetail from "../../components/NpcDetail";

export default function NpcsPage() {
  const hydrated = useHydrated();
  const {
    npcs,
    addNpc,
    updateNpc,
    adjustTrust,
    adjustShame,
    addDialogue,
  } = useNpcs();

  const [newNpcName, setNewNpcName] = useState("");
  const [newNpcRole, setNewNpcRole] = useState("Friend");
  const [selectedId, setSelectedId] = useState<string | null>(npcs[0]?.id ?? null);

  const selectedNpc = useMemo(() => {
    if (!selectedId) return npcs[0];
    return npcs.find((npc) => npc.id === selectedId) ?? npcs[0];
  }, [npcs, selectedId]);

  if (!hydrated) {
    return (
      <QuestLayout>
        <div className="p-6" />
      </QuestLayout>
    );
  }

  const handleAddNpc = () => {
    const name = newNpcName.trim();
    if (!name) return;
    const id = `npc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    addNpc({
      id,
      name,
      role: newNpcRole,
      dreamCount: 0,
      trust: 30,
      shame: 10,
      bio: '',
      dialogues: [],
    });
    setSelectedId(id);
    setNewNpcName('');
  };

  return (
    <QuestLayout>
      <div className="space-y-8 bg-[url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=60')] bg-fixed bg-cover bg-center p-6">
        <header className="rounded-3xl border border-purple-500/30 bg-slate-950/80 p-6 shadow-[0_0_45px_rgba(168,85,247,0.25)] backdrop-blur">
          <h1 className="text-3xl font-semibold text-white">🫂 NPC Relationships</h1>
          <p className="mt-2 text-sm text-slate-300">
            Track trust, shame, and dream history for every ally and mistress haunting your lucid journeys.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <input
              placeholder="Add new NPC (name)"
              value={newNpcName}
              onChange={(event) => setNewNpcName(event.target.value)}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
            />
            <select
              value={newNpcRole}
              onChange={(event) => setNewNpcRole(event.target.value)}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none"
            >
              <option value="Mistress">Mistress</option>
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Waifu">Waifu</option>
              <option value="Mentor">Mentor</option>
              <option value="Other">Other</option>
            </select>
            <button
              type="button"
              onClick={handleAddNpc}
              className="rounded-full border border-fuchsia-500/60 bg-fuchsia-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100 hover:bg-fuchsia-500/30"
            >
              Add NPC
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            {npcs.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-purple-500/40 bg-slate-950/70 px-4 py-10 text-center text-sm uppercase tracking-[0.3em] text-slate-400">
                No NPCs logged yet. Add companions, family, or mistresses to start tracking.
              </p>
            ) : (
              <div className="grid gap-4">
                {npcs.map((npc) => (
                  <NpcCard
                    key={npc.id}
                    name={npc.name}
                    role={npc.role}
                    dreamCount={npc.dreamCount}
                    trust={npc.trust}
                    shame={npc.shame}
                    onSelect={() => setSelectedId(npc.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedNpc ? (
            <NpcDetail
              npc={selectedNpc}
              onAddDialogue={(text) => addDialogue(selectedNpc.id, text)}
              onAdjustTrust={(delta) => adjustTrust(selectedNpc.id, delta)}
              onAdjustShame={(delta) => adjustShame(selectedNpc.id, delta)}
            />
          ) : null}
        </section>
      </div>
    </QuestLayout>
  );
}
