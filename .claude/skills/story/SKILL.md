---
name: story
description: |
  Make an «إيه الحكاية؟» video in the «القصة» style the user picked: a true historical story told hour by hour in calm
  storyteller Egyptian Arabic (about 4 minutes), drawn in real 3D (three.js) with toon shading and ink outlines — a city of
  thousands of little houses seen from the air, real machines and buildings built from their real shapes, and round-headed
  bean characters — 1080×1920 60 fps. Built on the Hiroshima test (`videos/hiroshima-3d/test/`), narration modelled on the
  reference the user sent (see REFERENCE.md). Use when the user says "القصة", "بأسلوب القصة", "بطريقة القصة",
  "زي فيديو هيروشيما 3D", "حكاية تاريخية" or "story style".
---

# «إيه الحكاية؟» — the «القصة» style

A separate style from `animation`, `sketch`, `law` and `story-2d` («القصة 2D», the cinematic 2D version): use it only when the user names it. Talk to the user in Egyptian
Arabic. Work in this order and show the user each stage before the next (the user's rule: "اعمله واعرضه عليا الأول").

## 1. Script → `videos/<slug>/script.txt`

About **4 minutes** of voice: 45–55 lines, one sentence per line, about 480–540 words (the storyteller voice reads about
130 words a minute with its pauses). Casual Cairo Egyptian Arabic, calm and warm, never a YouTuber's hype.

The narration shape (studied from the reference the user sent, see `REFERENCE.md`; take the method, never the text):

1. **Open on the day itself, through the senses:** the date, the weather, who lives there («موظفين وطلبة وأمهات»).
2. **A riddle in the first 20 seconds** that the story answers later (Hiroshima: why was the city the only one left
   untouched by the war? Because they wanted to see what one bomb would do to it).
3. **Then say how it will be told:** «ودي حكاية اليوم ده، ساعة بساعة. نبدأ قبل الفجر.»
4. **Clock times as chapter marks:** every few lines a time («الساعة سبعة وتسعة دقايق…»). Show each one on screen.
5. **Cut between two places at the same moment** (the bomber taking off on Tinian ↔ the city that couldn't sleep).
6. **Small human details:** what a name really means (Enola Gay was the pilot's mother), what people said to themselves
   («طيارة واحدة؟ أكيد استطلاع»), everyday acts just before (tea, washing, a student carrying wood).
7. **Plant and pay off:** show someone or something early (the man waiting on the bank steps, the clocks) and come back
   to it after the turning point.
8. **Put the viewer inside it once:** «تخيّل إنك واقف…» in second person, right at the turning point.
9. **The angle nobody tells:** what happened far away (Tokyo didn't know; the radio went silent; they learned from
   Washington 16 hours later).
10. **End on hope:** something that came back (the tram three days later, the first flower) and its meaning today.
11. Last line exactly «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟». No «هشرحهالك في دقيقة» line in this style.

- Write numbers as words when the voice must say them. Verify every fact and tell the user which surprising facts were
  checked and which are estimates.
- Run it through the `humanizer` skill, keep the last line word for word, give it in one copy-ready code block, commit.

## 2. Voice

The user picks: generate it here with `videos/tools/tts.py` (Puck, `gemini-3.8-flash-tts`, temperature 1; the free tier
allows about 10 requests a day, a 429 means wait for tomorrow) or the user makes it in AI Studio and sends the WAV. Either
way give the user the script and this style text (`videos/<slug>/style.txt`):

```
Speak in casual Egyptian Arabic (Cairo dialect), like a calm, heartfelt storyteller telling a true story to a friend late at night: <the story>. Low, warm, intimate voice, close to the microphone, never excited or salesy, never like a YouTuber. Slow, unhurried pace with real pauses: a long pause at every "…", and a short breath between sentences. Let the tension build quietly before the turning point, almost a whisper on "<the key word>", then heavy, sad and respectful on the numbers of the dead. Gentle and tender on the children and the small human details. End with quiet hope on the last lines. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

Audio pipeline as in the animation skill (section 4), but keep the story's pauses: `tighten.py --max 0.6` and
`map_timing.py ... --max 0.6`. Check the heard text line by line with `align_asr.py`: a line with extra words means the
take invented text; numbers often transcribe as digits, which is fine.

## 3. The look (fixed)

Copy `videos/hiroshima-3d/test/` → `videos/<slug>/world/` and grow it. One page, 360×640 at 3x, a full-screen WebGL
canvas (`<canvas id="gl">`, so `render.js` uses SwiftShader) under the captions.

- **three.js r149** from `videos/lib/three.min.js`. `R.outputEncoding = T3.LinearEncoding` (hex colours then show as
  written; sRGB washed everything out).
- **Toon shading:** `MeshToonMaterial` with a 3-step `NearestFilter` ramp (90/175/255). **Ink outline:** the
  inverted-hull trick, a `BackSide` copy in `#1b1d22` scaled 1.02–1.05 (`inked(geo, mat, w)`).
- **Light:** a hemisphere light (~.45) + one warm directional sun (~.75). A gradient sky dome (`skyMat(top, mid, bot)`)
  and fog matching the horizon.
- **Cities:** `InstancedMesh` boxes for walls + 3-sided cylinders for gable roofs, 10–16 thousand houses in street
  blocks, varied plaster and tile colours via `setColorAt`. Set `frustumCulled = false` on instanced meshes (their
  bounding sphere is the unit box, so three culls them). Fill the area densely: the loops must cover the area the camera
  sees, not stop when the count runs out on one edge.
- **Real objects from real shapes** (look at reference photos first, as in the animation skill's section 3): build each
  as a function returning a `Group` (the B-29, the Dome, the tram…). Rivers as planes, landmarks where they really are.
- **Bean characters** (the reference's people, our own design): a capsule body in a flat colour, a big skin-coloured
  sphere head, a hair cap (bob for girls), optional cap, small black ellipsoid eyes that blink, a torus-arc mouth, stick
  arms and legs. Moods by the mouth (smile / flat / down) and the eyes. Heads turn and tilt to react.
- **Camera always moving:** slow flyovers, push-ins, orbits; the subject moves too (props spin, eyes blink, smoke rises).
  No still stretch over 0.75 s.
- **Clock times and numbers** appear as big overlays (Noto Serif / Noto Sans Arabic 900) over the 3D.
- **Captions:** Noto Sans Arabic 800 19px white with a dark shadow at top 480px over a bottom fade, keywords yellow
  `#f2c230`, revealed word by word with the voice (same logic as `videos/hiroshima/film/template.html`), the brand
  «إيه الحكاية؟» at the bottom.
- **Scenes per line:** each script line gets a scene function `(u, d, t)` that places the camera and the actors, built
  from a few persistent `Scene`s (city, street, interiors, sky) so nothing is rebuilt per frame.

Show the user a short test clip of the first scenes before building everything.

## 4. Sound — effects only, no music

**No background music unless the user asks for it** (the user's rule). The mix is the voice plus sound effects made
for the story: `cues.js` → `audio/sfx.py`, `{"bed": false}`, and no `px-music-*` clips. Build the effects from what is
on screen: wind and water for places, a low drone (`px-space-drone.mp3`) and clock ticks for countdowns, `jet`, `boom`,
`spray`, `motor`, `splash`, `clank`, `bell` and the rest of `sfx.py`, plus sounds synthesized with ffmpeg into
`videos/<slug>/sfx/` when nothing fits (a phone ring, a siren, a crowd roar, a ship's horn: see `videos/crossing-1973/`).

## 5. Render and QA (in the background: ~0.45 s a frame, about 2 hours for 4 minutes)

```
TAIL=1.5 node render.js $PWD/<slug>/world/index.html <mix.wav> <scratchpad>/<slug>.mp4
```

The storyteller voice is quiet, so set the loudness with this remux (it gives about -14.4 LUFS, peak -2.5 dBFS):

```
ffmpeg -y -i <mp4> -i <mix.wav> -map 0:v -map 1:a -c:v copy -t <dur> -af "apad,afade=t=out:st=<dur-0.8>:d=0.8,aresample=192000,volume=6dB,alimiter=limit=0.5:level=false:attack=1:release=80,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=192000,alimiter=limit=0.8:level=false:attack=1:release=60,aresample=48000" -c:a aac -b:a 192k -ar 48000 -movflags +faststart <final.mp4>
python3 qa.py <final.mp4>
```

QA must PASS. A white flash or a dark hold counts as a still: keep rings, dust or the camera moving through it. Send the
mp4, commit and push the code; keep mixes and videos in the scratchpad.

Cover and titles follow the animation skill's section 9 when the user asks.
