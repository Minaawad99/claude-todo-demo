# People: how every person is drawn, in every skill

**The user's fixed rule (after the person demo, November 2026):** every person in every «إيه الحكاية؟» video is drawn with
this kit, in every skill: «اسكتش» (sketch), the cartoon `animation` skill, `story-2d`, «لو» (`law`), and any skill made later.
No other way of drawing people: no stick figures, no ball heads, no faceless flat salmon figures, no joints drawn as
circles or pins, no dots marking joints.

The reference is the 30-second demo `videos/person-demo/` (rendered as «الشخصية-الجديدة-تجربة-3»). The look comes from the
channel's Gemini cover `brand/eh-elhekaya/naps-gemini-art.jpg`: a clear face, joints in the right place, five-finger hands.

## Load it

```html
<script src="../_templates/people/person.js"></script>   <!-- path from the episode's page; it needs nothing else -->
```

It is self-contained (its own helpers) and exposes `window.PERSON`:

| call | what it draws |
|---|---|
| `PERSON.front(o)` | the person from the front or three-quarter: sitting, standing, reaching, pointing, the hand on the forehead |
| `PERSON.side(o)` | the same person in profile: walking, bending, lying down (`rot: -90` = flat on his back) |
| `PERSON.walkPose(phase, amp)` | a walking cycle for `side()`: legs and arms for one phase (radians) |
| `PERSON.sideHipY(o, floorY)` | the hip height that puts the lower foot exactly on the floor (no sinking, no floating) |
| `PERSON.mix(a, b, k)` | tween two `front()` poses |
| `PERSON.sofaFront(cx, floorY, w, s)` | a sofa at the same scale |
| `PERSON.hand(...)`, `PERSON.head(...)` | a hand or a head alone, for close-ups |
| `PERSON.outfits` | the outfit presets (see «Clothes follow the topic») |
| `PERSON.colors`, `PERSON.setInk(c)` | the palette (skin, hair, shirt, trousers, socks) and the outline colour, to match the skill's look |

The same names are also plain globals (`person`, `personSide`, `walkPose`…) where the name is free. The story kit has
its own `person()`, so in `story-2d` always call `PERSON.front` / `PERSON.side`. The option lists are at the top of
`person.js`; `videos/person-demo/index.html` shows every pose used so far.

## The rules it keeps (keep them when you pose it)

1. **Real proportions** (Drillis & Contini, H = 400 units at s = 1):
   - heights: hip joint 0.52H, shoulder joint 0.818H, chin 0.87H;
   - segment lengths: thigh 0.245H, shank 0.246H, upper arm 0.186H, forearm 0.146H, hand 0.108H;
   - widths: shoulder joints 0.22H apart, hip joints 0.10H apart;
   - head: 0.13H tall.

   With the arms hanging, the wrist is at the top of the thigh and the fingertips at mid-thigh. Furniture is to the same
   scale: sofa seat 0.26H, arms 0.37H, back 0.49H; table 0.43H.
2. **Joints hidden inside one flowing outline**: an arm is one shape from the shoulder through the elbow to the cuff, and
   a leg one shape from the hip through the knee to the hem. They thicken at the shoulder, forearm, thigh and calf, and
   the cloth folds inside the bend. Never a circle at a joint.
3. **A reaching arm is a straight line** (`straight: true`): a stretch overhead or a reach to a shelf goes from the
   shoulder to the fingertips with no elbow sticking out. Elbows bend only forward and up; knees bend only backward.
4. **Hands with five fingers**:
   - each finger has three joints, tapers to the tip, and has a nail;
   - the thumb grows out of the palm's heel;
   - poses: `open`, `relaxed`, `flat`, `fist`, `point`, `thumb`;
   - a curled finger shortens toward the viewer, as a real fist does; it does not coil;
   - a hand lands on the real spot: the forehead with the elbow out to the side, the thigh, the belly.
5. **A face that acts**:
   - eyes with lids, iris and a highlight;
   - brows: `neutral`, `raised`, `worried`, `angry`;
   - mouth: `neutral`, `smile`, `grin`, `open`, `o`, `frown`, `yawn`;
   - tired eyes, blinks;
   - a three-quarter `turn` and a profile head in `side()`.

   The face shows every reaction: shock, relief, dizziness, sleepiness.
