"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { changeOrderStatus, discountFor, generateOrderNumber, markOrderPaid } from "@/lib/admin/commerce";
import { GATEWAYS } from "@/lib/admin/labels";
import { findOrCreateUser } from "@/lib/admin/users";
import { normalizeDigits, parseId, setFlash, type FormState } from "@/lib/admin/utils";
import { checkbox, fieldErrors, formDateTime, formObject, jsonOf, optionalText, requiredText } from "@/lib/admin/validation";

const paymentSchema = z.object({
  gateway: z.enum(Object.keys(GATEWAYS) as [string, ...string[]], { error: "روش پرداخت معتبر نیست." }),
  referenceId: optionalText("کد پیگیری", 255),
  cardNumber: z
    .string()
    .transform((v) => normalizeDigits(v).replace(/[\s-]/g, ""))
    .refine((v) => !v || /^[\d*]{4,19}$/.test(v), { error: "شماره کارت معتبر نیست." })
    .transform((v) => v || null),
  paymentNote: optionalText("توضیح پرداخت", 1000),
});

const createSchema = z.object({
  mobile: requiredText("شماره موبایل", 20),
  name: optionalText("نام"),
  items: jsonOf(z.string().regex(/^(course|service):\d+$/)),
  discountCode: z.string().trim().toUpperCase().max(50),
  description: optionalText("توضیحات", 2000),
  markPaid: checkbox,
});

export async function createOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = createSchema.safeParse({ discountCode: "", items: "[]", ...formObject(formData) });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  if (d.items.length === 0) return { ok: false, errors: { items: "حداقل یک دوره یا خدمت انتخاب کنید." } };

  const payment = d.markPaid ? paymentSchema.safeParse({ gateway: "manual", cardNumber: "", ...formObject(formData) }) : null;
  const paidAt = d.markPaid ? formDateTime(formData, "paidAt", "زمان پرداخت") : null;
  if (payment && !payment.success) return { ok: false, errors: fieldErrors(payment.error) };
  if (paidAt?.error) return { ok: false, errors: { paidAt: paidAt.error } };

  // اقلام با قیمت فعلی از دیتابیس خوانده می‌شوند
  const courseIds = d.items.filter((i) => i.startsWith("course:")).map((i) => BigInt(i.split(":")[1]));
  const serviceIds = d.items.filter((i) => i.startsWith("service:")).map((i) => BigInt(i.split(":")[1]));
  const [courses, services] = await Promise.all([
    db.course.findMany({ where: { id: { in: courseIds } } }),
    db.service.findMany({ where: { id: { in: serviceIds } } }),
  ]);
  const items = [
    ...courses.map((c) => ({ itemType: "course" as const, courseId: c.id, title: `دوره‌ی ${c.title}`, unitPrice: c.price })),
    ...services.map((s) => ({ itemType: "service" as const, serviceId: s.id, title: s.title, unitPrice: s.price })),
  ];
  if (items.length !== d.items.length) return { ok: false, errors: { items: "برخی از موارد انتخاب‌شده دیگر وجود ندارند." } };
  const subtotal = items.reduce((n, i) => n + i.unitPrice, 0);

  let discountCodeId: bigint | null = null;
  let discountAmount = 0;
  if (d.discountCode) {
    const code = await db.discountCode.findUnique({ where: { code: d.discountCode } });
    if (!code) return { ok: false, errors: { discountCode: "کد تخفیف پیدا نشد." } };
    const res = discountFor(code, subtotal);
    if ("error" in res) return { ok: false, errors: { discountCode: res.error } };
    discountCodeId = code.id;
    discountAmount = res.amount;
  }

  const userResult = await findOrCreateUser(d.mobile, d.name);
  if (!userResult.ok) return { ok: false, errors: { mobile: userResult.error } };

  // تخفیف به نسبت مبلغ بین اقلام تقسیم می‌شود
  let remaining = discountAmount;
  const itemRows = items.map((item, idx) => {
    const share = idx === items.length - 1 ? remaining : subtotal ? Math.floor((discountAmount * item.unitPrice) / subtotal) : 0;
    remaining -= share;
    return { ...item, quantity: 1, discount: share, total: item.unitPrice - share };
  });

  const order = await db.order.create({
    data: {
      userId: userResult.user.id,
      orderNumber: await generateOrderNumber(),
      subtotal,
      discountAmount,
      total: subtotal - discountAmount,
      discountCodeId,
      description: d.description,
      items: { create: itemRows },
    },
  });

  if (payment?.success) {
    await markOrderPaid(order.id, {
      gateway: payment.data.gateway,
      referenceId: payment.data.referenceId,
      cardNumber: payment.data.cardNumber,
      description: payment.data.paymentNote,
      paidAt: paidAt?.value ?? new Date(),
    });
  }

  revalidatePath("/admins/", "layout");
  await setFlash("success", `سفارش ${order.orderNumber} ثبت شد${payment?.success ? " و پرداخت آن تایید شد" : ""}.`);
  redirect(`/admins/orders/${order.id}/`);
}

