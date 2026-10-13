"use client";

import Link from "next/link";
import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, JalaliDateInput, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import { REQUEST_STATUS } from "@/lib/admin/labels";
import type { FormState } from "@/lib/admin/utils";

export type RequestFormValues = {
  mobile: string;
  userName: string;
  serviceId: string;
  orderId: string;
  fullName: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthTimeAccuracy: string;
  birthCity: string;
  birthCountry: string;
  questions: string;
  status: string;
  adminNote: string;
};

export default function RequestForm({
  action,
  values,
  services,
  submitLabel,
  maxYear,
  isNew,
  cancelHref,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: RequestFormValues;
  services: { id: string; title: string; needs: string[] }[];
  submitLabel: string;
  maxYear: number;
  isNew: boolean;
  cancelHref: string;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const input = (name: keyof RequestFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      <input type="hidden" name="orderId" value={values.orderId} />
      <div className="space-y-6 xl:col-span-2">
        <FormAlert state={state} />
        <FormSection title="مشتری و خدمت" description="اگر کاربری با این موبایل وجود نداشته باشد، ساخته می‌شود.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="شماره موبایل" name="mobile" error={err("mobile")} required>
              <input {...input("mobile")} defaultValue={values.mobile} readOnly={Boolean(values.orderId)} className="adm-input text-left read-only:opacity-60" dir="ltr" inputMode="tel" placeholder="09121234567" />
            </Field>
            <Field label="نام کاربر" name="userName" error={err("userName")} hint="خالی = نام صاحب چارت">
              <input {...input("userName")} defaultValue={values.userName} className="adm-input" />
            </Field>
            <Field label="خدمت" name="serviceId" error={err("serviceId")} required className="sm:col-span-2">
              <select {...input("serviceId")} defaultValue={values.serviceId} className="adm-input">
                <option value="">انتخاب کنید...</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="اطلاعات تولد صاحب چارت">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" name="fullName" error={err("fullName")} required>
              <input {...input("fullName")} defaultValue={values.fullName} className="adm-input" />
            </Field>
            <Field label="جنسیت" name="gender" error={err("gender")}>
              <select {...input("gender")} defaultValue={values.gender} className="adm-input">
                <option value="">نامشخص</option>
                <option value="female">زن</option>
                <option value="male">مرد</option>
              </select>
            </Field>
            <Field label="تاریخ تولد (شمسی)" name="birthDate" error={err("birthDate")} required className="sm:col-span-2">
              <JalaliDateInput name="birthDate" defaultValue={values.birthDate} error={err("birthDate")} maxYear={maxYear} />
            </Field>
            <Field label="ساعت تولد" name="birthTime" error={err("birthTime")}>
              <input {...input("birthTime")} type="time" defaultValue={values.birthTime} className="adm-input text-center" dir="ltr" />
            </Field>
            <Field label="دقت ساعت تولد" name="birthTimeAccuracy" error={err("birthTimeAccuracy")}>
              <select {...input("birthTimeAccuracy")} defaultValue={values.birthTimeAccuracy} className="adm-input">
                <option value="exact">دقیق</option>
                <option value="approximate">تقریبی</option>
                <option value="unknown">نامشخص</option>
              </select>
            </Field>
            <Field label="شهر محل تولد" name="birthCity" error={err("birthCity")}>
              <input {...input("birthCity")} defaultValue={values.birthCity} className="adm-input" />
            </Field>
            <Field label="کشور محل تولد" name="birthCountry" error={err("birthCountry")}>
              <input {...input("birthCountry")} defaultValue={values.birthCountry} className="adm-input" placeholder="ایران" />
            </Field>
          </div>
          <Field label="سوال‌ها و دغدغه‌های اصلی" name="questions" error={err("questions")}>
            <textarea {...input("questions")} defaultValue={values.questions} rows={5} className="adm-input" />
          </Field>
        </FormSection>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 xl:sticky xl:top-24">
          <FormSection title="وضعیت">
            <Field label="وضعیت درخواست" name="status" error={err("status")}>
              <select {...input("status")} defaultValue={values.status} className="adm-input">
                {Object.entries(REQUEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            {isNew && !values.orderId && (
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-cream/85">
                <input type="checkbox" name="createOrder" defaultChecked className="mt-1 h-4 w-4 accent-gold-500" />
                <span>صدور فاکتور برای این درخواست<span className="block text-xs text-muted">سفارش در انتظار پرداخت با قیمت فعلی خدمت ساخته می‌شود.</span></span>
              </label>
            )}
            {values.orderId && <p className="rounded-xl bg-gold-500/[0.06] px-3 py-2 text-xs leading-6 text-gold-200">این درخواست به سفارش موجود متصل می‌شود.</p>}
            <Field label="یادداشت مدیر" name="adminNote" error={err("adminNote")} hint="فقط در پنل نمایش داده می‌شود.">
              <textarea {...input("adminNote")} defaultValue={values.adminNote} rows={3} className="adm-input" />
            </Field>
            <div className="flex gap-2 border-t border-white/[0.06] pt-5">
              <SubmitButton pending={pending}>
                {!pending && <Save className="h-4 w-4" />}
                {submitLabel}
              </SubmitButton>
              <Link href={cancelHref} className="adm-btn adm-btn-secondary">انصراف</Link>
            </div>
          </FormSection>
        </div>
      </div>
    </form>
  );
}
