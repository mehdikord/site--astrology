import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import UserAvatar from "@/components/admin/UserAvatar";
import { ORDER_STATUS, badge } from "@/lib/admin/labels";
import { PER_PAGE, normalizeDigits, pageParam, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";

export const metadata: Metadata = { title: "سفارش‌ها" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const page = pageParam(sp.page);
  const term = normalizeDigits(q);

  const where: Prisma.OrderWhereInput = {
    ...(term
      ? { OR: [{ orderNumber: { contains: term } }, { user: { mobile: { contains: term } } }, { user: { name: { contains: term } } }] }
      : {}),
    ...(status && status in ORDER_STATUS ? { status: status as Prisma.OrderWhereInput["status"] } : {}),
  };

  const [total, orders, counts, revenue] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: true, items: { select: { title: true } } },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({ where: { status: "paid" }, _sum: { total: true } }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <>
      <AdminPageHeader
        title="سفارش‌ها"
        description={`مجموع فروش: ${price(revenue._sum.total ?? 0)}`}
        crumbs={[{ label: "سفارش‌ها" }]}
        actions={
          <Link href="/admins/orders/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            ثبت سفارش دستی
          </Link>
        }
      />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {[["", "همه", counts.reduce((n, c) => n + c._count._all, 0)] as const, ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label, countOf(k)] as const)].map(([key, label, n]) => {
          const active = key === status;
          return (
            <Link
              key={key || "all"}
              href={key ? `/admins/orders/?status=${key}` : "/admins/orders/"}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition ${active ? "border-gold-500/40 bg-gold-500/10 font-bold text-gold-200" : "border-white/[0.08] text-cream/70 hover:border-white/20 hover:text-cream"}`}
            >
              {label}
              <span className={`rounded-md px-1.5 text-[11px] ${active ? "bg-gold-500/20" : "bg-white/[0.06]"}`}>{toFa(n)}</span>
            </Link>
          );
        })}
      </div>

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="شماره سفارش، نام یا موبایل مشتری..." resetHref={status ? `/admins/orders/?status=${status}` : "/admins/orders/"} active={Boolean(q)}>
          {status && <input type="hidden" name="status" value={status} />}
        </FilterBar>

        {orders.length === 0 ? (
          <EmptyState title={q || status ? "سفارشی پیدا نشد" : "هنوز سفارشی ثبت نشده"} description="سفارش‌های دریافتی از تلگرام و واتس‌اپ را می‌توانید به‌صورت دستی ثبت کنید." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[900px]">
              <thead>
                <tr>
                  <th>سفارش</th>
                  <th>مشتری</th>
                  <th>اقلام</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th className="text-end">جزئیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const id = o.id.toString();
                  const st = badge(ORDER_STATUS, o.status);
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admins/orders/${id}/`} className="font-bold text-cream hover:text-gold-300" dir="ltr">#{o.orderNumber}</Link>
                      </td>
                      <td>
                        <Link href={`/admins/users/${o.userId}/`} className="group flex items-center gap-2.5">
                          <UserAvatar name={o.user.name} src={o.user.avatar} size="h-8 w-8 text-xs" />
                          <span>
                            <span className="block text-sm text-cream group-hover:text-gold-300">{o.user.name || "بدون نام"}</span>
                            <span className="block text-xs text-muted" dir="ltr">{toFa(o.user.mobile)}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="max-w-[240px]">
                        <span className="line-clamp-2 text-xs leading-6 text-cream/75">{o.items.map((i) => i.title).join("، ")}</span>
                      </td>
                      <td>
                        <div className="whitespace-nowrap font-bold text-gold-300">{price(o.total)}</div>
                        {o.discountAmount > 0 && <div className="whitespace-nowrap text-[11px] text-muted">تخفیف {price(o.discountAmount)}</div>}
                      </td>
                      <td><span className={`adm-badge ${st.cls}`}>{st.label}</span></td>
                      <td className="whitespace-nowrap text-xs text-muted">{faDate(o.createdAt, true)}</td>
                      <td>
                        <div className="flex justify-end">
                          <Link href={`/admins/orders/${id}/`} className="adm-icon-btn" title="جزئیات" aria-label="جزئیات">
                            <Eye className="h-4 w-4" />
                          </Link>
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
