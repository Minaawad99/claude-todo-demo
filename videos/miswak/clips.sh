#!/bin/sh
# Cut the partner's product video into short frame sequences the sketch page plays inside a taped photo frame (no sound).
# clips/<name>/001.jpg … at 30 fps, 360 px wide. Regenerate with: sh clips.sh
cd "$(dirname "$0")"
V=refs/product/brand-video.mp4
cut() { mkdir -p clips/$1; rm -f clips/$1/*.jpg; ffmpeg -v error -y -ss $2 -t $3 -i $V -vf "fps=30,scale=360:-2" -q:v 4 clips/$1/%03d.jpg; echo "$1 $(ls clips/$1 | wc -l)"; }
cut green 19.3 2.7
cut bend 22.6 2.9
cut pouch 25.5 2.3
cut pocket 27.8 2.8
cut bag 32.6 2.4
cut box 12.0 3.0
cut finger 3.0 2.0
cut clear 43.0 3.0
