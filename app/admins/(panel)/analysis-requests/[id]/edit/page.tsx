import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/ui";
import { parseId } from "@/lib/admin/utils";
import { currentJalaliYear, formatJalaliInput } from "@/lib/jalali";
import RequestForm from "../../RequestForm";
import { updateRequestAction } from "../../actions";
import { formatTime, serviceOptions } from "../../options";

export const metadata: Metadata = { title: "ویرایش درخواست تحلیل" };

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rid = parseId(id);
  if (!rid) notFound();
  const [r, services] = await Promise.all([db.analysisRequest.findUnique({ where: { id: rid }, include: { user: true } }), serviceOptions()]);
  if (!r) notFound();

  return (
    <>
      <AdminPageHeader
        title={`ویرایش درخواست ${r.fullName}`}
        crumbs={[{ label: "درخواست‌های تحلیل", href: "/admins/analysis-requests/" }, { label: r.fullName, href: `/admins/analysis-requests/${id}/` }, { label: "ویرایش" }]}
      />
      <RequestForm
        action={updateRequestAction.bind(null, id)}
        services={services}
        submitLabel="ذخیره‌ی تغییرات"
        maxYear={currentJalaliYear()}
        isNew={false}
        cancelHref={`/admins/analysis-requests/${id}/`}
        values={{
          mobile: r.user.mobile,
          userName: r.user.name ?? "",
          serviceId: r.serviceId.toString(),
          orderId: r.orderId?.toString() ?? "",
          fullName: r.fullName,
          gender: r.gender ?? "",
          birthDate: formatJalaliInput(r.birthDate),
          birthTime: formatTime(r.birthTime),
          birthTimeAccuracy: r.birthTimeAccuracy,
          birthCity: r.birthCity ?? "",
          birthCountry: r.birthCountry ?? "",
          questions: r.questions ?? "",
          status: r.status,
          adminNote: r.adminNote ?? "",
        }}
      />
    </>
  );
}
