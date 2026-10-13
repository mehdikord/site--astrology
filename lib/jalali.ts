import { toJalaali, toGregorian, isValidJalaaliDate, jalaaliMonthLength } from "jalaali-js";

export const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export type JalaliParts = { jy: number; jm: number; jd: number };

/** تاریخ (ستون DATE که به‌صورت نیمه‌شب UTC برمی‌گردد) → اجزای شمسی */
export function dateToJalali(date: Date): JalaliParts {
  return toJalaali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** اجزای شمسی → Date در نیمه‌شب UTC (مناسب ستون DATE) — برای تاریخ نامعتبر null */
export function jalaliToDate({ jy, jm, jd }: JalaliParts): Date | null {
  if (!isValidJalaaliDate(jy, jm, jd)) return null;
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return new Date(Date.UTC(gy, gm - 1, gd));
}

/** رشته‌ی 1370/05/20 → Date */
export function parseJalali(value: string): Date | null {
  const m = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  return m ? jalaliToDate({ jy: +m[1], jm: +m[2], jd: +m[3] }) : null;
}

/** Date → رشته‌ی 1370/05/20 */
export function formatJalaliInput(date: Date | null | undefined): string {
  if (!date) return "";
  const { jy, jm, jd } = dateToJalali(date);
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

export const monthLength = jalaaliMonthLength;

/** نمایش تاریخ/زمان به شمسی با ارقام فارسی (منطقه‌ی زمانی تهران) */
export function faDate(date: Date | null | undefined, withTime = false): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(date);
}

/** نمایش تاریخ ستون DATE (بدون جابه‌جایی منطقه‌ی زمانی) */
export function faDateOnly(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }).format(date);
}

/** زمان نسبی کوتاه: «۳ روز پیش» */
export function faRelative(date: Date): string {
  const diff = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  for (const [unit, sec] of units) if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
  return "همین الان";
}

// ─── تاریخ و ساعت (منطقه‌ی زمانی تهران، UTC+03:30 بدون ساعت تابستانی) ───

const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;

/** رشته‌ی «1405/07/21 14:30» (ساعت اختیاری، به وقت تهران) → Date */
export function parseJalaliDateTime(value: string): Date | null {
  const m = value.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (!m) return null;
  const day = jalaliToDate({ jy: +m[1], jm: +m[2], jd: +m[3] });
  if (!day) return null;
  const h = m[4] ? +m[4] : 0;
  const min = m[5] ? +m[5] : 0;
  if (h > 23 || min > 59) return null;
  return new Date(day.getTime() + (h * 60 + min) * 60000 - TEHRAN_OFFSET_MS);
}

/** Date → «1405/07/21 14:30» به وقت تهران */
export function formatJalaliDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  const local = new Date(date.getTime() + TEHRAN_OFFSET_MS);
  const { jy, jm, jd } = dateToJalali(local);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${jy}/${pad(jm)}/${pad(jd)} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}

/** سال جاری شمسی */
export const currentJalaliYear = () => dateToJalali(new Date(Date.now() + TEHRAN_OFFSET_MS)).jy;
