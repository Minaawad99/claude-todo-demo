#!/bin/sh
# scene.js = head.js + parts.js (man, phone, bug, anatomy from ../cartoon/shots.js) + main.js
cd "$(dirname "$0")" && cat head.js parts.js main.js > scene.js && echo built
