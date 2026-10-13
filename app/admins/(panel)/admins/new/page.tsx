import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { AdminForm } from "../AdminForms";
import { saveAdminAction } from "../actions";

export const metadata: Metadata = { title: "افزودن مدیر" };

export default function NewAdminPage() {
  return (
    <>
      <AdminPageHeader title="افزودن مدیر" crumbs={[{ label: "مدیران", href: "/admins/admins/" }, { label: "افزودن" }]} />
      <AdminForm action={saveAdminAction.bind(null, null)} values={{ name: "", mobile: "", email: "" }} isNew />
    </>
  );
}
