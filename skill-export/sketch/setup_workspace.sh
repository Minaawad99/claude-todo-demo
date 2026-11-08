#!/usr/bin/env bash
# Set up a «اسكتش» workspace: copies the template, tools, sound kit, globe library and the reference episode
# «المد والجزر» into <project>/videos/ in the layout every script expects. Never overwrites existing files.
# Usage: bash setup_workspace.sh <project-dir>   (default: the current directory)
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"; DEST="${1:-.}"
mkdir -p "$DEST"
cp -rn "$HERE/assets/workspace/videos" "$DEST/" 2>/dev/null || cp -r --update=none "$HERE/assets/workspace/videos" "$DEST/"
mkdir -p "$DEST/videos/_reference/tabizzay"
cp -rn "$HERE/assets/reference/." "$DEST/videos/_reference/tabizzay/" 2>/dev/null || true
cp -n "$HERE/references/STYLE.md" "$DEST/videos/_reference/tabizzay/STYLE.md" 2>/dev/null || true
cp -n "$HERE/references/REFERENCE-INDEX.md" "$DEST/videos/_reference/tabizzay/README.md" 2>/dev/null || true
echo "workspace ready: $DEST/videos  (template: videos/_templates/sketch, reference episode: videos/tides)"
# what the tools need; report, don't install
for c in ffmpeg node python3; do command -v $c >/dev/null || echo "missing: $c"; done
python3 -c "import numpy" 2>/dev/null || echo "missing: python numpy  (pip install numpy)"
python3 -c "import sherpa_onnx" 2>/dev/null || echo "missing: sherpa-onnx  (pip install sherpa-onnx), needed by align_asr.py"
node -e "require('playwright')" 2>/dev/null || [ -d /opt/node22/lib/node_modules/playwright ] || echo "missing: playwright for node  (npm i playwright), needed by render.js and the tools"
[ -d "$DEST/videos/_reference/tabizzay/videos" ] || echo "optional: unzip sketch-reference-videos.zip into $DEST/videos/_reference/tabizzay/ for the 20 small reference videos"
