# Sources — «ليه رجلك بتنمّل على التواليت؟»

## The idea and the hook
- The idea comes from a short the user sent (an English explainer, "Why does sitting too long on the toilet give you pins
  and needles?"). We kept the idea and the hook only. The script, the drawings and the style are ours («اسكتش»).

## Anatomy (what the drawings follow)
- Gray's Anatomy (1918), fig. 832, "Nerves of the right lower extremity, posterior view" — Wikimedia Commons, public domain:
  https://commons.wikimedia.org/wiki/File:Gray832.png . The sciatic nerve leaves the pelvis below the piriformis, between
  the sit bone (ischial tuberosity) and the greater trochanter, runs down the back of the thigh under the hamstrings, and
  splits above the knee into the tibial nerve (back of the calf → sole) and the common peroneal nerve (round the fibula →
  front of the shin, top of the foot). Drawn in `legCut()` and `nervePath()`.
- Peripheral nerve structure (fascicles inside the epineurium, the vasa nervorum feeding the nerve): standard histology,
  e.g. StatPearls "Neuroanatomy, Peripheral Nerve". Drawn in `nerveBand()`.
- The femoral artery runs down the front / inner thigh (femoral triangle, adductor canal) and only reaches the back of the
  knee as the popliteal artery, so a seat does not press it. Drawn as `ART` in `legCut()`.

## Facts in the script
- The sciatic nerve is the largest / thickest nerve in the body, up to about 2 cm wide where it begins (StatPearls,
  "Anatomy, Bony Pelvis and Lower Limb, Sciatic Nerve").
- Pins and needles after pressure: compression and ischaemia of the nerve (its own blood supply) stop conduction; when the
  pressure goes and blood returns, the nerve fires ectopic bursts (post-ischaemic paraesthesia).
- "Toilet seat neuropathy / palsy": published case reports of sciatic nerve injury with foot drop after prolonged sitting on
  a toilet, usually after losing consciousness (e.g. intoxication), recovering over months.

## Sounds
- The shared «اسكتش» kit (`videos/_templates/sketch/sfx/SOURCES.md`) and synthesized effects from `videos/audio/sfx.py`.
  No music.
