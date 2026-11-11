---
name: ebniha
description: >
  Make a video in the user's «ابنيها بنفسك» style (build it yourself): the viewer builds a real thing step by step. It
  opens on a crude version («لو عملت كذا… يبقى عندك … بدائي!»), then 5–7 rounds of «بس المشكلة…» → «عشان كده…», each fix
  adding one visible part to the same side-view build over a ground cross-section, a «وتعرف إيه الغريب؟» fact, «فاضل
  تركّب…», and «ومبروك عليك، بنيت … بنفسك!». Fast, energetic young male voice over a steady upbeat electronic bed, one
  caption word at a time, full-bleed 1080×1920. Spoken in Egyptian Arabic or Modern Standard Arabic. Use when the user
  says "ابنيها بنفسك", "بطريقة ابنيها بنفسك", "بأسلوب ابنيها", "زي فيديوهات مبروك بنيت" or "build it yourself style".
---

# «ابنيها بنفسك»

**The user named this style «ابنيها بنفسك».** It comes from 20 reference videos the user sent (Saudi-dialect shorts). They
are in the repo, so never ask for them again: `videos/_reference/ebniha/`. Read `STYLE.md` there first (the measured
rules), then `notes/vNN.md` and `sheets/vNN.jpg` for a topic close to yours, and `transcripts.txt` for how the lines sound.

We keep the method: the story loop, the voice delivery, the pacing, the growing build. The words, the facts and the
drawings are our own. Never translate a reference script and never redraw a reference shot.

Talk to the user in Egyptian Arabic. Use this style only when the user names it. Voice generation, reference research,
audio pipeline, render, QA, cover and titles work as in `.claude/skills/animation/SKILL.md`. This file gives what changes.

## 0. Two questions first (every new topic, in one message)

1. **Language of the narration:** عامية مصرية (default) or فصحى. The user asked for both to be possible.
2. Quick mode or full review, as in the animation skill.

## 1. Topics that fit

A real thing that has a crude version anyone could make, where each real part exists to fix one failure of the crude
version: machines, vehicles, buildings, city systems, home appliances. If the topic has no build ("why is the sky blue"),
say so and offer the «اسكتش» or animation style.

## 2. Script → `videos/<slug>/script.txt`

**Size:** 20–26 lines, one sentence per line, about 200 words (160–250). At 2.6 words a second that is 75–95 s.

**Fixed order.** The device phrases are fixed per language; everything else is written fresh.

| # | beat | عامية مصرية | فصحى |
|---|---|---|---|
| 1 | hook, line 0 (fake win) | «لو <عملت الحاجة البسيطة>… مبروك، بقى عندك <الحاجة>!» | «لو <فعلتَ كذا>… مبروك، صار عندك <الشيء>!» |
| 2 | first problem, line 1 | «بس المشكلة إن…» | «لكنّ المشكلة أنّ…» |
| 3 | fix | «عشان كده بتـ…» / «فبتـ…» | «لذلك…» / «فـ…» |
| 4 | part's real name | «وده اسمه…» / «وده بيسمّوه…» | «ويُسمّى هذا…» |
| 5 | later problems: **vary the opener, never two in a row** (the user heard the repeated «لكن») | «بس…» / «لكن…» / «وهنا مشكلة تانية…» / «أمّا…» / «وخلّي بالك…» | «وهنا مشكلةٌ ثانية…» / «أمّا…» / «غير أنّ…» / «ويبقى خطرٌ…» / «وانتبه…» |
| 6 | odd fact, about two thirds in | «وتعرف إيه الغريب؟» | «وهل تعلم ما الغريب؟» |
| 7 | finishing touches | «فاضل تركّب … و… و…» | «بقي أن تركّب … و… و…» |
| 8 | payoff | «ومبروك عليك، بنيت <الحاجة> بنفسك!» | «ومبروك، لقد بنيتَ <الشيء> بنفسك!» |
| 9 | ask, last line | «اكتب فكرتك في التعليقات، وأكتر فكرة تجيب لايكات هتبقى الفيديو الجاي.» | «اكتب فكرتك في التعليقات، والفكرة الأكثر إعجابًا ستكون الفيديو القادم.» |

