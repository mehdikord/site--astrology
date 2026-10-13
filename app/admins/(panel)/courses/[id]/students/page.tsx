import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { PER_PAGE, normalizeDigits, pageParam, parseId, strParam } from "@/lib/admin/utils";
import { AdminPageHeader, EmptyState, FilterBar, Pagination } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import UserAvatar from "@/components/admin/UserAvatar";
import { ENROLLMENT_SOURCE } from "@/lib/admin/labels";
import { currentJalaliYear, faDate } from "@/lib/jalali";
import { toFa } from "@/lib/format";
import GrantAccessForm from "./GrantAccessForm";
import { deleteEnrollmentAction, grantAccessAction, toggleEnrollmentAction } from "../../actions";

export const metadata: Metadata = { title: "دانشجویان دوره" };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function CourseStudentsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const { id } = await params;
  const courseId = parseId(id);
  if (!courseId) notFound();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });
  if (!course) notFound();

  const sp = await searchParams;
  const q = strParam(sp.q);
  const page = pageParam(sp.page);
  const term = normalizeDigits(q);
  const where = {
    courseId,
    ...(term ? { user: { OR: [{ name: { contains: term } }, { mobile: { contains: term } }, { email: { contains: term } }] } } : {}),
  };

  const [total, enrollments, activeCount] = await Promise.all([
    db.courseEnrollment.count({ where }),
    db.courseEnrollment.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: true, order: { select: { id: true, orderNumber: true } } },
    }),
    db.courseEnrollment.count({ where: { courseId, isActive: true } }),
  ]);
  const now = new Date();

  return (
    <>
      <AdminPageHeader
        title="دانشجویان دوره"
        description={`${course.title} — ${toFa(activeCount)} دسترسی فعال`}
        crumbs={[{ label: "دوره‌ها", href: "/admins/courses/" }, { label: course.title, href: `/admins/courses/${id}/` }, { label: "دانشجویان" }]}
        actions={
          <Link href={`/admins/courses/${id}/`} className="adm-btn adm-btn-secondary">
            <Pencil className="h-4 w-4" />
            ویرایش دوره
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="adm-card overflow-hidden xl:col-span-2">
          <FilterBar q={q} placeholder="جستجوی نام، موبایل یا ایمیل..." resetHref={`/admins/courses/${id}/students/`} active={Boolean(q)} />
          {enrollments.length === 0 ? (
            <EmptyState title={q ? "نتیجه‌ای پیدا نشد" : "هنوز دانشجویی ندارد"} description="پس از پرداخت سفارش یا اعطای دسترسی، دانشجویان اینجا نمایش داده می‌شوند." />
          ) : (
            <div className="overflow-x-auto">
              <table className="adm-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>کاربر</th>
                    <th>منبع</th>
                    <th>انقضا</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                    <th className="text-end">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const eid = e.id.toString();
                    const expired = e.expiresAt && e.expiresAt < now;
                    return (
                      <tr key={eid}>
                        <td>
                          <Link href={`/admins/users/${e.userId}/`} className="group flex items-center gap-3">
                            <UserAvatar name={e.user.name} src={e.user.avatar} />
                            <span>
                              <span className="block font-medium text-cream group-hover:text-gold-300">{e.user.name || "بدون نام"}</span>
                              <span className="block text-xs text-muted" dir="ltr">{toFa(e.user.mobile)}</span>
                            </span>
                          </Link>
                        </td>
                        <td>
                          <span className="adm-badge adm-badge-muted">{ENROLLMENT_SOURCE[e.source]}</span>
                          {e.order && (
                            <Link href={`/admins/orders/${e.order.id}/`} className="mt-1 block text-xs text-gold-400 hover:text-gold-300" dir="ltr">#{e.order.orderNumber}</Link>
                          )}
                        </td>
                        <td className="whitespace-nowrap text-xs">{e.expiresAt ? <span className={expired ? "text-rose-300" : ""}>{faDate(e.expiresAt)}</span> : <span className="text-muted">دائمی</span>}</td>
                        <td>
                          <form action={toggleEnrollmentAction.bind(null, eid)}>
                            <button type="submit" className={`adm-badge cursor-pointer hover:brightness-125 ${e.isActive && !expired ? "adm-badge-success" : "adm-badge-muted"}`} title="تغییر وضعیت">
                              {expired ? "منقضی" : e.isActive ? "فعال" : "غیرفعال"}
                            </button>
                          </form>
                        </td>
                        <td className="whitespace-nowrap text-xs text-muted">{faDate(e.createdAt)}</td>
                        <td>
                          <div className="flex justify-end">
                            <ConfirmAction
                              action={deleteEnrollmentAction.bind(null, eid)}
                              title="حذف دسترسی؟"
                              description={<>دسترسی <b className="text-cream">{e.user.name || e.user.mobile}</b> به این دوره حذف می‌شود.</>}
                              confirmLabel="حذف دسترسی"
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
          <Pagination page={page} total={total} perPage={PER_PAGE} params={{ q }} />
        </div>

        <div>
          <GrantAccessForm key={total} action={grantAccessAction.bind(null, id)} maxYear={currentJalaliYear()} />
        </div>
      </div>
    </>
  );
}
