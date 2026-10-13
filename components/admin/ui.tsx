import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox, Search, X } from "lucide-react";
import { toFa } from "@/lib/format";

/** هدر هر صفحه‌ی پنل: مسیر، عنوان، توضیح و دکمه‌ها */
export function AdminPageHeader({
  title,
  description,
  crumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <nav aria-label="مسیر" className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <Link href="/admins/" className="hover:text-gold-300">پنل مدیریت</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronLeft className="h-3 w-3 opacity-50" />
              {c.href ? <Link href={c.href} className="hover:text-gold-300">{c.label}</Link> : <span className="text-cream/70">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="text-2xl font-extrabold text-cream sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1.5 text-sm leading-7 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.02] text-gold-500/70">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-bold text-cream">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-7 text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** نوار جستجو و فیلتر (فرم GET — بدون نیاز به جاوااسکریپت) */
export function FilterBar({
  q,
  placeholder = "جستجو...",
  children,
  resetHref,
  active,
}: {
  q: string;
  placeholder?: string;
  children?: ReactNode;
  resetHref: string;
  active: boolean;
}) {
  return (
    <form method="get" className="flex flex-col gap-2.5 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:px-6">
      <label className="relative flex-1">
        <span className="sr-only">جستجو</span>
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} placeholder={placeholder} className="adm-input ps-10" />
      </label>
      {children}
      <div className="flex gap-2">
        <button type="submit" className="adm-btn adm-btn-secondary flex-1 sm:flex-none">اعمال</button>
        {active && (
          <Link href={resetHref} className="adm-btn adm-btn-ghost" title="حذف فیلترها">
            <X className="h-4 w-4" />
          </Link>
        )}
      </div>
    </form>
  );
}

export function Pagination({
  page,
  total,
  perPage,
  params,
}: {
  page: number;
  total: number;
  perPage: number;
  params: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const href = (p: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `?${s}` : "?";
  };
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const nums: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-4 text-xs text-muted sm:flex-row sm:px-6">
      <span>
        نمایش {toFa(from)} تا {toFa(to)} از {toFa(total)} مورد
      </span>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <PageLink href={href(page - 1)} disabled={page <= 1} label="قبلی">
            <ChevronRight className="h-4 w-4" />
          </PageLink>
          {nums.map((n, i) =>
            n === "…" ? (
              <span key={`e${i}`} className="px-1.5">…</span>
            ) : (
              <Link
                key={n}
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 transition ${
                  n === page ? "bg-gold-500 font-bold text-night-950" : "text-cream/70 hover:bg-white/[0.05]"
                }`}
              >
                {toFa(n)}
              </Link>
            ),
          )}
          <PageLink href={href(page + 1)} disabled={page >= pages} label="بعدی">
            <ChevronLeft className="h-4 w-4" />
          </PageLink>
        </div>
      )}
    </div>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: ReactNode }) {
  if (disabled) return <span className="grid h-8 w-8 place-items-center rounded-lg opacity-30">{children}</span>;
  return (
    <Link href={href} aria-label={label} className="grid h-8 w-8 place-items-center rounded-lg text-cream/70 hover:bg-white/[0.05]">
      {children}
    </Link>
  );
}
