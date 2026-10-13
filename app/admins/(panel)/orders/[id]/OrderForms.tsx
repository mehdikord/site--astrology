"use client";

import { CreditCard, Save } from "lucide-react";
import { FormSection, SubmitButton, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";
import PaymentFields from "../PaymentFields";

type Action = (state: FormState, data: FormData) => Promise<FormState>;

export function RegisterPaymentForm({ action, maxYear }: { action: Action; maxYear: number }) {
  const { pending, onSubmit, err } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="ثبت پرداخت" description="پس از ثبت، سفارش پرداخت‌شده می‌شود، تراکنش ثبت و دسترسی دوره‌ها فعال می‌شود.">
        <PaymentFields err={err} maxYear={maxYear} />
        <SubmitButton pending={pending}>
          {!pending && <CreditCard className="h-4 w-4" />}
          تایید پرداخت
        </SubmitButton>
      </FormSection>
    </form>
  );
}

export function OrderNoteForm({ action, defaultValue }: { action: Action; defaultValue: string }) {
  const { pending, onSubmit } = useAdminForm(action);
  return (
    <form onSubmit={onSubmit}>
      <FormSection title="توضیحات سفارش">
        <textarea name="description" defaultValue={defaultValue} rows={3} className="adm-input" aria-label="توضیحات سفارش" />
        <SubmitButton pending={pending}>
          {!pending && <Save className="h-4 w-4" />}
          ذخیره
        </SubmitButton>
      </FormSection>
    </form>
  );
}
