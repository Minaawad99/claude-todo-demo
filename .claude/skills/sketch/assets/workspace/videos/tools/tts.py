"""Generate the narration with the Gemini TTS API (same voices as Google AI Studio → Generate speech).
python3 tts.py <script.txt> <style.txt> <out.wav> [--voice Puck] [--model gemini-2.5-flash-preview-tts] [--lines 0-2]
The API key is added by the environment's network secret (header x-goog-api-key), never read or stored here.
The style text goes before the script, the way AI Studio sends its "Style instructions"; temperature 1; 24 kHz mono WAV."""
import argparse, base64, json, subprocess, urllib.request, tempfile, os
ap = argparse.ArgumentParser()
ap.add_argument("script"); ap.add_argument("style"); ap.add_argument("out")
ap.add_argument("--voice", default="Puck"); ap.add_argument("--model", default="gemini-2.5-flash-preview-tts"); ap.add_argument("--lines")
a = ap.parse_args()
lines = [l.strip() for l in open(a.script, encoding="utf-8") if l.strip()]
if a.lines: i, j = map(int, a.lines.split("-")); lines = lines[i:j + 1]
style = open(a.style, encoding="utf-8").read().strip()
body = {"contents": [{"parts": [{"text": style + "\n" + "\n".join(lines)}]}],
        "generationConfig": {"temperature": 1, "responseModalities": ["AUDIO"],
                             "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
try: r = json.load(urllib.request.urlopen(req, timeout=600))
except urllib.error.HTTPError as e: raise SystemExit(f"HTTP {e.code}: {e.read()[:400].decode(errors='replace')}")
p = r["candidates"][0]["content"]["parts"][0]["inlineData"]; raw = base64.b64decode(p["data"])
if raw[:4] == b"RIFF": open(a.out, "wb").write(raw)
else:
    with tempfile.NamedTemporaryFile(suffix=".pcm", delete=False) as f: f.write(raw)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", f.name, a.out], check=True); os.unlink(f.name)
print(a.out, p["mimeType"], a.model, a.voice)
