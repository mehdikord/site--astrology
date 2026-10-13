import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { PER_PAGE, pageParam, strParam } from "@/lib/admin/utils";
import { faDate } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";
import { deleteDiscountAction, toggleDiscountAction } from "./actions";

export const metadata: Metadata = { title: "کدهای تخفیف" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function DiscountCodesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q).toUpperCase();
  const page = pageParam(sp.page);
  const where = q ? { code: { contains: q } } : {};

  const [total, codes] = await Promise.all([
    db.discountCode.count({ where }),
    db.discountCode.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { _count: { select: { orders: true } } } }),
  ]);
  const now = new Date();

  return (
    <>
      <AdminPageHeader
        title="کدهای تخفیف"
        crumbs={[{ label: "کدهای تخفیف" }]}
        actions={
          <Link href="/admins/discount-codes/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            کد تخفیف جدید
          </Link>
        }
      />
      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجوی کد..." resetHref="/admins/discount-codes/" active={Boolean(q)} />
        {codes.length === 0 ? (
          <EmptyState title={q ? "کدی پیدا نشد" : "هنوز کد تخفیفی نساخته‌اید"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[860px]">
              <thead>
                <tr>
                  <th>کد</th>
                  <th>تخفیف</th>
                  <th>استفاده</th>
                  <th>اعتبار</th>
                  <th>وضعیت</th>
                  <th className="text-end">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const id = c.id.toString();
                  const expired = c.expiresAt && c.expiresAt < now;
                  const notStarted = c.startsAt && c.startsAt > now;
                  const full = c.usageLimit !== null && c.usedCount >= c.usageLimit;
                  const state = !c.isActive ? ["غیرفعال", "adm-badge-muted"] : expired ? ["منقضی", "adm-badge-rose"] : full ? ["تمام‌شده", "adm-badge-rose"] : notStarted ? ["شروع نشده", "adm-badge-gold"] : ["فعال", "adm-badge-success"];
                  return (
                    <tr key={id}>
                      <td><Link href={`/admins/discount-codes/${id}/`} className="font-mono font-bold tracking-widest text-cream hover:text-gold-300" dir="ltr">{c.code}</Link></td>
                      <td>
                        <span className="font-bold text-gold-300">{c.type === "percent" ? `${toFa(c.value)}٪` : price(c.value)}</span>
                        <span className="block text-[11px] text-muted">
                          {[c.maxDiscount && `سقف ${price(c.maxDiscount)}`, c.minAmount && `حداقل خرید ${price(c.minAmount)}`].filter(Boolean).join(" · ") || "بدون محدودیت مبلغ"}
                        </span>
                      </td>
                      <td className="text-sm">
                        {toFa(c.usedCount)}{c.usageLimit !== null && <span className="text-muted"> / {toFa(c.usageLimit)}</span>}
                        <span className="block text-[11px] text-muted">{toFa(c._count.orders)} سفارش</span>
                      </td>
                      <td className="whitespace-nowrap text-xs text-muted">
                        {c.startsAt ? `از ${faDate(c.startsAt)}` : "از همین حالا"}
                        <br />
                        {c.expiresAt ? `تا ${faDate(c.expiresAt)}` : "بدون انقضا"}
                      </td>
                      <td>
                        <form action={toggleDiscountAction.bind(null, id)}>
                          <button type="submit" className={`adm-badge cursor-pointer hover:brightness-125 ${state[1]}`} title="فعال/غیرفعال">{state[0]}</button>
                        </form>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Link href={`/admins/discount-codes/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش"><Pencil className="h-4 w-4" /></Link>
                          <ConfirmAction action={deleteDiscountAction.bind(null, id, undefined)} title="حذف کد تخفیف؟" description={<>کد <b className="text-cream" dir="ltr">{c.code}</b> حذف می‌شود. سفارش‌های قبلی حفظ می‌شوند.</>} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q }} />
      </div>
    </>
  );
}
