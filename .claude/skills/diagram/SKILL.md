---
name: diagram
description: >
  Make an «إيه الحكاية؟» explainer video in the realistic "الرسم الهندسي" style. This is the channel's default for every
  new video (the user's decision after the Wi-Fi video): real devices redrawn from reference photos as lit 3-D drawings,
  set in their real places (living room, kitchen, classroom, field), a camera that moves and changes angle in every shot,
  leader-line labels and magnified insets on cream paper, an opening card and a summary card. Use for any new «إيه الحكاية؟»
  video unless the user names another style, and when the user says "بالرسم الهندسي", "بطريقة الرسم الهندسي",
  "زي فيديو الواي فاي", "الطريقة الواقعية" or "diagram style". Script, voice, sounds, render, QA, cover and titles follow
  the animation skill.
---

# «إيه الحكاية؟» — الرسم الهندسي الواقعي (the default)

**This is the channel's fixed way of making every new video** (the user's decision: «ثبت الطريقة دي» after the Wi-Fi
video). The reference build is the Wi-Fi episode:

- `videos/wifi/` — script, style, voice, timing, cues;
- `videos/wifi/diagram/` — `episode.py`, `shots.js`, `build.py`;
- `videos/wifi/refs/SOURCES.md` — the reference photos;
- `brand/eh-elhekaya/cover-wifi-tiktok.html` — the cover.

Start every new video from copies of them. The cartoon style (`.claude/skills/animation/`) and the «لو» style
(`.claude/skills/law/`) are used only when the user names them.

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. Script (§1), voice (§2),
audio pipeline (§4), sounds (§7), render and QA (§8), cover and titles (§9) work exactly as in
`.claude/skills/animation/SKILL.md`. This file covers the reference photos, the look, the 3-D drawing engine and the
review.

**Quick mode in this style** still includes three checks, because the realistic look only came out right after them (the
Wi-Fi video failed three times without them):

- one frame per shot, looked at (§5);
- `motion.js` on the cards (§5);
- `nancheck.js` (§5).

What quick mode skips is the fix-and-look-again loop beyond one round of fixes, and frame reviews during the render.

## 1. Order of work

1. Script, voice and timing (animation skill §1, §2, §4). About 25 lines, 1:50–1:55 after `tighten.py`.
2. Reference photos of every real object in the story (§2 below). Never skip this: the user rejected drawings that did not
   look like the real devices («الصور غير واقعية»).
3. Build the shots (§3, §4).
4. Review (§5), one round of fixes.
5. Sounds, render, QA, then send. Commit and push.
6. Cover and titles when the user asks.

## 2. Reference photos (always)

Wikimedia Commons, with the scripts in `videos/tools/`. They send one request at a time with long pauses. Commons answers
429 when hurried; the scripts wait and retry.

```
python3 videos/tools/commons_search.py <scratchpad>/refs/search.json "TP-Link wireless router" "microwave oven" ...
python3 videos/tools/commons_fetch.py <scratchpad>/refs/search.json <scratchpad>/refs "File:A.jpg" "File:B.jpg"
```

- Make a contact sheet of the downloads and look at it.
- Note in the episode's `refs/SOURCES.md` a table with three columns: drawing | Commons file | what the drawing takes from
  it (shape, colours, parts). Use `videos/wifi/refs/SOURCES.md` as the model.
- Photos are visual reference only; nothing from them goes into the video.
- If a download stays blocked, say so in `SOURCES.md` and draw from the object's well-known shape.

What "from the photo" meant in the Wi-Fi video:

- **Router:** white two-step body, LED bar with green lights at the front, three flat blade antennas on hinges (outer two
  leaning out), blue WAN and yellow LAN ports on the back.
- **Phone:** black glass, aluminium frame, punch-hole camera, status bar, gesture bar, side buttons, camera island on the
  back.
- **Microwave:** dark mesh window over two thirds of the door, control strip with two dials.
- **Parkes telescope:** terracotta tower with white bands and windows, white dish with an outer mesh ring, tripod and focus
  cabin.

