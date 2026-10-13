import Link from "next/link";

/** gradientId: وقتی چند لوگو در صفحه است (و یکی پنهان)، شناسه‌ی گرادیان باید یکتا باشد */
export function LogoMark({ className = "h-11 w-11", gradientId = "lg" }: { className?: string; gradientId?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e3a1" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#b08d2b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" stroke={`url(#${gradientId})`} strokeWidth="1" opacity="0.7" />
      <circle cx="32" cy="32" r="25" stroke={`url(#${gradientId})`} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.7" />
      <path d="M36 14a18 18 0 1 0 12 30 15 15 0 1 1-12-30z" fill={`url(#${gradientId})`} />
      <path d="M43 22l1.6 4.4L49 28l-4.4 1.6L43 34l-1.6-4.4L37 28l4.4-1.6z" fill="#fbeec1" />
    </svg>
  );
}

export default function Logo({ name, nameEn, compact = false }: { name: string; nameEn: string; compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={name}>
      <LogoMark className="h-11 w-11 transition-transform duration-500 group-hover:rotate-12" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold text-cream">{name}</span>
          <span className="mt-1 text-[9px] font-medium tracking-[0.4em] text-gold-500/80">{nameEn}</span>
        </span>
      )}
    </Link>
  );
}
