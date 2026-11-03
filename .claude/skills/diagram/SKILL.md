---
name: diagram
description: >
  Make an «إيه الحكاية؟» explainer video in the "الرسم الهندسي" (technical-diagram) style the user picked from a reference
  video (an X-ray explainer): cream graph-paper card, flat technical illustrations with hatching, leader-line labels and
  magnified insets, a two-line caption under the picture, and a summary infographic card at the end. A second reference (an
  engine / horsepower explainer) adds isometric object drawings, one master cross-section reused all video, gauges, a
  numbered chapter stepper and a CTA card. Use when the user says "بالرسم الهندسي", "بطريقة الرسم الهندسي", "زي فيديو
  الأشعة", "زي فيديو الموتور", "بالإيزومتريك", "diagram style", "isometric" or "technical style". Every other step
  (script, voice, sounds, render, QA, cover, titles) follows the animation skill.
---

# «إيه الحكاية؟» — the "الرسم الهندسي" style

The user's name for this style is **الرسم الهندسي**. It copies the look and the pacing of a reference video the user sent
(«الدكتور شاف الكسر اللي في عضمك…», 94 s, 720×1280 30 fps, series «طب إزاي؟»). We keep our own brand («إيه الحكاية؟») in
place of «طب إزاي؟».

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. Script, voice (Gemini
Puck), sounds, render, QA, cover and titles all work exactly as in `.claude/skills/animation/SKILL.md`. Only the look, the
layout and the shot style change.

## Look (measured from the reference)

- **Paper:** the whole frame is cream paper `#eee5d0`, with small crop marks at the corners. A double-line frame card
  (outer line about 2 px, inner line 1 px, ink `#2b2b2b`) sits about 36 px in from the edges at 720 wide.
- **Panel:** the illustration fills the top of the card, about 70 % of its height. The background is a faint square grid
  (`#e3d8bf` lines, about 48 px cells at 720 wide), or a black panel `#111` for "photo / X-ray" shots. A thin rule separates
  the panel from the caption.
- **Caption:** two short lines, centred under the rule, in Noto Sans Arabic 800, ink `#2b2b2b`. The key word in each line
  is coloured:
  - orange-red `#c4532c` for the action or the danger;
  - slate blue `#46698a` for the technical term;
  - olive `#6b7d3c` for the named part.
  The caption changes per sentence (no karaoke). A line often ends in «…» and carries on in the next shot.
- **Drawing:** flat editorial-technical drawing.
  - Thin dark outlines (about 2 px).
  - Muted fills: putty `#cdc9bb`, sage/olive `#6b7d3c`, slate blue, beige, skin `#d9a184`, with the warm-orange accent kept
    for action.
  - Fine diagonal hatching inside the big shapes, cut-away and section views, cross-sections of machines.
  - **Leader-line labels:** a thin line from a dot on the part to a small label (Noto 700, about 14 px at 720), coloured
    like the caption key word.
  - Magnified inset circles (a zoom of a detail in the top corner), a big red ✗ for a wrong idea, numbered round callouts
    ①②③.
  - Energy as wavy lines or bundles of thin arrows. Particles as small dots.
- **No cartoon faces, no title bar, no brush tags.** Labels and captions carry all the text.

## Structure and pacing (reference: 20-odd shots in 94 s)

1. **Opening card** (about 2–3 s, under the hook):
   - a small brand label top right («إيه الحكاية؟», grey);
   - the category in orange-red (e.g. «جسم الإنسان والطب»), between two short rules;
   - the hook in Noto 900, about 34 px at 720, with one orange word, the second line in grey;
   - a black "photo" panel under it, showing the subject with a red circle on the key detail.
2. **The mechanism, one step per shot:**
   - start from an everyday analogy (the reference: a torch behind the hand in the dark);
   - then the real machine in cut-away;
   - zoom into each part as the voice names it (leader-line label on it);
   - show what happens (particles, rays, heat), with a number tag such as «100,000 V» in a dark box when there is a
     number.
3. **The misconception** («ناس كتير فاكرة إن…»), with a red ✗ on the wrong idea, then the right picture.
4. **A history fact** on a black "old photo" panel, with the year under it.
5. **The payoff:** one shot that ties it together, with an inset circle recalling the machine.
6. **Summary card** (the last 3–4 s):
   - the question as a heading;
   - a small labelled diagram with numbered callouts and a 2-column legend;
   - one big stat in orange-red Noto 900 (e.g. «99%») with its explanation beside it;
   - 3 numbered recap lines;
   - a smaller «معلومة زيادة:» line.
   It stays on screen into the tail.

