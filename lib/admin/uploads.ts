import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * فایل‌های آپلودی خارج از public ذخیره می‌شوند (فایل‌های اضافه‌شده به public بعد از build در next start سرو نمی‌شوند)
 * و از مسیر /uploads/... توسط app/uploads/[...path]/route.ts سرو می‌شوند.
 */
export const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");
export const UPLOAD_URL_PREFIX = "/uploads/";

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

/** اعتبارسنجی فایل تصویر؛ پیام خطا یا null */
export function validateImage(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!IMAGE_TYPES[file.type]) return "فرمت تصویر باید JPG، PNG، WEBP یا AVIF باشد.";
  if (file.size > MAX_IMAGE_SIZE) return "حجم تصویر نباید بیشتر از ۳ مگابایت باشد.";
  return null;
}

/** ذخیره‌ی تصویر و برگرداندن آدرس عمومی آن */
export async function saveImage(file: File, folder: "services" | "users" | "courses" | "articles" | "testimonials"): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  const name = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `${UPLOAD_URL_PREFIX}${folder}/${name}`;
}

/** حذف فایل آپلودی قبلی (فقط فایل‌های داخل storage/uploads) */
export async function deleteUpload(url: string | null | undefined) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return;
  const file = path.resolve(UPLOAD_ROOT, url.slice(UPLOAD_URL_PREFIX.length));
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return;
  await unlink(file).catch(() => {});
}

/** فایل آپلودی فرم (یا null اگر انتخاب نشده) */
export function formFile(formData: FormData, key: string): File | null {
  const v = formData.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}

// ─── فایل‌های خصوصی (گزارش تحلیل‌ها) — فقط از مسیر محافظت‌شده‌ی /admins/files قابل دریافت‌اند ───

export const PRIVATE_ROOT = path.join(process.cwd(), "storage", "private");
export const PRIVATE_URL_PREFIX = "/admins/files/";

const DOC_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  ...IMAGE_TYPES,
};
const MAX_DOC_SIZE = 20 * 1024 * 1024;

export function validateDocument(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!DOC_TYPES[file.type]) return "فرمت فایل باید PDF، ZIP یا تصویر باشد.";
  if (file.size > MAX_DOC_SIZE) return "حجم فایل نباید بیشتر از ۲۰ مگابایت باشد.";
  return null;
}

export async function savePrivateFile(file: File, folder: "reports"): Promise<string> {
  const ext = DOC_TYPES[file.type];
  const name = `${Date.now().toString(36)}-${crypto.randomUUID()}.${ext}`;
  const dir = path.join(PRIVATE_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `${PRIVATE_URL_PREFIX}${folder}/${name}`;
}

export async function deletePrivateFile(url: string | null | undefined) {
  if (!url?.startsWith(PRIVATE_URL_PREFIX)) return;
  const file = path.resolve(PRIVATE_ROOT, url.slice(PRIVATE_URL_PREFIX.length));
  if (!file.startsWith(PRIVATE_ROOT + path.sep)) return;
  await unlink(file).catch(() => {});
}
