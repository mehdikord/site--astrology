import Link from "next/link";
import { Send, Phone, Mail, MapPin, Clock } from "lucide-react";
import Instagram from "@/components/ui/InstagramIcon";
import Logo from "@/components/ui/Logo";
import ZodiacWheel from "@/components/ui/ZodiacWheel";
import { site, nav } from "@/data/site";
import { services } from "@/data/services";

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-gold-500/10 bg-night-900/60">
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] text-gold-500/10">
        <ZodiacWheel className="h-full w-full animate-spin-slower" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-6 max-w-sm leading-8 text-muted">{site.description}</p>
          <p className="script mt-5 text-lg text-gold-400/80">Astrology is a language of the soul</p>
          <div className="mt-6 flex items-center gap-3">
            {site.instagram && (
              <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="اینستاگرام" className="grid h-10 w-10 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:border-gold-500 hover:text-gold-300">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {site.telegram && (
              <a href={site.telegram} target="_blank" rel="noreferrer" aria-label="تلگرام" className="grid h-10 w-10 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:border-gold-500 hover:text-gold-300">
                <Send className="h-4 w-4" />
              </a>
            )}
            {site.whatsapp && (
              <a href={site.whatsapp} target="_blank" rel="noreferrer" aria-label="واتس‌اپ" className="grid h-10 w-10 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:border-gold-500 hover:text-gold-300">
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="mb-5 text-sm font-bold tracking-wider text-gold-400">دسترسی سریع</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition hover:text-gold-300">{n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/terms" className="transition hover:text-gold-300">قوانین و مقررات</Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="mb-5 text-sm font-bold tracking-wider text-gold-400">خدمات</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="transition hover:text-gold-300">{s.title}</Link>
              </li>
            ))}
            <li>
              <Link href="/courses" className="transition hover:text-gold-300">دوره‌های آموزشی</Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="mb-5 text-sm font-bold tracking-wider text-gold-400">تماس</h4>
          <ul className="space-y-4 text-sm text-cream/70">
            <li className="flex items-start gap-3"><Phone className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><a href={`tel:+${site.phoneRaw}`} dir="ltr" className="hover:text-gold-300">{site.phone}</a></li>
            <li className="flex items-start gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><a href={`mailto:${site.email}`} className="hover:text-gold-300">{site.email}</a></li>
            <li className="flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><span>{site.address}</span></li>
            <li className="flex items-start gap-3"><Clock className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><span>{site.hours}</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold-500/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© ۱۴۰۵ {site.name} — تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-2">
            <span className="text-gold-500">✦</span> SAME SOUL · HIGHER PATH
          </p>
        </div>
      </div>
    </footer>
  );
}
