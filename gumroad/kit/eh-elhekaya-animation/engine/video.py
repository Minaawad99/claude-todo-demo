#!/usr/bin/env python3
"""محرك فيديو «إيه الحكاية؟» — أداة واحدة لكل الخطوات.

الاستخدام:  python3 video.py <أمر> <فولدر-الفيديو> [اختيارات]

  init    <dir>          يعمل فولدر فيديو جديد بالملفات الأساسية
  timing  <dir>          يقرا الصوت من <dir>/voice/ ويطلع توقيت كل سطر (build/timing.js) و build/voice.wav
  build   <dir>          يجمع الرسم والترجمة في build/index.html
  check   <dir>          يدور على أخطاء في الرسم ويعمل صورة فيها لقطة من كل مشهد (build/sheet.png)
  sound   <dir>          يركّب الصوت + المؤثرات + موسيقى خفيفة في build/mix.wav (محتاج numpy)
  render  <dir> [--fps 30]  يطلع الفيديو النهائي build/video.mp4 بمقاس 1080×1920
  all     <dir>          timing + build + check + sound + render

فولدر الفيديو:
  script.txt   السكريبت، سطر لكل جملة
  config.json  {"title": "...", "sub": "...", "brand": "...", "keywords": {"0": ["كلمة"]}, "music": true}
  voice/       الصوت: ملف لكل سطر (01.wav, 02.wav, ...) أو ملف واحد للسكريبت كله
  shots.js     الرسم: shot(...) لكل سطر (شوف API.md)
  sfx.json     (اختياري) مؤثرات صوتية: [{"line": 3, "at": 0.8, "fx": "pop", "gain": 0.6}]
"""
import json, os, re, shutil, subprocess, sys, wave, struct

ENGINE = os.path.dirname(os.path.abspath(__file__))
SR = 48000


def die(msg):
    print("✗ " + msg); sys.exit(1)


def need(tool):
    if not shutil.which(tool): die(f"البرنامج '{tool}' مش متسطّب. شوف خطوة التثبيت في SKILL.md.")


def lines_of(d):
    p = os.path.join(d, "script.txt")
    if not os.path.exists(p): die("مفيش script.txt في " + d)
    return [l.strip() for l in open(p, encoding="utf-8") if l.strip()]


