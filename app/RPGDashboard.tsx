'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dancing_Script } from "next/font/google";
const script = Dancing_Script({ subsets: ["latin"], weight: ["400","700"] });
import DreamCard from "./components/DreamCard";
import { useSearchParams } from "next/navigation";
import { useCompanions, type DetailedCompanion } from "./hooks/useCompanions";
import { type CompanionXpEvent } from "./lib/companions";
import { useNpcs } from "./hooks/useNpcs";

// helpers
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmtDate = (d: any) => new Date(d).toLocaleDateString();
const clamp = (n: any, a=0, b=10) => Math.max(a, Math.min(b, Number(n||0)));

// storage
const STORAGE_KEY = "lucid_rpg_v3";
const loadStore = () => { try { const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): null; } catch { return null; } };
const saveStore = (data: any) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} };

const normalizeTab = (value: string) => {
  const lower = (value || "").toLowerCase();
  const capitalize = (input: string) =>
    input.length ? input.charAt(0).toUpperCase() + input.slice(1) : input;

  switch (lower) {
    case "dashboard":
    case "journal":
    case "analytics":
    case "people":
    case "places":
    case "companions":
    case "settings":
      return capitalize(lower);
    case "rituals":
    case "reality checks":
      return "Rituals";
    case "quests":
      return "Quests";
    case "achievements":
    case "xp":
      return "Achievements";
    default:
      return value;
  }
};

// seed
const SEED = {
  dreams: [
    { id: uid(), title: "Flying Over Mountains", date: new Date("2025-01-08T02:30:00Z").toISOString(), lucidity: 8, clarity: 9, mood: "Euphoric", tags: ["flying","mountains","lucid","nature"], text: "I was soaring through misty mountains with crystalline peaks...", isLucid: true, peopleIds: [], placeIds: [], companionIds: [] },
    { id: uid(), title: "Underwater City", date: "2025-09-18T12:00:00Z", lucidity: 0, clarity: 6, mood: "Curious", tags: ["ocean","city"], text: "Submerged streets and glowing coral lamps.", isLucid: false, peopleIds: [], placeIds: [], companionIds: [] },
  ],
  people: [
    { id: uid(), name: "Bilal", relation: "Family", gender: "Male" },
    { id: uid(), name: "Zinou", relation: "Friend", gender: "Male" },
  ],
  places: [
    { id: uid(), name: "Lucid World" },
    { id: uid(), name: "New York" },
  ],
  companions: [
    { id: uid(), name: "Candy Siren", role: "Sensual Anchor", buffs: ["+10% lucidity onset", "+5 XP on RC"], notes: "Offers lucidity & obedience buffs." },
  ],
  xpLogs: [
    { id: uid(), date: "2025-09-18T10:00:00Z", delta: 50, reason: "Equipped Dream Tool (Watch7)", source: "System" },
  ],
  rc: [{ id: uid(), label: "Nose pinch", enabled: true }, { id: uid(), label: "Read text twice", enabled: true }],
  settings: { theme: "neon", font: "sans", developerMode: false, compactMode: false, kawaiiMode: false, lastBackupAt: null, customizationXpAwarded: false, cloudSyncEnabled: false, cloudSyncAwarded: false, lastSyncAt: null }
};

// panty icon
function PantyIcon({size=36}:{size?:number}){
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(167,139,250,0.45)]">
      <defs>
        <linearGradient id="pantyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa">
            <animate attributeName="stop-color" values="#a78bfa;#f472b6;#60a5fa;#a78bfa" dur="3.2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#60a5fa">
            <animate attributeName="stop-color" values="#60a5fa;#a78bfa;#f472b6;#60a5fa" dur="3.2s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <path d="M3 12c7 6 15 9 21 9s14-3 21-9l1 5c-3 8-8 12-12 12-5 0-8-4-10-4s-5 4-10 4c-4 0-9-4-12-12z" fill="url(#pantyGrad)" stroke="#a78bfa" strokeWidth="1" />
      <circle cx="12" cy="10" r="1">
        <animate attributeName="r" values="0.8;1.4;0.8" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="38" cy="14" r="1">
        <animate attributeName="r" values="0.8;1.4;0.8" dur="2.1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// sparkles (fallback icon for extra vibe)
function SparklesIcon({className="", size=18}:{className?:string; size?:number}){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M11 2l1.8 4.4L17 8l-4.2 1.6L11 14l-1.8-4.4L5 8l4.2-1.6L11 2zm7 6l1 2.5L22 12l-3 1.5L18 16l-1-2.5L14 12l3-1.5L18 8zM5 14l1.2 3L9 18l-2.8 1L5 22l-1.2-3L1 18l2.8-1L5 14z"/>
    </svg>
  );
}

const Chip = ({children}:{children: React.ReactNode}) => (
  <span className="tag-chip mr-1 mb-1 inline-block">{children}</span>
);
const SectionTitle = ({icon, title, right}:{icon: React.ReactNode, title: string, right?: React.ReactNode}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <h3 className={["text-lg font-semibold", script.className].join(" ")}>{title}</h3>
    </div>
    <div>{right}</div>
  </div>
);

function HeaderBar({q, setQ, store, setStore}:{q:string; setQ:(v:string)=>void; store:any; setStore:(s:any)=>void}){
  return (
    <header className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-3xl bg-pink-300/40 border border-pink-300/60 flex items-center justify-center shadow-md glow"><PantyIcon size={28}/></div>
        <div>
          <h1 className={["text-2xl font-bold tracking-tight", script.className].join(" ")}>Lucid Dream Temple RPG</h1>
          <p className="text-xs opacity-80">Journal • Analytics • People • Places • Companions • XP</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search dreams, tags..." className="text-sm w-64" />
        <ExportImport store={store} setStore={setStore} />
      </div>
    </header>
  );
}

type RPGDashboardProps = {
  forcedTab?: string;
};

