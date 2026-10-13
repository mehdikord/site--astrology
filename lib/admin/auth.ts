import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL, signSession, verifySession } from "@/lib/admin/session";

export { hashPassword, verifyPassword } from "@/lib/admin/password";

/** بخشی از هش گذرواژه که داخل توکن قرار می‌گیرد؛ با عوض شدن گذرواژه، توکن‌های قدیمی نامعتبر می‌شوند. */
const passwordFingerprint = (hash: string) => hash.slice(-16);

export type CurrentAdmin = { id: string; name: string; email: string; mobile: string };

/** مدیر واردشده‌ی فعلی (در هر درخواست یک بار از دیتابیس خوانده می‌شود) */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session || !/^\d+$/.test(session.sub)) return null;

  const admin = await db.admin.findUnique({ where: { id: BigInt(session.sub) } });
  if (!admin || passwordFingerprint(admin.password) !== session.pwd) return null;

  return { id: admin.id.toString(), name: admin.name, email: admin.email, mobile: admin.mobile };
});

/** در صفحات و اکشن‌های پنل: اگر نشست معتبر نیست، کوکی پاک و به صفحه‌ی ورود هدایت می‌شود. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admins/logout/");
  return admin;
}

export async function startSession(admin: { id: bigint; password: string }, remember: boolean) {
  const maxAge = remember ? SESSION_TTL.long : SESSION_TTL.short;
  const token = await signSession({ sub: admin.id.toString(), pwd: passwordFingerprint(admin.password) }, maxAge);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // بدون «مرا به خاطر بسپار» کوکی با بستن مرورگر حذف می‌شود
    ...(remember ? { maxAge } : {}),
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

// ─── محدودیت تلاش ناموفق ورود (در حافظه‌ی همان پروسه) ───

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; until: number }>();

export function loginLockRemaining(key: string): number {
  const entry = attempts.get(key);
  if (!entry || entry.until < Date.now()) return 0;
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((entry.until - Date.now()) / 60000) : 0;
}

export function recordFailedLogin(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.until < now) attempts.set(key, { count: 1, until: now + WINDOW_MS });
  else entry.count += 1;
}

export const clearFailedLogins = (key: string) => attempts.delete(key);
