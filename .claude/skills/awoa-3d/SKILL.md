---
name: awoa-3d
description: >
  Make an «إيه الحكاية؟» warning video in the «أوعى 3D» style the user picked from a reference video (a gas-cylinder
  warning): a photoreal three.js kitchen or room, the dangerous object shown as a blue x-ray hologram so the viewer sees
  inside it, a fixed red «أوعى!» header with the key formula, one-line captions that reveal word by word with a coloured
  key word, small source chips, number badges, a checklist that ticks, and a white summary card. The script opens with
  «استنى! لو… أوعى…». Built like «أوعى تطفي زيت مولّع بالمية» (videos/oil-fire/). Use when the user says "أوعى 3D",
  "بأسلوب أوعى", "فيديو تحذيري", "زي فيديو الزيت", "زي فيديو الأنبوبة التحذيري" or "warning 3D style".
---

# «إيه الحكاية؟» — the «أوعى 3D» style (فيديو تحذيري واقعي)

The user's name for this style is **«أوعى 3D»**. It is for **warning videos**: something people do at home that is
dangerous, why it is dangerous inside, and what to do instead. The reference build is `videos/oil-fire/`
(«أوعى تطفي زيت مولّع بالمية»: 25 lines, 1:36, `real3d/`) and its cover
`brand/eh-elhekaya/cover-oil-fire-3d-tiktok.html`. **Start every new video from a copy of `videos/oil-fire/real3d/`.**

Look at `reference/` first: `ref-sheet-1..3.jpg` are the user's reference video shot by shot; `oil-fire-frames.jpg`
is our build.

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. Voice, audio
pipeline, sounds and QA work as in `.claude/skills/animation/SKILL.md`; render and cover settings are below.

## 1. Topics that fit

A real, common household danger with a clear physical reason and a clear right action: water on burning oil, mixing
bleach with other cleaners, a gas water heater in a closed bathroom (carbon monoxide), charging a phone under the pillow,
too many plugs on one socket, opening a stuck lift between floors, honey for babies under one year. The object must be
something we can draw in 3D and "x-ray" to show what happens inside.

## 2. Script → `videos/<slug>/script.txt` (the warning shape, from the gas-cylinder video)

- 24–27 lines, one sentence per line, about 240–280 words → about 1:35–1:50 of voice.
- Casual Cairo Egyptian Arabic, «إنت».
- Fixed shape:
  - line 0: «استنى! لو <الموقف>، أوعى <الغلط>.»;
  - line 1: why people do it and what it can cause («ناس كتير بتعمل كده…، و… ممكن…»);
  - line 2: exactly «إيه الحكاية؟ هشرحهالك في دقيقة.»;
  - the middle: what happens inside, step by step, with real numbers (temperatures, ×times, litres, minutes);
  - one «طب الصح إيه؟» turn, then the right actions, then the «أوعى» don'ts;
  - one or two prevention lines («وعشان ما يحصلش من الأول…»);
  - second-to-last line exactly: «شارك الفيديو ده مع أهلك، يمكن ينقذ بيت.»;
  - last line exactly: «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- Numbers as words when spoken. Verify every fact; safety advice must follow official guidance (civil defence /
  fire service / health authority). Egypt's fire service is **180**, ambulance **123**.
- Run it through the `humanizer` skill, keeping the fixed lines word for word. Give the script in one copy-ready block,
  commit it, then the voice style text.

## 3. Voice (Gemini TTS, generated here)

