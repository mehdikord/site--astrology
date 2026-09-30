import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/data/site";

export default function AboutTeaser() {
  return (
    <section className="section">
      <div className="container-x grid items-center gap-16 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <span className="eyebrow eyebrow-fa">درباره‌ی {site.name}</span>
          <h2 className="mt-4 text-3xl leading-tight text-cream sm:text-4xl lg:text-5xl">
            نجوم، پلی به سوی <span className="gold-text">آگاهی عمیق‌تر</span>
          </h2>
          <p className="mt-6 leading-9 text-muted">
            فاطمه یوسفی همراه توست در مسیر درک عمیق‌تر خود، روابط و زندگی از طریق دانش آسترولوژی و ماتریکس سرنوشت. اینجا ستاره‌ها
            فقط در آسمان نیستند؛ آن‌ها در داستان زندگی تو نیز می‌درخشند. ما باور داریم چارت تولد یک حکم نیست، یک نقشه است —
            و هر نقشه‌ای وقتی ارزش دارد که کسی بلد باشد آن را بخواند.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-5">
            {[
              { t: "تحلیل اختصاصی", d: "هیچ متن آماده‌ای؛ هر گزارش برای یک نفر نوشته می‌شود." },
              { t: "ترکیب چند سیستم", d: "ماتریکس، آسترولوژی غربی و ودیک در کنار هم." },
              { t: "زبان ساده", d: "بدون اصطلاحات پیچیده؛ قابل استفاده در زندگی واقعی." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-gold-500/15 bg-white/[0.02] p-4">
                <div className="text-sm font-bold text-gold-300">{f.t}</div>
                <div className="mt-2 text-xs leading-6 text-muted">{f.d}</div>
              </div>
            ))}
          </div>
          <Link href="/about" className="btn btn-ghost mt-8">
            بیشتر درباره‌ی من
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal className="relative lg:col-span-5" delay={150}>
          <div className="relative mx-auto aspect-[3/4] w-[82%] max-w-sm sm:w-full">
            <div className="absolute -inset-3 rounded-t-full rounded-b-[2rem] border border-gold-500/30" />
            <div className="absolute -inset-6 rounded-t-full rounded-b-[2.5rem] border border-gold-500/10" />
            <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[1.6rem] shadow-[0_40px_100px_-30px_rgba(212,175,55,.35)]">
              <Image src="/images/about.webp" alt={site.name} fill sizes="(max-width: 1024px) 90vw, 30vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-5 rounded-2xl border border-gold-500/30 bg-night-900/90 px-4 py-3 backdrop-blur sm:-right-6 sm:px-5 sm:py-4">
              <div className="script text-lg text-gold-300" dir="ltr">Astrology is</div>
              <div className="script text-lg text-gold-300" dir="ltr">a language of the soul</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
