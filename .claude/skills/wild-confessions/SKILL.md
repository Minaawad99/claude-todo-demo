---
name: wild-confessions
description: >
  Make an «اعترافات برّية» (Wild Confessions) episode: a vertical 9:16 talk-show where the user (the host, with their own
  face) interviews an animal (or any non-human guest) that answers in its own voice and "confesses" the truth behind a
  popular myth, with motion-graphic inserts between the answers. Covers everything end to end: script, Gemini TTS voices,
  copy-paste Veo/Gemini prompts for the host and guest clips, fitting our voice onto Veo's lip and beak movements,
  motion-graphic inserts, music bed and effects, assembly, QA, covers (reel, Instagram 3:4, YouTube 16:9) and post copy
  for Facebook, YouTube, TikTok and Instagram. Use when the user says "اعترافات برّية", "حلقة جديدة مع حيوان",
  "بودكاست مع حيوان", "زي فيديو الغراب", "زي فيديو الجمل", or "wild confessions".
---

# «اعترافات برّية»: talk show with an animal guest

The user's show. The first episode is the crow (`examples/crow/`): read its `production.md`, `lines.tsv`,
`episode.json` and `inserts/` before making a new one, since they are a full worked example. The format came from a
reference video the user sent (a host interviewing a talking camel). Our version has its own name, look and voices:
never copy another channel's name, watermark, set or wording.

**Talk to the user in Egyptian Arabic.** Keep messages short and practical. Every prompt the user has to paste
somewhere goes in its own code block, complete and ready to copy, with the spoken line already inside it. The user
said clearly: "مش كل جملة انسخ كلمة".

## 0. What the user does and what you do

| Step | Who |
|---|---|
| Topic, script, facts, sources | you |
| Voices (Gemini TTS) | you (`scripts/voices.py`) |
| 4 master images (studio + host face + guest) | user in Gemini (Nano Banana), with your prompts and their face photos |
| Talking clips H (host) and K (guest), silent clips C, a few realistic R shots | user in Gemini (Veo), with your prompts |
| Voice on lips (H, K) | you (`scripts/sync.py`, `scripts/lipfit.py`) |
| Motion-graphic inserts M, place stamps PIN, end card, watermark | you (`inserts/`) |
| Assembly, music, effects, QA | you (`scripts/build.py`, `scripts/qa/`) |
| Covers + post copy | you (`covers/`, `examples/crow/social.md`) |

Image and video generation are done by the user, not by you, even if a Gemini key works here: the free API tier has
no image or video quota, and the user's face must come from their own account. Check what is actually available before
promising anything (one tiny request per model).

## 1. Identity (fixed for every episode)

- **Name:** «اعترافات برّية». Watermark: the name, white at 28% opacity, on Veo shots only, **never on graphics**.
  On graphics it covered place names and labels.
- **Look:** a late-night natural-history archive. Dark walnut shelves, specimen jars, framed anatomical plates, pinned
  feathers, tungsten lamps, a brass globe, two cognac leather armchairs, a vintage brass microphone in front of the guest.
  Palette: amber `#E8A33D`, charcoal `#121010`, cream `#F3E6CF`. The reference used teal and neon; we never do.
- **Host:** the user's face, from their reference photos. Fixed outfit: an open dark olive overshirt on a black t-shirt.
  Write a fixed English description of the face once (hair, brows, beard, build) and paste it into every prompt.
- **Graphics:** black background with an amber rim light, floating dust, a small mono label top-left in museum brackets
  `⌜ … ⌝`, and a short Arabic caption at the bottom.

## 2. Topic and script → `videos/<slug>/lines.tsv`

- A guest with a famous myth or bad reputation, and 4–6 surprising, **verifiable** facts with real numbers and named
  studies. Check every fact and number; list the sources (study, journal, year) at the end of `production.md` and in the
  YouTube description.
- 22–26 lines, Modern Standard Arabic (simple), **one sentence per line**, `NN<TAB>host|guest<TAB>text`. Use tashkeel
  only where pronunciation is ambiguous.
- Shape:
  1. Host's hook: an embarrassing question about the myth («سؤالٌ محرجٌ قبل أن نبدأ، …؟»).
  2. Guest flips it with a strong claim, then 1–2 lines of proof.
  3. Host pushes back with what people believe.
  4. Rounds of guest facts, each opened by a short host question or reaction («يعني…؟», «سمعتُ أنك…»).
     Guest lines can be long (2–3 sentences): the first sentence is said on camera, the rest over inserts.
  5. A "secret" round: «وهنا السرّ الذي لم تكونوا تعرفونه.» followed by the most surprising fact.
  6. A one-line guest moral that turns the myth around.
  7. Host thanks with a joke, and the guest gets the last, short, funny line.
