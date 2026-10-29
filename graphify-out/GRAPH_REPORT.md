# Graph Report - videos  (2026-10-29)

## Corpus Check
- Large corpus: 435 files · ~821,079 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 3113 nodes · 5877 edges · 164 communities (123 shown, 41 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 493 edges (avg confidence: 0.87)
- Token cost: 1,152,076 input · 0 output

## Community Hubs (Navigation)
- tbm-tunnel: scenes
- phone-call: world
- sonic-boom: scenes
- audio: sfx
- offshore-oil: scenes
- sea-cables: scenes
- elevator-waqei: index
- high-dam: scenes
- lcd-tv: scenes
- bridge-water: scenes
- microwave: scenes
- qolla: scenes
- touchscreen: scenes
- gps-traffic: scenes
- robot-vacuum: world
- tbm-tunnel: shots
- concepts: misc
- car-egypt: scenes
- atm: scenes
- phone-call: scenes
- elevator: scenes
- submarine: scenes
- high-dam-photo: render
- offshore-oil: world
- offshore-oil: shots
- gps-traffic: world
- lcd-tv: world
- helicopter: scenes
- submarine: world
- inverter-ac: world
- atm: _helpers
- bridge-water: _helpers
- car-egypt: _helpers
- elevator: _helpers
- gps-traffic: _helpers
- high-dam: _helpers
- lcd-tv: _helpers
- microwave: _helpers
- offshore-oil: _helpers
- phone-call: _helpers
- qolla: _helpers
- sea-cables: _helpers
- sonic-boom: _helpers
- submarine: _helpers
- tbm-tunnel: _helpers
- touchscreen: _helpers
- water-pump: pump
- airplane-us: world
- elevator: world
- high-dam-iso: bundle
- atm: world
- qa.py: qa
- microwave: world
- offshore-oil: script & ideas
- inverter-ac: template
- high-dam: shots
- elevator-waqei: world
- fridge-3d: world
- lcd-tv: shots
- washer: scene
- bridge-water: shots
- microwave: shots
- qolla: shots
- printer: script & ideas
- touchscreen: shots
- car-us: iso-scene
- gps-traffic: shots
- offshore-oil: panels
- airplane-v2: script & ideas
- bridge-water: script & ideas
- car-egypt: shots
- lcd-tv: build
- microwave: panels
- submarine: script & ideas
- tbm-tunnel: script & ideas
- PLAYBOOK.md: script & ideas
- atm: script & ideas
- atm: shots
- lcd-tv: index
- high-dam-page: high-dam-power
- car-us: build
- dishwasher: iso
- submarine: index
- touchscreen: script & ideas
- phone-call: script & ideas
- atm: panels
- elevator: shots
- fridge: iso-scene
- fridge: template
- gps-traffic: panels
- submarine: shots
- submarine: panels
- high-dam: script & ideas
- elevator: panels
- high-dam-iso: episode
- lcd-tv: panels
- microwave: script & ideas
- sonic-boom: script & ideas
- washer: index
- washer: script & ideas
- helicopter: storyboard
- gps-traffic: script & ideas
- helicopter: script & ideas
- airplane-us: index
- car-us: iso
- high-dam: cues
- lcd-tv: script & ideas
- sonic-boom: cues
- touchscreen: cues
- bridge-water: cues
- car-egypt: cues
- qolla: cues
- sea-cables: cues
- dishwasher: iso-scene
- microwave: cues
- airplane: index
- atm: build
- elevator: build
- gps-traffic: build
- inverter-ac: build
- offshore-oil: build
- robot-vacuum: build
- submarine: build
- atm: cues
- elevator: cues
- gps-traffic: cues
- helicopter: cues
- inverter-ac: script & ideas
- lcd-tv: cues
- offshore-oil: cues
- phone-call: cues
- robot-vacuum: cues
- submarine: cues
- tbm-tunnel: cues
- high-dam-photo: scenes

## God Nodes (most connected - your core abstractions)
1. `f()` - 53 edges
2. `t_()` - 47 edges
3. `f()` - 47 edges
4. `noise()` - 37 edges
5. `f()` - 36 edges
6. `f()` - 36 edges
7. `f()` - 36 edges
8. `f()` - 36 edges
9. `f()` - 35 edges
10. `f()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Shock Wave Cone (Mach Cone)` --semantically_similar_to--> `Pressure +1 atm per 10 m`  [AMBIGUOUS] [semantically similar]
  sonic-boom/script.txt → submarine/script.txt
- `Compressed Air Cylinders` --semantically_similar_to--> `Man-lock (Airlock)`  [AMBIGUOUS] [semantically similar]
  submarine/script.txt → tbm-tunnel/refs/SOURCES.md
- `Cartoon renderAt with long-line font shrink` --semantically_similar_to--> `Cartoon renderAt (__panel + CAPS word reveal by length)`  [INFERRED] [semantically similar]
  bridge-water/cartoon/index.html → atm/cartoon/index.html
- `Car US English Script` --semantically_similar_to--> `Crankshaft as bike pedal analogy`  [INFERRED] [semantically similar]
  car-us/script.txt → car-egypt/script.txt
- `Here's the Deal brand mark` --semantically_similar_to--> `«إيه الحكاية؟» series brand`  [INFERRED] [semantically similar]
  car-us/index.html → dishwasher/index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **How does a plane fly? video versions (v1, v2, US)** — airplane_index, airplane_v2_index, airplane_us_index, airplane_v2_script_four_forces [INFERRED 0.95]
- **Cartoon-panel videos sharing one page layout and renderAt** — atm_cartoon_index, bridge_water_cartoon_index, car_egypt_cartoon_index, atm_cartoon_index_cartoon_panel_layout [INFERRED 0.95]
- **Templates with caption placeholders that generate index.html pages** — airplane_us_template, atm_cartoon_template, atm_iso_template, bridge_water_cartoon_template [INFERRED 0.85]
- **Episode page pipeline: script + timing + template -> renderAt frame renderer** — car_us_template, car_us_index, car_us_script, videos_engine_renderat_wrapper, design_system_tebezay_patterns [INFERRED 0.85]
- **Cartoon-panel style pages (black frame, 16:9 panel, word-reveal captions)** — car_egypt_cartoon_template, elevator_cartoon_template, elevator_cartoon_index, car_egypt_cartoon_template_renderat [INFERRED 0.95]
- **three.js world with HTML labels pinned to 3D points** — elevator_waqei_index, fridge_3d_index, videos_world_project_3d_anchor, fridge_3d_index_labels, elevator_waqei_index_overlays [INFERRED 0.85]
- **Cartoon-panel video pages (black frame, 16:9 panel, CAPS captions)** — gps_traffic_cartoon_index, helicopter_index, high_dam_cartoon_index, helicopter_style_test, helicopter_storyboard_cartoon_panel_style [INFERRED 0.85]
- **Iso paper-cutaway explainer videos built on design-system bundle + engine.js** — fridge_template, gps_traffic_iso_template, inverter_ac_index, high_dam_iso_episode [INFERRED 0.85]
- **High Dam electricity journey told in five formats** — high_dam_script, high_dam_iso_episode, high_dam_page_high_dam_power, high_dam_page_video_template, high_dam_photo_film, high_dam_cartoon_index [INFERRED 0.85]
- **Offshore oil: find, drill, produce, ship** — offshore_oil_script_seismic_survey, offshore_oil_script_drillship, offshore_oil_script_drill_bit, offshore_oil_script_drilling_mud, offshore_oil_script_blowout_preventer, offshore_oil_script_fpso, offshore_oil_script_tankers_refinery [EXTRACTED 1.00]
- **LCD light path through the panel layers** — lcd_tv_script_led_backlight, lcd_tv_script_polarizer, lcd_tv_script_liquid_crystal, lcd_tv_script_color_filter, lcd_tv_script_thin_film_transistor [EXTRACTED 1.00]
- **Voice journey: air, electricity, numbers, light, air** — phone_call_iso_index_microphone, phone_call_iso_index_digitization, phone_call_iso_index_antenna_radio_waves, phone_call_iso_index_cell_tower, phone_call_iso_index_fiber_optic, phone_call_iso_index_speaker [EXTRACTED 1.00]
- **Cartoon-panel templates sharing identical renderAt/CAPS shell** — qolla_cartoon_template, sea_cables_cartoon_template, sonic_boom_cartoon_template, qolla_cartoon_template_renderat [INFERRED 0.95]
- **Isometric paper-style videos (world.js + panels.js + __extra over engine renderAt)** — phone_call_iso_template, robot_vacuum_template, robot_vacuum_index, phone_call_storyboard_version_a_isometric [INFERRED 0.85]
- **Laser printing pipeline: charge, laser write, toner, transfer, fuse** — printer_script_photoconductive_drum, printer_script_laser_rotating_mirror, printer_script_toner_transfer, printer_script_fuser, printer_index_section [EXTRACTED 1.00]
- **TBM Excavate-Push-Line Cycle** — tbm_tunnel_script_cutterhead, tbm_tunnel_script_slurry_chamber, tbm_tunnel_script_thrust_cylinders, tbm_tunnel_script_segment_erector, tbm_tunnel_script_lining_rings, tbm_tunnel_script_annular_grout [EXTRACTED 1.00]
- **Submarine Dive and Surface Mechanism** — submarine_script_buoyancy, submarine_script_ballast_tanks, submarine_script_vents_flood_holes, submarine_script_compressed_air_cylinders, submarine_script_trim_tanks [EXTRACTED 1.00]
- **Cartoon-Panel Caption Renderers** — submarine_cartoon_index_renderat, tbm_tunnel_cartoon_index_renderat, touchscreen_cartoon_index_renderat, submarine_cartoon_index_cartoon_panel_layout [INFERRED 0.95]

## Communities (164 total, 41 thin omitted)

### Community 0 - "tbm-tunnel: scenes"
Cohesion: 0.06
Nodes (66): airflow(), airfoil(), arrow(), birds(), block3d(), bop(), bubbles(), canal() (+58 more)

### Community 1 - "phone-call: world"
Cohesion: 0.06
Nodes (58): «إيه الحكاية؟» brand (explainer series), bits(), clamp(), f(), frame(), lerp(), push(), wave() (+50 more)

### Community 2 - "sonic-boom: scenes"
Cohesion: 0.06
Nodes (61): qolla cartoon index.html (template + inlined CAPS), window.CAPS (qolla caption words + keyword flags), qolla cartoon template.html (cartoon-panel shell), renderAt (panel draw + word-by-word caption reveal), qolla refs SOURCES.md, Latent heat of vaporisation ~2,400 J/g, Pixabay sound effects (sfx/px-*.mp3, not committed), Pot-in-pot cooler (zeer) by Mohammed Bah Abba (+53 more)

### Community 3 - "audio: sfx"
Cohesion: 0.11
Nodes (62): bed(), bubble(), bubbles(), clip(), env(), fx_beep(), fx_boom(), fx_bump() (+54 more)

### Community 4 - "offshore-oil: scenes"
Cohesion: 0.07
Nodes (57): airflow(), airfoil(), arrow(), birds(), block3d(), bop(), bubbles(), cars() (+49 more)

### Community 5 - "sea-cables: scenes"
Cohesion: 0.07
Nodes (53): sea-cables cartoon index.html (template + inlined CAPS), window.CAPS (sea-cables captions), airflow(), airfoil(), arrow(), birds(), cable(), cablePts() (+45 more)

### Community 6 - "elevator-waqei: index"
Cohesion: 0.05
Nodes (47): Car Egypt Cartoon Panel Template, CAPS placeholder injection, renderAt (cartoon panel caption reveal), Car Egypt Reference Sources, 1886 Benz Patent-Motorwagen reference, Bertha Benz 1888 Mannheim-Pforzheim trip, Hall-Scott A-7-A inline-4 cutaway (Wikimedia), Pixabay sound effects (sfx/px-*.mp3) (+39 more)

### Community 7 - "high-dam: scenes"
Cohesion: 0.09
Nodes (44): airflow(), airfoil(), arrow(), birds(), bolt(), cars(), city(), clamp() (+36 more)

### Community 8 - "lcd-tv: scenes"
Cohesion: 0.09
Nodes (44): airflow(), airfoil(), arrow(), backlight(), battery(), birds(), bolt(), cars() (+36 more)

### Community 9 - "bridge-water: scenes"
Cohesion: 0.10
Nodes (45): airflow(), airfoil(), arrow(), barge(), birds(), bubbles(), cairo(), cars() (+37 more)

### Community 10 - "microwave: scenes"
Cohesion: 0.09
Nodes (42): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+34 more)

