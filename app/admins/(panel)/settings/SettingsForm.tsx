"use client";

import { Save } from "lucide-react";
import { Field, FormAlert, FormSection, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";
import type { SettingField, SettingGroup } from "@/lib/setting-fields";

export default function SettingsForm({
  action,
  groups,
  fields,
  values,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  groups: { key: SettingGroup; title: string; description: string }[];
  fields: SettingField[];
  values: Record<string, string>;
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl space-y-6">
      <FormAlert state={state} />
      {groups.map((g) => (
        <FormSection key={g.key} title={g.title} description={g.description}>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields
              .filter((f) => f.group === g.key)
              .map((f) => {
                const ltr = f.type === "url" || f.type === "email" || f.type === "ltr";
                const props = { id: f.key, name: f.key, defaultValue: values[f.key] ?? "", ...invalid(err(f.key), f.key) };
                return (
                  <Field key={f.key} label={f.label} name={f.key} error={err(f.key)} hint={f.hint} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    {f.type === "textarea" ? (
                      <textarea {...props} rows={3} className="adm-input" />
                    ) : (
                      <input {...props} type={f.type === "email" ? "email" : "text"} dir={ltr ? "ltr" : undefined} className={`adm-input ${ltr ? "text-left" : ""}`} />
                    )}
                  </Field>
                );
              })}
          </div>
        </FormSection>
      ))}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <div className="rounded-2xl border border-white/10 bg-night-900/90 p-2 shadow-2xl backdrop-blur">
          <SubmitButton pending={pending}>
            {!pending && <Save className="h-4 w-4" />}
            ذخیره‌ی تنظیمات
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