**Motion:** the camera never parks.
- A slow push-in or pan inside each panel.
- The parts the voice names animate: rays travel, particles drift, a disc spins, a label line draws itself.
- Cuts between shots, with the caption swapping at the same moment.
- Same QA rules as the animation style (no still over 0.75 s), unless the user picked quick mode.

## Voice and script

- Egyptian Arabic, **Puck with the animation skill's usual Style text** («friendly YouTuber revealing a surprising secret…»,
  natural relaxed speed), word for word, only the topic and key words changed. Don't write a "calm teacher / unhurried"
  style: the user tried it on the AC video and the voice sounded strange and slow, and tightening then cut 15% of it.
- About 90–100 s, 22–26 lines, about 200–240 words.
- Keep line 3 «إيه الحكاية؟ هشرحهالك في دقيقة.» and the closing «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».
- The reference flow:
  1. a hook in the second person («الدكتور شاف الكسر اللي في عضمك من غير ما يلمس جلدك»);
  2. the promise;
  3. an analogy;
  4. the steps;
  5. the misconception;
  6. the history;
  7. «يعني من الآخر…» recap.

## Build

- Use the same engine as the cartoon videos:
  - `timing.js`, `shots.js` (`shot(line, cam, draw)`), `build.py` → `scenes.js` + `index.html`;
  - `render.js`, `qa.py`, `tools/frame.js`.
- The first diagram video makes the template `videos/_templates/diagram/template.html`, and later videos copy it:
  - the 1080×1920 page is the paper + card + crop marks;
  - the panel is an SVG in the top of the card, viewBox 640×720 (portrait, not 16:9);
  - the caption block sits under the rule;
  - the summary card is a full-card HTML layer shown from the last line on.
- Put the shared drawing helpers in `videos/_templates/diagram/_helpers.js`:
  - `paperGrid`, `hatch(id)` (an SVG pattern);
  - `label(x1,y1,x2,y2,text,col)` (leader line + text), `inset(cx,cy,r,inner)`;
  - `callout(n,x,y)`, `crossMark`, `waveRay`, `numBox(text)`.
- Sounds: softer than the cartoon videos. Use paper-like whooshes, ticks, a low hum for machines, and few big effects.
  Library first, then ask with Pixabay search terms.

## Second reference: the engine video (isometric + master cross-section)

Reference 2: «موتورين، كل واحد 2000 سي سي… واحد بيطلع 150 حصان والتاني 400، طب إزاي؟» (164 s, 360×640 30 fps, same
series, category «الهندسة»). Same paper, grid and ink as reference 1 (paper measured again: `#eee5d0`). What it adds, and
what to copy:

### Frame and caption (overrides for inner shots)

- **Double frame + crop marks only on the "cards"**: the opening hook, the summary card and the CTA card. Inner shots use a
  single 1.5 px ink border and no crop marks, so the cards feel like the cover and back page.
- **Caption = one short line**, 2–6 words, Noto Sans Arabic 800, changing every 1.5–2.5 s (a phrase, not a sentence). It
  usually ends in «…» and the next shot finishes it. The key word is coloured (red `#bd522b` action/torque, olive `#626b3b`
  horsepower/part, slate `#5e728d` air/technical) and a new term is **underlined** the first time (e.g. «السلندرات»).
- A faint brand row sits just above the caption, under the rule: «? إيه الحكاية؟ | @handle» in 40 % ink, small.
- Shots per minute: about 30 (≈80 shots in 164 s). For our 90–100 s videos that means 40–50 caption swaps; keep 25–29
  drawings and let several captions play over one moving drawing.

### Isometric object drawings («بالإيزومتريك»)

Used for **things** (the engine block, a turbo, a chip, a bottle, a tractor); cross-sections are used for **how it works**.

- True 30° isometric: x-axis at +30°, y-axis at −30° (150°), z straight up. Build each object from boxes and cylinders
  with an `iso(x,y,z)` helper → screen `((x−y)·cos30, (x+y)·sin30 − z)`.
- Three-tone shading from one light from the top-left: top face lightest (paper-putty `#e4dccb`), left face mid
  (`#cdc4ae`), right face darkest (`#a99f88`). Outlines 2 px `#2b2b2b`, inner detail lines 1 px.
- Fine diagonal hatching only on the darkest face; small bolts/caps as black circles or filled rectangles on top.
- Two identical iso objects side by side is the signature "compare" shot: a spec label above each («2000 cc», Noto 800),
  a big number below each in a **serif display face** (Noto Serif / Amiri 700, about 70 px at 720) coloured olive vs red,
  with a small unit word under it («حصان»). Numbers count up (ticker) and the winner's number flips colour to red.
- Upgrades appear as small iso parts that snap onto the object (the turbo snail docks to the engine side), plus a row of
  small round icons above it (one per upgrade).

