import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Users } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { PER_PAGE, pageParam, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";
import { deleteCourseAction, toggleCourseAction } from "./actions";

export const metadata: Metadata = { title: "دوره‌ها" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function CoursesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const page = pageParam(sp.page);

  const where: Prisma.CourseWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }, { subtitle: { contains: q } }] } : {}),
    ...(status === "active" ? { isActive: true } : status === "inactive" ? { isActive: false } : {}),
  };

  const [total, courses] = await Promise.all([
    db.course.count({ where }),
    db.course.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { chapters: true, enrollments: true } }, chapters: { select: { _count: { select: { lessons: true } } } } },
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="دوره‌ها"
        description="دوره‌های آموزشی، سرفصل‌ها، درس‌ها و دانشجویان."
        crumbs={[{ label: "دوره‌ها" }]}
        actions={
          <Link href="/admins/courses/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            افزودن دوره
          </Link>
        }
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجو در عنوان یا نامک..." resetHref="/admins/courses/" active={Boolean(q || status)}>
          <select name="status" defaultValue={status} className="adm-input sm:w-44" aria-label="وضعیت">
            <option value="">همه‌ی وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </FilterBar>

        {courses.length === 0 ? (
          <EmptyState
            title={q || status ? "نتیجه‌ای پیدا نشد" : "هنوز دوره‌ای ثبت نشده"}
            action={!q && !status && <Link href="/admins/courses/new/" className="adm-btn adm-btn-primary"><Plus className="h-4 w-4" />افزودن دوره</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[900px]">
              <thead>
                <tr>
                  <th>دوره</th>
                  <th>قیمت</th>
                  <th>محتوا</th>
                  <th>دانشجو</th>
                  <th>وضعیت</th>
                  <th>آخرین ویرایش</th>
                  <th className="text-end">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const id = c.id.toString();
                  const lessons = c.chapters.reduce((n, ch) => n + ch._count.lessons, 0);
                  const scheduled = c.publishedAt && c.publishedAt > new Date();
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admins/courses/${id}/`} className="group flex items-center gap-3">
                          {c.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.image} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
                          ) : (
                            <span className="h-11 w-16 shrink-0 rounded-lg bg-white/[0.04] ring-1 ring-white/10" />
                          )}
                          <span className="min-w-0">
                            <span className="block max-w-[280px] truncate font-medium text-cream group-hover:text-gold-300">{c.title}</span>
                            <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                              <span dir="ltr">/{c.slug}</span>
                              {c.badge && <span className="adm-badge adm-badge-gold !py-0">{c.badge}</span>}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <div className="whitespace-nowrap font-bold text-gold-300">{c.price ? price(c.price) : "رایگان"}</div>
                        {c.oldPrice && <div className="whitespace-nowrap text-xs text-muted line-through">{price(c.oldPrice)}</div>}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="adm-badge adm-badge-muted">{toFa(c._count.chapters)} سرفصل</span>
                          <span className="adm-badge adm-badge-muted">{toFa(lessons)} درس</span>
                        </div>
                      </td>
                      <td>
                        <Link href={`/admins/courses/${id}/students/`} className="adm-badge adm-badge-info hover:brightness-125">
                          <Users className="h-3 w-3" />
                          {toFa(c._count.enrollments)} نفر
                        </Link>
                      </td>
                      <td>
                        <form action={toggleCourseAction.bind(null, id)}>
                          <button type="submit" title="تغییر وضعیت" className={`adm-badge cursor-pointer transition hover:brightness-125 ${c.isActive ? (scheduled ? "adm-badge-gold" : "adm-badge-success") : "adm-badge-muted"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? (scheduled ? "bg-gold-400" : "bg-emerald-400") : "bg-white/30"}`} />
                            {c.isActive ? (scheduled ? "زمان‌بندی‌شده" : "فعال") : "غیرفعال"}
                          </button>
                        </form>
                      </td>
                      <td className="whitespace-nowrap text-xs text-muted">{faDate(c.updatedAt, true)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <a href={`/courses/${c.slug}/`} target="_blank" rel="noreferrer" className="adm-icon-btn" title="مشاهده در سایت" aria-label="مشاهده در سایت">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Link href={`/admins/courses/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ConfirmAction
                            action={deleteCourseAction.bind(null, id, undefined)}
                            title="حذف دوره؟"
                            description={<>دوره‌ی <b className="text-cream">«{c.title}»</b> همراه با همه‌ی سرفصل‌ها و درس‌هایش حذف می‌شود.</>}
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
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, status }} />
      </div>
    </>
  );
}
