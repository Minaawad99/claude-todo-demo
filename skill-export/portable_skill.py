"""Make the portable SKILL.md from the repo skill (.claude/skills/sketch/SKILL.md): adds the setup section and points
paths at the files inside the package. Usage: python3 portable_skill.py <repo SKILL.md> <out SKILL.md>"""
import sys
s = open(sys.argv[1], encoding="utf-8").read()
setup = '''## Setup (first time in a project)

This skill carries everything with it, so it works in any project and on any Claude account:

- `scripts/setup_workspace.sh <project-dir>`: run it once. It puts `videos/` in place with the shared template, the
  tools, the sound kit and music, the globe library, and the reference episode «المد والجزر» (`videos/tides/`). It
  never overwrites anything, and it reports missing tools: ffmpeg, node with playwright, python3 with numpy, and
  sherpa-onnx for alignment.
- `references/STYLE.md`: the rules measured from the 20 reference videos.
- `references/REFERENCE-INDEX.md`: which video draws what.
- `assets/reference/sheets/vNN.jpg`: contact sheets, a frame every 2.5 s.
- `assets/reference/frames/`: motion strips.
- `assets/reference/transcripts.txt`: the transcripts.
- The 20 small reference videos come as a separate download, `sketch-reference-videos.zip`. Unzip it into
  `videos/_reference/tabizzay/` to pull frames from them with ffmpeg.
- `references/HISTORY.md`: **read it first in a new account.** It has every decision and preference from the session
  that built this style (names, music level, the side-view rule, voice workflow, QA lessons).

All the paths below are inside the project's `videos/` after setup.

'''
rep = [("## 0. First question (every new topic)", setup + "## 0. First question (every new topic)"),
       ("measured in\n`videos/_reference/tabizzay/STYLE.md`, with contact sheets, motion strips and transcripts.",
        "measured in\n`references/STYLE.md` (also copied to `videos/_reference/tabizzay/` by setup), with contact sheets, motion strips and transcripts."),
       ("**The kit is in the repo:** `videos/_templates/sketch/sfx/` (committed at the user's request, about 11 MB).",
        "**The kit comes with this skill:** setup puts it in `videos/_templates/sketch/sfx/` (about 11 MB)."),
       ("Look at the matching reference sheet in `videos/_reference/tabizzay/sheets/` as well.",
        "Look at the matching reference sheet as well: `assets/reference/sheets/` (see `references/REFERENCE-INDEX.md` for which video draws what)."),
       ('  "زي فيديو المد والجزر", "بالرسم الهندسي", "زي طب إزاي" or "sketch style".',
        '  "زي فيديو المد والجزر", "بالرسم الهندسي", "زي طب إزاي" or "sketch style", or asks for a new «إيه الحكاية؟» episode\n'
        '  in this hand-drawn paper style. Self-contained: scripts/setup_workspace.sh sets up the template, tools, sound kit and a\n'
        '  full reference episode in any project.')]
for a, b in rep:
    if a not in s: sys.exit("portable_skill.py: the repo skill changed, update this replacement: " + a[:60])
    s = s.replace(a, b)
open(sys.argv[2], "w", encoding="utf-8").write(s)
