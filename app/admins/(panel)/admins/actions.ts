"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, requireAdmin, startSession, verifyPassword } from "@/lib/admin/auth";
import { MOBILE_RE, normalizeMobile, parseId, setFlash, uniqueViolation, type FormState } from "@/lib/admin/utils";
import { fieldErrors, formObject, requiredText } from "@/lib/admin/validation";

const base = {
  name: requiredText("نام"),
  mobile: z.string().transform(normalizeMobile).pipe(z.string().regex(MOBILE_RE, { error: "شماره موبایل معتبر نیست (مثال: 09121234567)." })),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "ایمیل معتبر نیست." })),
};
const password = z.string().min(8, { error: "گذرواژه باید حداقل ۸ کاراکتر باشد." }).max(128, { error: "گذرواژه بیش از حد طولانی است." });

function uniqueErrors(err: unknown) {
  const fields = uniqueViolation(err);
  if (!fields) return null;
  const errors: Record<string, string> = {};
  if (fields.some((f) => f.includes("mobile"))) errors.mobile = "این شماره موبایل برای مدیر دیگری ثبت شده است.";
  if (fields.some((f) => f.includes("email"))) errors.email = "این ایمیل برای مدیر دیگری ثبت شده است.";
  return Object.keys(errors).length ? errors : { email: "اطلاعات تکراری است." };
}

export async function saveAdminAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const adminId = id ? parseId(id) : null;
  if (id && !adminId) return { ok: false, message: "شناسه معتبر نیست." };

  const schema = z
    .object({ ...base, password: adminId ? z.union([z.literal(""), password]) : password, passwordConfirm: z.string() })
    .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], error: "تکرار گذرواژه مطابقت ندارد." });
  const parsed = schema.safeParse({ password: "", passwordConfirm: "", ...formObject(formData) });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const data = { name: d.name, mobile: d.mobile, email: d.email, ...(d.password ? { password: await hashPassword(d.password) } : {}) };
  try {
    const saved = adminId ? await db.admin.update({ where: { id: adminId }, data }) : await db.admin.create({ data: { ...data, password: data.password! } });
    // اگر مدیر گذرواژه‌ی خودش را تغییر داد، نشست با گذرواژه‌ی جدید تمدید می‌شود
    if (adminId && saved.id.toString() === me.id && d.password) await startSession(saved, false);
  } catch (err) {
    const errors = uniqueErrors(err);
    if (errors) return { ok: false, errors };
    throw err;
  }

  revalidatePath("/admins/", "layout");
  await setFlash("success", adminId ? "اطلاعات مدیر ذخیره شد." : "مدیر جدید اضافه شد.");
  redirect("/admins/admins/");
}

export async function deleteAdminAction(id: string): Promise<FormState> {
  const me = await requireAdmin();
  const adminId = parseId(id);
  if (!adminId) return { ok: false, message: "شناسه معتبر نیست." };
  if (adminId.toString() === me.id) return { ok: false, message: "نمی‌توانید حساب خودتان را حذف کنید." };
  if ((await db.admin.count()) <= 1) return { ok: false, message: "حداقل یک مدیر باید وجود داشته باشد." };
  const admin = await db.admin.findUnique({ where: { id: adminId }, select: { name: true } });
  if (!admin) return { ok: false, message: "این مدیر قبلاً حذف شده است." };

  await db.admin.delete({ where: { id: adminId } });
  revalidatePath("/admins/admins/");
  await setFlash("success", `مدیر «${admin.name}» حذف شد.`);
  return { ok: true };
}

// ─── پروفایل من ───

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = z.object(base).safeParse(formObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  try {
    await db.admin.update({ where: { id: BigInt(me.id) }, data: parsed.data });
  } catch (err) {
    const errors = uniqueErrors(err);
    if (errors) return { ok: false, errors };
    throw err;
  }
  revalidatePath("/admins/", "layout");
  return { ok: true, message: "پروفایل به‌روز شد." };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const parsed = z
    .object({ current: z.string().min(1, { error: "گذرواژه‌ی فعلی را وارد کنید." }), password, passwordConfirm: z.string() })
    .refine((d) => d.password === d.passwordConfirm, { path: ["passwordConfirm"], error: "تکرار گذرواژه مطابقت ندارد." })
    .safeParse(formObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const admin = await db.admin.findUnique({ where: { id: BigInt(me.id) } });
  if (!admin || !(await verifyPassword(parsed.data.current, admin.password))) {
    return { ok: false, errors: { current: "گذرواژه‌ی فعلی صحیح نیست." } };
  }
  const updated = await db.admin.update({ where: { id: admin.id }, data: { password: await hashPassword(parsed.data.password) } });
  // نشست‌های دیگر (دستگاه‌های دیگر) باطل می‌شوند؛ نشست فعلی با گذرواژه‌ی جدید تمدید می‌شود
  await startSession(updated, false);
  return { ok: true, message: "گذرواژه تغییر کرد. نشست‌های دیگر شما خارج شدند." };
}