### Community 11 - "qolla: scenes"
Cohesion: 0.09
Nodes (43): airflow(), airfoil(), arrow(), birds(), breeze(), cars(), city(), clamp() (+35 more)

### Community 12 - "touchscreen: scenes"
Cohesion: 0.09
Nodes (42): airflow(), airfoil(), arrow(), birds(), cars(), chip(), city(), clamp() (+34 more)

### Community 13 - "gps-traffic: scenes"
Cohesion: 0.10
Nodes (41): airflow(), airfoil(), arrow(), birds(), cars(), carSide(), city(), clamp() (+33 more)

### Community 14 - "robot-vacuum: world"
Cohesion: 0.10
Nodes (37): clamp(), g(), push(), win(), battery(), bumpAmt(), camAt(), cast() (+29 more)

### Community 15 - "tbm-tunnel: shots"
Cohesion: 0.06
Nodes (21): block3d(), canal(), carSide(), cone(), derrick(), drillship(), engineer(), ground() (+13 more)

### Community 17 - "car-egypt: scenes"
Cohesion: 0.10
Nodes (39): airflow(), airfoil(), arrow(), bertha(), birds(), boom(), boy(), car() (+31 more)

### Community 18 - "atm: scenes"
Cohesion: 0.10
Nodes (35): airflow(), airfoil(), arrow(), atmCut(), atmFront(), birds(), card(), cars() (+27 more)

