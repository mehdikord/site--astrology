"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, ImageInput, SubmitButton, Switch, invalid, useAdminForm } from "@/components/admin/form";
import { BlockEditor, JalaliDateTimeInput, type BlockValue } from "@/components/admin/form/editors";
import type { FormState } from "@/lib/admin/utils";

export type ArticleFormValues = {
  title: string;
  slug: string;
  articleCategoryId: string;
  excerpt: string;
  content: BlockValue[];
  image: string | null;
  status: "draft" | "published";
  publishedAt: string;
  isFeatured: boolean;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
};

export const emptyArticle: ArticleFormValues = {
  title: "", slug: "", articleCategoryId: "", excerpt: "", content: [{ type: "p", text: "" }], image: null, status: "draft",
  publishedAt: "", isFeatured: false, readTime: "", metaTitle: "", metaDescription: "",
};

export default function ArticleForm({
  action,
  values,
  categories,
  submitLabel,
  maxYear,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: ArticleFormValues;
  categories: { id: string; name: string }[];
  submitLabel: string;
  maxYear: number;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof ArticleFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <FormAlert state={state} />
        <FormSection title="مقاله">
          <Field label="عنوان" name="title" error={err("title")} required>
            <input {...input("title")} defaultValue={values.title} className="adm-input text-base font-bold" placeholder="عنوان مقاله" />
          </Field>
          <Field label="خلاصه" name="excerpt" error={err("excerpt")} hint="در کارت مقاله و ابتدای صفحه‌ی مقاله نمایش داده می‌شود.">
            <textarea {...input("excerpt")} defaultValue={values.excerpt} rows={3} className="adm-input" />
          </Field>
        </FormSection>

        <FormSection title="محتوا" description="مقاله از بلوک‌ها ساخته می‌شود: پاراگراف، تیتر، زیرتیتر، لیست (هر مورد در یک خط) و نقل‌قول.">
          <BlockEditor name="content" defaultValue={values.content} error={err("content")} />
        </FormSection>

        <FormSection title="سئو">
          <Field label="نامک (آدرس صفحه)" name="slug" error={err("slug")} hint="خالی بگذارید تا از عنوان ساخته شود.">
            <input {...input("slug")} defaultValue={values.slug} className="adm-input text-left" dir="ltr" />
          </Field>
          <Field label="عنوان سئو" name="metaTitle" error={err("metaTitle")}>
            <input {...input("metaTitle")} defaultValue={values.metaTitle} className="adm-input" />
          </Field>
          <Field label="توضیح سئو" name="metaDescription" error={err("metaDescription")} hint="خالی بگذارید تا از خلاصه استفاده شود.">
            <textarea {...input("metaDescription")} defaultValue={values.metaDescription} rows={3} className="adm-input" />
          </Field>
        </FormSection>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 xl:sticky xl:top-24">
          <FormSection title="انتشار">
            <Field label="وضعیت" name="status" error={err("status")}>
              <select {...input("status")} defaultValue={values.status} className="adm-input">
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشرشده</option>
              </select>
            </Field>
            <Field label="تاریخ انتشار" name="publishedAt" error={err("publishedAt")} hint="خالی = همین حالا. تاریخ آینده یعنی انتشار زمان‌بندی‌شده.">
              <JalaliDateTimeInput name="publishedAt" defaultValue={values.publishedAt} error={err("publishedAt")} minYear={1395} maxYear={maxYear + 1} />
            </Field>
            <Switch name="isFeatured" defaultChecked={values.isFeatured} label="مقاله‌ی ویژه" description="در بالای صفحه‌ی مقالات و به‌صورت بزرگ نمایش داده می‌شود." />
            <div className="flex gap-2 border-t border-white/[0.06] pt-5">
              <SubmitButton pending={pending}>
                {!pending && <Save className="h-4 w-4" />}
                {submitLabel}
              </SubmitButton>
              <Link href="/admins/articles/" className="adm-btn adm-btn-secondary">انصراف</Link>
            </div>
          </FormSection>

          <FormSection title="دسته‌بندی و جزئیات">
            <Field label="دسته‌بندی" name="articleCategoryId" error={err("articleCategoryId")} hint={<Link href="/admins/article-categories/" className="text-gold-400 hover:text-gold-300">مدیریت دسته‌بندی‌ها</Link>}>
              <select {...input("articleCategoryId")} defaultValue={values.articleCategoryId} className="adm-input">
                <option value="">بدون دسته‌بندی</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="زمان مطالعه (دقیقه)" name="readTime" error={err("readTime")} hint="خالی = محاسبه‌ی خودکار از تعداد کلمات">
              <input {...input("readTime")} defaultValue={values.readTime} inputMode="numeric" className="adm-input" />
            </Field>
          </FormSection>

          <FormSection title="تصویر شاخص">
            <ImageInput name="image" defaultValue={values.image} error={err("image")} />
          </FormSection>
        </div>
      </div>
    </form>
  );
}
