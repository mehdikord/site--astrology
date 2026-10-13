"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import { deleteUpload, formFile, saveImage, validateImage } from "@/lib/admin/uploads";
import { parseId, setFlash, slugify, uniqueViolation, type FormState } from "@/lib/admin/utils";
import { checkbox, fieldErrors, formDateTime, formObject, optionalInt, optionalText, requiredText } from "@/lib/admin/validation";
import { parseBlocks } from "@/lib/content";

const schema = z.object({
  title: requiredText("عنوان"),
  slug: optionalText("نامک"),
  articleCategoryId: z.string().regex(/^\d*$/, { error: "دسته‌بندی معتبر نیست." }),
  excerpt: optionalText("خلاصه", 1000),
  content: z.string().max(500_000, { error: "محتوا بیش از حد طولانی است." }),
  status: z.enum(["draft", "published"], { error: "وضعیت معتبر نیست." }),
  isFeatured: checkbox,
  readTime: optionalInt("زمان مطالعه", 600),
  metaTitle: optionalText("عنوان سئو"),
  metaDescription: optionalText("توضیح سئو", 500),
});

async function save(id: bigint | null, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const parsed = schema.safeParse({ status: "draft", content: "[]", articleCategoryId: "", ...formObject(formData) });
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
  const blocks = parseBlocks(d.content);
  if (d.status === "published" && blocks.length === 0) return { ok: false, errors: { content: "برای انتشار، محتوای مقاله را وارد کنید." } };

  const slug = slugify(d.slug || d.title);
  if (!slug) return { ok: false, errors: { slug: "نامک معتبر نیست." } };

  const categoryId = d.articleCategoryId ? BigInt(d.articleCategoryId) : null;
  if (categoryId && !(await db.articleCategory.findUnique({ where: { id: categoryId }, select: { id: true } }))) {
    return { ok: false, errors: { articleCategoryId: "دسته‌بندی انتخاب‌شده وجود ندارد." } };
  }

  const current = id ? await db.article.findUnique({ where: { id }, select: { image: true, publishedAt: true } }) : null;
  if (id && !current) return { ok: false, message: "این مقاله پیدا نشد؛ ممکن است حذف شده باشد." };

  let imageUrl = current?.image ?? null;
  if (image) imageUrl = await saveImage(image, "articles");
  else if (formData.get("image_remove") === "1") imageUrl = null;

  // زمان مطالعه: اگر وارد نشده باشد از تعداد کلمات (۲۰۰ کلمه در دقیقه)
  const words = blocks.reduce((n, b) => n + ("items" in b ? b.items.join(" ") : b.text).split(/\s+/).filter(Boolean).length, 0);
  const readTime = d.readTime || Math.max(1, Math.round(words / 200));
  // انتشار بدون تاریخ = همین حالا
  // (ثانیه گرد به پایین؛ MySQL کسر ثانیه را به بالا گرد می‌کند و مقاله چند لحظه «آینده» حساب می‌شد)
  const now = new Date(Math.floor(Date.now() / 1000) * 1000);
  const publishDate = publishedAt.value ?? (d.status === "published" ? (current?.publishedAt ?? now) : null);

  const data = {
    title: d.title,
    slug,
    articleCategoryId: categoryId,
    excerpt: d.excerpt,
    content: JSON.stringify(blocks),
    image: imageUrl,
    status: d.status,
    publishedAt: publishDate,
    isFeatured: d.isFeatured,
    readTime,
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
  };

  let articleId: bigint;
  try {
    articleId = id
      ? (await db.article.update({ where: { id }, data })).id
      : (await db.article.create({ data: { ...data, adminId: BigInt(admin.id) } })).id;
  } catch (err) {
    if (image && imageUrl) await deleteUpload(imageUrl);
    if (uniqueViolation(err)) return { ok: false, errors: { slug: "این نامک قبلاً برای مقاله‌ی دیگری استفاده شده است." } };
    throw err;
  }
  if (current?.image && current.image !== imageUrl) await deleteUpload(current.image);

  revalidateSite();
  await setFlash("success", id ? "تغییرات مقاله ذخیره شد." : d.status === "published" ? "مقاله منتشر شد." : "پیش‌نویس مقاله ذخیره شد.");
  redirect(`/admins/articles/${articleId}/`);
}

export async function createArticleAction(_prev: FormState, formData: FormData) {
  return save(null, formData);
}

export async function updateArticleAction(id: string, _prev: FormState, formData: FormData) {
  const articleId = parseId(id);
  if (!articleId) return { ok: false, message: "شناسه‌ی مقاله معتبر نیست." };
  return save(articleId, formData);
}

export async function deleteArticleAction(id: string, redirectTo?: string): Promise<FormState> {
  await requireAdmin();
  const articleId = parseId(id);
  const article = articleId && (await db.article.findUnique({ where: { id: articleId }, select: { title: true, image: true } }));
  if (!articleId || !article) return { ok: false, message: "این مقاله قبلاً حذف شده است." };

  await db.article.delete({ where: { id: articleId } });
  await deleteUpload(article.image);
  revalidateSite();
  await setFlash("success", `مقاله‌ی «${article.title}» حذف شد.`);
  if (redirectTo) redirect(redirectTo);
  return { ok: true };
}

// ─── دسته‌بندی‌ها ───

const categorySchema = z.object({
  name: requiredText("نام"),
  slug: optionalText("نامک"),
  description: optionalText("توضیح", 1000),
  isActive: checkbox,
  sortOrder: optionalInt("ترتیب نمایش", 100000),
});

export async function saveCategoryAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const categoryId = id ? parseId(id) : null;
  if (id && !categoryId) return { ok: false, message: "شناسه‌ی دسته‌بندی معتبر نیست." };

  const parsed = categorySchema.safeParse(formObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  if (!slug) return { ok: false, errors: { slug: "نامک معتبر نیست." } };

  const data = { name: d.name, slug, description: d.description, isActive: d.isActive, sortOrder: d.sortOrder ?? 0 };
  try {
    if (categoryId) await db.articleCategory.update({ where: { id: categoryId }, data });
    else await db.articleCategory.create({ data });
  } catch (err) {
    if (uniqueViolation(err)) return { ok: false, errors: { slug: "این نامک قبلاً استفاده شده است." } };
    throw err;
  }

  revalidateSite();
  await setFlash("success", categoryId ? "دسته‌بندی ویرایش شد." : "دسته‌بندی جدید اضافه شد.");
  redirect("/admins/article-categories/");
}

export async function deleteCategoryAction(id: string): Promise<FormState> {
  await requireAdmin();
  const categoryId = parseId(id);
  const cat = categoryId && (await db.articleCategory.findUnique({ where: { id: categoryId }, select: { name: true } }));
  if (!categoryId || !cat) return { ok: false, message: "این دسته‌بندی قبلاً حذف شده است." };
  await db.articleCategory.delete({ where: { id: categoryId } });
  revalidateSite();
  await setFlash("success", `دسته‌بندی «${cat.name}» حذف شد.`);
  redirect("/admins/article-categories/");
}
