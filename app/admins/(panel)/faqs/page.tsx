import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { PER_PAGE, pageParam, parseId, strParam } from "@/lib/admin/utils";
import { toFa } from "@/lib/format";
import { deleteFaqAction, moveFaqAction } from "./actions";

export const metadata: Metadata = { title: "سوالات متداول" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function FaqsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const service = strParam(sp.service);
  const page = pageParam(sp.page);
  const serviceId = parseId(service);

  const where: Prisma.ServiceFaqWhereInput = {
    ...(q ? { OR: [{ question: { contains: q } }, { answer: { contains: q } }] } : {}),
    ...(service === "general" ? { serviceId: null } : serviceId ? { serviceId } : {}),
  };
  // مرتب‌سازی دستی فقط وقتی معنا دارد که یک گروه انتخاب شده و جستجو نشده باشد
  const reorderable = (service === "general" || Boolean(serviceId)) && !q;

  const [total, faqs, services, generalCount] = await Promise.all([
    db.serviceFaq.count({ where }),
    db.serviceFaq.findMany({
      where,
      orderBy: [{ serviceId: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { service: { select: { id: true, title: true } } },
    }),
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true, _count: { select: { faqs: true } } } }),
    db.serviceFaq.count({ where: { serviceId: null } }),
  ]);

  const newHref = `/admins/faqs/new/${service ? `?service=${service}` : ""}`;
  const tabs = [
    { key: "", label: "همه", count: services.reduce((n, s) => n + s._count.faqs, 0) + generalCount },
    { key: "general", label: "عمومی", count: generalCount },
    ...services.map((s) => ({ key: s.id.toString(), label: s.title, count: s._count.faqs })),
  ];

  return (
    <>
      <AdminPageHeader
        title="سوالات متداول"
        description="سوالات عمومی سایت و سوالات اختصاصی هر خدمت."
        crumbs={[{ label: "سوالات متداول" }]}
        actions={
          <Link href={newHref} className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            افزودن سوال
          </Link>
        }
      />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((t) => {
          const active = t.key === service || (!t.key && !service);
          return (
            <Link
              key={t.key || "all"}
              href={t.key ? `/admins/faqs/?service=${t.key}` : "/admins/faqs/"}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition ${
                active ? "border-gold-500/40 bg-gold-500/10 font-bold text-gold-200" : "border-white/[0.08] text-cream/70 hover:border-white/20 hover:text-cream"
              }`}
            >
              <span className="max-w-[220px] truncate">{t.label}</span>
              <span className={`rounded-md px-1.5 text-[11px] ${active ? "bg-gold-500/20" : "bg-white/[0.06]"}`}>{toFa(t.count)}</span>
            </Link>
          );
        })}
      </div>

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجو در سوال و پاسخ..." resetHref={service ? `/admins/faqs/?service=${service}` : "/admins/faqs/"} active={Boolean(q)}>
          {service && <input type="hidden" name="service" value={service} />}
        </FilterBar>

        {faqs.length === 0 ? (
          <EmptyState
            title={q ? "نتیجه‌ای پیدا نشد" : "سوالی ثبت نشده"}
            description={q ? "عبارت دیگری را جستجو کنید." : "اولین سوال متداول این بخش را اضافه کنید."}
            action={
              !q && (
                <Link href={newHref} className="adm-btn adm-btn-primary">
                  <Plus className="h-4 w-4" />
                  افزودن سوال
                </Link>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {faqs.map((f, i) => {
              const id = f.id.toString();
              const index = (page - 1) * PER_PAGE + i;
              return (
                <li key={id} className="flex items-start gap-3 px-5 py-4 transition hover:bg-white/[0.015] sm:gap-4 sm:px-6">
                  {reorderable ? (
                    <div className="flex shrink-0 flex-col">
                      <form action={moveFaqAction.bind(null, id, "up")}>
                        <button type="submit" disabled={index === 0} className="adm-icon-btn h-6 w-6 disabled:opacity-20" aria-label="انتقال به بالا">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={moveFaqAction.bind(null, id, "down")}>
                        <button type="submit" disabled={index === total - 1} className="adm-icon-btn h-6 w-6 disabled:opacity-20" aria-label="انتقال به پایین">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-300">؟</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link href={`/admins/faqs/${id}/`} className="font-medium leading-7 text-cream hover:text-gold-300">{f.question}</Link>
                    <p className="mt-1 line-clamp-2 text-sm leading-7 text-muted">{f.answer}</p>
                    <div className="mt-2">
                      {f.service ? (
                        <Link href={`/admins/faqs/?service=${f.service.id}`} className="adm-badge adm-badge-gold hover:brightness-125">{f.service.title}</Link>
                      ) : (
                        <span className="adm-badge adm-badge-info">عمومی</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link href={`/admins/faqs/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <ConfirmAction action={deleteFaqAction.bind(null, id, undefined)} title="حذف سوال؟" description={<>سوال <b className="text-cream">«{f.question}»</b> حذف می‌شود.</>} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, service }} />
      </div>
    </>
  );
}
