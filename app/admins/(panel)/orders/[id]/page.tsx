import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ban, ClipboardList, GraduationCap, Mail, Phone, RotateCcw, Sparkles, Trash2, Undo2 } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { GATEWAYS, ORDER_STATUS, REQUEST_STATUS, TRANSACTION_STATUS, badge } from "@/lib/admin/labels";
import { currentJalaliYear, faDate } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";
import { OrderNoteForm, RegisterPaymentForm } from "./OrderForms";
import { changeOrderStatusAction, deleteOrderAction, registerPaymentAction, updateOrderNoteAction } from "../actions";

export const metadata: Metadata = { title: "جزئیات سفارش" };

const secondaryBtn = "adm-btn adm-btn-secondary";
const dangerBtn = "adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = parseId(id);
  if (!orderId) notFound();

  const o = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { include: { course: { select: { id: true } }, service: { select: { id: true } } } },
      transactions: { orderBy: { id: "desc" } },
      discountCode: { select: { id: true, code: true } },
      enrollments: { include: { course: { select: { title: true } } } },
      analysisRequests: { include: { service: { select: { title: true } } } },
    },
  });
  if (!o) notFound();

  const st = badge(ORDER_STATUS, o.status);
  const serviceItems = o.items.filter((i) => i.itemType === "service" && i.serviceId);
  const missingRequests = serviceItems.filter((i) => !o.analysisRequests.some((r) => r.serviceId === i.serviceId));

  return (
    <>
      <AdminPageHeader
        title={`سفارش #${o.orderNumber}`}
        description={`ثبت‌شده در ${faDate(o.createdAt, true)}`}
        crumbs={[{ label: "سفارش‌ها", href: "/admins/orders/" }, { label: `#${o.orderNumber}` }]}
        actions={
          <>
            {o.status === "pending" && (
              <ConfirmAction
                action={changeOrderStatusAction.bind(null, id, "canceled")}
                title="لغو سفارش؟"
                description="سفارش لغو می‌شود و درخواست‌های تحلیل مرتبط هم لغو می‌شوند."
                confirmLabel="لغو سفارش"
                triggerClassName={dangerBtn}
                trigger={<><Ban className="h-4 w-4" />لغو سفارش</>}
              />
            )}
            {o.status === "paid" && (
              <ConfirmAction
                action={changeOrderStatusAction.bind(null, id, "refunded")}
                title="ثبت استرداد وجه؟"
                description="سفارش مسترد علامت می‌خورد و دسترسی دوره‌هایی که با این سفارش فعال شده‌اند غیرفعال می‌شود."
                confirmLabel="ثبت استرداد"
                triggerClassName={dangerBtn}
                trigger={<><Undo2 className="h-4 w-4" />استرداد وجه</>}
              />
            )}
            {(o.status === "canceled" || o.status === "failed") && (
              <ConfirmAction
                action={changeOrderStatusAction.bind(null, id, "pending")}
                title="بازگرداندن سفارش؟"
                description="سفارش دوباره در وضعیت «در انتظار پرداخت» قرار می‌گیرد."
                confirmLabel="بازگرداندن"
                triggerClassName={secondaryBtn}
                trigger={<><RotateCcw className="h-4 w-4" />بازگرداندن به انتظار پرداخت</>}
              />
            )}
            {o.status !== "paid" && o.status !== "refunded" && (
              <ConfirmAction
                action={deleteOrderAction.bind(null, id)}
                title="حذف سفارش؟"
                description="سفارش و اقلام آن حذف می‌شوند."
                triggerClassName={dangerBtn}
                trigger={<><Trash2 className="h-4 w-4" />حذف</>}
              />
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="adm-card overflow-hidden">
            <div className="adm-card-header">
              <h2 className="adm-card-title">اقلام سفارش</h2>
              <span className={`adm-badge ${st.cls}`}>{st.label}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="adm-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>قیمت واحد</th>
                    <th>تخفیف</th>
                    <th className="text-end">مبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((i) => (
                    <tr key={i.id.toString()}>
                      <td>
                        <span className="flex items-center gap-2">
                          {i.itemType === "course" ? <GraduationCap className="h-4 w-4 text-gold-500/70" /> : <Sparkles className="h-4 w-4 text-gold-500/70" />}
                          {i.courseId ? (
                            <Link href={`/admins/courses/${i.courseId}/`} className="text-cream hover:text-gold-300">{i.title}</Link>
                          ) : i.serviceId ? (
                            <Link href={`/admins/services/${i.serviceId}/`} className="text-cream hover:text-gold-300">{i.title}</Link>
                          ) : (
                            <span className="text-cream">{i.title}</span>
                          )}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">{price(i.unitPrice)}</td>
                      <td className="whitespace-nowrap text-muted">{i.discount ? price(i.discount) : "—"}</td>
                      <td className="whitespace-nowrap text-end font-bold text-cream">{price(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="space-y-2 border-t border-white/[0.06] px-6 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">جمع اقلام</dt><dd>{price(o.subtotal)}</dd></div>
              {o.discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">
                    تخفیف
                    {o.discountCode && (
                      <Link href={`/admins/discount-codes/${o.discountCode.id}/`} className="ms-2 text-xs text-gold-400" dir="ltr">({o.discountCode.code})</Link>
                    )}
                  </dt>
                  <dd className="text-rose-300">− {price(o.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-white/[0.06] pt-2 text-base"><dt className="font-bold">مبلغ قابل پرداخت</dt><dd className="font-extrabold text-gold-300">{price(o.total)}</dd></div>
            </dl>
          </section>

          {o.status === "pending" && <RegisterPaymentForm action={registerPaymentAction.bind(null, id)} maxYear={currentJalaliYear()} />}

          <section className="adm-card">
            <div className="adm-card-header"><h2 className="adm-card-title">تراکنش‌ها</h2></div>
            {o.transactions.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted">تراکنشی ثبت نشده است.</p>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {o.transactions.map((t) => {
                  const ts = badge(TRANSACTION_STATUS, t.status);
                  return (
                    <li key={t.id.toString()} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 text-sm">
                      <span>
                        <span className="block font-medium text-cream">{GATEWAYS[t.gateway] ?? t.gateway}</span>
                        <span className="text-xs text-muted">
                          {faDate(t.paidAt ?? t.createdAt, true)}
                          {t.referenceId && <> · کد پیگیری <span dir="ltr">{t.referenceId}</span></>}
                          {t.cardNumber && <> · کارت <span dir="ltr">{t.cardNumber}</span></>}
                        </span>
                        {t.description && <span className="mt-0.5 block text-xs text-cream/60">{t.description}</span>}
                      </span>
                      <span className="text-end">
                        <span className="block font-bold text-gold-300">{price(t.amount)}</span>
                        <span className={`adm-badge mt-1 ${ts.cls}`}>{ts.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="adm-card p-5">
            <h2 className="adm-card-title mb-4">مشتری</h2>
            <Link href={`/admins/users/${o.userId}/`} className="group flex items-center gap-3">
              <UserAvatar name={o.user.name} src={o.user.avatar} size="h-11 w-11 text-base" />
              <span className="font-bold text-cream group-hover:text-gold-300">{o.user.name || "بدون نام"}</span>
            </Link>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-gold-500" /><a href={`tel:${o.user.mobile}`} dir="ltr" className="hover:text-gold-300">{toFa(o.user.mobile)}</a></li>
              {o.user.email && <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-gold-500" /><span dir="ltr" className="truncate">{o.user.email}</span></li>}
            </ul>
          </section>

          <section className="adm-card p-5 text-sm">
            <h2 className="adm-card-title mb-4">وضعیت</h2>
            <dl className="space-y-2.5">
              <div className="flex justify-between"><dt className="text-muted">وضعیت</dt><dd><span className={`adm-badge ${st.cls}`}>{st.label}</span></dd></div>
              <div className="flex justify-between"><dt className="text-muted">ثبت</dt><dd>{faDate(o.createdAt, true)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">پرداخت</dt><dd>{o.paidAt ? faDate(o.paidAt, true) : "—"}</dd></div>
            </dl>
          </section>

          {(o.enrollments.length > 0 || o.analysisRequests.length > 0 || missingRequests.length > 0) && (
            <section className="adm-card p-5 text-sm">
              <h2 className="adm-card-title mb-4">موارد مرتبط</h2>
              <ul className="space-y-2.5">
                {o.enrollments.map((e) => (
                  <li key={e.id.toString()} className="flex items-center justify-between gap-2">
                    <Link href={`/admins/courses/${e.courseId}/students/`} className="flex items-center gap-2 text-cream hover:text-gold-300"><GraduationCap className="h-4 w-4 text-gold-500" />دسترسی: {e.course.title}</Link>
                    <span className={`adm-badge ${e.isActive ? "adm-badge-success" : "adm-badge-muted"}`}>{e.isActive ? "فعال" : "غیرفعال"}</span>
                  </li>
                ))}
                {o.analysisRequests.map((r) => {
                  const rs = badge(REQUEST_STATUS, r.status);
                  return (
                    <li key={r.id.toString()} className="flex items-center justify-between gap-2">
                      <Link href={`/admins/analysis-requests/${r.id}/`} className="flex items-center gap-2 text-cream hover:text-gold-300"><ClipboardList className="h-4 w-4 text-gold-500" />{r.service.title}</Link>
                      <span className={`adm-badge ${rs.cls}`}>{rs.label}</span>
                    </li>
                  );
                })}
              </ul>
              {missingRequests.map((i) => (
                <Link key={i.id.toString()} href={`/admins/analysis-requests/new/?order=${id}&service=${i.serviceId}`} className="adm-btn adm-btn-secondary adm-btn-sm mt-3 w-full">
                  <ClipboardList className="h-3.5 w-3.5" />
                  ثبت اطلاعات تولد برای «{i.title}»
                </Link>
              ))}
            </section>
          )}

          <OrderNoteForm action={updateOrderNoteAction.bind(null, id)} defaultValue={o.description ?? ""} />
        </aside>
      </div>
    </>
  );
}
