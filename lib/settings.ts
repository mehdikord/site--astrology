import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { SiteSettings } from "@/lib/site-config";
import { SETTING_FIELDS } from "@/lib/setting-fields";

export { nav, orderLink, type SiteSettings } from "@/lib/site-config";

/** مقادیر خام تنظیمات (پیش‌فرض + دیتابیس) */
export const getSettingValues = cache(async (): Promise<Record<string, string>> => {
  const values: Record<string, string> = Object.fromEntries(SETTING_FIELDS.map((f) => [f.key, f.default]));
  const rows = await db.setting.findMany({ where: { key: { in: SETTING_FIELDS.map((f) => f.key) } } });
  for (const r of rows) if (r.value !== null) values[r.key] = r.value;
  return values;
});

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const v = await getSettingValues();
  return {
    name: v.site_name,
    nameEn: v.site_name_en,
    tagline: v.site_tagline,
    description: v.site_description,
    url: v.site_url,
    phone: v.phone,
    phoneRaw: v.phone_raw,
    email: v.email,
    address: v.address,
    hours: v.hours,
    instagram: v.instagram,
    telegram: v.telegram,
    whatsapp: v.whatsapp,
    youtube: v.youtube,
    orderUrl: v.order_url,
    stats: [1, 2, 3]
      .map((i) => ({ value: v[`stat_${i}_value`], label: v[`stat_${i}_label`] }))
      .filter((s) => s.value || s.label),
  };
});
