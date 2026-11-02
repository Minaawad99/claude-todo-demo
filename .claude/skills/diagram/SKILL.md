---
name: diagram
description: >
  Make an «إيه الحكاية؟» explainer video in the "الرسم الهندسي" (technical-diagram) style, on any topic: cream graph-paper
  card, **isometric drawings that stay close to the real thing (never cartoon)**, hatching in place of shadows, cut-away
  and section views, real maps, leader-line labels, one short caption under the picture, and a summary infographic card at
  the end. Built from two reference videos the user picked: the X-ray explainer and «طب إزاي؟ – إزاي الإنترنت بيشتغل؟».
  Use when the user says "دايجرام", "بالرسم الهندسي", "بطريقة الرسم الهندسي", "ايزومتريك", "زي فيديو الإنترنت",
  "زي فيديو الأشعة", "diagram style" or "technical style". Every other step (script, voice, sounds, render, QA, cover,
  titles) follows the animation skill.
---

# «إيه الحكاية؟» — the "الرسم الهندسي" style (دايجرام)

The user calls this style **دايجرام** or **الرسم الهندسي**. It is the house drawing style for every new topic: the same
look, the same drawing rules, a different subject each time. It copies the look and pacing of two reference videos
(series «طب إزاي؟»): the X-ray explainer (94 s) and «إزاي الإنترنت بيشتغل؟» (178 s, 720×1280 30 fps). We keep our own
brand («إيه الحكاية؟») in place of «طب إزاي؟».

**Look at the frames in `reference/` before drawing anything:** the contact sheets (`sheet-1..3.jpg`) show the whole
internet video shot by shot, and `frame-*.jpg` show single frames at full size (a phone, an isometric room, a cable in
section, the summary card).

Talk to the user in Egyptian Arabic. Ask the quick-mode question first, as in the animation skill. Script, voice (Gemini
Puck), reference research, sounds, render, QA, cover and titles all work exactly as in
`.claude/skills/animation/SKILL.md`. Only the look, the layout and the shot style change.

## The two rules that define this style

### 1. Close to reality, never cartoon

- **True proportions.** Every object is drawn from real photos (animation skill §3, reference research), with its real
  shape, parts and proportions: a router has its real antennas and LED row, a server rack has real units and small lights,
  a submarine cable has its real layers (armour wires, copper, insulation, glass fibres). No exaggerated heads, rounded
  "toy" shapes, squash-and-stretch, or bounce.
- **No characters with faces, no mascots, no eyes on objects, no speech bubbles, no emoji.** If a person is needed, show
  only a hand, or a simple neutral silhouette in true proportion.
- **Real geography.** Maps and globes use real coastlines (Natural Earth / world-atlas TopoJSON projected with d3-geo,
  or a traced real map), real cable and road routes, real city positions. Never invented blobs.
- **Real numbers and real labels.** Use real-looking data in the drawing (IP addresses like `203.0.113.7`, «24 ساعة»,
  «99%», «100,000 V») and check them in the research.
- **Detail where the eye lands.** Add the small true details that make a thing believable: screws, vents, cable ties,
  LEDs, seams, wood edges, window frames. Keep the rest simple.

### 2. Isometric by default

- **Rooms, buildings, streets, machines, furniture and devices in space are drawn in true isometric** (30°), seen from
  above at 3/4, like a scale model on a table. Use the `iso*` helpers (below); never fake it with skewed rectangles.
- **Three-face shading:** top face lightest, left face the base colour, right face darker **and hatched**. No gradients,
  no soft drop shadows; only a flat contact shadow (`isoShadow`) so things sit on the floor.
- **Cut-away views:** a room is shown with two walls (back and side) and the front open; a building or machine is
  shown with a wall or casing removed so the inside reads; the cut edges are hatched.
- **Section views:** pipes, cables, wires, bones, layers of the ground and so on are cut across to show their layers
  in rings, each ring a different flat colour, with leader-line labels.
- **When to leave isometric:**
  - a flat object faced head-on (a phone screen that shows something, a letter or envelope, a data card) is drawn
    flat and front-facing, slightly tilted at most;
  - maps and globes are drawn as maps (orthographic globe or a flat projection);
  - a close-up of one part may be a straight side or front elevation, like a technical drawing.

## Look (measured from the references)

- **Paper:** the whole frame is cream paper `#eee5d0`. A frame card with a thin dark line (about 2 px at 720 wide, ink
  `#2b2b2b`) sits about 70 px in from the sides.
- **Panel:** the drawing fills the top of the card, about 65–70 % of its height, on a faint square grid (`#dccfb2`, about
  64 px cells at 720 wide). The drawing may run off the panel edges and be cut there, like looking through a window.
  A thin rule separates the panel from the caption. Use a black panel `#111` only for "photo / X-ray / old photo" shots.
- **Caption:** one short line, two at most, centred in the lower part of the card, Noto Sans Arabic, ink `#2b2b2b`. One
  key word is coloured:
  - orange-red `#c4532c` for the action, the number or the danger;
  - slate blue `#46698a` for the technical term or the data;
  - olive `#6b7d3c` for the named part, the cable or the place.
  The caption changes per sentence (no karaoke). A line often ends in «،» or «…» and carries on in the next shot.
