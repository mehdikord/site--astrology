import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronDown, Clock, FileText, Truck, Sparkles, Send } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ServiceIcon from "@/components/ui/ServiceIcon";
import ServiceCard from "@/components/cards/ServiceCard";
import MobileBuyBar from "@/components/ui/MobileBuyBar";
import { services, getService } from "@/data/services";
import { orderLink, site } from "@/data/site";
import { price, toFa } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return { title: s.title, description: s.short, openGraph: { images: [{ url: s.image }] } };
}

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const others = services.filter((x) => x.slug !== s.slug);

  return (
    <>
      <PageHeader eyebrow={s.titleEn} title={s.title} desc={s.tagline} crumbs={[{ label: "خدمات", href: "/services" }, { label: s.title }]} compact />

      <div className="container-x grid gap-10 pb-10 lg:grid-cols-12">
        {/* محتوا */}
        <article className="lg:col-span-8">
          <Reveal>
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-gold-500/20 sm:aspect-[16/8]">
              <Image src={s.image} alt={s.title} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 to-transparent" />
              <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-2xl sm:bottom-6 sm:right-6 sm:h-16 sm:w-16 border border-gold-500/40 bg-night-950/70 text-gold-300 backdrop-blur">
                <ServiceIcon name={s.icon} className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
          </Reveal>

          <Reveal className="prose-fa mt-10">
            {s.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">این تحلیل برای چه کسانی است؟</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {s.forWho.map((f) => (
                <li key={f} className="flex items-start gap-3 rounded-2xl border border-gold-500/12 bg-white/[0.02] p-4 text-sm leading-7 text-cream/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">چه چیزی دریافت می‌کنی؟</h2>
            <ul className="mt-6 space-y-3">
              {s.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 text-cream/85 leading-8">
                  <span className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">روند کار</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.steps.map((st, i) => (
                <li key={st.title} className="glass relative rounded-2xl p-5">
                  <span className="script absolute left-5 top-3 text-3xl text-gold-500/30">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-bold text-gold-300">{st.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{st.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">اطلاعات مورد نیاز</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {s.needs.map((n) => (
                <span key={n} className="rounded-full border border-gold-500/25 bg-gold-500/5 px-4 py-2 text-sm text-cream/85">{n}</span>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">سوالات متداول</h2>
            <div className="mt-6 space-y-3">
              {s.faq.map((f) => (
                <details key={f.q} className="accordion">
                  <summary>
                    {f.q}
                    <ChevronDown className="h-4 w-4" />
                  </summary>
                  <div className="px-4 pb-5 text-sm leading-8 text-muted sm:px-5">{f.a}</div>
                </details>
              ))}
            </div>
          </Reveal>
        </article>

        {/* سایدبار سفارش */}
        <aside className="lg:col-span-4">
          <Reveal delay={150} className="lg:sticky lg:top-28">
            <div className="glass relative overflow-hidden rounded-3xl p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/15 blur-3xl" />
              <div className="text-xs tracking-widest text-muted">هزینه‌ی تحلیل</div>
              <div className="mt-2 text-3xl font-extrabold text-gold-300">{price(s.price)}</div>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3"><FileText className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><span className="text-cream/85">{s.duration}</span></li>
                <li className="flex items-start gap-3"><Clock className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><span className="text-cream/85">{s.format}</span></li>
                <li className="flex items-start gap-3"><Truck className="mt-1 h-4 w-4 shrink-0 text-gold-500" /><span className="text-cream/85">تحویل: {s.delivery}</span></li>
              </ul>
              <a href={orderLink(s.title)} target="_blank" rel="noreferrer" className="btn btn-gold mt-7 w-full py-3.5">
                <Sparkles className="h-4 w-4" />
                ثبت سفارش
              </a>
              <a href={site.whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost mt-3 w-full">
                <Send className="h-4 w-4" />
                سوال دارم
              </a>
              <p className="mt-5 text-center text-[11px] leading-6 text-muted">
                پس از ثبت سفارش، اطلاعات تولد را ارسال می‌کنی و پس از تایید پرداخت، تحلیل آغاز می‌شود.
              </p>
            </div>
          </Reveal>
        </aside>
      </div>

      <section className="section">
        <div className="container-x">
          <h2 className="text-2xl text-cream">تحلیل‌های دیگر</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 100} className="h-full">
                <ServiceCard service={o} />
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            <Link href="/services" className="text-gold-400 hover:text-gold-300">مشاهده‌ی همه‌ی خدمات</Link> · {toFa(services.length)} تحلیل تخصصی
          </p>
        </div>
      </section>

      <MobileBuyBar label="هزینه‌ی تحلیل" price={price(s.price)} href={orderLink(s.title)}>
        <Sparkles className="h-4 w-4" />
        ثبت سفارش
      </MobileBuyBar>
    </>
  );
}
