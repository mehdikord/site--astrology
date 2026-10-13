import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Pencil, Phone, Receipt, Trash2, User } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { BIRTH_TIME_ACCURACY, GENDER, ORDER_STATUS, REQUEST_STATUS, badge } from "@/lib/admin/labels";
import { currentJalaliYear, faDate, faDateOnly, formatJalaliDateTime } from "@/lib/jalali";
import { price, toFa } from "@/lib/format";
import { DeliveryForm, StatusForm } from "./RequestForms";
import { deleteRequestAction, saveAnalysisAction, updateRequestStatusAction } from "../actions";
import { formatTime } from "../options";

export const metadata: Metadata = { title: "درخواست تحلیل" };

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rid = parseId(id);
  if (!rid) notFound();

  const r = await db.analysisRequest.findUnique({
    where: { id: rid },
    include: {
      user: true,
      service: { select: { id: true, title: true } },
      order: { select: { id: true, orderNumber: true, status: true, total: true } },
      analysis: { include: { admin: { select: { name: true } } } },
    },
  });
  if (!r) notFound();
  const st = badge(REQUEST_STATUS, r.status);
  const a = r.analysis;

  const info: { icon: typeof User; label: string; value: string }[] = [
    { icon: User, label: "نام", value: `${r.fullName}${r.gender ? ` (${GENDER[r.gender]})` : ""}` },
    { icon: CalendarDays, label: "تاریخ تولد", value: faDateOnly(r.birthDate) },
    { icon: Clock, label: "ساعت تولد", value: r.birthTime ? `${toFa(formatTime(r.birthTime))} — ${BIRTH_TIME_ACCURACY[r.birthTimeAccuracy]}` : `نامشخص` },
    { icon: MapPin, label: "محل تولد", value: [r.birthCity, r.birthCountry].filter(Boolean).join("، ") || "—" },
  ];

  return (
    <>
      <AdminPageHeader
        title={`${r.service.title} — ${r.fullName}`}
        description={`ثبت‌شده در ${faDate(r.createdAt, true)}`}
        crumbs={[{ label: "درخواست‌های تحلیل", href: "/admins/analysis-requests/" }, { label: r.fullName }]}
        actions={
          <>
            <Link href={`/admins/analysis-requests/${id}/edit/`} className="adm-btn adm-btn-secondary">
              <Pencil className="h-4 w-4" />
              ویرایش اطلاعات
            </Link>
            <ConfirmAction
              action={deleteRequestAction.bind(null, id)}
              title="حذف درخواست؟"
              description="درخواست و نتیجه‌ی تحلیل (و فایل گزارش) آن حذف می‌شود."
              triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              trigger={<><Trash2 className="h-4 w-4" />حذف</>}
            />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="adm-card">
            <div className="adm-card-header">
              <h2 className="adm-card-title">اطلاعات تولد</h2>
              <span className={`adm-badge ${st.cls}`}>{st.label}</span>
            </div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {info.map((i) => (
                <div key={i.label} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-night-950/40 p-3.5">
                  <i.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  <div>
                    <dt className="text-xs text-muted">{i.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-cream">{i.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {r.questions && (
              <div className="border-t border-white/[0.06] p-5 sm:p-6">
                <h3 className="mb-2 text-xs text-muted">سوال‌ها و دغدغه‌ها</h3>
                <p className="whitespace-pre-line text-sm leading-8 text-cream/85">{r.questions}</p>
              </div>
            )}
          </section>

          <DeliveryForm
            key={a?.updatedAt.getTime() ?? "new"}
            action={saveAnalysisAction.bind(null, id)}
            maxYear={currentJalaliYear()}
            values={{
              title: a?.title ?? "",
              summary: a?.summary ?? "",
              reportFile: a?.reportFile ?? null,
              sessionAt: formatJalaliDateTime(a?.sessionAt),
              sessionLink: a?.sessionLink ?? "",
              sessionDuration: a?.sessionDuration ? String(a.sessionDuration) : "",
              delivered: Boolean(a?.deliveredAt),
            }}
          />
          {a?.deliveredAt && (
            <p className="text-xs text-muted">
              تحویل‌شده در {faDate(a.deliveredAt, true)}{a.admin && ` توسط ${a.admin.name}`}
            </p>
          )}
        </div>

        <aside className="space-y-6">
          <section className="adm-card p-5">
            <h2 className="adm-card-title mb-4">مشتری</h2>
            <Link href={`/admins/users/${r.userId}/`} className="group flex items-center gap-3">
              <UserAvatar name={r.user.name} src={r.user.avatar} size="h-11 w-11 text-base" />
              <span className="font-bold text-cream group-hover:text-gold-300">{r.user.name || "بدون نام"}</span>
            </Link>
            <a href={`tel:${r.user.mobile}`} className="mt-3 flex items-center gap-2.5 text-sm text-cream/80 hover:text-gold-300">
              <Phone className="h-4 w-4 text-gold-500" />
              <span dir="ltr">{toFa(r.user.mobile)}</span>
            </a>
          </section>

          <section className="adm-card p-5 text-sm">
            <h2 className="adm-card-title mb-4">سفارش</h2>
            {r.order ? (
              <Link href={`/admins/orders/${r.order.id}/`} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] p-3 hover:border-gold-500/30">
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gold-500" />
                  <span dir="ltr">#{r.order.orderNumber}</span>
                </span>
                <span className="text-end">
                  <span className="block font-bold text-gold-300">{price(r.order.total)}</span>
                  <span className={`adm-badge mt-1 ${badge(ORDER_STATUS, r.order.status).cls}`}>{badge(ORDER_STATUS, r.order.status).label}</span>
                </span>
              </Link>
            ) : (
              <p className="text-muted">به سفارشی متصل نیست.</p>
            )}
          </section>

          <StatusForm key={r.updatedAt.getTime()} action={updateRequestStatusAction.bind(null, id)} status={r.status} adminNote={r.adminNote ?? ""} />
        </aside>
      </div>
    </>
  );
}
