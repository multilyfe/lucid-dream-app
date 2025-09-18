import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

export async function GET() {
  const projectRoot = process.cwd();
  const exclude = new Set(["node_modules", ".next", ".git", ".turbo", ".vercel"]);

  function* walk(dir: string): Generator<string> {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (exclude.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) yield* walk(full);
      else yield full;
    }
  }

  const zip = new AdmZip();
  for (const file of walk(projectRoot)) {
    const rel = path.relative(projectRoot, file);
    zip.addFile(rel, fs.readFileSync(file));
  }
  const buffer = zip.toBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=lucid-dream-temple-rpg.zip",
    },
  });
}
