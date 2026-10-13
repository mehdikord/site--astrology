"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import { deleteUpload, formFile, saveImage, validateImage } from "@/lib/admin/uploads";
import { findOrCreateUser } from "@/lib/admin/users";
import { parseId, setFlash, slugify, uniqueViolation, type FormState } from "@/lib/admin/utils";
import {
  checkbox, fieldErrors, formDateTime, formObject, jsonOf, optionalInt, optionalText, optionalUrl, requiredInt, requiredText,
} from "@/lib/admin/validation";

const lesson = z.object({
  id: z.string().optional(),
  title: z.string().trim().max(255),
  description: z.string().trim().max(5000).default(""),
  videoUrl: z.string().trim().max(500).default(""),
  attachment: z.string().trim().max(500).default(""),
  minutes: z.string().default(""),
  isFree: z.boolean().default(false),
});
const chapter = z.object({
  id: z.string().optional(),
  title: z.string().trim().max(255),
  description: z.string().trim().max(5000).default(""),
  lessons: z.array(lesson).default([]),
});

const listItem = z.string().trim().min(1).max(500);

const schema = z
  .object({
    title: requiredText("عنوان"),
    slug: optionalText("نامک"),
    subtitle: optionalText("زیرعنوان"),
    shortDescription: optionalText("توضیح کوتاه", 1000),
    intro: optionalText("معرفی", 20000),
    introVideo: optionalUrl("لینک ویدیوی معرفی"),
    level: optionalText("سطح"),
    hours: optionalInt("مدت (ساعت)", 10000),
    sessionsCount: optionalInt("تعداد جلسات", 10000),
    format: optionalText("نحوه‌ی ارائه"),
    price: requiredInt("قیمت"),
    oldPrice: optionalInt("قیمت قبل از تخفیف"),
    badge: optionalText("برچسب", 100),
    learn: jsonOf(listItem),
    forWho: jsonOf(listItem),
    includes: jsonOf(listItem),
    curriculum: jsonOf(chapter),
    isActive: checkbox,
    sortOrder: optionalInt("ترتیب نمایش", 100000),
    metaTitle: optionalText("عنوان سئو"),
    metaDescription: optionalText("توضیح سئو", 500),
  })
  .superRefine((d, ctx) => {
    if (d.oldPrice !== null && d.oldPrice <= d.price) {
      ctx.addIssue({ code: "custom", path: ["oldPrice"], message: "قیمت قبل از تخفیف باید بیشتر از قیمت فعلی باشد." });
    }
    for (const c of d.curriculum) {
      if (!c.title) ctx.addIssue({ code: "custom", path: ["curriculum"], message: "عنوان همه‌ی سرفصل‌ها را وارد کنید." });
      if (c.lessons.some((l) => !l.title)) ctx.addIssue({ code: "custom", path: ["curriculum"], message: "عنوان همه‌ی درس‌ها را وارد کنید." });
      if (c.lessons.some((l) => l.minutes && !/^\d{1,4}$/.test(l.minutes.trim()))) {
        ctx.addIssue({ code: "custom", path: ["curriculum"], message: "مدت درس‌ها باید عدد (دقیقه) باشد." });
      }
    }
  });

type Curriculum = z.infer<typeof chapter>[];

