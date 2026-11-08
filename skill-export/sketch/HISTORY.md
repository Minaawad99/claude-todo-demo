# History: how «اسكتش» came to be (the session that built it)

Read this to know the decisions already taken with the user, so you don't ask again or undo them. The channel is
«إيه الحكاية؟», short vertical explainers in Egyptian Arabic. Its earlier name was «طب إزاي؟».

## 1. Tools set up

- **Video engines:** HyperFrames (`npm i -g hyperframes`, `hyperframes skills update`) and Remotion. Both are for other
  styles; «اسكتش» renders with its own `render.js` (Playwright → ffmpeg).
- **whisper.cpp** is built at `~/.cache/hyperframes/whisper/whisper.cpp/build/bin/whisper-cli`, with these models:
  - `ggml-small.en`;
  - `ggml-large-v3`: accurate on Egyptian Arabic but about 5× real time on 4 cores;
  - `ggml-large-v3-turbo`: about 2 min per 90 s of audio, near large-v3 quality. Used to transcribe and to check takes.
- **Kokoro TTS** is installed but has no Arabic, so it is only useful for English drafts.
- **Network:** huggingface.co and us.aws.cdn.hf.co are allowed. GitHub release downloads answered 504, so models come from
  Hugging Face.

## 2. The reference: 20 «طب إزاي؟» videos

The user sent 20 videos (720×1280, 30 fps, 80–162 s), all in one hand-drawn technical style. They were analysed frame by
frame, and the measured rules are in `STYLE.md`. The headlines:

- **Narration:**
  - about 177 words a minute, phrases of about 5 words, 4–6 «طب…؟» questions;
  - a fixed spine: hook → promise → (rule) → steps → myth → «يعني من الآخر» at about 83% → «والأغرب» at about 90% →
    sign-off → ask.
- **Look:**
  - paper `#eee5d0` with a grid, warm-brown ink;
  - accents: orange `#bd552f`, olive `#5e653a`, slate blue `#4a6f8a`;
  - the panel about 65% of the card, a thin rule, then the caption;
  - serif digits for the big numbers.
- **Motion:** only 2 hard cuts in all 20 videos. Shots crossfade or the camera flies into a detail. Captions change every
  1.2–2 s, and the hook builds word by word.
- **Bumper and end:** a stopwatch ring for «هشرحهولك في دقيقة», then a summary infographic card and an ask box with a
  blinking caret.
- **Sound:** -14 LUFS, a music bed the whole time about 8 dB under the voice, a calm male teacher voice, about 3 s of
  silence at the end.

## 3. The name

- **Show:** «إيه الحكاية؟» replaces «طب إزاي؟» everywhere the show names itself:
  - promise: «إيه الحكاية؟ هشرحهالك في دقيقة.»;
  - sign-off: «ودي كانت حكاية …»;
  - ask: «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟», and on screen «حكاية ____؟».
- **Narration questions:** mid-script «طب ليه…؟» questions stay.
- **Logo:** a speech bubble with a red «؟» under a stopwatch crown. The stopwatch ring stays for the opening bumper.

## 4. The template (shared by every episode)

- **The engine works out the phases from the script itself:**
  - the hook lines before the promise;
  - the promise line;
  - «ودي كانت…» for the summary;
  - «قولولنا…» for the ask.
- **Captions** split themselves into chunks of about 5 words at punctuation and are timed inside the line. Digits in the
  caption come from `CAPTEXT`; colour, underline and grey key words from `K`.
- **Helpers:** appear, dim, sweep, draw, label, cross / check, count, bigNum, numBox, iconBox, inset, hud, and shot
  transitions fade / in / out.

## 5. The reference episode «المد والجزر» (how the tide happens and what drives it)

- **Script:** 27 lines and 265 words. It covers the Moon (384,000 km), the near/far pull difference, two bulges, the Earth
  turning inside them, the tide 50 minutes later each day, the Sun at about half the Moon's pull, spring and neap tides,
  the myth, and the Moon receding about 4 cm a year. All facts were checked, and the script went through the humanizer.
- **Voice:** the Gemini TTS free quota was used up (HTTP 429). The user recorded it in Google AI Studio (Puck,
  temperature 1) from the script and style text Claude gave.
  - The take was 116.5 s, and 103.1 s after capping pauses at 0.3 s. It was never sped up.
  - whisper-small alignment needed one manual boundary fix.
  - A large-v3-turbo check confirmed the take matched the script. The user was asked to listen to «4 سنتي».
- **Drawings:**
  - globes with real coastlines (d3-geo + Natural Earth, `lib/geo.min.js`);
  - the polar view for the turning Earth;
  - bulge ellipses;
  - balls on an isometric strip;
  - a clock running 50 minutes on;
  - the orbit;
  - Sun alignments;
  - the myth crossed out;
  - the drag / brake shot.
- **The user's correction:** the first scene must be a **side view at sea level**, so the rise and fall of the water is
  visible. The isometric top-down beach "doesn't show it". The beach (`beachSide()`) became a side cut through the sand
  bed, with the sea climbing the slope, a pier, a tide staff and a boat aground or afloat. The same view was used wherever
  the beach returns.
- **Sounds:** the user downloaded them from Pixabay (the kit in `assets/workspace/videos/_templates/sketch/sfx/`). The
  first music («Calm Ambient») was replaced by the user's pick, «Mysterious Music Box – The Midnight Hour». They asked for
  it lower because of the ringing at the start. It got a high shelf of -5 dB above 3 kHz, the first 12 s faded up from
  -4 dB, and gain 0.42, about 22 dB under the voice while he speaks. **The user approved that level.**
- **QA:** the calm style failed `qa.py`'s still-frame rule at first. The fix:
  - faster template drift;
  - intro sway;
  - the bumper push-in and its sweeping stopwatch hand;
  - linear card crossfades;
  - extra motion in sparse shots.

  `tools/stills.js` was written to catch still frames before a 20-minute render. The final render (1:46, 1080×1920,
  60 fps) passed qa.py.

## 6. Locked

- **Name:** the user named the style **«اسكتش»** and asked to keep the same drawings, narration, sounds and music.
- **Repo:** the sound kit and the 20 reference videos (small copies) were committed to the user's repo
  (minaawad99/claude-todo-demo, PR #6 merged into main). A project `CLAUDE.md` points sessions to the skill.
- **Package:** this skill was then packaged so it can be installed on another Claude account.

## The user's standing preferences

- **Language:** talk in Egyptian Arabic. The user writes short messages.
- **Working mode:** ask quick mode or full review for each new topic. They chose full review for realism.
- **Drawings:** must look like the real objects. Research real photos, never invent shapes, and never copy a reference
  drawing.
- **Script:** run every script through the humanizer, and keep the series lines word for word.
- **Voice:** never speed it up. If it is too long, shorten the script.
- **Sounds:** from Pixabay, downloaded by the user (Pixabay blocks bots). Check the kit first and ask only for what's
  missing, with search terms.
- **Before rendering:** show the work and ask before long renders when something is uncertain. Report QA honestly.
