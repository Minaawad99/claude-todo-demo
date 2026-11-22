# The Gemini cover prompt (every video, every skill)

**The user's rule (after «الكحة بعد التبطيل»):** every video ends with an English image prompt for Gemini / Google AI
Studio, in its own code block, sent with the video, the coded cover and the titles, without being asked. The user makes
the picture and sends it back; the reel cover is then built on it the way `cover-naps-gemini-tiktok.html` is built on
`naps-gemini-art.jpg` (our Noto text, tags and fades over their picture). The coded cover stands in until it arrives.

## The look (from `naps-gemini-art.jpg`, the cover the user picked)

- Hand-inked editorial illustration, clean dark outlines, flat muted colours with soft shading, slight paper texture.
- Background dark slate `#1b1d22` with a faint square grid, one warm yellow glow behind the subject.
- One person (adult, real proportions, Egyptian, dressed for the topic) acting the key moment, mid-frame.
- One magnified inset circle with a thin orange ring on the detail the video explains.
- 9:16 vertical; the top quarter and the bottom quarter left empty and dark for the titles; nothing important at the
  right edge (the app buttons).
- **Strictly no text, letters, numbers or logos anywhere in the image.**

## Real shapes

Anatomy, machines and places come from real references: name the reference in the prompt ("use the attached photo as the
reference for the shape") and tell the user which image to attach (the ones in the episode's `refs/SOURCES.md`).

## Template

```
Vertical 9:16 editorial illustration, hand-inked with clean dark outlines, flat muted colours and soft shading, subtle paper texture. Dark slate background (#1b1d22) with a faint square grid and one warm yellow glow behind the subject. <THE PERSON: age, Egyptian, clothes for the topic, real adult proportions, the pose and the facial expression of the key moment>. <WHAT THE VIDEO EXPLAINS, drawn from the attached reference: shapes, colours, where it sits>. Top-left: a magnified inset circle with a thin orange ring showing <THE DETAIL>. Keep the top quarter and the bottom quarter of the image empty and dark for titles, and keep the right edge clear. Strictly no text, letters, numbers or logos anywhere in the image.
```