### Community 19 - "phone-call: scenes"
Cohesion: 0.11
Nodes (35): airDots(), airflow(), airfoil(), arrow(), birds(), bits(), cars(), city() (+27 more)

### Community 20 - "elevator: scenes"
Cohesion: 0.11
Nodes (35): airflow(), airfoil(), arrow(), birds(), car(), cars(), city(), clamp() (+27 more)

### Community 21 - "submarine: scenes"
Cohesion: 0.11
Nodes (35): airflow(), airfoil(), arrow(), birds(), bubbles(), captain(), cars(), city() (+27 more)

### Community 22 - "high-dam-photo: render"
Cohesion: 0.06
Nodes (27): { chromium }, fs, path, { chromium }, fs, path, src, { chromium } (+19 more)

### Community 23 - "offshore-oil: world"
Cohesion: 0.13
Nodes (34): arrow3(), bopStack(), bz(), camAt(), clamp(), derrick(), c(), domeAt() (+26 more)

### Community 24 - "offshore-oil: shots"
Cohesion: 0.06
Nodes (13): block3d(), cone(), derrick(), drillship(), pdc(), sea(), semisub(), strata() (+5 more)

### Community 25 - "gps-traffic: world"
Cohesion: 0.13
Nodes (31): building(), camAt(), car(), cars(), clamp(), cloudIcon(), drawWorld(), easeIO() (+23 more)

