#!/bin/bash
# build.sh <slides_dir> <out.mp4>: durations in tenths of a second via SEC10 (default 80), hook 3s, cta 5s, 0.4s crossfades
D=$1; OUT=$2; files=($(ls $D/*.png | sort)); n=${#files[@]}; args=(); durs=()
for i in "${!files[@]}"; do f=${files[$i]}; d=${SEC10:-80}; [[ $f == *00_hook* ]] && d=30; [[ $f == *cta* ]] && d=50; [[ $f =~ __d([0-9]+) ]] && d=${BASH_REMATCH[1]}; durs+=($d); args+=(-loop 1 -t "$((d/10)).$((d%10))" -i $f); done
fc=""; for i in $(seq 0 $((n-1))); do fc+="[$i]scale=1080:1920,format=yuv420p,fps=30[s$i];"; done
prev="s0"; off10=0
for i in $(seq 1 $((n-1))); do off10=$((off10 + ${durs[$((i-1))]} - 4)); off="$((off10/10)).$((off10%10))"; fc+="[$prev][s$i]xfade=transition=fade:duration=0.4:offset=$off[x$i];"; prev="x$i"; done
ffmpeg -v error -y "${args[@]}" -f lavfi -t 200 -i anullsrc=r=44100:cl=stereo -filter_complex "${fc%;}" -map "[$prev]" -map $n:a -shortest -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 -crf 20 -preset medium -c:a aac -movflags +faststart $OUT
