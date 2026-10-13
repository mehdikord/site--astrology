"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearFailedLogins, loginLockRemaining, recordFailedLogin, startSession, verifyPassword } from "@/lib/admin/auth";
import { normalizeDigits, normalizeMobile, type FormState } from "@/lib/admin/utils";
import { toFa } from "@/lib/format";

// هش ساختگی برای یکسان ماندن زمان پاسخ وقتی کاربر وجود ندارد
const DUMMY_HASH = "$2b$12$6inWTj8C7L4Oupl/f83gDuEz49YBRir9BbR7dhhlkuCH7TfBpF/hG";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = normalizeDigits(String(formData.get("identifier") ?? "")).trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const next = String(formData.get("next") ?? "");

  const errors: Record<string, string> = {};
  if (!identifier) errors.identifier = "شماره موبایل یا ایمیل را وارد کنید.";
  if (!password) errors.password = "گذرواژه را وارد کنید.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const lockKey = `${ip}|${identifier}`;
  const lockedFor = loginLockRemaining(lockKey);
  if (lockedFor > 0) {
    return { ok: false, message: `تلاش‌های ناموفق زیاد بود. لطفاً ${toFa(lockedFor)} دقیقه‌ی دیگر دوباره امتحان کنید.` };
  }

  const isEmail = identifier.includes("@");
  const admin = await db.admin.findUnique({
    where: isEmail ? { email: identifier } : { mobile: normalizeMobile(identifier) },
  });
  const valid = await verifyPassword(password, admin?.password ?? DUMMY_HASH);

  if (!admin || !valid) {
    recordFailedLogin(lockKey);
    return { ok: false, message: "اطلاعات ورود صحیح نیست.", errors: { identifier: " ", password: " " } };
  }

  clearFailedLogins(lockKey);
  await startSession(admin, remember);
  redirect(next.startsWith("/admins/") && !next.startsWith("//") ? next : "/admins/");
}
