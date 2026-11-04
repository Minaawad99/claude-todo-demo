#!/bin/bash
# voice/*.wav -> final/*.wav : cap pauses, speed up; crow gets a slightly deeper tone (no reverb).
set -e; cd "$(dirname "$0")"; mkdir -p final
for f in voice/*.wav; do b=$(basename $f); o=final/$b; [ -f $o ] && continue; [[ $b == *crow* ]] && MAXP=0.22 || MAXP=0.35
  python3 ../audio/tighten.py $f /tmp/t.wav --max $MAXP >/dev/null
  if [[ $b == *crow* ]]; then af="asetrate=24000*0.94,aresample=24000,atempo=1.35,loudnorm=I=-16"
  else af="atempo=1.05,loudnorm=I=-16"; fi
  ffmpeg -v error -y -i /tmp/t.wav -af "$af" -ar 48000 $o
done
python3 - <<'PY'
import glob,subprocess,os
tot=0; rows=[]
for f in sorted(glob.glob("final/*.wav")):
    d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout); tot+=d+0.25
    rows.append(f"| {os.path.basename(f)[:2]} | {os.path.basename(f)[3:-4]} | {d:.1f}s |")
open("timing.md","w").write("# مدة كل سطر (بعد الظبط)\n\n| السطر | المتكلم | المدة |\n|---|---|---|\n"+"\n".join(rows)+f"\n\n**الإجمالي التقريبي (مع ربع ثانية بين السطور):** {tot:.0f} ثانية\n")
print(open("timing.md").read())
PY
