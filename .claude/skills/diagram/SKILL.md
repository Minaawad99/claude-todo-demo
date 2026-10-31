---
name: diagram
description: >
  Make an «إيه الحكاية؟» explainer video in the "الرسم الهندسي" (technical-diagram) style the user picked from a reference
  video (an X-ray explainer): cream graph-paper card, flat technical illustrations with hatching, leader-line labels and
  magnified insets, a two-line caption under the picture, and a summary infographic card at the end. Use when the user says
  "بالرسم الهندسي", "بطريقة الرسم الهندسي", "زي فيديو الأشعة", "diagram style" or "technical style". Every other step
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

- Egyptian Arabic, calm explaining tone, a little slower and more "teacher" than the cartoon videos.
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
