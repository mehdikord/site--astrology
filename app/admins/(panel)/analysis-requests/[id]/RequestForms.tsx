"use client";

import { Save, Send } from "lucide-react";
import { Field, FormSection, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import { FileInput, JalaliDateTimeInput } from "@/components/admin/form/editors";
import { REQUEST_STATUS } from "@/lib/admin/labels";
import type { FormState } from "@/lib/admin/utils";

type Action = (state: FormState, data: FormData) => Promise<FormState>;

export function StatusForm({ action, status, adminNote }: { action: Action; status: string; adminNote: string }) {
  const { pending, onSubmit, err } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="وضعیت و یادداشت">
        <Field label="وضعیت" name="status" error={err("status")}>
          <select id="status" name="status" defaultValue={status} className="adm-input">
            {Object.entries(REQUEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="یادداشت مدیر" name="adminNote" error={err("adminNote")}>
          <textarea id="adminNote" name="adminNote" defaultValue={adminNote} rows={3} className="adm-input" />
        </Field>
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          ذخیره
        </SubmitButton>
      </FormSection>
    </form>
  );
}

export type AnalysisValues = {
  title: string;
  summary: string;
  reportFile: string | null;
  sessionAt: string;
  sessionLink: string;
  sessionDuration: string;
  delivered: boolean;
};

export function DeliveryForm({ action, values, maxYear }: { action: Action; values: AnalysisValues; maxYear: number }) {
  const { pending, onSubmit, err } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="نتیجه‌ی تحلیل" description="گزارش PDF به‌صورت خصوصی ذخیره می‌شود و فقط از پنل مدیریت قابل دریافت است.">
        <Field label="عنوان گزارش" name="title" error={err("title")}>
          <input id="title" name="title" defaultValue={values.title} className="adm-input" placeholder="مثلاً: تحلیل ماتریکس نگار محمدی" />
        </Field>
        <Field label="فایل گزارش" name="reportFile" error={err("reportFile")}>
          <FileInput name="reportFile" current={values.reportFile} accept="application/pdf,application/zip,image/*" hint="PDF، ZIP یا تصویر — حداکثر ۲۰ مگابایت" error={err("reportFile")} />
        </Field>
        <Field label="خلاصه / یادداشت تحلیل" name="summary" error={err("summary")}>
          <textarea id="summary" name="summary" defaultValue={values.summary} rows={5} className="adm-input" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="زمان جلسه‌ی آنلاین" name="sessionAt" error={err("sessionAt")} className="sm:col-span-2">
            <JalaliDateTimeInput name="sessionAt" defaultValue={values.sessionAt} error={err("sessionAt")} minYear={1400} maxYear={maxYear + 1} />
          </Field>
          <Field label="لینک جلسه" name="sessionLink" error={err("sessionLink")}>
            <input id="sessionLink" name="sessionLink" defaultValue={values.sessionLink} className="adm-input text-left" dir="ltr" placeholder="https://meet.google.com/..." {...invalid(err("sessionLink"), "sessionLink")} />
          </Field>
          <Field label="مدت جلسه (دقیقه)" name="sessionDuration" error={err("sessionDuration")}>
            <input id="sessionDuration" name="sessionDuration" defaultValue={values.sessionDuration} inputMode="numeric" className="adm-input" {...invalid(err("sessionDuration"), "sessionDuration")} />
          </Field>
        </div>
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3.5 text-sm text-cream">
          <input type="checkbox" name="delivered" defaultChecked={values.delivered} className="mt-1 h-4 w-4 accent-emerald-500" />
          <span>
            تحلیل تحویل داده شد
            <span className="block text-xs text-muted">وضعیت درخواست «تحویل شده» می‌شود و زمان تحویل ثبت می‌شود.</span>
          </span>
        </label>
        <SubmitButton pending={pending}>
          {!pending && <Send className="h-4 w-4" />}
          ذخیره‌ی نتیجه
        </SubmitButton>
      </FormSection>
    </form>
  );
}
