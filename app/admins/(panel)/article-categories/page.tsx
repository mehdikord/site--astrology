import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { AdminPageHeader, EmptyState } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { parseId, strParam } from "@/lib/admin/utils";
import { toFa } from "@/lib/format";
import CategoryForm from "./CategoryForm";
import { deleteCategoryAction, saveCategoryAction } from "../articles/actions";

export const metadata: Metadata = { title: "دسته‌بندی مقالات" };

export default async function ArticleCategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const editId = parseId(strParam(sp.edit));

  const categories = await db.articleCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { articles: true } } },
  });
  const editing = editId ? categories.find((c) => c.id === editId) : undefined;

  return (
    <>
      <AdminPageHeader
        title="دسته‌بندی مقالات"
        crumbs={[{ label: "مقالات", href: "/admins/articles/" }, { label: "دسته‌بندی‌ها" }]}
        actions={
          <Link href="/admins/articles/" className="adm-btn adm-btn-secondary">
            <Newspaper className="h-4 w-4" />
            مقالات
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="adm-card overflow-hidden xl:col-span-2">
          {categories.length === 0 ? (
            <EmptyState title="دسته‌بندی‌ای ثبت نشده" description="از فرم کنار صفحه اولین دسته‌بندی را بسازید." />
          ) : (
            <div className="overflow-x-auto">
              <table className="adm-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>مقالات</th>
                    <th>ترتیب</th>
                    <th>وضعیت</th>
                    <th className="text-end">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => {
                    const id = c.id.toString();
                    return (
                      <tr key={id} className={editing?.id === c.id ? "bg-gold-500/[0.05]" : ""}>
                        <td>
                          <div className="font-medium text-cream">{c.name}</div>
                          <div className="text-xs text-muted" dir="ltr">/blog/category/{c.slug}</div>
                        </td>
                        <td>
                          <Link href={`/admins/articles/?category=${id}`} className="adm-badge adm-badge-muted hover:text-cream">{toFa(c._count.articles)} مقاله</Link>
                        </td>
                        <td className="text-xs text-muted">{toFa(c.sortOrder)}</td>
                        <td><span className={`adm-badge ${c.isActive ? "adm-badge-success" : "adm-badge-muted"}`}>{c.isActive ? "فعال" : "غیرفعال"}</span></td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admins/article-categories/?edit=${id}`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <ConfirmAction
                              action={deleteCategoryAction.bind(null, id)}
                              title="حذف دسته‌بندی؟"
                              description={<>دسته‌بندی <b className="text-cream">«{c.name}»</b> حذف می‌شود و {toFa(c._count.articles)} مقاله‌ی آن بدون دسته‌بندی می‌مانند.</>}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <CategoryForm
            key={editing?.id.toString() ?? `new-${categories.length}`}
            editing={Boolean(editing)}
            action={saveCategoryAction.bind(null, editing ? editing.id.toString() : null)}
            values={{
              name: editing?.name ?? "",
              slug: editing?.slug ?? "",
              description: editing?.description ?? "",
              isActive: editing?.isActive ?? true,
              sortOrder: String(editing?.sortOrder ?? categories.length + 1),
            }}
          />
        </div>
      </div>
    </>
  );
}
