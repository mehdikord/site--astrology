import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { faDate } from "@/lib/jalali";
import { toFa } from "@/lib/format";
import { deleteAdminAction } from "./actions";

export const metadata: Metadata = { title: "مدیران" };

export default async function AdminsPage() {
  const me = await requireAdmin();
  const admins = await db.admin.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { articles: true, analyses: true } } } });

  return (
    <>
      <AdminPageHeader
        title="مدیران"
        description="افرادی که به پنل مدیریت دسترسی دارند."
        crumbs={[{ label: "مدیران" }]}
        actions={
          <Link href="/admins/admins/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            افزودن مدیر
          </Link>
        }
      />
      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="adm-table min-w-[760px]">
            <thead>
              <tr>
                <th>مدیر</th>
                <th>موبایل</th>
                <th>فعالیت</th>
                <th>تاریخ ایجاد</th>
                <th className="text-end">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const id = a.id.toString();
                const isMe = id === me.id;
                return (
                  <tr key={id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={a.name} />
                        <span>
                          <span className="flex items-center gap-2 font-medium text-cream">
                            {a.name}
                            {isMe && <span className="adm-badge adm-badge-gold">شما</span>}
                          </span>
                          <span className="block text-xs text-muted" dir="ltr">{a.email}</span>
                        </span>
                      </div>
                    </td>
                    <td dir="ltr" className="text-end">{toFa(a.mobile)}</td>
                    <td className="text-xs text-muted">{toFa(a._count.articles)} مقاله · {toFa(a._count.analyses)} تحلیل</td>
                    <td className="text-xs text-muted">{faDate(a.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Link href={isMe ? "/admins/profile/" : `/admins/admins/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش"><Pencil className="h-4 w-4" /></Link>
                        {!isMe && <ConfirmAction action={deleteAdminAction.bind(null, id)} title="حذف مدیر؟" description={<>دسترسی <b className="text-cream">{a.name}</b> به پنل حذف می‌شود.</>} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
