/** بخش‌های تنظیمات سایت که در کامپوننت‌های کلاینت هم قابل استفاده‌اند (بدون وابستگی به دیتابیس) */

export type SiteSettings = {
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  url: string;
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  hours: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  youtube: string;
  orderUrl: string;
  stats: { value: string; label: string }[];
};

/** لینک سفارش با پیام آماده */
export function orderLink(site: Pick<SiteSettings, "orderUrl">, subject: string) {
  const text = encodeURIComponent(`سلام، برای «${subject}» می‌خواهم سفارش ثبت کنم.`);
  if (site.orderUrl.includes("wa.me") || site.orderUrl.includes("t.me")) {
    return `${site.orderUrl}${site.orderUrl.includes("?") ? "&" : "?"}text=${text}`;
  }
  return site.orderUrl;
}

export const nav = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/courses", label: "دوره‌ها" },
  { href: "/#date-converter", label: "تبدیل تاریخ" },
  { href: "/blog", label: "مقالات" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];
