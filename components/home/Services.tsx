import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ServiceCard from "@/components/cards/ServiceCard";
import { services } from "@/data/services";

export default function Services() {
  return (
    <section id="services" className="relative z-20 -mt-36">
      <div className="container-x">
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 120} className="h-full">
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 text-center" delay={300}>
          <Link href="/services" className="text-sm text-muted transition hover:text-gold-300">
            مشاهده‌ی جزئیات همه‌ی خدمات ←
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