/** همگام‌سازی سرفصل‌ها و درس‌ها با حفظ شناسه‌ها (تا پیشرفت کاربران در درس‌ها از بین نرود) */
async function syncCurriculum(courseId: bigint, curriculum: Curriculum) {
  await db.$transaction(async (tx) => {
    const existingChapters = await tx.courseChapter.findMany({ where: { courseId }, select: { id: true } });
    const chapterIds = new Set(existingChapters.map((c) => c.id.toString()));
    const existingLessons = await tx.courseLesson.findMany({ where: { chapter: { courseId } }, select: { id: true } });
    const lessonIds = new Set(existingLessons.map((l) => l.id.toString()));

    const keptChapters: bigint[] = [];
    const keptLessons: bigint[] = [];

    for (const [ci, c] of curriculum.entries()) {
      const data = { title: c.title, description: c.description || null, sortOrder: ci + 1 };
      const chapterId =
        c.id && chapterIds.has(c.id)
          ? (await tx.courseChapter.update({ where: { id: BigInt(c.id) }, data })).id
          : (await tx.courseChapter.create({ data: { ...data, courseId } })).id;
      keptChapters.push(chapterId);

      for (const [li, l] of c.lessons.entries()) {
        const minutes = l.minutes.trim() ? Number(l.minutes.trim()) : null;
        const lessonData = {
          courseChapterId: chapterId,
          title: l.title,
          description: l.description || null,
          videoUrl: l.videoUrl || null,
          attachment: l.attachment || null,
          duration: minutes !== null ? minutes * 60 : null,
          isFree: l.isFree,
          sortOrder: li + 1,
        };
        const lessonId =
          l.id && lessonIds.has(l.id)
            ? (await tx.courseLesson.update({ where: { id: BigInt(l.id) }, data: lessonData })).id
            : (await tx.courseLesson.create({ data: lessonData })).id;
        keptLessons.push(lessonId);
      }
    }

    await tx.courseLesson.deleteMany({ where: { chapter: { courseId }, id: { notIn: keptLessons } } });
    await tx.courseChapter.deleteMany({ where: { courseId, id: { notIn: keptChapters } } });
  });
}

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = schema.safeParse(formObject(formData));
  const image = formFile(formData, "image");
  const imageError = validateImage(image);
  const publishedAt = formDateTime(formData, "publishedAt", "تاریخ انتشار");
  const errors = {
    ...(parsed.success ? {} : fieldErrors(parsed.error)),
    ...(imageError ? { image: imageError } : {}),
    ...(publishedAt.error ? { publishedAt: publishedAt.error } : {}),
  };
  if (!parsed.success || Object.keys(errors).length) return { ok: false, errors };

  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, errors: { slug: "نامک معتبر نیست." } };

  const current = id ? await db.course.findUnique({ where: { id }, select: { image: true } }) : null;
  if (id && !current) return { ok: false, message: "این دوره پیدا نشد؛ ممکن است حذف شده باشد." };

  let imageUrl = current?.image ?? null;
  if (image) imageUrl = await saveImage(image, "courses");
  else if (formData.get("image_remove") === "1") imageUrl = null;

  const data = {
    title: d.title,
    slug,
    subtitle: d.subtitle,
    shortDescription: d.shortDescription,
    intro: d.intro,
    introVideo: d.introVideo,
    image: imageUrl,
    level: d.level,
    hours: d.hours ?? 0,
    sessionsCount: d.sessionsCount ?? 0,
    format: d.format,
    price: d.price,
    oldPrice: d.oldPrice,
    badge: d.badge,
    learn: d.learn,
    forWho: d.forWho,
    includes: d.includes,
    isActive: d.isActive,
    sortOrder: d.sortOrder ?? 0,
    publishedAt: publishedAt.value,
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
  };

  let courseId: bigint;
  try {
    courseId = id ? (await db.course.update({ where: { id }, data })).id : (await db.course.create({ data })).id;
  } catch (err) {
    if (image && imageUrl) await deleteUpload(imageUrl);
    if (uniqueViolation(err)) return { ok: false, errors: { slug: "این نامک قبلاً برای دوره‌ی دیگری استفاده شده است." } };
    throw err;
  }
  await syncCurriculum(courseId, d.curriculum);
  if (current?.image && current.image !== imageUrl) await deleteUpload(current.image);

  revalidateSite();
  await setFlash("success", id ? "تغییرات دوره ذخیره شد." : "دوره‌ی جدید ایجاد شد.");
  redirect(id ? `/admins/courses/${courseId}/` : "/admins/courses/");
}

