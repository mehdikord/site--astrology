import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/auth";
import { parseId } from "@/lib/admin/utils";
import { AdminPageHeader } from "@/components/admin/ui";
import { AdminForm } from "../AdminForms";
import { saveAdminAction } from "../actions";

export const metadata: Metadata = { title: "ویرایش مدیر" };

export default async function EditAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const adminId = parseId(id);
  if (!adminId) notFound();
  if (id === me.id) redirect("/admins/profile/");
  const a = await db.admin.findUnique({ where: { id: adminId } });
  if (!a) notFound();

  return (
    <>
      <AdminPageHeader title={a.name} description="ویرایش اطلاعات مدیر" crumbs={[{ label: "مدیران", href: "/admins/admins/" }, { label: "ویرایش" }]} />
      <AdminForm action={saveAdminAction.bind(null, id)} values={{ name: a.name, mobile: a.mobile, email: a.email }} isNew={false} />
    </>
  );
}
