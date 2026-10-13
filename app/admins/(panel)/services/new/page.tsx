import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import ServiceForm, { emptyService } from "../ServiceForm";
import { createServiceAction } from "../actions";

export const metadata: Metadata = { title: "افزودن خدمت" };

export default function NewServicePage() {
  return (
    <>
      <AdminPageHeader title="افزودن خدمت" crumbs={[{ label: "خدمات", href: "/admins/services/" }, { label: "افزودن" }]} />
      <ServiceForm action={createServiceAction} values={emptyService} submitLabel="ایجاد خدمت" />
    </>
  );
}
