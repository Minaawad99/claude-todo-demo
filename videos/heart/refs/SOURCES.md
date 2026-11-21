# Sources — «ليه قلب الست بيدق أسرع؟» (videos/heart) and its English version (videos/heart-us)

Idea and hook: the short the user sent ("Why does a woman's heart beat faster than a man's? It isn't stress…"). The first
three lines keep that hook; the rest of the script, the drawings and the sound are our own.

## Facts (checked)
- Resting heart rate: women on average a few beats a minute faster than men (commonly given as about 3–7 bpm; large
  wearable cohorts and clinical references such as Cleveland Clinic / Harvard Health agree on the direction and size).
- Heart mass: about the same in girls and boys before puberty; the sex difference in left-ventricular mass appears at
  puberty; adult male hearts are roughly 25% heavier (about 300–350 g vs 250–300 g).
- Stroke volume is smaller in women, so heart rate rises to keep cardiac output (about 5 L/min at rest).
- Intrinsic heart rate (sinus node with the autonomic nerves blocked) is higher in women: Burke et al., J Cardiovasc
  Electrophysiol 1996.
- Menstrual cycle: resting / sleeping heart rate rises in the luteal phase (after ovulation) by about 2–4 bpm over the
  early follicular phase; progesterone raises body temperature by about 0.3–0.5 °C (wearable studies, e.g. Apple Women's
  Health Study, Oura / Ava cohorts).
- Ejection fraction is slightly higher in women (by a few percentage points).
- Normal adult resting heart rate: 60–100 bpm (AHA).
- 5 extra beats a minute × 1,440 minutes = 7,200 a day; × 365 ≈ 2.6 million a year.

## Drawing references
- The heart from the front: Gray's Anatomy plate «Sternocostal surface of the heart» and the Wikimedia Commons diagram
  «Heart anterior exterior view»: apex to the body's left, aortic arch with brachiocephalic, left common carotid and left
  subclavian branches, pulmonary trunk in front, superior vena cava on the right atrium, coronary arteries in the grooves.
- The four-chamber cut: Wikimedia Commons «Diagram of the human heart (cropped)».
- People: the shared person kit (videos/_templates/people/person.js), with its new "woman" outfit (long hair, front and side).

## Sound
Narrator (Gemini TTS, Puck) and sound effects only, no music: the «اسكتش» kit clips (videos/_templates/sketch/sfx) and
synthesized effects from videos/audio/sfx.py, including the new `heart` (lub-dub) effect.
