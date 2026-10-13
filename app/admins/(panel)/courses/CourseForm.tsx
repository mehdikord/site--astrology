"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, ImageInput, ListEditor, SubmitButton, Switch, invalid, useAdminForm } from "@/components/admin/form";
import { CurriculumEditor, JalaliDateTimeInput, type ChapterValue } from "@/components/admin/form/editors";
import type { FormState } from "@/lib/admin/utils";

export type CourseFormValues = {
  title: string;
  slug: string;
  subtitle: string;
  shortDescription: string;
  intro: string;
  introVideo: string;
  image: string | null;
  level: string;
  hours: string;
  sessionsCount: string;
  format: string;
  price: string;
  oldPrice: string;
  badge: string;
  learn: string[];
  forWho: string[];
  includes: string[];
  curriculum: ChapterValue[];
  isActive: boolean;
  sortOrder: string;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
};

export const emptyCourse: CourseFormValues = {
  title: "", slug: "", subtitle: "", shortDescription: "", intro: "", introVideo: "", image: null, level: "", hours: "", sessionsCount: "",
  format: "", price: "", oldPrice: "", badge: "", learn: [], forWho: [], includes: [], curriculum: [], isActive: true, sortOrder: "0",
  publishedAt: "", metaTitle: "", metaDescription: "",
};