- The guest speaks in the first person («دماغي», «منقاري»). Name places («في السويد…») so a PIN stamp can open the fact.
- Target 2:45–3:00 after processing (YouTube Shorts allow up to 3:00).

## 3. Voices → `voice/`, `final/`

`episode.json` → `"voices"` (copy from `examples/crow/episode.json`):
- **Host:** Charon, calm curious host style, speed 1.05.
- **Guest:** a voice that fits the animal (crow: Algenib, deep, speed 1.45, pitch 0.94). The user asked for a faster
  guest twice ("مش عايزه بطيء") and for **no reverb** ("بدون الصدى الظاهر"): no echo, ever. Style text: wise, deep,
  confident, **normal pace, not slow, no long pauses**.

```
python3 scripts/voices.py videos/<slug>            # generates missing lines, then final/
python3 scripts/voices.py videos/<slug> --process  # after changing speed/pitch
```

Free TTS quota is tiny (about 3–10 requests per model per day). The script rotates models and waits. If it runs out,
tell the user and give them the AI Studio settings (voice, style, text) to make the missing lines themselves, or finish
the next day. **Always transcribe every line** (`scripts/qa/asr.py`): one model read the style text aloud instead of the
line.

## 4. Master images (the user makes them in Gemini)

Ask for 2–3 photos of the user's face (front, side). If they send a video, cut stills from it (ffmpeg) and show
them before using them. Then give four complete prompts, each with the full studio, host and guest text inside:
- **A:** over the guest's shoulder (guest blurred in the foreground), host in the chair, holding a leather folder.
- **B:** over the host's shoulder, guest on the armchair backrest with the brass mic.
- **C:** guest close-up at the mic.
- **D:** host medium close-up, looking off-camera at the guest.

Check the four for likeness and a consistent set before any clips get made. Small colour differences are fine, since
`build.py` can grade.

## 5. Clips (the user makes them in Veo); give every prompt complete

- **H (host talking), one per host line:** image A or D plus the spoken Arabic line inside the prompt. Veo then moves
  the lips on the same words, and we later replace Veo's voice with ours.
  ```
  The man in the image is a talk-show host. He looks at his guest and says in Arabic, calmly and curiously: "<LINE>" Natural lip movement, subtle head movement, natural blinking, small hand gesture. Static camera, warm studio light. Keep his face exactly the same.
  ```
  Add an action that fits the line (raises an eyebrow, holds up a walnut, closes the folder).
- **K (guest talking):** the user found that without the spoken line the beak does not move («مش واقعي»). Always put
  the line in the prompt:
  ```
  The black crow in the image is a talking animal in a film. It speaks into the brass microphone in Arabic, in a deep, wise voice: "<LINE or FIRST SENTENCE>" Its beak clearly opens and closes with every syllable, perfectly synced to the speech, small head tilts. Static camera, warm amber light. Keep the crow and the studio exactly the same.
  ```
  If the beak still doesn't move, add: `IMPORTANT: the beak must visibly open wide and close on each word.`
  For long guest lines, put only the first sentence in the K prompt; the rest goes over inserts.
- **C (silent reactions):** host listening and nodding (A), host amazed then laughing (D). `No speech.`
- **R (realistic, no image):** only what graphics can't do well: historical or religious scenes (no faces for sacred
  figures), real streets and animals in the wild, a moon silhouette. Usually 3–5 clips.
- **Durations:** pick the next Veo length above the line's length (4/6/8 s). Longer is safe; we trim.
- Ask for the first one or two clips before the rest, and check them (likeness, beak or lips moving, speech on time).

Save the user's uploads as `clips/<ID>.mp4` in the episode dir. **Don't commit clips or photos of the user's face**;
keep them out of git (scratchpad or `.gitignore`).

## 6. Voice on lips → `synced/`

List every talking clip in `episode.json` → `"sync"`, then run `python3 scripts/sync.py videos/<slug>`.
`lipfit.py` finds the phrases Veo spoke and the phrases in our line, places each of our phrases where Veo's starts
(with mild stretching), drops Veo's audio, and writes `synced/<ID>.mp4` plus a lossless `synced/<ID>.wav`.

Options per clip: `--part A:B` (only that slice of our line, for K clips that say the first sentence), `--skip N` (Veo
said N extra phrases first, e.g. repeated a word; check with ASR), `--span` (fit the whole line at once, when phrase
matching pairs the wrong parts). The `--max` speed-up comes from `voices.<speaker>.max_stretch`: host 1.2 (faster gets
unclear), guest 1.4.

**Split points (`--part`, and `from` in a block) must sit inside a real pause.** Find the pauses with `silencedetect`
(`-40dB`, `d=0.07`), then transcribe both halves to confirm the sentence ends where you think. A wrong split once left
the crow saying only «وأنا لا».

