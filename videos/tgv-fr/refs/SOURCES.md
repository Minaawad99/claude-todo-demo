# Sources — «Comment le TGV roule à 320 km/h ?» (French, دايجرام)

Style: `.claude/skills/diagram` (after `videos/internet-diagram/`), in French (left-to-right page, Noto Sans,
brand «Comment ça marche ?»). Voice: Gemini TTS (gemini-3.8-flash-tts, Puck), spoken French with «tu».

Drawings follow the real shapes of a TGV Duplex (long nose, pantograph on the power-car roof, two bogies under each
power car, double-deck coaches sharing articulated Jacobs bogies), a 25 kV catenary on masts, ballasted track. Map:
France from Natural Earth 1:50m (world-atlas countries-50m) projected by `refs/geo-make.mjs`; the route follows the
LGV Sud-Est and LGV Méditerranée (Paris – Le Creusot – Mâcon – Lyon – Valence – Avignon – Marseille).

Facts (known references, quick mode, not re-checked online):
- Paris Gare de Lyon → Marseille Saint-Charles ≈ 750 km by rail, a little over 3 h (SNCF timetables); commercial top
  speed 300–320 km/h.
- High-speed lines are electrified at 25 kV 50 Hz AC; the pantograph collects the current from the contact wire.
- TGV power cars are at both ends of the trainset; a TGV Duplex is about 9 MW (≈ 100 cars of ~90 kW).
- Aerodynamic drag grows with the square of speed and dominates at 300 km/h.
- LGV curve radii are typically 4,000 m and more; rails are continuously welded (no joints, no clack-clack).
- TGV coaches share articulated (Jacobs) bogies.
- On LGVs there are no lineside signals for the driver: TVM cab signalling sends the speed codes through the rails.
- Braking from 300 km/h takes over 3 km.
- World speed record for a conventional wheeled train: 574.8 km/h, V150, 3 April 2007, LGV Est.
