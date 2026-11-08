---
name: diagram
description: >
  Make an «إيه الحكاية؟» explainer video in the "الرسم الهندسي" (technical-diagram) style, measured from 20 reference videos
  of the «طب إزاي؟» series that the user sent: cream graph-paper card, close-up technical drawings (isometric or cut-away)
  with leader-line labels, one short caption chunk at a time under a rule, no hard cuts, a word-by-word hook card, a
  stopwatch bumper, and a summary card plus ask box at the end. Built on the shared template videos/_templates/diagram.
  Use when the user says "بالرسم الهندسي", "بطريقة الرسم الهندسي", "زي طب إزاي", "زي فيديو الأشعة", "diagram style" or
  "technical style". Script delivery, voice, sounds, render, QA, cover and titles follow the animation skill.
---

# «إيه الحكاية؟» — the "الرسم الهندسي" style

The user's name for this style is **الرسم الهندسي**. It copies the look, the pacing and the narration of the «طب إزاي؟»
series: 20 reference videos, 720×1280 at 30 fps, mostly about 90 s long. We make it under our own name «إيه الحكاية؟».

**The full measured reference is `videos/_reference/tabizzay/STYLE.md`.** Read it before the first episode. It is in Arabic,
with every number, and it sits next to:
- a contact sheet of each video (`sheets/`);
- motion strips (`frames/`);
- all 20 transcripts (`transcripts.txt`).

This file is the short working version.

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. These follow
`.claude/skills/animation/SKILL.md`:
- voice settings;
- the tighten and align steps;
- sounds, render, QA, cover and titles.

## The name swap (always)

| Where | «طب إزاي؟» reference | Ours |
|---|---|---|
| promise line (line 2–3) | «طب إزاي؟ هشرحهولك في دقيقة.» | «إيه الحكاية؟ هشرحهالك في دقيقة.» |
| bumper word, small logo, watermark | «طب إزاي؟» | «إيه الحكاية؟» (logo: the speech-bubble mark, `brand/eh-elhekaya/`) |
| sign-off | «وده كان: طب إزاي …؟» | «ودي كانت حكاية …» |
| last line | «قولولنا، عايزين تعرفوا طب إزاي إيه؟» | «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟» |
| ask box | «طب إزاي ____ ؟» | «حكاية ____ ؟» |

Mid-script questions such as «طب ليه…؟» and «طب مين…؟» stay. They are the narration device, not the brand.

## Script (measured from the 20 transcripts)

**Numbers:**
- **Pace:** about 177 words a minute.
- **Length:** 230–290 words for about 90 s.
- **Phrases:** short, about 5 words. A long sentence is split over 2–3 shots, often ending in «…».
- **Flavour:** 4–6 «طب…؟» questions and 2–5 home analogies («زي…»). A number about every 15–20 s, said as words in the
  script and shown as digits in the caption (`CAPTEXT`).

**The fixed spine.** It holds in all 20 videos, at the same points of the run:

1. **Hook, 2–5 s.** A fact from the viewer's own life, then the contradiction, spoken to «you», with a number or an everyday
   thing in it:
   - «مفتاح جارك شبه مفتاحك جدًا… ومع ذلك مابيفتحش بابك.»
   - «ممكن تنام عشر ساعات… وتصحى برضه مهدود.»
2. **Promise, at about 4%.** «إيه الحكاية؟ هشرحهالك في دقيقة.»
3. **Optional rule.** «قبل ما نشرح محتاجين نوضّح قاعدة صغيرة… خليك فاكرها.» One law, called back later with «فاكر القاعدة؟».
4. **The steps.** Each stage opens with the viewer's question, then the answer, then an analogy. Go from what they know to
   what they don't: «فاكر كلمة السر بتاعة موبايلك؟ مفتاحك كمان كلمة سر، بس محفورة في الحديد.»
5. **The misconception, at about 70% (in 8 of 20).** «وناس كتير فاكرة إن…», then «لأ.» alone, then the truth. When the whole
   topic is a myth (the gas engine), this moves to the hook.
6. **The recap, at about 83%.** «يعني من الآخر…» in 3–4 short clauses, one part and one job each.
7. **The odd fact, at about 90%.** «والأغرب…», one history or odd fact.
8. **Sign-off and ask.** «ودي كانت حكاية …», then «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».

