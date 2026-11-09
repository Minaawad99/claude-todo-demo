# «الطيارة بتطير إزاي؟» / How Planes Fly: sources (quick mode)

## Facts (checked)
- Lift comes from the wing turning the airflow downward (Newton's third law). The same flow has lower pressure over the
  top and higher pressure below (Bernoulli). These are two descriptions of one flow, not two separate causes.
- "Equal transit time" is a myth: air over the top reaches the trailing edge before the air underneath.
- A narrow-body airliner (A320 / 737 class) weighs more than 70 t at takeoff and rotates at about 140–165 kt, roughly
  260–300 km/h (160–190 mph). The script says about 300 km/h in Arabic and about 180 mph in English.
- Flaps extend from the trailing edge for takeoff and landing. They add area and camber, so the wing gives enough lift at
  low speed.
- Aerobatic planes fly inverted by holding a nose-up angle of attack relative to the airflow.

## Drawings
- The wing section is the NACA 4412 aerofoil (4% camber at 40% chord, 12% thick), computed from the published NACA
  4-digit equations in `shots.js`.
- The airliner is the generic twin-engine narrow-body layout drawn from the side: underwing engines, a low wing and a
  conventional tail.
- The look follows the «اسكتش» hand. Reference v03 («الطيارة») was used for the style only; nothing was copied from it.

## Editions
- `plane-ar`: Egyptian Arabic, «إيه الحكاية؟».
- `plane-en`: American English, «Here's the Thing». It uses the same `shots.js`, with English labels (`make.sh`), and
  `"lang": "en"` in the template.

## Sound
- From the «اسكتش» kit: swipe, paper, pencil-scribble, ding, wind-gust, and music-soft. The rest is synthesized by
  `audio/sfx.py`.