export default function RPGDashboard({ forcedTab }: RPGDashboardProps) {
  const [store, setStore] = useState<any>(SEED);
  const [mounted, setMounted] = useState(false);
  const normalizedForced = forcedTab ? normalizeTab(forcedTab) : undefined;
  const [tab, setTab] = useState(normalizedForced ?? "Dashboard");
  const [q, setQ] = useState("");
  const search = useSearchParams();

  useEffect(() => { 
    setMounted(true);
    const s = loadStore(); 
    if (s) setStore(s); 
  }, []);
  useEffect(() => { 
    if (mounted) {
      saveStore(store); 
    }
  }, [store, mounted]);
  useEffect(() => {
    if (normalizedForced) {
      setTab(normalizedForced);
    } else {
      // Initialize tab from URL (?tab=...)
      const t = search?.get("tab");
      if (t) setTab(normalizeTab(t));
    }
    // Initialize q from URL (?q=...)
    const qq = search?.get("q");
    if (qq) setQ(qq);
  }, [normalizedForced, search]);

  const add = (key: string, item: any) => setStore((s: any) => ({...s, [key]: [item, ...(s[key]||[])]}));
  const remove = (key: string, id: string) => setStore((s: any) => ({...s, [key]: (s[key]||[]).filter((x: any)=>x.id!==id)}));
  const update = (key: string, id: string, patch: any) => setStore((s:any)=>({...s,[key]:s[key].map((x:any)=>x.id===id?{...x,...patch}:x)}));
  const { companions, gainXpForCompanions } = useCompanions();

  const xpTotal = useMemo(() => store.xpLogs.reduce((a:number,b:any)=>a+Number(b.delta||0),0), [store.xpLogs]);
  const dreamsLucid = store.dreams.filter((d:any)=>d.isLucid).length;

  // Apply theme to <html>/<body> via data-theme and clean stale classes
  useEffect(() => {
    if (!mounted) return; // Only run on client after hydration
    
    const normalize = (t:string) => {
      const v = (t||'').toLowerCase();
      if (v.startsWith('dark')) return 'dark';
      if (v.startsWith('neon')) return 'neon';
      if (v.startsWith('pink')) return 'pink';
      if (v.startsWith('peach') || v.includes('lucid')) return 'peach';
      if (v.startsWith('vapor') || v.includes('vaporwave')) return 'vaporwave';
      if (v.startsWith('candy')) return 'candy';
      return 'peach';
    };
  const theme = normalize(store?.settings?.theme || 'neon');
    const root = document.documentElement;
    const body = document.body;
    ['dark','light','theme-dark','theme-neon','theme-pink','theme-peach','theme-vaporwave','theme-candy'].forEach(c => { root.classList.remove(c); body.classList.remove(c); });
    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);
    // Kawaii surface flag for cards
    const kawaii = !!(store?.settings?.kawaiiMode);
    body.setAttribute('data-kawaii', kawaii ? 'on' : 'off');
    // Card brightness mode
    const bright = (store?.settings?.brightness || 'bright').toLowerCase();
    body.setAttribute('data-brightness', bright === 'low' ? 'low' : 'bright');
    // Auto-dim bright themes flag (persisted separately)
    try {
      const autoDim = (localStorage.getItem('autoDimBrightThemes') || 'off').toLowerCase();
      root.setAttribute('data-auto-dim', (autoDim === 'on' || autoDim === 'true') ? 'on' : 'off');
      body.setAttribute('data-auto-dim', (autoDim === 'on' || autoDim === 'true') ? 'on' : 'off');
    } catch {}
    try { localStorage.setItem('lucid_brightness', bright); } catch {}
    try { localStorage.setItem('lucid_theme', theme); localStorage.removeItem('theme'); } catch {}
  }, [store?.settings?.theme, store?.settings?.kawaiiMode, store?.settings?.brightness, mounted]);

  const compact = store?.settings?.compactMode ? 'p-2 md:p-4' : 'p-3 md:p-6';

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">🌙 Lucid Dream Temple</div>
          <div className="text-sm opacity-60">Loading your dream realm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={["min-h-screen", compact].join(' ')}>
      <HeaderBar q={q} setQ={setQ} store={store} setStore={setStore} />

      <main className="max-w-6xl mx-auto space-y-6">
        {tab==="Dashboard" && <Dashboard store={store} xpTotal={xpTotal} dreamsLucid={dreamsLucid} />}
        {tab==="Journal" && (
          <Journal
            q={q}
            store={store}
            add={add}
            update={update}
            remove={remove}
            setStore={setStore}
            companions={companions}
            gainCompanionXp={gainXpForCompanions}
          />
        )}
        {tab==="Analytics" && <Analytics store={store} />}
        {["Rituals", "Quests", "Reality Checks"].includes(tab) && (
          <RealityChecks store={store} add={add} update={update} remove={remove} />
        )}
        {tab==="People" && <People store={store} add={add} update={update} remove={remove} setStore={setStore} />}
        {tab==="Places" && <Places store={store} add={add} update={update} remove={remove} setStore={setStore} />}
        {tab==="Companions" && <Companions store={store} add={add} remove={remove} />}
        {["Achievements", "XP"].includes(tab) && (
          <XP store={store} add={add} remove={remove} xpTotal={xpTotal} />
        )}
        {tab==="Settings" && <Settings store={store} setStore={setStore} />}
      </main>
    </div>
  );
}

