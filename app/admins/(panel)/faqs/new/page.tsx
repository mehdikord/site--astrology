import type { Metadata } from "next";
import { db } from "@/lib/db";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import FaqForm from "../FaqForm";
import { createFaqAction } from "../actions";

export const metadata: Metadata = { title: "افزودن سوال متداول" };

export default async function NewFaqPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service = "" } = await searchParams;
  const services = await db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true, title: true } });
  const preselected = parseId(service);
  const serviceId = preselected && services.some((s) => s.id === preselected) ? preselected.toString() : "";

  return (
    <>
      <AdminPageHeader title="افزودن سوال متداول" crumbs={[{ label: "سوالات متداول", href: "/admins/faqs/" }, { label: "افزودن" }]} />
      <FaqForm
        action={createFaqAction}
        values={{ serviceId, question: "", answer: "", sortOrder: "" }}
        services={services.map((s) => ({ id: s.id.toString(), title: s.title }))}
        submitLabel="افزودن سوال"
        cancelHref={service ? `/admins/faqs/?service=${service}` : "/admins/faqs/"}
      />
    </>
  );
}
