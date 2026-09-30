const ITEMS = ["ماتریکس سرنوشت", "تحلیل دشا", "چارت تولد", "آسترولوژی ودیک", "خودشناسی", "زمان‌بندی زندگی", "ماه تولد", "بازگشت زحل"];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative my-14 overflow-hidden border-y border-gold-500/10 bg-night-900/40 py-4 sm:my-20 sm:py-5 lg:my-24">
      <div className="mask-fade-x flex w-max animate-marquee gap-10 whitespace-nowrap" dir="rtl">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-sm tracking-wide text-cream/60">
            {t}
            <span className="text-gold-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
