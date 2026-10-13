"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { FormState } from "@/lib/admin/utils";
import { SETTING_FIELDS } from "@/lib/setting-fields";

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const errors: Record<string, string> = {};
  const values: Record<string, string> = {};
  for (const f of SETTING_FIELDS) {
    const v = String(formData.get(f.key) ?? "").trim();
    if (v.length > (f.type === "textarea" ? 2000 : 500)) errors[f.key] = `${f.label} بیش از حد طولانی است.`;
    else if (f.type === "url" && v && !/^https?:\/\/\S+$/i.test(v)) errors[f.key] = `${f.label} باید با http:// یا https:// شروع شود.`;
    else if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[f.key] = `${f.label} معتبر نیست.`;
    values[f.key] = v;
  }
  if (!values.site_name) errors.site_name = "نام سایت الزامی است.";
  if (!values.site_url) errors.site_url = "آدرس سایت الزامی است.";
  if (Object.keys(errors).length) return { ok: false, errors };

  await db.$transaction(
    SETTING_FIELDS.map((f) =>
      db.setting.upsert({
        where: { key: f.key },
        update: { value: values[f.key], group: f.group },
        create: { key: f.key, value: values[f.key], group: f.group },
      }),
    ),
  );

  revalidateSite();
  return { ok: true, message: "تنظیمات ذخیره شد و سایت به‌روز شد." };
}
