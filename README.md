# کژال متد — وب‌سایت آسترولوژی (Next.js)

وب‌سایت معرفی خدمات تحلیل **ماتریکس سرنوشت**، **دشا** و **آسترولوژی ماه تولد** به‌همراه بخش **دوره‌ها**، **مقالات**، درباره ما، تماس با ما و قوانین.
محتوای سایت از دیتابیس MySQL (با Prisma) خوانده می‌شود و از پنل مدیریت در آدرس `/admins/` قابل ویرایش است.

## اجرا

```bash
npm install
cp .env.example .env   # اطلاعات دیتابیس و ADMIN_SESSION_SECRET را وارد کنید
npm run db:deploy      # اجرای مایگریشن‌ها
npm run db:seed        # مدیر پیش‌فرض (09120000000 / password) و محتوای اولیه
npm run build    # ساخت production در .next/ (دیتابیس باید در دسترس باشد)
npm start        # سرور روی 127.0.0.1:3040
npm run dev      # حالت توسعه → http://localhost:3000
```

### دیپلوی روی VPS (systemd / پنل)

بعد از آپلود کد روی مثلاً `/var/www/astrology.tonl.ir`:

```bash
cd /var/www/astrology.tonl.ir
npm install
npm run db:deploy
npm run build
sudo systemctl restart astrology-tonl-ir-next
```

سرویس باید `next start` را اجرا کند (نه `serve out`). نمونه: `deploy/astrology-tonl-ir-next.service`.

در `.env` سرور آدرس عمومی سایت را بگذارید (برای ریدایرکت‌های پنل و فرم‌ها پشت nginx لازم است):

```
APP_URL="https://astrology.tonl.ir"
```

و در کانفیگ nginx هدرهای زیر را به Next بفرستید:

```nginx
location / {
    proxy_pass http://127.0.0.1:3040;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 25m;   # آپلود گزارش‌های PDF تا ۲۰ مگابایت
}
```

## ویرایش محتوا — پنل مدیریت (`/admins/`)

همه‌ی محتوا از پنل مدیریت ویرایش می‌شود و صفحات سایت پس از هر ذخیره خودکار به‌روز می‌شوند:
خدمات، دوره‌ها (سرفصل، درس، دانشجویان)، مقالات و دسته‌بندی‌ها، سوالات متداول، نظرات مشتریان،
کاربران، درخواست‌های تحلیل و تحویل گزارش، سفارش‌ها و تراکنش‌ها، کدهای تخفیف، پیام‌های فرم تماس،
تنظیمات سایت (اطلاعات تماس، شبکه‌های اجتماعی، لینک ثبت سفارش، آمار) و مدیران.

> قیمت‌ها به تومان ذخیره می‌شوند. فایل‌های آپلودی در `storage/` نگه داشته می‌شوند (در گیت نیست؛ در بکاپ سرور لحاظ شود).
> متن قوانین در `app/(site)/terms/page.tsx` و تصاویر ثابت در `public/images/` است.

### ثبت سفارش
دکمه‌های «ثبت سفارش» کاربر را با پیام آماده به «لینک ثبت سفارش» (تلگرام/واتس‌اپ) می‌فرستند.
سفارش‌ها و اطلاعات تولد دریافتی را از پنل (سفارش‌ها / درخواست‌های تحلیل) ثبت کنید؛ با ثبت پرداخت، دسترسی دوره‌ها خودکار فعال می‌شود.

### فرم تماس
پیام‌های فرم تماس در دیتابیس ذخیره و در بخش «پیام‌ها»ی پنل نمایش داده می‌شوند.

## ساختار

```
app/
  (site)/         صفحات عمومی سایت (خانه، خدمات، دوره‌ها، مقالات، درباره، تماس، قوانین)
  admins/         پنل مدیریت
lib/
  content.ts      خواندن محتوای سایت از دیتابیس
  settings.ts     تنظیمات سایت
  admin/          احراز هویت، اعتبارسنجی، آپلود و منطق سفارش پنل
prisma/
  schema.prisma   اسکیمای دیتابیس
  migrations/     مایگریشن‌ها
  seed.ts         داده‌ی اولیه (seed-data/ محتوای اولیه‌ی سایت)
components/
  ui/Galaxy.tsx   پس‌زمینه‌ی کهکشانی WebGL (شیدر، به سبک React Bits)
  ui/TiltCard.tsx کارت‌های سه‌بعدی با اسپات‌لایت
  ui/ZodiacWheel  چرخ زودیاک SVG متحرک
  admin/          کامپوننت‌های پنل مدیریت
```

## تکنولوژی
Next.js 15 · MySQL + Prisma 7 · Tailwind CSS v4 · OGL (WebGL) · فونت وزیرمتن (لوکال) · lucide-react
