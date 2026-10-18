"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ExternalLink, LogOut, Menu, X, ChevronDown, UserCog } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { adminNav } from "@/components/admin/nav";
import { logoutAction } from "@/app/admins/actions";

type Admin = { name: string; email: string; mobile: string };

const normalize = (p: string) => (p.endsWith("/") ? p : p + "/");

export type NavBadges = Record<"requests" | "orders" | "messages", number>;

function Sidebar({ onNavigate, logoId, badges }: { onNavigate?: () => void; logoId: string; badges: NavBadges }) {
  const pathname = normalize(usePathname());
  const isActive = (href: string) => (href === "/admins/" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      <Link href="/admins/" onClick={onNavigate} className="flex items-center gap-3 px-6 pb-6 pt-7">
        <LogoMark className="h-10 w-10" gradientId={logoId} />
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold text-cream">پنل مدیریت</span>
          <span className="block text-[10px] tracking-[0.3em] text-gold-500/70">KAZHAL METHOD</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {adminNav.map((group, gi) => (
          <div key={gi}>
            {group.title && <div className="mb-2 px-3 text-[11px] font-medium text-muted/70">{group.title}</div>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const count = item.badge ? badges[item.badge] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        active
                          ? "bg-gradient-to-l from-gold-500/[0.16] to-gold-500/[0.03] font-bold text-gold-200"
                          : "text-cream/70 hover:bg-white/[0.04] hover:text-cream"
                      }`}
                    >
                      {active && <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-gold-400" />}
                      <item.icon className={`h-[18px] w-[18px] ${active ? "text-gold-400" : "text-cream/50 group-hover:text-cream/80"}`} />
                      <span className="flex-1">{item.label}</span>
                      {count > 0 && (
                        <span className="min-w-5 rounded-full bg-gold-500 px-1.5 text-center text-[11px] font-bold leading-5 text-night-950">
                          {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

    </div>
  );
}

function UserMenu({ admin }: { admin: Admin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2.5 rounded-xl py-1.5 pe-2 ps-1.5 transition hover:bg-white/[0.04]"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-sm font-extrabold text-night-950">
          {admin.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-start leading-tight sm:block">
          <span className="block text-sm font-bold text-cream">{admin.name}</span>
          <span className="block text-[11px] text-muted">مدیر سایت</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-night-800/95 shadow-2xl backdrop-blur-xl [animation:adm-dialog-in_.15s_ease-out]">
          <div className="border-b border-white/[0.06] px-4 py-3.5">
            <div className="text-sm font-bold text-cream">{admin.name}</div>
            <div className="mt-0.5 truncate text-xs text-muted" dir="ltr">{admin.email}</div>
          </div>
          <div className="p-1.5">
            <Link href="/admins/profile/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-cream/80 hover:bg-white/[0.05]">
              <UserCog className="h-4 w-4" />
              پروفایل و گذرواژه
            </Link>
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-cream/80 hover:bg-white/[0.05]">
              <ExternalLink className="h-4 w-4" />
              مشاهده‌ی سایت
            </a>
            <form action={logoutAction}>
              <button type="submit" className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10">
                <LogOut className="h-4 w-4" />
                خروج از حساب
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminShell({ admin, badges, children }: { admin: Admin; badges: NavBadges; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [drawer]);

  return (
    <div className="min-h-screen bg-night-950">
      {/* پس‌زمینه */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 start-1/3 h-[480px] w-[480px] rounded-full bg-gold-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 end-0 h-[380px] w-[380px] rounded-full bg-indigo-500/[0.05] blur-[120px]" />
      </div>

      {/* سایدبار دسکتاپ */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-72 border-e border-white/[0.06] bg-night-900/70 backdrop-blur-xl lg:block">
        <Sidebar logoId="adm-logo-desktop" badges={badges} />
      </aside>

      {/* سایدبار موبایل */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 start-0 w-[min(18rem,85vw)] border-e border-white/[0.08] bg-night-900 shadow-2xl">
            <button type="button" onClick={() => setDrawer(false)} className="adm-icon-btn absolute end-3 top-3" aria-label="بستن منو">
              <X className="h-5 w-5" />
            </button>
            <Sidebar logoId="adm-logo-drawer" badges={badges} onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="relative lg:ps-72">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-night-950/75 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setDrawer(true)} className="adm-icon-btn h-10 w-10 lg:hidden" aria-label="باز کردن منو">
                <Menu className="h-5 w-5" />
              </button>
              <a href="/" target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm hidden sm:inline-flex">
                <ExternalLink className="h-3.5 w-3.5" />
                مشاهده‌ی سایت
              </a>
            </div>
            <UserMenu admin={admin} />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
