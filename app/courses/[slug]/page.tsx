import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ChevronDown, Clock, Layers, MonitorPlay, Signal, ShoppingBag, Send, PlayCircle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Reveal from "@/components/ui/Reveal";
import CourseCard from "@/components/cards/CourseCard";
import { courses, getCourse } from "@/data/courses";
import { orderLink, site } from "@/data/site";
import { price, toFa, discount } from "@/lib/format";

type Params = { slug: string };

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c) return {};
  return { title: c.title, description: c.short, openGraph: { images: [{ url: c.image }] } };
}

export default async function CoursePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c) notFound();
  const others = courses.filter((x) => x.slug !== c.slug).slice(0, 3);
  const lessonCount = c.curriculum.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <>
      <PageHeader eyebrow={c.subtitle} title={c.title} desc={c.short} crumbs={[{ label: "دوره‌ها", href: "/courses" }, { label: c.title }]} compact />

      <div className="container-x grid gap-10 pb-10 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <Reveal>
            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-gold-500/20">
              <Image src={c.image} alt={c.title} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 to-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-gold-500/50 bg-night-950/50 text-gold-300 backdrop-blur transition hover:scale-105">
                  <PlayCircle className="h-9 w-9" />
                </span>
              </div>
              <div className="absolute bottom-5 right-5 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-gold-500/30 bg-night-950/70 px-3 py-1 text-gold-300 backdrop-blur">{c.level}</span>
                <span className="rounded-full border border-gold-500/30 bg-night-950/70 px-3 py-1 text-cream/85 backdrop-blur">{toFa(c.hours)} ساعت</span>
                <span className="rounded-full border border-gold-500/30 bg-night-950/70 px-3 py-1 text-cream/85 backdrop-blur">{toFa(lessonCount)} درس</span>
              </div>
            </div>
          </Reveal>

          <Reveal className="prose-fa mt-10">
            {c.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">در این دوره چه یاد می‌گیری؟</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {c.learn.map((l) => (
                <li key={l} className="flex items-start gap-3 rounded-2xl border border-gold-500/12 bg-white/[0.02] p-4 text-sm leading-7 text-cream/85">
                  <span className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-300"><Check className="h-3 w-3" /></span>
                  {l}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">سرفصل‌ها</h2>
            <div className="mt-6 space-y-3">
              {c.curriculum.map((m, i) => (
                <details key={m.title} className="accordion" open={i === 0}>
                  <summary>
                    <span className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-500/10 text-xs text-gold-300">{toFa(i + 1)}</span>
                      {m.title}
                    </span>
                    <span className="flex items-center gap-3 text-xs font-normal text-muted">
                      {toFa(m.lessons.length)} درس
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>
                  <ul className="space-y-2 px-5 pb-5">
                    {m.lessons.map((l) => (
                      <li key={l} className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-2.5 text-sm text-cream/80">
                        <PlayCircle className="h-4 w-4 shrink-0 text-gold-500/70" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="text-2xl text-cream">مناسب چه کسانی است؟</h2>
            <ul className="mt-6 space-y-3">
              {c.forWho.map((f) => (
                <li key={f} className="flex items-start gap-3 leading-8 text-cream/85">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </article>

        <aside className="lg:col-span-4">
          <Reveal delay={150} className="lg:sticky lg:top-28">
            <div className="glass relative overflow-hidden rounded-3xl p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/15 blur-3xl" />
              {c.badge && <span className="mb-3 inline-block rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-night-950">{c.badge}</span>}
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-extrabold text-gold-300">{price(c.price)}</div>
                {c.oldPrice && <div className="text-sm text-muted line-through">{price(c.oldPrice)}</div>}
              </div>
              {c.oldPrice && <div className="mt-1 text-xs text-gold-400">{discount(c.oldPrice, c.price)} تخفیف ویژه</div>}

              <ul className="mt-6 space-y-3 text-sm text-cream/85">
                <li className="flex items-center gap-3"><Signal className="h-4 w-4 text-gold-500" />سطح: {c.level}</li>
                <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-gold-500" />{toFa(c.hours)} ساعت آموزش</li>
                <li className="flex items-center gap-3"><Layers className="h-4 w-4 text-gold-500" />{toFa(c.sessions)} جلسه</li>
                <li className="flex items-center gap-3"><MonitorPlay className="h-4 w-4 text-gold-500" />{c.format}</li>
              </ul>

              <a href={orderLink(`دوره‌ی ${c.title}`)} target="_blank" rel="noreferrer" className="btn btn-gold mt-7 w-full py-3.5">
                <ShoppingBag className="h-4 w-4" />
                ثبت‌نام در دوره
              </a>
              <a href={site.telegram} target="_blank" rel="noreferrer" className="btn btn-ghost mt-3 w-full">
                <Send className="h-4 w-4" />
                مشاوره قبل از خرید
              </a>

              <div className="mt-7 border-t border-gold-500/10 pt-6">
                <div className="mb-3 text-xs tracking-widest text-muted">این دوره شامل</div>
                <ul className="space-y-2.5 text-sm">
                  {c.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-2.5 text-cream/80">
                      <Check className="mt-1.5 h-3.5 w-3.5 shrink-0 text-gold-500" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </aside>
      </div>

      <section className="section">
        <div className="container-x">
          <h2 className="text-2xl text-cream">دوره‌های دیگر</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 100} className="h-full">
                <CourseCard course={o} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
