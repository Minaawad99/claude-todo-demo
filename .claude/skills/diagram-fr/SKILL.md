---
name: diagram-fr
description: >
  Make a French «Comment ça marche ?» explainer video in the "الرسم الهندسي" (technical-diagram / isometric) style, for a
  French TikTok audience: casual spoken French with «tu», a left-to-right page in Noto Sans, the brand «Comment ça marche ?»
  in place of «إيه الحكاية؟», cream graph-paper panels, isometric drawings close to the real thing, leader-line labels,
  a summary card, a cream-paper isometric cover and French titles. Built like «Comment le TGV roule à 320 km/h ?»
  (videos/tgv-fr/). Use when the user says "الدايجرام الفرنساوي", "دايجرام فرنساوي", "بالفرنساوي زي فيديو التي جي في",
  "زي فيديو القطر الفرنساوي", "Comment ça marche", "French diagram" or asks for a French video in the diagram style.
---

# «Comment ça marche ?» — the French diagram style (الدايجرام الفرنساوي)

The user's name for this style is **«الدايجرام الفرنساوي»** (the French diagram). It is the «الرسم الهندسي» style
(`.claude/skills/diagram/SKILL.md`) made for France: same look, same drawing rules, same pacing, but the video, the
captions, the cover and the titles are all in French, and the channel name on screen is **«Comment ça marche ?»**.

The reference build is `videos/tgv-fr/` («Comment le TGV roule à 320 km/h ?», 26 lines, 1:33) and its cover
`brand/eh-elhekaya/cover-tgv-fr-tiktok.html`. **Start every new French video from a copy of `videos/tgv-fr/`.** Look at
`reference/tgv-fr-frames.jpg` (one frame per line) and `reference/tgv-fr-cover.jpg` before drawing.

Read `.claude/skills/diagram/SKILL.md` first: everything there applies (close to reality, isometric by default, hatching,
cut-aways and sections, real maps, palette, one short caption per line, chapter markers, summary card, calm motion).
This file only lists what changes for French.

Talk to the user in Egyptian Arabic; everything that goes on screen or in the voice is in French. Ask the quick-mode
question first, as in the animation skill.

## 1. Topics

Things French viewers use or are proud of, explained as "how it works": the TGV, the electricity in the socket (70 %
nuclear), the baguette oven, the Navigo pass, the Channel Tunnel, the Eiffel Tower in the wind, the carte Vitale,
Airbus in Toulouse, Ariane 6 from Kourou. Pick a topic with a real path or mechanism to draw. Offer the user 3 with a
one-line reason and the surprising fact, translated into Arabic so they can choose.

## 2. Script → `videos/<slug>/script.txt`

- 24–28 lines, one sentence per line, about 1:30–1:50 of voice (French has many short words: the TGV script is 362 words
  for 1:32 after tightening).
- **Casual spoken French from France**, the way people talk on TikTok: «tu» (never «vous»), «t'es», «y a», «c'est pas»,
  «du coup», «en gros», dropped «ne». Never formal written French.
