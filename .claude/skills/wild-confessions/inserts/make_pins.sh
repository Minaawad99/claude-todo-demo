#!/bin/bash
# Make globe "location stamp" scenes. One argument per place:  ID|lon|lat|Arabic name|ENGLISH LABEL
#   bash make_pins.sh <episode inserts dir> "WA|-122.3|47.65|جامعة واشنطن|SEATTLE, USA · 47.6°N" ...
D=$1; shift; H=$(dirname "$0")
for p in "$@"; do IFS='|' read id lo la a e <<< "$p"; { echo "const PLACE = { lon: $lo, lat: $la, ar: '$a', en: '$e' };"; cat "$H/pin.js"; } > "$D/PIN_$id.js"; echo "$D/PIN_$id.js"; done
