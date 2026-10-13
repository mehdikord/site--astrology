import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui";
import { dateToJalali } from "@/lib/jalali";
import UserForm, { emptyUser } from "../UserForm";
import { createUserAction } from "../actions";

export const metadata: Metadata = { title: "افزودن کاربر" };

export default function NewUserPage() {
  return (
    <>
      <AdminPageHeader title="افزودن کاربر" crumbs={[{ label: "کاربران", href: "/admins/users/" }, { label: "افزودن" }]} />
      <div className="max-w-4xl">
        <UserForm action={createUserAction} values={emptyUser} submitLabel="ایجاد کاربر" currentJalaliYear={dateToJalali(new Date()).jy} />
      </div>
    </>
  );
}
