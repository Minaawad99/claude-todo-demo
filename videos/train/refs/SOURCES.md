# Train episode: visual references and facts

- **Locomotive:** ENR GE ES30ACi diesel-electric (Wikimedia Commons, "Egyptian Railways (ENR) GE ES30ACi.jpg", looked at
  only). Drawn in side view: cab at the front, long hood with access doors, raised radiator block at the back, exhaust stack
  on the roof, fuel tank between two three-axle (C-C) bogies, couplers at both ends. Cut-away: diesel engine with its row of
  cylinder heads, shaft to the main alternator, electrical cabinet; a traction motor on each of the six axles.
- **Coach / freight wagon:** a passenger coach on two-axle bogies, end doors, row of windows; a boxcar for the freight train.
- **Coupler:** Janney (AAR) knuckle coupler seen from above, two knuckles locked with a few centimetres of free play (slack).
- **Brake gear:** automatic air brake (Westinghouse): brake pipe along the train with hoses between cars, a control (triple)
  valve, an auxiliary reservoir and a brake cylinder per car pushing a brake shoe onto the wheel tread.
- Style after the «طب إزاي؟» reference sheets (`videos/_reference/tabizzay/sheets/v18.jpg`, v08): flat fills, side views,
  cut-aways, leader-line labels. No drawing copied.

## Facts checked
- Most ENR mainline locomotives are diesel-electric: the diesel turns an alternator; electric traction motors (one per
  axle) turn the wheels. An electric motor gives its highest tractive effort at standstill, a diesel cannot start under load.
- Six-axle diesel-electrics like the ES30ACi weigh well over 100 tonnes (adhesion comes from weight × steel-on-steel friction).
- Locomotives carry sandboxes and drop sand in front of the wheels on wet or slippery rail.
- Rolling resistance of steel wheel on rail (~0.001–0.002) is several times lower than a car tyre on asphalt (~0.01).
- Coupler slack lets the locomotive start the cars one at a time.
- Automatic air brake: full brake-pipe pressure keeps brakes released; a drop in pressure makes every car's valve feed its
  own reservoir air into the brake cylinder. If the train parts, the hose tears, pressure drops, all cars brake (fail-safe).
- Dynamic braking: traction motors act as generators, the power is burnt as heat in roof resistor grids.
- A freight train at about 80–90 km/h can need around 1.5 km or more to stop (commonly cited: about a mile at 55 mph).

## Sounds
- Kit clips from `videos/_templates/sketch/sfx/` (see videos/tides/refs/SOURCES.md for credits) and the series music.
- Train-specific sounds (rails, diesel rumble, air-brake hiss) are synthesized stand-ins from audio/sfx.py until
  recorded clips are added in `train/sfx/` as px-train-pass, px-diesel-idle, px-air-brake.