### Community 26 - "lcd-tv: world"
Cohesion: 0.13
Nodes (30): camAt(), clamp(), drawFront(), drawLayer(), drawPhotons(), drawWorld(), easeIO(), f1() (+22 more)

### Community 27 - "helicopter: scenes"
Cohesion: 0.13
Nodes (26): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+18 more)

### Community 28 - "submarine: world"
Cohesion: 0.14
Nodes (28): arrow3(), bubblesUp(), camAt(), clamp(), drawSea(), drawSub(), PW(), W() (+20 more)

### Community 29 - "inverter-ac: world"
Cohesion: 0.13
Nodes (25): g(), camAt(), clamp(), drawScene(), easeIO(), flicker(), L(), lerp() (+17 more)

### Community 30 - "atm: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 31 - "bridge-water: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 32 - "car-egypt: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 33 - "elevator: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 34 - "gps-traffic: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 35 - "high-dam: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 36 - "lcd-tv: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 37 - "microwave: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 38 - "offshore-oil: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 39 - "phone-call: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 40 - "qolla: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 41 - "sea-cables: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 42 - "sonic-boom: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 43 - "submarine: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 44 - "tbm-tunnel: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 45 - "touchscreen: _helpers"
Cohesion: 0.14
Nodes (24): airflow(), airfoil(), arrow(), birds(), cars(), city(), clamp(), clouds() (+16 more)

### Community 46 - "water-pump: pump"
Cohesion: 0.12
Nodes (28): Water Pump 3D Three.js Scene, acc() precomputed rotor/flow integrator, BEATS narration timeline, box(), cameraAt(), Check Valve Flap Mesh, composite(), Pump Casing Cutaway Plane (+20 more)

### Community 47 - "airplane-us: world"
Cohesion: 0.11
Nodes (17): airfoil(), arrow(), bladeRing(), clamp(), easeIO(), L(), lerp(), loft() (+9 more)

### Community 48 - "elevator: world"
Cohesion: 0.17
Nodes (26): camAt(), carZ(), clamp(), cut(), dark(), drawWorld(), easeIO(), f1() (+18 more)

### Community 49 - "high-dam-iso: bundle"
Cohesion: 0.15
Nodes (24): countUp(), fire(), iso(), box(), cutaway(), cyl(), d(), disc() (+16 more)

### Community 50 - "atm: world"
Cohesion: 0.15
Nodes (23): camAt(), clamp(), drawWorld(), easeIO(), f1(), L(), lerp(), makeIso() (+15 more)

### Community 51 - "qa.py: qa"
Cohesion: 0.16
Nodes (10): grams(), norm(), score(), contact_sheet(), frozen_stretches(), gray_frames(), loudness(), main() (+2 more)

### Community 52 - "microwave: world"
Cohesion: 0.16
Nodes (23): camAt(), clamp(), drawWorld(), easeIO(), f1(), food(), L(), lerp() (+15 more)

### Community 53 - "offshore-oil: script & ideas"
Cohesion: 0.15
Nodes (25): Offshore oil reference photo sources, Wikimedia Commons reference photos (drillship, BOP, FPSO, tricone, PDC, seismic vessel), Offshore oil narration script, Blowout preventer (BOP) on seabed, Impermeable cap rock dome trap, Drill bit (tricone / PDC diamond), Drill pipe strings to seabed, Drilling mud: cools bit, lifts cuttings, holds pressure (+17 more)

### Community 54 - "inverter-ac: template"
Cohesion: 0.17
Nodes (19): «إيه الحكاية؟» series brand (logo stinger, outro ask), Inverter AC iso page template, Car fuel analogy for start-stop vs steady speed, Inverter AC __extra(t) frame hook (room, intro, outro callouts), 1981: first home inverter AC, Japan, Isometric paper video style (cutaway + moving camera, framed close-up panels), LCD TV iso video page, LCD TV iso __extra(t) frame hook (+11 more)

### Community 55 - "high-dam: shots"
Cohesion: 0.11
Nodes (5): bolt(), damSection(), dots(), egyptMap(), poly()

### Community 56 - "elevator-waqei: world"
Cohesion: 0.18
Nodes (13): camAt(), carY(), clamp(), ease(), easeIO(), L(), lerp(), otisPlatY() (+5 more)

