/**
 * تعریف تنظیمات سایت (جدول settings به‌صورت key/value).
 * مقدار پیش‌فرض هر کلید وقتی استفاده می‌شود که در دیتابیس مقداری ثبت نشده باشد.
 */
export type SettingField = {
  key: string;
  label: string;
  group: SettingGroup;
  default: string;
  type?: "text" | "textarea" | "url" | "email" | "ltr";
  hint?: string;
};

export type SettingGroup = "general" | "contact" | "social" | "stats";

export const SETTING_GROUPS: { key: SettingGroup; title: string; description: string }[] = [
  { key: "general", title: "اطلاعات کلی", description: "نام برند، شعار و توضیحات سئو" },
  { key: "contact", title: "اطلاعات تماس", description: "در فوتر، صفحه‌ی تماس و دکمه‌ها نمایش داده می‌شود" },
  { key: "social", title: "شبکه‌های اجتماعی و سفارش", description: "لینک‌ها خالی بمانند، آیکنشان نمایش داده نمی‌شود" },
  { key: "stats", title: "آمار صفحه‌ی اصلی", description: "سه عدد نمایش‌داده‌شده در بخش هیرو و درباره‌ی ما" },
];

export const SETTING_FIELDS: SettingField[] = [
  { key: "site_name", label: "نام سایت", group: "general", default: "کژال متد" },
  { key: "site_name_en", label: "نام انگلیسی", group: "general", default: "KAZHAL METHOD", type: "ltr" },
  { key: "site_tagline", label: "شعار", group: "general", default: "همسو با مسیر حقیقی‌ات" },
  {
    key: "site_description",
    label: "توضیحات سایت",
    group: "general",
    type: "textarea",
    hint: "در فوتر و توضیحات متای صفحات استفاده می‌شود.",
    default:
      "کژال متد؛ تحلیل تخصصی ماتریکس سرنوشت، دشا و آسترولوژی ماه تولد. نقشه‌ی آسمانِ لحظه‌ی تولدت را بخوان و مسیر آگاهانه‌تری بساز.",
  },
  { key: "site_url", label: "آدرس سایت", group: "general", default: "https://kazhalmethod.com", type: "url" },

  { key: "phone", label: "شماره تماس (نمایشی)", group: "contact", default: "۰۹۱۲ ۰۰۰ ۰۰۰۰", hint: "همان‌طور که در سایت نمایش داده می‌شود." },
  { key: "phone_raw", label: "شماره تماس بین‌المللی", group: "contact", default: "989120000000", type: "ltr", hint: "بدون + و صفر — برای لینک تماس (مثال: 989121234567)." },
  { key: "email", label: "ایمیل", group: "contact", default: "hello@kazhalmethod.com", type: "email" },
  { key: "address", label: "آدرس", group: "contact", default: "تهران، ایران — جلسات به‌صورت آنلاین" },
  { key: "hours", label: "ساعات پاسخگویی", group: "contact", default: "شنبه تا پنجشنبه، ۱۰ تا ۱۸" },

  { key: "instagram", label: "اینستاگرام", group: "social", default: "https://instagram.com/", type: "url" },
  { key: "telegram", label: "تلگرام", group: "social", default: "https://t.me/", type: "url" },
  { key: "whatsapp", label: "واتس‌اپ", group: "social", default: "https://wa.me/989120000000", type: "url" },
  { key: "youtube", label: "یوتیوب", group: "social", default: "", type: "url" },
  {
    key: "order_url",
    label: "لینک ثبت سفارش",
    group: "social",
    default: "https://t.me",
    type: "url",
    hint: "دکمه‌های «ثبت سفارش» به این لینک (تلگرام یا واتس‌اپ) با پیام آماده هدایت می‌شوند.",
  },

  { key: "stat_1_value", label: "آمار ۱ — مقدار", group: "stats", default: "+۱۲۰۰" },
  { key: "stat_1_label", label: "آمار ۱ — عنوان", group: "stats", default: "تحلیل انجام‌شده" },
  { key: "stat_2_value", label: "آمار ۲ — مقدار", group: "stats", default: "+۸" },
  { key: "stat_2_label", label: "آمار ۲ — عنوان", group: "stats", default: "سال تجربه" },
  { key: "stat_3_value", label: "آمار ۳ — مقدار", group: "stats", default: "۴.۹" },
  { key: "stat_3_label", label: "آمار ۳ — عنوان", group: "stats", default: "امتیاز رضایت" },
];
