import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";
import ServiceIcon from "@/components/ui/ServiceIcon";
import type { Service } from "@/data/services";
import { price } from "@/lib/format";

export default function ServiceCard({ service, showPrice = true }: { service: Service; showPrice?: boolean }) {
  return (
    <TiltCard className="h-full rounded-3xl">
      <Link
        href={`/services/${service.slug}`}
        className="glass glass-hover noise relative flex h-full flex-col overflow-hidden rounded-3xl p-7"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-300 shadow-[0_0_30px_-8px_rgba(212,175,55,.6)] transition-transform duration-500 group-hover:scale-110">
            <ServiceIcon name={service.icon} className="h-7 w-7" />
          </div>
          <span className="script text-sm text-gold-400/70" dir="ltr">{service.titleEn}</span>
        </div>
        <h3 className="mt-6 text-xl font-extrabold text-cream">{service.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-muted">{service.short}</p>
        <div className="mt-6 flex items-center justify-between border-t border-gold-500/10 pt-5">
          {showPrice ? <span className="text-sm font-bold text-gold-300">{price(service.price)}</span> : <span />}
          <span className="inline-flex items-center gap-2 text-sm font-medium text-cream/80 transition-colors group-hover:text-gold-300">
            بیشتر بدان
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
