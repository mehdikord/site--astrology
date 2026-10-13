import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/ui";
import { parseId } from "@/lib/admin/utils";
import { currentJalaliYear } from "@/lib/jalali";
import OrderForm from "../OrderForm";
import { createOrderAction } from "../actions";

export const metadata: Metadata = { title: "ثبت سفارش" };

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { user: userParam } = await searchParams;
  const userId = parseId(userParam);
  const [courses, services, user] = await Promise.all([
    db.course.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true, price: true } }),
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true, price: true } }),
    userId ? db.user.findUnique({ where: { id: userId }, select: { mobile: true, name: true } }) : null,
  ]);

  return (
    <>
      <AdminPageHeader
        title="ثبت سفارش دستی"
        description="برای سفارش‌هایی که از تلگرام، واتس‌اپ یا حضوری دریافت می‌شوند."
        crumbs={[{ label: "سفارش‌ها", href: "/admins/orders/" }, { label: "ثبت سفارش" }]}
      />
      <OrderForm
        action={createOrderAction}
        courses={courses.map((c) => ({ key: `course:${c.id}`, title: c.title, price: c.price }))}
        services={services.map((s) => ({ key: `service:${s.id}`, title: s.title, price: s.price }))}
        maxYear={currentJalaliYear()}
        defaults={{ mobile: user?.mobile ?? "", name: user?.name ?? "" }}
      />
    </>
  );
}
