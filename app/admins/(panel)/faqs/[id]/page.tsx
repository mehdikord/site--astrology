import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import FaqForm from "../FaqForm";
import { deleteFaqAction, updateFaqAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش سوال متداول" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faqId = parseId(id);
  if (!faqId) notFound();

  const [faq, services] = await Promise.all([
    db.serviceFaq.findUnique({ where: { id: faqId } }),
    db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true } }),
  ]);
  if (!faq) notFound();

  const back = faq.serviceId ? `/admins/faqs/?service=${faq.serviceId}` : "/admins/faqs/?service=general";

  return (
    <>
      <AdminPageHeader
        title="ویرایش سوال متداول"
        crumbs={[{ label: "سوالات متداول", href: "/admins/faqs/" }, { label: "ویرایش" }]}
        actions={
          <ConfirmAction
            action={deleteFaqAction.bind(null, id, back)}
            title="حذف سوال؟"
            description={<>سوال <b className="text-cream">«{faq.question}»</b> حذف می‌شود.</>}
            triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
            trigger={<><Trash2 className="h-4 w-4" />حذف</>}
          />
        }
      />
      <FaqForm
        action={updateFaqAction.bind(null, id)}
        values={{ serviceId: faq.serviceId?.toString() ?? "", question: faq.question, answer: faq.answer, sortOrder: String(faq.sortOrder) }}
        services={services.map((s) => ({ id: s.id.toString(), title: s.title }))}
        submitLabel="ذخیره‌ی تغییرات"
        cancelHref={back}
      />
    </>
  );
}