## 3. The look

The paper and the card (measured from the user's X-ray reference video «الدكتور شاف الكسر اللي في عضمك…»):

- **Paper:** cream `#eee5d0`, crop marks at the corners, a double-line card (outer about 2 px, inner 1 px, ink `#2b2b2b`).
- **Panel:** the picture fills the top of the card (SVG viewBox 640×800); a thin rule under it.
- **Caption:** two short lines in Noto Sans Arabic 800, swapped per sentence (no karaoke). The key word is coloured:
  - orange-red `#c4532c` for the action or the danger;
  - slate blue `#46698a` for the technical term;
  - olive `#6b7d3c` for the named part.
- **Labels:** leader-line labels on the parts, magnified inset circles for tiny things (a chip, a black hole), numbered
  callouts, a dark number box for numbers («2.45 GHz», «20»), a red ✗ for a wrong idea.
- **No cartoon faces, no brush tags.**

The realism rules (what made the user accept the Wi-Fi video):

- **Lit 3-D drawings, not flat icons.** Every object is built from extruded outlines with rounded corners, cylinders and
  tubes. Faces are lit from the upper left, back faces are hidden, and every object casts a soft shadow. Screens, LEDs,
  ports, windows and labels sit as decals on the faces.
- **Every device in its real place**, not floating on a grid:
  - a living room: wood floor, rug, sofa, TV on a cabinet, window, side table with the router, coffee table with the phone
    on a stand;
  - a kitchen: tiles, counter with cabinet doors, the microwave on the counter;
  - a classroom: board on the wall, desks;
  - a field: grass, trees.

  The paper-grid floor is only for abstract shots: a wave, data tokens, lanes.
- **Screens show real interfaces:** a video player (film frame, red progress bar, title lines, next videos) and a photo
  gallery grid, plus the status bar, punch-hole and gesture bar.
- **Data is shown as things that move:**
  - printed photo cards, chat bubbles and music discs flying;
  - 0/1 glyphs running along paths and cables;
  - rings for radio waves.
- **Show the whole chain when something turns into data.** The user asked for this explicitly. In the Wi-Fi video:
  1. the photo lifts out of the gallery on the phone screen;
  2. it bursts into 0s and 1s;
  3. the bits fly through the air (Wi-Fi) to the router;
  4. they go down the blue cable into the wall socket.
- **The camera never stays on one angle.** Each shot orbits or pushes in while it plays, and consecutive shots change the
  view: low across the room, high plan view, close-up, wide.

Structure and pacing (from the reference video):

- **Opening card** under the hook: brand label, the category in orange-red, the hook in Noto 900 with one orange word, a
  dark panel with the subject moving.
- **The mechanism, one step per shot:** the real object in its place first, then a close-up on each part as the voice names
  it, with what happens shown moving (particles, rays, rings) and a number box when there is a number.
- **The misconception** with a red ✗, a **history fact**, the **payoff**.
- **Summary card** for the last line: the question as a heading, a small labelled drawing with numbered callouts and a
  2-column legend, one big stat in orange-red (it counts up), 3 numbered recap lines, a «معلومة زيادة:» line.

## 4. The 3-D drawing engine (copy `videos/wifi/diagram/shots.js`)

`build.py` builds `scenes.js` from the shared `videos/_templates/diagram/_helpers.js` (paper, the `T()` text helper,
`callout`, `crossMark`, `numBox`, `inset`, the panel camera) followed by the episode's `shots.js`, and builds `index.html`
from `episode.py` (title, category, hook, the summary card's HTML, and the caption key words `K`). `shots.js` has these
parts in order; keep the first three and replace the shots:

1. **Engine:**
   - `setView(yaw, pitch)`, `P(point)` — the 3-D projection;
   - `slab(center, A, B, outline, thickness, colour, {face, hatch, hatchUp})` — an extruded convex outline, lit, back faces
     hidden;
   - `poly3`, `tube`, `ringArc`, `dotAt`, `ln3`, `mapP`;
   - `put(center, svg)` + `flush()` — draw order by depth;
   - `camV(...)` — the shot camera;
   - `floorGrid`.
2. **Objects:**
   - devices: `router3`, `phone3`, `standPhone`, `microwave3`, `parkes3`, `rj45`, `laptop3`, `tv3`;
   - furniture: `table3`, `sofa3`, `counter3`, `tree3`, `bundle3`;
   - shapes and data: `cubeObj`, `cyl`, `token3` (photo, message, sound, sheet), `bitsPath`, `floorRings`;
   - the frame-aware `label()`.
3. **Places:** `room3(ext, height, {tiles, window, board, winX})`, `deskTop`, `livingRoom(t, {onTable, tv, tvOn, coffee, side})`.
4. **Shots:** one `shot(line, camV(...), draw)` per script line. Line 0 is the opening card and the last line is the summary
   card (placeholders in the panel); then `window.__intro`, `window.__outro`, `window.__parts`.

Rules that cost a re-render when they were missed:

- **Camera:** `camV(yaw0, pitch0, yaw1, pitch1, zoom0, zoom1, lookAt)`. Both angles change during the shot; `lookAt` is the
  3-D point at the centre of the frame (default 40 above the floor centre). Zooms under 1.9 are multiplied by 0.8. In rooms
  keep yaw between 0.1 and 1.5: the two walls stand at x = −ext and y = −ext.
- **Draw order:** `put()` each object with its centre and `flush()` once. Anything standing on a table goes in that table's
  own string (`table3(..., onTop)`). Otherwise a table drawn later covers it.
- **Colours:** always hex. `shade`/`hexShade` parse hex only, and an `rgb()` string turns a face black (it made every table
  black once).
- **Labels:** use the `label()` in `shots.js`. It overrides the shared one: the same size at any zoom, a paper backing, and
  it stays inside the frame. Anchor it on the part with `P(point)`, and hide a label when its part leaves the shot.
- **Never parks:** each shot's camera eases half-linear, so the first and last frames still move. The opening card, any
  flat 2-D card (like the Wi-Fi name card) and the summary card need their own motion:
  - objects orbiting;
  - bits flowing;
  - a sweep line;
  - drifting 0/1 glyphs behind a flat card;
  - letters bouncing;
  - the stat counting up.

## 5. Review (one round, also in quick mode)

```
node videos/tools/nancheck.js videos/<slug> diagram                  # no errors, no NaN, all frames + both cards
node videos/tools/shotsheet.js $PWD/videos/<slug>/diagram/index.html <scratchpad>/shots 0.6
python3 videos/tools/montage.py <scratchpad>/shots <scratchpad>/a.png 0 12
python3 videos/tools/montage.py <scratchpad>/shots <scratchpad>/b.png 12 25
node videos/tools/motion.js $PWD/videos/<slug>/diagram/index.html 0 <end of line 0>   # and each flat card, the summary
```

Look at both sheets and fix:

- labels cut at the edge;
- objects off frame or too small;
- black faces;
- things overlapping the title;
- anything that does not look like the device in the photo.

Aim for `motion.js` ≤ 0.6 s still on the cards before the render; `qa.py` must then say PASS (the Wi-Fi video: 0.67 s frozen
in total).

## 6. Sounds, render, QA, cover, titles

Follow the animation skill §7–§9. Sounds are softer here: paper whooshes, ticks, a low hum for machines, few big effects.

The cover uses the video's own drawings on the dark cover palette. `cover-wifi-tiktok.html` loads the episode's `timing.js`
and `diagram/scenes.js` and composes the scene from `window.__parts`:

- `router3`, `standPhone`, `token3`, `floorRings`;
- a dark floor slab under them;
- a warm glow behind the scene.

Keep the flying objects below the yellow sub-title.
