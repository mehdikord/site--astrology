import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ClipboardList, GraduationCap, Mail, Newspaper, Plus, Receipt, Sparkles, Users, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/ui";
import UserAvatar from "@/components/admin/UserAvatar";
import { ORDER_STATUS, REQUEST_STATUS, badge } from "@/lib/admin/labels";
import { faRelative } from "@/lib/jalali";
import { formatNumber, price, toFa } from "@/lib/format";

export const metadata: Metadata = { title: "داشبورد" };

function Panel({ title, href, linkLabel, children, empty }: { title: string; href: string; linkLabel: string; children: ReactNode; empty: boolean }) {
  return (
    <section className="adm-card flex flex-col">
      <div className="adm-card-header">
        <h2 className="adm-card-title">{title}</h2>
        <Link href={href} className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300">
          {linkLabel} <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
      {empty ? <p className="flex-1 px-6 py-10 text-center text-sm text-muted">موردی وجود ندارد.</p> : <ul className="divide-y divide-white/[0.04]">{children}</ul>}
    </section>
  );
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const [
    revenue, paidOrders, openRequests, pendingOrders, unread, users, newUsers, courses, articles, services,
    recentOrders, recentRequests, recentUsers, recentMessages,
  ] = await Promise.all([
    db.order.aggregate({ where: { status: "paid", paidAt: { gte: monthAgo } }, _sum: { total: true } }),
    db.order.count({ where: { status: "paid", paidAt: { gte: monthAgo } } }),
    db.analysisRequest.count({ where: { status: { in: ["pending", "in_progress"] } } }),
    db.order.count({ where: { status: "pending" } }),
    db.contactMessage.count({ where: { readAt: null } }),
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: monthAgo } } }),
    db.course.count({ where: { isActive: true } }),
    db.article.count({ where: { status: "published" } }),
    db.service.count({ where: { isActive: true } }),
    db.order.findMany({ orderBy: { id: "desc" }, take: 5, include: { user: { select: { name: true, mobile: true } } } }),
    db.analysisRequest.findMany({
      where: { status: { in: ["pending", "in_progress", "pending_payment"] } },
      orderBy: { id: "asc" },
      take: 5,
      include: { service: { select: { title: true } } },
    }),
    db.user.findMany({ orderBy: { id: "desc" }, take: 5 }),
    db.contactMessage.findMany({ orderBy: { id: "desc" }, take: 4 }),
  ]);

  const primary = [
    { label: "فروش ۳۰ روز اخیر", value: price(revenue._sum.total ?? 0), sub: `${toFa(paidOrders)} سفارش پرداخت‌شده`, icon: Wallet, href: "/admins/orders/?status=paid" },
    { label: "درخواست‌های باز", value: formatNumber(openRequests), sub: "در صف یا در حال تحلیل", icon: ClipboardList, href: "/admins/analysis-requests/?status=pending" },
    { label: "سفارش‌های پرداخت‌نشده", value: formatNumber(pendingOrders), sub: "در انتظار پرداخت", icon: Receipt, href: "/admins/orders/?status=pending" },
    { label: "پیام‌های جدید", value: formatNumber(unread), sub: "خوانده‌نشده", icon: Mail, href: "/admins/messages/?filter=unread" },
  ];
  const secondary = [
    { label: "کاربران", value: users, sub: `${toFa(newUsers)} جدید در ۳۰ روز`, icon: Users, href: "/admins/users/" },
    { label: "خدمات فعال", value: services, icon: Sparkles, href: "/admins/services/" },
    { label: "دوره‌های فعال", value: courses, icon: GraduationCap, href: "/admins/courses/" },
    { label: "مقالات منتشرشده", value: articles, icon: Newspaper, href: "/admins/articles/" },
  ];

  return (
    <>
      <AdminPageHeader
        title={`سلام ${admin.name}، خوش آمدید`}
        description="نمای کلی وضعیت سایت در یک نگاه."
        actions={
          <>
            <Link href="/admins/analysis-requests/new/" className="adm-btn adm-btn-secondary">
              <ClipboardList className="h-4 w-4" />
              ثبت درخواست تحلیل
            </Link>
            <Link href="/admins/orders/new/" className="adm-btn adm-btn-primary">
              <Plus className="h-4 w-4" />
              ثبت سفارش
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((c) => (
          <Link key={c.label} href={c.href} className="adm-card group p-5 transition hover:border-gold-500/25">
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted">{c.label}</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/20 transition group-hover:bg-gold-500/15">
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-cream sm:text-[1.7rem]">{c.value}</div>
            <div className="mt-1.5 text-xs text-muted">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {secondary.map((c) => (
          <Link key={c.label} href={c.href} className="adm-card flex items-center gap-3 px-4 py-3.5 transition hover:border-gold-500/25">
            <c.icon className="h-5 w-5 shrink-0 text-gold-500/80" />
            <span className="min-w-0">
              <span className="block text-lg font-extrabold leading-tight text-cream">{formatNumber(c.value)}</span>
              <span className="block truncate text-[11px] text-muted">{c.label}{c.sub ? ` · ${c.sub}` : ""}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="آخرین سفارش‌ها" href="/admins/orders/" linkLabel="همه‌ی سفارش‌ها" empty={recentOrders.length === 0}>
          {recentOrders.map((o) => {
            const st = badge(ORDER_STATUS, o.status);
            return (
              <li key={o.id.toString()}>
                <Link href={`/admins/orders/${o.id}/`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-white/[0.02] sm:px-6">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-cream">{o.user.name || toFa(o.user.mobile)}</span>
                    <span className="text-xs text-muted" dir="ltr">#{o.orderNumber}</span>
                  </span>
                  <span className="shrink-0 text-end">
                    <span className="block text-sm font-bold text-gold-300">{price(o.total)}</span>
                    <span className={`adm-badge mt-1 ${st.cls}`}>{st.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </Panel>

        <Panel title="درخواست‌های در انتظار" href="/admins/analysis-requests/" linkLabel="همه‌ی درخواست‌ها" empty={recentRequests.length === 0}>
          {recentRequests.map((r) => {
            const st = badge(REQUEST_STATUS, r.status);
            return (
              <li key={r.id.toString()}>
                <Link href={`/admins/analysis-requests/${r.id}/`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-white/[0.02] sm:px-6">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-cream">{r.fullName}</span>
                    <span className="text-xs text-muted">{r.service.title} · {faRelative(r.createdAt)}</span>
                  </span>
                  <span className={`adm-badge shrink-0 ${st.cls}`}>{st.label}</span>
                </Link>
              </li>
            );
          })}
        </Panel>

        <Panel title="کاربران جدید" href="/admins/users/" linkLabel="همه‌ی کاربران" empty={recentUsers.length === 0}>
          {recentUsers.map((u) => (
            <li key={u.id.toString()}>
              <Link href={`/admins/users/${u.id}/`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.02] sm:px-6">
                <UserAvatar name={u.name} src={u.avatar} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-cream">{u.name || "بدون نام"}</span>
                  <span className="block text-xs text-muted" dir="ltr">{toFa(u.mobile)}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">{faRelative(u.createdAt)}</span>
              </Link>
            </li>
          ))}
        </Panel>

        <Panel title="آخرین پیام‌ها" href="/admins/messages/" linkLabel="همه‌ی پیام‌ها" empty={recentMessages.length === 0}>
          {recentMessages.map((m) => (
            <li key={m.id.toString()}>
              <Link href={`/admins/messages/${m.id}/`} className="block px-5 py-3.5 transition hover:bg-white/[0.02] sm:px-6">
                <span className="flex items-center gap-2">
                  {!m.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" aria-label="خوانده‌نشده" />}
                  <span className={`truncate text-sm ${m.readAt ? "text-cream/80" : "font-bold text-cream"}`}>{m.name}</span>
                  <span className="ms-auto shrink-0 text-xs text-muted">{faRelative(m.createdAt)}</span>
                </span>
                <span className="mt-1 line-clamp-1 text-xs text-muted">{m.message}</span>
              </Link>
            </li>
          ))}
        </Panel>
      </div>
    </>
  );
}
