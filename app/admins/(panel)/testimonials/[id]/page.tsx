import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import TestimonialForm from "../TestimonialForm";
import { deleteTestimonialAction, updateTestimonialAction } from "../actions";
import { relatedOptions } from "../options";

export const metadata: Metadata = { title: "ویرایش نظر" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tid = parseId(id);
  if (!tid) notFound();
  const [t, options] = await Promise.all([db.testimonial.findUnique({ where: { id: tid } }), relatedOptions()]);
  if (!t) notFound();

  return (
    <>
      <AdminPageHeader
        title={`نظر ${t.name}`}
        crumbs={[{ label: "نظرات مشتریان", href: "/admins/testimonials/" }, { label: "ویرایش" }]}
        actions={
          <ConfirmAction
            action={deleteTestimonialAction.bind(null, id, "/admins/testimonials/")}
            title="حذف نظر؟"
            triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
            trigger={<><Trash2 className="h-4 w-4" />حذف</>}
          />
        }
      />
      <TestimonialForm
        action={updateTestimonialAction.bind(null, id)}
        options={options}
        submitLabel="ذخیره‌ی تغییرات"
        values={{
          name: t.name,
          subtitle: t.subtitle ?? "",
          content: t.content,
          rating: String(t.rating),
          related: t.serviceId ? `service:${t.serviceId}` : t.courseId ? `course:${t.courseId}` : "",
          avatar: t.avatar,
          isActive: t.isActive,
          sortOrder: String(t.sortOrder),
        }}
      />
    </>
  );
}
