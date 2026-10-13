"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, ImageInput, JalaliDateInput, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";

export type UserFormValues = {
  name: string;
  mobile: string;
  email: string;
  bio: string;
  avatar: string | null;
  birthDate: string; // 1370/05/20
  gender: string;
};

export const emptyUser: UserFormValues = { name: "", mobile: "", email: "", bio: "", avatar: null, birthDate: "", gender: "" };

export default function UserForm({
  action,
  values,
  submitLabel,
  currentJalaliYear,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: UserFormValues;
  submitLabel: string;
  currentJalaliYear: number;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof UserFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <FormAlert state={state} />

      <FormSection title="اطلاعات کاربر">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="shrink-0 sm:w-36">
            <div className="adm-label text-center">تصویر</div>
            <ImageInput name="avatar" defaultValue={values.avatar} error={err("avatar")} round />
          </div>
          <div className="grid flex-1 gap-5 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" name="name" error={err("name")}>
              <input {...input("name")} defaultValue={values.name} className="adm-input" autoComplete="off" />
            </Field>
            <Field label="شماره موبایل" name="mobile" error={err("mobile")} required>
              <input {...input("mobile")} defaultValue={values.mobile} className="adm-input text-left" dir="ltr" inputMode="tel" placeholder="09121234567" autoComplete="off" />
            </Field>
            <Field label="ایمیل" name="email" error={err("email")}>
              <input {...input("email")} defaultValue={values.email} type="email" className="adm-input text-left" dir="ltr" placeholder="name@example.com" autoComplete="off" />
            </Field>
            <Field label="جنسیت" name="gender" error={err("gender")}>
              <select {...input("gender")} defaultValue={values.gender} className="adm-input">
                <option value="">نامشخص</option>
                <option value="female">زن</option>
                <option value="male">مرد</option>
              </select>
            </Field>
            <Field label="تاریخ تولد (شمسی)" name="birthDate" error={err("birthDate")} className="sm:col-span-2">
              <JalaliDateInput name="birthDate" defaultValue={values.birthDate} error={err("birthDate")} maxYear={currentJalaliYear} />
            </Field>
          </div>
        </div>
        <Field label="بیو" name="bio" error={err("bio")}>
          <textarea {...input("bio")} defaultValue={values.bio} rows={4} className="adm-input" placeholder="توضیح کوتاه درباره‌ی کاربر..." />
        </Field>
      </FormSection>

      <div className="flex gap-2">
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {submitLabel}
        </SubmitButton>
        <Link href="/admins/users/" className="adm-btn adm-btn-secondary">انصراف</Link>
      </div>
    </form>
  );
}
