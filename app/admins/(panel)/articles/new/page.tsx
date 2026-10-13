import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/ui";
import { currentJalaliYear } from "@/lib/jalali";
import ArticleForm, { emptyArticle } from "../ArticleForm";
import { createArticleAction } from "../actions";

export const metadata: Metadata = { title: "مقاله‌ی جدید" };

export default async function NewArticlePage() {
  const categories = await db.articleCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, name: true } });
  return (
    <>
      <AdminPageHeader title="مقاله‌ی جدید" crumbs={[{ label: "مقالات", href: "/admins/articles/" }, { label: "مقاله‌ی جدید" }]} />
      <ArticleForm
        action={createArticleAction}
        values={emptyArticle}
        categories={categories.map((c) => ({ id: c.id.toString(), name: c.name }))}
        submitLabel="ذخیره"
        maxYear={currentJalaliYear()}
      />
    </>
  );
}
