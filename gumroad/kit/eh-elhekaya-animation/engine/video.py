#!/usr/bin/env python3
"""محرك فيديو «إيه الحكاية؟» — أداة واحدة لكل الخطوات.

الاستخدام:  python3 video.py <أمر> <فولدر-الفيديو> [اختيارات]

  init    <dir> [--style cartoon|sketch]   يعمل فولدر فيديو جديد بالملفات الأساسية
  timing  <dir>          يقرا الصوت من <dir>/voice/ ويطلع توقيت كل سطر (build/timing.js) و build/voice.wav
  build   <dir>          يجمع الرسم والترجمة في build/index.html
  check   <dir>          يدور على أخطاء في الرسم ويعمل صورة فيها لقطة من كل مشهد (build/sheet.png)
  sound   <dir>          يركّب الصوت + المؤثرات + موسيقى خفيفة في build/mix.wav (محتاج numpy)
  render  <dir> [--fps 30]  يطلع الفيديو النهائي build/video.mp4 بمقاس 1080×1920
  all     <dir>          timing + build + check + sound + render

  وضع "اعمل زي الفيديو ده":
  frames  <video.mp4> <out-dir>        يطلع 16 لقطة من فيديو مرجع + sheet.png
  style   <dir> --from cartoon|sketch  ينسخ ستايل جاهز لـ<dir>/style/ عشان يتعدّل
  compare <dir> <ref-sheet.png>        صورة المرجع جنب رسمنا (build/compare.png)

فولدر الفيديو:
  script.txt   السكريبت، سطر لكل جملة
  config.json  {"style": "cartoon"|"sketch"|"custom", "title": "...", "sub": "...", "brand": "...", "keywords": {"0": ["كلمة"]}, "music": true}
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
def cmd_init(d, style="cartoon"):
    os.makedirs(os.path.join(d, "voice"), exist_ok=True)
    def put(name, text):
        p = os.path.join(d, name)
        if not os.path.exists(p): open(p, "w", encoding="utf-8").write(text)
    put("script.txt", "اكتب هنا السكريبت، سطر لكل جملة.\n")
    cfg = {"style": style, "title": "عنوان الفيديو", "sub": "سطر تحت العنوان", "brand": "", "keywords": {}, "music": True}
    if style == "sketch":
        cfg["sketch"] = {"category": "تصنيف الموضوع", "hook": "جملة البداية فيها *كلمة* مهمة | وسطر رمادي", "outro": {"q": "السؤال", "legend": ["جزء 1", "جزء 2"], "stat": "99%", "statText": "شرح الرقم", "points": ["نقطة 1", "نقطة 2", "نقطة 3"], "more": "معلومة زيادة"}}
        shots = "// ستايل السكتش: كارت البداية على السطر 0، وكارت الملخص على آخر سطر. shot من السطر 1. شوف styles/sketch/API.md\nintro(function (t) { return dark() + ring(290, 160, 70, t, ease(t / 1.2)); });\nshot(1, camPush(320, 400, 1, 1.1), function (u, d, t) {\n  return paper() + gearS(320, 380, 110, t, 0.6) + label(320, 270, 470, 170, \"اسم الجزء\", OLIVE, ease((u - 0.5) / 0.8));\n});\n"
    else:
        shots = "// مشهد لكل سطر: shot(رقم_السطر, كاميرا, رسم). شوف styles/cartoon/API.md\nshot(0, camPush(320, 180, 1, 1.1), function (u, d, t) {\n  return sky(\"day\") + clouds(t, 20, 30, 4, 0.9) + grass(t, 270) + person(320, 300, t, { mood: \"curious\", pose: \"think\" }) + tag(\"أول مشهد\", 320, 80, u, 0.4);\n});\n"
    put("config.json", json.dumps(cfg, ensure_ascii=False, indent=2) + "\n")
    put("shots.js", shots)
    put("sfx.json", "[]\n")
    print(f"✓ اتعمل فولدر الفيديو: {d} (ستايل {style})")


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
def style_dir(d, cfg):
    """الستايل: cartoon (أنيميشن كرتون) أو sketch (سكتش / رسم هندسي)، أو custom = فولدر style/ جوه فولدر الفيديو."""
    st = cfg.get("style", "cartoon")
    if st == "custom":
        p = os.path.join(d, "style")
        if not os.path.isdir(p): die("الستايل custom محتاج فولدر style/ جوه فولدر الفيديو. اعمله بـ: video.py style <dir> --from cartoon")
        return p
    p = os.path.join(ENGINE, "styles", st)
    if not os.path.isdir(p): die(f"مفيش ستايل اسمه '{st}'. الموجود: cartoon، sketch، custom")
    return p


def hook_html(text):
    """*كلمة* = برتقالي، وبعد | سطر رمادي."""
    parts = text.split("|"); main = re.sub(r"\*([^*]+)\*", r'<span class="o">\1</span>', parts[0].strip())
    return main + ('<br><span class="gr">' + parts[1].strip() + '</span>' if len(parts) > 1 else "")


def outro_html(o):
    if not o: return '<svg id="outroArt" viewBox="0 0 580 300" style="top:98px;height:300px"></svg>'
    leg = "".join(f'<span><b>{i + 1}</b>{x}</span>' for i, x in enumerate(o.get("legend", [])))
    pts = "<br>".join(f"{i + 1}. {x}" for i, x in enumerate(o.get("points", [])))
    return (f'<div class="q">{o.get("q", "")}</div><svg id="outroArt" viewBox="0 0 580 300"></svg>'
            + (f'<div class="leg">{leg}</div>' if leg else "")
            + (f'<div class="stat"><div class="n">{o["stat"]}</div><div class="t">{o.get("statText", "")}</div></div>' if o.get("stat") else "")
            + f'<div class="pts">{pts}' + (f'<div class="more">معلومة زيادة: {o["more"]}</div>' if o.get("more") else "") + '</div>')


def cmd_build(d):
    if not os.path.exists(out(d, "timing.js")): die("شغّل timing الأول.")
    lines = lines_of(d); cfg = config_of(d); sd = style_dir(d, cfg); sketch = os.path.exists(os.path.join(sd, "IS_SKETCH")) or cfg.get("style") == "sketch"
    K = {}
    for k, v in cfg.get("keywords", {}).items():   # {"3": ["كلمة"]} أو {"3": {"كلمة": "o"}} (o برتقالي، b أزرق، g زيتوني في السكتش)
        K[int(k)] = v if isinstance(v, dict) else {w: ("o" if sketch else "k") for w in v}
    for i, ws in K.items():
        for w in ws:
            if i >= len(lines) or w not in lines[i].split(" "): print(f"  ! الكلمة '{w}' مش موجودة في السطر {i} بالظبط (لازم تتكتب زي ما هي في السكريبت)")
    caps = [{"w": l.split(" "), "k": [K.get(i, {}).get(w, "") for w in l.split(" ")]} for i, l in enumerate(lines)]
    shots = open(os.path.join(d, "shots.js"), encoding="utf-8").read()
    js = "(function () {\n" + open(os.path.join(sd, "helpers.js"), encoding="utf-8").read() + "\n" + open(os.path.join(sd, "panel.js"), encoding="utf-8").read() + "\n// ── shots.js ──\n" + shots + "\n})();\n"
    open(out(d, "scenes.js"), "w", encoding="utf-8").write(js)
    data = "window.CAPS = " + json.dumps(caps, ensure_ascii=False) + ";\nwindow.CFG = " + json.dumps({k: cfg.get(k, "") for k in ("title", "sub", "brand")}, ensure_ascii=False) + ";"
    html = open(os.path.join(sd, "template.html"), encoding="utf-8").read().replace("/*DATA*/", data)
    sk = cfg.get("sketch", {})
    html = (html.replace("/*BRAND*/", cfg.get("brand", "")).replace("/*CATEGORY*/", sk.get("category", ""))
                .replace("/*HOOK*/", hook_html(sk.get("hook", cfg.get("title", "")))).replace("/*OUTRO*/", outro_html(sk.get("outro"))))
    defs = os.path.join(d, "defs.svg")
    if os.path.exists(defs): html = html.replace("<!--DEFS-->", open(defs, encoding="utf-8").read())
    open(out(d, "index.html"), "w", encoding="utf-8").write(html)
    shutil.copytree(os.path.join(ENGINE, "fonts"), out(d, "fonts"), dirs_exist_ok=True)   # الخط جوه الحزمة، فالرسم مش محتاج إنترنت
    n = len(re.findall(r"\bshot\s*\(", shots))
    print(f"✓ build/index.html جاهز (ستايل {cfg.get('style', 'cartoon')}، {n} مشهد لـ{len(lines)} سطر)")
    need_n = len(lines) - 2 if sketch else len(lines)
    if n < need_n: print(f"  ! فيه سطور من غير مشهد خاص بيها: المشهد اللي قبلها هيكمل عليها")


# ── فيديو مرجع ───────────────────────────────────────────
def cmd_frames(src, dst, n=16):
    """يطلع n لقطة من فيديو مرجع + صورة واحدة فيهم كلهم (sheet.png) عشان Claude يشوف الستايل."""
    need("ffmpeg"); os.makedirs(dst, exist_ok=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip() or 0)
    if not dur: die("مش قادر أقرا الفيديو: " + src)
    for i in range(n):
        t = dur * (i + 0.5) / n
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", src, "-frames:v", "1", "-vf", "scale=360:-2", os.path.join(dst, f"f{i + 1:02d}.png")], check=True)
    cols = 4; rows = (n + cols - 1) // cols
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(dst, "f%02d.png"), "-vf", f"tile={cols}x{rows}:padding=6:color=gray", "-frames:v", "1", os.path.join(dst, "sheet.png")], check=True)
    info = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip()
    print(f"✓ {n} لقطة في {dst} (الفيديو {dur:.1f} ثانية، {info})\n✓ كلهم في صورة واحدة: {os.path.join(dst, 'sheet.png')}")


def cmd_style(d, base="cartoon"):
    """ينسخ ستايل جاهز لفولدر الفيديو (style/) عشان يتعدّل يقرّب من فيديو مرجع، ويخلي config يستخدمه."""
    src = os.path.join(ENGINE, "styles", base)
    if not os.path.isdir(src): die("الأساس لازم يبقى cartoon أو sketch")
    dst = os.path.join(d, "style")
    if os.path.exists(dst): die("فيه فولدر style/ بالفعل في " + d)
    shutil.copytree(src, dst)
    if base == "sketch": open(os.path.join(dst, "IS_SKETCH"), "w").write("")
    cfg = config_of(d); cfg["style"] = "custom"
    json.dump(cfg, open(os.path.join(d, "config.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"✓ اتنسخ ستايل {base} لـ{dst}، وconfig.json بقى style=custom. عدّل template.html وhelpers.js جوه الفولدر ده.")


def cmd_compare(d, ref_sheet):
    """صورة واحدة فيها المرجع جنب رسمنا عشان المقارنة."""
    mine = out(d, "sheet.png")
    if not os.path.exists(mine): die("شغّل check الأول.")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", ref_sheet, "-i", mine, "-filter_complex",
                    "[0:v]scale=-2:1400[a];[1:v]scale=-2:1400[b];[a][b]hstack", out(d, "compare.png")], check=True)
    print("✓ المقارنة (المرجع شمال، رسمنا يمين):", out(d, "compare.png"))


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
    if c == "frames": cmd_frames(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith("--") else "ref"); sys.exit(0)
    if c == "style": cmd_style(d, sys.argv[sys.argv.index("--from") + 1] if "--from" in sys.argv else "cartoon"); sys.exit(0)
    if c == "compare": cmd_compare(d, sys.argv[3]); sys.exit(0)
    if c == "init": cmd_init(d, sys.argv[sys.argv.index("--style") + 1] if "--style" in sys.argv else "cartoon")
    elif c == "timing": cmd_timing(d)
    elif c == "build": cmd_build(d)
    elif c == "check": cmd_check(d)
    elif c == "sound": cmd_sound(d)
    elif c == "render": cmd_render(d, fps)
    elif c == "all": cmd_timing(d); cmd_check(d); cmd_sound(d); cmd_render(d, fps)
    else: print(__doc__)
