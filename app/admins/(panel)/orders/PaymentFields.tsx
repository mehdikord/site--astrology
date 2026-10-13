"use client";

import { Field, invalid } from "@/components/admin/form";
import { JalaliDateTimeInput } from "@/components/admin/form/editors";
import { GATEWAYS } from "@/lib/admin/labels";

/** فیلدهای ثبت پرداخت (مشترک بین فرم سفارش جدید و صفحه‌ی سفارش) */
export default function PaymentFields({ err, maxYear }: { err: (name: string) => string | undefined; maxYear: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="روش پرداخت" name="gateway" error={err("gateway")}>
        <select id="gateway" name="gateway" defaultValue="card" className="adm-input" {...invalid(err("gateway"), "gateway")}>
          {Object.entries(GATEWAYS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </Field>
      <Field label="کد پیگیری / شماره مرجع" name="referenceId" error={err("referenceId")}>
        <input id="referenceId" name="referenceId" className="adm-input text-left" dir="ltr" {...invalid(err("referenceId"), "referenceId")} />
      </Field>
      <Field label="شماره کارت پرداخت‌کننده" name="cardNumber" error={err("cardNumber")} hint="اختیاری — مثلاً ۴ رقم آخر">
        <input id="cardNumber" name="cardNumber" className="adm-input text-left" dir="ltr" inputMode="numeric" {...invalid(err("cardNumber"), "cardNumber")} />
      </Field>
      <Field label="زمان پرداخت" name="paidAt" error={err("paidAt")} hint="خالی = همین حالا">
        <JalaliDateTimeInput name="paidAt" error={err("paidAt")} minYear={1400} maxYear={maxYear} />
      </Field>
      <Field label="توضیح پرداخت" name="paymentNote" error={err("paymentNote")} className="sm:col-span-2">
        <input id="paymentNote" name="paymentNote" className="adm-input" />
      </Field>
    </div>
  );
}
