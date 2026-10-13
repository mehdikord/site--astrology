"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import { deleteUpload, formFile, saveImage, validateImage } from "@/lib/admin/uploads";
import { isForeignKeyViolation, parseId, setFlash, type FormState } from "@/lib/admin/utils";
import { checkbox, fieldErrors, formObject, optionalInt, optionalText, requiredText } from "@/lib/admin/validation";

const schema = z.object({
  name: requiredText("نام", 255),
  subtitle: optionalText("عنوان زیر نام", 255),
  content: requiredText("متن نظر", 3000),
  rating: z.preprocess((v) => Number(v || 5), z.number().int().min(1, { error: "امتیاز باید بین ۱ تا ۵ باشد." }).max(5, { error: "امتیاز باید بین ۱ تا ۵ باشد." })),
  related: z.string().regex(/^((service|course):\d+)?$/, { error: "مورد مرتبط معتبر نیست." }),
  isActive: checkbox,
  sortOrder: optionalInt("ترتیب نمایش", 100000),
});

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = schema.safeParse({ related: "", ...formObject(formData) });
  const avatar = formFile(formData, "avatar");
  const avatarError = validateImage(avatar);
  if (!parsed.success || avatarError) {
    return { ok: false, errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(avatarError ? { avatar: avatarError } : {}) } };
  }
  const d = parsed.data;
  const [kind, relId] = d.related ? d.related.split(":") : [null, null];

  const current = id ? await db.testimonial.findUnique({ where: { id }, select: { avatar: true } }) : null;
  if (id && !current) return { ok: false, message: "این نظر پیدا نشد؛ ممکن است حذف شده باشد." };

  let avatarUrl = current?.avatar ?? null;
  if (avatar) avatarUrl = await saveImage(avatar, "testimonials");
  else if (formData.get("avatar_remove") === "1") avatarUrl = null;

  const data = {
    name: d.name,
    subtitle: d.subtitle,
    content: d.content,
    rating: d.rating,
    avatar: avatarUrl,
    isActive: d.isActive,
    sortOrder: d.sortOrder ?? 0,
    serviceId: kind === "service" ? BigInt(relId!) : null,
    courseId: kind === "course" ? BigInt(relId!) : null,
  };

  try {
    if (id) await db.testimonial.update({ where: { id }, data });
    else await db.testimonial.create({ data });
  } catch (err) {
    if (avatar && avatarUrl) await deleteUpload(avatarUrl);
    if (isForeignKeyViolation(err)) return { ok: false, errors: { related: "مورد مرتبط انتخاب‌شده وجود ندارد." } };
    throw err;
  }
  if (current?.avatar && current.avatar !== avatarUrl) await deleteUpload(current.avatar);

  revalidateSite();
  await setFlash("success", id ? "نظر ویرایش شد." : "نظر جدید اضافه شد.");
  redirect("/admins/testimonials/");
}

export async function createTestimonialAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateTestimonialAction(id: string, _prev: FormState, formData: FormData) {
  const tid = parseId(id);
  if (!tid) return { ok: false, message: "شناسه معتبر نیست." };
  return save(tid, formData);
}

export async function deleteTestimonialAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const tid = parseId(id);
  const t = tid && (await db.testimonial.findUnique({ where: { id: tid }, select: { avatar: true } }));
  if (!tid || !t) return { ok: false, message: "این نظر قبلاً حذف شده است." };
  await db.testimonial.delete({ where: { id: tid } });
  await deleteUpload(t.avatar);
  revalidateSite();
  await setFlash("success", "نظر حذف شد.");
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}

export async function toggleTestimonialAction(id: string): Promise<void> {
  await requireAdmin();
  const tid = parseId(id);
  const t = tid && (await db.testimonial.findUnique({ where: { id: tid }, select: { isActive: true } }));
  if (!tid || !t) return;
  await db.testimonial.update({ where: { id: tid }, data: { isActive: !t.isActive } });
  revalidateSite();
}
