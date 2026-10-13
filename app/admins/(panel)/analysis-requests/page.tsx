import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import { REQUEST_STATUS, badge } from "@/lib/admin/labels";
import { PER_PAGE, normalizeDigits, pageParam, parseId, strParam } from "@/lib/admin/utils";
import { faDate, faDateOnly, faRelative } from "@/lib/jalali";
import { toFa } from "@/lib/format";

export const metadata: Metadata = { title: "درخواست‌های تحلیل" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function RequestsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const service = strParam(sp.service);
  const page = pageParam(sp.page);
  const term = normalizeDigits(q);
  const serviceId = parseId(service);

  const where: Prisma.AnalysisRequestWhereInput = {
    ...(term ? { OR: [{ fullName: { contains: term } }, { user: { mobile: { contains: term } } }, { user: { name: { contains: term } } }] } : {}),
    ...(status && status in REQUEST_STATUS ? { status: status as Prisma.AnalysisRequestWhereInput["status"] } : {}),
    ...(serviceId ? { serviceId } : {}),
  };

  const [total, requests, counts, services] = await Promise.all([
    db.analysisRequest.count({ where }),
    db.analysisRequest.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { mobile: true, name: true } }, service: { select: { title: true } }, analysis: { select: { deliveredAt: true } } },
    }),
    db.analysisRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true } }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const tabs = [["", "همه", counts.reduce((n, c) => n + c._count._all, 0)] as const, ...Object.entries(REQUEST_STATUS).map(([k, v]) => [k, v.label, countOf(k)] as const)];
  const qs = (s: string) => {
    const p = new URLSearchParams(Object.entries({ status: s, service }).filter(([, v]) => v));
    return p.toString() ? `?${p}` : "";
  };

  return (
    <>
      <AdminPageHeader
        title="درخواست‌های تحلیل"
        description="اطلاعات تولد و سوال‌های مشتریان برای تحلیل، و تحویل گزارش."
        crumbs={[{ label: "درخواست‌های تحلیل" }]}
        actions={
          <Link href="/admins/analysis-requests/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            ثبت درخواست
          </Link>
        }
      />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map(([key, label, n]) => {
          const active = key === status;
          return (
            <Link
              key={key || "all"}
              href={`/admins/analysis-requests/${qs(key)}`}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition ${active ? "border-gold-500/40 bg-gold-500/10 font-bold text-gold-200" : "border-white/[0.08] text-cream/70 hover:border-white/20 hover:text-cream"}`}
            >
              {label}
              <span className={`rounded-md px-1.5 text-[11px] ${active ? "bg-gold-500/20" : "bg-white/[0.06]"}`}>{toFa(n)}</span>
            </Link>
          );
        })}
      </div>

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="نام صاحب چارت یا موبایل..." resetHref="/admins/analysis-requests/" active={Boolean(q || service || status)}>
          {status && <input type="hidden" name="status" value={status} />}
          <select name="service" defaultValue={service} className="adm-input sm:w-56" aria-label="خدمت">
            <option value="">همه‌ی خدمات</option>
            {services.map((s) => <option key={s.id.toString()} value={s.id.toString()}>{s.title}</option>)}
          </select>
        </FilterBar>

        {requests.length === 0 ? (
          <EmptyState title={q || status || service ? "درخواستی پیدا نشد" : "هنوز درخواستی ثبت نشده"} description="درخواست‌هایی که از تلگرام یا واتس‌اپ می‌رسند را اینجا ثبت کنید." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[900px]">
              <thead>
                <tr>
                  <th>صاحب چارت</th>
                  <th>خدمت</th>
                  <th>تاریخ تولد</th>
                  <th>وضعیت</th>
                  <th>ثبت</th>
                  <th className="text-end">جزئیات</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const id = r.id.toString();
                  const st = badge(REQUEST_STATUS, r.status);
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admins/analysis-requests/${id}/`} className="group">
                          <span className="block font-medium text-cream group-hover:text-gold-300">{r.fullName}</span>
                          <span className="block text-xs text-muted" dir="ltr">{toFa(r.user.mobile)}</span>
                        </Link>
                      </td>
                      <td className="text-sm">{r.service.title}</td>
                      <td className="whitespace-nowrap text-xs">{faDateOnly(r.birthDate)}</td>
                      <td><span className={`adm-badge ${st.cls}`}>{st.label}</span></td>
                      <td className="whitespace-nowrap text-xs text-muted" title={faDate(r.createdAt, true)}>{faRelative(r.createdAt)}</td>
                      <td>
                        <div className="flex justify-end">
                          <Link href={`/admins/analysis-requests/${id}/`} className="adm-icon-btn" title="جزئیات" aria-label="جزئیات"><Eye className="h-4 w-4" /></Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, status, service }} />
      </div>
    </>
  );
}
