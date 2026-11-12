# «إزاي العضمة المكسورة بتلحم نفسها؟»: sources

## Illustrations
Made by the channel in Google AI Studio (Nano Banana Pro) from the isometric cutaway prompts written for this episode
(style block in `.claude/skills/sketch/prompts.md`): `sketch/img/src/01–12.jpg`, keyed by `_templates/sketch/img_prep.py`.
01 welder, 02 leg with broken tibia, 03 living bone in section, 04 fracture with clot, 05 macrophages clearing debris,
06 soft callus, 07 concrete pour, 08 hard callus, 09 osteoclast and osteoblasts, 10 forearm in a cast, 11 bone before/after
remodelling, 12 skeleton. Every picture is animated by cutting parts out and moving them (`live()` in `sketch/shots.js`),
with light added by `glow()` and `sparks()` from the template.

## Narration
Generated with Gemini TTS (Puck) in five chunks, level-matched to −19.5 LUFS. The last chunk (lines 20–26) is a
provisional take until the user sends the AI Studio parts 6a / 6b.

## Sounds
All synthesized by `audio/sfx.py` (no recorded clips).

## Facts checked
- Fracture healing runs in overlapping stages: haematoma and inflammation (days), soft callus of cartilage (about 2–3
  weeks), hard callus as osteoblasts mineralise it (weeks), remodelling by osteoclasts and osteoblasts (months to years).
- Most simple fractures in adults knit in about 6–8 weeks; many are treated without surgery or metal fixation.
- Healed bone regains its strength; remodelling can straighten a malunion, much more in children.
- A cast only immobilises the fracture so the callus can form.
- The adult skeleton turns over about 10% a year, so roughly the whole skeleton is replaced about every 10 years.
