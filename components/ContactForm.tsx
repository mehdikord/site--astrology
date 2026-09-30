"use client";

import { useState, type FormEvent } from "react";
import { Send, Mail, ChevronDown } from "lucide-react";
import { site } from "@/data/site";
import { services } from "@/data/services";

/**
 * فرم تماس (استاتیک) — پیام را به تلگرام/واتس‌اپ یا ایمیل هدایت می‌کند.
 * برای دریافت مستقیم پیام‌ها می‌توانید action فرم را به Formspree / Getform وصل کنید.
 */
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", contact: "", subject: services[0].title, message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const body = () =>
    `سلام، ${form.name} هستم.\nموضوع: ${form.subject}\n\n${form.message}\n\nراه تماس: ${form.contact}`;

  const sendTelegram = (e: FormEvent) => {
    e.preventDefault();
    window.open(`${site.telegram}?text=${encodeURIComponent(body())}`, "_blank");
  };
  const sendEmail = () => {
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body())}`;
  };

  return (
    <form onSubmit={sendTelegram} className="glass rounded-3xl p-5 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs text-muted">نام و نام خانوادگی</span>
          <input required className="input" placeholder="مثلاً: نگار محمدی" value={form.name} onChange={set("name")} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs text-muted">شماره تماس یا ایمیل</span>
          <input required className="input" placeholder="۰۹۱۲..." value={form.contact} onChange={set("contact")} />
        </label>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs text-muted">موضوع</span>
        <span className="relative block">
          <select className="input appearance-none pl-10" value={form.subject} onChange={set("subject")}>
            {services.map((s) => (
              <option key={s.slug} value={s.title} className="bg-night-900">{s.title}</option>
            ))}
            <option value="دوره‌های آموزشی" className="bg-night-900">دوره‌های آموزشی</option>
            <option value="همکاری" className="bg-night-900">همکاری</option>
            <option value="سایر" className="bg-night-900">سایر</option>
          </select>
          <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-500" />
        </span>
      </label>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs text-muted">پیام</span>
        <textarea required rows={5} className="input resize-none" placeholder="سوال یا توضیحت را بنویس..." value={form.message} onChange={set("message")} />
      </label>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="submit" className="btn btn-gold w-full px-7 py-3.5 sm:w-auto sm:py-3">
          <Send className="h-4 w-4" />
          ارسال در تلگرام
        </button>
        <button type="button" onClick={sendEmail} className="btn btn-ghost w-full py-3.5 sm:w-auto sm:py-3">
          <Mail className="h-4 w-4" />
          ارسال با ایمیل
        </button>
      </div>
      <p className="mt-4 text-[11px] leading-6 text-muted">با ارسال پیام، متن شما در تلگرام یا ایمیل باز می‌شود تا مستقیماً برای ما بفرستید. معمولاً ظرف ۲۴ ساعت پاسخ می‌دهیم.</p>
    </form>
  );
}
