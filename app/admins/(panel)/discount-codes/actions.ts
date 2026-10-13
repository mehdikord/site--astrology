"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { parseId, setFlash, uniqueViolation, type FormState } from "@/lib/admin/utils";
import { checkbox, fieldErrors, formDateTime, formObject, optionalInt, requiredInt } from "@/lib/admin/validation";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, { error: "کد باید حداقل ۳ کاراکتر باشد." })
      .max(50, { error: "کد نباید بیشتر از ۵۰ کاراکتر باشد." })
      .regex(/^[A-Z0-9_-]+$/, { error: "کد فقط می‌تواند شامل حروف انگلیسی، عدد، - و _ باشد." }),
    type: z.enum(["percent", "fixed"], { error: "نوع تخفیف معتبر نیست." }),
    value: requiredInt("مقدار تخفیف"),
    maxDiscount: optionalInt("سقف تخفیف"),
    minAmount: optionalInt("حداقل مبلغ سفارش"),
    usageLimit: optionalInt("سقف تعداد استفاده"),
    isActive: checkbox,
  })
  .superRefine((d, ctx) => {
    if (d.value < 1) ctx.addIssue({ code: "custom", path: ["value"], message: "مقدار تخفیف باید بیشتر از صفر باشد." });
    if (d.type === "percent" && d.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد." });
  });

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = schema.safeParse(formObject(formData));
  const startsAt = formDateTime(formData, "startsAt", "زمان شروع");
  const expiresAt = formDateTime(formData, "expiresAt", "زمان پایان");
  const errors = {
    ...(parsed.success ? {} : fieldErrors(parsed.error)),
    ...(startsAt.error ? { startsAt: startsAt.error } : {}),
    ...(expiresAt.error ? { expiresAt: expiresAt.error } : {}),
  };
  if (!errors.expiresAt && startsAt.value && expiresAt.value && expiresAt.value <= startsAt.value) {
    errors.expiresAt = "زمان پایان باید بعد از زمان شروع باشد.";
  }
  if (!parsed.success || Object.keys(errors).length) return { ok: false, errors };

  const d = parsed.data;
  const data = {
    code: d.code,
    type: d.type,
    value: d.value,
    maxDiscount: d.type === "percent" ? d.maxDiscount : null,
    minAmount: d.minAmount,
    usageLimit: d.usageLimit,
    startsAt: startsAt.value,
    expiresAt: expiresAt.value,
    isActive: d.isActive,
  };

  try {
    if (id) await db.discountCode.update({ where: { id }, data });
    else await db.discountCode.create({ data });
  } catch (err) {
    if (uniqueViolation(err)) return { ok: false, errors: { code: "این کد قبلاً ثبت شده است." } };
    throw err;
  }

  revalidatePath("/admins/discount-codes/");
  await setFlash("success", id ? "کد تخفیف ویرایش شد." : `کد تخفیف ${d.code} ساخته شد.`);
  redirect("/admins/discount-codes/");
}

export async function createDiscountAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateDiscountAction(id: string, _prev: FormState, formData: FormData) {
  const did = parseId(id);
  if (!did) return { ok: false, message: "شناسه معتبر نیست." };
  return save(did, formData);
}

export async function deleteDiscountAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const did = parseId(id);
  const code = did && (await db.discountCode.findUnique({ where: { id: did }, select: { code: true } }));
  if (!did || !code) return { ok: false, message: "این کد قبلاً حذف شده است." };
  await db.discountCode.delete({ where: { id: did } });
  revalidatePath("/admins/discount-codes/");
  await setFlash("success", `کد تخفیف ${code.code} حذف شد.`);
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}

export async function toggleDiscountAction(id: string): Promise<void> {
  await requireAdmin();
  const did = parseId(id);
  const code = did && (await db.discountCode.findUnique({ where: { id: did }, select: { isActive: true } }));
  if (!did || !code) return;
  await db.discountCode.update({ where: { id: did }, data: { isActive: !code.isActive } });
  revalidatePath("/admins/discount-codes/");
}
