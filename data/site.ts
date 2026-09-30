/**
 * تنظیمات کلی سایت — همه‌ی اطلاعات تماس و برند از این فایل خوانده می‌شود.
 * برای مشتری فقط همین فایل را ویرایش کنید.
 */
export const site = {
  name: "فاطمه یوسفی",
  nameEn: "FATEMEH YOUSEFI",
  tagline: "همسو با مسیر حقیقی‌ات",
  description:
    "فاطمه یوسفی؛ تحلیل تخصصی ماتریکس سرنوشت، دشا و آسترولوژی ماه تولد. نقشه‌ی آسمانِ لحظه‌ی تولدت را بخوان و مسیر آگاهانه‌تری بساز.",
  url: "https://fatemehyousefi.com",

  // اطلاعات تماس
  phone: "۰۹۱۲ ۰۰۰ ۰۰۰۰",
  phoneRaw: "989120000000",
  email: "hello@fatemehyousefi.com",
  address: "تهران، ایران — جلسات به‌صورت آنلاین",
  hours: "شنبه تا پنجشنبه، ۱۰ تا ۱۸",

  // شبکه‌های اجتماعی
  instagram: "https://instagram.com/fatemehyousefi",
  telegram: "https://t.me/fatemehyousefi",
  whatsapp: "https://wa.me/989120000000",
  youtube: "",

  // لینک ثبت سفارش / خرید (تلگرام، واتس‌اپ یا درگاه پرداخت)
  orderUrl: "https://t.me/fatemehyousefi",
};

export const nav = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/blog", label: "مقالات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

/** لینک سفارش با پیام آماده */
export function orderLink(subject: string) {
  const text = encodeURIComponent(`سلام، برای «${subject}» می‌خواهم سفارش ثبت کنم.`);
  if (site.orderUrl.includes("wa.me")) return `${site.orderUrl}?text=${text}`;
  if (site.orderUrl.includes("t.me")) return `${site.orderUrl}?text=${text}`;
  return site.orderUrl;
}

export const stats = [
  { value: "+۱۲۰۰", label: "تحلیل انجام‌شده" },
  { value: "+۸", label: "سال تجربه" },
  { value: "۴.۹", label: "امتیاز رضایت" },
];

export const testimonials = [
  {
    name: "نگار م.",
    service: "تحلیل ماتریکس",
    text: "فکر می‌کردم یک متن کلی می‌گیرم، ولی گزارش دقیقاً درباره‌ی الگوهایی بود که سال‌ها در روابطم تکرار می‌شد. جلسه‌ی توضیح واقعاً روشنگر بود.",
  },
  {
    name: "سینا ر.",
    service: "تحلیل دشا",
    text: "زمان‌بندی دوره‌ها به‌شکل عجیبی با اتفاقات چند سال اخیرم هم‌خوانی داشت. حالا می‌دانم دو سال آینده روی چه چیزی تمرکز کنم.",
  },
  {
    name: "الهام ک.",
    service: "دوره‌ی جامع ماتریکس",
    text: "ساده، منظم و بدون پیچیدگی اضافه. بعد از دوره توانستم برای خودم و اطرافیانم چارت بخوانم و این برایم خیلی ارزشمند است.",
  },
];
