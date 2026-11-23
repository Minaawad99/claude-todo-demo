"""Generate and finish the voices of an episode.
  python3 voices.py <episode dir>            generate missing lines into voice/, then process all into final/
  python3 voices.py <episode dir> --process  only re-process voice/ → final/ (after changing speed/pitch in episode.json)
The episode dir holds lines.tsv (NN<TAB>host|guest<TAB>text) and episode.json ("voices": {...}).
Free Gemini TTS quotas are small and per model: on a quota error it tries the next model, then waits and retries.
Lines a model reads its style text aloud are a known failure (gemini-3.8-flash-tts did it): always check with qa/asr.py."""
import sys, os, json, subprocess, tempfile, time
EP = os.path.abspath(sys.argv[1]); H = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(f"{EP}/episode.json"))["voices"]
MODELS = cfg.get("models", ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"])
os.makedirs(f"{EP}/voice", exist_ok=True); os.makedirs(f"{EP}/final", exist_ok=True)
lines = [l.rstrip("\n").split("\t") for l in open(f"{EP}/lines.tsv", encoding="utf-8") if l.strip()]
if "--process" not in sys.argv:
    for n, spk, text in lines:
        dst = f"{EP}/voice/{n}-{spk}.wav"
        if os.path.exists(dst): continue
        v = cfg[spk]
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as g: g.write(v["style"])
        for attempt in range(8):
            ok = False
            for m in MODELS:
                r = subprocess.run(["python3", f"{H}/tts.py", f.name, g.name, dst, "--voice", v["voice"], "--model", m], capture_output=True, text=True)
                if r.returncode == 0: print(n, spk, m, flush=True); ok = True; break
            if ok: break
            print(n, "quota on all models, waiting 65 s", flush=True); time.sleep(65)
        else: sys.exit(f"line {n}: quota exhausted; try again later (free quotas reset daily)")
# finish: cap pauses, then speed (and for the guest a slightly deeper pitch). No reverb.
for n, spk, _ in lines:
    src, dst = f"{EP}/voice/{n}-{spk}.wav", f"{EP}/final/{n}-{spk}.wav"
    if not os.path.exists(src): continue
    v = cfg[spk]; t = tempfile.mktemp(suffix=".wav")
    subprocess.run(["python3", f"{H}/tighten.py", src, t, "--max", str(v.get("max_pause", 0.35))], check=True, capture_output=True)
    pitch = v.get("pitch", 1.0)
    af = (f"asetrate=24000*{pitch},aresample=24000," if pitch != 1.0 else "") + f"atempo={v.get('speed', 1.0)},loudnorm=I=-16"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", t, "-af", af, "-ar", "48000", dst], check=True); os.unlink(t)
print("final/ ready")
