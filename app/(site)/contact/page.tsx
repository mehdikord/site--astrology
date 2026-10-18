import type { Metadata } from "next";
import { Phone, Mail, Send, MapPin, Clock, ChevronDown } from "lucide-react";
import Instagram from "@/components/ui/InstagramIcon";
import PageHeader from "@/components/layout/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/ContactForm";
import { getSettings } from "@/lib/settings";
import { getGeneralFaqs, getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "برای ثبت سفارش تحلیل، مشاوره‌ی انتخاب دوره یا هر سوالی از طریق تلگرام، واتس‌اپ یا ایمیل با کژال متد در ارتباط باشید.",
};

export default async function ContactPage() {
  const [site, services, FAQ] = await Promise.all([getSettings(), getServices(), getGeneralFaqs()]);
  const subjects = [...services.map((s) => s.title), "دوره‌های آموزشی", "همکاری", "سایر"];
  const handle = (url: string) => "@" + (url.replace(/\/+$/, "").split("/").pop() ?? "");
  const channels = [
    { icon: Send, t: "تلگرام", d: "سریع‌ترین راه ارتباط", href: site.telegram, v: handle(site.telegram) },
    { icon: Phone, t: "واتس‌اپ / تماس", d: site.hours, href: site.whatsapp, v: site.phone },
    { icon: Mail, t: "ایمیل", d: "برای همکاری و موارد رسمی", href: `mailto:${site.email}`, v: site.email },
    { icon: Instagram, t: "اینستاگرام", d: "محتوای روزانه و لایوها", href: site.instagram, v: handle(site.instagram) },
  ].filter((c) => c.href && c.href !== "mailto:");

  return (
    <>
      <PageHeader eyebrow="Contact" title="تماس با ما" desc="برای ثبت سفارش، مشاوره‌ی انتخاب دوره یا هر سوالی، از هر کدام از این راه‌ها که راحت‌تری پیام بده." crumbs={[{ label: "تماس با ما" }]} />

      <section className="container-x -mt-6 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map((c, i) => (
              <Reveal key={c.t} delay={i * 80}>
                <a href={c.href} target="_blank" rel="noreferrer" className="glass glass-hover flex items-center gap-4 rounded-2xl p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-300"><c.icon className="h-5 w-5" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-cream">{c.t}</span>
                    <span className="block truncate text-xs text-gold-400/90" dir="ltr">{c.v}</span>
                    <span className="block text-[11px] text-muted">{c.d}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={350} className="mt-4">
            <div className="rounded-2xl border border-gold-500/12 p-5 text-sm text-muted">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-500" />{site.address}</p>
              <p className="mt-2 flex items-center gap-2"><Clock className="h-4 w-4 text-gold-500" />{site.hours}</p>
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7" delay={150}>
          <ContactForm subjects={subjects} telegram={site.telegram} />
        </Reveal>
      </section>

      {FAQ.length > 0 && (
        <section className="section">
          <div className="container-x max-w-3xl">
            <Reveal className="text-center">
              <span className="eyebrow justify-center">FAQ</span>
              <h2 className="mt-4 text-3xl text-cream">سوالات پرتکرار</h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {FAQ.map((f, i) => (
                <Reveal key={f.q} delay={i * 80}>
                  <details className="accordion">
                    <summary>
                      {f.q}
                      <ChevronDown className="h-4 w-4" />
                    </summary>
                    <div className="px-4 pb-5 text-sm leading-8 text-muted sm:px-5">{f.a}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
