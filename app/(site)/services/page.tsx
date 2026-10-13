import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import ServiceCard from "@/components/cards/ServiceCard";
import Reveal from "@/components/ui/Reveal";
import CTA from "@/components/home/CTA";
import { Check } from "lucide-react";
import { getServices, type ServiceView } from "@/lib/content";
import { price } from "@/lib/format";

export const metadata: Metadata = {
  title: "خدمات",
  description: "تحلیل کامل ماتریکس با زمان تولد، تحلیل دشا و تحلیل آسترولوژی ماه تولد — گزارش اختصاصی و جلسه‌ی آنلاین.",
};

/** ردیف‌های جدول مقایسه — فقط ردیف‌هایی که حداقل برای یک خدمت مقدار دارند نمایش داده می‌شوند */
const COMPARE: { label: string; value: (s: ServiceView) => string }[] = [
  { label: "هزینه", value: (s) => price(s.price) },
  { label: "حجم و مدت", value: (s) => s.duration },
  { label: "نحوه‌ی ارائه", value: (s) => s.format },
  { label: "زمان تحویل", value: (s) => s.delivery },
];

const shortTitle = (t: string) => t.replace("تحلیل ", "").replace("کامل ", "");

export default async function ServicesPage() {
  const services = await getServices();
  const rows = COMPARE.filter((r) => services.some((s) => r.value(s)));
  const cols = { gridTemplateColumns: `minmax(8rem, 0.8fr) repeat(${services.length}, minmax(0, 1fr))` };
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="خدمات تحلیلی"
        desc="مسیرهای مختلف برای خواندن نقشه‌ی آسمانت. هر تحلیل به‌صورت اختصاصی، بر اساس اطلاعات تولد و سوال‌های خودت نوشته می‌شود."
        crumbs={[{ label: "خدمات" }]}
      />

      <section className="container-x -mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.slug} delay={i * 100} className="h-full">
            <ServiceCard service={s} />
          </Reveal>
        ))}
      </section>

      <section className="section">
        <div className="container-x">
          {services.length > 1 && rows.length > 0 && (
            <>
              <Reveal className="hidden md:block">
                <div className="glass overflow-hidden rounded-3xl">
                  <div style={cols} className="grid border-b border-gold-500/15 bg-gold-500/5 text-sm font-bold">
                    <div className="p-4 text-muted lg:p-5">مقایسه</div>
                    {services.map((s) => (
                      <div key={s.slug} className="p-4 text-gold-300 lg:p-5">{shortTitle(s.title)}</div>
                    ))}
                  </div>
                  {rows.map((row) => (
                    <div key={row.label} style={cols} className="grid border-b border-gold-500/10 text-sm last:border-0">
                      <div className="p-4 text-muted lg:p-5">{row.label}</div>
                      {services.map((s) => (
                        <div key={s.slug} className="flex items-center gap-2 p-4 text-cream/85 lg:p-5">
                          {row.value(s) ? <Check className="h-3.5 w-3.5 shrink-0 text-gold-500" /> : null}
                          {row.value(s) || <span className="text-muted">—</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Reveal>

              <div className="grid gap-4 md:hidden">
                {services.map((s, i) => (
                  <Reveal key={s.slug} delay={i * 100}>
                    <div className="glass overflow-hidden rounded-3xl">
                      <div className="flex items-center justify-between gap-3 border-b border-gold-500/15 bg-gold-500/5 px-5 py-4">
                        <h3 className="font-bold text-gold-300">{shortTitle(s.title)}</h3>
                        <span className="script text-sm text-gold-400/70" dir="ltr">{s.titleEn}</span>
                      </div>
                      <dl className="divide-y divide-gold-500/10 px-5">
                        {rows.filter((row) => row.value(s)).map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                            <dt className="shrink-0 text-muted">{row.label}</dt>
                            <dd className="flex items-center gap-2 text-end text-cream/85">
                              <Check className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                              {row.value(s)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <CTA title="نمی‌دانی کدام تحلیل مناسب توست؟" desc="در تلگرام پیام بده؛ با چند سوال کوتاه کمکت می‌کنیم بهترین نقطه‌ی شروع را انتخاب کنی." />
    </>
  );
}
