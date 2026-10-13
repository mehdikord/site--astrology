import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { parseBlocks } from "@/lib/content";
import { currentJalaliYear, faDate, formatJalaliDateTime } from "@/lib/jalali";
import { formatNumber } from "@/lib/format";
import ArticleForm, { type ArticleFormValues } from "../ArticleForm";
import { deleteArticleAction, updateArticleAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش مقاله" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = parseId(id);
  if (!articleId) notFound();

  const [a, categories] = await Promise.all([
    db.article.findUnique({ where: { id: articleId }, include: { author: { select: { name: true } } } }),
    db.articleCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, name: true } }),
  ]);
  if (!a) notFound();

  const values: ArticleFormValues = {
    title: a.title,
    slug: a.slug,
    articleCategoryId: a.articleCategoryId?.toString() ?? "",
    excerpt: a.excerpt ?? "",
    content: parseBlocks(a.content).map((b) => (b.type === "ul" ? { type: "ul", text: b.items.join("\n") } : { type: b.type, text: b.text })),
    image: a.image,
    status: a.status,
    publishedAt: formatJalaliDateTime(a.publishedAt),
    isFeatured: a.isFeatured,
    readTime: String(a.readTime || ""),
    metaTitle: a.metaTitle ?? "",
    metaDescription: a.metaDescription ?? "",
  };
  const live = a.status === "published" && a.publishedAt && a.publishedAt <= new Date();

  return (
    <>
      <AdminPageHeader
        title={a.title}
        description={`نویسنده: ${a.author?.name ?? "—"} · ایجاد: ${faDate(a.createdAt)} · ${formatNumber(a.views)} بازدید`}
        crumbs={[{ label: "مقالات", href: "/admins/articles/" }, { label: "ویرایش" }]}
        actions={
          <>
            {live && (
              <a href={`/blog/${a.slug}/`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary">
                <ExternalLink className="h-4 w-4" />
                مشاهده
              </a>
            )}
            <ConfirmAction
              action={deleteArticleAction.bind(null, id, "/admins/articles/")}
              title="حذف مقاله؟"
              description={<>مقاله‌ی <b className="text-cream">«{a.title}»</b> حذف می‌شود.</>}
              triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              trigger={<><Trash2 className="h-4 w-4" />حذف</>}
            />
          </>
        }
      />
      <ArticleForm
        key={a.updatedAt.getTime()}
        action={updateArticleAction.bind(null, id)}
        values={values}
        categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
        submitLabel="ذخیره‌ی تغییرات"
        maxYear={currentJalaliYear()}
      />
    </>
  );
}
