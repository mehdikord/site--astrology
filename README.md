# فاطمه یوسفی — وب‌سایت آسترولوژی (Next.js)

وب‌سایت معرفی خدمات تحلیل **ماتریکس سرنوشت**، **دشا** و **آسترولوژی ماه تولد** به‌همراه بخش **دوره‌ها**، **مقالات**، درباره ما، تماس با ما و قوانین.
بدون پایگاه داده — محتوای سایت از فایل‌های `data/` خوانده می‌شود.

## اجرا

```bash
npm install
npm run build    # ساخت production در .next/
npm start        # سرور روی 127.0.0.1:3040
npm run dev      # حالت توسعه → http://localhost:3000
```

### دیپلوی روی VPS (systemd / پنل)

بعد از آپلود کد روی مثلاً `/var/www/astrology.tonl.ir`:

```bash
cd /var/www/astrology.tonl.ir
npm install
npm run build
sudo systemctl restart astrology-tonl-ir-next
```

سرویس باید `next start` را اجرا کند (نه `serve out`). نمونه: `deploy/astrology-tonl-ir-next.service`.

## ویرایش محتوا (بدون نیاز به کدنویسی)

| چه چیزی | کجا |
|---|---|
| نام برند، شماره، ایمیل، لینک تلگرام/واتس‌اپ/اینستاگرام، **لینک ثبت سفارش** | `data/site.ts` |
| آمار هیرو و نظرات مشتریان | `data/site.ts` |
| خدمات (قیمت، توضیحات، سوالات متداول) | `data/services.ts` |
| دوره‌ها (قیمت، سرفصل‌ها، تخفیف) | `data/courses.ts` |
| مقالات بلاگ | `data/posts.ts` |
| متن قوانین | `app/terms/page.tsx` |
| تصاویر | `public/images/` (فرمت webp) |

> قیمت‌ها را به‌صورت عدد (تومان) وارد کنید؛ سایت خودش آن‌ها را با ارقام فارسی و جداکننده نمایش می‌دهد.

### ثبت سفارش / خرید دوره
دکمه‌های «ثبت سفارش» و «ثبت‌نام در دوره» کاربر را با یک پیام آماده به `orderUrl` (تلگرام یا واتس‌اپ) می‌فرستند.
اگر درگاه پرداخت دارید (زرین‌پال، آیدی‌پی، …) کافی است لینک درگاه را در `orderUrl` بگذارید.

### فرم تماس
فرم تماس پیام را در تلگرام یا ایمیل کاربر باز می‌کند. برای دریافت مستقیم پیام‌ها می‌توانید فرم را به سرویس‌هایی مثل Formspree یا Getform وصل کنید (`components/ContactForm.tsx`).

## ساختار

```
app/              صفحات (App Router)
  page.tsx        خانه
  services/       خدمات + صفحه‌ی هر خدمت
  courses/        دوره‌ها + صفحه‌ی هر دوره
  blog/           مقالات + صفحه‌ی هر مقاله
  about/ contact/ terms/
components/
  ui/Galaxy.tsx   پس‌زمینه‌ی کهکشانی WebGL (شیدر، به سبک React Bits)
  ui/TiltCard.tsx کارت‌های سه‌بعدی با اسپات‌لایت
  ui/ZodiacWheel  چرخ زودیاک SVG متحرک
data/             تمام محتوای سایت
```

## تکنولوژی
Next.js 15 · Tailwind CSS v4 · OGL (WebGL) · فونت وزیرمتن (لوکال) · lucide-react
