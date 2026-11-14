# صفحة Gumroad المخصصة

`landing.html` هي صفحة البيع المخصصة لمنتج «حزمة فيديوهات الأنيميشن بالذكاء الاصطناعي» على Gumroad.

- ملف واحد، والصورة جواه (Gumroad بيمنع الصور الخارجية).
- فيه 3 زراير شراء بـ `data-gumroad-action="buy"`، والسعر بيتملى من Gumroad (`data-gumroad-field="price"`).
- المنتج على Gumroad: `irkva` (لو اتغير الرابط، استخدم الاسم الجديد).

## النشر (محتاج `gumroad.com` و`api.gumroad.com` في المواقع المسموحة)

```
curl -fsSL https://gumroad.com/install-cli.sh | bash
gumroad auth login
gumroad products page preview irkva ./gumroad/landing.html --json --no-input --non-interactive
gumroad products page publish irkva ./gumroad/landing.html --json --no-input --non-interactive
gumroad products page url irkva --json --jq '.product.landing_url' --no-input --non-interactive
```

راجع `.sanitization_report` و`.warning` في نتيجة preview قبل النشر، وبعد النشر افتح الصفحة واضغط زرار الشراء للتأكد إن الـcheckout شغال.

للرجوع لصفحة المنتج العادية:

```
gumroad products page clear irkva --yes --json --no-input --non-interactive
```
