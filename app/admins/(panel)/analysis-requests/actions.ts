"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { generateOrderNumber } from "@/lib/admin/commerce";
import { deletePrivateFile, formFile, savePrivateFile, validateDocument } from "@/lib/admin/uploads";
import { findOrCreateUser } from "@/lib/admin/users";
import { parseId, setFlash, type FormState } from "@/lib/admin/utils";
import { checkbox, fieldErrors, formDateTime, formObject, optionalInt, optionalText, optionalUrl, requiredText } from "@/lib/admin/validation";
import { parseJalali } from "@/lib/jalali";

const STATUSES = ["pending_payment", "pending", "in_progress", "completed", "canceled"] as const;

const requestSchema = z.object({
  mobile: requiredText("شماره موبایل", 20),
  userName: optionalText("نام کاربر"),
  serviceId: z.string().regex(/^\d+$/, { error: "خدمت را انتخاب کنید." }),
  orderId: z.string().regex(/^\d*$/),
  fullName: requiredText("نام صاحب چارت"),
  gender: z.enum(["", "male", "female"]).transform((v) => v || null),
  birthDate: z
    .string()
    .trim()
    .min(1, { error: "تاریخ تولد الزامی است." })
    .refine((v) => parseJalali(v) !== null, { error: "تاریخ تولد معتبر نیست." }),
  birthTime: z
    .string()
    .trim()
    .refine((v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), { error: "ساعت تولد معتبر نیست." }),
  birthTimeAccuracy: z.enum(["exact", "approximate", "unknown"]),
  birthCity: optionalText("شهر محل تولد"),
  birthCountry: optionalText("کشور محل تولد"),
  questions: optionalText("سوال‌ها", 5000),
  status: z.enum(STATUSES),
  adminNote: optionalText("یادداشت مدیر", 5000),
  createOrder: checkbox,
});

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = requestSchema.safeParse({ gender: "", birthTime: "", orderId: "", status: "pending_payment", birthTimeAccuracy: "exact", ...formObject(formData) });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const service = await db.service.findUnique({ where: { id: BigInt(d.serviceId) } });
  if (!service) return { ok: false, errors: { serviceId: "خدمت انتخاب‌شده وجود ندارد." } };

  const userResult = await findOrCreateUser(d.mobile, d.userName ?? d.fullName);
  if (!userResult.ok) return { ok: false, errors: { mobile: userResult.error } };
  const userId = userResult.user.id;

  let orderId = d.orderId ? BigInt(d.orderId) : null;
  if (orderId && !(await db.order.findFirst({ where: { id: orderId, userId }, select: { id: true } }))) {
    return { ok: false, errors: { orderId: "این سفارش متعلق به این کاربر نیست." } };
  }

  // ایجاد فاکتور برای درخواست (اگر سفارشی متصل نیست)
  let status = d.status;
  if (!orderId && d.createOrder) {
    const order = await db.order.create({
      data: {
        userId,
        orderNumber: await generateOrderNumber(),
        subtotal: service.price,
        total: service.price,
        items: { create: { itemType: "service", serviceId: service.id, title: service.title, unitPrice: service.price, total: service.price } },
      },
    });
    orderId = order.id;
    if (status !== "canceled") status = "pending_payment";
  }

  const data = {
    userId,
    serviceId: service.id,
    orderId,
    fullName: d.fullName,
    gender: d.gender,
    birthDate: parseJalali(d.birthDate)!,
    birthTime: d.birthTime ? new Date(`1970-01-01T${d.birthTime}:00Z`) : null,
    birthTimeAccuracy: d.birthTimeAccuracy,
    birthCity: d.birthCity,
    birthCountry: d.birthCountry,
    questions: d.questions,
    status,
    adminNote: d.adminNote,
  };

  const saved = id ? await db.analysisRequest.update({ where: { id }, data }) : await db.analysisRequest.create({ data });

  revalidatePath("/admins/", "layout");
  await setFlash("success", id ? "درخواست ویرایش شد." : `درخواست تحلیل ثبت شد${d.createOrder && !d.orderId ? " و فاکتور آن صادر شد" : ""}.`);
  redirect(`/admins/analysis-requests/${saved.id}/`);
}