- **Palette:** flat and muted, like old printed paper. No pure black, no pure white, no bright saturated colours.

  | use | colour |
  |---|---|
  | paper | `#eee5d0` |
  | outlines, devices, server cases | `#41392f` / ink `#2b2b2b` |
  | accent: action, numbers, routers, the sun | `#c4532c` |
  | data, packets, key terms | `#4f7a9a` (slate blue `#46698a` for text) |
  | land, cables, sofas | `#8e9f6a`, light `#c5cb9e` |
  | sea, sky, glass | `#b9bfbb` |
  | sand, floors, skin, wood | `#d9b9a0`, `#d9c3a8`, table `#d0806a` |
  | putty / metal | `#cdc9bb` |

- **Lines:** one even outline weight (about 2 px) for objects, a thinner one (1.2–1.4 px) for details and leader lines.
  Rounded joins.
- **Hatching:** fine diagonal lines (`url(#hatch)`, or `url(#hatchW)` on dark fills) on the shaded face, on cut edges,
  on the dark rim of a globe, and on walls in shadow.
- **Labels:** a leader line from a dot on the part to a small word (`label()`), coloured like the caption key word. Data
  in small rounded white boxes with a mono font (IP addresses, web addresses). Big numbers in a serif face in orange-red
  (e.g. «24» over «ساعة»).
- **Marks:** a red ✗ drawn over a wrong idea, a «؟» popping above a device, numbered round callouts ①②③, a chapter
  marker (a circled number with progress dots under it) at the start of each part.
- **A running motif:** pick one simple picture that stands for the subject (the reference: a phone playing a video of the
  pyramids and a red sun) and bring it back all through the video, changed by the story (turned into pixels, then into
  0/1, then into packets, then back into the picture).

## Structure and pacing

Each shot is **one short sentence**, about 2–4 s. A 90–100 s video has about 26–32 shots; a 3-minute video about 50.

1. **Hook** on the running motif, in the second person («بس لما أنا رفعت…»), then the question («طب إزاي؟») with the
   motif in a circle, then line 3 «إيه الحكاية؟ هشرحهالك في دقيقة.»
2. **Chapters** (2–4), each opened by the chapter marker. Inside a chapter:
   - start from the everyday place, drawn isometric (the living room, the street, the kitchen);
   - follow the thing as it moves (phone → Wi-Fi waves → router → wall cable → street → data centre → sea cable → other
     continent), cutting or zooming from one isometric scene to the next;
   - explain each hard idea with a real-life comparison drawn as its own shot (a phone book, an envelope with «من / إلى»,
     threads as thin as a hair);
   - zoom into a part as the voice names it, with its leader-line label.
3. **The misconception** («ناس كتير فاكرة إن…»), with a red ✗ on the wrong idea, then the right picture.
4. **«يعني من الآخر…» recap** over the map or the whole route.
5. **Summary card** (the last 3–4 s):
   - the question as a heading;
   - a small map or diagram with numbered callouts ①②③④ and a 2-column legend;
   - one big stat in orange-red (e.g. «99%») with a one-line explanation beside it;
   - a boxed closing line: «قولولنا… عايزين تعرفوا حكاية إيه المرة الجاية؟».
   It stays on screen into the tail.

**Motion:** calm and smooth, the camera never parks.

- A slow push-in, pan or slight rotation inside each panel; never bounce or overshoot.
- **Zoom transitions** between scales (globe → continent → city → street → building → room) carry the story. Use
  crossfades of about 0.3 s between unrelated shots.
- The parts the voice names animate: a route draws itself dot by dot between two pins, packets slide along a cable,
  0/1 tiles stream between devices, waves ripple out of a router, a label line draws itself.
- The coloured caption word and the matching drawn part appear together.
- Same QA rules as the animation style (no still over 0.75 s), unless the user picked quick mode.

## Voice and script

- Egyptian Arabic, calm explaining tone, a little slower and more "teacher" than the cartoon videos.
- Short sentences that run across shots. Plain words; one real-life comparison for each technical idea.
- Keep line 3 «إيه الحكاية؟ هشرحهالك في دقيقة.» and the closing «قولولنا، عايزين تعرفوا حكاية إيه المرة الجاية؟».

## Build

- Use the same engine as the cartoon videos:
  - `timing.js`, `shots.js` (`shot(line, cam, draw)`), `build.py` → `scenes.js` + `index.html`;
  - `render.js`, `qa.py`, `tools/frame.js`.
- Start from `videos/_templates/diagram/` (`template.html`, `_helpers.js`, `build.py`). The panel is an SVG, world
  640×800.
- Shared helpers in `_helpers.js`:
  - paper and marks: `paper()`, `dark()`, `T()`, `R()`, `label()`, `callout()`, `crossMark()`, `numBox()`, `inset()`,
    `waveRay()`, `arrow()`;
  - **isometric:** `isoAt(ox, oy, s)` sets where world (0,0,0) lands and the scale; `iso(x, y, z)` → screen point;
    `isoFace(pts, fill, hatch)`; `isoBox(x, y, z, w, d, h, [top, left, right])` (right face hatched);
    `isoFloor(x, y, w, d, fill)`; `isoShadow(x, y, w, d)`; `isoCyl(x, y, z, r, h, fill, top)`.
  - Draw back to front (painter's order): floor, back walls, far objects, near objects, labels last.
- Build each real object as its own function in `shots.js` (e.g. `router(x, y)`, `serverRack(x, y, n)`,
  `cableSection(k)`) from the reference photos, and note in `refs/SOURCES.md` which photo each one took its shape from.
- For maps, load real land shapes (world-atlas TopoJSON + d3-geo from the allowed CDNs), project once at build time
  and store the paths in the episode, so rendering does not depend on the network.
- Sounds: softer than the cartoon videos. Use paper-like whooshes, ticks, a low hum for machines, and few big effects.
  Library first, then ask with Pixabay search terms.
