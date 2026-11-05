#!/usr/bin/env bash
# Package the «إيه الحكاية؟» video skills as self-contained zips you can upload to any Claude account
# (claude.ai → Settings → Capabilities → Skills → Upload skill), or drop into ~/.claude/skills/ for Claude Code.
# Each zip holds the skill's SKILL.md plus kit/: the repo's video tools and the reference builds it copies from, at the
# same paths as in this repo (kit/videos/…, kit/brand/…), so the skill's instructions work unchanged after
#   cp -r <skill folder>/kit/. <working directory>
# Usage (from the repo root): bash skills-export/build.sh  → skills-export/*.zip
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd); OUT="$ROOT/skills-export"; TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
cd "$ROOT"
COMMON="videos/render.js videos/qa.py videos/align_asr.py videos/map_timing.py videos/engine.js videos/PLAYBOOK.md videos/README.md videos/audio/sfx.py videos/audio/tighten.py videos/tools videos/lib"
# an episode folder without its audio takes (they are big and get regenerated)
ep() { find "videos/$1" -type f ! -name '*.wav' ! -name '*.mp3' ! -name '*.mp4' ! -name 'raw-timing.json' ! -name 'cues.json' 2>/dev/null; }
pack() {   # pack <skill> <extra paths...>
  local s=$1; shift; local d="$TMP/$s"; mkdir -p "$d/kit"
  cp ".claude/skills/$s/SKILL.md" "$d/"; [ -f ".claude/skills/$s/LICENSE" ] && cp ".claude/skills/$s/LICENSE" "$d/"
  for p in "$@"; do [ -e "$p" ] && cp -r --parents "$p" "$d/kit/"; done
  find "$d" -name '__pycache__' -prune -exec rm -rf {} +
  [ -z "$(ls -A "$d/kit")" ] && rmdir "$d/kit"
  rm -f "$OUT/$s.zip"; (cd "$TMP" && zip -qr "$OUT/$s.zip" "$s"); echo "$s.zip $(du -h "$OUT/$s.zip" | cut -f1)"
}
pack animation $COMMON $(ep monorail) $(ep tbm-tunnel) $(ep container-ship) $(ep pisa) \
  brand/eh-elhekaya/cover-container-ship-tiktok.html brand/eh-elhekaya/cover-tbm-tunnel-tiktok.html brand/eh-elhekaya/cover-pisa-tiktok.html
pack diagram $COMMON videos/_templates/diagram $(ep xray-diagram) brand/eh-elhekaya/cover-xray-diagram-tiktok.html
pack law $COMMON $(ep nuclear-shelter) brand/eh-elhekaya/cover-nuclear-shelter-3d-tiktok.html
pack humanizer