### One master cross-section, reused all video

- Draw the core mechanism once (the piston: head, valves, cylinder, rod, crank disc) and reuse it in every mechanism shot.
  States are recoloured, not redrawn: air = light slate fill + slate dots, fuel = olive dots, burn = pink `#e5cbb6` /
  `#dcab99` fill with a red ▼ arrow, exhaust = grey dots leaving in a pipe.
- The camera zooms between scales of the same drawing: a row of 4 cylinders ↔ one cylinder ↔ a detail. Parts that the
  voice names get a leader-line label that draws itself.
- Moving parts really move: the piston slides, the rod swings, the crank disc turns, dots stream through the pipes as
  dotted lines (dash-offset animation).

### Gauges, counters and steppers

- **Vertical bar gauges** beside the drawing: a thin outlined tube that fills from the bottom, label under it («عزم» red,
  «حصان» olive). Show two gauges to compare (tractor: tall red, short olive; motorcycle: the opposite).
- **Stopwatch + counter**: a small stopwatch icon with a big serif number under it («0 → 2 دفعة», «8,999 → 9,000 لفة في
  الدقيقة») that ticks with the action.
- **Chapter stepper** for "N ways" sections: numbered circles ①②③ across the top (right-to-left), the active one with a
  red ring and red number, the others grey; it stays on screen through that whole section.
- **Equation shot**: `icon = icon + icon` in a row (e.g. stronger push = air + fuel), boxes with a thin outline.
- **Analogy objects** are drawn in the same flat style, on a ground line when they move: hammer and wood block, pulley with
  a «75 kg» sack, tractor vs motorcycle with speed lines, a 2 L bottle filling with dots, a tyre and a pump.
- **Big quantity shots**: one labelled object next to a grid of many small ones, with the total as a slate number on top
  («9,000 L»).

### Ending: summary card, then CTA card

1. Summary card (as above): the question heading with a small red icon, the master drawing in a putty panel with ①–④
   callouts, a 2-column legend, one big red serif stat («9000») with a two-line explanation, and 3 numbered recap lines.
2. **CTA card** (last 2–3 s), the summary's lower half replaced by a crop-marked box: «قولولنا…» / «عايزين تعرفوا!» /
   «إيه الحكاية ____؟» with the blank as a red underline.

### Script flow and sounds (reference 2)

- **The voice is never copied from the reference** (the user's rule): its narrator is a fast male voice (about 160–170
  words per minute) over an electronic music bed. Ours stays the channel's own: Puck, the animation skill's usual Style
  text, natural speed (about 140 wpm), no music bed. Copy only the look and the script flow below.
- Script flow: two-thing paradox hook («نفس الـ… بس واحد… والتاني…، طب إزاي؟») → quick mechanism → define the unit with an
  everyday object (2000 cc = a big Pepsi bottle) → the important question (A vs B) with one analogy each → the surprise
  («والمفاجأة إن…») → «فيه 3 طرق» with the stepper → who controls it → back to the opening pair → «يعني من الآخر…» recap.
- Effects on the action, one per big beat: engine rev on the hook, whoosh on cuts, ignition boom, hammer clink, motorcycle
  pass, exhaust puff, pump hiss, turbo spool, high-rev scream, a soft chime on the CTA.

### Template v2 (built for «التكييف بيبرّد إزاي؟», `videos/ac-cooling/diagram/`)

The shared template now does all of the above: crop marks + double frame only on the cards, the faint brand row, one-line
captions split into phrases at «، . ؟ ! :» (each phrase gets a share of the line's time by length; `u` in a K class
underlines), `CFG["outro_from"]` for a summary card on the recap line and the CTA box on the last line, and
`shot(line, cam, draw, hud)` where `hud(u, d, t)` draws in screen space (the chapter stepper stays put while the camera
zooms). Start new isometric episodes from a copy of `videos/ac-cooling/diagram/`. For contact sheets of the full card
(not the 16:9 strip that `tools/sheet.js` crops), screenshot the whole 360×640 page per line.

### Extra helpers for `_helpers.js`

`iso(x,y,z)`, `isoBox(x,y,z,w,d,h,tones)`, `isoCyl(...)`, `gauge(x,y,h,value,label,col)`, `stopwatch(x,y,t)`,
`ticker(from,to,t)`, `stepper(n,active)`, `dotStream(path,t)`, `serifNum(text,col)` — all in `_helpers.js` now, plus
`isoRing`, `isoFan`, `thermo`, `pipe`, `heatWaves`.

Reference 2 contact sheets (a frame every 2 s, timestamped), the opening and summary cards and the transcript are in
`.claude/skills/diagram/reference/engine/`. Look at them before drawing.
