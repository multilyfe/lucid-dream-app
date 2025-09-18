# 🌙 Lucid Dream Temple RPG — Dreamy README (Updated)

Welcome to your cozy, star‑sprinkled dream journal RPG. It’s a single‑file Next.js app that feels like a tiny temple: write dreams, track lucidity, collect companions, and watch your stats glow. ✨

> TL;DR: `npm install` → `npm run dev` → open http://localhost:3000 → Journal tab.

---

## ✨ Highlights

- Ultra‑simple, zero‑backend data: everything lives in your browser via `localStorage`.
- One primary screen with tabs: Journal, Analytics, Reality Checks, People, Places, Companions, XP, Settings.
- Magical mood + lucid sliders with live emoji labels (feelings over numbers).
- Powerful Symbols tab: search/add chips, category icons, Clear‑All per section, and Detect Symbols ✨ (fuzzy matching from your dream text + notes + title).
- Dream Type tabs (NSFW / Emotional / Magical) with cute icon buttons and Clear all/clear tab.
- Inline editing for Dreams, People, and Places.
- Cloud Sync export: one‑click Obsidian‑friendly Markdown ZIP (+ optional vault folder tree).
- Cute UI with TailwindCSS dark theme and soft glows.

---

## 🚀 Quick Start

1) Node 18+ recommended (Node 22 works great).
2) Install deps: `npm install`
3) Dev server: `npm run dev`
4) Open: http://localhost:3000

Build/serve:

```bash
npm run build
npm start
```

---

## 🧭 App Map (Tabs)

- Journal: Write dreams, tag symbols, add details, and save.
- Analytics: Totals, lucid %, average lucidity, top tags.
- Reality Checks: Add/toggle/delete RC prompts.
- People / Places / Companions: Your recurring dream cast and spots.
- XP: Log XP with reasons and sources; a cozy ledger of growth.
- Settings: Theme & font, Dev/Compact mode, quote generator, Backup/Restore, Cloud Sync, and Danger Zone.

---

## 📖 Journal Flow

- Quick Save: Title + Text, fast and comfy.
- Wizard (Dream / Details / Symbols):
  - Dream: Title + story.
  - Details: Date/time, Mood slider, optional Lucid toggle that reveals extra metrics.
  - Symbols: Searchable presets per category with add‑your‑own, Detect Symbols ✨, and chip toggles.

### Mood Slider (0–100)
- Rainbow gradient track with a soft white thumb and Reset button.
- Live label under the track (😱 Overwhelmed → 😞 Sad → 😐 Neutral → 😊 Peaceful → 🥰 Euphoric).
- Saves as `mood` 0–1 internally for analytics.

### Lucid Metrics (0–10, only when “Lucid” is checked)
- Sliders: Lucidity Level, Control, Memory, Vividness, Emotional Depth.
- Each shows a dynamic emoji subtitle:
  - Lucidity: 😴 → 🌫️ → 🌀 → 🌟 → 🌈
  - Control: 🎲 → 🪄 → 🤲 → 🧠 → 🕹️
  - Memory: ❓ → 💭 → 📘 → 🧠 → 🧾
  - Vividness: 🌫️ → ✨ → 🌆 → 🎨 → 🌈
  - Emotional Depth: 😐 → 💧 → ❤️ → 🧠 → 🕊️
- Saved as top‑level `lucidity` and `meta.lucid` (control, memory, vividness, emotionalDepth).

### Dream Type (under Mood)
- Tabs: NSFW / Emotional / Magical → 2×2 icon grid per tab.
- Tap to toggle tags (e.g., 💦 Sex/Wet, 💔 Emotional Burst, 👻 Nightmare).
- Clear all + Clear tab actions.

### Symbols Board (Searchable, Addable, Detectable)
- Category cards with icons: 👤 Characters, 🏛 Places, 📦 Objects, 😢 Emotions, 🧪 Other.
- Type to filter presets; “+ Add ‘text’” to create instantly.
- Select chips to toggle; Clear All per section.
- Detect Symbols ✨ scans your dream title + text + notes:
  - Fuzzy match (built‑in similarity) + friendly synonyms (e.g., “mom/mama”, “panties/underwear”).
  - Adds matches without removing existing selections.

---

## ✏️ Editing Everywhere

- Dream list: ✏️ Edit opens the same wizard pre‑filled; Save updates in place.
- People & Places: inline ✏️ Edit with Save/Cancel, validation (no empties, no dupes), and optional rename across existing dream tags.

---

## ⚙️ Settings Overhaul

- App Settings: Developer Mode, Compact Mode.
- Theme & UI: Theme selector (Dark / Neon / Lucid Pink) and font (Sans / Serif / Monospace), Reset UI button.
- Quote generator (“Lucid wisdom of the day”) with Shuffle.
- Backup & Restore: Export/Import JSON, Download ZIP Project, last backup time.
- Danger Zone: Reset to Seed, and “Wipe Everything (Dream Suicide)”.
- XP reward: +25 XP after you customize 3+ settings (once per profile).

