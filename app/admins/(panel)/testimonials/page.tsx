import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { PER_PAGE, pageParam, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { deleteTestimonialAction, toggleTestimonialAction } from "./actions";

export const metadata: Metadata = { title: "نظرات مشتریان" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function TestimonialsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const page = pageParam(sp.page);

  const where: Prisma.TestimonialWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { content: { contains: q } }, { subtitle: { contains: q } }] } : {}),
    ...(status === "active" ? { isActive: true } : status === "inactive" ? { isActive: false } : {}),
  };

  const [total, items] = await Promise.all([
    db.testimonial.count({ where }),
    db.testimonial.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { service: { select: { title: true } }, course: { select: { title: true } } },
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="نظرات مشتریان"
        description="تجربه‌های مشتریان که در صفحه‌ی اصلی سایت نمایش داده می‌شوند."
        crumbs={[{ label: "نظرات مشتریان" }]}
        actions={
          <Link href="/admins/testimonials/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            افزودن نظر
          </Link>
        }
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجو در نام یا متن نظر..." resetHref="/admins/testimonials/" active={Boolean(q || status)}>
          <select name="status" defaultValue={status} className="adm-input sm:w-44" aria-label="وضعیت">
            <option value="">همه</option>
            <option value="active">نمایش در سایت</option>
            <option value="inactive">مخفی / در انتظار تایید</option>
          </select>
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState title={q || status ? "نتیجه‌ای پیدا نشد" : "نظری ثبت نشده"} />
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {items.map((t) => {
              const id = t.id.toString();
              const related = t.subtitle || t.service?.title || t.course?.title;
              return (
                <li key={id} className="flex items-start gap-4 px-5 py-4 sm:px-6">
                  <UserAvatar name={t.name} src={t.avatar} size="h-10 w-10 text-sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link href={`/admins/testimonials/${id}/`} className="font-bold text-cream hover:text-gold-300">{t.name}</Link>
                      {related && <span className="text-xs text-muted">{related}</span>}
                      <span className="flex text-gold-400" aria-label={`${t.rating} از ۵`}>
                        {Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`h-3 w-3 ${k < t.rating ? "fill-current" : "opacity-25"}`} />)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-7 text-cream/75">«{t.content}»</p>
                    <div className="mt-2 text-[11px] text-muted">{faDate(t.createdAt)}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <form action={toggleTestimonialAction.bind(null, id)}>
                      <button type="submit" className={`adm-badge cursor-pointer hover:brightness-125 ${t.isActive ? "adm-badge-success" : "adm-badge-muted"}`} title="تغییر وضعیت">
                        {t.isActive ? "نمایش" : "مخفی"}
                      </button>
                    </form>
                    <Link href={`/admins/testimonials/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmAction action={deleteTestimonialAction.bind(null, id, undefined)} title="حذف نظر؟" description={<>نظر <b className="text-cream">{t.name}</b> حذف می‌شود.</>} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, status }} />
      </div>
    </>
  );
}
