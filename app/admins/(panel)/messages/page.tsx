import type { Metadata } from "next";
import Link from "next/link";
import { CheckCheck, Mail, MailOpen } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { PER_PAGE, normalizeDigits, pageParam, strParam } from "@/lib/admin/utils";
import { faDate, faRelative } from "@/lib/jalali";
import { toFa } from "@/lib/format";
import { deleteMessageAction, markAllReadAction, toggleMessageReadAction } from "./actions";

export const metadata: Metadata = { title: "پیام‌ها" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function MessagesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const filter = strParam(sp.filter);
  const page = pageParam(sp.page);
  const term = normalizeDigits(q);

  const where: Prisma.ContactMessageWhereInput = {
    ...(term ? { OR: [{ name: { contains: term } }, { contact: { contains: term } }, { subject: { contains: term } }, { message: { contains: term } }] } : {}),
    ...(filter === "unread" ? { readAt: null } : filter === "read" ? { readAt: { not: null } } : {}),
  };

  const [total, messages, unread] = await Promise.all([
    db.contactMessage.count({ where }),
    db.contactMessage.findMany({ where, orderBy: { id: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.contactMessage.count({ where: { readAt: null } }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="پیام‌های تماس"
        description={unread ? `${toFa(unread)} پیام خوانده‌نشده` : "همه‌ی پیام‌ها خوانده شده‌اند."}
        crumbs={[{ label: "پیام‌ها" }]}
        actions={
          unread > 0 && (
            <form action={markAllReadAction}>
              <button type="submit" className="adm-btn adm-btn-secondary">
                <CheckCheck className="h-4 w-4" />
                علامت‌گذاری همه به‌عنوان خوانده‌شده
              </button>
            </form>
          )
        }
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجو در نام، راه تماس یا متن پیام..." resetHref="/admins/messages/" active={Boolean(q || filter)}>
          <select name="filter" defaultValue={filter} className="adm-input sm:w-40" aria-label="وضعیت">
            <option value="">همه‌ی پیام‌ها</option>
            <option value="unread">خوانده‌نشده</option>
            <option value="read">خوانده‌شده</option>
          </select>
        </FilterBar>

        {messages.length === 0 ? (
          <EmptyState title={q || filter ? "پیامی پیدا نشد" : "هنوز پیامی نرسیده"} description="پیام‌های فرم «تماس با ما» سایت اینجا نمایش داده می‌شوند." />
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {messages.map((m) => {
              const id = m.id.toString();
              const isUnread = !m.readAt;
              return (
                <li key={id} className={`flex items-start gap-4 px-5 py-4 transition hover:bg-white/[0.015] sm:px-6 ${isUnread ? "bg-gold-500/[0.03]" : ""}`}>
                  <span className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full ${isUnread ? "bg-gold-500/15 text-gold-300" : "bg-white/[0.04] text-muted"}`}>
                    {isUnread ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </span>
                  <Link href={`/admins/messages/${id}/`} className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`text-sm ${isUnread ? "font-extrabold text-cream" : "font-medium text-cream/85"}`}>{m.name}</span>
                      <span className="text-xs text-muted" dir="ltr">{m.contact}</span>
                      {m.subject && <span className="adm-badge adm-badge-muted">{m.subject}</span>}
                    </span>
                    <span className="mt-1 line-clamp-2 text-sm leading-7 text-cream/65">{m.message}</span>
                    <span className="mt-1 block text-[11px] text-muted" title={faDate(m.createdAt, true)}>{faRelative(m.createdAt)}</span>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1">
                    <form action={toggleMessageReadAction.bind(null, id)}>
                      <button type="submit" className="adm-icon-btn" title={isUnread ? "خوانده شد" : "خوانده‌نشده"} aria-label={isUnread ? "علامت خوانده‌شده" : "علامت خوانده‌نشده"}>
                        {isUnread ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                      </button>
                    </form>
                    <ConfirmAction action={deleteMessageAction.bind(null, id, undefined)} title="حذف پیام؟" description={<>پیام <b className="text-cream">{m.name}</b> حذف می‌شود.</>} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, filter }} />
      </div>
    </>
  );
}
