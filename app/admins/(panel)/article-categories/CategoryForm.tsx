"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormSection, SubmitButton, Switch, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";

export type CategoryFormValues = { name: string; slug: string; description: string; isActive: boolean; sortOrder: string };

export default function CategoryForm({
  action,
  values,
  editing,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: CategoryFormValues;
  editing: boolean;
}) {
  const { pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof CategoryFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title={editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}>
        <Field label="نام" name="name" error={err("name")} required>
          <input {...input("name")} defaultValue={values.name} className="adm-input" placeholder="مثلاً: ماتریکس" />
        </Field>
        <Field label="نامک" name="slug" error={err("slug")} hint="در آدرس صفحه‌ی دسته استفاده می‌شود؛ خالی = از نام">
          <input {...input("slug")} defaultValue={values.slug} className="adm-input text-left" dir="ltr" />
        </Field>
        <Field label="توضیح" name="description" error={err("description")}>
          <textarea {...input("description")} defaultValue={values.description} rows={3} className="adm-input" />
        </Field>
        <Field label="ترتیب نمایش" name="sortOrder" error={err("sortOrder")}>
          <input {...input("sortOrder")} defaultValue={values.sortOrder} inputMode="numeric" className="adm-input" />
        </Field>
        <Switch name="isActive" defaultChecked={values.isActive} label="فعال" description="دسته‌ی غیرفعال در فیلتر مقالات سایت نمایش داده نمی‌شود." />
        <div className="flex gap-2 border-t border-white/[0.06] pt-5">
          <SubmitButton pending={pending}>
            {!pending && <Save className="h-4 w-4" />}
            {editing ? "ذخیره" : "افزودن"}
          </SubmitButton>
          {editing && <Link href="/admins/article-categories/" className="adm-btn adm-btn-secondary">انصراف</Link>}
        </div>
      </FormSection>
    </form>
  );
}