export async function createCourseAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateCourseAction(id: string, _prev: FormState, formData: FormData) {
  const courseId = parseId(id);
  if (!courseId) return { ok: false, message: "شناسه‌ی دوره معتبر نیست." };
  return save(courseId, formData);
}

export async function deleteCourseAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const courseId = parseId(id);
  const course = courseId && (await db.course.findUnique({ where: { id: courseId }, include: { _count: { select: { enrollments: true } } } }));
  if (!courseId || !course) return { ok: false, message: "این دوره قبلاً حذف شده است." };
  if (course._count.enrollments > 0) {
    return { ok: false, message: "این دوره دانشجو دارد و حذف آن دسترسی خریداران را از بین می‌برد؛ به‌جای حذف، آن را غیرفعال کنید." };
  }

  await db.course.delete({ where: { id: courseId } });
  await deleteUpload(course.image);
  revalidateSite();
  await setFlash("success", `دوره‌ی «${course.title}» حذف شد.`);
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}

export async function toggleCourseAction(id: string): Promise<void> {
  await requireAdmin();
  const courseId = parseId(id);
  const course = courseId && (await db.course.findUnique({ where: { id: courseId }, select: { isActive: true } }));
  if (!courseId || !course) return;
  await db.course.update({ where: { id: courseId }, data: { isActive: !course.isActive } });
  revalidateSite();
}

// ─── دانشجویان (دسترسی به دوره) ───

const grantSchema = z.object({
  mobile: requiredText("شماره موبایل", 20),
  name: optionalText("نام"),
});

export async function grantAccessAction(courseIdRaw: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const courseId = parseId(courseIdRaw);
  if (!courseId) return { ok: false, message: "شناسه‌ی دوره معتبر نیست." };

  const parsed = grantSchema.safeParse(formObject(formData));
  const expires = formDateTime(formData, "expiresAt", "تاریخ انقضا");
  if (!parsed.success || expires.error) {
    return { ok: false, errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(expires.error ? { expiresAt: expires.error } : {}) } };
  }

  const result = await findOrCreateUser(parsed.data.mobile, parsed.data.name);
  if (!result.ok) return { ok: false, errors: { mobile: result.error } };

  await db.courseEnrollment.upsert({
    where: { userId_courseId: { userId: result.user.id, courseId } },
    update: { isActive: true, expiresAt: expires.value },
    create: { userId: result.user.id, courseId, source: "admin", expiresAt: expires.value },
  });

  revalidatePath(`/admins/courses/${courseId}/students/`);
  await setFlash("success", `دسترسی ${result.user.name || result.user.mobile} به دوره فعال شد${result.created ? " (کاربر جدید ساخته شد)" : ""}.`);
  redirect(`/admins/courses/${courseId}/students/`);
}

export async function toggleEnrollmentAction(id: string): Promise<void> {
  await requireAdmin();
  const enrollmentId = parseId(id);
  const e = enrollmentId && (await db.courseEnrollment.findUnique({ where: { id: enrollmentId } }));
  if (!enrollmentId || !e) return;
  await db.courseEnrollment.update({ where: { id: enrollmentId }, data: { isActive: !e.isActive } });
  revalidatePath(`/admins/courses/${e.courseId}/students/`);
}

export async function deleteEnrollmentAction(id: string): Promise<FormState> {
  await requireAdmin();
  const enrollmentId = parseId(id);
  const e = enrollmentId && (await db.courseEnrollment.findUnique({ where: { id: enrollmentId } }));
  if (!enrollmentId || !e) return { ok: false, message: "این دسترسی قبلاً حذف شده است." };
  await db.courseEnrollment.delete({ where: { id: enrollmentId } });
  revalidatePath(`/admins/courses/${e.courseId}/students/`);
  await setFlash("success", "دسترسی کاربر به دوره حذف شد.");
  return { ok: true };
}