- Fixed shape:
  - line 0: a hook on something the viewer knows («Tu montes dans le TGV à Paris, et … t'es à Marseille.»);
  - lines 1–2: the number, then the puzzle as a question;
  - line 3 exactly: **«Comment ça marche ? Je t'explique en une minute.»**;
  - 3–4 chapters (each opened by a chapter marker), one idea per line, with real numbers and one real-life comparison per
    technical idea («≈ 100 voitures», «≈ 10 tours Eiffel couchées»);
  - one misconception: «Beaucoup pensent que…» → «Raté : …»;
  - the record or surprising fact, then «En gros : …» recap;
  - last line exactly: **«Dis-nous en commentaire ce que tu veux qu'on t'explique la prochaine fois !»**.
- Numbers the voice must say are written as words («vingt-cinq mille volts», «cinq cent soixante-quatorze virgule
  huit»); the drawings use digits («25 000 V», «574,8 km/h», French decimal comma, thin space in thousands).
- Verify every fact and list the sources in `refs/SOURCES.md`. Tell the user (in Arabic) which facts are surprising.
- Give the user the script in one copy-ready block **plus a short Arabic summary of what it says**, since they don't
  read French. Always recommend that a French speaker checks the script and the voice before posting.

## 3. Voice (Gemini TTS, generated here)

`python3 ../tools/tts.py script.txt style.txt voice-raw.wav --voice Puck --model gemini-3.8-flash-tts`, style text:

```
Speak in casual, natural spoken French from France (Paris), like a friendly French YouTuber explaining how something works to a friend, using "tu". Calm, clear explaining tone, warm and curious, with real amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Use relaxed everyday pronunciation (drop the "ne" naturally, "t'es", "y a"). Read "<ACRONYM>" as French letters. Emphasize key words like <word>, <word>, <word>. Make the opening intriguing and "Comment ça marche ?" playful.
```

Audio pipeline as in the animation skill, with **`--lang fr`** for the aligner:

```
python3 ../audio/tighten.py voice-raw.wav voice.wav --max 0.3
python3 ../align_asr.py voice-raw.wav script.txt raw-timing.json --model $M --lang fr --gap 0.08 --db -34
python3 ../map_timing.py voice-raw.wav raw-timing.json voice.wav timing.js --max 0.3 --tempo 1.0
```

Read the heard-text column. Whisper writes French numbers as digits (fine). If it hears things that are not in the script
(«*Rires», «YAH», «Aum» in the TGV take), tell the user the second to listen to: it can be a laugh or a breath the TTS
added.

## 4. Build (`videos/<slug>/diagram/`, copied from `videos/tgv-fr/diagram/`)

- `template-fr.html`: the diagram template made French: `lang="fr" dir="ltr"`, **Noto Sans** (+ Noto Serif for big
  numbers) instead of Noto Sans Arabic, the brand and the small corner mark «Comment ça marche ?», caption 14 px.
- `build.py`: like the diagram one, but it reads `template-fr.html` and, while copying the shared
  `videos/_templates/diagram/_helpers.js`, swaps the font to Noto Sans and flips the label anchors for a left-to-right
  page. Never edit the shared helpers for French.
- `episode.py`: `CFG` (title, category, outro card in French: the question, a small drawing with ①②③④ callouts, a
  2-column legend, one big stat in orange-red with a decimal comma, 3 numbered points, the boxed closing line
  «Dis-nous en commentaire… ce que tu veux qu'on t'explique la prochaine fois !») and `K` (the coloured caption words:
  o orange = numbers/action/danger, b blue = technical term/data, g olive = place/part). Keys must match the script
  words exactly, punctuation included («l'électricité.»).
- `shots.js`: one `shot(line, cam, draw)` per line, drawing helpers for the topic's real objects at the top, and
  `window.__parts` exporting what the cover needs (`isoAt`, `iso`, `isoBox`, `isoFace`, `isoCyl`, the main object…).
- Maps: real outlines projected once with d3-geo (see `videos/tgv-fr/refs/geo-make.mjs`: France from world-atlas
  countries-50m, conic conformal, metropolitan polygons only). Install `d3-geo topojson-client world-atlas` in a scratchpad
  folder and run it there; store the result in `diagram/geo.js`.
- Check before the long render, even in quick mode: one frame per line on a contact sheet (render it with playwright and
  look at it once). Fix labels running off the panel and objects drawn too small.
- **Motion:** the TGV QA failed on still stretches (a wheel section that never moved, a curve that finished drawing
  early). Give every shot something that keeps moving to the end: a wheel turning, sleepers scrolling, a dot running along
  the line, a counter, a pulsing glow.

## 5. Sounds, render, QA

As the diagram skill (soft paper whooshes, ticks, a low hum), then:

```
TAIL=1.5 node render.js $PWD/<slug>/diagram/index.html <mix.wav> <scratchpad>/<slug>.mp4
```

If qa.py says the loudness is low (the TGV came out at −15 LUFS), remux the mix onto the video without re-rendering:
`-af "apad,afade=t=out:st=<end-0.8>:d=0.8,loudnorm=I=-13.5:TP=-1.5:LRA=11,aresample=192000,alimiter=limit=0.84:level=false:attack=1:release=60,aresample=48000"`.

## 6. Cover (`brand/eh-elhekaya/cover-<slug>-tiktok.html`, copied from `cover-tgv-fr-tiktok.html`)

**The user wants the cover in the video's own diagram look, not the dark tunnel palette:**

- cream paper `#eee5d0` with the grid and paper grain, ink-dark text;
- the main object in isometric as a scale model on a ground slab with hatched edges (`isoBox` slab, a few details like
  trees or posts), between two thin rules (y about 298 and 706), clipped to that band so it never runs under the text;
- 2–3 leader-line labels (dot on the part, thin line, coloured word: orange-red, slate blue, olive), placed inside the
  frame;
- text in Noto Sans: «Comment ça marche ?» small grey (top 132), the title in Noto 900 36 px with the key number in
  orange-red (top 156; it may wrap to two lines), an olive sub-title (top 248), the punch line at top 726 with the number
  in orange-red and a grey second line;
- inside y 120–840 and away from TikTok's right-hand buttons (text box left 24 px, right 64 px).

Shoot with `node videos/tools/cover.js $PWD/<html> $PWD/brand/eh-elhekaya/tiktok-cover-<slug>-1080x1920.png`, look at it,
fix, commit, send.

## 7. Titles (in French)

Casual French like the voice. TikTok: 3 hook titles + a short description with hashtags, **#commentçamarche first**, then
topic tags (#TGV #SNCF #France #apprendresurtiktok #lesaviezvous…). Facebook: one title + a longer description with 3–4
emoji bullets and the closing question. YouTube Shorts: one title ending in #shorts + a two-line description. Each in its
own code block, then an Arabic note with the meaning of the three TikTok titles.
