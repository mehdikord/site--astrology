import { Quote, Star } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { testimonials } from "@/data/site";

export default function Testimonials() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeader eyebrow="تجربه‌ها" title="آن‌چه دیگران دیده‌اند" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <figure className="glass glass-hover relative h-full rounded-3xl p-7">
                <Quote className="absolute left-6 top-6 h-8 w-8 text-gold-500/20" />
                <div className="flex gap-1 text-gold-400">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 leading-8 text-cream/85">«{t.text}»</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-gold-500/10 pt-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-sm font-extrabold text-night-950">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-cream">{t.name}</span>
                    <span className="block text-xs text-muted">{t.service}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
