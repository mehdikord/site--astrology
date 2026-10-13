"use client";

import Link from "next/link";
import { KeyRound, Save } from "lucide-react";
import { Field, FormAlert, FormSection, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";

type Action = (state: FormState, data: FormData) => Promise<FormState>;
type Values = { name: string; mobile: string; email: string };

function IdentityFields({ values, err }: { values: Values; err: (n: string) => string | undefined }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="نام" name="name" error={err("name")} required className="sm:col-span-2">
        <input id="name" name="name" defaultValue={values.name} className="adm-input" {...invalid(err("name"), "name")} />
      </Field>
      <Field label="شماره موبایل" name="mobile" error={err("mobile")} required>
        <input id="mobile" name="mobile" defaultValue={values.mobile} className="adm-input text-left" dir="ltr" inputMode="tel" {...invalid(err("mobile"), "mobile")} />
      </Field>
      <Field label="ایمیل" name="email" error={err("email")} required>
        <input id="email" name="email" type="email" defaultValue={values.email} className="adm-input text-left" dir="ltr" {...invalid(err("email"), "email")} />
      </Field>
    </div>
  );
}

function PasswordFields({ err, optional }: { err: (n: string) => string | undefined; optional?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={optional ? "گذرواژه‌ی جدید" : "گذرواژه"} name="password" error={err("password")} required={!optional} hint={optional ? "خالی = بدون تغییر" : "حداقل ۸ کاراکتر"}>
        <input id="password" name="password" type="password" autoComplete="new-password" className="adm-input text-left" dir="ltr" {...invalid(err("password"), "password")} />
      </Field>
      <Field label="تکرار گذرواژه" name="passwordConfirm" error={err("passwordConfirm")} required={!optional}>
        <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" className="adm-input text-left" dir="ltr" {...invalid(err("passwordConfirm"), "passwordConfirm")} />
      </Field>
    </div>
  );
}

export function AdminForm({ action, values, isNew }: { action: Action; values: Values; isNew: boolean }) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      <FormAlert state={state} />
      <FormSection title="اطلاعات مدیر" description="ورود به پنل با موبایل یا ایمیل و گذرواژه انجام می‌شود.">
        <IdentityFields values={values} err={err} />
      </FormSection>
      <FormSection title="گذرواژه">
        <PasswordFields err={err} optional={!isNew} />
      </FormSection>
      <div className="flex gap-2">
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {isNew ? "افزودن مدیر" : "ذخیره‌ی تغییرات"}
        </SubmitButton>
        <Link href="/admins/admins/" className="adm-btn adm-btn-secondary">انصراف</Link>
      </div>
    </form>
  );
}

export function ProfileForm({ action, values }: { action: Action; values: Values }) {
  const { pending, onSubmit, err } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="اطلاعات حساب">
        <IdentityFields values={values} err={err} />
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          ذخیره
        </SubmitButton>
      </FormSection>
    </form>
  );
}

export function ChangePasswordForm({ action }: { action: Action }) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  return (
    <form key={state.ok ? "done" : "form"} onSubmit={onSubmit} noValidate>
      <FormSection title="تغییر گذرواژه" description="پس از تغییر، نشست‌های شما در دستگاه‌های دیگر خارج می‌شوند.">
        <Field label="گذرواژه‌ی فعلی" name="current" error={err("current")} required>
          <input id="current" name="current" type="password" autoComplete="current-password" className="adm-input text-left" dir="ltr" {...invalid(err("current"), "current")} />
        </Field>
        <PasswordFields err={err} />
        <SubmitButton pending={pending}>
          {!pending && <KeyRound className="h-4 w-4" />}
          تغییر گذرواژه
        </SubmitButton>
      </FormSection>
    </form>
  );
}
