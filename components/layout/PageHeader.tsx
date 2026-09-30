import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Galaxy from "@/components/ui/Galaxy";
import ZodiacWheel from "@/components/ui/ZodiacWheel";

type Crumb = { label: string; href?: string };

export default function PageHeader({
  eyebrow,
  title,
  desc,
  crumbs = [],
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  crumbs?: Crumb[];
  compact?: boolean;
}) {
  return (
    <section className={`relative overflow-hidden ${compact ? "pb-10 pt-28 sm:pt-32" : "pb-14 pt-28 sm:pb-16 sm:pt-36 lg:pb-24 lg:pt-44"}`}>
      <Galaxy density={0.9} glowIntensity={0.22} twinkleIntensity={0.4} rotationSpeed={0.02} repulsionStrength={1.2} />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[560px] w-[560px] -translate-y-1/2 text-gold-500/[0.12]">
        <ZodiacWheel className="h-full w-full animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night-950 to-transparent" />

      <div className="container-x relative">
        {crumbs.length > 0 && (
          <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted" aria-label="مسیر صفحه">
            <Link href="/" className="hover:text-gold-300">خانه</Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronLeft className="h-3 w-3 text-gold-500/60" />
                {c.href ? <Link href={c.href} className="hover:text-gold-300">{c.label}</Link> : <span className="text-cream/80">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <span className={`eyebrow animate-fade-up ${/[\u0600-\u06FF]/.test(eyebrow) ? "eyebrow-fa" : ""}`}>{eyebrow}</span>}
        <h1 className="mt-4 max-w-3xl text-[2.1rem] leading-[1.25] text-cream animate-fade-up [animation-delay:120ms] sm:text-5xl lg:text-6xl">{title}</h1>
        {desc && <p className="mt-5 max-w-2xl text-base leading-8 text-muted animate-fade-up [animation-delay:240ms] sm:mt-6 sm:text-lg sm:leading-9">{desc}</p>}
      </div>
    </section>
  );
}
