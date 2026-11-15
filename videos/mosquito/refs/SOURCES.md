# Mosquito episode: references

## Drawings
- **Mosquito:** a female in side view, drawn from the known anatomy of *Culex* / *Aedes* (humped thorax, banded abdomen
  held up, one long proboscis with short palps, plumose antennae, narrow wings folded over the abdomen, six long legs with
  the hind pair raised). Quick mode: no reference photos were downloaded for this episode.
- **Skin section:** epidermis, dermis, fat lobules, hairs, one eccrine sweat gland (coil, duct, pore), rod-shaped
  bacteria on the surface.
- People are faceless busts and profiles in the series hand.

## Facts checked
- Only female mosquitoes bite; they need the blood protein to make eggs.
- CO₂ in breath is the long-range cue; mosquitoes pick it up from 10 m and more and fly upwind along the plume.
- Smelling CO₂ switches on visual search for dark, high-contrast objects (van Breugel et al., *Current Biology* 2015;
  Alonso San Alberto et al., *Nature Communications* 2022).
- Body heat matters at close range; infrared from skin is sensed from about 70 cm (DeBeaubien et al., *Nature* 2023).
- Skin smell decides who is bitten: people with more carboxylic (fatty) acids on their skin are "mosquito magnets"; the
  most attractive subject was about 100 times more attractive than the least, and the ranking held for years
  (De Obaldia et al., *Cell* 2022). Skin bacteria turn sweat and sebum into these odours.
- Pregnant women attracted about twice as many *Anopheles gambiae* (Lindsay et al., *The Lancet* 2000); larger bodies
  breathe out more CO₂.
- «دمهم حلو» is a myth: mosquitoes do not smell blood or blood sugar from a distance.
- Mosquitoes have taste receptors on their legs (tarsi) and taste the skin on landing.
- Blood group O: small studies (Shirai et al. 2004) found more landings, but the evidence is weak; it is only in the
  summary card as a caveat.

## Sounds
- The shared «اسكتش» kit and series music: `videos/_templates/sketch/sfx/` (see its SOURCES.md).
- `sfx/px-buzz.mp3` (gitignored): a synthesized mosquito whine, made here:
  `ffmpeg -f lavfi -i "aevalsrc='(0.5*sin(2*PI*P)+0.28*sin(4*PI*P)+0.14*sin(6*PI*P))*(0.55+0.45*sin(2*PI*0.7*t+1))*0.5':d=12"`
  with `P = 540*t+9*sin(2*PI*1.1*t)+3*sin(2*PI*6*t)`, 0.3 s fade in and 0.5 s fade out. Without it a soft hum plays.
