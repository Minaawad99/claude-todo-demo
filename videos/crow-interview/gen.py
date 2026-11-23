"""Generate each line with its speaker's voice. Retries other TTS models on quota errors.
python3 gen.py lines.tsv voice/   (skips lines already generated)"""
import sys, os, subprocess, tempfile, time
lines = [l.rstrip("\n").split("\t") for l in open(sys.argv[1], encoding="utf-8") if l.strip()]
out = sys.argv[2]
VOICE = {"host": "Charon", "crow": "Algenib"}
MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"]
tts = os.path.join(os.path.dirname(__file__), "..", "tools", "tts.py")
for n, spk, text in lines:
    dst = f"{out}/{n}-{spk}.wav"
    if os.path.exists(dst): continue
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as f: f.write(text)
    for attempt in range(8):
        ok = False
        for m in MODELS:
            r = subprocess.run(["python3", tts, f.name, f"style-{spk}.txt", dst, "--voice", VOICE[spk], "--model", m], capture_output=True, text=True)
            if r.returncode == 0: print(n, spk, m, flush=True); ok = True; break
        if ok: break
        print(n, "quota on all models, waiting 65s", flush=True); time.sleep(65)
    else: sys.exit(f"line {n} failed")
