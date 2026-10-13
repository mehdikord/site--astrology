"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Save, Sparkles } from "lucide-react";
import { Field, FormAlert, FormSection, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import type { FormState } from "@/lib/admin/utils";
import { price } from "@/lib/format";
import PaymentFields from "./PaymentFields";

type Item = { key: string; title: string; price: number };

function ItemList({ items, icon, selected, onToggle }: { items: Item[]; icon: React.ReactNode; selected: string[]; onToggle: (key: string) => void }) {
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.key}>
          <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${selected.includes(i.key) ? "border-gold-500/40 bg-gold-500/[0.06]" : "border-white/[0.07] hover:border-white/20"}`}>
            <input type="checkbox" checked={selected.includes(i.key)} onChange={() => onToggle(i.key)} className="h-4 w-4 accent-gold-500" />
            <span className="text-gold-500/70">{icon}</span>
            <span className="flex-1 text-cream">{i.title}</span>
            <span className="shrink-0 text-xs font-bold text-gold-300">{price(i.price)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export default function OrderForm({
  action,
  courses,
  services,
  maxYear,
  defaults,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  courses: Item[];
  services: Item[];
  maxYear: number;
  defaults: { mobile: string; name: string };
}) {
  const { state, pending, onSubmit, err } = useAdminForm(action);
  const [selected, setSelected] = useState<string[]>([]);
  const [paid, setPaid] = useState(false);
  const all = [...courses, ...services];
  const subtotal = all.filter((i) => selected.includes(i.key)).reduce((n, i) => n + i.price, 0);
  const toggle = (key: string) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-3">
      <input type="hidden" name="items" value={JSON.stringify(selected)} />
      <div className="space-y-6 xl:col-span-2">
        <FormAlert state={state} />
        <FormSection title="مشتری" description="اگر کاربری با این موبایل وجود نداشته باشد، ساخته می‌شود.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="شماره موبایل" name="mobile" error={err("mobile")} required>
              <input id="mobile" name="mobile" defaultValue={defaults.mobile} className="adm-input text-left" dir="ltr" inputMode="tel" placeholder="09121234567" {...invalid(err("mobile"), "mobile")} />
            </Field>
            <Field label="نام (برای کاربر جدید)" name="name" error={err("name")}>
              <input id="name" name="name" defaultValue={defaults.name} className="adm-input" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="اقلام سفارش" description="قیمت‌ها از قیمت فعلی دوره‌ها و خدمات خوانده می‌شوند.">
          {err("items") && <p className="adm-error !mt-0">{err("items")}</p>}
          {courses.length > 0 && (
            <div>
              <div className="adm-label">دوره‌ها</div>
              <ItemList items={courses} icon={<GraduationCap className="h-4 w-4" />} selected={selected} onToggle={toggle} />
            </div>
          )}
          {services.length > 0 && (
            <div>
              <div className="adm-label">خدمات</div>
              <ItemList items={services} icon={<Sparkles className="h-4 w-4" />} selected={selected} onToggle={toggle} />
            </div>
          )}
        </FormSection>

        <FormSection title="پرداخت">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-cream">
            <input type="checkbox" name="markPaid" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-4 w-4 accent-gold-500" />
            پرداخت این سفارش انجام شده است (ثبت تراکنش و فعال‌سازی دسترسی‌ها)
          </label>
          {paid && <PaymentFields err={err} maxYear={maxYear} />}
        </FormSection>
      </div>

      <div className="space-y-6">
        <div className="space-y-6 xl:sticky xl:top-24">
          <FormSection title="خلاصه‌ی فاکتور">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">جمع اقلام</span>
              <span className="font-bold text-cream">{price(subtotal)}</span>
            </div>
            <Field label="کد تخفیف" name="discountCode" error={err("discountCode")} hint="تخفیف هنگام ثبت محاسبه و اعمال می‌شود.">
              <input id="discountCode" name="discountCode" className="adm-input text-left uppercase" dir="ltr" {...invalid(err("discountCode"), "discountCode")} />
            </Field>
            <Field label="توضیحات" name="description" error={err("description")}>
              <textarea id="description" name="description" rows={3} className="adm-input" />
            </Field>
            <div className="flex gap-2 border-t border-white/[0.06] pt-5">
              <SubmitButton pending={pending}>
                {!pending && <Save className="h-4 w-4" />}
                ثبت سفارش
              </SubmitButton>
              <Link href="/admins/orders/" className="adm-btn adm-btn-secondary">انصراف</Link>
            </div>
          </FormSection>
        </div>
      </div>
    </form>
  );
}
