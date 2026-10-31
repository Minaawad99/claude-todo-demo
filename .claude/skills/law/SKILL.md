---
name: law
description: >
  Make an «إيه الحكاية؟» explainer video in the «لو» style the user picked (built like the nuclear shelter video «تعمل ملجأ
  نووي إزاي؟»): the video opens with «لو عملت كذا… يبقى عملت كذا؟», then builds the thing step by step as a chain of
  «بس… (problem)» → «عشان كده… (fix)», on one cross-section drawing that grows part by part, and ends with «ومبروك، كده إنت
  عملت…». Use when the user says "بأسلوب لو", "بطريقة لو", "زي فيديو الملجأ", "law style" or "build-along style". Every
  other step (voice, references, sounds, render, QA, cover, titles) follows the animation skill.
---

# «إيه الحكاية؟» — the «لو» style

The user's name for this style is **«لو»**. The reference build is the nuclear shelter video: `videos/nuclear-shelter/`
(script, voice, `cartoon/`, 26 lines, 276 words, 1:45) and its cover `brand/eh-elhekaya/cover-nuclear-shelter-3d-tiktok.html`.
Its structure came from a video the user sent (a 3D back-garden shelter explainer, "but… so you add…"); the script and the
drawings are our own.

It is not a replacement for the «إيه الحكاية؟» animation style: use it only when the user asks for «لو».

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. Voice (Gemini Puck),
reference research, audio pipeline, sounds, render, QA, cover and titles all work exactly as in
`.claude/skills/animation/SKILL.md`. Only the script shape, the voice style text, the on-screen title and the way the
shots build up change.

## 1. Topics that fit

Something the viewer could, in theory, build or set up themselves, where each part exists to solve a problem: a shelter,
a house that survives an earthquake, a well, a raft, a pyramid, a space suit, a city on Mars. If the topic is "how does X
work" with no building, use the animation style instead and say why.

## 2. Script → `videos/<slug>/script.txt`

- 24–28 lines, one sentence per line, about 240–280 words → 1:40–1:50 of voice.
- Casual Cairo Egyptian Arabic, speaking to the viewer as «إنت» («بتنزّل», «بتحفر», «بتركب»).
- **No «إيه الحكاية؟ هشرحهالك في دقيقة.» line.** The hook question does that job.
- Fixed shape:
  - line 0: the naive idea as a question: «لو <عملت الحاجة البسيطة>، يبقى عملت <الحاجة>؟»;
  - line 1: why it fails: «للأسف لأ، …»;
  - line 2: the first real step: «عشان كده بتـ…», with a real number;
  - the middle: 5–7 rounds of **«بس <مشكلة جديدة>.» → «عشان كده <الحل>.»**. A round may get one extra line for a number or
    the reason the fix works («والخبر الحلو إن…», «فالـ… بيوقفوا…»). Each fix adds one visible part to the build;
  - one misconception pair near the end: «ناس كتير فاكرة إن…» → «والحقيقة إن…», with the surprising number;
  - one line of finishing touches: «ضيف …، و…، و…»;
  - the payoff: «ومبروك، كده إنت عملت <الحاجة>.»;
  - last line, exactly: «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- Write numbers as words when the voice must say them («تسعين سنتي», «تسعة وتسعين وتسعة من عشرة في المية»).
- Verify every fact and list the sources in `refs/SOURCES.md`. Tell the user which facts are surprising and that they were
  checked.
- Run it through the `humanizer` skill, keeping the «بس / عشان كده» pattern and the last line word for word. Give the script
  in one copy-ready code block, commit it, then give the voice settings.

## 3. Voice style text (`videos/<slug>/style.txt`)

Same voice and model as the animation skill (Puck, gemini-3.8-flash-tts, temperature 1). Fill in the topic and the key
words:

```
Speak in casual Egyptian Arabic (Cairo dialect), like a friendly YouTuber walking the viewer step by step through building <the thing>, each problem followed by its fix. Warm, confident and curious, with real amazement on the surprising facts and numbers, and a little suspense on each "بس" problem before the "عشان كده" fix. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like <word>, <word>, <word>. Make the opening question intriguing and the final "ومبروك" proud and playful. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

## 4. Screen

The same cartoon panel as the animation style (black frame, Noto title, one 16:9 panel, word-by-word captions with yellow
keywords, the «إيه الحكاية؟» brand at the bottom). Start from a copy of `videos/nuclear-shelter/cartoon/`.

- **Title:** «تعمل <الحاجة> إزاي؟» (Noto 900), with a short yellow sub-title giving the setting or the twist («في جنينة
  بيتك!»).
- **One build that grows.** Draw the thing once, in cross-section, as a function that takes the parts built so far (the
  shelter: `pipeShelter(t, {parts: {turns, air, valve, door, escape, beds, food, radio, geiger}})`, plus `entrance`,
  `airPipe`, `escape`). Every «عشان كده» shot turns on one more part, so the viewer watches the thing get built. Keep
  parts from earlier shots on screen in later ones.
- **Problem shots («بس…»)** show the danger hitting the build so far: the blast wave, the dust falling, the rays coming in
  through the door, people sweating. Use a red ✗ or a shocked character on what fails.
- **Fix shots («عشان كده…»)** push in on the new part as it appears, with a brush tag naming it and the number.
- **The payoff shot** pulls back to show the whole build at once, every part in place, the people inside happy.
- Motion and QA rules as in the animation skill.

## 5. Cover

Same rules as the animation skill (full bleed, dark top and bottom, a warm glow behind the subject, Noto text, safe area
y 120–840). The «لو» reference is the shelter cover: a 3D (three.js) diorama of the finished build cut open, with one
or two tags for the key numbers. The hook title is the on-screen title («تعمل … إزاي؟»), the yellow sub-title the setting,
and the punch line is the misconception fact («هتقعد فيه أسبوعين بس / مش سنين زي ما فاكر!»). Serve the repo with
`python3 -m http.server` from the root to shoot a three.js cover.
