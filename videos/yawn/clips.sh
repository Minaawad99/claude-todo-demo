#!/usr/bin/env bash
# Put the real clips into the frames the render leaves for them (filled with pure green #00ff00). Each clip goes on top of
# its frame; for the man in profile, the render's inside of that frame goes back on top with the green keyed out, so the
# air and blood drawn over him stay above the clip. Audio is kept.
#   bash clips.sh <rendered.mp4> <out.mp4>
# Panel boxes (sketch/shots.js, panel units) → output pixels: px = (15 + v * 330/640) * 3.
# The hook-card box (introArt viewBox 608×660 at page 28,236, scale .5): the frame is held still against the card's sway.
set -euo pipefail
cd "$(dirname "$0")"
IN=$1; OUT=$2
L() { node -e "global.window={};eval(require('fs').readFileSync('timing.js','utf8'));console.log(window.TIMING.lines[$1].start)"; }
py() { python3 -c "print($1)"; }
pp() { py "round((15 + $1 * 330 / 640) * 3)"; }                # panel unit → output px
ps() { py "round($1 * 330 / 640 * 3 / 2) * 2"; }                # panel size → even output px
# i file start crop w h a b x y
CL=(); add() { CL+=("$*"); }
add 1 clips/two-people.mp4 1.0 720:782:0:330  746 810 0.8 8.8 166 723
add 2 clips/woman-yawn.mp4 3.8 720:1100:0:0   $(ps 330) $(ps 504) $(L 4) $(L 5) $(pp 30) $(pp 110)
add 3 clips/fetus-4d.mp4   2.0 720:580:0:0    $(ps 240) $(ps 194) $(L 5) $(L 6) $(pp 370) $(pp 40)
add 4 clips/man-profile.mp4 1.2 720:1000:0:80 $(ps 380) $(ps 528) $(L 12) $(L 13) $(pp 130) $(pp 50)
add 5 clips/dog-yawn.mp4   18.6 1045:720:60:0 $(ps 560) $(ps 386) $(L 23) $(L 24) $(pp 40) $(pp 300)
INS=(-i "$IN"); F=""; prev="0:v"
for c in "${CL[@]}"; do read -r i file ss crop w h a b x y <<<"$c"; INS+=(-i "$file"); d=$(py "$b-$a")
  # a clip shorter than its window from $ss (the hook clip) plays a touch slower to fill it; every clip is enlarged 6 % and
  # drifts slowly across its window so the picture never stands still; it covers its frame 2 px past each side (no green left at the edges)
  avail=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$file"); k=$(py "max(1.0, $d / ($avail - $ss - 0.05))")
  W=$((w + 4)); H=$((h + 4))
  F+="[$i:v]trim=start=$ss,setpts=(PTS-STARTPTS)*$k+$a/TB,trim=end=$b,crop=$crop,scale=$(( (W * 106 / 100) / 2 * 2 )):$(( (H * 106 / 100) / 2 * 2 )),crop=$W:$H:x='(iw-ow)*(t-$a)/$d':y='(ih-oh)*(0.5+0.5*sin((t-$a)*0.8))',setsar=1[c$i];"
  F+="[$prev][c$i]overlay=$((x - 2)):$((y - 2)):enable='between(t,$a,$b)':eof_action=pass[b$i];"; prev="b$i"; done
# the man in profile has the air and the blood drawn over him: put the render's inside of that frame (inset 4 px, green
# keyed out) back on top of his clip for that line only
read -r _ _ _ _ w h a b x y <<<"${CL[3]}"
F+="[0:v]crop=$((w-8)):$((h-8)):$((x+4)):$((y+4)),colorkey=0x00FF00:0.36:0.08,format=yuva420p[top];[$prev][top]overlay=$((x+4)):$((y+4)):enable='between(t,$a,$b)'[v]"
ffmpeg -loglevel error -y "${INS[@]}" -filter_complex "$F" -map "[v]" -map 0:a \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset medium -r 60 -c:a copy -movflags +faststart "$OUT"
echo "clips composited → $OUT"
