# «ليه بتهز رجلك وإنت قاعد؟» — sources

## Facts
| claim | source |
|---|---|
| 3 h of sitting, one leg fidgeting (1 min on / 4 min off); popliteal FMD of the still leg 4.5% → 1.6% (≈ two-thirds lost), fidgeting leg 3.7% → 6.6% | Morishima T. et al., «Prolonged sitting-induced leg endothelial dysfunction is prevented by fidgeting», Am J Physiol Heart Circ Physiol 2016; 311(1): H177–H182. https://pmc.ncbi.nlm.nih.gov/articles/PMC4967200 · press: https://sciencedaily.com/releases/2016/08/160804141254.htm |
| The ankle swelling in the source video is **not** in the study (it measured the artery only), so it was left out | same paper |
| Calf muscle pump, one-way venous valves, «the second heart»; low venous pressure after the capillaries | standard physiology (calf muscle pump; venous return) |
| Soldiers fainting on parade: venous pooling in still legs reduces blood to the brain | standard physiology (orthostatic / vasovagal syncope) |

## Drawings
- Seated leg kinematics: Drillis & Contini segment lengths (the `HB` table from `videos/choking/sketch/shots.js`); the bounce is
  ankle plantar-flexion about the ball of the foot (toes stay down, heel lifts up to 22°), the hip stays on the chair and the
  knee is solved by two-bone IK.
- Leg cut: side view of the knee and shank — femur, patella, tibia in front (subcutaneous shin), fibula behind it,
  gastrocnemius over soleus at the back into the Achilles tendon, popliteal artery and vein behind the knee continuing as the
  posterior tibial vessels; vein valves as paired cusps. Colours of artery/vein follow reference v17.
- Style reference: «طب إزاي؟» v17 sheet (`videos/_reference/tabizzay/sheets/v17.jpg`).
- Source video analysed (not copied): the user's upload, a 50 s English explainer on leg bouncing.

## Sound
- Kit clips: swipe, paper, pencil-scribble, ding, clock-ticking, water-rush (see `videos/_templates/sketch/cues.js`).
- `sfx/px-heartbeat.mp3`: «Heartbeat Sound» (Dragon Studio 372448, Pixabay), from `videos/choking/sfx/`.
- Synthesized in `audio/sfx.py`: bump (heel taps, 2.3 per second), pop, tick, whoosh, squeeze, slosh, thud, chime.
- No music.
