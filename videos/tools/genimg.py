"""Generate one image with the Gemini image API (for «الصور» items the user has no photo for, only when the user allows it).
python3 genimg.py "<prompt>" <out.jpg> [--model gemini-3-pro-image] [--aspect 4:3]
The API key is added by the environment's network secret (header x-goog-api-key), never read or stored here.
Every AI image must get a yellow label that says so («صورة تخيلية بالذكاء الاصطناعي»), and must not imitate a real photo.
"""
import argparse, base64, json, urllib.request, urllib.error, subprocess, tempfile, os

ap = argparse.ArgumentParser()
ap.add_argument("prompt"); ap.add_argument("out")
ap.add_argument("--model", default="gemini-3-pro-image"); ap.add_argument("--aspect", default="4:3")
a = ap.parse_args()
body = {"contents": [{"parts": [{"text": a.prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": a.aspect}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
try: r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e: raise SystemExit(f"HTTP {e.code}: {e.read()[:400].decode(errors='replace')}")
parts = [p for c in r.get("candidates", []) for p in c.get("content", {}).get("parts", []) if "inlineData" in p]
if not parts: raise SystemExit("no image: " + json.dumps(r)[:400])
raw = base64.b64decode(parts[0]["inlineData"]["data"])
with tempfile.NamedTemporaryFile(suffix=".img", delete=False) as f: f.write(raw); tmp = f.name
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-q:v", "2", a.out], check=True); os.remove(tmp)
print(a.out, parts[0]["inlineData"].get("mimeType"), a.model)