### Community 57 - "fridge-3d: world"
Cohesion: 0.15
Nodes (14): add(), apple(), clamp(), easeIO(), L(), lerp(), lit(), lumpy() (+6 more)

### Community 58 - "lcd-tv: shots"
Cohesion: 0.10
Nodes (4): battery(), bolt(), rgb(), subgrid()

### Community 60 - "washer: scene"
Cohesion: 0.30
Nodes (20): ar(), bathroom(), cam(), clamp(), damper(), drumA(), easeIO(), el() (+12 more)

### Community 61 - "bridge-water: shots"
Cohesion: 0.12
Nodes (5): cairo(), deck(), felucca(), nileBridge(), pierBody()

### Community 62 - "microwave: shots"
Cohesion: 0.13
Nodes (7): cutaway(), fork(), microwave(), mol(), molField(), plate(), steam()

### Community 63 - "qolla: shots"
Cohesion: 0.11
Nodes (3): qolla(), qW(), vapor()

### Community 65 - "printer: script & ideas"
Cohesion: 0.13
Nodes (19): printer index.html (How does a laser printer print?), window.__extra blink/sweep loops chained onto renderAt, grid() heart-on-drum builder (erase/toner/paper modes), Halo callout table H (active part per line), Dead lookup getElementById('minusring') (no such element), #section printer engine cross-section (drum, laser, toner, paper, fuser, cleaner), printer script.txt (laser printer, no ink), Fuser rollers ~200 C; paper passes too fast to ignite (+11 more)

### Community 66 - "touchscreen: shots"
Cohesion: 0.18
Nodes (7): display(), P(), pp(), sensor(), dia(), slab(), stack()

### Community 67 - "car-us: iso-scene"
Cohesion: 0.24
Nodes (13): byPhase(), carState(), clamp(), cylState(), easeIO(), el(), flow(), halo() (+5 more)

### Community 68 - "gps-traffic: shots"
Cohesion: 0.13
Nodes (3): carSide(), driver(), street()

### Community 69 - "offshore-oil: panels"
Cohesion: 0.22
Nodes (12): arrow(), clamp(), cone(), drop(), f(), frame(), lerp(), pdc() (+4 more)

