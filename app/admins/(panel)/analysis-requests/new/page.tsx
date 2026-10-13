import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/ui";
import { parseId } from "@/lib/admin/utils";
import { currentJalaliYear } from "@/lib/jalali";
import RequestForm from "../RequestForm";
import { createRequestAction } from "../actions";
import { serviceOptions } from "../options";

export const metadata: Metadata = { title: "ثبت درخواست تحلیل" };

export default async function NewRequestPage({ searchParams }: { searchParams: Promise<{ order?: string; service?: string; user?: string }> }) {
  const sp = await searchParams;
  const orderId = parseId(sp.order);
  const userId = parseId(sp.user);
  const [services, order, user] = await Promise.all([
    serviceOptions(),
    orderId ? db.order.findUnique({ where: { id: orderId }, include: { user: true } }) : null,
    userId ? db.user.findUnique({ where: { id: userId } }) : null,
  ]);
  const owner = order?.user ?? user;

  return (
    <>
      <AdminPageHeader
        title="ثبت درخواست تحلیل"
        description={order ? `برای سفارش #${order.orderNumber}` : "برای سفارش‌هایی که از تلگرام، واتس‌اپ یا حضوری دریافت می‌شوند."}
        crumbs={[{ label: "درخواست‌های تحلیل", href: "/admins/analysis-requests/" }, { label: "ثبت درخواست" }]}
      />
      <RequestForm
        action={createRequestAction}
        services={services}
        submitLabel="ثبت درخواست"
        maxYear={currentJalaliYear()}
        isNew
        cancelHref={order ? `/admins/orders/${order.id}/` : "/admins/analysis-requests/"}
        values={{
          mobile: owner?.mobile ?? "",
          userName: owner?.name ?? "",
          serviceId: sp.service && services.some((s) => s.id === sp.service) ? sp.service : "",
          orderId: order ? order.id.toString() : "",
          fullName: owner?.name ?? "",
          gender: owner?.gender ?? "",
          birthDate: "",
          birthTime: "",
          birthTimeAccuracy: "exact",
          birthCity: "",
          birthCountry: "ایران",
          questions: "",
          status: order?.status === "paid" ? "pending" : "pending_payment",
          adminNote: "",
        }}
      />
    </>
  );
}
