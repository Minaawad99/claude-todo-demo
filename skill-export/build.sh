#!/usr/bin/env bash
# Rebuild the portable «اسكتش» skill from this repo: skill-export/dist/sketch.skill (+ sketch-reference-videos.zip).
# Install: claude.ai → upload sketch.skill as a skill; Claude Code → unzip it into ~/.claude/skills/.
set -e
R="$(cd "$(dirname "$0")/.." && pwd)"; V="$R/videos"; OUT="$R/skill-export/dist"; K="$OUT/sketch"; W="$K/assets/workspace/videos"
rm -rf "$OUT"; mkdir -p "$K/references" "$K/scripts" "$K/assets/reference" "$W/lib" "$W/tools" "$W/audio" "$W/_templates" "$W/tides/sketch" "$W/tides/refs"
python3 "$R/skill-export/portable_skill.py" "$R/.claude/skills/sketch/SKILL.md" "$K/SKILL.md"; cp "$R/skill-export/sketch/HISTORY.md" "$K/references/"; cp "$R/skill-export/sketch/setup_workspace.sh" "$K/scripts/"
cp -r "$V/_templates/sketch" "$W/_templates/"; cp "$V/lib/geo.min.js" "$V/lib/geo.LICENSE" "$W/lib/"
cp "$V"/tools/{stills.js,strip.js,frame.js,tts.py} "$W/tools/"; cp "$V"/audio/{sfx.py,tighten.py} "$W/audio/"
cp "$V"/{render.js,qa.py,align_asr.py,map_timing.py} "$W/"
cp "$V"/tides/{script.txt,style.txt,timing.js,raw-timing.json,cues.js} "$W/tides/"; cp "$V/tides/refs/SOURCES.md" "$W/tides/refs/"; cp "$V"/tides/sketch/{episode.py,shots.js,build.py} "$W/tides/sketch/"
# later reference episodes (text sources only, no audio): a two-edition machine episode and a two-edition anatomy episode, plus the paper-style covers
for E in plane-ar plane-en decomp-ar decomp-en heater-co; do mkdir -p "$W/$E/sketch" "$W/$E/refs"; for f in script.txt style.txt timing.js raw-timing.json cues.js titles.md; do [ -f "$V/$E/$f" ] && cp "$V/$E/$f" "$W/$E/"; done; cp "$V/$E/refs/SOURCES.md" "$W/$E/refs/" 2>/dev/null || true; for f in episode.py shots.js build.py make.sh; do [ -f "$V/$E/sketch/$f" ] && cp "$V/$E/sketch/$f" "$W/$E/sketch/"; done; done
cp "$V/tools/cover.js" "$W/tools/"; mkdir -p "$K/assets/workspace/brand/eh-elhekaya"; cp "$R"/brand/eh-elhekaya/cover-{plane,decomp}-{ar,en}-tiktok.html "$R"/brand/eh-elhekaya/tiktok-cover-{plane,decomp}-{ar,en}-1080x1920.png "$K/assets/workspace/brand/eh-elhekaya/"
T="$V/_reference/tabizzay"; cp -r "$T/sheets" "$T/frames" "$K/assets/reference/"; cp "$T/transcripts.txt" "$K/assets/reference/"
NOTE='> **In this skill package:** the contact sheets are in `assets/reference/sheets/`, the motion strips in `assets/reference/frames/`, and the transcripts in `assets/reference/transcripts.txt`. The small videos are the separate `sketch-reference-videos.zip`. After `scripts/setup_workspace.sh`, all of them sit in `videos/_reference/tabizzay/` with the names used below.'
for f in STYLE.md:STYLE.md README.md:REFERENCE-INDEX.md; do src=${f%%:*}; dst=${f##*:}; { head -1 "$T/$src"; echo; echo "$NOTE"; tail -n +2 "$T/$src"; } > "$K/references/$dst"; done
(cd "$OUT" && zip -q -r sketch.skill sketch && cd "$T" && zip -q -r "$OUT/sketch-reference-videos.zip" videos)
ls -la "$OUT"
