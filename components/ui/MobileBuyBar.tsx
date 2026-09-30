import type { ReactNode } from "react";

/** نوار ثابت خرید در پایین صفحه — فقط موبایل و تبلت */
export default function MobileBuyBar({
  label,
  price,
  oldPrice,
  href,
  children,
}: {
  label: string;
  price: string;
  oldPrice?: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <div
      data-mobile-buy-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/20 bg-night-950/85 pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_50px_-20px_rgba(0,0,0,.9)] backdrop-blur-xl animate-fade-up [animation-delay:600ms] lg:hidden"
    >
      <div className="divider-gold absolute inset-x-0 top-0" />
      <div className="container-x flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <div className="text-[11px] text-muted">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="truncate text-base font-extrabold text-gold-300">{price}</span>
            {oldPrice && <span className="truncate text-[11px] text-muted line-through">{oldPrice}</span>}
          </div>
        </div>
        <a href={href} target="_blank" rel="noreferrer" className="btn btn-gold shrink-0 px-6">
          {children}
        </a>
      </div>
    </div>
  );
}
