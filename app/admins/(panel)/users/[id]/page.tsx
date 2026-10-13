import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, ClipboardList, Mail, Phone, Receipt, Trash2 } from "lucide-react";
import { ORDER_STATUS, REQUEST_STATUS, badge } from "@/lib/admin/labels";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { dateToJalali, faDate, faDateOnly, formatJalaliInput } from "@/lib/jalali";
import { formatNumber, price, toFa } from "@/lib/format";
import UserForm, { type UserFormValues } from "../UserForm";
import { deleteUserAction, updateUserAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش کاربر" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseId(id);
  if (!userId) notFound();

  const [user, paid] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { orders: true, enrollments: true, analysisRequests: true } },
        orders: { orderBy: { id: "desc" }, take: 5 },
        enrollments: { orderBy: { id: "desc" }, take: 5, include: { course: { select: { title: true } } } },
        analysisRequests: { orderBy: { id: "desc" }, take: 5, include: { service: { select: { title: true } } } },
      },
    }),
    db.order.aggregate({ where: { userId, status: "paid" }, _sum: { total: true } }),
  ]);
  if (!user) notFound();

  const values: UserFormValues = {
    name: user.name ?? "",
    mobile: user.mobile,
    email: user.email ?? "",
    bio: user.bio ?? "",
    avatar: user.avatar,
    birthDate: formatJalaliInput(user.birthDate),
    gender: user.gender ?? "",
  };

  const stats = [
    { label: "سفارش‌ها", value: formatNumber(user._count.orders) },
    { label: "دوره‌ها", value: formatNumber(user._count.enrollments) },
    { label: "درخواست تحلیل", value: formatNumber(user._count.analysisRequests) },
  ];

  return (
    <>
      <AdminPageHeader
        title={user.name || "کاربر بدون نام"}
        description="مشاهده و ویرایش اطلاعات کاربر"
        crumbs={[{ label: "کاربران", href: "/admins/users/" }, { label: "ویرایش" }]}
        actions={
          <>
            <Link href={`/admins/orders/new/?user=${id}`} className="adm-btn adm-btn-secondary">
              <Receipt className="h-4 w-4" />
              ثبت سفارش
            </Link>
            <Link href={`/admins/analysis-requests/new/?user=${id}`} className="adm-btn adm-btn-secondary">
              <ClipboardList className="h-4 w-4" />
              ثبت درخواست تحلیل
            </Link>
            <ConfirmAction
              action={deleteUserAction.bind(null, id, "/admins/users/")}
              title="حذف کاربر؟"
              description={<>کاربر <b className="text-cream">«{user.name || user.mobile}»</b> و دسترسی‌ها و درخواست‌هایش حذف می‌شود.</>}
              triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              trigger={<><Trash2 className="h-4 w-4" />حذف کاربر</>}
            />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UserForm key={user.updatedAt.getTime()} action={updateUserAction.bind(null, id)} values={values} submitLabel="ذخیره‌ی تغییرات" currentJalaliYear={dateToJalali(new Date()).jy} />
        </div>

        <aside className="space-y-6">
          <section className="adm-card overflow-hidden">
            <div className="relative h-20 bg-gradient-to-l from-gold-500/20 via-gold-500/5 to-transparent" />
            <div className="-mt-10 px-6 pb-6 text-center">
              <div className="inline-block rounded-full ring-4 ring-night-900">
                <UserAvatar name={user.name} src={user.avatar} size="h-20 w-20 text-2xl" />
              </div>
              <h2 className="mt-3 font-bold text-cream">{user.name || "بدون نام"}</h2>
              <p className="mt-0.5 text-xs text-muted">عضویت از {faDate(user.createdAt)}</p>

              <ul className="mt-5 space-y-2.5 text-start text-sm">
                <li className="flex items-center gap-3 text-cream/80"><Phone className="h-4 w-4 shrink-0 text-gold-500" /><span dir="ltr">{toFa(user.mobile)}</span></li>
                {user.email && <li className="flex items-center gap-3 text-cream/80"><Mail className="h-4 w-4 shrink-0 text-gold-500" /><span className="truncate" dir="ltr">{user.email}</span></li>}
                {user.birthDate && <li className="flex items-center gap-3 text-cream/80"><Calendar className="h-4 w-4 shrink-0 text-gold-500" />{faDateOnly(user.birthDate)}</li>}
              </ul>

              <div className="mt-6 grid grid-cols-3 divide-x divide-x-reverse divide-white/[0.06] rounded-xl border border-white/[0.06] bg-night-950/40 py-3">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-lg font-extrabold text-cream">{s.value}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-gold-500/15 bg-gold-500/[0.05] px-4 py-3 text-sm">
                <span className="text-muted">مجموع پرداخت‌ها: </span>
                <b className="text-gold-300">{price(paid._sum.total ?? 0)}</b>
              </div>
            </div>
          </section>

          <section className="adm-card">
            <div className="adm-card-header"><h2 className="adm-card-title">آخرین سفارش‌ها</h2></div>
            {user.orders.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted">سفارشی ثبت نشده است.</p>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {user.orders.map((o) => (
                  <li key={o.id.toString()}>
                    <Link href={`/admins/orders/${o.id}/`} className="flex items-center justify-between gap-3 px-6 py-3 text-sm transition hover:bg-white/[0.02]">
                      <span>
                        <span className="block font-medium text-cream" dir="ltr">#{o.orderNumber}</span>
                        <span className="text-xs text-muted">{faDate(o.createdAt)}</span>
                      </span>
                      <span className="text-end">
                        <span className="block font-bold text-gold-300">{price(o.total)}</span>
                        <span className={`adm-badge mt-1 ${badge(ORDER_STATUS, o.status).cls}`}>{badge(ORDER_STATUS, o.status).label}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="adm-card">
            <div className="adm-card-header"><h2 className="adm-card-title">دوره‌های کاربر</h2></div>
            {user.enrollments.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted">کاربر در دوره‌ای ثبت‌نام نکرده است.</p>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {user.enrollments.map((e) => (
                  <li key={e.id.toString()} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                    <Link href={`/admins/courses/${e.courseId}/students/`} className="truncate text-cream hover:text-gold-300">{e.course.title}</Link>
                    <span className={`adm-badge ${e.isActive ? "adm-badge-success" : "adm-badge-muted"}`}>{e.isActive ? "فعال" : "غیرفعال"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="adm-card">
            <div className="adm-card-header"><h2 className="adm-card-title">درخواست‌های تحلیل</h2></div>
            {user.analysisRequests.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted">درخواستی ثبت نشده است.</p>
            ) : (
              <ul className="divide-y divide-white/[0.04]">
                {user.analysisRequests.map((r) => (
                  <li key={r.id.toString()}>
                    <Link href={`/admins/analysis-requests/${r.id}/`} className="flex items-center justify-between gap-3 px-6 py-3 text-sm transition hover:bg-white/[0.02]">
                      <span className="min-w-0">
                        <span className="block truncate text-cream">{r.service.title}</span>
                        <span className="text-xs text-muted">{r.fullName} · {faDate(r.createdAt)}</span>
                      </span>
                      <span className={`adm-badge shrink-0 ${badge(REQUEST_STATUS, r.status).cls}`}>{badge(REQUEST_STATUS, r.status).label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