6. **The right view for the action**:
   - front or three-quarter for sitting, standing, reaching and reacting;
   - side view for walking, bending and lying down. Lying on a bed or sofa is flat on the back
     (`PERSON.side({... rot: -90})`), head on the pillow, not propped up;
   - walking uses `walkPose` and `sideHipY`. The leg on the floor stays straight, the other bends just after it leaves
     the floor, and the arms swing against the legs.
7. **Alive in every frame**: breathing (`breath`), a small head sway, blinks. He is never frozen through a line.

## Clothes follow the topic (the user's rule)

The body, face, hands and proportions never change; **the clothes change with every topic**. Before drawing, decide who
each person is in that story and dress them for it: a doctor in a lab coat, a site worker in a hi-vis vest and hard hat,
a pilot in a uniform and cap, a cook in an apron, someone at home in a sweater and socks.

```js
PERSON.front({ ..., outfit: "doctor" })                                    // a preset
PERSON.side({ ..., outfit: { base: "worker", colors: { vest: "#e2c12a" } } })   // a preset with changes
PERSON.front({ ..., outfit: { top: "shirt", tie: true, over: "labcoat", hat: null, feet: "shoes", colors: {...} } })
```

- **Presets** (`PERSON.outfits`): `home` (sweater, socks; the default), `casual` (T-shirt, shoes), `office` (shirt and tie),
  `doctor` (shirt, tie, lab coat), `worker` (T-shirt, hi-vis vest, hard hat, boots), `pilot` (white shirt, tie, epaulettes,
  pilot's cap), `chef` (shirt, apron, cap). See them all, front and side: `videos/person-demo/outfits.html`.
- **A woman** (added for «الليزر», approved by the user): `woman` (rose sweater, jeans) and `womanCasual` (T-shirt). The
  same joints; `hair: "long"` (wavy hair over the shoulders, a side parting, a fringe) and `fem: true` (lashes, tinted lips,
  blush, softer shoulders, a waist, the bust, wider hips and seat, front and side), which work with any outfit, e.g.
  `{ base: "doctor", hair: "long", fem: true }`. Demo: `videos/person-demo/woman.html`. Keep it modest and clothed.
- **The Gulf** (added for «الكعبة من جوة»): `saudi` (white thobe to the ankles, white ghutra, black agal), `saudiShemagh`
  (the red-checked shemagh), `bisht` (the thobe under a black cloak with a gold edge, for officials). Front and side.
  Demo: `videos/person-demo/gulf.html`.
- **The parts:**
  - `top`: `sweater`, `tshirt` (bare forearms), `shirt` (collar, buttons, pocket, cuffs);
  - `over`: `labcoat`, `vest`, `apron`;
  - `tie`, `epaulettes`;
  - `hat`: `hardhat`, `cap`, `pilot`;
  - `feet`: `socks`, `shoes`, `boots`;
  - `colors` for any of them (shirt, pants, tie, vest, coat, hat, shoes…).
- **The time and place:** clothes match the setting too. Period clothes in a story, the right uniform for the job, the
  weather, the country.
- **A missing outfit:** a firefighter, police, a nurse, a galabeya, a woman's dress, a child, a diver. Add it to
  `person.js` as a new part or preset, front and side, and add it to `outfits.html`. Never draw a different body for it.

## In each skill

- **sketch («اسكتش»):** load it next to the sketch helpers. The cream paper, ink and accent colours stay. People in close-ups
  for actions and reactions; a body cut (the throat, the lungs) still uses the real anatomy from a reference picture,
  drawn inside or beside this person.
- **animation (cartoon panel):** humans are this person, not ball-head characters. Mascots (an oil drop, a phone) may stay.
- **story-2d:**
  - call `PERSON.front` / `PERSON.side`, with `PERSON.setInk("#121419")`;
  - give each character period clothes through `colors`;
  - the cel shadow, the light and the grain of the frame go over them.

  For a character the kit can't dress yet (a long dress, a uniform, a child), add that option to `person.js` instead of
  drawing a different body.
- **law («لو»):** the reacting man is this person: `front()` for the «بس…» and «عشان كده…» reactions, `side()` when he
  walks, digs or climbs. The 2.5D scene stays around him.
- **A new skill:** load `person.js` and follow these rules from the first episode.

When a pose is missing, add it to `person.js` (and to the demo) so every skill gets it. Don't draw a person any other way.
