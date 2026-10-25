# فيديوهات «طب إزاي؟»

كل فيديو ليه فولدر لوحده (زي `airplane/`)، وجواه:
- `script.txt`: السكريبت، كل سطر في سطر لوحده.
- `voice.wav`: الصوت.
- `timing.js`: توقيت كل سطر في الصوت.
- `index.html`: المشاهد. افتحها بـ `#play` ودوس على الصفحة عشان تشوف الفيديو شغال بالصوت.

لو عايز تطلّعه تاني:

```
python3 videos/align.py videos/airplane/voice.wav videos/airplane/script.txt timing.json
node videos/render.js "$PWD/videos/airplane/index.html" "$PWD/videos/airplane/voice.wav" airplane.mp4
```

`align.py` بيطلّع ملف `timing.json`. حط محتواه في `timing.js` بعد `window.TIMING = `. والريندر محتاج Playwright وffmpeg.