export async function registerPaymentAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const orderId = parseId(id);
  if (!orderId) return { ok: false, message: "شناسه‌ی سفارش معتبر نیست." };

  const parsed = paymentSchema.safeParse({ cardNumber: "", ...formObject(formData) });
  const paidAt = formDateTime(formData, "paidAt", "زمان پرداخت");
  if (!parsed.success || paidAt.error) {
    return { ok: false, errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(paidAt.error ? { paidAt: paidAt.error } : {}) } };
  }

  try {
    await markOrderPaid(orderId, {
      gateway: parsed.data.gateway,
      referenceId: parsed.data.referenceId,
      cardNumber: parsed.data.cardNumber,
      description: parsed.data.paymentNote,
      paidAt: paidAt.value ?? new Date(),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_ALREADY_PAID") return { ok: false, message: "این سفارش قبلاً پرداخت شده است." };
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") return { ok: false, message: "سفارش پیدا نشد." };
    throw err;
  }

  revalidatePath("/admins/", "layout");
  await setFlash("success", "پرداخت ثبت شد؛ دسترسی دوره‌ها و درخواست‌های مرتبط فعال شدند.");
  redirect(`/admins/orders/${orderId}/`);
}

const STATUS_MESSAGES = {
  canceled: "سفارش لغو شد.",
  refunded: "سفارش به‌عنوان مسترد ثبت شد و دسترسی‌های آن غیرفعال شد.",
  failed: "سفارش ناموفق علامت خورد.",
  pending: "سفارش به حالت در انتظار پرداخت برگشت.",
} as const;

export async function changeOrderStatusAction(id: string, status: keyof typeof STATUS_MESSAGES): Promise<FormState> {
  await requireAdmin();
  const orderId = parseId(id);
  if (!orderId) return { ok: false, message: "شناسه‌ی سفارش معتبر نیست." };
  await changeOrderStatus(orderId, status);
  revalidatePath("/admins/", "layout");
  await setFlash("success", STATUS_MESSAGES[status]);
  return { ok: true };
}

export async function updateOrderNoteAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const orderId = parseId(id);
  if (!orderId) return { ok: false, message: "شناسه‌ی سفارش معتبر نیست." };
  const description = String(formData.get("description") ?? "").trim().slice(0, 2000) || null;
  await db.order.update({ where: { id: orderId }, data: { description } });
  revalidatePath(`/admins/orders/${orderId}/`);
  return { ok: true, message: "توضیحات ذخیره شد." };
}

export async function deleteOrderAction(id: string): Promise<FormState> {
  await requireAdmin();
  const orderId = parseId(id);
  const order = orderId && (await db.order.findUnique({ where: { id: orderId }, select: { status: true, orderNumber: true } }));
  if (!orderId || !order) return { ok: false, message: "این سفارش قبلاً حذف شده است." };
  if (order.status === "paid" || order.status === "refunded") {
    return { ok: false, message: "سفارش‌های پرداخت‌شده یا مسترد برای حفظ سوابق مالی قابل حذف نیستند؛ در صورت نیاز آن را لغو کنید." };
  }
  await db.order.delete({ where: { id: orderId } });
  revalidatePath("/admins/", "layout");
  await setFlash("success", `سفارش ${order.orderNumber} حذف شد.`);
  redirect("/admins/orders/");
}
