import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MailOpen, Phone, Send, Trash2, User } from "lucide-react";
import { db } from "@/lib/db";
import { MOBILE_RE, normalizeMobile, parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { faDate } from "@/lib/jalali";
import { getSettings } from "@/lib/settings";
import { deleteMessageAction, toggleMessageReadAction } from "../actions";

export const metadata: Metadata = { title: "پیام" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mid = parseId(id);
  if (!mid) notFound();
  let m = await db.contactMessage.findUnique({ where: { id: mid }, include: { user: { select: { id: true, name: true } } } });
  if (!m) notFound();
  // باز کردن پیام = خوانده‌شده
  if (!m.readAt) m = await db.contactMessage.update({ where: { id: mid }, data: { readAt: new Date() }, include: { user: { select: { id: true, name: true } } } });

  const mobile = normalizeMobile(m.contact);
  const isMobile = MOBILE_RE.test(mobile);
  const isEmail = m.contact.includes("@");
  const site = await getSettings();
  const reply = `سلام ${m.name} عزیز،\n\n`;

  return (
    <>
      <AdminPageHeader
        title={m.subject || "پیام بدون موضوع"}
        description={`از ${m.name} — ${faDate(m.createdAt, true)}`}
        crumbs={[{ label: "پیام‌ها", href: "/admins/messages/" }, { label: m.name }]}
        actions={
          <>
            <form action={toggleMessageReadAction.bind(null, id)}>
              <button type="submit" className="adm-btn adm-btn-secondary">
                {m.readAt ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                {m.readAt ? "علامت خوانده‌نشده" : "علامت خوانده‌شده"}
              </button>
            </form>
            <ConfirmAction
              action={deleteMessageAction.bind(null, id, "/admins/messages/")}
              title="حذف پیام؟"
              triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              trigger={<><Trash2 className="h-4 w-4" />حذف</>}
            />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="adm-card p-6 xl:col-span-2">
          <p className="whitespace-pre-line text-[15px] leading-9 text-cream/90">{m.message}</p>
        </section>
        <aside className="adm-card space-y-4 p-5 text-sm">
          <h2 className="adm-card-title">فرستنده</h2>
          <div className="flex items-center gap-2.5"><User className="h-4 w-4 text-gold-500" />{m.name}</div>
          <div className="flex items-center gap-2.5" dir="ltr"><span className="text-cream/80">{m.contact}</span></div>
          {m.user && (
            <Link href={`/admins/users/${m.user.id}/`} className="block rounded-xl bg-gold-500/[0.06] px-3 py-2 text-xs text-gold-200 hover:text-gold-100">
              کاربر ثبت‌نام‌شده: {m.user.name || "مشاهده‌ی پروفایل"}
            </Link>
          )}
          <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
            {isMobile && (
              <a href={`tel:${mobile}`} className="adm-btn adm-btn-secondary"><Phone className="h-4 w-4" />تماس تلفنی</a>
            )}
            {isMobile && (
              <a href={`https://wa.me/98${mobile.slice(1)}?text=${encodeURIComponent(reply)}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary"><Send className="h-4 w-4" />پاسخ در واتس‌اپ</a>
            )}
            {isEmail && (
              <a href={`mailto:${m.contact}?subject=${encodeURIComponent(`پاسخ: ${m.subject ?? ""}`)}&body=${encodeURIComponent(reply)}`} className="adm-btn adm-btn-secondary">
                <Mail className="h-4 w-4" />
                پاسخ با ایمیل
              </a>
            )}
            <p className="text-[11px] leading-5 text-muted">پاسخ از طریق {site.name} ارسال نمی‌شود؛ این دکمه‌ها برنامه‌ی پیام‌رسان یا ایمیل شما را باز می‌کنند.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
