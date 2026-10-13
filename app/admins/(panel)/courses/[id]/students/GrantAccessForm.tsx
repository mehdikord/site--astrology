"use client";

import { KeyRound } from "lucide-react";
import { Field, FormSection, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import { JalaliDateTimeInput } from "@/components/admin/form/editors";
import type { FormState } from "@/lib/admin/utils";

export default function GrantAccessForm({ action, maxYear }: { action: (s: FormState, d: FormData) => Promise<FormState>; maxYear: number }) {
  const { pending, onSubmit, err } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="اعطای دسترسی" description="اگر کاربری با این موبایل وجود نداشته باشد، ساخته می‌شود.">
        <Field label="شماره موبایل" name="mobile" error={err("mobile")} required>
          <input id="mobile" name="mobile" className="adm-input text-left" dir="ltr" inputMode="tel" placeholder="09121234567" {...invalid(err("mobile"), "mobile")} />
        </Field>
        <Field label="نام (برای کاربر جدید)" name="name" error={err("name")}>
          <input id="name" name="name" className="adm-input" />
        </Field>
        <Field label="انقضای دسترسی" name="expiresAt" error={err("expiresAt")} hint="خالی = دسترسی دائمی">
          <JalaliDateTimeInput name="expiresAt" error={err("expiresAt")} minYear={1404} maxYear={maxYear + 5} />
        </Field>
        <SubmitButton pending={pending}>
          {!pending && <KeyRound className="h-4 w-4" />}
          اعطای دسترسی
        </SubmitButton>
      </FormSection>
    </form>
  );
}