`python3 ../tools/tts.py script.txt style.txt voice-raw.wav --voice Puck --model gemini-3.8-flash-tts` (the API key
comes from the environment's network secret). Style text:

```
Speak in casual Egyptian Arabic (Cairo dialect), like a friendly YouTuber giving an urgent but calm safety warning about <topic>. Start the first word "استنى!" with real urgency, then warm, confident and clear, with real amazement on the surprising facts and numbers. Natural, relaxed conversational speed, not rushed. Take a short natural breath between sentences, and don't stop at commas. Emphasize key words like أوعى, <word>, <word>, <word>. Make the question "إيه الحكاية؟" playful and the line "شارك الفيديو ده مع أهلك" sincere. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

Check every take with `align_asr.py` (no invented lines), then `tighten.py --max 0.3` and `map_timing.py`.

## 4. The look (from the reference)

- **A photoreal room**, dark and moody, lit warm: wood cabinets, stone counter, stainless appliances, tiled wall, a
  window on a night city, a ceiling light. ACES tone mapping, exposure about 0.6, soft shadows. Never bright white walls.
- **The x-ray object:** when the voice explains the inside, the object turns into a **transparent blue hologram**
  (`MeshPhysicalMaterial` light blue, opacity about 0.3, emissive blue, plus white `EdgesGeometry` lines), and the
  contents inside are drawn in real colours (oil amber, water bright blue, gas bubbles white).
- **The camera never cuts hard and never parks:** each line eases from one camera key to the next (wide → medium →
  close → macro), with a small hand-held drift; a shake only for an explosion.
- **Header (fixed, top):** «أوعى!» in red (Noto 900), under it the key formula in one line, e.g.
  «<blue>مية</blue> + زيت مولّع = <orange>كورة نار</orange> ×1700», on a dark translucent pill.
- **Caption:** one line under the middle of the frame, white Noto 800 with a dark shadow, revealed word by word over the
  line; key words coloured: blue (water / the thing), orange (fire / danger), green (the fix).
- **Source chip** just above the caption: a small dark rounded box, «المصدر: …» in tiny text, changing with the topic
  of the line. Use real sources only (and list them in `refs/SOURCES.md`).
- **Number badge** top-left (counting up: temperature, ×times, litres, minutes) and **leader-line chips** attached to
  3D points (projected each frame).
- **Checklist** top-right from the «طب الصح إيه؟» line on: 3 items that turn green ✓ as the voice says them.
- **Red ✕** in the middle for each «أوعى» don't.
- **Summary card** on the last line: white card, the question as a heading, one big number in gold, a yellow
  highlight line, 3 numbered actions, a yellow line with the emergency number, a grey sources box, and a dashed box
  «قولولنا… عايزين تعرفوا حكاية إيه المرة الجاية؟». Items appear one by one.
- «إيه الحكاية؟» small at the bottom. Never «طب إزاي؟».

## 5. Build (`videos/<slug>/real3d/`, copied from `videos/oil-fire/real3d/`)

- `index.html`: the 360×640 page with `<canvas id="gl">` (render.js turns on software WebGL when it sees it) and the
  HUD (header text, checklist items and summary card are written here per episode).
- `three.iife.js`: three.js 0.170 bundled as a classic script (window.THREE, RoomEnvironment, RoundedBoxGeometry), so
  the page runs from file://. Rebuild with esbuild if more addons are needed.
- `build.py`: makes `caps.js` from `../script.txt` with the coloured key words `K`.
- `scene.js`:
  - the room (textures drawn on canvases: wood, stone, tiles, floor, night city), the lights;
  - the episode's objects, each with a solid and an x-ray version, plus effects as sprites (fire, smoke, steam,
    powder) and a flickering point light for fire;
  - camera keys `C(px, py, pz, tx, ty, tz, fov)`;
  - **one state function per script line** `S[i](u, d)` returning `{a, b (camera keys), …object states, badge, chips,
    check, x, src, card}`; `apply()` sets everything and renders; `renderAt(t)` picks the line.
  - `window.GL_W/GL_H` let the cover page render the same scene at 540×960.
- Check before rendering, even in quick mode: render about 16 frames across the video with a small playwright script
  (software WebGL flags `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`), put them on one contact
  sheet and look at it. The first oil-fire pass was overexposed with huge white flames; fix light, sizes and cameras
  before the long render.

## 6. Sounds

`cues.js` → `cues.json` → `audio/sfx.py` (synthesized): sizzle under fire, boom + whoosh for a blast, splash/pour,
steam, clank for a lid, tick for a knob, thud for a door, pops for the checklist and the card.

## 7. Render (about 1 hour: software WebGL, about 1.2 s a frame)

```
FPS=30 SCALE=2 TAIL=1.5 node render.js $PWD/<slug>/real3d/index.html <mix.wav> <scratchpad>/<slug>-720.mp4
ffmpeg -y -i <720.mp4> -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -profile:v high -preset slow -crf 16 -pix_fmt yuv420p -r 30 \
  -af "alimiter=limit=0.6:level=false:attack=1:release=60" -c:a aac -b:a 192k -ar 48000 -movflags +faststart <final.mp4>
python3 qa.py <final.mp4>
```

30 fps like the reference (60 fps would take 2 hours). Run it in the background and tell the user the time left when
asked (the log prints every 600 frames).

## 8. Cover

Copy `brand/eh-elhekaya/cover-oil-fire-3d-tiktok.html`: it loads the episode's `timing.js`, `caps.js`,
`three.iife.js` and `scene.js` at 540×960, renders one dramatic moment (`shoot(t)`), and adds 2 projected tags. Try 4–5
moments on a contact sheet first, then shoot the chosen one at 2x with software WebGL. Title «<red>أوعى</red> …!»
(Noto 900, about 33 px so it stays on one line), yellow sub-title with the consequence, punch line with the key number.
Keep the text inside y 120–840 and away from the right-hand buttons (tags too).
