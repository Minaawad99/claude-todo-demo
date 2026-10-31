# Awad Facts – Video Factory

Everything for making videos for the Awad Facts Facebook/TikTok channel.

## Layout

- `shared/` – used by every style: `intros/` (the user's 3 intro clips + cover backgrounds), `fonts/`, `tools/`.
- `styles/<name>/` – one folder per video style: `STYLE.md` (rules, writing style, build steps) and `examples/`.

## Styles

| Style | Folder | What it looks like | Used for |
|---|---|---|---|
| **facts-cards** (كروت المعلومات) | `styles/facts-cards/` | Intro clip + hook card, then 2 photos per item (5 s each) under a white card with title + 2-line fact in فصحى | Lists: inventions, people, countries, animals, history |

## Rules for working here

1. When the user asks for a video, ask **which style** if more than one exists (and which intro). If the user
   describes something that doesn't match any style, it's a new style.
2. Read that style's `STYLE.md` before starting.
3. A new style gets its own `styles/<new-name>/STYLE.md` and a row in the table above. Don't change an
   existing style's rules unless the user asks for that style to change.
4. Put anything reusable (new intro, font, tool) in `shared/`.