**Rules:**
- No greeting, no series name, no «هشرحهالك في دقيقة». Line 0 is the hook.
- **The hook is a fake win (the user asked for it).** Line 0 congratulates the viewer on the crude version, with
  confetti on screen, and line 1 breaks it with «بس المشكلة…». The real «ومبروك» at the end answers it. «بدائي» may be
  used in the tag instead of the line.
- The first problem lands by second 5. Then 5–7 problem → fix rounds. A round is 2–3 lines: the failure, the fix, and
  often the part's name.
- Every fix adds exactly one part the viewer can see. If a line adds nothing to the picture, cut it.
- Every problem is something that visibly goes wrong (falls, leaks, melts, floats, cracks), with a real number when
  there is one.
- Speak to the viewer as the builder: «بتحفر، بتركّب، بتصبّ» / «تحفر، تركّب، تصبّ». Present tense, short sentences, one
  everyday comparison every few lines («زي مسمار قلاووظ عملاق»).
- **Plain words, no science terms (the user's rule).** Say what a thing does in everyday words: «سخونة» not a physics
  term, «رصاصات صغيرة» not «نيوترونات», «بتنقّيه» not «تخصيب». Keep only the part names the viewer will meet in real life
  (قضبان التحكم، وعاء الضغط، الفلابس) and explain each in the same breath.
- Write numbers as words when the voice must say them.
- Verify every fact and list the sources in `refs/SOURCES.md`. Tell the user which facts are surprising and that they
  were checked.
- Run the script through the `humanizer` skill, keeping the device phrases word for word. Give it in one copy-ready code
  block, commit it, then give the voice settings.

## 3. Voice → `videos/<slug>/style.txt`

The user wants the reference delivery: a young man, fast and energetic, even rhythm, 0.25 s breaths, pitch up on the
problem and settled on the fix. Voice Puck, model `gemini-3.8-flash-tts`, temperature 1, as in the animation skill.

Egyptian:
```
Speak in casual Egyptian Arabic (Cairo dialect), like an excited young YouTuber showing the viewer how to build <the thing> step by step. High energy, friendly, confident, at a brisk steady pace, clearly faster than normal conversation, with a clean dry studio sound. On every "بس" problem, raise the pitch with a little alarm; on every "عشان كده" fix, come down satisfied and sure. Give a small lift to each part's name. Real surprise on "وتعرف إيه الغريب؟". Make the final "ومبروك عليك" proud and happy, almost laughing. Take only a very short breath between sentences and never pause inside a sentence. Emphasize <word>, <word>, <word>. Never use Modern Standard Arabic pronunciation; pronounce ق as a glottal stop like Cairenes.
```

Fusha: the same text with the first sentence replaced by `Speak in clear, light Modern Standard Arabic with full correct
vowel endings only where natural, like an excited young presenter…`, the quoted words replaced by the fusha device
phrases, and the last sentence removed.

**Targets after the audio pipeline** (measured on the references): 2.5–2.8 words/s over the whole voice track, gaps
between sentences trimmed to 0.20–0.30 s, one gap of about 1 s kept before the odd fact and before «ومبروك», final mix at
−17 LUFS. If the take is slower than 2.4 words/s, regenerate before tightening.

## 4. Sound: no music, effects made in JavaScript

**The user does not want music** (every music bed felt tense to them). The sound is the voice plus effects only, and the
effects are synthesised in JavaScript, the user's choice: `videos/_templates/ebniha/sfx.js` (dig, pour, splash, party,
crumble, crack, clank, spray, pump, suck, buzz, zap, pop, whoosh, ding, rustle, shower, eww, tick, thud, bubble).

- `videos/<slug>/cues.js` builds the cue list from the same `build/events.js` the picture uses, so every sound lands on
  its part: a soft whoosh on each camera move, one real-world sound per part as it lands, a buzzer/crack on each failure,
  a pop on each tag, a party pop on both «مبروك», ticks on counters and on the vote card.
