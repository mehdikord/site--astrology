import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { PER_PAGE, normalizeDigits, pageParam, strParam } from "@/lib/admin/utils";
import { faDate, faDateOnly } from "@/lib/jalali";
import { formatNumber, toFa } from "@/lib/format";
import { deleteUserAction } from "./actions";

export const metadata: Metadata = { title: "کاربران" };

type SP = Promise<Record<string, string | string[] | undefined>>;

const GENDER_LABEL = { male: "مرد", female: "زن" } as const;

export default async function UsersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = strParam(sp.q);
  const gender = strParam(sp.gender);
  const sort = strParam(sp.sort);
  const page = pageParam(sp.page);
  const term = normalizeDigits(q);

  const where: Prisma.UserWhereInput = {
    ...(term ? { OR: [{ name: { contains: term } }, { mobile: { contains: term.replace(/^\+98/, "0") } }, { email: { contains: term } }] } : {}),
    ...(gender === "male" || gender === "female" ? { gender } : gender === "none" ? { gender: null } : {}),
  };

  const [total, users, allCount] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: sort === "oldest" ? { id: "asc" } : sort === "name" ? { name: "asc" } : { id: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { orders: true, enrollments: true, analysisRequests: true } } },
    }),
    db.user.count(),
  ]);

  const filtered = Boolean(q || gender || sort);

  return (
    <>
      <AdminPageHeader
        title="کاربران"
        description={`${formatNumber(allCount)} کاربر در سایت ثبت‌نام کرده‌اند.`}
        crumbs={[{ label: "کاربران" }]}
        actions={
          <Link href="/admins/users/new/" className="adm-btn adm-btn-primary">
            <Plus className="h-4 w-4" />
            افزودن کاربر
          </Link>
        }
      />

      <div className="adm-card overflow-hidden">
        <FilterBar q={q} placeholder="جستجوی نام، موبایل یا ایمیل..." resetHref="/admins/users/" active={filtered}>
          <select name="gender" defaultValue={gender} className="adm-input sm:w-40" aria-label="جنسیت">
            <option value="">همه‌ی جنسیت‌ها</option>
            <option value="female">زن</option>
            <option value="male">مرد</option>
            <option value="none">نامشخص</option>
          </select>
          <select name="sort" defaultValue={sort} className="adm-input sm:w-40" aria-label="مرتب‌سازی">
            <option value="">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="name">بر اساس نام</option>
          </select>
        </FilterBar>

        {users.length === 0 ? (
          <EmptyState
            title={filtered ? "کاربری پیدا نشد" : "هنوز کاربری ثبت نشده"}
            description={filtered ? "فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید." : "کاربران سایت پس از ثبت‌نام اینجا نمایش داده می‌شوند."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table min-w-[860px]">
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>موبایل</th>
                  <th>جنسیت</th>
                  <th>تاریخ تولد</th>
                  <th>فعالیت</th>
                  <th>تاریخ عضویت</th>
                  <th className="text-end">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const id = u.id.toString();
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admins/users/${id}/`} className="group flex items-center gap-3">
                          <UserAvatar name={u.name} src={u.avatar} />
                          <span className="min-w-0">
                            <span className="block max-w-[220px] truncate font-medium text-cream group-hover:text-gold-300">{u.name || <span className="text-muted">بدون نام</span>}</span>
                            {u.email && <span className="block max-w-[220px] truncate text-xs text-muted" dir="ltr">{u.email}</span>}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap" dir="ltr">
                        <span className="block text-end">{toFa(u.mobile)}</span>
                      </td>
                      <td>{u.gender ? GENDER_LABEL[u.gender] : <span className="text-muted">—</span>}</td>
                      <td className="whitespace-nowrap text-xs">{faDateOnly(u.birthDate)}</td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="adm-badge adm-badge-muted">{toFa(u._count.orders)} سفارش</span>
                          <span className="adm-badge adm-badge-muted">{toFa(u._count.enrollments)} دوره</span>
                          {u._count.analysisRequests > 0 && <span className="adm-badge adm-badge-info">{toFa(u._count.analysisRequests)} تحلیل</span>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-xs text-muted">{faDate(u.createdAt)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admins/users/${id}/`} className="adm-icon-btn" title="ویرایش" aria-label="ویرایش">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ConfirmAction
                            action={deleteUserAction.bind(null, id, undefined)}
                            title="حذف کاربر؟"
                            description={<>کاربر <b className="text-cream">«{u.name || u.mobile}»</b> و دسترسی‌ها و درخواست‌هایش حذف می‌شود.</>}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q, gender, sort }} />
      </div>
    </>
  );
}
