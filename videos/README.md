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

## النسخة التانية (`airplane-v2/`)

السكريبت أبسط ومقدمته أقوى، والرسم بقى مجسم. الطيارة فيها حجم ومنظور، والأسهم عريضة، والهوا نقط ماشية على خطوط، والممر متشاف كمقطع في الأرض.

ألوان القوى: الرفع أزرق، والدفع أحمر، ومقاومة الهوا أخضر، والوزن أسود.

محرك الحركة بقى في ملف مشترك اسمه `videos/engine.js`، عشان أي فيديو جديد يستخدمه.
