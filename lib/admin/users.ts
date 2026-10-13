import { db } from "@/lib/db";
import { MOBILE_RE, normalizeMobile } from "@/lib/admin/utils";

/** پیدا کردن کاربر با موبایل یا ساختن او (برای ثبت دستی سفارش و درخواست) */
export async function findOrCreateUser(rawMobile: string, name: string | null) {
  const mobile = normalizeMobile(rawMobile);
  if (!MOBILE_RE.test(mobile)) return { ok: false, error: "شماره موبایل معتبر نیست (مثال: 09121234567)." } as const;
  const existing = await db.user.findUnique({ where: { mobile } });
  if (existing) {
    if (!existing.name && name) await db.user.update({ where: { id: existing.id }, data: { name } });
    return { ok: true, user: existing, created: false } as const;
  }
  const user = await db.user.create({ data: { mobile, name } });
  return { ok: true, user, created: true } as const;
}