### Community 70 - "airplane-v2: script & ideas"
Cohesion: 0.23
Nodes (15): إزاي الطيارة بتطير؟ v1 (flat SVG scenes), Scene S5: stall (angle gauge, flow separation), airplane v1 Arabic script, Flaps: bigger, more curved wing for low-speed lift, airplane-us English script (Here's the Deal), Control surfaces (ailerons, elevator, rudder), إزاي الطيارة بتطير؟ v2 (volumetric SVG scenes), #jet volumetric airliner SVG symbol (+7 more)

### Community 71 - "bridge-water: script & ideas"
Cohesion: 0.16
Nodes (16): Cartoon-panel layout (black frame, Aref Ruqaa title, 16:9 SVG panel, captions), Bridges in water video, cartoon-panel version, Cartoon renderAt with long-line font shrink, Bridge cartoon template (/*CAPS*/ placeholder), References — إزاي الكباري بتتبني وسط المية؟, Pixabay sound effects (sfx/px-*.mp3, kept out of git), Wikimedia Commons drawing references (Apalit bridge, Brooklyn caisson, Tahya Misr, riprap), Bridges in water Arabic script (+8 more)

### Community 72 - "car-egypt: shots"
Cohesion: 0.13
Nodes (3): car(), motorwagen(), wheel()

### Community 73 - "lcd-tv: build"
Cohesion: 0.20
Nodes (9): brk(), cap_text(), caps(), brk(), cap_text(), caps(), brk(), cap_text() (+1 more)

### Community 74 - "microwave: panels"
Cohesion: 0.22
Nodes (10): clamp(), crowd(), cutBox(), f(), frame(), mol(), plate(), push() (+2 more)

### Community 75 - "submarine: script & ideas"
Cohesion: 0.19
Nodes (16): Submarine Isometric Paper Page, Scene Captions (lines 0-25), Depth Gauge Readout, window.__extra() scene driver, Outro Numbered Legend (5 parts), Submarine Isometric Template, Submarine Script, Ballast Tanks (+8 more)

### Community 76 - "tbm-tunnel: script & ideas"
Cohesion: 0.17
Nodes (16): TBM Drawing References, Herrenknecht Mixshield TBM, Man-lock (Airlock), Surface Separation Plant, Sika (72,000 segments), VMT Guidance System, TBM Tunnel Script, Annular Grout (+8 more)

### Community 77 - "PLAYBOOK.md: script & ideas"
Cohesion: 0.16
Nodes (13): American English TTS voice style prompt, «إيه الحكاية؟» video production playbook, ASR line alignment (align_asr.py + map_timing.py, sherpa-onnx whisper-small), Colour semantics (blue water/air/lift, red heat/thrust, green mechanical, black weight), Narrator pace tightening (tighten.py --max 0.25 + atempo 1.08), Quality gate (qa.py PASS/FAIL + contact sheet), Render & publish (render.js 1080x1920 60fps, cover, title, description), Storyboard rules (12-15 compositions per 30 s, 3 signature moments, works muted) (+5 more)

### Community 78 - "atm: script & ideas"
Cohesion: 0.19
Nodes (14): ATM video, cartoon-panel version, ATM cartoon template (/*CAPS*/ placeholder), ATM video, isometric paper version, window.__extra (__sea world, intro/outro statics, numbered callouts, __panels), ATM iso template (MARK / CAPS_INTRO / PANELS / CAPS_MAIN / CAPS_OUT placeholders), References for the ATM drawings, Lobby ATM layout (NCR / Diebold-Nixdorf style: fascia, top cabinet, steel safe), ATM fact sources (Barclays archive, Finextra/Al Jazeera, US10049525, EP0582473B1) (+6 more)

### Community 79 - "atm: shots"
Cohesion: 0.18
Nodes (5): atmCut(), atmFront(), card(), note(), screenMenu()

### Community 80 - "lcd-tv: index"
Cohesion: 0.21
Nodes (12): Cartoon-panel video style (black frame, 16:9 panel, word-reveal captions), LCD TV cartoon video page, LCD TV cartoon renderAt(), LCD TV cartoon page template, Microwave cartoon video page, Microwave cartoon renderAt(), Microwave cartoon page template, Offshore oil cartoon video page (+4 more)

### Community 81 - "high-dam-page: high-dam-power"
Cohesion: 0.15
Nodes (14): High Dam electricity journey interactive page (7 stages), setPlaying(): 7 s auto-advance through stages, show(i): focus stage, light neighbour flows (ALSO), fill explainer card, STAGES: lake, turbine+generator, step-up, transmission, substation, distribution, home, tower(): lattice transmission tower path, Suez electricity journey page (gas + wind generation, canal crossing towers), STAGES: generation, step-up, transmission, substation, distribution, home, High Dam page video template (1280x720 render of the page scene) (+6 more)

### Community 82 - "car-us: build"
Cohesion: 0.20
Nodes (6): cap_text(), cap_text(), caps(), brk(), cap_text(), caps()

### Community 83 - "dishwasher: iso"
Cohesion: 0.33
Nodes (12): arm(), box(), cylV(), d(), el(), face(), line(), P() (+4 more)

### Community 84 - "submarine: index"
Cohesion: 0.20
Nodes (12): Submarine Cartoon Page, CAPS caption word data, renderAt() caption/panel renderer, Submarine Cartoon Template, TBM Tunnel Cartoon Page, CAPS caption word data, renderAt() caption/panel renderer, TBM Tunnel Cartoon Template (+4 more)

### Community 85 - "touchscreen: script & ideas"
Cohesion: 0.19
Nodes (14): Touchscreen Sources, Johnson Historical Photos (Shots 20-21), Pixabay Sound Effects, Projected-Capacitive Sensing (ITO, Mutual Capacitance), Royal Radar Establishment / Electronics Letters 1965, Touchscreen Script, Body Conductivity (Water and Salts), E.A. Johnson (1965 Inventor) (+6 more)

### Community 86 - "phone-call: script & ideas"
Cohesion: 0.26
Nodes (12): Phone call cartoon video page, Phone call cartoon page template, Phone call iso video page, Antenna converts numbers to radio waves at light speed, Nearest cell tower, Sampling thousands of times/s into numbers + compression, Phone call iso __extra(t) frame hook, Underground fiber-optic cables carry light pulses (+4 more)

### Community 88 - "atm: panels"
Cohesion: 0.23
Nodes (5): clamp(), digits(), f(), frame(), push()

### Community 89 - "elevator: shots"
Cohesion: 0.20
Nodes (4): car(), rails(), riders(), shaft()

### Community 90 - "fridge: iso-scene"
Cohesion: 0.36
Nodes (10): bigNum(), clamp(), el(), flow(), halo(), L(), running(), span() (+2 more)

### Community 91 - "fridge: template"
Cohesion: 0.20
Nodes (12): Fridge video template (iso cutaway, How a fridge cools), Live charts: pipe pressure, fridge temperature, kitchen temperature, Fridge 3D cutaway scene with moving camera (lines 4-36), Refrigeration cycle: compressor, condenser, capillary tube, evaporator, __extra frame hook: city block, intro/outro numbered callouts, panels, Inverter AC iso video page (How does an inverter AC save power?), __extra frame hook: room redraw, intro/outro callouts, stinger push-in, Live charts: power draw and room temperature, normal vs inverter (+4 more)

### Community 92 - "gps-traffic: panels"
Cohesion: 0.26
Nodes (7): clamp(), f(), frame(), phone(), push(), sat(), streetMap()

### Community 93 - "submarine: shots"
Cohesion: 0.20
Nodes (3): bubbles(), control(), fish()

### Community 94 - "submarine: panels"
Cohesion: 0.32
Nodes (9): arrow(), boat(), bubbles(), clamp(), f(), frame(), lerp(), push() (+1 more)

### Community 95 - "high-dam: script & ideas"
Cohesion: 0.18
Nodes (11): High Dam cartoon-panel video page, High Dam cartoon template (/*CAPS*/ placeholder), SCENES: lake, tunnel, turbine, generator, transformer 500 kV, towers 800 km, neighbourhood transformer 220 V, High Dam references and sources, Fact check: 12 Francis units x 175 MW = 2,100 MW, ~74 m head, 111 m high, 3,830 m long, 500 kV, NASA ISS/STS photos of Lake Nasser (public domain), Pixabay sound effects (sfx/px-*.mp3), Wikimedia Commons High Dam photos (+3 more)

### Community 96 - "elevator: panels"
Cohesion: 0.31
Nodes (6): clamp(), f(), face(), frame(), push(), shield()

### Community 97 - "high-dam-iso: episode"
Cohesion: 0.20
Nodes (10): High Dam iso episode: Nile water to your home 800 km, animateWorld(): spin turbines, water/electricity particles, lamp, drawInset(): generator magnet turning in stator coils, window.render(t): intro, brand, 7 scenes, summary timeline, setCam(): viewBox camera with pattern rescale, track(): length-sampled screen-space polyline, typeOn(): per-word caption type-on with meaning colours, world(): one 3D cutaway (Lake Nasser, dam, tunnel, turbines, transformer, towers, house) (+2 more)

### Community 98 - "lcd-tv: panels"
Cohesion: 0.31
Nodes (5): clamp(), f(), frame(), push(), px()

### Community 99 - "microwave: script & ideas"
Cohesion: 0.24
Nodes (10): Microwave narration script, First commercial microwave: human-height, ~340 kg, Metal fork reflects waves and sparks at tips, Magnetron generates microwaves, Faster molecular vibration = heat, Microwaves penetrate only 1–2 cm, Percy Spencer accidental discovery, 1945 (melted chocolate, popcorn), Turntable evens out hot/cold spots (+2 more)

### Community 100 - "sonic-boom: script & ideas"
Cohesion: 0.31
Nodes (10): Sonic Boom Script, Afterburner, Bell X-1 Rocket Plane, Chuck Yeager, Double Boom (Nose and Tail), Jet Engine, Shock Wave Cone (Mach Cone), Sound Barrier (+2 more)

### Community 101 - "washer: index"
Cohesion: 0.36
Nodes (10): Washer Technical-Diagram Page, ar() Arabic numeral converter, el() SVG element helper, window.__extra() overlay driver, Old Washing Tub Inset, Mud-off-Tyre Inset, Legend 1-2-3 (Springs, Dampers, Concrete), Procedural Cloudy Paper Texture (+2 more)

### Community 102 - "washer: script & ideas"
Cohesion: 0.27
Nodes (10): Washing Machine Script, Concrete Counterweight, Drain Pump, Unbalanced Load Shaking, Water Heater, Inner Perforated Drum and Outer Tub, Motor and Belt Drive, Drum Paddles (Lift and Drop) (+2 more)

### Community 103 - "helicopter: storyboard"
Cohesion: 0.25
Nodes (8): GPS traffic cartoon-panel video page, renderAt: panel draw + voice-synced caption word reveal, GPS traffic cartoon template (/*CAPS*/ placeholder), Helicopter storyboard (cartoon-in-panel reference style), Cartoon-in-panel frame: black bg, hand-lettered title, 16:9 panel, word-by-word captions, qa.py gate before a video is sent, Helicopter style test: three reference-look panels (runway, rooftop, night engine-out), Pilot character symbol (white ball head, dash eyes)

### Community 104 - "gps-traffic: script & ideas"
Cohesion: 0.28
Nodes (9): GPS traffic iso (paper) video page, GPS traffic iso template (MARK/CAPS/PANELS placeholders), Outro legend: GPS gives position only; phones send speed anonymously; slow=red; history predicts; map sees phones not cars, GPS traffic narration script (How does the map know there is traffic?), 2020 German artist's 99-phone handcart traffic hack, Crowdsourced anonymous phone location+speed compared to usual road speed, Historical daily traffic memory for ETA and congestion prediction, GPS positioning from distances to at least four satellites (+1 more)

### Community 105 - "helicopter: script & ideas"
Cohesion: 0.22
Nodes (9): Helicopter cartoon-panel video page, SVG symbols: heliBody, heliGlass, plane, Helicopter narration script (How does a helicopter fly?), Autorotation: upward airflow spins rotor, flare before landing, Collective pitch: change all blade angles to climb/descend/hover, Cyclic: tilting the rotor disc tilts thrust for forward flight, Rotor blades are rotating wings (lift by pushing air down), Tail rotor counters torque; pedals yaw left/right (+1 more)

### Community 106 - "airplane-us: index"
Cohesion: 0.29
Nodes (7): How does a plane fly? (US English, three.js world), Here's the Deal brand card (English counterpart of إيه الحكاية؟), window.__labels (HTML labels pinned to projected 3D points), renderAt wrapper (engine + __world + __labels), Jet engine cycle: suck, squeeze, bang, blow, airplane-us page template (<!--CAPS--> placeholder), #mark logo (speech bubble + red ؟ + stopwatch crown)

### Community 107 - "car-us: iso"
Cohesion: 0.36
Nodes (4): clear(), stroke01(), update(), wheel()

### Community 108 - "high-dam: cues"
Cohesion: 0.39
Nodes (6): bed(), c, D(), L(), off, rec()

### Community 109 - "lcd-tv: script & ideas"
Cohesion: 0.36
Nodes (8): LCD TV narration script, Additive color mixing (red+green=yellow, all=white), RGB color filter subpixels, LED backlight (white light always on), Liquid crystal twisted helix rotates light 90°, Pixel = 3 subpixels; 4K ≈ 8M pixels / 25M subpixels, Polarizing filter (vertical then horizontal bars), Per-subpixel transistor controls voltage

### Community 110 - "sonic-boom: cues"
Cohesion: 0.32
Nodes (5): boomAt(), c, jet(), LONG, rec()

### Community 111 - "touchscreen: cues"
Cohesion: 0.43
Nodes (6): c, D(), hum(), L(), rec(), tap()

### Community 112 - "bridge-water: cues"
Cohesion: 0.48
Nodes (5): c, D(), L(), rec(), river()

### Community 113 - "car-egypt: cues"
Cohesion: 0.43
Nodes (4): c, D(), engine(), L()

### Community 114 - "qolla: cues"
Cohesion: 0.48
Nodes (5): c, cicadas(), D(), L(), rec()

### Community 115 - "sea-cables: cues"
Cohesion: 0.48
Nodes (5): bed(), c, D(), L(), rec()

### Community 116 - "dishwasher: iso-scene"
Cohesion: 0.53
Nodes (3): el(), flow(), span()

### Community 117 - "microwave: cues"
Cohesion: 0.40
Nodes (3): c, D(), L()

### Community 118 - "airplane: index"
Cohesion: 0.40
Nodes (5): #play live preview with voice.wav, Inline renderAt animation engine (scenes, captions, data-v, data-loop), Word-timed caption reveal (data-words -> .w spans, --mix), Cartoon renderAt (__panel + CAPS word reveal by length), Shared animation engine videos/engine.js

### Community 119 - "atm: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 120 - "elevator: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 121 - "gps-traffic: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 122 - "inverter-ac: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 123 - "offshore-oil: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 124 - "robot-vacuum: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 125 - "submarine: build"
Cohesion: 0.60
Nodes (3): brk(), cap_text(), caps()

### Community 131 - "inverter-ac: script & ideas"
Cohesion: 0.50
Nodes (4): Compressor (uses most of the electricity), Inverter board varying compressor motor speed, ~1/3 electricity saving of inverter AC, Live chart: power draw, normal vs inverter AC

## Ambiguous Edges - Review These
- `Shock Wave Cone (Mach Cone)` → `Pressure +1 atm per 10 m`  [AMBIGUOUS]
  sonic-boom/script.txt · relation: semantically_similar_to
- `Compressed Air Cylinders` → `Man-lock (Airlock)`  [AMBIGUOUS]
  submarine/script.txt · relation: semantically_similar_to

## Knowledge Gaps
- **113 isolated node(s):** `Narrator pace tightening (tighten.py --max 0.25 + atempo 1.08)`, `Storyboard rules (12-15 compositions per 30 s, 3 signature moments, works muted)`, `Quality gate (qa.py PASS/FAIL + contact sheet)`, `airplane-us page template (<!--CAPS--> placeholder)`, `Streamline + particle generator script` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 779 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `qolla cartoon template.html (cartoon-panel shell)` connect `sonic-boom: scenes` to `phone-call: world`, `qolla: scenes`, `sea-cables: scenes`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `Narrator pace tightening (tighten.py --max 0.25 + atempo 1.08)`, `Storyboard rules (12-15 compositions per 30 s, 3 signature moments, works muted)`, `Quality gate (qa.py PASS/FAIL + contact sheet)` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `tbm-tunnel: scenes` be split into smaller, more focused modules?**
  _Cohesion score 0.0609009009009009 - nodes in this community are weakly interconnected._
- **Why does `«إيه الحكاية؟» brand (explainer series)` connect `phone-call: world` to `sonic-boom: scenes`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `phone-call: world` be split into smaller, more focused modules?**
  _Cohesion score 0.05563093622795115 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Shock Wave Cone (Mach Cone)` and `Pressure +1 atm per 10 m`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Compressed Air Cylinders` and `Man-lock (Airlock)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._