# The Gemini person kit (the default for people from now on)

The user's choice after the miswak review (Nov 2026): people are no longer drawn by code. They come from character sheets
made in Gemini with the prompts below, cut out by `cutout.py` into transparent PNGs in `sprites/`, and placed with
`sprites.js`. The old vector kit `../person.js` stays only for episodes already made.

## Use it

```html
<script src="../../_templates/people/gemini/sprites.js"></script>   <!-- path from the episode's page -->
```

```js
PERSON.sprite("beard-miswak-sad", x, feetY, height, { t: window.__t, flip: false })   // returns an SVG <g><image/></g>
PERSON.spriteNames()                                                                // every sprite
```

- `(x, feetY)` is the middle of the feet; `height` in page units (a standing adult ≈ 0.8 of the panel height looks right).
- `t` adds calm breathing and a tiny sway, so the person is never frozen; `flip` mirrors; `rot` turns about the feet.
- A hand sprite (`hand-*`) is anchored at its wrist end (the bottom of the image): use it for close-ups.
- **The main character in every episode is the host** (`host-*`: open slate-blue shirt, sleeves rolled, white T-shirt,
  khaki chinos, white sneakers, short hair combed back; the user's choice, Nov 2026, no galabeya). `tshirt-*` is the first
  draft of him (beige T-shirt, buzz cut): don't use it as the main character.
  `beard-*`, `cap-*`, `curly-*` (galabeya characters) only as other people in a story that needs them. Outfits for other people in
  the story: `a-*`, `b-*`, `c-*` (office, doctor, worker, home, galabeya, a woman in hijab).
- `catalog.png` shows every sprite with its name.

## Sprites

| set | names |
|---|---|
| the host (main character) | host-front, host-3q, host-side, host-back |
| first draft | tshirt-front, tshirt-3q, tshirt-side, tshirt-back |
| hands | hand-relaxed-side, hand-relaxed-back, hand-palm, hand-back, hand-point, hand-grip-stick, hand-toothbrush, hand-fist, hand-wave, hand-thumbsup, hand-rest, hand-back-open, hand-back-open2, hand-belly |
| poses ×3 characters | {beard,cap,curly}-point-up, -miswak-sad, -brushing, -belly, -walk, -sit, -arms-crossed, -talk; beard/curly-explain; beard-sit2, cap-sit2, curly-stand-3q |
| outfits | a-office, a-doctor, a-worker, a-home, a-office2, a-home2, a-galabeya, a-woman-hijab · b-office, b-doctor, b-worker, b-home, b-galabeya, b-woman-hijab · c-office, c-doctor-scrubs, c-worker, c-home, c-home2, c-thobe, c-thobe2, c-woman-hijab |

Known flaws: `beard-belly` has a white circle over the belly (a Gemini artefact; don't use it); some hands carry a small
stray mark at an edge. Remake any of them with the prompts below and run `cutout.py` again.

## A new pose or person

1. In Gemini, attach `sheets/s1.jpg` (and the pose sheet of the character you want) and ask for the new poses with the
   pose prompt below, changing the list of poses.
2. `python3 cutout.py <sheet.jpg> cut <prefix>` (set `LINEW=22` when the sheet has thick ground lines), look at the cut-outs,
   copy the good ones to `sprites/<name>.png`, then regenerate `sprites.js` (the index is just name → [w, h]).

## The prompts (English works best in Gemini; attach the first sheet to every later one)

Turnaround:
```
Character model sheet for an animated explainer channel. One young Egyptian man, about 28, short dark hair, light-brown skin, friendly face. Full body, standing in a relaxed A-pose (arms slightly away from the body, palms facing the thighs), shown in four orthographic views side by side: front, three-quarter, side profile, back. Same height and proportions in every view, aligned on a common ground line with faint horizontal guide lines at head, chin, shoulders, waist, hips, knees and ankles. Realistic adult proportions (7.5 heads tall), natural sloping shoulders, the T-shirt sleeve seam sitting on the shoulder, visible elbows, realistic hands with five fingers at true size (hand length equals face height). Clothes: plain sand-beige crew-neck T-shirt, dark blue jeans, dark sneakers. Style: clean flat vector illustration, uniform dark-brown ink outline (#2a2016), flat colors with one soft shadow tone per color, light from the upper left, no gradients, no texture, no text, no background objects. Plain cream background (#eee5d0). High resolution, 16:9.
```
Hands:
```
Hand reference sheet for the same character (use the attached image for skin tone, outline and style). Twelve right hands at the same scale, arranged in a 4×3 grid on a plain cream background (#eee5d0), each seen clearly: relaxed hanging seen from the side, relaxed seen from the back, open palm facing viewer, open back of hand, pointing with the index finger, fist seen from the side, hand gripping a thin wooden stick (stick passing through the fist), hand holding a toothbrush, thumbs up, waving, hand resting flat on a surface, hand on the belly. Anatomically correct: five fingers with three joints each, thumb from the base of the palm, knuckles, short nails, realistic length (hand length = face height). Same flat vector style: uniform dark-brown outline (#2a2016), flat skin color with one shadow tone, no gradients, no text. High resolution, 4:3.
```
Poses (change the list for each episode):
```
Pose sheet for the same character (use the attached image to keep the face, body, proportions, clothes and style identical). Eight full-body poses on a plain cream background (#eee5d0), same scale, each standing on its own ground line: pointing up at something, holding a miswak stick in one hand and looking at it disappointed, brushing his teeth, hand on his belly, both hands open explaining, walking (side view), sitting on a chair (three-quarter view), arms crossed. Natural shoulders that move with the arm, sleeves following the shoulder, clear elbows, realistic hands at true size. Flat vector style, uniform dark-brown outline (#2a2016), flat colors with one soft shadow tone, no gradients, no text. High resolution, 16:9.
```
Outfits:
```
Outfit sheet for the same character (use the attached image: identical face, body, proportions and style). The same front-view A-pose repeated six times on a plain cream background (#eee5d0), changing only the clothes: 1) office shirt with tie and trousers, 2) doctor's white lab coat over a shirt, 3) construction worker with hi-vis vest and hard hat, 4) cozy home sweater and sweatpants, 5) traditional Egyptian galabeya, 6) a woman version of the character in a long-sleeve top, hijab and long skirt. Show realistic fabric: shoulder seams, sleeve folds at the elbow, collar, cuffs, hems. Flat vector style, uniform dark-brown outline (#2a2016), flat colors with one soft shadow tone, no gradients, no text. High resolution, 16:9.
```