export default function CourseForm({
  action,
  values,
  submitLabel,
  maxYear,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: CourseFormValues;
  submitLabel: string;
  maxYear: number;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof CourseFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <FormAlert state={state} />

        <FormSection title="اطلاعات اصلی">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="عنوان دوره" name="title" error={err("title")} required className="sm:col-span-2">
              <input {...input("title")} defaultValue={values.title} className="adm-input" placeholder="مثلاً: دوره‌ی جامع ماتریکس سرنوشت" />
            </Field>
            <Field label="زیرعنوان" name="subtitle" error={err("subtitle")}>
              <input {...input("subtitle")} defaultValue={values.subtitle} className="adm-input" placeholder="از صفر تا تحلیل حرفه‌ای" />
            </Field>
            <Field label="نامک (آدرس صفحه)" name="slug" error={err("slug")} hint="خالی بگذارید تا از عنوان ساخته شود.">
              <input {...input("slug")} defaultValue={values.slug} className="adm-input text-left" dir="ltr" placeholder="matrix-masterclass" />
            </Field>
            <Field label="توضیح کوتاه" name="shortDescription" error={err("shortDescription")} hint="در کارت دوره نمایش داده می‌شود." className="sm:col-span-2">
              <textarea {...input("shortDescription")} defaultValue={values.shortDescription} rows={3} className="adm-input" />
            </Field>
            <Field label="معرفی کامل" name="intro" error={err("intro")} hint="پاراگراف‌ها را با یک خط خالی از هم جدا کنید." className="sm:col-span-2">
              <textarea {...input("intro")} defaultValue={values.intro} rows={7} className="adm-input" />
            </Field>
            <Field label="لینک ویدیوی معرفی" name="introVideo" error={err("introVideo")} hint="با کلیک روی تصویر دوره پخش می‌شود (اختیاری)." className="sm:col-span-2">
              <input {...input("introVideo")} defaultValue={values.introVideo} className="adm-input text-left" dir="ltr" placeholder="https://..." />
            </Field>
          </div>
        </FormSection>

        <FormSection title="سرفصل‌ها و درس‌ها" description="هر سرفصل می‌تواند توضیح و چند درس داشته باشد. برای جزئیات درس (ویدیو، ضمیمه، توضیح) روی فلش کنار آن کلیک کنید.">
          <CurriculumEditor name="curriculum" defaultValue={values.curriculum} error={err("curriculum")} />
        </FormSection>

        <FormSection title="در این دوره چه یاد می‌گیری؟">
          <ListEditor name="learn" defaultValue={values.learn} placeholder="یک مهارت یا مبحث..." />
        </FormSection>

        <FormSection title="مناسب چه کسانی است؟">
          <ListEditor name="forWho" defaultValue={values.forWho} placeholder="یک گروه مخاطب..." />
        </FormSection>

        <FormSection title="این دوره شامل">
          <ListEditor name="includes" defaultValue={values.includes} placeholder="مثلاً: گواهی پایان دوره" />
        </FormSection>

        <FormSection title="سئو">
          <Field label="عنوان سئو" name="metaTitle" error={err("metaTitle")} hint="خالی بگذارید تا از عنوان دوره استفاده شود.">
            <input {...input("metaTitle")} defaultValue={values.metaTitle} className="adm-input" />
          </Field>
          <Field label="توضیح سئو" name="metaDescription" error={err("metaDescription")}>
            <textarea {...input("metaDescription")} defaultValue={values.metaDescription} rows={3} className="adm-input" />
          </Field>
        </FormSection>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 xl:sticky xl:top-24">
          <FormSection title="انتشار">
            <Switch name="isActive" defaultChecked={values.isActive} label="نمایش در سایت" description="دوره‌ی غیرفعال در سایت نمایش داده نمی‌شود." />
            <Field label="تاریخ انتشار" name="publishedAt" error={err("publishedAt")} hint="خالی = بلافاصله. اگر در آینده باشد، از آن زمان نمایش داده می‌شود.">
              <JalaliDateTimeInput name="publishedAt" defaultValue={values.publishedAt} error={err("publishedAt")} maxYear={maxYear + 1} minYear={1400} />
            </Field>
            <Field label="ترتیب نمایش" name="sortOrder" error={err("sortOrder")}>
              <input {...input("sortOrder")} defaultValue={values.sortOrder} inputMode="numeric" className="adm-input" />
            </Field>
            <div className="flex gap-2 border-t border-white/[0.06] pt-5">
              <SubmitButton pending={pending}>
                {!pending && <Save className="h-4 w-4" />}
                {submitLabel}
              </SubmitButton>
              <Link href="/admins/courses/" className="adm-btn adm-btn-secondary">انصراف</Link>
            </div>
          </FormSection>

          <FormSection title="قیمت (تومان)">
            <Field label="قیمت" name="price" error={err("price")} required hint="برای دوره‌ی رایگان ۰ وارد کنید.">
              <input {...input("price")} defaultValue={values.price} inputMode="numeric" className="adm-input" />
            </Field>
            <Field label="قیمت قبل از تخفیف" name="oldPrice" error={err("oldPrice")}>
              <input {...input("oldPrice")} defaultValue={values.oldPrice} inputMode="numeric" className="adm-input" />
            </Field>
            <Field label="برچسب" name="badge" error={err("badge")} hint="مثلاً: پرفروش‌ترین">
              <input {...input("badge")} defaultValue={values.badge} className="adm-input" />
            </Field>
          </FormSection>

          <FormSection title="مشخصات">
            <div className="grid grid-cols-2 gap-4">
              <Field label="مدت (ساعت)" name="hours" error={err("hours")}>
                <input {...input("hours")} defaultValue={values.hours} inputMode="numeric" className="adm-input" />
              </Field>
              <Field label="تعداد جلسات" name="sessionsCount" error={err("sessionsCount")}>
                <input {...input("sessionsCount")} defaultValue={values.sessionsCount} inputMode="numeric" className="adm-input" />
              </Field>
            </div>
            <Field label="سطح" name="level" error={err("level")}>
              <input {...input("level")} defaultValue={values.level} className="adm-input" placeholder="مقدماتی تا پیشرفته" />
            </Field>
            <Field label="نحوه‌ی ارائه" name="format" error={err("format")}>
              <input {...input("format")} defaultValue={values.format} className="adm-input" placeholder="ویدیویی + جلسات زنده" />
            </Field>
          </FormSection>

          <FormSection title="تصویر دوره">
            <ImageInput name="image" defaultValue={values.image} error={err("image")} />
          </FormSection>
        </div>
      </div>
    </form>
  );
}
