"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, ImageInput, ListEditor, StepsEditor, SubmitButton, Switch, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";
import { SERVICE_ICONS } from "./constants";

export type ServiceFormValues = {
  title: string;
  titleEn: string;
  slug: string;
  icon: string;
  tagline: string;
  shortDescription: string;
  intro: string;
  image: string | null;
  price: string;
  oldPrice: string;
  duration: string;
  format: string;
  delivery: string;
  forWho: string[];
  deliverables: string[];
  requirements: string[];
  steps: { title: string; description: string }[];
  isActive: boolean;
  sortOrder: string;
  metaTitle: string;
  metaDescription: string;
};

export const emptyService: ServiceFormValues = {
  title: "", titleEn: "", slug: "", icon: "matrix", tagline: "", shortDescription: "", intro: "", image: null,
  price: "", oldPrice: "", duration: "", format: "", delivery: "", forWho: [], deliverables: [], requirements: [],
  steps: [], isActive: true, sortOrder: "0", metaTitle: "", metaDescription: "",
};

export default function ServiceForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: ServiceFormValues;
  submitLabel: string;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof ServiceFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <FormAlert state={state} />

        <FormSection title="اطلاعات اصلی">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="عنوان خدمت" name="title" error={err("title")} required className="sm:col-span-2">
              <input {...input("title")} defaultValue={values.title} className="adm-input" placeholder="مثلاً: تحلیل کامل ماتریکس با زمان تولد" />
            </Field>
            <Field label="عنوان انگلیسی" name="titleEn" error={err("titleEn")}>
              <input {...input("titleEn")} defaultValue={values.titleEn} className="adm-input text-left" dir="ltr" placeholder="Matrix of Destiny" />
            </Field>
            <Field label="نامک (آدرس صفحه)" name="slug" error={err("slug")} hint="خالی بگذارید تا از عنوان انگلیسی ساخته شود.">
              <input {...input("slug")} defaultValue={values.slug} className="adm-input text-left" dir="ltr" placeholder="matrix" />
            </Field>
            <Field label="شعار / زیرعنوان" name="tagline" error={err("tagline")} className="sm:col-span-2">
              <input {...input("tagline")} defaultValue={values.tagline} className="adm-input" />
            </Field>
            <Field label="توضیح کوتاه" name="shortDescription" error={err("shortDescription")} hint="در کارت خدمت و توضیحات متا نمایش داده می‌شود." className="sm:col-span-2">
              <textarea {...input("shortDescription")} defaultValue={values.shortDescription} rows={3} className="adm-input" />
            </Field>
            <Field label="معرفی کامل" name="intro" error={err("intro")} hint="پاراگراف‌ها را با یک خط خالی از هم جدا کنید." className="sm:col-span-2">
              <textarea {...input("intro")} defaultValue={values.intro} rows={8} className="adm-input" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="جزئیات ارائه" description="اطلاعاتی که در کادر سفارش صفحه‌ی خدمت نمایش داده می‌شود.">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="مدت / حجم" name="duration" error={err("duration")}>
              <input {...input("duration")} defaultValue={values.duration} className="adm-input" placeholder="گزارش ۳۰ صفحه‌ای + جلسه" />
            </Field>
            <Field label="نحوه‌ی ارائه" name="format" error={err("format")}>
              <input {...input("format")} defaultValue={values.format} className="adm-input" placeholder="PDF + جلسه‌ی آنلاین" />
            </Field>
            <Field label="زمان تحویل" name="delivery" error={err("delivery")}>
              <input {...input("delivery")} defaultValue={values.delivery} className="adm-input" placeholder="۳ تا ۵ روز کاری" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="این تحلیل برای چه کسانی است؟">
          <ListEditor name="forWho" defaultValue={values.forWho} placeholder="یک گروه مخاطب..." />
        </FormSection>

        <FormSection title="چه چیزی دریافت می‌کند؟">
          <ListEditor name="deliverables" defaultValue={values.deliverables} placeholder="یک مورد تحویلی..." />
        </FormSection>

        <FormSection title="روند کار" description="مراحل انجام خدمت به ترتیب نمایش.">
          <StepsEditor name="steps" defaultValue={values.steps} />
          {err("steps") && <p className="adm-error">{err("steps")}</p>}
        </FormSection>

        <FormSection title="اطلاعات مورد نیاز از مشتری" description="مثلاً تاریخ و ساعت تولد، شهر محل تولد و ...">
          <ListEditor name="requirements" defaultValue={values.requirements} placeholder="یک مورد..." />
        </FormSection>

        <FormSection title="سئو">
          <Field label="عنوان سئو" name="metaTitle" error={err("metaTitle")} hint="خالی بگذارید تا از عنوان خدمت استفاده شود.">
            <input {...input("metaTitle")} defaultValue={values.metaTitle} className="adm-input" />
          </Field>
          <Field label="توضیح سئو" name="metaDescription" error={err("metaDescription")}>
            <textarea {...input("metaDescription")} defaultValue={values.metaDescription} rows={3} className="adm-input" />
          </Field>
        </FormSection>
      </div>

      {/* ستون کناری */}
      <div className="space-y-6">
        <div className="space-y-6 xl:sticky xl:top-24">
          <FormSection title="انتشار">
            <Switch name="isActive" defaultChecked={values.isActive} label="نمایش در سایت" description="خدمت غیرفعال در سایت نمایش داده نمی‌شود." />
            <Field label="ترتیب نمایش" name="sortOrder" error={err("sortOrder")} hint="عدد کوچک‌تر، بالاتر نمایش داده می‌شود.">
              <input {...input("sortOrder")} defaultValue={values.sortOrder} inputMode="numeric" className="adm-input" />
            </Field>
            <div className="flex gap-2 border-t border-white/[0.06] pt-5">
              <SubmitButton pending={pending}>
                {!pending && <Save className="h-4 w-4" />}
                {submitLabel}
              </SubmitButton>
              <Link href="/admins/services/" className="adm-btn adm-btn-secondary">انصراف</Link>
            </div>
          </FormSection>

          <FormSection title="قیمت (تومان)">
            <Field label="قیمت" name="price" error={err("price")} required>
              <input {...input("price")} defaultValue={values.price} inputMode="numeric" className="adm-input" placeholder="1800000" />
            </Field>
            <Field label="قیمت قبل از تخفیف" name="oldPrice" error={err("oldPrice")} hint="اختیاری — برای نمایش تخفیف.">
              <input {...input("oldPrice")} defaultValue={values.oldPrice} inputMode="numeric" className="adm-input" />
            </Field>
          </FormSection>

          <FormSection title="تصویر و آیکن">
            <ImageInput name="image" defaultValue={values.image} error={err("image")} />
            <Field label="آیکن" name="icon" error={err("icon")}>
              <select {...input("icon")} defaultValue={values.icon} className="adm-input">
                {SERVICE_ICONS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </Field>
          </FormSection>
        </div>
      </div>
    </form>
  );
}
