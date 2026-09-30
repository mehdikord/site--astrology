import type { ServiceIcon as IconName } from "@/data/services";

/** آیکن‌های اختصاصی خدمات */
export default function ServiceIcon({ name, className = "h-7 w-7" }: { name: IconName; className?: string }) {
  if (name === "matrix") {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <rect x="10" y="10" width="28" height="28" rx="1" />
        <rect x="10" y="10" width="28" height="28" rx="1" transform="rotate(45 24 24)" />
        <circle cx="24" cy="24" r="4" />
        <circle cx="24" cy="4.2" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="24" cy="43.8" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="4.2" cy="24" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="43.8" cy="24" r="2.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "dasha") {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
        <circle cx="24" cy="24" r="6" />
        <ellipse cx="24" cy="24" rx="20" ry="8" />
        <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-60 24 24)" />
        <circle cx="42" cy="16" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="8" cy="34" r="1.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M30 6a18 18 0 1 0 12 30A15 15 0 1 1 30 6z" />
      <path d="M36 12l1.2 3.3 3.3 1.2-3.3 1.2L36 21l-1.2-3.3-3.3-1.2 3.3-1.2z" fill="currentColor" stroke="none" />
      <circle cx="42" cy="26" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
