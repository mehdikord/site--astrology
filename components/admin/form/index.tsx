"use client";

import { useActionState, useEffect, useRef, useState, startTransition, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ImagePlus, Loader2, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, X } from "lucide-react";
import { toast } from "@/components/admin/Toaster";
import { JALALI_MONTHS, monthLength } from "@/lib/jalali";
import { toFa } from "@/lib/format";
import type { FormState } from "@/lib/admin/utils";

/**
 * اتصال فرم به اکشن سرور بدون ریست خودکار فرم در React 19
 * (تا در صورت خطای اعتبارسنجی، مقادیر واردشده حفظ شوند).
 */
export function useAdminForm(action: (state: FormState, data: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {} as FormState);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  useEffect(() => {
    if (state.message) toast(state.ok ? "success" : "error", state.message);
  }, [state]);

  const err = (name: string) => state.errors?.[name];
  return { state, pending, onSubmit, err };
}

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  name?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="adm-label">
        {label}
        {required && <span className="ms-1 text-rose-400">*</span>}
      </label>
      {children}
      {error ? <p id={name ? `${name}-error` : undefined} className="adm-error">{error}</p> : hint ? <p className="adm-hint">{hint}</p> : null}
    </div>
  );
}

/** ویژگی‌های مشترک input برای نمایش خطا */
export const invalid = (error?: string, name?: string) =>
  error ? { "aria-invalid": true as const, "aria-describedby": name ? `${name}-error` : undefined } : {};

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="adm-card">
      <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <h2 className="adm-card-title">{title}</h2>
        {description && <p className="mt-1 text-xs leading-6 text-muted">{description}</p>}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.ok !== false || !state.errors || Object.keys(state.errors).length === 0) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3.5 text-sm text-rose-200">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
      <div>
        <div className="font-bold">لطفاً خطاهای فرم را برطرف کنید:</div>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-rose-200/80">
          {Object.values(state.errors).map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="adm-btn adm-btn-primary min-w-32">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Switch({ name, defaultChecked, label, description }: { name: string; defaultChecked?: boolean; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-cream">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-6 text-muted">{description}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="adm-switch mt-0.5" aria-hidden />
    </label>
  );
}

// ─── ویرایشگر لیست (string[]) ───

type Row<T> = { key: number; value: T };
let rowKey = 0;
const rows = <T,>(items: T[]): Row<T>[] => items.map((value) => ({ key: ++rowKey, value }));

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function RowControls({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className="adm-icon-btn h-7 w-7" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="انتقال به بالا">
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="adm-icon-btn h-7 w-7" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="انتقال به پایین">
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="adm-icon-btn h-7 w-7 hover:!bg-rose-500/10 hover:!text-rose-300" onClick={onRemove} aria-label="حذف">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** لیست متنی قابل افزودن/حذف/مرتب‌سازی — به‌صورت JSON در یک input مخفی ارسال می‌شود */
export function ListEditor({ name, defaultValue = [], placeholder, addLabel = "افزودن مورد" }: { name: string; defaultValue?: string[]; placeholder?: string; addLabel?: string }) {
  const [items, setItems] = useState(() => rows(defaultValue));
  const json = JSON.stringify(items.map((i) => i.value.trim()).filter(Boolean));

  return (
    <div>
      <input type="hidden" name={name} value={json} />
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={item.key} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 text-muted/40" />
            <span className="w-5 shrink-0 text-center text-xs text-muted">{toFa(i + 1)}</span>
            <input
              className="adm-input flex-1"
              value={item.value}
              placeholder={placeholder}
              onChange={(e) => setItems((l) => l.map((x) => (x.key === item.key ? { ...x, value: e.target.value } : x)))}
            />
            <RowControls index={i} count={items.length} onMove={(to) => setItems((l) => move(l, i, to))} onRemove={() => setItems((l) => l.filter((x) => x.key !== item.key))} />
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setItems((l) => [...l, ...rows([""])])} className="adm-btn adm-btn-secondary adm-btn-sm mt-3">
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}

/** ویرایشگر مراحل (عنوان + توضیح) */
export function StepsEditor({ name, defaultValue = [] }: { name: string; defaultValue?: { title: string; description: string }[] }) {
  const [items, setItems] = useState(() => rows(defaultValue));
  const json = JSON.stringify(items.map((i) => i.value).filter((s) => s.title.trim() || s.description.trim()));
  const update = (key: number, patch: Partial<{ title: string; description: string }>) =>
    setItems((l) => l.map((x) => (x.key === key ? { ...x, value: { ...x.value, ...patch } } : x)));

  return (
    <div>
      <input type="hidden" name={name} value={json} />
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={item.key} className="rounded-xl border border-white/[0.07] bg-night-950/40 p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-300">{toFa(i + 1)}</span>
              <RowControls index={i} count={items.length} onMove={(to) => setItems((l) => move(l, i, to))} onRemove={() => setItems((l) => l.filter((x) => x.key !== item.key))} />
            </div>
            <input className="adm-input" placeholder="عنوان مرحله" value={item.value.title} onChange={(e) => update(item.key, { title: e.target.value })} />
            <textarea className="adm-input mt-2 !min-h-16" rows={2} placeholder="توضیح مرحله" value={item.value.description} onChange={(e) => update(item.key, { description: e.target.value })} />
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => setItems((l) => [...l, ...rows([{ title: "", description: "" }])])} className="adm-btn adm-btn-secondary adm-btn-sm mt-3">
        <Plus className="h-3.5 w-3.5" />
        افزودن مرحله
      </button>
    </div>
  );
}

// ─── تصویر ───

export function ImageInput({
  name,
  defaultValue,
  error,
  aspect = "aspect-[16/9]",
  round = false,
}: {
  name: string;
  defaultValue?: string | null;
  error?: string;
  aspect?: string;
  round?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const [removed, setRemoved] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => () => void (objectUrl.current && URL.revokeObjectURL(objectUrl.current)), []);

  const pick = (file: File | undefined) => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = file ? URL.createObjectURL(file) : null;
    setPreview(objectUrl.current ?? (removed ? null : defaultValue ?? null));
    if (file) setRemoved(false);
  };

  const clear = () => {
    if (input.current) input.current.value = "";
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setPreview(null);
    setRemoved(true);
  };

  return (
    <div>
      <input type="hidden" name={`${name}_remove`} value={removed ? "1" : ""} />
      <div
        className={`group relative overflow-hidden border border-dashed transition ${
          error ? "border-rose-500/60" : "border-white/15 hover:border-gold-500/50"
        } bg-night-950/50 ${round ? "mx-auto h-32 w-32 rounded-full" : `${aspect} rounded-2xl`}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted">
            <ImagePlus className="h-7 w-7 text-gold-500/60" />
            {!round && <span className="text-xs leading-6">برای انتخاب تصویر کلیک کنید<br />JPG، PNG، WEBP — حداکثر ۳ مگابایت</span>}
          </div>
        )}
        <input
          ref={input}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => pick(e.target.files?.[0])}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="انتخاب تصویر"
        />
        {preview && (
          <button
            type="button"
            onClick={clear}
            className={`absolute z-10 grid h-8 w-8 place-items-center rounded-full bg-night-950/80 text-cream/80 backdrop-blur transition hover:bg-rose-500 hover:text-white ${
              round ? "bottom-1 left-1/2 -translate-x-1/2" : "end-2 top-2"
            }`}
            aria-label="حذف تصویر"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="adm-error text-center">{error}</p>}
    </div>
  );
}

// ─── تاریخ شمسی ───

/** انتخاب تاریخ شمسی با سه لیست (روز / ماه / سال) — مقدار به شکل 1370/05/20 در input مخفی */
export function JalaliDateInput({
  name,
  defaultValue = "",
  error,
  minYear = 1300,
  maxYear,
}: {
  name: string;
  defaultValue?: string;
  error?: string;
  minYear?: number;
  maxYear: number;
}) {
  const initial = defaultValue.split("/").map(Number);
  const [y, setY] = useState(initial[0] || 0);
  const [m, setM] = useState(initial[1] || 0);
  const [d, setD] = useState(initial[2] || 0);

  const days = y && m ? monthLength(y, m) : 31;
  const day = Math.min(d, days);
  const value = y && m && day ? `${y}/${String(m).padStart(2, "0")}/${String(day).padStart(2, "0")}` : "";
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const a11y = invalid(error, name);

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-[1fr_1.4fr_1.2fr] gap-2">
        <select aria-label="روز" className="adm-input" value={day || ""} onChange={(e) => setD(+e.target.value)} {...a11y}>
          <option value="">روز</option>
          {Array.from({ length: days }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{toFa(n)}</option>
          ))}
        </select>
        <select aria-label="ماه" className="adm-input" value={m || ""} onChange={(e) => setM(+e.target.value)} {...a11y}>
          <option value="">ماه</option>
          {JALALI_MONTHS.map((label, i) => (
            <option key={label} value={i + 1}>{label}</option>
          ))}
        </select>
        <select aria-label="سال" className="adm-input" value={y || ""} onChange={(e) => setY(+e.target.value)} {...a11y}>
          <option value="">سال</option>
          {years.map((n) => (
            <option key={n} value={n}>{toFa(n)}</option>
          ))}
        </select>
      </div>
      {value && (
        <button type="button" className="mt-1.5 text-xs text-muted hover:text-rose-300" onClick={() => (setY(0), setM(0), setD(0))}>
          پاک کردن تاریخ
        </button>
      )}
    </div>
  );
}
