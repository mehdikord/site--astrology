import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, HelpCircle, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import ConfirmAction from "@/components/admin/ConfirmAction";
import { toFa } from "@/lib/format";
import ServiceForm, { type ServiceFormValues } from "../ServiceForm";
import { deleteServiceAction, updateServiceAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش خدمت" };

const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = parseId(id);
  if (!serviceId) notFound();

  const s = await db.service.findUnique({
    where: { id: serviceId },
    include: { steps: { orderBy: { sortOrder: "asc" } }, _count: { select: { faqs: true } } },
  });
  if (!s) notFound();

  const values: ServiceFormValues = {
    title: s.title,
    titleEn: s.titleEn ?? "",
    slug: s.slug,
    icon: s.icon ?? "matrix",
    tagline: s.tagline ?? "",
    shortDescription: s.shortDescription ?? "",
    intro: s.intro ?? "",
    image: s.image,
    price: String(s.price),
    oldPrice: s.oldPrice ? String(s.oldPrice) : "",
    duration: s.duration ?? "",
    format: s.format ?? "",
    delivery: s.delivery ?? "",
    forWho: list(s.forWho),
    deliverables: list(s.deliverables),
    requirements: list(s.requirements),
    steps: s.steps.map((st) => ({ title: st.title, description: st.description ?? "" })),
    isActive: s.isActive,
    sortOrder: String(s.sortOrder),
    metaTitle: s.metaTitle ?? "",
    metaDescription: s.metaDescription ?? "",
  };

  return (
    <>
      <AdminPageHeader
        title={s.title}
        description="ویرایش اطلاعات خدمت"
        crumbs={[{ label: "خدمات", href: "/admins/services/" }, { label: "ویرایش" }]}
        actions={
          <>
            <Link href={`/admins/faqs/?service=${id}`} className="adm-btn adm-btn-secondary">
              <HelpCircle className="h-4 w-4" />
              سوالات متداول ({toFa(s._count.faqs)})
            </Link>
            <a href={`/services/${s.slug}/`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-secondary">
              <ExternalLink className="h-4 w-4" />
              مشاهده
            </a>
            <ConfirmAction
              action={deleteServiceAction.bind(null, id, "/admins/services/")}
              title="حذف خدمت؟"
              description={<>خدمت <b className="text-cream">«{s.title}»</b> همراه با مراحل و سوالات متداولش حذف می‌شود.</>}
              triggerClassName="adm-btn adm-btn-secondary hover:!border-rose-500/40 hover:!bg-rose-500/10 hover:!text-rose-300"
              trigger={<><Trash2 className="h-4 w-4" />حذف</>}
            />
          </>
        }
      />
      <ServiceForm key={s.updatedAt.getTime()} action={updateServiceAction.bind(null, id)} values={values} submitLabel="ذخیره‌ی تغییرات" />
    </>
  );
}
