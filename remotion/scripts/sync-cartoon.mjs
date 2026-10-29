// Copies a built cartoon-panel episode (videos/<slug>/cartoon) into public/<slug>/ so the CartoonEpisode
// composition can load it: scenes.js, timing.js, the captions, the SVG gradients, meta.json and the sound mix.
// Usage: node scripts/sync-cartoon.mjs <slug> [mix.wav]
import fs from "node:fs";
import path from "node:path";

const [slug, mix] = process.argv.slice(2);
if (!slug) throw new Error("usage: node scripts/sync-cartoon.mjs <slug> [mix.wav]");
const src = path.resolve("../videos", slug), out = path.resolve("public", slug);
fs.mkdirSync(out, { recursive: true });

const html = fs.readFileSync(path.join(src, "cartoon/index.html"), "utf8");
const pick = (re, what) => { const m = html.match(re); if (!m) throw new Error("index.html: no " + what); return m[1]; };
fs.copyFileSync(path.join(src, "cartoon/scenes.js"), path.join(out, "scenes.js"));
fs.copyFileSync(path.join(src, "timing.js"), path.join(out, "timing.js"));
fs.writeFileSync(path.join(out, "caps.js"), "window.CAPS = " + pick(/window\.CAPS = ([\s\S]*?);<\/script>/, "captions") + ";\n");
fs.writeFileSync(path.join(out, "defs.svg"), pick(/(<svg width="0"[\s\S]*?<\/svg>)/, "defs"));

const timing = JSON.parse(fs.readFileSync(path.join(src, "timing.js"), "utf8").replace(/^\s*window\.TIMING\s*=\s*/, "").replace(/;\s*$/, ""));
const meta = {
  title: pick(/<div class="title">([^<]*)<\/div>/, "title"),
  sub: pick(/<div class="sub">([^<]*)<\/div>/, "sub"),
  duration: timing.duration,
  lines: timing.lines.map(({ start, end }) => ({ start, end })),
};
fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify(meta, null, 1));
if (mix) fs.copyFileSync(mix, path.join(out, "mix.wav"));
console.log("synced", slug, "→", out, mix ? "(with mix)" : "(no mix)");