def config_of(d):
    p = os.path.join(d, "config.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}


def out(d, name=""):
    b = os.path.join(d, "build"); os.makedirs(b, exist_ok=True); return os.path.join(b, name)


# ── init ────────────────────────────────────────────────
def cmd_init(d):
    os.makedirs(os.path.join(d, "voice"), exist_ok=True)
    def put(name, text):
        p = os.path.join(d, name)
        if not os.path.exists(p): open(p, "w", encoding="utf-8").write(text)
    put("script.txt", "اكتب هنا السكريبت، سطر لكل جملة.\n")
    put("config.json", json.dumps({"title": "عنوان الفيديو", "sub": "سطر تحت العنوان", "brand": "", "keywords": {}, "music": True}, ensure_ascii=False, indent=2) + "\n")
    put("shots.js", "// مشهد لكل سطر: shot(رقم_السطر, كاميرا, رسم). شوف API.md\nshot(0, camPush(320, 180, 1, 1.1), function (u, d, t) {\n  return sky(\"day\") + clouds(t, 20, 30, 4, 0.9) + grass(t, 270) + person(320, 300, t, { mood: \"curious\", pose: \"think\" }) + tag(\"أول مشهد\", 320, 80, u, 0.4);\n});\n")
    put("sfx.json", "[]\n")
    print("✓ اتعمل فولدر الفيديو:", d)


# ── timing ──────────────────────────────────────────────
def decode(src, dst, trim=False):
    af = "aresample=48000"
    if trim:   # يشيل السكوت من أول وآخر الملف
        sil = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05"
        af = f"{sil},areverse,{sil},areverse,aresample=48000"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-af", af, "-c:a", "pcm_s16le", dst], check=True)


def wav_frames(p):
    with wave.open(p) as w: return w.readframes(w.getnframes())


def write_wav(p, frames):
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(frames)


def speech_segments(p, min_sil):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", f"silencedetect=noise=-35dB:d={min_sil}", "-f", "null", "-"], capture_output=True, text=True)
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    dur = len(wav_frames(p)) / 2 / SR
    segs, cur = [], 0.0
    for i, s in enumerate(st):
        if s - cur > 0.12: segs.append([cur, s])
        cur = en[i] if i < len(en) else dur
    if dur - cur > 0.12: segs.append([cur, dur])
    return segs, dur


def cmd_timing(d):
    need("ffmpeg")
    lines = lines_of(d); vdir = os.path.join(d, "voice")
    files = sorted(f for f in os.listdir(vdir) if not f.startswith(".") and f.lower().rsplit(".", 1)[-1] in ("wav", "mp3", "m4a", "aac", "ogg", "opus", "flac", "webm")) if os.path.isdir(vdir) else []
    if not files: die("حط الصوت في فولدر voice/ (ملف لكل سطر، أو ملف واحد للسكريبت كله).")
    tmp = out(d, "tmp.wav"); T = []
    if len(files) == len(lines) and len(files) > 1:          # ملف لكل سطر
        gap = b"\x00\x00" * int(0.3 * SR); frames = gap; t = 0.3
        for i, fname in enumerate(files):
            decode(os.path.join(vdir, fname), tmp, trim=True)
            fr = wav_frames(tmp); dur = len(fr) / 2 / SR
            T.append({"i": i, "start": round(t, 2), "end": round(t + dur, 2), "text": lines[i], "file": fname})
            frames += fr + gap; t += dur + 0.3
        write_wav(out(d, "voice.wav"), frames)
        total = t
    elif len(files) == 1:                                     # ملف واحد: بنقسمه على السكوت بين الجمل
        decode(os.path.join(vdir, files[0]), out(d, "voice.wav"))
        segs = None
        for ms in (0.35, 0.25, 0.18, 0.12, 0.08):
            sg, total = speech_segments(out(d, "voice.wav"), ms)
            if len(sg) >= len(lines): segs = sg; break
        if segs is None:
            die(f"لقيت {len(sg)} جمل بس في الصوت والسكريبت فيه {len(lines)} سطر. سيب سكتة صغيرة بين كل جملة والتانية، أو سجّل كل سطر في ملف لوحده.")
        while len(segs) > len(lines):                         # بندمج أقصر سكتات لحد ما العدد يظبط
            k = min(range(len(segs) - 1), key=lambda j: segs[j + 1][0] - segs[j][1])
            segs[k][1] = segs[k + 1][1]; del segs[k + 1]
        T = [{"i": i, "start": round(s[0], 2), "end": round(s[1], 2), "text": lines[i]} for i, s in enumerate(segs)]
    else:
        die(f"في voice/ {len(files)} ملفات والسكريبت {len(lines)} سطر. يا إما ملف لكل سطر بالظبط، يا إما ملف واحد بس.")
    if os.path.exists(tmp): os.remove(tmp)
    js = "window.TIMING = " + json.dumps({"duration": round(total, 2), "lines": T}, ensure_ascii=False, indent=1) + ";\n"
    open(out(d, "timing.js"), "w", encoding="utf-8").write(js)
    # مراجعة: سطر سرعته غريبة غالباً متقسم غلط
    rates = [len(l["text"].split()) / max(0.3, l["end"] - l["start"]) for l in T]
    med = sorted(rates)[len(rates) // 2]
    print(f"✓ التوقيت جاهز: {len(T)} سطر، {total:.1f} ثانية")
    for l, r in zip(T, rates):
        flag = "  ← راجع السطر ده" if (r > med * 1.8 or r < med / 1.8) and len(files) == 1 else ""
        print(f"  {l['i']:>2}  {l['start']:6.2f} → {l['end']:6.2f}   {l['text'][:50]}{flag}")


# ── build ───────────────────────────────────────────────
def cmd_build(d):
    if not os.path.exists(out(d, "timing.js")): die("شغّل timing الأول.")
    lines = lines_of(d); cfg = config_of(d); K = {int(k): v for k, v in cfg.get("keywords", {}).items()}
    for i, ws in K.items():
        for w in ws:
            if i >= len(lines) or w not in lines[i].split(" "): print(f"  ! الكلمة '{w}' مش موجودة في السطر {i} بالظبط (لازم تتكتب زي ما هي في السكريبت)")
    caps = [{"w": l.split(" "), "k": [w in K.get(i, []) for w in l.split(" ")]} for i, l in enumerate(lines)]
    shots = open(os.path.join(d, "shots.js"), encoding="utf-8").read()
    js = "(function () {\n" + open(os.path.join(ENGINE, "helpers.js"), encoding="utf-8").read() + "\n" + open(os.path.join(ENGINE, "panel.js"), encoding="utf-8").read() + "\n// ── shots.js ──\n" + shots + "\n})();\n"
    open(out(d, "scenes.js"), "w", encoding="utf-8").write(js)
    data = "window.CAPS = " + json.dumps(caps, ensure_ascii=False) + ";\nwindow.CFG = " + json.dumps({k: cfg.get(k, "") for k in ("title", "sub", "brand")}, ensure_ascii=False) + ";"
    html = open(os.path.join(ENGINE, "template.html"), encoding="utf-8").read().replace("/*DATA*/", data)
    defs = os.path.join(d, "defs.svg")
    if os.path.exists(defs): html = html.replace("<!--DEFS-->", open(defs, encoding="utf-8").read())
    open(out(d, "index.html"), "w", encoding="utf-8").write(html)
    n = len(re.findall(r"\bshot\s*\(", shots))
    print(f"✓ build/index.html جاهز ({n} مشهد لـ{len(lines)} سطر)")
    if n < len(lines): print(f"  ! فيه سطور من غير مشهد خاص بيها: المشهد اللي قبلها هيكمل عليها")


# ── check / render (node + playwright) ─────────────────
def node(script, *args):
    need("node")
    r = subprocess.run(["node", os.path.join(ENGINE, script), *args])
    if r.returncode: sys.exit(r.returncode)


def cmd_check(d):
    cmd_build(d); node("check.js", os.path.abspath(out(d, "index.html")), os.path.abspath(out(d, "sheet.png")))


def cmd_sound(d):
    lines = lines_of(d); cfg = config_of(d)
    if not os.path.exists(out(d, "timing.js")): die("شغّل timing الأول.")
    T = json.loads(open(out(d, "timing.js"), encoding="utf-8").read().split("=", 1)[1].rstrip().rstrip(";"))["lines"]
    cues = [{"t": round(max(0, l["start"] - 0.08), 2), "fx": "whoosh", "gain": 0.3} for l in T[1:]]
    p = os.path.join(d, "sfx.json")
    for c in (json.load(open(p, encoding="utf-8")) if os.path.exists(p) else []):
        i = c["line"]
        if i >= len(T): continue
        e = {"t": round(T[i]["start"] + c.get("at", 0), 2), "gain": c.get("gain", 0.6)}
        if "file" in c: e.update(file=c["file"], **{k: c[k] for k in ("from", "dur") if k in c})
        else: e.update(fx=c["fx"], **({"dur": c["dur"]} if "dur" in c else {}))
        cues.append(e)
    json.dump({"bed": bool(cfg.get("music", True)), "cues": cues}, open(out(d, "cues.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    try:
        import numpy  # noqa: F401
    except ImportError:
        print("! numpy مش متسطّب، فالفيديو هيطلع بالصوت بس من غير مؤثرات ولا موسيقى (pip install numpy)")
        shutil.copy(out(d, "voice.wav"), out(d, "mix.wav")); return
    # ملفات الأصوات المسجلة (لو فيه) بتتقرا من فولدر الفيديو
    cj = json.load(open(out(d, "cues.json"), encoding="utf-8"))
    for c in cj["cues"]:
        if "file" in c: c["file"] = os.path.relpath(os.path.join(d, c["file"]), out(d))
    json.dump(cj, open(out(d, "cues.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    subprocess.run([sys.executable, os.path.join(ENGINE, "sfx.py"), out(d, "voice.wav"), out(d, "cues.json"), out(d, "mix.wav")], check=True)
    print("✓ build/mix.wav جاهز")


def cmd_render(d, fps="30"):
    need("ffmpeg")
    if not os.path.exists(out(d, "mix.wav")): cmd_sound(d)
    cmd_build(d)
    os.environ["FPS"] = fps
    node("render.js", os.path.abspath(out(d, "index.html")), os.path.abspath(out(d, "mix.wav")), os.path.abspath(out(d, "video.mp4")))
    print("✓ الفيديو جاهز:", out(d, "video.mp4"))


if __name__ == "__main__":
    if len(sys.argv) < 3: print(__doc__); sys.exit(0)
    c, d = sys.argv[1], sys.argv[2]
    fps = sys.argv[sys.argv.index("--fps") + 1] if "--fps" in sys.argv else "30"
    if c == "init": cmd_init(d)
    elif c == "timing": cmd_timing(d)
    elif c == "build": cmd_build(d)
    elif c == "check": cmd_check(d)
    elif c == "sound": cmd_sound(d)
    elif c == "render": cmd_render(d, fps)
    elif c == "all": cmd_timing(d); cmd_check(d); cmd_sound(d); cmd_render(d, fps)
    else: print(__doc__)
