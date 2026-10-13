"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";

export type FaqFormValues = { serviceId: string; question: string; answer: string; sortOrder: string };

export default function FaqForm({
  action,
  values,
  services,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: FaqFormValues;
  services: { id: string; title: string }[];
  submitLabel: string;
  cancelHref: string;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof FaqFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      <FormAlert state={state} />
      <FormSection title="سوال و پاسخ">
        <Field label="مربوط به" name="serviceId" error={err("serviceId")} hint="سوالات عمومی به هیچ خدمتی وابسته نیستند.">
          <select {...input("serviceId")} defaultValue={values.serviceId} className="adm-input">
            <option value="">سوال عمومی سایت</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </Field>
        <Field label="سوال" name="question" error={err("question")} required>
          <input {...input("question")} defaultValue={values.question} className="adm-input" placeholder="مثلاً: اگر ساعت تولدم را دقیق ندانم چه می‌شود؟" />
        </Field>
        <Field label="پاسخ" name="answer" error={err("answer")} required>
          <textarea {...input("answer")} defaultValue={values.answer} rows={6} className="adm-input" />
        </Field>
        <Field label="ترتیب نمایش" name="sortOrder" error={err("sortOrder")} hint="خالی بگذارید تا در انتهای لیست قرار بگیرد." className="sm:max-w-48">
          <input {...input("sortOrder")} defaultValue={values.sortOrder} inputMode="numeric" className="adm-input" />
        </Field>
      </FormSection>
      <div className="flex gap-2">
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {submitLabel}
        </SubmitButton>
        <Link href={cancelHref} className="adm-btn adm-btn-secondary">انصراف</Link>
      </div>
    </form>
  );
}
