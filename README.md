# فاطمه یوسفی — وب‌سایت آسترولوژی (Next.js، کاملاً استاتیک)

وب‌سایت معرفی خدمات تحلیل **ماتریکس سرنوشت**، **دشا** و **آسترولوژی ماه تولد** به‌همراه بخش **دوره‌ها**، **مقالات**، درباره ما، تماس با ما و قوانین.
بدون پایگاه داده و بدون سرور — خروجی نهایی یک پوشه‌ی HTML/CSS/JS است که روی هر هاستی بالا می‌آید.

## اجرا

```bash
npm install
npm run dev      # حالت توسعه  → http://localhost:3000
npm run build    # خروجی استاتیک در پوشه‌ی out/
npm start        # سرو کردن out/ روی 127.0.0.1:3040
```

پوشه‌ی `out/` را روی هر هاست استاتیکی (Vercel، Netlify، Cloudflare Pages، cPanel، لیارا، …) آپلود کنید.

### systemd روی VPS (پورت 3040)

سایت با `output: "export"` استاتیک است؛ **`next start` کار نمی‌کند**. بعد از `npm run build` سرویس باید `out/` را سرو کند:

```bash
npm install
npm run build
sudo cp deploy/astrology-tonl-ir-next.service /etc/systemd/system/
# مسیر WorkingDirectory و User را در فایل سرویس با سرور خودتان هماهنگ کنید
sudo systemctl daemon-reload
sudo systemctl enable --now astrology-tonl-ir-next
```

یا بدون Node، مستقیم با Nginx ریشهٔ سایت را روی پوشه‌ی `out/` بگذارید.

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
چون سایت استاتیک است، دکمه‌های «ثبت سفارش» و «ثبت‌نام در دوره» کاربر را با یک پیام آماده به `orderUrl` (تلگرام یا واتس‌اپ) می‌فرستند.
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
  home/           سکشن‌های صفحه‌ی اصلی
data/             تمام محتوای سایت
```

## تکنولوژی
Next.js 15 (static export) · Tailwind CSS v4 · OGL (WebGL) · فونت وزیرمتن (لوکال) · lucide-react
