import AdmZip from "adm-zip";

type Store = any;

const q = (s: any) => typeof s === 'string' ? JSON.stringify(s) : Array.isArray(s) ? `[${s.map(q).join(', ')}]` : String(s);
const fm = (o: Record<string, any>) => `---\n${Object.entries(o).map(([k,v])=>`${k}: ${q(v)}`).join('\n')}\n---\n\n`;
const slug = (s: string) => (s||'').replace(/[^a-z0-9\- _]/gi,'').trim().replace(/\s+/g,'-').slice(0,80) || 'untitled';
const fmtDate = (iso: string) => {
  try { const d = new Date(iso); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); const yy = d.getFullYear(); return `${mm}-${dd}-${yy}`; } catch { return iso; }
};

export async function POST(req: Request) {
  const body = await req.json() as { store: Store, asVault?: boolean };
  const store = body.store || {};
  const asVault = !!body.asVault;
  const zip = new AdmZip();

  const root = asVault ? 'LucidRPG' : '';
  const path = (p: string) => (root? `${root}/${p}`: p);

  const dreams = store.dreams || [];
  const people = store.people || [];
  const places = store.places || [];
  const companions = store.companions || [];
  const xpLogs = store.xpLogs || [];

  const tagCounts = (name: string) => dreams.filter((d: any)=> (d.tags||[]).includes(name)).length;

  // Dreams
  for (const d of dreams) {
    const placeTags = places.map((p:any)=>p.name).filter((n:string)=> (d.tags||[]).includes(n));
    const peopleTags = people.map((p:any)=>p.name).filter((n:string)=> (d.tags||[]).includes(n));
    const front = fm({
      title: d.title || 'Untitled Dream',
      date: fmtDate(d.date||new Date().toISOString()),
      places: placeTags,
      people: peopleTags,
      xp: 0,
      tags: d.tags || [],
    });
    const bodyText = (d.text||'').toString();
    const name = slug(`${fmtDate(d.date||'')}-${d.title||'dream'}`);
    zip.addFile(path(`Dreams/${name}.md`), Buffer.from(front + bodyText, 'utf8'));
  }

  // People
  for (const p of people) {
    const front = fm({ name: p.name, relationship: p.relation, gender: p.gender, dream_count: tagCounts(p.name) });
    zip.addFile(path(`People/${slug(p.name)}.md`), Buffer.from(front, 'utf8'));
  }

  // Places
  for (const p of places) {
    const front = fm({ name: p.name, dream_count: tagCounts(p.name) });
    zip.addFile(path(`Places/${slug(p.name)}.md`), Buffer.from(front, 'utf8'));
  }

  // Companions
  for (const c of companions) {
    const front = fm({ name: c.name, role: c.role, buffs: c.buffs||[], dream_count: tagCounts(c.name) });
    const notes = (c.notes||'').toString();
    zip.addFile(path(`Companions/${slug(c.name)}.md`), Buffer.from(front + notes, 'utf8'));
  }

  // XP Logs
  for (const x of xpLogs) {
    const front = fm({ date: fmtDate(x.date||new Date().toISOString()), delta: x.delta||0, source: x.source||'Manual' });
    const bodyTxt = (x.reason||'XP').toString();
    zip.addFile(path(`XP Logs/${fmtDate(x.date||'')}-${slug(bodyTxt)}.md`), Buffer.from(front + bodyTxt, 'utf8'));
  }

  const readme = `Exported from Lucid Dream Temple RPG\nTimestamp: ${new Date().toISOString()}\nFolders: Dreams, People, Places, Companions, XP Logs\nThis structure is Obsidian-friendly with YAML frontmatter.\n`;
  zip.addFile(path(`_exported_from_LucidRPG.txt`), Buffer.from(readme,'utf8'));

  const buffer = zip.toBuffer();
  return new Response(buffer, { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename=lucid-rpg-vault.zip' } });
}