function Dashboard({store, xpTotal, dreamsLucid}:{store:any; xpTotal:number; dreamsLucid:number}){
  const cards = [
    {label:"Dreams", value: store.dreams.length, sub:"entries"},
    {label:"Lucid", value: dreamsLucid, sub:"dreams"},
    {label:"People", value: store.people.length},
    {label:"Places", value: store.places.length},
    {label:"Companions", value: store.companions.length},
    {label:"XP", value: xpTotal, sub:"total"},
  ];
  const recent = [...store.dreams].sort((a:any,b:any)=>+new Date(b.date)-+new Date(a.date)).slice(0,4);
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {cards.map(c=> (
          <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy" key={c.label}>
            <div className="text-sm opacity-70">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
            {c.sub && <div className="text-xs opacity-60">{c.sub}</div>}
          </DreamCard>
        ))}
      </div>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="vaporwave">
        <SectionTitle icon="📝" title="Recent Dreams" />
        <div className="grid md:grid-cols-2 gap-3">
          {recent.map((d:any) => (
            <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy" key={d.id}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{d.title}</h2>
                <div className="text-xs opacity-80">{fmtDate(d.date)}</div>
              </div>
              <div className="text-xs opacity-80 mt-1">L:{d.lucidity}/10 · C:{d.clarity}/10 · {d.mood}</div>
              <p className="text-sm mt-2">{d.text}</p>
              <div className="mt-2">{(d.tags||[]).map((t:string) => <Chip key={t}>#{t}</Chip>)}</div>
            </DreamCard>
          ))}
        </div>
      </DreamCard>
    </>
  );
}

function Journal({
  q,
  store,
  add,
  update,
  remove,
  setStore,
  companions,
  gainCompanionXp,
}:{
  q: string;
  store: any;
  add: (k: string, i: any) => void;
  update: (k: string, id: string, patch: any) => void;
  remove: (k: string, id: string) => void;
  setStore: (s: any) => void;
  companions: any[];
  gainCompanionXp: (ids: string[], event: CompanionXpEvent) => void;
}) {
  const [showWizard, setShowWizard] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().slice(0,16),
    // Lucidity metrics (0–10)
    lucidity: 0,
    control: 5,
    memory: 5,
    vividness: 5,
    emotionalDepth: 5,
    // Other fields
    clarity: 5,
    mood: 0.5,
    isLucid: false,
    tags: "",
    text: "",
    notes: "",
  });
  const [wizardTab, setWizardTab] = useState("Dream");
  const { npcs, ensureNpcByName, incrementDreamCount: incrementNpcDreamCount } = useNpcs();

  // Dream Type — categorized tags with tooltips
  const DREAM_TAGS: Record<string, { key: string; icon: string; hint: string }[]> = {
    NSFW: [
      { key: "Sex/Wet", icon: "💦", hint: "Dream had sexual tension, arousal, or wet sensations" },
      { key: "Shame Trap", icon: "🩸", hint: "You got stuck in sexual tension, embarrassment, or dirty loops" },
    ],
    Emotional: [
      { key: "Emotional Burst", icon: "💔", hint: "Overwhelming sadness, love, or crying in dream" },
      { key: "Comfort Dream", icon: "🧸", hint: "Felt safe, protected, or loved" },
      { key: "Dream Death", icon: "🪦", hint: "You or someone else died in the dream" },
    ],
    Magical: [
      { key: "Nightmare", icon: "👻", hint: "Frightening or dark dream experience" },
      { key: "Ritual Dream", icon: "🕯", hint: "Spiritual or magical ritual occurred" },
      { key: "Lucid Loop", icon: "🌀", hint: "Woke up, re-entered dream repeatedly" },
      { key: "Parallel Reality", icon: "🧬", hint: "Alternate life, timeline, or version of self" },
    ],
  };
  const [dreamTags, setDreamTags] = useState<string[]>([]);
  const [dreamTab, setDreamTab] = useState<keyof typeof DREAM_TAGS>("NSFW");
  const [touchTip, setTouchTip] = useState<string | null>(null);
  const toggleDreamTag = (tag: string) =>
    setDreamTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  const longPress = (key: string) => {
    setTouchTip(key);
    setTimeout(() => setTouchTip((curr) => (curr === key ? null : curr)), 900);
  };

  const symbolPreset = useMemo(()=> ({
    Characters: ["Bilal","Mama","Papa","Iman","Kenna","Kawtar","Zinou"],
    Places: ["Lucid World","New York","Staten Island","Queens","USA","TV Universe","Game Universe"],
    Objects: ["Panties","Car","Phone"],
    Emotions: ["Happy","Scared","Euphoric","Anxious","Submissive"],
    Other: ["Action","Adventure","Feet","Fetish","WBTB","WILD","Study"]
  }),[]);
  const [symbols, setSymbols] = useState<any>({Characters:new Set(), Places:new Set(), Objects:new Set(), Emotions:new Set(), Other:new Set()});

  const addSymbol = (group: string, label: string)=> setSymbols((s:any)=>{ const n=new Set(s[group]); n.add(label); return {...s,[group]:n};});
  const removeSymbol = (group: string, label: string)=> setSymbols((s:any)=>{ const n=new Set(s[group]); n.delete(label); return {...s,[group]:n};});

  const submit = (e?: any) => { e?.preventDefault?.();
    const dream = {
      id: uid(),
      title: form.title||"Untitled Dream",
      date: new Date(form.date||Date.now()).toISOString(),
      // store lucidity as 0–10 integer
      lucidity: clamp(form.lucidity),
      clarity: clamp(form.clarity),
      mood: moodWord(form.mood),
      isLucid: !!form.isLucid,
      tags: Array.from(new Set([...(collectTags(symbols, form.tags) as any[]), ...dreamTags])),
      text: form.text||form.notes,
      peopleIds: [], placeIds: [], companionIds: [],
      meta:{
        ...(form.isLucid ? { lucid: {
          control: clamp(form.control),
          memory: clamp(form.memory),
          vividness: clamp(form.vividness),
          emotionalDepth: clamp(form.emotionalDepth),
        }} : {}),
      }
    };
    if (editingId) {
      update("dreams", editingId, { ...dream, id: editingId });
    } else {
      add("dreams", dream);
    }

    if (!editingId) {
      const referencedNpcIds = new Set<string>();
      Array.from(symbols.Characters as Set<string>).forEach((label) => {
        if (!label) return;
        const npc = ensureNpcByName(label);
        referencedNpcIds.add(npc.id);
      });

      const lowerText = (dream.text ?? '').toLowerCase();
      const tagSet = (dream.tags ?? []).map((tag: string) => tag.toLowerCase());
      npcs.forEach((npc) => {
        const lowerName = npc.name.toLowerCase();
        if (lowerText.includes(lowerName) || tagSet.includes(lowerName)) {
          referencedNpcIds.add(npc.id);
        }
      });

      referencedNpcIds.forEach((npcId) => incrementNpcDreamCount(npcId, 1));
    }

    const matchingCompanions = companions.filter((companion) => {
      const needle = companion.name.toLowerCase();
      const inText = (dream.text ?? "").toLowerCase().includes(needle);
      const inTags = (dream.tags ?? []).some((tag: string) => tag.toLowerCase() === needle);
      return inText || inTags;
    });
    if (matchingCompanions.length > 0) {
      gainCompanionXp(matchingCompanions.map((companion) => companion.id), "dream");
    }
    setShowWizard(false);
    setEditingId(null);
    setForm({
      title: "",
      date: new Date().toISOString().slice(0,16),
      lucidity: 0,
      control: 5,
      memory: 5,
      vividness: 5,
      emotionalDepth: 5,
      clarity: 5,
      mood: 0.5,
      isLucid: false,
      tags: "",
      text: "",
      notes: "",
    });
    setSymbols({Characters:new Set(), Places:new Set(), Objects:new Set(), Emotions:new Set(), Other:new Set()});
    setDreamTags([]);
  };

  const list = useMemo(()=> store.dreams.filter((d:any) => (q? ((d.title+" "+d.text+" "+(d.tags||[]).join(" ")).toLowerCase().includes(q.toLowerCase())): true)), [store.dreams, q]);

  const startEditDream = (d:any) => {
    setShowWizard(true);
    setEditingId(d.id);
    const dateLocal = new Date(d.date? d.date: Date.now());
    const localStr = new Date(dateLocal.getTime()-dateLocal.getTimezoneOffset()*60000).toISOString().slice(0,16);
    const lucidMeta = (d.meta && (d.meta as any).lucid) || {};
    // Pre-fill dream type tags
    const dreamTypeKeys = new Set(Object.values(DREAM_TAGS).flat().map((x:any)=>x.key));
    const incomingTags: string[] = d.tags || [];
    const preDreamTags = incomingTags.filter((t:any)=>dreamTypeKeys.has(t));
    setDreamTags(preDreamTags);
    // Prefill symbols from preset
    const newSyms:any = {Characters:new Set(), Places:new Set(), Objects:new Set(), Emotions:new Set(), Other:new Set()};
    Object.keys(symbolPreset).forEach((g:any)=>{
      (symbolPreset as any)[g].forEach((lbl:string)=>{ if (incomingTags.includes(lbl)) (newSyms as any)[g].add(lbl); });
    });
    setSymbols(newSyms);
    // Freeform tags are the rest not in preset or dream types
    const presetKeys = new Set(Object.values(symbolPreset).flat());
    const free = incomingTags.filter((t:any)=>!presetKeys.has(t) && !dreamTypeKeys.has(t));
    setForm({
      ...form,
      title: d.title||"",
      date: localStr,
      lucidity: clamp(d.lucidity||0),
      control: clamp(lucidMeta.control??5),
      memory: clamp(lucidMeta.memory??5),
      vividness: clamp(lucidMeta.vividness??5),
      emotionalDepth: clamp(lucidMeta.emotionalDepth??5),
      clarity: clamp(d.clarity??5),
      mood: 0.5,
      isLucid: !!d.isLucid,
      tags: free.join(", "),
      text: d.text||"",
      notes: (d.meta?.notes)||"",
    });
    setWizardTab("Dream");
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="vaporwave">
        <SectionTitle icon={<SparklesIcon className="text-pink-500 animate-pulse drop-shadow" />} title="New Dream" right={<button onClick={()=>setShowWizard(true)} className="btn btn-primary flex items-center gap-2">Open Wizard <SparklesIcon className="text-white/90" size={16}/></button>} />
        {!showWizard && (
          <form onSubmit={submit} className="grid gap-2 text-sm">
            <input className="rounded-3xl px-3 py-2 placeholder:text-fuchsia-700/70" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <textarea rows={5} className="rounded-3xl px-3 py-2 placeholder:text-fuchsia-700/70" placeholder="Describe the dream..." value={form.text} onChange={e=>setForm({...form,text:e.target.value})} />
            <button className="justify-self-start btn btn-primary">Quick Save</button>
          </form>
        )}
        {showWizard && (<div className="space-y-3">
          <div className="flex gap-2">{"Dream,Details,Symbols".split(",").map(t=>
            <button key={t} onClick={()=>setWizardTab(t)} className={`rounded-3xl px-3 py-2 text-sm border ${wizardTab===t?"bg-pink-500 text-white border-pink-500":"bg-pink-300/40 border-pink-300/60"}`}>{t}</button>)}
          </div>
          {wizardTab==="Dream" && (<div className="grid gap-2 text-sm">
            <input className="rounded-3xl px-3 py-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <textarea rows={8} className="rounded-3xl px-3 py-2" placeholder="What did you dream about?" value={form.text} onChange={e=>setForm({...form,text:e.target.value})} />
          </div>)}
          {wizardTab==="Details" && (<div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <input type="datetime-local" className="rounded-3xl px-3 py-2" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
              <label className="flex items-center gap-2 rounded-3xl px-3 py-2">
                <input type="checkbox" checked={form.isLucid} onChange={e=>setForm({...form,isLucid:e.target.checked})}/>
                Lucid
              </label>
            </div>
            {form.isLucid && (
              <div className="grid gap-2">
                <Dial label="Lucidity Level" value={form.lucidity} onChange={(v:number)=>setForm({...form,lucidity:v})} />
                <Dial label="Control" value={form.control} onChange={(v:number)=>setForm({...form,control:v})} />
                <Dial label="Memory" value={form.memory} onChange={(v:number)=>setForm({...form,memory:v})} />
                <Dial label="Vividness" value={form.vividness} onChange={(v:number)=>setForm({...form,vividness:v})} />
                <Dial label="Emotional Depth" value={form.emotionalDepth} onChange={(v:number)=>setForm({...form,emotionalDepth:v})} />
              </div>
            )}
            <MoodPicker initial={Math.round((form.mood??0.5)*100)} onChange={(pct:number)=>setForm({...form,mood: pct/100})} />

            {/* Dream Type — tabs + grid */}
            <section className="mt-1 bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-4 backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-fuchsia-800">🟣 Dream Type</h4>
                <div className="flex items-center gap-2">
                  {dreamTags.length > 0 && (
                    <div className="text-xs text-fuchsia-700/80 truncate max-w-[44ch]">{dreamTags.join(" • ")}</div>
                  )}
                  {dreamTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDreamTags([])}
                    className="text-xs px-2 py-1 rounded-3xl bg-pink-300/40 border border-pink-300/60 hover:bg-pink-400/50"
                  >
                    Clear all
                  </button>
                )}
                {DREAM_TAGS[dreamTab].some(({key})=>dreamTags.includes(key)) && (
                  <button
                    type="button"
                    onClick={() => setDreamTags(prev => prev.filter(t => !DREAM_TAGS[dreamTab].some(x => x.key === t)))}
                    className="text-xs px-2 py-1 rounded-3xl bg-pink-300/40 border border-pink-300/60 hover:bg-pink-400/50"
                  >
                    Clear tab
                  </button>
                )}
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-3 flex gap-2">
                {(["NSFW","Emotional","Magical"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDreamTab(t)}
                    className={`rounded-3xl px-3 py-1.5 text-xs border transition-colors ${
                      dreamTab===t
                        ? "bg-pink-500 text-white border-pink-500 animate-pulse"
                        : "bg-pink-300/40 border-pink-300/60 hover:bg-pink-400/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Tag grid for active tab */}
              <div className="grid grid-cols-2 gap-3">
                {DREAM_TAGS[dreamTab].map(({ key, icon, hint }) => {
                  const selected = dreamTags.includes(key);
                  const showTip = touchTip === key;
                  return (
                    <div key={key} className="relative group">
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleDreamTag(key)}
                        onTouchStart={() => longPress(key)}
                      className={[
                          "w-full rounded-3xl border px-4 py-5 flex flex-col items-center justify-center transition-colors duration-150",
                          selected
                            ? "bg-pink-500 text-white border-pink-500 animate-pulse ring-2 ring-pink-400/30 shadow-[0_0_20px_rgba(244,114,182,.45)]"
                            : "bg-pink-300/40 border-pink-300/60 hover:bg-pink-400/50",
                        ].join(" ")}
                      >
                        <div className="text-2xl leading-none">{icon}</div>
                        <div className="mt-2 text-xs text-center" style={{color:'var(--nav-text)'}}>{key}</div>
                      </button>
                      {/* Tooltip: hover (desktop) or long-press (mobile) */}
                      <div
                        className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-3xl bg-[var(--surface)] text-[11px] text-[var(--nav-text)] px-2 py-1 border border-[var(--surface-border)] shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${showTip?"opacity-100":""}`}
                      >
                        {hint}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <textarea rows={4} className="rounded-3xl px-3 py-2" placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
          </div>)}
          {wizardTab==="Symbols" && (
            <SymbolsBoard
              symbols={symbols}
              addSymbol={addSymbol}
              removeSymbol={removeSymbol}
              preset={symbolPreset}
              content={{ title: form.title, notes: form.notes, description: form.text }}
              kawaiiMode={store?.settings?.kawaiiMode}
              store={store}
            />
          )}
          <div className="flex items-center justify-between">
            <button onClick={()=>setShowWizard(false)} className="rounded-3xl px-4 py-2 bg-pink-300/40 border border-pink-300/60 hover:bg-pink-400/50">Close</button>
            <button onClick={submit} className="btn btn-primary">Save Dream</button>
          </div>
        </div>)}
      </DreamCard>

      <div className="space-y-3">
        {list.length===0 && <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">No dreams yet.</DreamCard>}
        {list.map((d:any) => (
          <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy" key={d.id}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-lg flex items-center gap-2">
                {d.title}
                {d.isLucid && <span className="tag-chip">Lucid</span>}
              </div>
              <div className="text-xs opacity-70">{fmtDate(d.date)}</div>
            </div>
            <div className="text-xs opacity-70 mt-1">L:{d.lucidity}/10 · C:{d.clarity}/10 · {d.mood}</div>
            <p className="mt-2 text-sm opacity-90">{d.text}</p>
            <div className="mt-2">{(d.tags||[]).map((t:string) => <Chip key={t}>#{t}</Chip>)}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={()=>startEditDream(d)} className="text-xs btn btn-primary px-3 py-1">Edit</button>
              <button onClick={()=>remove("dreams", d.id)} className="text-xs btn btn-danger px-3 py-1">Delete</button>
            </div>
          </DreamCard>
        ))}
      </div>
    </div>
  );
}

function moodWord(v:number){ return v<0.33?"Negative": v<0.66?"Neutral":"Positive"; }
function collectTags(symbols:any, free:string){
  const sets = Object.values(symbols).map((s:any)=>[...s as any[]]);
  return [...new Set([...(free||"").split(",").map(t=>t.trim()).filter(Boolean), ...sets.flat()])];
}

function Dial({label, value, onChange}:{label:string; value:number; onChange:(v:number)=>void}){
  const gradient = "linear-gradient(90deg, #ef4444 0%, #f97316 20%, #f59e0b 35%, #22c55e 65%, #3b82f6 100%)";
  const sub = (() => {
    const v = Number(value);
    const name = label.toLowerCase();
    const inRange = (a:number,b:number)=> v>=a && v<=b;
    if (name.includes("lucid")) {
      if (inRange(0,2)) return "😴 Asleep";
      if (inRange(3,4)) return "🌫️ Hazy";
      if (inRange(5,6)) return "🌀 Aware";
      if (inRange(7,8)) return "🌟 Clear";
      return "🌈 Fully Lucid";
    }
    if (name.includes("control")) {
      if (inRange(0,2)) return "🎲 Random";
      if (inRange(3,4)) return "🪄 Slight Influence";
      if (inRange(5,6)) return "🤲 Guiding";
      if (inRange(7,8)) return "🧠 Manifesting";
      return "🕹️ Total Control";
    }
    if (name.includes("memory")) {
      if (inRange(0,2)) return "❓ Fuzzy";
      if (inRange(3,4)) return "💭 Fragments";
      if (inRange(5,6)) return "📘 Some Details";
      if (inRange(7,8)) return "🧠 Strong";
      return "🧾 Perfect Recall";
    }
    if (name.includes("vivid")) {
      if (inRange(0,2)) return "🌫️ Blurry";
      if (inRange(3,4)) return "✨ Dim";
      if (inRange(5,6)) return "🌆 Visual";
      if (inRange(7,8)) return "🎨 Rich";
      return "🌈 Ultra HD";
    }
    if (name.includes("emotional") || name.includes("depth")) {
      if (inRange(0,2)) return "😐 Flat";
      if (inRange(3,4)) return "💧 Touched";
      if (inRange(5,6)) return "❤️ Heartfelt";
      if (inRange(7,8)) return "🧠 Deep";
      return "🕊️ Transcendent";
    }
    return "";
  })();

  return (
    <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm" style={{color:'var(--nav-text)'}}>{label}</div>
        <div className="text-sm font-semibold" style={{color:'var(--nav-text)'}}>{value}/10</div>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={e=>onChange(Number((e.target as HTMLInputElement).value))}
        className="w-full appearance-none h-3 rounded-full outline-none"
        style={{ backgroundImage: gradient }}
      />
      {sub && <div className="mt-2 text-center text-sm font-medium" style={{color:'var(--nav-text)'}}>{sub}</div>}
      <style jsx>{`
        input[type="range"]::-webkit-slider-runnable-track{height:12px;background:transparent;border-radius:9999px}
        input[type="range"]::-moz-range-track{height:12px;background:transparent;border-radius:9999px}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;height:20px;width:20px;margin-top:-4px;border-radius:9999px;background:#fff;border:2px solid var(--focus-border);box-shadow:0 0 0 4px var(--focus-ring) inset;cursor:pointer}
        input[type="range"]::-moz-range-thumb{height:20px;width:20px;border-radius:9999px;background:#fff;border:2px solid var(--focus-border);box-shadow:0 0 0 4px var(--focus-ring) inset;cursor:pointer}
        input[type="range"]::-moz-range-progress{background:transparent}
      `}</style>
    </div>
  );
}

function MoodPicker({initial=50, onChange}:{initial?:number; onChange?:(pct:number)=>void}){
  const [mood, setMood] = useState(initial);
  useEffect(()=>{ onChange?.(mood); }, [mood]);
  const gradient = "linear-gradient(90deg, #ef4444 0%, #f97316 20%, #f59e0b 35%, #22c55e 65%, #3b82f6 100%)";
  const moodInfo = useMemo(()=>{
    if (mood < 20) return { emoji: "😱", text: "Overwhelmed", color: "text-rose-300" };
    if (mood < 40) return { emoji: "😞", text: "Sad", color: "text-orange-300" };
    if (mood < 60) return { emoji: "😐", text: "Neutral", color: "text-violet-300" };
    if (mood < 80) return { emoji: "😊", text: "Peaceful", color: "text-green-300" };
    return { emoji: "🥰", text: "Euphoric", color: "text-indigo-200" };
  }, [mood]);
  return (
    <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-4 backdrop-blur">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm" style={{color:'var(--nav-text)'}}>
          Mood
        </div>
        <button type="button" onClick={()=>setMood(50)} className="text-sm" style={{color:'var(--focus-border)'}}>Reset</button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={mood}
        onChange={(e)=>setMood(Number((e.target as HTMLInputElement).value))}
        className="mood-slider w-full appearance-none h-3 rounded-full outline-none"
        style={{ backgroundImage: gradient }}
      />
      <div className="mt-2 text-center text-sm" style={{color:'var(--nav-text)'}}>
        <span className="mr-1">{moodInfo.emoji}</span>
        <span className={`font-medium ${moodInfo.color}`}>{moodInfo.text}</span>
      </div>
      <div className="grid grid-cols-3 text-xs mt-2" style={{color:'var(--nav-text)'}}>
        <div className="text-left">Negative</div>
        <div className="text-center">Neutral</div>
        <div className="text-right">Positive</div>
      </div>
      <style jsx>{`
        .mood-slider::-webkit-slider-runnable-track{height:12px;background:transparent;border-radius:9999px}
        .mood-slider::-moz-range-track{height:12px;background:transparent;border-radius:9999px}
        .mood-slider::-webkit-slider-thumb{-webkit-appearance:none;height:20px;width:20px;margin-top:-4px;border-radius:9999px;background:#fff;border:2px solid var(--focus-border);box-shadow:0 0 0 4px var(--focus-ring) inset;cursor:pointer}
        .mood-slider::-moz-range-thumb{height:20px;width:20px;border-radius:9999px;background:#fff;border:2px solid var(--focus-border);box-shadow:0 0 0 4px var(--focus-ring) inset;cursor:pointer}
        .mood-slider::-moz-range-progress{background:transparent}
      `}</style>
    </div>
  );
}

function Select({label, value, onChange}:{label:string; value:string; onChange:(v:string)=>void}){
  const times = Array.from({length: 24*2}, (_,i)=>{ const h=Math.floor(i/2).toString().padStart(2,'0'); const m=i%2?"30":"00"; return `${h}:${m}`; });
  return (
    <label className="text-sm">
      <div className="mb-1 opacity-80">{label}</div>
      <select value={value} onChange={e=>onChange((e.target as HTMLSelectElement).value)} className="w-full appearance-none rounded-3xl px-4 py-2 shadow">
        {times.map(t=> <option key={t}>{t}</option>)}
      </select>
    </label>
  );
}

function SymbolsBoard({symbols, addSymbol, removeSymbol, preset, content, kawaiiMode, store}:{symbols:any; addSymbol:(g:string,l:string)=>void; removeSymbol:(g:string,l:string)=>void; preset:any; content:{title?:string; notes?:string; description?:string}; kawaiiMode?: boolean; store?: any}){
  const [queries, setQueries] = useState<Record<string,string>>({});
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string>("");

  const toggle = (group:string, label:string) => {
    if (symbols[group]?.has(label)) removeSymbol(group,label); else addSymbol(group,label);
  };

  const clearSection = (group:string) => {
    const vals = [...(symbols[group] || [])];
    vals.forEach((s:string)=> removeSymbol(group, s));
  };

  const iconFor = (g:string) => (g==="Characters"?"👤": g==="Places"?"🏛": g==="Objects"?"📦": g==="Emotions"?"😢": "🧪");

  const handleDetect = async () => {
    const joined = [content?.title, content?.notes, content?.description].filter(Boolean).join(" ").toLowerCase();
    setDetectMsg("Detecting...");
    setDetecting(true);
    await new Promise(r=>setTimeout(r,1000));

    const rawTokens = joined.split(/[^a-z0-9]+/g).filter(Boolean);
    const tokens = Array.from(new Set(rawTokens.filter(t=>t.length>1))).slice(0,200);
    const bigrams: string[] = [];
    for (let i=0;i<Math.min(rawTokens.length-1, 60); i++) { bigrams.push(`${rawTokens[i]} ${rawTokens[i+1]}`); }

    // Light-weight fuzzy matching (Levenshtein similarity) — no external deps
    const sim = (a:string,b:string) => {
      if (!a || !b) return 0;
      const la=a.length, lb=b.length;
      const dp = new Array(lb+1); for (let j=0;j<=lb;j++) dp[j]=j;
      for (let i=1;i<=la;i++){
        let prev = i-1; let cur = i;
        for (let j=1;j<=lb;j++){
          const tmp = dp[j];
          cur = Math.min(
            dp[j]+1,
            dp[j-1]+1,
            prev + (a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1)
          );
          dp[j]=cur; prev=tmp;
        }
        dp[0]=i;
      }
      const dist = dp[lb];
      return 1 - dist / Math.max(la,lb);
    };

    const queries = [...tokens, ...bigrams];
    Object.keys(preset).forEach((group:any)=>{
      const items: string[] = preset[group] || [];
      const itemsLc = items.map(s=>({label:s, lc:s.toLowerCase()}));
      queries.forEach(q=>{
        itemsLc.forEach(it=>{
          if (!q) return;
          if (it.lc.includes(q)) { addSymbol(group, it.label); return; }
          const score = sim(q, it.lc);
          if (score >= 0.7) addSymbol(group, it.label);
        });
      });
    });

    // A few friendly synonyms
    const synonyms: Record<string,string[]> = {
      Mama: ["mama","mom","mother"], Papa: ["papa","dad","father"],
      Panties: ["panties","panty","underwear"], Phone: ["phone","call","text"], Car:["car","vehicle"],
      Happy:["happy","joy","joyful"], Scared:["scared","afraid","fear","terrified"],
      Euphoric:["euphoric","ecstatic"], Anxious:["anxious","anxiety","nervous"], Submissive:["submissive","obedient","sub"],
    };
    Object.entries(synonyms).forEach(([label, keys])=>{
      if (keys.some(k=>joined.includes(k))) {
        const g = Object.keys(preset).find((grp:any)=> (preset[grp]||[]).includes(label));
        if (g) addSymbol(g, label);
      }
    });

    setDetectMsg("✨ Symbols Detected!");
    setDetecting(false);
    setTimeout(()=>setDetectMsg(""),1500);
  };

  const groups = Object.keys(preset);
  return (
    <div className="space-y-3">
      {groups.map((group: any) => {
        const q = (queries[group]||"").trim();
        const lower = q.toLowerCase();
        const suggestions: string[] = (preset[group]||[]).filter((s:string)=>s.toLowerCase().includes(lower));
        const canAdd = q.length>0 && !preset[group]?.some((s:string)=>s.toLowerCase()===lower);
        return (
          <DreamCard kawaiiMode={kawaiiMode} theme="vaporwave" key={group}>
            <SectionTitle
              icon={<span className="text-base">{iconFor(group)}</span>}
              title={group}
              right={
                <button onClick={()=>clearSection(group)} className="text-xs px-2 py-1 rounded-lg bg-pink-300/40 border border-pink-300/60 hover:bg-pink-400/50">
                  Clear All
                </button>
              }
            />

            {/* Selected chips */}
            <div className="flex flex-wrap mb-3">
              {[...symbols[group]].map((s: string) => (
                <button
                  key={s}
                  onClick={()=>toggle(group,s)}
                  className="px-2 py-1 mr-2 mb-2 text-xs rounded-full bg-pink-500/90 hover:bg-pink-500 text-white shadow"
                >{s} ✕</button>
              ))}
              {[...symbols[group]].length===0 && <div className="text-xs opacity-70">No {group.toLowerCase()} selected.</div>}
            </div>

            {/* Search + add */}
            <div className="flex items-center gap-2 mb-2">
              <input
                value={q}
                onChange={e=>setQueries({...queries,[group]: (e.target as HTMLInputElement).value})}
                placeholder={`Search or add ${group.toLowerCase()}...`}
                className="flex-1 px-3 py-2 placeholder:text-fuchsia-700/70"
              />
              {canAdd && (
                <button
                  onClick={()=>{ addSymbol(group,q); setQueries({...queries,[group]:""}); }}
                  className="btn btn-primary text-sm"
                >+ Add '{q}'</button>
              )}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap">
              {(suggestions.length>0? suggestions : (preset[group]||[])).slice(0,50).map((s: string) => {
                const selected = symbols[group]?.has(s);
                return (
                  <button
                    key={s}
                    onClick={()=>toggle(group,s)}
                className={`px-2 py-1 mr-2 mb-2 text-xs rounded-3xl ${selected?"bg-pink-500/90 hover:bg-pink-500 text-white":"bg-[var(--surface)] border border-[var(--surface-border)] hover:brightness-110"}`}
                  >{s}</button>
                );
              })}
            </div>
          </DreamCard>
        );
      })}

      <div className="flex items-center gap-3">
        <button onClick={handleDetect} disabled={detecting} className="btn btn-primary px-4 py-3 disabled:opacity-60">
          {detecting? 'Detecting…' : 'Detect Symbols ✨'}
        </button>
        {detectMsg && <div className="text-xs text-fuchsia-700/80">{detectMsg}</div>}
      </div>
    </div>
  );
}

function Analytics({store}:{store:any}){
  const total = store.dreams.length || 1;
  const lucid = store.dreams.filter((d:any)=>d.isLucid).length;
  const avgLucidity = (store.dreams.reduce((a:number,b:any)=>a+(b.lucidity||0),0)/total).toFixed(1);
  const topTags = Object.entries(store.dreams.flatMap((d:any)=>d.tags||[]).reduce((m:any,t:any)=> (m[t]=(m[t]||0)+1, m),{}))
    .sort((a:any,b:any)=> (b as any)[1]-(a as any)[1]).slice(0,10);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="vaporwave">
        <SectionTitle icon="📊" title="Overview" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Dreams" value={store.dreams.length} />
          <Stat label="Lucid %" value={((lucid/total)*100).toFixed(0)+"%"} />
          <Stat label="Avg Lucidity" value={avgLucidity as any} />
          <Stat label="People seen" value={store.people.length} />
          <Stat label="Places" value={store.places.length} />
          <Stat label="Companions" value={store.companions.length} />
        </div>
      </DreamCard>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="🏷️" title="Top Tags" />
        <div className="flex flex-wrap">
          {(topTags as any).map(([t,c]: any) => <Chip key={t}>{t} × {c as any}</Chip>)}
          {(topTags as any).length===0 && <div className="text-sm opacity-70">No tags yet.</div>}
        </div>
      </DreamCard>
    </div>
  );
}

function RealityChecks({store, add, update, remove}:{store:any; add:(k:string,i:any)=>void; update:(k:string,id:string,patch:any)=>void; remove:(k:string,id:string)=>void}){
  const [label, setLabel] = useState("");
  const toggle = (id: string) => update("rc", id, { enabled: !store.rc.find((r:any)=>r.id===id)?.enabled });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="⏰" title="Add Reality Check" />
        <div className="flex gap-2">
          <input value={label} onChange={e=>setLabel((e.target as HTMLInputElement).value)} placeholder="e.g., Look at hands" className="flex-1 rounded-3xl px-3 py-2 placeholder:text-fuchsia-700/70" />
          <button onClick={()=>{ if(!label.trim()) return; add("rc", {id:uid(), label, enabled:true}); setLabel("");}} className="btn btn-primary">Add</button>
        </div>
      </DreamCard>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="candy">
        <SectionTitle icon="🧪" title="Your RC List" />
        <div className="space-y-2">
          {store.rc.map((r:any) => (
            <div key={r.id} className="flex items-center justify-between bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.enabled} onChange={()=>toggle(r.id)} /> {r.label}
              </label>
              <button onClick={()=>remove("rc", r.id)} className="text-xs btn btn-danger px-3 py-1">Delete</button>
            </div>
          ))}
          {store.rc.length===0 && <div className="text-sm opacity-70">No reality checks yet.</div>}
        </div>
      </DreamCard>
    </div>
  );
}

