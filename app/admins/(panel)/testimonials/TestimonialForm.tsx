"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, ImageInput, SubmitButton, Switch, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";

export type TestimonialFormValues = {
  name: string;
  subtitle: string;
  content: string;
  rating: string;
  related: string; // service:1 | course:2 | ""
  avatar: string | null;
  isActive: boolean;
  sortOrder: string;
};

export const emptyTestimonial: TestimonialFormValues = { name: "", subtitle: "", content: "", rating: "5", related: "", avatar: null, isActive: true, sortOrder: "0" };

export default function TestimonialForm({
  action,
  values,
  options,
  submitLabel,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: TestimonialFormValues;
  options: { services: { id: string; title: string }[]; courses: { id: string; title: string }[] };
  submitLabel: string;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof TestimonialFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl space-y-6">
      <FormAlert state={state} />
      <FormSection title="نظر مشتری">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="shrink-0 sm:w-36">
            <div className="adm-label text-center">تصویر (اختیاری)</div>
            <ImageInput name="avatar" defaultValue={values.avatar} error={err("avatar")} round />
          </div>
          <div className="grid flex-1 gap-5 sm:grid-cols-2">
            <Field label="نام" name="name" error={err("name")} required hint="مثلاً: نگار م.">
              <input {...input("name")} defaultValue={values.name} className="adm-input" />
            </Field>
            <Field label="عنوان زیر نام" name="subtitle" error={err("subtitle")} hint="خالی = عنوان مورد مرتبط">
              <input {...input("subtitle")} defaultValue={values.subtitle} className="adm-input" placeholder="تحلیل ماتریکس" />
            </Field>
            <Field label="مرتبط با" name="related" error={err("related")}>
              <select {...input("related")} defaultValue={values.related} className="adm-input">
                <option value="">— هیچ‌کدام —</option>
                <optgroup label="خدمات">
                  {options.services.map((s) => <option key={s.id} value={`service:${s.id}`}>{s.title}</option>)}
                </optgroup>
                <optgroup label="دوره‌ها">
                  {options.courses.map((c) => <option key={c.id} value={`course:${c.id}`}>{c.title}</option>)}
                </optgroup>
              </select>
            </Field>
            <Field label="امتیاز" name="rating" error={err("rating")}>
              <select {...input("rating")} defaultValue={values.rating} className="adm-input">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <Field label="متن نظر" name="content" error={err("content")} required>
          <textarea {...input("content")} defaultValue={values.content} rows={5} className="adm-input" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Switch name="isActive" defaultChecked={values.isActive} label="نمایش در سایت" description="فقط نظرات تاییدشده در صفحه‌ی اصلی نمایش داده می‌شوند." />
          <Field label="ترتیب نمایش" name="sortOrder" error={err("sortOrder")}>
            <input {...input("sortOrder")} defaultValue={values.sortOrder} inputMode="numeric" className="adm-input" />
          </Field>
        </div>
      </FormSection>
      <div className="flex gap-2">
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {submitLabel}
        </SubmitButton>
        <Link href="/admins/testimonials/" className="adm-btn adm-btn-secondary">انصراف</Link>
      </div>
    </form>
  );
}
