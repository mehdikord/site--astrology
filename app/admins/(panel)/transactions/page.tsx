import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import { GATEWAYS, TRANSACTION_STATUS, badge } from "@/lib/admin/labels";
import { PER_PAGE, normalizeDigits, pageParam, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";

export const metadata: Metadata = { title: "تراکنش‌ها" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function TransactionsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const status = strParam(sp.status);
  const gateway = strParam(sp.gateway);
  const page = pageParam(sp.page);
  const term = normalizeDigits(q);

  const where: Prisma.TransactionWhereInput = {
    ...(term
      ? {
          OR: [
            { referenceId: { contains: term } },
            { authority: { contains: term } },
            { order: { orderNumber: { contains: term } } },
            { user: { mobile: { contains: term } } },
            { user: { name: { contains: term } } },
          ],
        }
      : {}),
    ...(status && status in TRANSACTION_STATUS ? { status: status as Prisma.TransactionWhereInput["status"] } : {}),
    ...(gateway ? { gateway } : {}),
  };

  const [total, items, sum] = await Promise.all([
    db.transaction.count({ where }),
    db.transaction.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { id: true, name: true, mobile: true } }, order: { select: { id: true, orderNumber: true } } },
    }),
    db.transaction.aggregate({ where: { ...where, status: "success" }, _sum: { amount: true } }),
  ]);
  const filtered = Boolean(q || status || gateway);

  return (
    <>
      <AdminPageHeader
        title="تراکنش‌ها"
        description={`جمع تراکنش‌های موفق${filtered ? " (با فیلتر فعلی)" : ""}: ${price(sum._sum.amount ?? 0)}`}
        crumbs={[{ label: "تراکنش‌ها" }]}
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="کد پیگیری، شماره سفارش یا موبایل..." resetHref="/admins/transactions/" active={filtered}>
          <select name="status" defaultValue={status} className="adm-input sm:w-36" aria-label="وضعیت">
            <option value="">همه‌ی وضعیت‌ها</option>
            {Object.entries(TRANSACTION_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select name="gateway" defaultValue={gateway} className="adm-input sm:w-40" aria-label="روش پرداخت">
            <option value="">همه‌ی روش‌ها</option>
            {Object.entries(GATEWAYS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState title={filtered ? "تراکنشی پیدا نشد" : "هنوز تراکنشی ثبت نشده"} description="تراکنش‌ها با ثبت پرداخت سفارش‌ها (یا درگاه پرداخت) ایجاد می‌شوند." />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[900px]">
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>کاربر</th>
                  <th>سفارش</th>
                  <th>روش / کد پیگیری</th>
                  <th>مبلغ</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const ts = badge(TRANSACTION_STATUS, t.status);
                  return (
                    <tr key={t.id.toString()}>
                      <td className="text-xs text-muted" dir="ltr">#{toFa(t.id.toString())}</td>
                      <td>
                        <Link href={`/admins/users/${t.user.id}/`} className="hover:text-gold-300">
                          <span className="block text-sm text-cream">{t.user.name || "بدون نام"}</span>
                          <span className="block text-xs text-muted" dir="ltr">{toFa(t.user.mobile)}</span>
                        </Link>
                      </td>
                      <td>{t.order ? <Link href={`/admins/orders/${t.order.id}/`} className="text-gold-400 hover:text-gold-300" dir="ltr">#{t.order.orderNumber}</Link> : <span className="text-muted">—</span>}</td>
                      <td>
                        <span className="block text-sm">{GATEWAYS[t.gateway] ?? t.gateway}</span>
                        {(t.referenceId || t.cardNumber) && (
                          <span className="block text-xs text-muted" dir="ltr">{[t.referenceId, t.cardNumber].filter(Boolean).join(" · ")}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap font-bold text-gold-300">{price(t.amount)}</td>
                      <td><span className={`adm-badge ${ts.cls}`}>{ts.label}</span></td>
                      <td className="whitespace-nowrap text-xs text-muted">{faDate(t.paidAt ?? t.createdAt, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, status, gateway }} />
      </div>
    </>
  );
}
