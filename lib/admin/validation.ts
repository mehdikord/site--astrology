import { z } from "zod";
import { normalizeDigits } from "@/lib/admin/utils";
import { parseJalaliDateTime } from "@/lib/jalali";

/** متن اجباری (فاصله‌های اضافه حذف می‌شوند) */
export const requiredText = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .min(1, { error: `${label} الزامی است.` })
    .max(max, { error: `${label} نباید بیشتر از ${max} کاراکتر باشد.` });

/** متن اختیاری — رشته‌ی خالی به null تبدیل می‌شود */
export const optionalText = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} نباید بیشتر از ${max} کاراکتر باشد.` })
    .transform((v) => v || null);

const toNumberString = (v: unknown) => normalizeDigits(String(v ?? "")).replace(/[,٬\s]/g, "");

/** عدد صحیح نامنفی اجباری (ارقام فارسی و جداکننده‌ی هزارگان پذیرفته می‌شود) */
export const requiredInt = (label: string, max = 4_000_000_000) =>
  z.preprocess(
    toNumberString,
    z
      .string()
      .min(1, { error: `${label} الزامی است.` })
      .regex(/^\d+$/, { error: `${label} باید عدد باشد.` })
      .transform(Number)
      .refine((n) => n <= max, { error: `${label} بیش از حد مجاز است.` }),
  );

/** عدد صحیح نامنفی اختیاری */
export const optionalInt = (label: string, max = 4_000_000_000) =>
  z.preprocess(
    toNumberString,
    z
      .string()
      .regex(/^\d*$/, { error: `${label} باید عدد باشد.` })
      .transform((v) => (v ? Number(v) : null))
      .refine((n) => n === null || n <= max, { error: `${label} بیش از حد مجاز است.` }),
  );

/** لیست JSON از input مخفی ویرایشگر لیست */
export const jsonOf = <T extends z.ZodType>(item: T) =>
  z.preprocess((v) => {
    try {
      return JSON.parse(String(v || "[]"));
    } catch {
      return [];
    }
  }, z.array(item));

export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === "1", z.boolean());

/** اولین خطای هر فیلد */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}

/** FormData → شیء ساده (برای ورودی zod) */
export const formObject = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));

/** خواندن فیلد تاریخ و ساعت شمسی (JalaliDateTimeInput) از فرم */
export function formDateTime(fd: FormData, name: string, label: string): { value: Date | null; error?: string } {
  const date = String(fd.get(`${name}__date`) ?? "").trim();
  const time = String(fd.get(`${name}__time`) ?? "").trim();
  if (!date) return time ? { value: null, error: `برای ${label} تاریخ را هم انتخاب کنید.` } : { value: null };
  const value = parseJalaliDateTime(time ? `${date} ${time}` : date);
  return value ? { value } : { value: null, error: `${label} معتبر نیست.` };
}

/** آدرس اینترنتی اختیاری (http/https) */
export const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(500, { error: `${label} بیش از حد طولانی است.` })
    .refine((v) => !v || /^https?:\/\/\S+$/i.test(v) || v.startsWith("/"), { error: `${label} باید با http:// یا https:// شروع شود.` })
    .transform((v) => v || null);