function People({store, add, update, remove, setStore}:{store:any; add:(k:string,i:any)=>void; update:(k:string,id:string,patch:any)=>void; remove:(k:string,id:string)=>void; setStore:(s:any)=>void}){
  const [f, setF] = useState({name:"", relation:"Friend", gender:"Unknown"});
  const [editId, setEditId] = useState<string|null>(null);
  const [tmp, setTmp] = useState({name:"", relation:"Friend", gender:"Unknown"});
  const existsName = (name:string, ignoreId?:string) => store.people.some((p:any)=>p.id!==ignoreId && p.name.trim().toLowerCase()===name.trim().toLowerCase());
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="🧑" title="Add Person" />
        <div className="grid gap-2 text-sm">
          <input className="rounded-3xl px-3 py-2" placeholder="Name" value={f.name} onChange={e=>setF({...f,name:(e.target as HTMLInputElement).value})}/>
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-3xl px-3 py-2" placeholder="Relation" value={f.relation} onChange={e=>setF({...f,relation:(e.target as HTMLInputElement).value})}/>
            <input className="rounded-3xl px-3 py-2" placeholder="Gender" value={f.gender} onChange={e=>setF({...f,gender:(e.target as HTMLInputElement).value})}/>
          </div>
          <button onClick={()=>{ const n=f.name.trim(); if(!n) return; if(existsName(n)) return; add("people", {id:uid(),...f}); setF({name:"", relation:"Friend", gender:"Unknown"}); }} className="justify-self-start btn btn-primary">Save</button>
        </div>
      </DreamCard>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="candy">
        <SectionTitle icon="📇" title="People" />
        <div className="space-y-2">
          {store.people.map((p:any) => (
            <div key={p.id} className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
              {editId===p.id ? (
                <div className="grid gap-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <input className="rounded-3xl px-2 py-1" value={tmp.name} onChange={e=>setTmp({...tmp,name:(e.target as HTMLInputElement).value})} />
                    <input className="rounded-3xl px-2 py-1" value={tmp.relation} onChange={e=>setTmp({...tmp,relation:(e.target as HTMLInputElement).value})} />
                    <input className="rounded-3xl px-2 py-1" value={tmp.gender} onChange={e=>setTmp({...tmp,gender:(e.target as HTMLInputElement).value})} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>{ const n=tmp.name.trim(); if(!n) return; if(existsName(n,p.id)) return; update("people", p.id, {...tmp}); if(confirm("Also update this name in dream tags?")){ setStore((s:any)=>({...s, dreams: s.dreams.map((d:any)=> ({...d, tags: Array.from(new Set((d.tags||[]).map((t:string)=> t===p.name? n: t))) })) })); } setEditId(null); }} className="text-xs btn btn-primary px-3 py-1">Save</button>
                    <button onClick={()=>setEditId(null)} className="text-xs px-3 py-1 rounded-3xl bg-pink-300/40 border border-pink-300/60">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm">{p.name} <span className="opacity-60">· {p.relation} · {p.gender}</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditId(p.id); setTmp({name:p.name, relation:p.relation, gender:p.gender}); }} className="text-xs px-3 py-1 rounded-3xl bg-pink-300/40 border border-pink-300/60">✏️ Edit</button>
                <button onClick={()=>remove("people", p.id)} className="text-xs btn btn-danger px-3 py-1">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DreamCard>
    </div>
  );
}

function Places({store, add, update, remove, setStore}:{store:any; add:(k:string,i:any)=>void; update:(k:string,id:string,patch:any)=>void; remove:(k:string,id:string)=>void; setStore:(s:any)=>void}){
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string|null>(null);
  const [tmpName, setTmpName] = useState("");
  const existsName = (n:string, ignoreId?:string)=> store.places.some((p:any)=>p.id!==ignoreId && p.name.trim().toLowerCase()===n.trim().toLowerCase());
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="📍" title="Add Place" />
        <div className="flex gap-2">
          <input value={name} onChange={e=>setName((e.target as HTMLInputElement).value)} placeholder="Place name" className="flex-1 rounded-3xl px-3 py-2" />
          <button onClick={()=>{ const n=name.trim(); if(!n) return; if(existsName(n)) return; add("places", {id:uid(), name:n}); setName(""); }} className="btn btn-primary">Add</button>
        </div>
      </DreamCard>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="vaporwave">
        <SectionTitle icon="🗺️" title="Places" />
        <div className="space-y-2">
          {store.places.map((p:any) => (
            <div key={p.id} className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
              {editId===p.id ? (
                <div className="flex items-center gap-2">
                  <input className="flex-1 rounded-3xl px-2 py-1 text-sm" value={tmpName} onChange={e=>setTmpName((e.target as HTMLInputElement).value)} />
                  <button onClick={()=>{ const n=tmpName.trim(); if(!n) return; if(existsName(n,p.id)) return; update("places", p.id, { name:n }); if(confirm("Also update this place in dream tags?")){ setStore((s:any)=>({...s, dreams: s.dreams.map((d:any)=> ({...d, tags: Array.from(new Set((d.tags||[]).map((t:string)=> t===p.name? n: t))) })) })); } setEditId(null); }} className="text-xs btn btn-primary px-3 py-1">Save</button>
                  <button onClick={()=>setEditId(null)} className="text-xs px-3 py-1 rounded-lg bg-pink-300/40 border border-pink-300/60">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm">{p.name}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>{ setEditId(p.id); setTmpName(p.name); }} className="text-xs px-3 py-1 rounded-3xl bg-pink-300/40 border border-pink-300/60">✏️ Edit</button>
                    <button onClick={()=>remove("places", p.id)} className="text-xs btn btn-danger px-3 py-1">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DreamCard>
    </div>
  );
}

function Companions({store, add, remove}:{store:any; add:(k:string,i:any)=>void; remove:(k:string,id:string)=>void}){
  const [f, setF] = useState({name:"", role:"", buffs:"", notes:""});
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="🧚" title="Add Companion" />
        <div className="grid gap-2 text-sm">
          <input className="rounded-3xl px-3 py-2" placeholder="Name" value={f.name} onChange={e=>setF({...f,name:(e.target as HTMLInputElement).value})}/>
          <input className="rounded-3xl px-3 py-2" placeholder="Role" value={f.role} onChange={e=>setF({...f,role:(e.target as HTMLInputElement).value})}/>
          <input className="rounded-3xl px-3 py-2" placeholder="Buffs (comma)" value={f.buffs} onChange={e=>setF({...f,buffs:(e.target as HTMLInputElement).value})}/>
          <textarea rows={4} className="rounded-3xl px-3 py-2" placeholder="Notes" value={f.notes} onChange={e=>setF({...f,notes:(e.target as HTMLTextAreaElement).value})}/>
          <button onClick={()=>{ if(!f.name.trim()) return; add("companions", {id:uid(), name:f.name, role:f.role, buffs:f.buffs.split(",").map(x=>x.trim()).filter(Boolean), notes:f.notes}); setF({name:"",role:"",buffs:"",notes:""}); }} className="justify-self-start btn btn-primary">Save</button>
        </div>
      </DreamCard>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="candy">
        <SectionTitle icon="🤝" title="Companions" />
        <div className="space-y-2">
          {store.companions.map((c:any) => (
            <div key={c.id} className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-3 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{c.name} <span className="opacity-60 text-sm">· {c.role}</span></div>
                <button onClick={()=>remove("companions", c.id)} className="text-xs btn btn-danger px-3 py-1">Delete</button>
              </div>
              <div className="mt-1 flex flex-wrap">{(c.buffs||[]).map((b:string) => <Chip key={b}>{b}</Chip>)}</div>
              {c.notes && <p className="text-sm opacity-90 mt-2">{c.notes}</p>}
            </div>
          ))}
        </div>
      </DreamCard>
    </div>
  );
}

function XP({store, add, remove, xpTotal}:{store:any; add:(k:string,i:any)=>void; remove:(k:string,id:string)=>void; xpTotal:number}){
  const [f, setF] = useState({date: new Date().toISOString().slice(0,10), delta: 10, reason: "", source: "Manual"});
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="⚡" title="Add XP" />
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <input type="date" className="rounded-3xl px-3 py-2" value={f.date} onChange={e=>setF({...f,date:(e.target as HTMLInputElement).value})}/>
            <input type="number" className="rounded-3xl px-3 py-2" value={f.delta} onChange={e=>setF({...f,delta: Number((e.target as HTMLInputElement).value)})}/>
            <input className="rounded-3xl px-3 py-2" value={f.source} onChange={e=>setF({...f,source:(e.target as HTMLInputElement).value})} />
          </div>
          <input className="rounded-3xl px-3 py-2" placeholder="Reason" value={f.reason} onChange={e=>setF({...f,reason:(e.target as HTMLInputElement).value})}/>
          <button onClick={()=>{ add("xpLogs", {id:uid(), date:new Date(f.date).toISOString(), delta:Number(f.delta||0), reason:f.reason||"XP", source:f.source||"Manual"}); }} className="justify-self-start btn btn-primary">Add XP</button>
        </div>
      </DreamCard>
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="vaporwave">
        <SectionTitle icon="🏆" title="XP Ledger" right={<div className="text-sm opacity-80">Total: <span className="font-semibold">{xpTotal}</span></div>} />
        <div className="space-y-2">
          {store.xpLogs.map((x:any) => (
            <div key={x.id} className="flex items-center justify-between bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
              <div className="text-sm">{fmtDate(x.date)} · <span className="font-semibold">{x.delta>0? "+": ""}{x.delta}</span> · {x.reason} <span className="opacity-60">({x.source})</span></div>
              <button onClick={()=>remove("xpLogs", x.id)} className="text-xs btn btn-danger px-3 py-1">Delete</button>
            </div>
          ))}
        </div>
      </DreamCard>
    </div>
  );
}

function Settings({store, setStore}:{store:any; setStore:(s:any)=>void}){
  const [dev, setDev] = useState(!!store?.settings?.developerMode);
  const [compact, setCompact] = useState(!!store?.settings?.compactMode);
  const [theme, setTheme] = useState(store?.settings?.theme || 'peach');
  const [font, setFont] = useState(store?.settings?.font || 'sans');
  const [kawaii, setKawaii] = useState(!!store?.settings?.kawaiiMode);
  const [brightness, setBrightness] = useState((store?.settings?.brightness || 'bright') as 'bright'|'low');
  const [autoDim, setAutoDim] = useState<boolean>(() => {
    try { const v = (localStorage.getItem('autoDimBrightThemes') || 'off').toLowerCase(); return v === 'on' || v === 'true'; } catch { return false; }
  });
  const [changes, setChanges] = useState(0);
  const [quote, setQuote] = useState("Lucidity blooms where attention lingers.");
  const [cloudSync, setCloudSync] = useState(!!store?.settings?.cloudSyncEnabled);
  const [exportAsVault, setExportAsVault] = useState(true);
  const quotes = [
    "Reality checks are tiny portals to bigger worlds.",
    "Write it down. Dreams love to be remembered.",
    "Clarity follows curiosity.",
    "Tonight, your mind is the map.",
    "You are the dream architect.",
  ];
  const spinQuote = () => setQuote(quotes[Math.floor(Math.random()*quotes.length)]);

  const pushSettings = (patch:any) => {
    setStore((s:any)=> ({...s, settings: {...s.settings, ...patch} }));
    setChanges(c=>c+1);
  };

  // Persist and apply auto-dim immediately on toggle
  useEffect(() => {
    try {
      const flag = autoDim ? 'on' : 'off';
      localStorage.setItem('autoDimBrightThemes', flag);
      const root = document.documentElement; const body = document.body;
      root.setAttribute('data-auto-dim', flag === 'on' ? 'on' : 'off');
      body.setAttribute('data-auto-dim', flag === 'on' ? 'on' : 'off');
    } catch {}
  }, [autoDim]);

  useEffect(()=>{ // award XP once for customizing 3+ settings
    if (changes>=3 && !store?.settings?.customizationXpAwarded) {
      setStore((s:any)=> ({...s, settings:{...s.settings, customizationXpAwarded:true}, xpLogs:[{id:uid(), date:new Date().toISOString(), delta:25, reason:"Customized Settings", source:"System"}, ...s.xpLogs]}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[changes]);

  const downloadFullZip = async () => {
    const res = await fetch("/api/zip");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lucid-dream-temple-rpg.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const triggerSync = async () => {
    try {
      const res = await fetch('/api/sync', { method: 'POST', body: JSON.stringify({ store, asVault: exportAsVault }) });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'lucid-rpg-vault.zip';
      a.click();
      URL.revokeObjectURL(a.href);
      pushSettings({ lastSyncAt: new Date().toISOString() });
    } catch {}
  };
  const exportJson = () => {
    try {
      const data = JSON.stringify(store, null, 2);
      const b = new Blob([data], {type:'application/json'});
      const u = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href=u; a.download=`lucid-rpg-${Date.now()}.json`; a.click(); URL.revokeObjectURL(u);
      pushSettings({ lastBackupAt: new Date().toISOString() });
    } catch {}
  };
  const importJson = async (file?:File) => {
    try {
      if(!file) return;
      const txt = await file.text();
      const json = JSON.parse(txt);
      setStore(json);
      alert('Import OK');
    } catch { alert('Invalid JSON'); }
  };
  const wipeEverything = () => {
    const ok = confirm("This will erase all dreams, XP, people, places, and companions. This cannot be undone. Continue?");
    if (!ok) return;
  setStore((s:any)=> ({...SEED, settings: {...s.settings, theme: 'neon'} }));
  };
  return (
    <div className="grid gap-4">
      {/* App Settings */}
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="🧩" title="App Settings" />
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center justify-between bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2"><span>🛠️</span> <span>Enable Developer Mode</span></div>
            <input type="checkbox" checked={dev} onChange={e=>{ setDev(e.target.checked); pushSettings({developerMode:e.target.checked}); }} />
          </label>
          <label className="flex items-center justify-between bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2"><span>📦</span> <span>Compact Mode</span></div>
            <input type="checkbox" checked={compact} onChange={e=>{ setCompact(e.target.checked); pushSettings({compactMode:e.target.checked}); }} />
          </label>
          <div className="col-span-full text-xs opacity-70">Tip: Dev mode unlocks debug helpers and tiny XP boosts for testing.</div>
        </div>
      </DreamCard>

      {/* Theme & UI */}
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="vaporwave">
        <SectionTitle icon="🎨" title="Theme & UI" />
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <label className="text-sm">
            <div className="mb-1 opacity-80">Theme</div>
            <select value={theme} onChange={e=>{ setTheme((e.target as HTMLSelectElement).value); pushSettings({theme:(e.target as HTMLSelectElement).value}); }} className="w-full appearance-none rounded-3xl px-4 py-2 shadow">
              <option value="peach">Femboy Peach</option>
              <option value="vaporwave">Lucid Vaporwave</option>
              <option value="candy">Neon Candy</option>
              <option value="pink">Lucid Pink</option>
              <option value="dark">Dark</option>
              <option value="neon">Neon</option>
            </select>
          </label>
          <label className="text-sm">
            <div className="mb-1 opacity-80">Font</div>
            <select value={font} onChange={e=>{ setFont((e.target as HTMLSelectElement).value); pushSettings({font:(e.target as HTMLSelectElement).value}); }} className="w-full appearance-none rounded-3xl px-4 py-2 shadow">
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
              <option value="mono">Monospace</option>
            </select>
          </label>
          <label className="flex items-center justify-between bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur md:col-span-3">
            <div className="flex items-center gap-2">
              <span>🌗</span>
              <span>Auto Dim Bright Themes</span>
            </div>
            <input type="checkbox" checked={autoDim} onChange={e=>setAutoDim(e.target.checked)} />
          </label>
          <div className="flex items-end">
            <button onClick={()=>{ setDev(false); setCompact(false); setTheme('peach'); setFont('sans'); pushSettings({developerMode:false, compactMode:false, theme:'peach', font:'sans'}); }} className="w-full btn btn-primary">Reset UI Preferences</button>
          </div>
          <div className="md:col-span-3">
            <button
              onClick={()=>{ const next=!kawaii; setKawaii(next); pushSettings({ kawaiiMode: next }); }}
              className="w-full btn btn-primary"
            >{kawaii? 'Disable Kawaii Mode' : 'Enable Kawaii Mode 💖'}</button>
          </div>
          <div className="md:col-span-3">
            <button
              onClick={()=>{ const next = brightness === 'bright' ? 'low' : 'bright'; setBrightness(next as any); pushSettings({ brightness: next }); }}
              className="w-full btn btn-primary"
            >{brightness === 'bright' ? 'Switch to Low Light Cards' : 'Switch to Bright Cards'}</button>
          </div>
        </div>
        <div className="mt-3 text-sm bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-3 flex items-center justify-between backdrop-blur">
          <div className="opacity-80">💬 Lucid wisdom of the day: <span className="opacity-100">{quote}</span></div>
          <button onClick={spinQuote} className="text-xs btn btn-primary px-2 py-1">Shuffle</button>
        </div>
      </DreamCard>

      {/* Backup & Restore */}
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="femboy">
        <SectionTitle icon="🧠" title="Backup & Restore" />
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={exportJson} className="btn btn-primary">Export JSON</button>
          <label className="btn btn-primary cursor-pointer">
            Import JSON
            <input type="file" className="hidden" accept="application/json" onChange={e=>importJson(e.target.files?.[0]||undefined)} />
          </label>
          <button onClick={downloadFullZip} className="btn btn-primary">Download ZIP Project</button>
          {/* Cloud Sync */}
          <label className="ml-auto flex items-center gap-2 bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
            <span>📱 Sync to Cloud</span>
            <input
              type="checkbox"
              checked={cloudSync}
              onChange={async e=>{
                const on = e.target.checked;
                setCloudSync(on);
                pushSettings({ cloudSyncEnabled: on });
                if (on && !store?.settings?.cloudSyncAwarded) {
                  setStore((s:any)=> ({...s, settings:{...s.settings, cloudSyncAwarded:true}, xpLogs:[{id:uid(), date:new Date().toISOString(), delta:50, reason:'Enabled Cloud Sync', source:'System'}, ...s.xpLogs]}));
                }
                if (on) await triggerSync();
              }}
            />
          </label>
        </div>
        <div className="mt-2 text-xs opacity-70 flex items-center justify-between">
          <span>Last backup: {store?.settings?.lastBackupAt ? fmtDate(store.settings.lastBackupAt): '—'}</span>
          <span>Last sync: {store?.settings?.lastSyncAt ? fmtDate(store.settings.lastSyncAt): '—'}</span>
        </div>
        {cloudSync && (
          <div className="mt-3 grid md:grid-cols-3 gap-2 text-sm">
            <button onClick={triggerSync} className="btn btn-primary">Sync Now</button>
            <label className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl px-3 py-2 backdrop-blur">
              <input type="checkbox" checked={exportAsVault} onChange={e=>setExportAsVault(e.target.checked)} />
              Also export to Obsidian vault format
            </label>
            <a href="obsidian://open?vault=LucidRPG" className="btn btn-primary text-center">Open Folder in Obsidian</a>
          </div>
        )}
      </DreamCard>

      {/* Danger Zone */}
      <DreamCard kawaiiMode={store?.settings?.kawaiiMode} theme="candy">
        <SectionTitle icon="⚠️" title="Danger Zone" />
        <div className="flex flex-wrap gap-2 text-sm">
          <button onClick={()=>{ if(confirm('Reset to seed data?')) setStore({ ...SEED, settings: { ...SEED.settings, theme: 'neon' } }); }} className="btn btn-danger">Reset to Seed</button>
          <button onClick={wipeEverything} className="btn btn-danger">Wipe Everything (Dream Suicide)</button>
        </div>
      </DreamCard>
    </div>
  );
}

function Stat({label, value}:{label:string; value:any}){
  return (
    <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-3 backdrop-blur">
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

// DreamEntryCard removed in favor of DreamCard everywhere

function ExportImport({store, setStore}:{store:any; setStore:(s:any)=>void}){
  const fileRef = useRef<HTMLInputElement|null>(null);
  const doExport = () => {
    const blob = new Blob([JSON.stringify(store,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lucid-rpg-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const doImport = async (e: any) => {
    const file = e.target.files?.[0]; if(!file) return;
    const text = await file.text();
    try { const json = JSON.parse(text); setStore(json); alert("Import OK"); }
    catch { alert("Invalid JSON"); }
    e.target.value = "";
  };
  return (
    <div className="flex gap-2">
      <button onClick={doExport} className="btn btn-primary text-sm">Export JSON</button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
      <button onClick={()=>fileRef.current?.click()} className="btn btn-primary text-sm">Import JSON</button>
    </div>
  );
}
