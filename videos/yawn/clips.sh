#!/usr/bin/env bash
# Composite the real clips into the frames the drawing leaves for them (see clips/README.md), keeping the audio.
#   bash clips.sh <rendered.mp4> <out.mp4>
# Frame boxes (panel units, from sketch/shots.js) map to output pixels as px = (15 + v * 330/640) * 3.
set -euo pipefail
cd "$(dirname "$0")"
IN=$1; OUT=$2
L() { node -e "global.window={};eval(require('fs').readFileSync('timing.js','utf8'));console.log(window.TIMING.lines[$1].start)"; }
A4=$(L 4); B4=$(L 5); A5=$(L 5); B5=$(L 6); A23=$(L 23); B23=$(L 24)
px() { python3 -c "print(round((15 + $1 * 330 / 640) * 3))"; }
sz() { python3 -c "print(round($1 * 330 / 640 * 3 / 2) * 2)"; }
# clip: file start dur crop x y w h a b
mk() { local i=$1 f=$2 ss=$3 crop=$4 w=$5 h=$6 a=$7 b=$8; local d; d=$(python3 -c "print($b-$a)"); local fo; fo=$(python3 -c "print($b-0.35)")
  echo "[$i:v]trim=start=$ss:duration=$d,setpts=PTS-STARTPTS+$a/TB,crop=$crop,scale=$w:$h,format=yuva420p,fade=t=in:st=$a:d=0.35:alpha=1,fade=t=out:st=$fo:d=0.35:alpha=1[c$i]"; }
F="$(mk 1 clips/woman-yawn.mp4 3.8 720:1100:0:0 $(sz 330) $(sz 504) $A4 $B4);"
F+="$(mk 2 clips/fetus-4d.mp4 2.0 720:580:0:0 $(sz 240) $(sz 194) $A5 $B5);"
F+="$(mk 3 clips/dog-yawn.mp4 18.6 1045:720:60:0 $(sz 560) $(sz 386) $A23 $B23);"
F+="[0:v][c1]overlay=$(px 30):$(px 110):enable='between(t,$A4,$B4)':eof_action=pass[v1];"
F+="[v1][c2]overlay=$(px 370):$(px 40):enable='between(t,$A5,$B5)':eof_action=pass[v2];"
F+="[v2][c3]overlay=$(px 40):$(px 300):enable='between(t,$A23,$B23)':eof_action=pass[v]"
ffmpeg -loglevel error -y -i "$IN" -i clips/woman-yawn.mp4 -i clips/fetus-4d.mp4 -i clips/dog-yawn.mp4 -filter_complex "$F" -map "[v]" -map 0:a \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset medium -r 60 -c:a copy -movflags +faststart "$OUT"
echo "clips composited → $OUT"
