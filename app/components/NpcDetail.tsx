'use client';

import { useState } from "react";
import RelationshipMeter from "./RelationshipMeter";
import type { Npc } from "../lib/npcs";

type NpcDetailProps = {
  npc: Npc;
  onAddDialogue: (text: string) => void;
  onAdjustTrust: (delta: number) => void;
  onAdjustShame: (delta: number) => void;
};

export function NpcDetail({ npc, onAddDialogue, onAdjustTrust, onAdjustShame }: NpcDetailProps) {
  const [dialogueText, setDialogueText] = useState("");

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_45px_rgba(148,163,184,0.25)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">Relationship Detail</p>
          <h2 className="text-2xl font-semibold text-white">{npc.name}</h2>
          {npc.bio ? (
            <p className="mt-1 text-sm text-slate-300/80">{npc.bio}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-slate-200">
          <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1">
            Role · {npc.role}
          </span>
          <span className="rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1">
            Dreams · {npc.dreamCount}
          </span>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <RelationshipMeter trust={npc.trust} shame={npc.shame} />
        <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-slate-200">
          <button
            type="button"
            onClick={() => onAdjustTrust(5)}
            className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-100 hover:bg-emerald-500/30"
          >
            +5 Trust
          </button>
          <button
            type="button"
            onClick={() => onAdjustTrust(-5)}
            className="rounded-full border border-emerald-400/40 bg-slate-900/60 px-3 py-1 font-semibold text-emerald-200/80 hover:bg-slate-800/70"
          >
            -5 Trust
          </button>
          <button
            type="button"
            onClick={() => onAdjustShame(5)}
            className="rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1 font-semibold text-rose-100 hover:bg-rose-500/30"
          >
            +5 Shame
          </button>
          <button
            type="button"
            onClick={() => onAdjustShame(-5)}
            className="rounded-full border border-rose-400/40 bg-slate-900/60 px-3 py-1 font-semibold text-rose-200/80 hover:bg-slate-800/70"
          >
            -5 Shame
          </button>
        </div>
      </div>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Dialogue Log</h3>
        </header>
        <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
          {npc.dialogues.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/60 px-4 py-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
              No dialogues logged yet.
            </p>
          ) : (
            npc.dialogues
              .slice()
              .reverse()
              .map((entry) => (
                <article
                  key={entry.id}
                  className="space-y-2 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-500/10 p-4 text-sm text-amber-100"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80">
                    {new Date(entry.date).toLocaleString()}
                  </div>
                  <p className="leading-relaxed text-amber-50">{entry.text}</p>
                </article>
              ))
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <textarea
            value={dialogueText}
            onChange={(event) => setDialogueText(event.target.value)}
            placeholder="Log a new conversation..."
            className="min-h-[60px] flex-1 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (!dialogueText.trim()) return;
              onAddDialogue(dialogueText.trim());
              setDialogueText('');
            }}
            className="rounded-full border border-amber-400/60 bg-amber-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100 hover:bg-amber-500/30"
          >
            Add Dialogue (+20 XP)
          </button>
        </div>
      </section>
    </div>
  );
}

export default NpcDetail;
