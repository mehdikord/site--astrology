"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import { deleteUpload, formFile, saveImage, validateImage } from "@/lib/admin/uploads";
import { isForeignKeyViolation, parseId, setFlash, slugify, uniqueViolation, type FormState } from "@/lib/admin/utils";
import { checkbox, fieldErrors, formObject, jsonOf, optionalInt, optionalText, requiredInt, requiredText } from "@/lib/admin/validation";
import { SERVICE_ICONS } from "./constants";

const schema = z
  .object({
    title: requiredText("عنوان"),
    titleEn: optionalText("عنوان انگلیسی"),
    slug: optionalText("نامک"),
    icon: z.enum(SERVICE_ICONS.map((i) => i.value) as [string, ...string[]], { error: "آیکن انتخاب‌شده معتبر نیست." }),
    tagline: optionalText("شعار"),
    shortDescription: optionalText("توضیح کوتاه", 1000),
    intro: optionalText("معرفی", 20000),
    price: requiredInt("قیمت"),
    oldPrice: optionalInt("قیمت قبل از تخفیف"),
    duration: optionalText("مدت / حجم"),
    format: optionalText("نحوه‌ی ارائه"),
    delivery: optionalText("زمان تحویل"),
    forWho: jsonOf(z.string().trim().min(1).max(500)),
    deliverables: jsonOf(z.string().trim().min(1).max(500)),
    requirements: jsonOf(z.string().trim().min(1).max(500)),
    steps: jsonOf(z.object({ title: z.string().trim().max(255), description: z.string().trim().max(2000) })),
    isActive: checkbox,
    sortOrder: optionalInt("ترتیب نمایش", 100000),
    metaTitle: optionalText("عنوان سئو"),
    metaDescription: optionalText("توضیح سئو", 500),
  })
  .superRefine((d, ctx) => {
    if (d.oldPrice !== null && d.oldPrice <= d.price) {
      ctx.addIssue({ code: "custom", path: ["oldPrice"], message: "قیمت قبل از تخفیف باید بیشتر از قیمت فعلی باشد." });
    }
    if (d.steps.some((s) => !s.title)) {
      ctx.addIssue({ code: "custom", path: ["steps"], message: "عنوان همه‌ی مراحل را وارد کنید." });
    }
  });

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = schema.safeParse(formObject(formData));
  const image = formFile(formData, "image");
  const imageError = validateImage(image);
  if (!parsed.success || imageError) {
    return { ok: false, errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(imageError ? { image: imageError } : {}) } };
  }

  const d = parsed.data;
  const slug = slugify(d.slug || d.titleEn || d.title);
  if (!slug) return { ok: false, errors: { slug: "نامک معتبر نیست." } };

  const current = id ? await db.service.findUnique({ where: { id }, select: { image: true } }) : null;
  if (id && !current) return { ok: false, message: "این خدمت پیدا نشد؛ ممکن است حذف شده باشد." };

  let imageUrl = current?.image ?? null;
  const removeImage = formData.get("image_remove") === "1";
  if (image) imageUrl = await saveImage(image, "services");
  else if (removeImage) imageUrl = null;

  const data = {
    title: d.title,
    titleEn: d.titleEn,
    slug,
    icon: d.icon,
    tagline: d.tagline,
    shortDescription: d.shortDescription,
    intro: d.intro,
    image: imageUrl,
    price: d.price,
    oldPrice: d.oldPrice,
    duration: d.duration,
    format: d.format,
    delivery: d.delivery,
    forWho: d.forWho,
    deliverables: d.deliverables,
    requirements: d.requirements,
    isActive: d.isActive,
    sortOrder: d.sortOrder ?? 0,
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
  };
  const steps = d.steps.map((s, i) => ({ title: s.title, description: s.description || null, sortOrder: i + 1 }));

  let savedId: bigint;
  try {
    if (id) {
      await db.$transaction([
        db.service.update({ where: { id }, data }),
        db.serviceStep.deleteMany({ where: { serviceId: id } }),
        db.serviceStep.createMany({ data: steps.map((s) => ({ ...s, serviceId: id })) }),
      ]);
      savedId = id;
    } else {
      const created = await db.service.create({ data: { ...data, steps: { create: steps } } });
      savedId = created.id;
    }
  } catch (err) {
    if (image && imageUrl) await deleteUpload(imageUrl);
    if (uniqueViolation(err)) return { ok: false, errors: { slug: "این نامک قبلاً برای خدمت دیگری استفاده شده است." } };
    throw err;
  }

  // تصویر قبلی پس از جایگزینی/حذف پاک می‌شود
  if (current?.image && current.image !== imageUrl) await deleteUpload(current.image);

  revalidateSite();
  await setFlash("success", id ? "تغییرات خدمت ذخیره شد." : "خدمت جدید با موفقیت ایجاد شد.");
  redirect(id ? `/admins/services/${savedId}/` : "/admins/services/");
}

export async function createServiceAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateServiceAction(id: string, _prev: FormState, formData: FormData) {
  const serviceId = parseId(id);
  if (!serviceId) return { ok: false, message: "شناسه‌ی خدمت معتبر نیست." };
  return save(serviceId, formData);
}

export async function deleteServiceAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const serviceId = parseId(id);
  if (!serviceId) return { ok: false, message: "شناسه‌ی خدمت معتبر نیست." };

  const service = await db.service.findUnique({ where: { id: serviceId }, select: { image: true, title: true } });
  if (!service) return { ok: false, message: "این خدمت قبلاً حذف شده است." };

  try {
    await db.service.delete({ where: { id: serviceId } });
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      return { ok: false, message: "برای این خدمت درخواست تحلیل ثبت شده و قابل حذف نیست؛ به‌جای حذف، آن را غیرفعال کنید." };
    }
    throw err;
  }
  await deleteUpload(service.image);

  revalidateSite();
  await setFlash("success", `خدمت «${service.title}» حذف شد.`);
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}

export async function toggleServiceAction(id: string): Promise<void> {
  await requireAdmin();
  const serviceId = parseId(id);
  if (!serviceId) return;
  const service = await db.service.findUnique({ where: { id: serviceId }, select: { isActive: true } });
  if (!service) return;
  await db.service.update({ where: { id: serviceId }, data: { isActive: !service.isActive } });
  revalidateSite();
}
