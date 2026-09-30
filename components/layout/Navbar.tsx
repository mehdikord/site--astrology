"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X, Sparkles, ChevronLeft, Send, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Instagram from "@/components/ui/InstagramIcon";
import ZodiacWheel from "@/components/ui/ZodiacWheel";
import { nav, site } from "@/data/site";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-night-950/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className={`absolute inset-x-0 bottom-0 divider-gold transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />
        <div className="container-x flex h-16 items-center justify-between sm:h-20">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="منوی اصلی">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                    active ? "text-gold-300" : "text-cream/75 hover:text-cream"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-gold-500 transition-all duration-300 ${
                      active ? "w-5" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/services" className="btn btn-gold btn-sm hidden sm:inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              شروع تحلیل
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group relative grid h-11 w-11 place-items-center rounded-full border border-gold-500/30 bg-night-950/40 text-cream backdrop-blur transition-colors hover:border-gold-500/70 lg:hidden"
              aria-label="باز کردن منو"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className="flex w-5 flex-col items-end gap-[5px]">
                <span className="h-px w-5 rounded-full bg-current transition-all duration-300 group-hover:w-4" />
                <span className="h-px w-3.5 rounded-full bg-gold-400 transition-all duration-300 group-hover:w-5" />
                <span className="h-px w-5 rounded-full bg-current transition-all duration-300 group-hover:w-3" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* منوی کشویی موبایل */}
      <div className={`fixed inset-0 z-[60] overflow-hidden lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} inert={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-night-950/70 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
          className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-hidden border-l border-gold-500/20 bg-night-900/95 shadow-[-30px_0_80px_-20px_rgba(0,0,0,.9)] backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 text-gold-500/[0.08]">
            <ZodiacWheel className="h-full w-full animate-spin-slow" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold-500/50 to-transparent" />

          <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-gold-500/10 px-5 sm:h-20">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:rotate-90 hover:border-gold-500/70 hover:text-gold-300"
              aria-label="بستن منو"
             
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-6" aria-label="منوی موبایل">
            <ul className="flex flex-col gap-1.5">
              {nav.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <li
                    key={item.href}
                    style={{ transitionDelay: open ? `${120 + i * 55}ms` : "0ms" }}
                    className={`transition-all duration-500 ${open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
                  >
                    <Link
                      href={item.href}
                     
                      onClick={() => setOpen(false)}
                      className={`group flex items-center justify-between rounded-2xl border px-5 py-3.5 text-base transition-colors ${
                        active
                          ? "border-gold-500/30 bg-gold-500/10 text-gold-300"
                          : "border-transparent text-cream/80 hover:border-gold-500/15 hover:bg-white/[0.04] hover:text-cream"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? "bg-gold-400" : "bg-gold-500/30 group-hover:bg-gold-500/70"}`} />
                        {item.label}
                      </span>
                      <ChevronLeft className={`h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 ${active ? "text-gold-400" : "text-cream/30"}`} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div
              style={{ transitionDelay: open ? `${120 + nav.length * 55}ms` : "0ms" }}
              className={`mt-6 transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            >
              <Link href="/services" onClick={() => setOpen(false)} className="btn btn-gold w-full py-3.5">
                <Sparkles className="h-4 w-4" />
                شروع تحلیل چارت
              </Link>
            </div>
          </nav>

          <div
            style={{ transitionDelay: open ? `${180 + nav.length * 55}ms` : "0ms" }}
            className={`relative shrink-0 border-t border-gold-500/10 px-5 py-5 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="script text-base text-gold-400/80" dir="ltr">Same soul, higher path</p>
              <div className="flex items-center gap-2">
                {site.instagram && (
                  <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="اینستاگرام" className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:border-gold-500 hover:text-gold-300">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {site.telegram && (
                  <a href={site.telegram} target="_blank" rel="noreferrer" aria-label="تلگرام" className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:border-gold-500 hover:text-gold-300">
                    <Send className="h-4 w-4" />
                  </a>
                )}
                {site.whatsapp && (
                  <a href={site.whatsapp} target="_blank" rel="noreferrer" aria-label="واتس‌اپ" className="grid h-9 w-9 place-items-center rounded-full border border-gold-500/25 text-cream/80 transition hover:border-gold-500 hover:text-gold-300">
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
