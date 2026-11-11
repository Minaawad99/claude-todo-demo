# «إزاي الطفل بيتنفس في بطن أمه؟»: visual references and facts

## Illustrations

The drawings are illustrations the channel made in Google AI Studio (Nano Banana Pro) from prompts written for this
episode, in the style of a technical cutaway reference image the user chose (ink outlines, colour wash, 3D volume):
`sketch/img/src/01–12.jpg`. `sketch/img/prep.py` removes stray English words from 07 (inpainting), keys out the paper
background to alpha and writes `sketch/img/NN.webp`. The video adds the Arabic labels, arrows, moving oxygen and blood,
and the camera. 01 mother, 02 uterus with fetus head down, 03 fetus with cord, 04 placenta block, 05 villus close-up,
06 umbilical cord cut across, 07 red cells, 08 cell, 09 tea bag, 10 magnets, 11 Everest block, 12 heart (unused).
The room (12 m²) and the gauges are still drawn in code.

- **Hand and layout:** the «طب إزاي؟» reference video v17 (`videos/_reference/tabizzay/sheets/v17.jpg`): the fetus inside a
  thick red uterus ring, pale amniotic fluid, a striped twisted cord. Looked at only; our script and drawings are new
  (v17 is about the first breath after birth; this episode is about the placenta before birth).
- **Uterus in section, placenta on the upper wall, fetus head down, cord:** «Placenta.svg», Wikimedia Commons (CC BY-SA).
  Looked at only, not reused.
- **Placenta in section:** Gray's Anatomy (1918) fig. 39, «Gray39.png», Wikimedia Commons (public domain): the chorionic
  plate with the cord vessels, villous trees hanging into the intervillous space, the basal plate with spiral arteries,
  placental septa. Our `placentaSection()` follows that layout.
- **Colour rule:** orange = blood rich in oxygen (the umbilical vein, the mother's arteries), slate blue = blood poor in
  oxygen (the two umbilical arteries).

## Facts checked

- The placenta at term is a disc about 22 cm across and about 500 g ("قد طبق العشا").
- Maternal and fetal blood don't mix: fetal blood stays inside the villi, which sit in the intervillous space filled
  with maternal blood from the spiral arteries.
- The barrier at term (vasculosyncytial membranes) is about 2–5 µm thick; a hair is about 50–100 µm, so «أرفع من الشعرة
  بعشرين مرة» is a fair round figure.
- Villous surface area at term: about 11–14 m² (12 m² used, «قد أوضة»).
- The umbilical cord has one vein (oxygenated blood to the fetus) and two arteries (deoxygenated blood back to the placenta).
- Fetal haemoglobin (HbF) binds oxygen more tightly than adult haemoglobin (P50 about 19 vs 27 mmHg).
- Fetal breathing movements start around week 10–11 and move small amounts of amniotic fluid; they train the diaphragm
  and help the lungs grow, and bring no oxygen.
- "Mount Everest in utero" (Eastman, 1954): fetal blood oxygen tension (umbilical vein PO2 about 30 mmHg) is close to the
  arterial PO2 of climbers near the summit of Everest.

## Narration and timing

- Voice: Gemini TTS, Puck, `gemini-3.8-flash-tts`, temperature 1.
- Line timing: `videos/align_gemini.py` (each pause-split chunk transcribed by Gemini, then the same trigram DP as
  `align_asr.py`), because the whisper-small model couldn't be downloaded in this session.

## Sounds

All from the shared «اسكتش» kit (`videos/_templates/sketch/sfx/SOURCES.md`): swipe, paper, pencil-scribble, ding,
clock-ticking, water-rush, wind-gust and the series music. The heartbeat, drips, drops and pops are synthesized by `audio/sfx.py`.
