import Link from "next/link";
import { Sparkles, GraduationCap, Compass, Send, ArrowLeft } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";

const LINKS = [
  { href: "/services", icon: Sparkles, en: "Analysis", title: "تحلیل می‌خوام", desc: "تحلیل اختصاصی ماتریکس، دشا و چارت تولد؛ نوشته‌شده فقط برای تو." },
  { href: "/courses", icon: GraduationCap, en: "Learning", title: "آموزش می‌خوام", desc: "دوره‌های ساخت‌یافته از مقدماتی تا حرفه‌ای تا خودت زبان آسمان را بخوانی." },
  { href: "/guide", icon: Compass, en: "Guide", title: "راهنمای انتخاب", desc: "نمی‌دانی از کجا شروع کنی؟ این راهنما مسیر مناسب تو را نشان می‌دهد." },
  { href: "/contact", icon: Send, en: "Support", title: "تلگرام و پشتیبانی", desc: "سوالی داری؟ از طریق تلگرام، واتس‌اپ یا فرم تماس با ما در ارتباط باش." },
];

const QUOTE = [
  "دختری که یک روز فکر می‌کرد دیگر چیزی برای ادامه دادن ندارد،",
  "با شناختن خودش، مسیر تازه‌ای برای زندگی‌اش ساخت.",
];

export default function QuickLinks() {
  return (
    <section id="start" className="relative z-20 -mt-36">
      <div className="container-x">
        {/* چهار مسیر ورود */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {LINKS.map((l, i) => (
            <Reveal key={l.href} delay={i * 110} className="h-full">
              <TiltCard className="h-full rounded-3xl">
                <Link href={l.href} className="glass glass-hover noise relative flex h-full flex-col overflow-hidden rounded-3xl p-6 sm:p-7">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-300 shadow-[0_0_30px_-8px_rgba(212,175,55,.6)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <l.icon className="h-7 w-7" />
                    </span>
                    <span className="script text-sm text-gold-400/70" dir="ltr">{l.en}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold text-cream">{l.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted">{l.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-2 border-t border-gold-500/10 pt-5 text-sm font-medium text-cream/80 transition-colors group-hover:text-gold-300">
                    ورود
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* پیام شخصی */}
        <Reveal delay={200} className="mt-16 sm:mt-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-[42rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/[0.07] blur-3xl" />
            <span className="mx-auto flex items-center justify-center gap-4 text-gold-500/70">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/70 sm:w-24" />
              <Sparkles className="h-4 w-4 animate-twinkle" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/70 sm:w-24" />
            </span>
            <h2 className="mt-7 text-2xl leading-[1.5] text-cream sm:text-3xl lg:text-[2.4rem] lg:leading-[1.45]">
              من اینجام تا تو، مسیر <span className="gold-text">خودشناسی</span> خودت رو شروع کنی.
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-9 text-cream/75 sm:text-lg sm:leading-10">
              {QUOTE.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
            <p className="mt-6 text-lg font-medium text-gold-300 sm:text-xl">شاید اینجا، شروع مسیر تازه‌ی تو هم باشد …</p>
            <span className="mx-auto mt-8 block h-10 w-px bg-gradient-to-b from-gold-500/60 to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
