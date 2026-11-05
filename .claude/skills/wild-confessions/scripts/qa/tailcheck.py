# For every phrase in a file: is the end a natural fade (ok) or a hard stop while still loud (CUT)? Same for starts.
import sys, subprocess, numpy as np
SR=48000
for f in sys.argv[1:]:
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f,"-vn","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout,np.float32)
    w=int(.005*SR); n=len(x)//w; db=20*np.log10(np.sqrt(np.mean(x[:n*w].reshape(n,w)**2,1))+1e-9)
    bad=[f"{'end' if db[i]>db[i+1] else 'start'}@{(i+1)*.005:.2f}({max(db[i],db[i+1]):.0f}dB)" for i in range(n-1) if max(db[i],db[i+1])>-35 and min(db[i],db[i+1])<-90]
    print(f.split('/')[-1], "OK" if not bad else "CUT " + " ".join(bad))
