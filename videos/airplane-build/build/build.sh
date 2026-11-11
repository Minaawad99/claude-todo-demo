#!/bin/sh
# scene.js = head.js + ui.js (tag, panel, confetti, vote card from the pool episode) + main.js
cd "$(dirname "$0")" && cat head.js ui.js main.js > scene.js && echo built
