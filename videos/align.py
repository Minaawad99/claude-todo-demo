import re,subprocess,json,sys
A,script,out=sys.argv[1:4]
log=subprocess.run(['ffmpeg','-i',A,'-af','silencedetect=noise=-38dB:d=0.3','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)]; en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
dur=float(re.search(r'Duration: (\d+):(\d+):([\d.]+)',log).group(3))+60*int(re.search(r'Duration: (\d+):(\d+)',log).group(2))
# speech segments
segs=[];cur=0.0
for s,e in zip(st,en):
  if s>cur+0.05: segs.append((cur,s))
  cur=e
if cur<dur-0.1: segs.append((cur,dur))
gaps=[segs[i+1][0]-segs[i][1] for i in range(len(segs)-1)]
lines=[l.strip() for l in open(script) if l.strip()]
L=[len(re.sub(r'[^\w]','',l)) for l in lines]
speech=sum(b-a for a,b in segs); rate=speech/sum(L)
# DP: line i covers segs j..k
N,M=len(lines),len(segs); INF=1e18
dp=[[INF]*(M+1) for _ in range(N+1)]; bk=[[0]*(M+1) for _ in range(N+1)]; dp[0][0]=0
for i in range(1,N+1):
  for k in range(1,M+1):
    for j in range(max(0,k-6),k):
      if dp[i-1][j]>=INF: continue
      d=segs[k-1][1]-segs[j][0]; exp=L[i-1]*rate
      c=((d-exp)/max(exp,0.8))**2
      if k<M: c-= 0.6*min(gaps[k-1],1.4)   # prefer ending on long pauses
      # internal pauses that are long are bad
      for t in range(j,k-1): c+=0.4*max(0,gaps[t]-0.75)
      v=dp[i-1][j]+c
      if v<dp[i][k]: dp[i][k]=v; bk[i][k]=j
res=[];k=M
for i in range(N,0,-1):
  j=bk[i][k]; res.append((i-1,segs[j][0],segs[k-1][1],k-j)); k=j
res.reverse()
o=[]
for i,a,b,n in res:
  o.append({"i":i,"start":round(a,2),"end":round(b,2),"text":lines[i]})
  print(f"{i:2d} {a:6.2f}-{b:6.2f} ({b-a:4.1f}s exp {L[i]*rate:4.1f}) n={n} {lines[i][:40]}")
json.dump({"duration":dur,"lines":o},open(out,'w'),ensure_ascii=False,indent=1)
