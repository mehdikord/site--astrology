"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteUpload, formFile, saveImage, validateImage } from "@/lib/admin/uploads";
import { MOBILE_RE, isForeignKeyViolation, normalizeMobile, parseId, setFlash, uniqueViolation, type FormState } from "@/lib/admin/utils";
import { fieldErrors, formObject, optionalText } from "@/lib/admin/validation";
import { parseJalali } from "@/lib/jalali";

const schema = z.object({
  name: optionalText("نام", 255),
  mobile: z
    .string()
    .transform(normalizeMobile)
    .pipe(z.string().min(1, { error: "شماره موبایل الزامی است." }).regex(MOBILE_RE, { error: "شماره موبایل معتبر نیست (مثال: 09121234567)." })),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(255, { error: "ایمیل بیش از حد طولانی است." })
    .refine((v) => !v || z.email().safeParse(v).success, { error: "ایمیل معتبر نیست." })
    .transform((v) => v || null),
  bio: optionalText("بیو", 2000),
  birthDate: z
    .string()
    .trim()
    .refine((v) => !v || parseJalali(v) !== null, { error: "تاریخ تولد معتبر نیست." })
    .refine((v) => !v || (parseJalali(v) as Date) <= new Date(), { error: "تاریخ تولد نمی‌تواند در آینده باشد." })
    .transform((v) => (v ? parseJalali(v) : null)),
  gender: z.enum(["", "male", "female"], { error: "جنسیت معتبر نیست." }).transform((v) => v || null),
});

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = schema.safeParse({ name: "", email: "", bio: "", birthDate: "", gender: "", mobile: "", ...formObject(formData) });
  const avatar = formFile(formData, "avatar");
  const avatarError = validateImage(avatar);
  if (!parsed.success || avatarError) {
    return { ok: false, errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(avatarError ? { avatar: avatarError } : {}) } };
  }
  const d = parsed.data;

  const current = id ? await db.user.findUnique({ where: { id }, select: { avatar: true } }) : null;
  if (id && !current) return { ok: false, message: "این کاربر پیدا نشد؛ ممکن است حذف شده باشد." };

  let avatarUrl = current?.avatar ?? null;
  if (avatar) avatarUrl = await saveImage(avatar, "users");
  else if (formData.get("avatar_remove") === "1") avatarUrl = null;

  const data = { ...d, avatar: avatarUrl };

  let savedId: bigint;
  try {
    savedId = id ? (await db.user.update({ where: { id }, data })).id : (await db.user.create({ data })).id;
  } catch (err) {
    if (avatar && avatarUrl) await deleteUpload(avatarUrl);
    const fields = uniqueViolation(err);
    if (fields) {
      const errors: Record<string, string> = {};
      if (fields.some((f) => f.includes("mobile"))) errors.mobile = "این شماره موبایل قبلاً برای کاربر دیگری ثبت شده است.";
      if (fields.some((f) => f.includes("email"))) errors.email = "این ایمیل قبلاً برای کاربر دیگری ثبت شده است.";
      return { ok: false, errors: Object.keys(errors).length ? errors : { mobile: "اطلاعات تکراری است." } };
    }
    throw err;
  }

  if (current?.avatar && current.avatar !== avatarUrl) await deleteUpload(current.avatar);

  revalidatePath("/admins/users/");
  await setFlash("success", id ? "اطلاعات کاربر ذخیره شد." : "کاربر جدید ایجاد شد.");
  redirect(`/admins/users/${savedId}/`);
}

export async function createUserAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateUserAction(id: string, _prev: FormState, formData: FormData) {
  const userId = parseId(id);
  if (!userId) return { ok: false, message: "شناسه‌ی کاربر معتبر نیست." };
  return save(userId, formData);
}

export async function deleteUserAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const userId = parseId(id);
  const user = userId && (await db.user.findUnique({ where: { id: userId }, select: { avatar: true, name: true, mobile: true } }));
  if (!userId || !user) return { ok: false, message: "این کاربر قبلاً حذف شده است." };

  try {
    await db.user.delete({ where: { id: userId } });
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return { ok: false, message: "این کاربر سفارش یا تراکنش مالی ثبت‌شده دارد و برای حفظ سوابق مالی قابل حذف نیست." };
    }
    throw err;
  }
  await deleteUpload(user.avatar);

  revalidatePath("/admins/users/");
  await setFlash("success", `کاربر «${user.name || user.mobile}» حذف شد.`);
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}