Bugs already fixed in `lipfit.py`; don't bring them back:
- Seek **before** time-stretching (`-ss/-t` before `-i`). Seeking after `atempo` cut every phrase in the wrong place,
  and the user heard every sentence clipped at the start and the end.
- Keep a margin of our own audio around each phrase (up to 0.15 s before, 0.40 s after), never cut into a neighbour.
- Never truncate our voice at the clip's end; hold the last frame instead.
- `build.py` reads the lossless `.wav`, never the AAC track of the mp4 (`-shortest` used to eat word endings).

## 7. Motion-graphic inserts → `inserts/`

One SVG scene per fact, written in JS on `inserts/lib.js` (backdrop, dust, label, caption, `crow()` silhouette, mask,
mono text, easing). Copy the closest scene from `examples/crow/inserts/` and adapt it: water tube (M14), brain with a
neuron counter (M18), counting 1–4 (M20), timeline with mobbing birds (M07), family tree (M10), gathering ring (M11),
tool making (M13), road and car (M15), planning clock with bars (M19). For a new guest, draw a new silhouette function
the same way `crow()` is built: a few primitives, facing left, origin at the feet, with a head group that can turn.

```
node inserts/snap.js videos/<slug>/inserts/M14.js /tmp/m14.png 1 4 7     # look at frames first, then fix
SHOW="اعترافات برّية" node inserts/render.js videos/<slug>/inserts/M14.js  # → inserts/out/M14.mp4
bash inserts/make_pins.sh videos/<slug>/inserts "JP|140.87|38.27|اليابان|SENDAI, JAPAN · 38.3°N"   # place stamps
SHOW="اعترافات برّية" node inserts/render.js inserts/END.js videos/<slug>/inserts/out              # end card
SHOW="اعترافات برّية" node inserts/render.js --still inserts/WM.js videos/<slug>/inserts/out/watermark.png
```

Always look at the snapshots before rendering, and fix overlaps and crow positions (the crow should stand **on** the
tube, the hook should go **into** the hole). Show the user 2–3 inserts first and ask if they like the style, then make
the rest. Numbers on screen must be real (or have no number at all).

## 8. Assembly → `build.py`

Write `episode.json` → `"blocks"` (format in the `build.py` docstring; full example in `examples/crow/episode.json`):
a `talk` block for every on-camera line, `over` blocks for the rest of long lines over PIN, M, R and C shots, a cover
for reactions, `fx` for whoosh/pop on stamps and for drops and clinks that match the graphics.

```
python3 scripts/build.py videos/<slug> /tmp/<slug>.mp4
```

It grades cool Veo shots warm (`"warm"`), synthesizes an original dark ambient bed (no music rights to worry about)
that ducks under speech, compresses the voice so quiet final syllables survive under music, and outputs 1080×1920
30 fps at −14 LUFS.

## 9. QA (before every send, no exceptions)

1. `python3 scripts/qa/tailcheck.py <out>-voice.wav <out>.mp4 synced/*.mp4` must print OK everywhere (no voice that
   stops dead while still loud).
2. Split the voice track at pauses and transcribe every segment (`qa/asr.py`, sherpa-onnx Whisper small from the
   k2-fsa GitHub releases). Compare with `lines.tsv` line by line: every last word must be there.
3. Contact sheet, one frame every 4 s: check likeness, graphics, watermark placement and that no shot is black or frozen.
4. Only then send, and say plainly what was checked.

## 10. Covers and post copy

- `covers/cover.html` → reel cover 1080×1920: glowing title on top, host left looking at the guest on the right, the
  myth question as the hook, «ضيف الحلقة: …». Images: master D (host) and C (guest).
- `covers/cover-ig.html` → Instagram version: title and hook moved inward so they survive the **3:4** profile-grid crop
  (check a 1080×1440 centre crop).
- `covers/thumb.html` → YouTube 1920×1080. A vertical video of 3:00 or less is a YouTube Short, and Shorts don't take
  an uploaded thumbnail; say so, and offer a horizontal cut if they want a normal video.
- Render with Playwright at the exact size. Change the texts and image paths per episode.
- Post copy for Facebook, YouTube (title, description with chapters from the final timings, sources, tags), TikTok and
  Instagram: follow `examples/crow/social.md`. End every post with a question about the next guest.

## 11. Tools this needs

ffmpeg, Python 3 with numpy, Node with Playwright and Chromium, internet for Google Fonts (Noto Kufi Arabic, IBM Plex
Mono, Lalezar) and the Gemini API. TTS uses `GEMINI_API_KEY` if it is set; otherwise a proxy must add the key.
