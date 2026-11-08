"""Put our TTS line on a Veo clip so it lands on the mouth movements Veo made.
python3 lipfit.py clip.mp4 line.wav out.mp4 [--skip N]
--part A:B: use only seconds A..B of our line (when Veo says just the first sentence).
--max R: fastest allowed speed-up (default 1.2; the deeper crow voice stays clear up to 1.4).
--min R: slowest allowed slow-down (default 0.8). Use ~0.95 when Veo speaks much slower than our line, so our voice does not drag.
--span: ignore phrases, fit the whole line to the whole of Veo's speech.
--skip N: Veo said N extra phrases at the start (e.g. repeated a word); the clip is cut to start just before phrase N.
Finds the speech parts in the clip's own audio and in our line. If both have the same number of phrases,
each phrase of ours is stretched to the length of Veo's and placed at the same moment; otherwise the whole
line is stretched to Veo's speech span. Veo's audio is dropped. Prints what it did."""
import sys, re, subprocess, tempfile, os
clip, line, out = sys.argv[1:4]; MAXR = float(sys.argv[sys.argv.index("--max")+1]) if "--max" in sys.argv else 1.2; SKIP = int(sys.argv[sys.argv.index("--skip")+1]) if "--skip" in sys.argv else 0
MINR = float(sys.argv[sys.argv.index("--min")+1]) if "--min" in sys.argv else 0.8
if "--part" in sys.argv:
    a_,b_=sys.argv[sys.argv.index("--part")+1].split(":"); cut_line=tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg","-v","error","-y","-ss",a_,"-t",f"{float(b_)-float(a_):.3f}","-i",line,cut_line],check=True); line=cut_line
def dur(f): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
def speech(f, db, d=0.2, gap=0.18, minlen=0.25):
    log = subprocess.run(["ffmpeg","-i",f,"-af",f"silencedetect=noise={db}dB:d={d}","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",log)]; en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",log)]
    T=dur(f); sil=list(zip(st, en+[T]*(len(st)-len(en)))); segs=[]; cur=0.0
    for a,b in sil:
        if a-cur>0: segs.append([cur,a])
        cur=b
    if T-cur>0.05: segs.append([cur,T])
    m=[]
    for s in segs:
        if m and s[0]-m[-1][1]<gap: m[-1][1]=s[1]
        else: m.append(s)
    return [s for s in m if s[1]-s[0]>=minlen]
def atempo(r):
    r=max(MINR,min(MAXR,r)); f=[]  # keep the voice natural; a phrase may run a little into the next pause
    while r>1.25: f.append("atempo=1.25"); r/=1.25
    while r<0.8: f.append("atempo=0.8"); r/=0.8
    f.append(f"atempo={r:.4f}"); return ",".join(f)
mean=float(re.search(r"mean_volume: (-?[\d.]+)",subprocess.run(["ffmpeg","-i",clip,"-af","volumedetect","-f","null","-"],capture_output=True,text=True).stderr).group(1))
V=speech(clip,min(-30.0,mean-5));  # noisier clips need a higher silence threshold
O=speech(line,-38,d=0.15)
for d_,g_ in [(0.1,0.3),(0.1,0.2),(0.08,0.12)]:  # look for finer pauses in our line until the phrase count matches Veo
    if len(O)==len(V[SKIP:]): break
    O2=speech(line,-38,d=d_,gap=g_)
    if len(O2)==len(V[SKIP:]): O=O2
CUT=max(0.0, V[SKIP][0]-0.35) if SKIP else 0.0
V=[[a-CUT,b-CUT] for a,b in V[SKIP:]]
if not V: sys.exit("no speech found in clip")
tmp=tempfile.mkdtemp(); parts=[]
if len(V)==len(O) and '--span' not in sys.argv: pairs=list(zip(O,V)); mode="phrase"
else: pairs=[([O[0][0],O[-1][1]],[V[0][0],V[-1][1]])]; mode="span"
# Each phrase keeps a margin of our own audio around it, so soft word starts and the fading end of the last
# syllable are never cut: up to 0.15 s before and 0.40 s after, but never into the neighbouring phrase.
LO=[p[0] for p in pairs]; LD=dur(line); prev_end=0.0  # phrases never overlap: a phrase that cannot be sped up enough starts after the previous one ends
for i,(o,v) in enumerate(pairs):
    r=(o[1]-o[0])/(v[1]-v[0]); rr=max(MINR,min(MAXR,r))
    pre=min(0.15, o[0] - (LO[i-1][1] + 0.02 if i else 0.0)); pre=max(0.0, pre)
    post=min(0.40, (LO[i+1][0] - 0.02 if i+1 < len(LO) else LD) - o[1]); post=max(0.0, post)
    a0, a1 = o[0]-pre, o[1]+post; p=f"{tmp}/p{i}.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{a0:.3f}","-t",f"{a1-a0:.3f}","-i",line,"-af",atempo(r)+",afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse","-ar","48000","-ac","1",p],check=True)
    t=max(0.0, v[0]-pre/rr, prev_end); prev_end=t+dur(p)-0.03
    parts.append((p,t)); print(f"  {mode} {i}: ours {o[0]:.2f}-{o[1]:.2f}s (+{pre:.2f}/{post:.2f}) -> clip {v[0]:.2f}-{v[1]:.2f}s  (x{r:.2f}, used x{rr:.2f}, starts {t:.2f}s)")
inp=[]; fl=[]
for i,(p,t) in enumerate(parts): inp+=["-i",p]; fl.append(f"[{i+1}]adelay={int(t*1000)}:all=1[a{i}]")
mix="".join(f"[a{i}]" for i in range(len(parts)))+f"amix=inputs={len(parts)}:normalize=0,apad=pad_dur=0.4[aout]"
# 1) the synced voice as a lossless wav (what build.py uses), 2) the clip with that voice, its last frame held if the voice runs longer
wav=out[:-4]+".wav"
subprocess.run(["ffmpeg","-v","error","-y",*inp,"-filter_complex",";".join(f.replace(f"[{i+1}]",f"[{i}]") for i,f in enumerate(fl))+";"+mix,"-map","[aout]","-ar","48000","-ac","1",wav],check=True)
T=max(dur(clip)-CUT, dur(wav))
subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{CUT:.3f}","-i",clip,"-i",wav,"-map","0:v","-map","1:a","-vf","tpad=stop_mode=clone:stop_duration=5","-t",f"{T:.3f}","-c:v","libx264","-crf","16","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-ar","48000","-af","apad",out],check=True)
print(out, f"veo phrases {len(V)}, ours {len(O)}")