export async function createRequestAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateRequestAction(id: string, _prev: FormState, formData: FormData) {
  const rid = parseId(id);
  if (!rid) return { ok: false, message: "شناسه معتبر نیست." };
  return save(rid, formData);
}

const statusSchema = z.object({ status: z.enum(STATUSES), adminNote: optionalText("یادداشت", 5000) });

export async function updateRequestStatusAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const rid = parseId(id);
  if (!rid) return { ok: false, message: "شناسه معتبر نیست." };
  const parsed = statusSchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await db.analysisRequest.update({ where: { id: rid }, data: parsed.data });
  revalidatePath("/admins/", "layout");
  return { ok: true, message: "وضعیت درخواست به‌روز شد." };
}

const deliverySchema = z.object({
  title: optionalText("عنوان گزارش"),
  summary: optionalText("خلاصه‌ی تحلیل", 50000),
  sessionLink: optionalUrl("لینک جلسه"),
  sessionDuration: optionalInt("مدت جلسه", 600),
  delivered: checkbox,
});

/** ذخیره‌ی نتیجه‌ی تحلیل (گزارش، جلسه) و در صورت تحویل، تکمیل درخواست */
export async function saveAnalysisAction(requestId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const rid = parseId(requestId);
  if (!rid) return { ok: false, message: "شناسه معتبر نیست." };

  const parsed = deliverySchema.safeParse(formObject(formData));
  const file = formFile(formData, "reportFile");
  const fileError = validateDocument(file);
  const sessionAt = formDateTime(formData, "sessionAt", "زمان جلسه");
  if (!parsed.success || fileError || sessionAt.error) {
    return {
      ok: false,
      errors: {
        ...(parsed.success ? {} : fieldErrors(parsed.error)),
        ...(fileError ? { reportFile: fileError } : {}),
        ...(sessionAt.error ? { sessionAt: sessionAt.error } : {}),
      },
    };
  }
  const d = parsed.data;

  const current = await db.analysis.findUnique({ where: { analysisRequestId: rid } });
  let reportFile = current?.reportFile ?? null;
  if (file) reportFile = await savePrivateFile(file, "reports");
  else if (formData.get("reportFile_remove") === "1") reportFile = null;

  if (d.delivered && !reportFile && !d.summary) {
    return { ok: false, errors: { reportFile: "برای تحویل، فایل گزارش یا خلاصه‌ی تحلیل را وارد کنید." } };
  }

  const data = {
    title: d.title,
    summary: d.summary,
    reportFile,
    sessionAt: sessionAt.value,
    sessionLink: d.sessionLink,
    sessionDuration: d.sessionDuration,
    deliveredAt: d.delivered ? (current?.deliveredAt ?? new Date()) : null,
  };

  await db.$transaction([
    db.analysis.upsert({ where: { analysisRequestId: rid }, update: data, create: { ...data, analysisRequestId: rid, adminId: BigInt(admin.id) } }),
    db.analysisRequest.update({
      where: { id: rid },
      data: d.delivered ? { status: "completed" } : {},
    }),
  ]);
  if (current?.reportFile && current.reportFile !== reportFile) await deletePrivateFile(current.reportFile);

  revalidatePath("/admins/", "layout");
  await setFlash("success", d.delivered ? "تحلیل تحویل شد و درخواست تکمیل شد." : "اطلاعات تحلیل ذخیره شد.");
  redirect(`/admins/analysis-requests/${rid}/`);
}

export async function deleteRequestAction(id: string): Promise<FormState> {
  await requireAdmin();
  const rid = parseId(id);
  const r = rid && (await db.analysisRequest.findUnique({ where: { id: rid }, include: { analysis: true } }));
  if (!rid || !r) return { ok: false, message: "این درخواست قبلاً حذف شده است." };
  await db.analysisRequest.delete({ where: { id: rid } });
  await deletePrivateFile(r.analysis?.reportFile);
  revalidatePath("/admins/", "layout");
  await setFlash("success", "درخواست حذف شد.");
  redirect("/admins/analysis-requests/");
}
