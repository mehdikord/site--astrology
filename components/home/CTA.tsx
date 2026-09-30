import Link from "next/link";
import { Sparkles, Send } from "lucide-react";
import Galaxy from "@/components/ui/Galaxy";
import ZodiacWheel from "@/components/ui/ZodiacWheel";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/data/site";

export default function CTA({
  title = "آماده‌ای نقشه‌ی آسمانت را بخوانی؟",
  desc = "همین امروز تحلیل خودت را سفارش بده و در چند روز آینده، تصویری روشن از مسیرت در دست داشته باش.",
}: {
  title?: string;
  desc?: string;
}) {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold-500/25 bg-night-900/60 px-6 py-20 text-center sm:px-12">
            <Galaxy density={0.8} glowIntensity={0.3} twinkleIntensity={0.5} rotationSpeed={0.04} mouseInteraction={false} />
            <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] text-gold-500/15">
              <ZodiacWheel className="h-full w-full animate-spin-slow" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_100%,rgba(212,175,55,0.14),transparent)]" />
            <div className="relative">
              <span className="script text-2xl text-gold-400/80" dir="ltr">Same soul, higher path</span>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl leading-tight text-cream sm:text-4xl lg:text-5xl">{title}</h2>
              <p className="mx-auto mt-5 max-w-xl leading-8 text-muted">{desc}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/services" className="btn btn-gold px-8 py-3.5 text-base">
                  <Sparkles className="h-4 w-4" />
                  انتخاب تحلیل
                </Link>
                <a href={site.telegram} target="_blank" rel="noreferrer" className="btn btn-ghost px-7 py-3.5 text-base">
                  <Send className="h-4 w-4" />
                  گفتگو در تلگرام
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