**Episode types:**
- how it works (most episodes);
- a list of steps, with a checklist `hud` (the reference's «5 خطوات»);
- myth / «نصها صح»;
- a comparison, with two graphs side by side;
- tips.

## Look

The sizes below are at 720 wide. The template already has them at 360 (the canvas is ×3 for 1080).

- **Paper:** `#eee5d0`, with a faint square grid (about 48 px cells).
- **Ink:** a dark warm brown, `#2a2016`, not black.
- **Accents:** used only on what is being talked about. The same colour marks the caption's key word.
  - orange-red `#bd552f`: action, danger, heat, the key number;
  - olive `#5e653a`: the named part;
  - slate blue `#4a6f8a`: water, air, cold, the technical term.
- **Muted body colours:** skin `#d9a186`, beige `#d8ccae`, grey `#c6c6c0`, khaki `#c0b49c`.
- **Main frame:**
  - one 2 px card frame, 28 px in;
  - the panel fills the top of the card, about 65% of it;
  - a thin rule;
  - one caption chunk centred under the rule, in a bold Arabic sans at about 28 px. Key words are coloured, underlined
    (`u`) or grey (`gr`).
- **Cards (opening, summary):** a double frame and L-shaped crop marks outside the corners.
- **Numbers:** big ones in a bold **serif** (Noto Serif): «100,000», «200°», «384,000 km».
- **Drawing:**
  - an editorial technical drawing, with 1.5–2 px ink lines, flat fills, light diagonal hatching and a shade of the same
    hue (no gradients);
  - **isometric / three-quarter** for appliances and cities, **cut-away** for things with insides, **flat side view** for
    waves and graphs;
  - **close-up:** the subject is cropped by the panel edges, not small in the middle;
  - leader-line labels, a framed analogy thumbnail in a top corner, magnifier insets, ✗ / ✓, ①②③;
  - number boxes, rule chips, status pills and checklists that stay over the panel;
  - no cartoon faces.

## Motion (the biggest rule: no hard cuts)

Over all 20 videos, scene detection found only 2 cuts. So:

- **Changing shots:**
  - a ~0.45 s crossfade with a camera move (`tr: "fade"`);
  - or the camera **flies into a detail that becomes the next scene** (`tr: "in"`, satellite → city);
  - or it starts tight and pulls back to reveal (`tr: "out"`).
- **The camera never parks:** a slow push or pan in every shot, plus the template's drift. No still frame longer than
  about 0.5 s.
- **New things appear grey and faint, then take their colour** (`appear`). The rest dims (`dim`).
- **The named part takes the accent colour along its length** (`sweep`, as with the motor shaft).
- Labels draw out from a dot, then the name fades in (`label`). ✗ / ✓ write themselves (`cross`, `check`). Numbers count up
  (`count`).
- The real mechanism always moves: gears turn, water runs, pins rise, waves travel.
- **Rhythm:**
  - the caption changes every 1.2–2 s (the template splits lines into chunks of about 5 words and times them inside the
    line);
  - the picture changes with every new idea, every 2–4 s.

## Opening and ending (built into the template)

1. **Hook card (lines before the promise):**
   - the frame and crop marks draw in;
   - a small logo top-right;
   - the category in orange between two short rules (آلات، أجهزة البيت، جسم الإنسان، تكنولوجيا الطرق، طبيعة وفضاء، العربيات،
     الكيميا في البيت، طيران);
   - the hook builds **word by word with the voice**, then the next hook line replaces it;
   - the subject drawing under it (`SCENE.intro`), with a ✗ when the second line turns it.
2. **Bumper (the promise line):** a big thin circle holding the subject icon (`SCENE.bumper`), with the stopwatch crown. An
   orange ring fills round it like a stopwatch. Under it «إيه الحكاية؟», then «هشرحهالك في دقيقة.» with «دقيقة» orange.
3. **Summary card (from «ودي كانت…»):**
   - the question as heading;
   - a small numbered drawing on a tan panel;
   - a 2-column legend;
   - one big serif orange number with 2 lines of explanation;
   - 3 numbered recap lines;
   - a faint «معلومة زيادة:».
   - Each part fades in after the one before.
4. **Ask box (the «قولولنا…» line):** «قولولنا… / عايزين تعرفوا / حكاية ____ ؟» with a blinking caret, over the recap lines.
   It holds about 3 s of silence after the voice (render.js `TAIL=3`).

## Sound

- Mix to **-14 LUFS**; render.js does it.
- A soft music bed runs **the whole video**, about 8 dB under the voice. It never drops to silence until the tail.
- **Narrator:** a calm, confident Cairo voice, more teacher than hype, about 175–180 words a minute after tightening.
  Short pauses only.
- **Effects:** light, for example paper whooshes on transitions, ticks on ✓ / ✗, and a soft mechanical sound under moving
  parts.

## Build (shared template)

Everything is in `videos/_templates/diagram/`. Its `README.md` has the steps and the helper list.
`videos/diagram-demo/` is a working demo episode; copy its `episode.py` and `shots.js` as a start.

1. `script.txt`, then the voice, then `timing.js`, all as in the PLAYBOOK.
2. `mkdir videos/<ep>/diagram`, then copy `build.py` into it, and write `episode.py`:
   - `CFG`: title, category, summary-card HTML, optional watermark;
   - `K`: key words (`o` `b` `g` `u` `gr`);
   - `CAPTEXT`: digits in the caption;
   - `SPLIT`: manual chunk breaks.
3. Write `shots.js`:
   - `shot(line or [line, chunk], cam, draw, {tr})`;
   - `hud(from, to, draw)` for things that stay put;
   - `SCENE.intro / bumper / outro`.
   - Draw in the panel world, 640×786, with the helpers. Model shapes on real references and keep them in `refs/`.
4. `python3 build.py`. It prints the phase lines and any key word it can't find.
5. QA:
   - `node tools/strip.js <abs index.html> sheet.png 6 <times…>` for transitions and phases;
   - the animation skill's QA (no still frame over about 0.5 s, captions on time, nothing clipped by the panel edge);
   - then `node render.js <abs index.html> voice-mix.wav out.mp4`.

The first template, `videos/_templates/diagram-v1/`, is kept only for `xray-diagram`. Don't start new episodes on it.
