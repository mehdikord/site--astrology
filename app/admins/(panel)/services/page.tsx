import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, HelpCircle, Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { PER_PAGE, pageParam, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";
import { deleteServiceAction, toggleServiceAction } from "./actions";

export const metadata: Metadata = { title: "خدمات" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ServicesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const page = pageParam(sp.page);

  const where: Prisma.ServiceWhereInput = {
    ...(q ? { OR: [{ title: { contains: q } }, { titleEn: { contains: q } }, { slug: { contains: q } }] } : {}),
    ...(status === "active" ? { isActive: true } : status === "inactive" ? { isActive: false } : {}),
  };

  const [total, services] = await Promise.all([
    db.service.count({ where }),
    db.service.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { faqs: true, steps: true, analysisRequests: true } } },
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="خدمات"
        description="تحلیل‌ها و خدماتی که در سایت قابل سفارش هستند."
        crumbs={[{ label: "خدمات" }]}
        actions={
          <Link href="/admins/services/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            افزودن خدمت
          </Link>
        }
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجو در عنوان یا نامک..." resetHref="/admins/services/" active={Boolean(q || status)}>
          <select name="status" defaultValue={status} className="adm-input sm:w-44" aria-label="وضعیت">
            <option value="">همه‌ی وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </FilterBar>

        {services.length === 0 ? (
          <EmptyState
            title={q || status ? "نتیجه‌ای پیدا نشد" : "هنوز خدمتی ثبت نشده"}
            description={q || status ? "فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید." : "اولین خدمت سایت را اضافه کنید."}
            action={
              !q && !status && (
                <Link href="/admins/services/new/" className="adm-btn adm-btn-primary">
                  <Plus className="h-4 w-4" />
                  افزودن خدمت
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[820px]">
              <thead>
                <tr>
                  <th>خدمت</th>
                  <th>قیمت</th>
                  <th>محتوا</th>
                  <th>وضعیت</th>
                  <th>آخرین ویرایش</th>
                  <th className="text-end">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const id = s.id.toString();
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admins/services/${id}/`} className="group flex items-center gap-3">
                          {s.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.image} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover ring-1 ring-white/10" />
                          ) : (
                            <span className="h-11 w-16 shrink-0 rounded-lg bg-white/[0.04] ring-1 ring-white/10" />
                          )}
                          <span className="min-w-0">
                            <span className="block max-w-[280px] truncate font-medium text-cream group-hover:text-gold-300">{s.title}</span>
                            <span className="mt-0.5 block text-xs text-muted" dir="ltr">/{s.slug}</span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <div className="whitespace-nowrap font-bold text-gold-300">{price(s.price)}</div>
                        {s.oldPrice && <div className="whitespace-nowrap text-xs text-muted line-through">{price(s.oldPrice)}</div>}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          <Link href={`/admins/faqs/?service=${id}`} className="adm-badge adm-badge-muted hover:text-cream">
                            <HelpCircle className="h-3 w-3" />
                            {toFa(s._count.faqs)} سوال
                          </Link>
                          <span className="adm-badge adm-badge-muted">{toFa(s._count.steps)} مرحله</span>
                          {s._count.analysisRequests > 0 && <span className="adm-badge adm-badge-info">{toFa(s._count.analysisRequests)} درخواست</span>}
                        </div>
                      </td>
                      <td>
                        <form action={toggleServiceAction.bind(null, id)}>
                          <button type="submit" title="تغییر وضعیت" className={`adm-badge cursor-pointer transition hover:brightness-125 ${s.isActive ? "adm-badge-success" : "adm-badge-muted"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-emerald-400" : "bg-white/30"}`} />
                            {s.isActive ? "فعال" : "غیرفعال"}
                          </button>
                        </form>
                      </td>
                      <td className="whitespace-nowrap text-xs text-muted">{faDate(s.updatedAt, true)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <a href={`/services/${s.slug}/`} target="_blank" rel="noreferrer" className="adm-icon-btn" title="مشاهده در سایت" aria-label="مشاهده در سایت">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Link href={`/admins/services/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ConfirmAction
                            action={deleteServiceAction.bind(null, id, undefined)}
                            title="حذف خدمت؟"
                            description={
                              <>
                                خدمت <b className="text-cream">«{s.title}»</b> همراه با مراحل و سوالات متداولش حذف می‌شود. این عملیات قابل بازگشت نیست.
                              </>
                            }
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
