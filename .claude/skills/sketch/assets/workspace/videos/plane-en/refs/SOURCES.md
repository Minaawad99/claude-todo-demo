# «الطيارة بتطير إزاي؟» / How Planes Fly: sources (quick mode)

## Facts (checked)
- Version 2 (the user's request) is built on the four forces: weight (gravity on the plane, passengers, bags and fuel,
  which pilots calculate before each flight), thrust (a turbofan accelerates a large mass of air backwards, Newton's
  third law, like a released balloon), drag (air friction and pressure; it grows with speed, so bodies are smooth and
  streamlined) and lift (from the wing). In steady level cruise the four are in balance. Engines give speed, not lift.
- With both engines out at cruise height, an airliner glides at a ratio of about 15–18:1. From about 11 km that is well
  over 100 km (more than 60 miles).
- Lift comes from the wing turning the airflow downward (Newton's third law). The same flow has lower pressure over the
  top and higher pressure below (Bernoulli). These are two descriptions of one flow, not two separate causes.
- "Equal transit time" is a myth: air over the top reaches the trailing edge before the air underneath.
- A narrow-body airliner (A320 / 737 class) weighs more than 70 t at takeoff and rotates at about 140–165 kt, roughly
  260–300 km/h (160–190 mph). The script says about 300 km/h in Arabic and about 180 mph in English.
- Flaps extend from the trailing edge for takeoff and landing. They add area and camber, so the wing gives enough lift at
  low speed.
- Aerobatic planes fly inverted by holding a nose-up angle of attack relative to the airflow.

## Drawings
- The four forces are colour-coded arrows: lift olive, weight dark, thrust orange, drag blue. The turbofan is cut along
  its axis: fan, compressor stages, combustor, turbine and nozzle.
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
