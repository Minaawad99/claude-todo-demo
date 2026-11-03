# Sources — «إزاي الإنترنت بيشتغل؟» (دايجرام)

- **Style:** the user's reference video «طب إزاي؟ – إزاي الإنترنت بيشتغل؟» (frames in `.claude/skills/diagram/reference/`).
  Only the look (palette, card, isometric cut-aways, section views, leader-line labels) is copied; script and drawings are ours.
- **Maps:** Natural Earth land (1:110m for the globe, 1:50m for the Mediterranean) via the `world-atlas@2.0.2` npm package,
  projected with `d3-geo@3.1.0` by `geo-make.mjs` into `diagram/geo.js`. Public domain.
- **Cable routes:** traced to follow SEA-ME-WE 4 (Alexandria → Palermo → Marseille), plus Port Said → Catania, the Red Sea
  route from Suez and Marseille → Gibraltar, as shown on public submarine cable maps. Approximate, for illustration.
- **Objects** drawn from known real shapes (no photo downloaded; quick mode): home router with 4 antennas and an LED row,
  19-inch rack servers, deep-sea cable layers (polyethylene sheath, copper, steel wires, fibre tube), garden hose,
  communications satellite (body, two solar wings, dish), phone.
- **Facts used:** >99% of intercontinental data runs on submarine cables; deep-sea cable ≈ 17 mm across; light in glass
  fibre ≈ 2/3 c ≈ 200,000 km/s; SEA-ME-WE 4 lands in Alexandria and Marseille; a 2 MB photo ≈ 1,400 packets of 1,500 bytes.
- **IP addresses** on screen are from the documentation ranges (192.0.2.0/24, 198.51.100.0/24), not real devices.
- **Sounds:** all synthesized by `audio/sfx.py`.
