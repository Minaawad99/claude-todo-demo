"""Put our TTS line on a Veo clip so it lands on the mouth movements Veo made.
python3 lipfit.py clip.mp4 line.wav out.mp4 [--skip N]
--skip N: Veo said N extra phrases at the start (e.g. repeated a word); the clip is cut to start just before phrase N.
Finds the speech parts in the clip's own audio and in our line. If both have the same number of phrases,
each phrase of ours is stretched to the length of Veo's and placed at the same moment; otherwise the whole
line is stretched to Veo's speech span. Veo's audio is dropped. Prints what it did."""
import sys, re, subprocess, tempfile, os
clip, line, out = sys.argv[1:4]; SKIP = int(sys.argv[sys.argv.index("--skip")+1]) if "--skip" in sys.argv else 0
def dur(f): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
def speech(f, db, d=0.2, gap=0.18, minlen=0.15):
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
    r=max(.8,min(1.2,r)); f=[]  # keep the voice natural; a phrase may run a little into the next pause
    while r>1.25: f.append("atempo=1.25"); r/=1.25
    while r<0.8: f.append("atempo=0.8"); r/=0.8
    f.append(f"atempo={r:.4f}"); return ",".join(f)
mean=float(re.search(r"mean_volume: (-?[\d.]+)",subprocess.run(["ffmpeg","-i",clip,"-af","volumedetect","-f","null","-"],capture_output=True,text=True).stderr).group(1))
V=speech(clip,min(-30.0,mean-5));  # noisier clips need a higher silence threshold
O=speech(line,-38,d=0.15)
CUT=max(0.0, V[SKIP][0]-0.35) if SKIP else 0.0
V=[[a-CUT,b-CUT] for a,b in V[SKIP:]]
if not V: sys.exit("no speech found in clip")
tmp=tempfile.mkdtemp(); parts=[]
if len(V)==len(O): pairs=list(zip(O,V)); mode="phrase"
else: pairs=[([O[0][0],O[-1][1]],[V[0][0],V[-1][1]])]; mode="span"
for i,(o,v) in enumerate(pairs):
    r=(o[1]-o[0])/(v[1]-v[0]); p=f"{tmp}/p{i}.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-i",line,"-ss",f"{o[0]:.3f}","-to",f"{o[1]:.3f}","-af",atempo(r)+",afade=t=in:d=0.02","-ar","48000","-ac","1",p],check=True)
    parts.append((p,v[0])); print(f"  {mode} {i}: ours {o[0]:.2f}-{o[1]:.2f}s -> clip {v[0]:.2f}-{v[1]:.2f}s  (x{r:.2f})")
inp=[]; fl=[]
for i,(p,t) in enumerate(parts): inp+=["-i",p]; fl.append(f"[{i+1}]adelay={int(t*1000)}:all=1[a{i}]")
mix="".join(f"[a{i}]" for i in range(len(parts)))+f"amix=inputs={len(parts)}:normalize=0,apad,atrim=0:{dur(clip)-CUT:.3f}[aout]"
subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{CUT:.3f}","-i",clip,*inp,"-filter_complex",";".join(fl)+";"+mix,"-map","0:v","-map","[aout]","-c:v","libx264","-crf","16","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-ar","48000",out],check=True)
print(out, f"veo phrases {len(V)}, ours {len(O)}")
