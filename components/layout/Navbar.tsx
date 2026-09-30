"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { nav } from "@/data/site";

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
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-night-950/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className={`absolute inset-x-0 bottom-0 divider-gold transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />
      <div className="container-x flex h-20 items-center justify-between">
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
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-gold-500/25 text-cream lg:hidden"
            aria-label="باز کردن منو"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={`fixed inset-0 top-20 z-40 bg-night-950/95 backdrop-blur-2xl transition-all duration-500 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="container-x flex flex-col gap-1 pt-6" aria-label="منوی موبایل">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={`rounded-2xl border border-transparent px-5 py-4 text-lg transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              } ${isActive(item.href) ? "border-gold-500/25 bg-gold-500/10 text-gold-300" : "text-cream/80 hover:bg-white/5"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/services" className="btn btn-gold mt-6 w-full">
            <Sparkles className="h-4 w-4" />
            شروع تحلیل چارت
          </Link>
        </nav>
      </div>
    </header>
  );
}
