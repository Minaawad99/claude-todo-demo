# نقل مهارات «إيه الحكاية؟» لحساب Claude Code تاني

## الملفات
- **skills-only.zip** (1.2MB): المهارات بس — `.claude/skills/` (sketch, animation, law, humanizer, product-launch-motion, remotion-*) + `CLAUDE.md` + `videos/PLAYBOOK.md`.
- **video-kit.zip** (70MB): كل اللي فوق + اللي المهارات بتعتمد عليه عشان تشتغل فعلاً:
  - المحرك: `videos/engine.js, render.js, qa.py, align*.py, map_timing.py, lib/, tools/, audio/`
  - القوالب: `videos/_templates/` (sketch + أصوات ومزيكا السلسلة، diagram-v1)
  - الـ20 فيديو المرجعية: `videos/_reference/tabizzay/`
  - الحلقات المرجعية: `videos/tides/` (اسكتش)، `videos/tbm-tunnel/` (انيميشن)، `videos/nuclear-shelter/` («لو»)
  - غلافين مرجعيين من `brand/eh-elhekaya/`

## طريقة النقل
1. نزّل `video-kit.zip`.
2. فكّه في جذر الريبو الجديد (هيحط `.claude/skills/` و `CLAUDE.md` و `videos/` في أماكنهم).
3. اعمل commit و push، وافتح جلسة Claude Code على الريبو ده — المهارات هتظهر لوحدها.

> لو عايز المهارات تبقى متاحة في كل مشاريعك مش ريبو واحد: حط محتوى `.claude/skills/` في `~/.claude/skills/` على جهازك.
> أسهل حل كمان: الحساب التاني يوصّل نفس الريبو ده من GitHub، وكل حاجة هتبقى موجودة من غير نقل.
