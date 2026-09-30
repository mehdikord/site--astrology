import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Heart, Eye, Sparkles } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Reveal from "@/components/ui/Reveal";
import ZodiacWheel from "@/components/ui/ZodiacWheel";
import CTA from "@/components/home/CTA";
import { site, stats } from "@/data/site";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "داستان فاطمه یوسفی و روش او در تحلیل ماتریکس، دشا و آسترولوژی — نگاهی که چارت را نقشه می‌داند، نه حکم.",
};

const VALUES = [
  { icon: Eye, t: "وضوح به‌جای ابهام", d: "هیچ گزارشی با اصطلاحات مبهم تحویل داده نمی‌شود. هدف این است که بعد از خواندن، بدانی دقیقاً چه کاری بکنی." },
  { icon: Heart, t: "احترام به اختیار", d: "چارت، نقشه است نه سرنوشت محتوم. ما احتمال‌ها و انرژی‌ها را نشان می‌دهیم؛ انتخاب همیشه با توست." },
  { icon: Compass, t: "صداقت حرفه‌ای", d: "اگر تحلیلی به دردت نمی‌خورد یا اطلاعات کافی نداری، همان اول می‌گوییم — حتی اگر یعنی سفارش نگیریم." },
];

const PILLARS = [
  { n: "۰۱", t: "ماتریکس سرنوشت", d: "زبان انرژی‌ها، استعدادها و درس‌های کارمیک؛ پاسخ به سوال «من کی هستم؟»" },
  { n: "۰۲", t: "آسترولوژی ودیک", d: "زمان‌بندی دقیق زندگی با سیستم دشا؛ پاسخ به سوال «الان چه زمانی است؟»" },
  { n: "۰۳", t: "آسترولوژی غربی", d: "لایه‌ی روان‌شناختی چارت تولد؛ پاسخ به سوال «چرا این‌طور احساس می‌کنم؟»" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title={`درباره‌ی ${site.name}`} desc="ستاره‌ها فقط در آسمان نیستند؛ آن‌ها در داستان زندگی تو نیز می‌درخشند." crumbs={[{ label: "درباره ما" }]} />

      <section className="container-x -mt-6 grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[3/4] w-[86%] max-w-md sm:w-full">
            <div className="absolute -inset-4 rounded-t-full rounded-b-[2rem] border border-gold-500/25" />
            <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[1.6rem] shadow-[0_40px_100px_-30px_rgba(212,175,55,.35)]">
              <Image src="/images/about.webp" alt={site.name} fill sizes="(max-width: 1024px) 90vw, 35vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-6 h-32 w-32 text-gold-500/40 sm:-left-10 sm:h-40 sm:w-40">
              <ZodiacWheel className="h-full w-full animate-spin-slow" glyphs={false} />
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-7" delay={150}>
          <span className="eyebrow eyebrow-fa">داستان ما</span>
          <h2 className="mt-4 text-3xl leading-tight text-cream sm:text-4xl">
            از یک سوال شخصی تا یک <span className="gold-text">روش</span>
          </h2>
          <div className="prose-fa mt-6">
            <p>
              مسیر فاطمه یوسفی از یک سوال ساده شروع شد: «چرا با وجود تلاش، بعضی الگوها در زندگی‌ام تکرار می‌شوند؟» جست‌وجو برای این
              پاسخ، به سال‌ها مطالعه‌ی آسترولوژی غربی، جیوتیش (آسترولوژی ودیک) و ماتریکس سرنوشت انجامید — و به این باور که
              هر کدام از این سیستم‌ها یک تکه از پازل را نشان می‌دهند.
            </p>
            <p>
              روش ما همین است: ترکیب آگاهانه‌ی چند سیستم، به‌جای تکیه بر یکی. ماتریکس نشان می‌دهد «چه» انرژی‌هایی
              داری، دشا می‌گوید «کِی» فعال می‌شوند و چارت تولد توضیح می‌دهد «چرا» این‌طور تجربه‌شان می‌کنی. وقتی این سه در
              کنار هم خوانده شوند، تصویری شکل می‌گیرد که به‌تنهایی از هیچ‌کدام درنمی‌آید.
            </p>
            <p>
              امروز بیش از {stats[0].value.replace("+", "")} تحلیل شخصی انجام شده و صدها نفر در دوره‌ها یاد گرفته‌اند که خودشان
              نقشه‌ی آسمانشان را بخوانند. اما هدف همان است که روز اول بود: کمک به آدم‌ها برای این‌که با خودشان صادق‌تر و با
              مسیرشان هم‌سوتر شوند.
            </p>
          </div>
          <div className="mt-8 flex gap-10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-gold-300" dir="ltr">{s.value}</div>
                <div className="mt-1 text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow eyebrow-fa justify-center">روش فاطمه یوسفی</span>
            <h2 className="mt-4 text-3xl text-cream sm:text-4xl">سه ستون، یک تصویر</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 120}>
                <div className="glass glass-hover relative h-full overflow-hidden rounded-3xl p-8">
                  <span className="script absolute left-6 top-4 text-5xl text-gold-500/20">{p.n}</span>
                  <Sparkles className="h-6 w-6 text-gold-400" />
                  <h3 className="mt-5 text-xl font-extrabold text-cream">{p.t}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow eyebrow-fa justify-center">ارزش‌ها</span>
            <h2 className="mt-4 text-3xl text-cream sm:text-4xl">به چه چیزی پایبندیم</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * 120}>
                <div className="flex h-full flex-col items-center rounded-3xl border border-gold-500/12 p-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-300"><v.icon className="h-6 w-6" /></span>
                  <h3 className="mt-5 text-lg font-extrabold text-cream">{v.t}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
