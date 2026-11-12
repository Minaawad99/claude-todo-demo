# «اسكتش» illustration prompts

The drawings in an «اسكتش» episode are ink-and-wash technical cutaways, like the engine cutaway the user picked as the
style reference: fine black ink outlines, soft colour wash with highlights and light cross-hatching, real 3D volume,
3/4 view, cut open to show the inside, on plain cream paper. The video adds the Arabic labels, the arrows and the
motion; the pictures carry no text.

## Who makes them

The free Gemini API tier allows 0 image requests, so the user makes them in **Google AI Studio** (model
**Nano Banana Pro**, `gemini-3-pro-image`), attaching the style reference image to every prompt, and sends them back.
If the API key has billing, the same prompts can go through the API (`responseModalities: ["IMAGE"]`).

Give the user one code block per picture, numbered, with the fixed style block below to paste after each. Ask them to
send the pictures with their numbers. Mark which ones are essential (the thing explained) and which are analogies.

## The fixed style block (paste after every prompt)

```
Hand-drawn technical cutaway illustration in exactly the style of the attached reference image: fine black ink outlines, rich soft colour shading with highlights and light cross-hatching, real 3D volume, 3/4 perspective, cut away to show the inside. Medically accurate, realistic proportions, not cartoon. Plain warm cream paper background (#EEE5D0) with NO grid. NO text, NO labels, NO arrows, NO callouts, NO watermark. Muted palette: warm red-orange for oxygen-rich blood, slate blue for oxygen-poor blood, natural skin tones. Portrait 4:5.
```

Change the palette sentence to fit the topic (for a machine: steel greys, warm orange for heat, slate blue for water).

## How to write a prompt

- One subject per picture, named precisely, with what must be cut open and what must show inside.
- Say the view: "3/4 view", "seen from the side", "cut across".
- Real anatomy or mechanics: name the parts that must be there ("one large vein and two smaller arteries").
- Colour the meaning: blood rich in oxygen is warm red; ask for it explicitly where the model might choose blue
  ("maternal blood in warm red").
- Separate objects (two cells, two magnets) are good: their parts can be moved independently in the video.

## Examples (episode «نفس الطفل», `videos/fetus-breathing/sketch/img/src/`)

```
1. A realistic pregnant woman, about 8 months, seen from the side (facing right), full torso from head to hips, with a cutaway of the chest and belly showing her lungs, heart, the aorta running down, and the uterus with the baby inside.
2. A pregnant uterus cut open in 3/4 view: the thick muscular wall sliced through, amniotic fluid inside, a realistic fetus at about 8 months curled head-down, the placenta attached to the upper inner wall, the umbilical cord running from the placenta to the baby's belly.
3. A realistic fetus at about 8 months, curled up, seen from the side, floating in amniotic fluid, with real 3D volume and soft skin shading; the umbilical cord attached at the belly.
4. A block of placenta tissue cut out and shown in 3/4 view like an engineering cutaway: on top the chorionic plate with the umbilical cord rising from it and blood vessels branching across its surface; inside, tree-like chorionic villi hanging down into pools of maternal blood; at the bottom the uterine wall with spiral arteries spurting blood up into the pools.
5. Extreme close-up of a single chorionic villus cut open in 3/4 view: a fetal capillary with red blood cells inside, surrounded by a very thin membrane, bathed in maternal blood (warm red) with the mother's red blood cells around it.
6. A short segment of umbilical cord cut across, 3/4 view: the twisted cord with translucent Wharton's jelly, one large umbilical vein and two smaller umbilical arteries spiralling inside it, clearly visible on the cut face.
7. Two human red blood cells as 3D biconcave discs side by side, highly detailed.
8. A single human cell cut open in 3/4 view showing the nucleus and mitochondria.
9. A tea bag steeping in a clear glass of water, tea colour spreading out from the bag, 3/4 view.
10. Two horseshoe magnets, one small and one large, with a steel nail between them, 3/4 view.
11. Mount Everest as a cut-out block of terrain in 3/4 view, snowy summit with a small flag, rock strata visible on the cut sides.
12. An empty room seen from above in 3/4 view, about 3 by 4 metres, walls cut away, tiled floor.
13. Two glass laboratory cylinders side by side, one almost full of red liquid and one about two-thirds full of lighter red liquid, 3/4 view.
```

## When they come back

- Check every picture: the anatomy or mechanism is right, nothing important is missing, and there is no text. Words the
  model wrote anyway can be removed with `img_prep.py --text N:x0,y0,x1,y1`.
- Say which picture needs redoing and give the corrected prompt; use the others meanwhile.
- Copy them to `<episode>/sketch/img/src/NN.jpg` and run `img_prep.py` (it prints the `pics({...})` line).
