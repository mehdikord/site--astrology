import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminPageHeader } from "@/components/admin/ui";
import { ChangePasswordForm, ProfileForm } from "../admins/AdminForms";
import { changePasswordAction, updateProfileAction } from "../admins/actions";

export const metadata: Metadata = { title: "پروفایل من" };

export default async function ProfilePage() {
  const me = await requireAdmin();
  return (
    <>
      <AdminPageHeader title="پروفایل من" crumbs={[{ label: "پروفایل من" }]} />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
        <ProfileForm action={updateProfileAction} values={{ name: me.name, mobile: me.mobile, email: me.email }} />
        <ChangePasswordForm action={changePasswordAction} />
      </div>
    </>
  );
}
