# Electric water heater episode: references and checked facts

- **The heater:** the common wall-mounted vertical electric storage heater (about 50 L). The cut-away follows the usual
  build: an enamelled inner steel tank, polyurethane foam between it and the outer casing, a U-shaped sheathed element and
  the thermostat pocket on the bottom flange, a magnesium anode rod, the cold inlet with a short dip tube and a safety
  valve, and the hot outlet drawn from the top. The pilot lamp and the thermostat knob sit on the bottom cover.
  Drawn in the hand of the «طب إزاي؟» reference (v09 dishwasher heater icon, v02 air-fryer element);
  Wikimedia Commons was rate-limited (HTTP 429) during research, so no photo is credited here.
- **Element cross-section:** resistance coil in magnesium-oxide powder inside a steel sheath; limescale forms outside it.
- **People:** real body proportions (Drillis & Contini), copied from `videos/choking/sketch/shots.js`.

## Facts checked
- Standby loss of a 50 L storage heater: roughly 1–2 kWh a day depending on insulation (EU ErP labels list about
  1.0–1.3 kWh/24 h for 50 L class B–C heaters; older or cheaper units lose more). The script says «حوالي كيلووات ونص»,
  so about 45 kWh a month.
- About 1 °C an hour: 1.5 kWh/day from 50 L of water (≈209 kJ/°C) is about 26 °C a day at 60 °C, about 1 °C/h.
- Switching off never costs more than leaving it on: heat loss falls as the water cools, and reheating only replaces
  what was lost.
- Limescale settles faster at higher temperatures (calcium carbonate is less soluble in hot water) and insulates the
  element, which runs hotter and fails sooner.
- A cracked element sheath can leak current into the water; without an earth connection it can reach someone in the
  shower. Turning the heater off at its double-pole switch before showering is the standard advice.

## Sounds
Kit only (`videos/_templates/sketch/sfx/`, see its SOURCES.md) plus synthesized effects from `videos/audio/sfx.py`. No music.
