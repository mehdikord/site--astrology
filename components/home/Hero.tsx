import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronLeft } from "lucide-react";
import Galaxy from "@/components/ui/Galaxy";
import ZodiacWheel from "@/components/ui/ZodiacWheel";
import { stats } from "@/data/site";

const TITLE = ["رازهای", "چارت", "تولد", "تو", "را", "کشف", "کن"];

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* لایه‌ی کهکشان (WebGL) */}
      <Galaxy density={1.1} glowIntensity={0.32} twinkleIntensity={0.45} rotationSpeed={0.03} repulsionStrength={1.6} focal={[0.35, 0.5]} />

      {/* تصویر هیرو — سمت راست */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[64%]">
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 64vw"
          className="object-cover object-[72%_center] opacity-45 lg:opacity-100"
        />
        {/* محو شدن به سمت متن و پایین */}
        <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/60 to-night-950/20 lg:via-night-950/10 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-night-950 via-night-950/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night-950/80 to-transparent" />
      </div>

      {/* محو شدن پایین هیرو (تمام عرض) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-72 bg-gradient-to-t from-night-950 via-night-950/70 to-transparent" />

      {/* چرخ زودیاک تزئینی */}
      <div className="pointer-events-none absolute -bottom-52 -left-52 h-[640px] w-[640px] text-gold-500/15">
        <ZodiacWheel className="h-full w-full animate-spin-slow" />
      </div>

      {/* متن عمودی چپ */}
      <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-6 xl:flex">
        <span className="h-16 w-px bg-gradient-to-b from-transparent to-gold-500/60" />
        <span className="vertical-text rotate-180 text-[10px] tracking-[0.5em] text-gold-500/70">YOU ARE A UNIVERSE TOO</span>
        <span className="h-16 w-px bg-gradient-to-b from-gold-500/60 to-transparent" />
      </div>

      {/* متن اسکریپت روی تصویر */}
      <div className="pointer-events-none absolute right-8 top-32 hidden -rotate-6 lg:block xl:right-16">
        <span className="script text-3xl text-gold-300/80 drop-shadow-[0_0_20px_rgba(212,175,55,.5)] xl:text-4xl" dir="ltr">
          A More Aligned You
        </span>
      </div>
      <div className="pointer-events-none absolute right-8 top-[46%] hidden max-w-[10rem] text-end text-xs leading-7 text-cream/60 lg:block xl:right-16">
        ستاره‌ها همیشه صحبت می‌کنند…
        <br />
        <span className="text-gold-300/80">آیا تو گوش می‌کنی؟</span>
      </div>

      {/* محتوا */}
      <div className="container-x relative z-10 grid min-h-[100svh] items-center pb-44 pt-32 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-7 lg:col-start-6 xl:col-span-6 xl:col-start-7">
          <span className="eyebrow animate-fade-up">Align with your true path</span>

          <h1 className="mt-6 text-[2.6rem] leading-[1.15] text-cream sm:text-6xl lg:text-[4.2rem] xl:text-[4.8rem]">
            {TITLE.map((w, i) => (
              <span key={i} className="inline-block animate-blur-in" style={{ animationDelay: `${150 + i * 90}ms` }}>
                {i >= 5 ? <span className="gold-text">{w}</span> : w}
                {i < TITLE.length - 1 && "\u00A0"}
              </span>
            ))}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-base font-medium text-cream/85 animate-fade-up [animation-delay:800ms] sm:text-lg">
            <span>تحلیل ماتریکس</span>
            <span className="h-4 w-px bg-gold-500/60" />
            <span>دشا</span>
            <span className="h-4 w-px bg-gold-500/60" />
            <span>آسترولوژی ماه تولد</span>
          </div>

          <p className="mt-6 max-w-lg leading-8 text-muted animate-fade-up [animation-delay:950ms]">
            در جهانی که همه‌چیز در تغییر است، چارت تولد تو نقشه‌ای است برای شناخت عمیق‌تر خودت و ساختن مسیری آگاهانه‌تر.
            نقشه‌ات را بخوان؛ آسمان از لحظه‌ی تولد با تو حرف می‌زند.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up [animation-delay:1100ms]">
            <Link href="/services/matrix" className="btn btn-gold px-8 py-3.5 text-base">
              <Sparkles className="h-4 w-4" />
              شروع تحلیل چارت
            </Link>
            <span className="star-border">
              <Link href="/services" className="btn btn-ghost px-7 py-3.5 text-base">
                مشاهده خدمات
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </span>
          </div>

          <div className="mt-12 flex items-center gap-8 animate-fade-up [animation-delay:1250ms] sm:gap-12">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-gold-300 sm:text-3xl" dir="ltr">{s.value}</div>
                <div className="mt-1 text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
