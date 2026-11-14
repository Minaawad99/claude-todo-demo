# صفحة Gumroad المخصصة

`landing.html` هي صفحة البيع المخصصة لمنتج «حزمة فيديوهات الأنيميشن بالذكاء الاصطناعي» على Gumroad.

- ملف واحد، والصورة جواه (Gumroad بيمنع الصور الخارجية).
- فيه 3 زراير شراء بـ `data-gumroad-action="buy"`، والسعر بيتملى من Gumroad (`data-gumroad-field="price"`).
- المنتج على Gumroad: https://meana8.gumroad.com/l/ai-video-kit (الاسم في الأوامر `ai-video-kit`). لو الأداة ما قبلتهوش، جرّب الاسم الأصلي `irkva`.

## النشر (محتاج `gumroad.com` و`api.gumroad.com` في المواقع المسموحة)

```
curl -fsSL https://gumroad.com/install-cli.sh | bash
gumroad auth login
gumroad products page preview ai-video-kit ./gumroad/landing.html --json --no-input --non-interactive
gumroad products page publish ai-video-kit ./gumroad/landing.html --json --no-input --non-interactive
gumroad products page url ai-video-kit --json --jq '.product.landing_url' --no-input --non-interactive
```

راجع `.sanitization_report` و`.warning` في نتيجة preview قبل النشر، وبعد النشر افتح الصفحة واضغط زرار الشراء للتأكد إن الـcheckout شغال.

للرجوع لصفحة المنتج العادية:

```
gumroad products page clear ai-video-kit --yes --json --no-input --non-interactive
```
