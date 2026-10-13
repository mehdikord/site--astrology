"use client";

import Link from "next/link";
import { useState } from "react";
import { Save, Shuffle } from "lucide-react";
import { Field, FormAlert, FormSection, SubmitButton, Switch, invalid, useAdminForm } from "@/components/admin/form";
import { JalaliDateTimeInput } from "@/components/admin/form/editors";
import type { FormState } from "@/lib/admin/utils";

export type DiscountFormValues = {
  code: string;
  type: "percent" | "fixed";
  value: string;
  maxDiscount: string;
  minAmount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

export const emptyDiscount: DiscountFormValues = { code: "", type: "percent", value: "", maxDiscount: "", minAmount: "", usageLimit: "", startsAt: "", expiresAt: "", isActive: true };

const randomCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");

export default function DiscountForm({
  action,
  values,
  submitLabel,
  maxYear,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  values: DiscountFormValues;
  submitLabel: string;
  maxYear: number;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const [type, setType] = useState(values.type);
  const [code, setCode] = useState(values.code);
  const input = (name: keyof DiscountFormValues) => ({ id: name, name, ...invalid(err(name), name) });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      <FormAlert state={state} />
      <FormSection title="کد تخفیف">
        <Field label="کد" name="code" error={err("code")} required hint="حروف انگلیسی و عدد؛ مشتری همین کد را وارد می‌کند.">
          <div className="flex gap-2">
            <input {...input("code")} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="adm-input flex-1 text-left font-mono uppercase tracking-widest" dir="ltr" placeholder="NOWRUZ1405" />
            <button type="button" onClick={() => setCode(randomCode())} className="adm-btn adm-btn-secondary" title="ساخت کد تصادفی">
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="نوع تخفیف" name="type" error={err("type")}>
            <select {...input("type")} value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")} className="adm-input">
              <option value="percent">درصدی</option>
              <option value="fixed">مبلغ ثابت (تومان)</option>
            </select>
          </Field>
          <Field label={type === "percent" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"} name="value" error={err("value")} required>
            <input {...input("value")} defaultValue={values.value} inputMode="numeric" className="adm-input" />
          </Field>
          {type === "percent" && (
            <Field label="سقف مبلغ تخفیف (تومان)" name="maxDiscount" error={err("maxDiscount")} hint="اختیاری">
              <input {...input("maxDiscount")} defaultValue={values.maxDiscount} inputMode="numeric" className="adm-input" />
            </Field>
          )}
          <Field label="حداقل مبلغ سفارش (تومان)" name="minAmount" error={err("minAmount")} hint="اختیاری">
            <input {...input("minAmount")} defaultValue={values.minAmount} inputMode="numeric" className="adm-input" />
          </Field>
          <Field label="سقف تعداد استفاده" name="usageLimit" error={err("usageLimit")} hint="خالی = نامحدود">
            <input {...input("usageLimit")} defaultValue={values.usageLimit} inputMode="numeric" className="adm-input" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="زمان اعتبار" description="هر دو اختیاری‌اند.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="شروع" name="startsAt" error={err("startsAt")}>
            <JalaliDateTimeInput name="startsAt" defaultValue={values.startsAt} error={err("startsAt")} minYear={1400} maxYear={maxYear + 2} />
          </Field>
          <Field label="پایان" name="expiresAt" error={err("expiresAt")}>
            <JalaliDateTimeInput name="expiresAt" defaultValue={values.expiresAt} error={err("expiresAt")} minYear={1400} maxYear={maxYear + 2} />
          </Field>
        </div>
        <Switch name="isActive" defaultChecked={values.isActive} label="فعال" />
      </FormSection>

      <div className="flex gap-2">
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          {submitLabel}
        </SubmitButton>
        <Link href="/admins/discount-codes/" className="adm-btn adm-btn-secondary">انصراف</Link>
      </div>
    </form>
  );
}
