import { cookies } from "next/headers";
import { Prisma } from "@/lib/generated/prisma/client";

/** وضعیت برگشتی اکشن‌های فرم */
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

/** تبدیل ارقام فارسی/عربی به انگلیسی */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** نرمال‌سازی شماره موبایل ایران به شکل 09xxxxxxxxx */
export function normalizeMobile(value: string): string {
  let v = normalizeDigits(value).replace(/[\s\-()]/g, "");
  if (v.startsWith("+98")) v = "0" + v.slice(3);
  else if (v.startsWith("0098")) v = "0" + v.slice(4);
  else if (v.startsWith("98") && v.length === 12) v = "0" + v.slice(2);
  else if (v.startsWith("9") && v.length === 10) v = "0" + v;
  return v;
}

export const MOBILE_RE = /^09\d{9}$/;

/** تبدیل متن به slug (حروف فارسی حفظ می‌شوند) */
export function slugify(value: string): string {
  return normalizeDigits(value)
    .trim()
    .toLowerCase()
    .replace(/[‌\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** تبدیل شناسه‌ی رشته‌ای مسیر به BigInt — برای شناسه‌ی نامعتبر null */
export function parseId(value: string | undefined | null): bigint | null {
  return value && /^\d{1,19}$/.test(value) ? BigInt(value) : null;
}

/** خطای نقض یکتایی پریزما — نام ستون‌ها یا ایندکس درگیر (مثلاً users_mobile_key) را برمی‌گرداند */
export function uniqueViolation(err: unknown): string[] | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const meta = err.meta as {
      target?: string[] | string;
      driverAdapterError?: { cause?: { constraint?: { fields?: string[]; index?: string } } };
    };
    const constraint = meta?.driverAdapterError?.cause?.constraint;
    const fields = constraint?.fields ?? constraint?.index ?? meta?.target;
    if (Array.isArray(fields)) return fields.map(String);
    if (typeof fields === "string") return [fields];
    return [];
  }
  return null;
}

/** خطای کلید خارجی (رکورد وابسته وجود دارد) */
export function isForeignKeyViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2003" || err.code === "P2014");
}

// ─── پیام‌های فلش (نمایش toast پس از redirect) ───

export const FLASH_COOKIE = "admin_flash";

export type Flash = { id: string; type: "success" | "error"; message: string };

export async function setFlash(type: Flash["type"], message: string) {
  const jar = await cookies();
  const value: Flash = { id: crypto.randomUUID(), type, message };
  jar.set(FLASH_COOKIE, encodeURIComponent(JSON.stringify(value)), { path: "/", maxAge: 30, sameSite: "lax" });
}

export async function readFlash(): Promise<Flash | null> {
  const jar = await cookies();
  const raw = jar.get(FLASH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Flash;
  } catch {
    return null;
  }
}

// ─── صفحه‌بندی ───

export const PER_PAGE = 15;

export function pageParam(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function strParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}
