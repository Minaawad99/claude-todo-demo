# Sources

## Facts (checked)
- Three Gorges Dam: crest length 2,335 m, height 181 m, crest width 40 m, base width 115 m; world's largest power
  station by installed capacity (22.5 GW). Reservoir total storage ≈ 39.3 billion m³ (Wikipedia, "Three Gorges Dam").
- NASA, Benjamin Fong Chao (Goddard), 2005: filling the reservoir lengthens the day by about 0.06 microseconds
  (6 × 10⁻⁸ s, «ستة على مية مليون من الثانية») and shifts the pole by about 2 cm.
- Water pressure rises by about 1 atmosphere (≈101 kPa) every 10 m of depth.
- A spinning skater who opens their arms spins slower (conservation of angular momentum): the same physics.

## Textures
- `tex/earth-day.jpg`, `tex/earth-night.jpg`, `tex/earth-water.jpg`, `tex/clouds.jpg`: NASA Blue Marble / Black Marble
  imagery (public domain), taken from the `three-globe` npm package (MIT) example folder and resized.

## Style reference
- Civolve (@civolve.sa) short about the same dam: structure, widget ideas (counter pill, spin gauge, day clock,
  number reveal, NASA stamp, pyramid comparison). Looked at only; nothing reused.

`tex.js` is rebuilt from `tex/` with: `python3 -c "import base64; ..."` (see git history), keys day / water / clouds.
