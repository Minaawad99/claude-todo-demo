# Sources — «How does your dog see you?» (American English)

The same facts, drawings and sounds as the Arabic episode: see `videos/dog-vision/refs/SOURCES.md`.
- Acuity 20/75 is said in feet: what you read at 60 ft, the dog needs about 15 ft for (≈ 4× weaker; Miller & Murphy 1995).
- Voice: Gemini TTS `gemini-3.8-flash-tts`, Puck, temperature 1, `style.txt`. Timing by `align_asr.py --lang en`; the 2/3 line
  boundary was moved by hand so «Ever.» stays on line 2.
- Shots: `../dog-vision/sketch/dog.js` + `shots.js`, words swapped in `sketch/en.js`; English page `sketch/template.html` («Here's the Deal»).
