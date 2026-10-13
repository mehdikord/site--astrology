"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import { parseId, setFlash, type FormState } from "@/lib/admin/utils";
import { fieldErrors, formObject, optionalInt, requiredText } from "@/lib/admin/validation";

const schema = z.object({
  serviceId: z.string().regex(/^\d*$/, { error: "خدمت انتخاب‌شده معتبر نیست." }),
  question: requiredText("سوال", 500),
  answer: requiredText("پاسخ", 5000),
  sortOrder: optionalInt("ترتیب نمایش", 100000),
});

/** مقصد بعد از ذخیره: لیست سوالات همان خدمت */
const listUrl = (serviceId: bigint | null) => (serviceId ? `/admins/faqs/?service=${serviceId}` : "/admins/faqs/?service=general");

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = schema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const serviceId = d.serviceId ? BigInt(d.serviceId) : null;
  if (serviceId && !(await db.service.findUnique({ where: { id: serviceId }, select: { id: true } }))) {
    return { ok: false, errors: { serviceId: "خدمت انتخاب‌شده وجود ندارد." } };
  }

  // اگر ترتیب وارد نشده، سوال در انتهای لیست قرار می‌گیرد
  let sortOrder = d.sortOrder;
  if (sortOrder === null) {
    const last = await db.serviceFaq.aggregate({ where: { serviceId }, _max: { sortOrder: true } });
    sortOrder = (last._max.sortOrder ?? 0) + 1;
  }

  const data = { serviceId, question: d.question, answer: d.answer, sortOrder };

  if (id) {
    const exists = await db.serviceFaq.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return { ok: false, message: "این سوال پیدا نشد؛ ممکن است حذف شده باشد." };
    await db.serviceFaq.update({ where: { id }, data });
  } else {
    await db.serviceFaq.create({ data });
  }

  revalidateSite();
  await setFlash("success", id ? "سوال ویرایش شد." : "سوال جدید اضافه شد.");
  redirect(listUrl(serviceId));
}

export async function createFaqAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateFaqAction(id: string, _prev: FormState, formData: FormData) {
  const faqId = parseId(id);
  if (!faqId) return { ok: false, message: "شناسه‌ی سوال معتبر نیست." };
  return save(faqId, formData);
}

export async function deleteFaqAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const faqId = parseId(id);
  const faq = faqId && (await db.serviceFaq.findUnique({ where: { id: faqId }, select: { serviceId: true } }));
  if (!faqId || !faq) return { ok: false, message: "این سوال قبلاً حذف شده است." };

  await db.serviceFaq.delete({ where: { id: faqId } });
  revalidateSite();
  await setFlash("success", "سوال حذف شد.");
  if (redirectTo) redirect(listUrl(faq.serviceId));
  return { ok: true };
}

/** جابه‌جایی یک سوال با سوال قبلی/بعدی در همان گروه */
export async function moveFaqAction(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const faqId = parseId(id);
  if (!faqId) return;
  const faq = await db.serviceFaq.findUnique({ where: { id: faqId } });
  if (!faq) return;

  const siblings = await db.serviceFaq.findMany({
    where: { serviceId: faq.serviceId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = siblings.findIndex((s) => s.id === faqId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= siblings.length) return;

  [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
  await db.$transaction(siblings.map((s, i) => db.serviceFaq.update({ where: { id: s.id }, data: { sortOrder: i + 1 } })));
  revalidateSite();
}
