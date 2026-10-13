"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { MOBILE_RE, normalizeMobile } from "@/lib/admin/utils";
import { fieldErrors, requiredText } from "@/lib/admin/validation";

export type ContactState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const schema = z.object({
  name: requiredText("نام", 255),
  contact: requiredText("راه تماس", 255),
  subject: z.string().trim().max(255).optional(),
  message: requiredText("پیام", 5000),
});

// محدودیت ارسال: حداکثر ۵ پیام در هر ۱۰ دقیقه برای هر IP
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) return true;
  hits.push(now);
  recent.set(ip, hits);
  return false;
}

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // فیلد مخفی برای ربات‌ها — اگر پر شده باشد، بی‌صدا نادیده گرفته می‌شود
  if (String(formData.get("website") ?? "")) return { ok: true, message: "پیامت دریافت شد." };

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    contact: formData.get("contact") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (rateLimited(ip)) return { ok: false, message: "تعداد پیام‌های ارسالی زیاد است؛ لطفاً چند دقیقه‌ی دیگر دوباره تلاش کن." };

  const d = parsed.data;
  // اگر راه تماس، موبایل یا ایمیل یک کاربر ثبت‌نام‌شده باشد، پیام به او متصل می‌شود
  const mobile = normalizeMobile(d.contact);
  const user = MOBILE_RE.test(mobile)
    ? await db.user.findUnique({ where: { mobile }, select: { id: true } })
    : d.contact.includes("@")
      ? await db.user.findUnique({ where: { email: d.contact.toLowerCase() }, select: { id: true } })
      : null;

  await db.contactMessage.create({
    data: { name: d.name, contact: d.contact, subject: d.subject || null, message: d.message, userId: user?.id ?? null },
  });

  return { ok: true, message: "پیامت با موفقیت ارسال شد. معمولاً ظرف ۲۴ ساعت پاسخ می‌دهیم." };
}
