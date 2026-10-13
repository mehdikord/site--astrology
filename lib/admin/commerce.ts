import { db } from "@/lib/db";
import type { DiscountCode, OrderStatus } from "@/lib/generated/prisma/client";
import { dateToJalali } from "@/lib/jalali";

/** شماره‌ی فاکتور: سال و ماه شمسی + عدد تصادفی، مثل 140507-48213 */
export async function generateOrderNumber(): Promise<string> {
  const { jy, jm } = dateToJalali(new Date());
  for (let i = 0; i < 10; i++) {
    const n = `${jy}${String(jm).padStart(2, "0")}-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!(await db.order.findUnique({ where: { orderNumber: n }, select: { id: true } }))) return n;
  }
  return `${jy}${String(jm).padStart(2, "0")}-${Date.now().toString().slice(-8)}`;
}

/** محاسبه‌ی مبلغ تخفیف یک کد برای مبلغ فاکتور؛ پیام خطا در صورت نامعتبر بودن */
export function discountFor(code: DiscountCode, subtotal: number, now = new Date()): { amount: number } | { error: string } {
  if (!code.isActive) return { error: "این کد تخفیف غیرفعال است." };
  if (code.startsAt && code.startsAt > now) return { error: "زمان استفاده از این کد تخفیف هنوز شروع نشده است." };
  if (code.expiresAt && code.expiresAt < now) return { error: "این کد تخفیف منقضی شده است." };
  if (code.usageLimit !== null && code.usedCount >= code.usageLimit) return { error: "ظرفیت استفاده از این کد تخفیف تمام شده است." };
  if (code.minAmount !== null && subtotal < code.minAmount) return { error: "مبلغ فاکتور کمتر از حداقل مبلغ این کد تخفیف است." };

  let amount = code.type === "percent" ? Math.floor((subtotal * code.value) / 100) : code.value;
  if (code.maxDiscount !== null) amount = Math.min(amount, code.maxDiscount);
  return { amount: Math.min(amount, subtotal) };
}

export type PaymentInput = {
  gateway: string;
  referenceId: string | null;
  cardNumber: string | null;
  description: string | null;
  paidAt: Date;
};

/**
 * ثبت پرداخت سفارش: وضعیت پرداخت‌شده، تراکنش موفق، فعال‌سازی دسترسی دوره‌ها،
 * انتقال درخواست‌های تحلیل مرتبط به صف بررسی و افزایش شمارنده‌ی کد تخفیف — همه در یک تراکنش.
 */
export async function markOrderPaid(orderId: bigint, payment: PaymentInput) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status === "paid") throw new Error("ORDER_ALREADY_PAID");

    await tx.order.update({ where: { id: orderId }, data: { status: "paid", paidAt: payment.paidAt } });
    await tx.transaction.create({
      data: {
        userId: order.userId,
        orderId,
        amount: order.total,
        gateway: payment.gateway,
        referenceId: payment.referenceId,
        cardNumber: payment.cardNumber,
        description: payment.description,
        status: "success",
        paidAt: payment.paidAt,
      },
    });

    for (const item of order.items) {
      if (item.itemType !== "course" || !item.courseId) continue;
      await tx.courseEnrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: item.courseId } },
        update: { isActive: true, orderId, expiresAt: null },
        create: { userId: order.userId, courseId: item.courseId, orderId, source: "purchase" },
      });
    }

    await tx.analysisRequest.updateMany({ where: { orderId, status: "pending_payment" }, data: { status: "pending" } });
    if (order.discountCodeId) {
      await tx.discountCode.update({ where: { id: order.discountCodeId }, data: { usedCount: { increment: 1 } } });
    }
  });
}

/** تغییر وضعیت سفارش به لغو/ناموفق/مسترد و اعمال پیامدهای آن */
export async function changeOrderStatus(orderId: bigint, status: Exclude<OrderStatus, "paid">) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    const wasPaid = order.status === "paid";

    await tx.order.update({ where: { id: orderId }, data: { status, ...(status === "pending" ? { paidAt: null } : {}) } });

    if (wasPaid) {
      // دسترسی‌هایی که با این سفارش ایجاد شده‌اند غیرفعال می‌شوند
      await tx.courseEnrollment.updateMany({ where: { orderId }, data: { isActive: false } });
      if (order.discountCodeId) {
        await tx.discountCode.updateMany({ where: { id: order.discountCodeId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
      }
    }
    if (status === "canceled" || status === "refunded" || status === "failed") {
      await tx.analysisRequest.updateMany({ where: { orderId, status: { in: ["pending_payment", "pending"] } }, data: { status: "canceled" } });
    } else if (status === "pending") {
      await tx.analysisRequest.updateMany({ where: { orderId, status: "pending" }, data: { status: "pending_payment" } });
    }
  });
}
