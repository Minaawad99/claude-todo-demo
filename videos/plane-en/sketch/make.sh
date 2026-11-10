#!/bin/sh
# The English edition draws with the Arabic edition's shots, switched to English labels.
cd "$(dirname "$0")" && { echo "window.EN_ED = true;"; cat ../../plane-ar/sketch/shots.js; } > shots.js && python3 build.py
