# References

Photos looked at on Wikimedia Commons (visual reference only, nothing reused):
- `308_cu_in_Holden_V8_engine_(2015-08-29)_02.jpg`: V8 seen from the front: ribbed valve covers on both banks, intake
  manifold in the valley, red plug leads, pulleys and belt at the front → `v8()`.
- `Cutaway_of_a_MAN_V8_Diesel_engine.jpg`: cut-away block: bores, piston crown with rings, the head above → the cut window
  in `engineRow()` and `v8()`.
- `Cutaway_of_motorcycle_inline-four_engine1.jpg`: inline-four cut away (block, head, cam cover) → `engineRow()`.
- `Piston_and_connecting_rod.jpg`: piston with three ring grooves and the pin boss, I-beam rod, big end with bolted cap
  → the piston, rod and crank in `cylinder()`.
Commons rate-limited the searches for the Golf, the Porsche 911 and a turbo cutaway (HTTP 429); those three are drawn from
their well-known shapes: Golf-like hatchback, 911-like fastback coupé, a turbocharger with cast-iron turbine snail,
aluminium compressor snail, centre housing with oil lines and the wastegate actuator. The horse is drawn with real
proportions (deep chest, arched neck, thin legs with knees and hocks, dark hooves) and trots with diagonal leg pairs.
The isometric version reuses `../car-us/iso.js` (car and cylinder) and adds simple 3D models for the row engine, V8, turbo and lift.

Facts checked:
- 1 PS = 75 kp·m/s = 735.5 W (lifting 75 kg by 1 m in 1 s).
- A horse can briefly produce about 15 hp (Stevenson & Wassersug, Nature 1993: 14.9 hp peak).
- VW Golf 1.5 eTSI: 150 PS, 1498 cm³, four cylinders (≈ 375 cm³ each), 0–100 km/h ≈ 8.5 s.
- A 4.0-litre V8 has ≈ 500 cm³ per cylinder; 400 PS class sports cars reach 100 km/h in about 4 s.
- Four-stroke: each cylinder fires once every two turns, so an inline-4 fires 2× per turn and a V8 4× per turn;
  at 6000 rpm (100 turns/s) that is 200 and 400 ignitions per second.
- Turbocharger shafts reach roughly 150,000–250,000 rpm ("bis zu 200.000").
- Audi RS 3 (8Y): 2.5-litre five-cylinder with one turbocharger, 400 PS.
- Power = torque × engine speed (P = 2π · M · n).
