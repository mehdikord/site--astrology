import { Send, Calculator, FileText, Video } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { toFa } from "@/lib/format";

const STEPS = [
  { icon: Send, title: "ثبت سفارش", desc: "تحلیل مورد نظرت را انتخاب می‌کنی و از طریق تلگرام یا واتس‌اپ اطلاعات تولدت را می‌فرستی." },
  { icon: Calculator, title: "محاسبه‌ی چارت", desc: "چارت و نمودارهای تو با دقت و بر اساس زمان و محل تولد محاسبه می‌شود." },
  { icon: FileText, title: "تحلیل اختصاصی", desc: "گزارش مصور PDF به‌صورت اختصاصی برای تو و بر اساس سوال‌هایت نوشته می‌شود." },
  { icon: Video, title: "جلسه‌ی آنلاین", desc: "در یک جلسه‌ی آنلاین نقشه‌ات را با هم مرور می‌کنیم تا هیچ ابهامی باقی نماند." },
];

export default function Process() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeader eyebrow="روند کار" title="از سفارش تا دریافت نقشه‌ات، در چهار قدم" desc="ساده، شفاف و بدون پیچیدگی. تمام مراحل آنلاین انجام می‌شود." />
        <div className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-12 top-12 hidden h-px bg-gradient-to-l from-transparent via-gold-500/40 to-transparent lg:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 120} className="relative">
              <div className="glass rounded-3xl p-7 text-center">
                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold-500/40 bg-night-900 text-gold-300">
                  <span className="absolute inset-0 rounded-full border border-gold-500/30 animate-pulse-ring" style={{ animationDelay: `${i * 0.6}s` }} />
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-5 text-[11px] tracking-[0.3em] text-gold-500/70">قدم {toFa(i + 1)}</div>
                <h3 className="mt-2 text-lg font-extrabold text-cream">{s.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
