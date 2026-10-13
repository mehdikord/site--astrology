import type { Metadata } from "next";
import Link from "next/link";
import { Eye, ExternalLink, FolderTree, Pencil, Plus, Star } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { ARTICLE_STATUS, badge } from "@/lib/admin/labels";
import { PER_PAGE, pageParam, parseId, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { formatNumber, toFa } from "@/lib/format";
import { deleteArticleAction } from "./actions";

export const metadata: Metadata = { title: "مقالات" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ArticlesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const category = strParam(sp.category);
  const page = pageParam(sp.page);
  const categoryId = parseId(category);
  const now = new Date();

  const where: Prisma.ArticleWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }, { excerpt: { contains: q } }] } : {}),
    ...(status === "draft" ? { status: "draft" } : status === "published" ? { status: "published", publishedAt: { lte: now } } : status === "scheduled" ? { status: "published", publishedAt: { gt: now } } : {}),
    ...(category === "none" ? { articleCategoryId: null } : categoryId ? { articleCategoryId: categoryId } : {}),
  };

  const [total, articles, categories] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: [{ id: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { name: true } }, author: { select: { name: true } } },
    }),
    db.articleCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, name: true } }),
  ]);
  const filtered = Boolean(q || status || category);

  return (
    <>
      <AdminPageHeader
        title="مقالات"
        description="مقالات وبلاگ سایت، پیش‌نویس‌ها و انتشار زمان‌بندی‌شده."
        crumbs={[{ label: "مقالات" }]}
        actions={
          <>
            <Link href="/admins/article-categories/" className="adm-btn adm-btn-secondary">
              <FolderTree className="h-4 w-4" />
              دسته‌بندی‌ها
            </Link>
            <Link href="/admins/articles/new/" className="adm-btn adm-btn-primary">
              <Plus className="h-4 w-4" />
              مقاله‌ی جدید
            </Link>
          </>
        }
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجو در عنوان، نامک یا خلاصه..." resetHref="/admins/articles/" active={filtered}>
          <select name="category" defaultValue={category} className="adm-input sm:w-44" aria-label="دسته‌بندی">
            <option value="">همه‌ی دسته‌ها</option>
            {categories.map((c) => (
              <option key={c.id.toString()} value={c.id.toString()}>{c.name}</option>
            ))}
            <option value="none">بدون دسته‌بندی</option>
          </select>
          <select name="status" defaultValue={status} className="adm-input sm:w-40" aria-label="وضعیت">
            <option value="">همه‌ی وضعیت‌ها</option>
            <option value="published">منتشرشده</option>
            <option value="scheduled">زمان‌بندی‌شده</option>
            <option value="draft">پیش‌نویس</option>
          </select>
        </FilterBar>

        {articles.length === 0 ? (
          <EmptyState
            title={filtered ? "نتیجه‌ای پیدا نشد" : "هنوز مقاله‌ای ننوشته‌اید"}
            action={!filtered && <Link href="/admins/articles/new/" className="adm-btn adm-btn-primary"><Plus className="h-4 w-4" />مقاله‌ی جدید</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[900px]">
              <thead>
                <tr>
                  <th>مقاله</th>
                  <th>دسته‌بندی</th>
                  <th>وضعیت</th>
                  <th>تاریخ انتشار</th>
                  <th>بازدید</th>
                  <th className="text-end">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => {
                  const id = a.id.toString();
                  const scheduled = a.status === "published" && a.publishedAt && a.publishedAt > now;
                  const st = scheduled ? { label: "زمان‌بندی‌شده", cls: "adm-badge-gold" } : badge(ARTICLE_STATUS, a.status);
                  const live = a.status === "published" && !scheduled;
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admins/articles/${id}/`} className="group flex items-center gap-3">
                          {a.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.image} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
                          ) : (
                            <span className="h-11 w-16 shrink-0 rounded-lg bg-white/[0.04] ring-1 ring-white/10" />
                          )}
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5">
                              {a.isFeatured && <Star className="h-3.5 w-3.5 shrink-0 fill-gold-400 text-gold-400" aria-label="ویژه" />}
                              <span className="block max-w-[320px] truncate font-medium text-cream group-hover:text-gold-300">{a.title}</span>
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {a.author?.name ?? "—"} · {toFa(a.readTime)} دقیقه
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td>{a.category ? <span className="adm-badge adm-badge-muted">{a.category.name}</span> : <span className="text-xs text-muted">—</span>}</td>
                      <td><span className={`adm-badge ${st.cls}`}>{st.label}</span></td>
                      <td className="whitespace-nowrap text-xs text-muted">{a.publishedAt ? faDate(a.publishedAt, true) : "—"}</td>
                      <td className="text-xs">
                        <span className="inline-flex items-center gap-1 text-muted"><Eye className="h-3.5 w-3.5" />{formatNumber(a.views)}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {live && (
                            <a href={`/blog/${a.slug}/`} target="_blank" rel="noreferrer" className="adm-icon-btn" title="مشاهده در سایت" aria-label="مشاهده در سایت">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Link href={`/admins/articles/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ConfirmAction action={deleteArticleAction.bind(null, id, undefined)} title="حذف مقاله؟" description={<>مقاله‌ی <b className="text-cream">«{a.title}»</b> حذف می‌شود.</>} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, status, category }} />
      </div>
    </>
  );
}