### 📱 Cloud Sync (Obsidian‑friendly)
- Toggle in Settings → Backup & Restore: “Sync to Cloud”.
- “Sync Now” exports a ZIP with Markdown files (YAML frontmatter) in folders:
  - Dreams/, People/, Places/, Companions/, XP Logs/, and `_exported_from_LucidRPG.txt`.
- Option: “Also export to Obsidian vault format” → wraps in `LucidRPG/` root folder.
- Link: “Open Folder in Obsidian” (uses `obsidian://open?vault=LucidRPG`).
- Shows last sync time; +50 XP the first time you enable sync.

Markdown formats include:

Dream
```
---
title: "Lucid Battle in Loubi"
date: "08-24-2025"
places: ["Lucid World", "Loubi"]
people: ["Zinou", "Bilal"]
xp: 120
tags: ["lucid", "quest", "battle"]
---

I was fighting alongside Bilal in Loubi...
```

Person
```
---
name: Zinou
relationship: Friend
gender: Male
dream_count: 9
---
```

Companion
```
---
name: Candy Siren
buffs: ["Lucidity", "Obedience"]
dream_count: 3
---
```

---

## 💾 Data & Persistence

- Storage: `localStorage` key `lucid_rpg_v3`.
- Export/Import JSON for backups.
- ZIP exports: `/api/zip` (project) and `/api/sync` (Obsidian‑friendly data).

Simplified shape:

```json
{
  "dreams": [{
    "id":"...", "title":"...", "date":"ISO",
    "lucidity":0, "clarity":0, "mood":"Neutral", "isLucid":true,
    "tags":["..."], "text":"...",
    "meta": { "lucid": { "control":0, "memory":0, "vividness":0, "emotionalDepth":0 } }
  }],
  "people":[{"id":"...","name":"...","relation":"...","gender":"..."}],
  "places":[{"id":"...","name":"..."}],
  "companions":[{"id":"...","name":"...","role":"...","buffs":["..."],"notes":"..."}],
  "xpLogs":[{"id":"...","date":"ISO","delta":10,"reason":"...","source":"..."}],
  "rc":[{"id":"...","label":"...","enabled":true}],
  "settings":{
    "theme":"dark","font":"sans","developerMode":false,"compactMode":false,
    "lastBackupAt":null,"lastSyncAt":null,
    "cloudSyncEnabled":false,
    "customizationXpAwarded":false,
    "cloudSyncAwarded":false
  }
}
```

---

## 🧩 Tech Stack

- Next.js 14 App Router
- React 18 + hooks
- TypeScript (single‑file UI in `app/page.tsx`)
- Tailwind CSS (dark theme, soft borders, glows)
- Adm‑Zip for on‑device ZIP creation

Key files:

- `app/page.tsx` — the entire UI and client logic
- `app/layout.tsx` — imports `./globals.css` and declares metadata
- `app/globals.css` — Tailwind base/components/utilities
- `app/api/zip/route.ts` — project ZIP export
- `app/api/sync/route.ts` — Obsidian‑ready Markdown ZIP export

---

## 🛠️ Recent Updates (Sprint Log)

- Build fixes: removed stray backslash, replaced `and` with `&&`; ensured Tailwind import.
- Mood system: gradient slider with Reset + live emoji label.
- Lucid metrics: 5 emoji‑subtitle sliders saved into `meta.lucid`.
- Dream Type: NSFW/Emotional/Magical tabs; Clear all/clear tab.
- Symbols: icons per section; search/add; Clear All; Detect Symbols ✨ with fuzzy matching + synonyms.
- People/Places: inline ✏️ Edit with Save/Cancel, validation, optional tag rename in existing dreams.
- Dreams: ✏️ Edit opens wizard pre‑filled; Save updates in place.
- Settings: Dev/Compact, Theme/Font + Reset UI, quote generator, XP for customizing (once).
- Backup & Restore: improved actions + last backup time.
- Danger Zone: Wipe Everything button + polished visuals.
- Cloud Sync: toggle + Sync Now + Obsidian vault option; +50 XP on first enable; last sync timestamp; new `/api/sync` route.

---

## 🗺️ Roadmap (Dream Forward)

- Calendar & Heatmap; deeper analytics.
- Powerful filters across tags, symbols, people/places/companions, mood bands, lucid metrics.
- Rich editor: inline highlights, voice‑to‑text, attachments.
- Offline‑first PWA (installable) and gentle RC reminders.
- Symbol intelligence with local embeddings/LLM.
- Data vault: passcode and local encryption.
- Cloud: Google Drive upload + scheduled sync.
- Theming: pastel/kawaii, neon cyber, candlelit parchment.
- Accessibility: keyboard navigation and high contrast.

---

## 🤝 Contributing

- Keep changes small & readable; prefer tiny components (`Dial`, `MoodPicker`, `SymbolsBoard`).
- Update this README when you add user‑facing features.

---

## 💌 Notes

Cozy, playful vibes. Keep content mindful and welcoming for everyone. Sweet dreams and clear skies. 🌌