- `node cues.js <scratch>/sfx.wav`, then mix: voice resampled with soxr and set to −17 LUFS, effects −9 dB, `amix normalize=0`.
- Keep long beds (pump hum) quiet (gain ≈ 0.12). Add a new effect to `sfx.js` rather than a recorded clip.
- `music.py` stays in the template only in case the user asks for music again.

## 5. Picture

Full-bleed 1080×1920 at 60 fps. No black frame, no panel, no title, no logo. This is not the cartoon panel of the
animation style. Default render: flat 2D vector (gradients, light grain, dark outlines), which is what 13 of the 20
references use. Use 3D (three.js) only if the user asks.

- **Projection: 2.5D, not flat (the user asked for it after the first pool cut).** One-point perspective seen from the
  front and a little from above: the front is a cut through the soil (shell thickness with a red dotted rebar line,
  pipes, machines), and behind the cut the floor, slope, back wall and side walls recede in depth to the lawn and a
  straight-on house. `P(x, h, z)` in `videos/home-pool/build/scene.js` does it (vanishing point above the frame); build
  every part in x/h/z. Water = a translucent surface plane + the cut face (opacity ≈ .65) so what is under it shows.
  Captions sit at y ≈ 26% (over the house), as in the reference.
- **Layout:** side view. Ground line at about 60–70% of the height; below it soil in cross-section, used for foundations,
  pipes, cables and tunnels, never left empty. Sky blue, sand and one or two accent colours. An Egyptian setting by
  default (local street, buildings and people), drawn from reference photos as in the animation skill.
- **One build that grows.** Draw the thing once as a function of the parts built so far, like `pipeShelter` in
  `videos/nuclear-shelter/cartoon/`. Each fix turns on one part; earlier parts stay. Show the inside with a see-through
  skin when it matters.
- **Keep the camera back (the user's note after the pool).** Do not push in as tight as the pool video did: frame the
  whole build (or most of it) most of the time, zoom ≈ 1.0–1.4, and make the parts themselves bigger and more detailed
  so they read without a close-up. Use a close-up only for a part too small to see otherwise, and pull back right after.
- **One continuous take.** The build stays centred. The camera holds 2–4 s, then eases in to the new part or back out
  as the build gets bigger. Hard cuts only for a cutaway (macro, molecule, night).
- **Something new every 2–4 s.** Parts drop, stack, slide or pop in with a small overshoot.
- **Act out every problem** on the build before the fix appears.
- **Tags:** a dark rounded pill above each new part with its name in cream or yellow for about 2 s; red text on a
  problem. A «… بدائي!» pill at about 3 s. Numbers go on dials, screens and counters inside the scene, red for danger and
  green for safe.
- **Odd-fact card:** dim the scene and show a cream rounded card with a small comparison drawing and one big number.
- **Captions:** one word at a time with the voice, heavy rounded Arabic face, white with a thick dark outline, centred
  at y ≈ 72%, no box, no highlight colour.
- **Ending:** the «فاضل…» parts land fast, then a wide pull-back on the whole build with confetti on «ومبروك». On the
  ask line, dim the scene and show a speech-bubble card «اكتب فكرتك!» with four next-build rows and heart counters
  ticking up. End 1–2 s after the last word.

The first episode is `videos/home-pool/` (the pool): `build/index.html` (page, one-word captions, RTL fix for SVG text),
`build/events.js` (when each part lands, from word times), `build/scene.js` (the growing build, camera, tags, gauges,
odd-fact card, vote card, confetti) and `cues.js`. Start a new episode from a copy of those files and redraw the build.

## 6. Check before render

- First problem by second 5; a new element at least every 4 s; no part disappears once built.
- Every script fix has a part on screen and a tag; every problem is acted out.
- Voice pace and loudness meet the targets in section 3; music runs the whole length.
- Then render and QA as in the animation skill.
