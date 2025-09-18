import defaultNpcs from "../../data/npcs.json";

export type DialogueEntry = {
  id: string;
  text: string;
  date: string;
};

export type NpcRole = "Mistress" | "Family" | "Friend" | "Waifu" | "Mentor" | string;

export type Npc = {
  id: string;
  name: string;
  role: NpcRole;
  dreamCount: number;
  trust: number;
  shame: number;
  bio?: string;
  dialogues: DialogueEntry[];
};

const DEFAULT_NPCS: Npc[] = (defaultNpcs as Npc[]).map((npc) => normaliseNpc(npc));

export function normaliseDialogue(entry: DialogueEntry): DialogueEntry {
  return {
    ...entry,
    id: entry.id,
    text: entry.text ?? "",
    date: entry.date ?? new Date().toISOString(),
  };
}

export function normaliseNpc(npc: Npc): Npc {
  return {
    id: npc.id,
    name: npc.name || "Unnamed NPC",
    role: npc.role || "Friend",
    dreamCount: Math.max(0, Number(npc.dreamCount ?? 0)),
    trust: clampMeter(npc.trust),
    shame: clampMeter(npc.shame),
    bio: npc.bio ?? "",
    dialogues: Array.isArray(npc.dialogues)
      ? npc.dialogues.map((dialogue) => normaliseDialogue(dialogue))
      : [],
  };
}

export function cloneDefaultNpcs(): Npc[] {
  return DEFAULT_NPCS.map((npc) => normaliseNpc({ ...npc }));
}

export function clampMeter(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
