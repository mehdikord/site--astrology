"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { Send, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { sendContactMessage, type ContactState } from "@/app/(site)/contact/actions";

/** فرم تماس — پیام در دیتابیس ذخیره و در پنل مدیریت (پیام‌ها) نمایش داده می‌شود */
export default function ContactForm({ subjects, telegram }: { subjects: string[]; telegram: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, {});
  const [form, setForm] = useState({ name: "", contact: "", subject: subjects[0] ?? "", message: "" });
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (state.ok) setForm((f) => ({ ...f, message: "" }));
  }, [state]);

  const telegramHref = `${telegram}?text=${encodeURIComponent(
    `سلام، ${form.name} هستم.\nموضوع: ${form.subject}\n\n${form.message}\n\nراه تماس: ${form.contact}`,
  )}`;
  const err = (k: string) => state.errors?.[k];
  const errorCls = (k: string) => (err(k) ? " !border-rose-500/60" : "");

  return (
    <form action={action} className="glass rounded-3xl p-5 sm:p-9">
      {/* فیلد تله برای ربات‌ها */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.ok && state.message && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3.5 text-sm leading-7 text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          {state.message}
        </div>
      )}
      {state.ok === false && state.message && (
        <div role="alert" className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3.5 text-sm text-rose-200">{state.message}</div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs text-muted">نام و نام خانوادگی</span>
          <input required name="name" className={"input" + errorCls("name")} placeholder="مثلاً: نگار محمدی" value={form.name} onChange={set("name")} />
          {err("name") && <span className="mt-1.5 block text-xs text-rose-400">{err("name")}</span>}
        </label>
        <label className="block">
          <span className="mb-2 block text-xs text-muted">شماره تماس یا ایمیل</span>
          <input required name="contact" className={"input" + errorCls("contact")} placeholder="۰۹۱۲..." value={form.contact} onChange={set("contact")} />
          {err("contact") && <span className="mt-1.5 block text-xs text-rose-400">{err("contact")}</span>}
        </label>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs text-muted">موضوع</span>
        <span className="relative block">
          <select name="subject" className="input appearance-none pl-10" value={form.subject} onChange={set("subject")}>
            {subjects.map((s) => (
              <option key={s} value={s} className="bg-night-900">{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500" />
        </span>
      </label>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs text-muted">پیام</span>
        <textarea required name="message" rows={5} className={"input resize-none" + errorCls("message")} placeholder="سوال یا توضیحت را بنویس..." value={form.message} onChange={set("message")} />
        {err("message") && <span className="mt-1.5 block text-xs text-rose-400">{err("message")}</span>}
      </label>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="submit" disabled={pending} className="btn btn-gold w-full px-7 py-3.5 disabled:opacity-60 sm:w-auto sm:py-3">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          ارسال پیام
        </button>
        {telegram && (
          <a href={telegramHref} target="_blank" rel="noreferrer" className="btn btn-ghost w-full py-3.5 sm:w-auto sm:py-3">
            ارسال در تلگرام
          </a>
        )}
      </div>
      <p className="mt-4 text-[11px] leading-6 text-muted">پیامت مستقیماً برای ما ثبت می‌شود و معمولاً ظرف ۲۴ ساعت پاسخ می‌دهیم. برای پاسخ سریع‌تر می‌توانی در تلگرام هم پیام بدهی.</p>
    </form>
  );
}
